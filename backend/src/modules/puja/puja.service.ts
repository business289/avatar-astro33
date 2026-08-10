import prisma from "@root/prisma.js";
import { ApiError } from "@/utils/ApiError.js";
import STATUS_CODES from "@/utils/statusCodes.js";
import {
  deleteImageByPublicId,
  uploadImageBuffer,
} from "@/config/cloudinary.js";
import type {
  CreateTempleInput,
  ListTemplesInput,
  PublicTempleDTO,
  PujaDTO,
  PujaInput,
  TempleDTO,
  TempleImageDTO,
  TempleListResult,
  UpdatePujaInput,
  UpdateTempleInput,
  UploadFile,
} from "./puja.types.js";

const CLOUDINARY_ROOT_FOLDER = "puja/temples";

const templeInclude = {
  images: { orderBy: { createdAt: "asc" } },
  pujas: { orderBy: { createdAt: "asc" } },
} as const;

class PujaService {
  // ── Temples ───────────────────────────────────────────────────────────────

  async listTemples({
    search,
    page,
    limit,
  }: ListTemplesInput): Promise<TempleListResult> {
    const term = search?.trim();

    // Searching in the database (not over an already-loaded page) so results
    // stay correct once the temple count outgrows a single page.
    const where = term
      ? {
          OR: [
            { name: { contains: term, mode: "insensitive" as const } },
            { location: { contains: term, mode: "insensitive" as const } },
            { state: { contains: term, mode: "insensitive" as const } },
            { deity: { contains: term, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [rows, total] = await Promise.all([
      prisma.temple.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          images: { orderBy: { createdAt: "asc" }, take: 1 },
          _count: { select: { images: true, pujas: true } },
        },
      }),
      prisma.temple.count({ where }),
    ]);

    return {
      items: rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        name: row.name,
        location: row.location,
        state: row.state,
        deity: row.deity,
        description: row.description,
        priceFrom: row.priceFrom,
        gradient: row.gradient,
        coverImage: row.images[0]
          ? this.toImageDTO(row.images[0])
          : null,
        imageCount: row._count.images,
        pujaCount: row._count.pujas,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async getTempleById(id: string): Promise<TempleDTO> {
    const temple = await prisma.temple.findUnique({
      where: { id },
      include: templeInclude,
    });

    if (!temple) {
      throw new ApiError("Temple not found", STATUS_CODES.NOT_FOUND);
    }

    return this.toTempleDTO(temple);
  }

  async createTemple(input: CreateTempleInput): Promise<TempleDTO> {
    await this.assertSlugAvailable(input.slug);

    const temple = await prisma.temple.create({
      data: {
        name: input.name,
        slug: input.slug,
        location: input.location,
        state: input.state,
        deity: input.deity,
        description: input.description,
        priceFrom: input.priceFrom,
        gradient: input.gradient || null,
      },
      include: templeInclude,
    });

    return this.toTempleDTO(temple);
  }

  async updateTemple(
    id: string,
    input: UpdateTempleInput,
  ): Promise<TempleDTO> {
    const existing = await prisma.temple.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Temple not found", STATUS_CODES.NOT_FOUND);
    }

    if (input.slug && input.slug !== existing.slug) {
      await this.assertSlugAvailable(input.slug);
    }

    const temple = await prisma.temple.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.location !== undefined && { location: input.location }),
        ...(input.state !== undefined && { state: input.state }),
        ...(input.deity !== undefined && { deity: input.deity }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
        ...(input.priceFrom !== undefined && { priceFrom: input.priceFrom }),
        ...(input.gradient !== undefined && {
          gradient: input.gradient || null,
        }),
      },
      include: templeInclude,
    });

    return this.toTempleDTO(temple);
  }

  /**
   * Removes the temple and every Cloudinary asset it owns. Pujas and image
   * rows go with it through the schema's cascading deletes, but Cloudinary
   * has no such cascade — the assets must be destroyed explicitly.
   */
  async deleteTemple(
    id: string,
  ): Promise<{ deletedImages: number; orphanedImages: string[] }> {
    const temple = await prisma.temple.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!temple) {
      throw new ApiError("Temple not found", STATUS_CODES.NOT_FOUND);
    }

    const orphanedImages: string[] = [];
    let deletedImages = 0;

    for (const image of temple.images) {
      try {
        const removed = await deleteImageByPublicId(image.publicId);
        if (removed) deletedImages += 1;
        else orphanedImages.push(image.publicId);
      } catch {
        // A Cloudinary failure must not strand the temple record itself; the
        // public IDs are reported back so the leftovers can be cleaned up.
        orphanedImages.push(image.publicId);
      }
    }

    await prisma.temple.delete({ where: { id } });

    return { deletedImages, orphanedImages };
  }

  // ── Images ────────────────────────────────────────────────────────────────

  async addTempleImages(
    templeId: string,
    files: UploadFile[],
  ): Promise<TempleImageDTO[]> {
    if (!files.length) {
      throw new ApiError(
        "Select at least one image to upload",
        STATUS_CODES.BAD_REQUEST,
      );
    }

    const temple = await prisma.temple.findUnique({
      where: { id: templeId },
      select: { id: true, slug: true },
    });

    if (!temple) {
      throw new ApiError("Temple not found", STATUS_CODES.NOT_FOUND);
    }

    const folder = `${CLOUDINARY_ROOT_FOLDER}/${temple.slug}`;
    const uploaded: { url: string; publicId: string }[] = [];

    try {
      for (const file of files) {
        uploaded.push(await uploadImageBuffer(file.buffer, folder));
      }
    } catch (error) {
      // Partial batch: roll the successful uploads back so Cloudinary does not
      // accumulate assets that no database row will ever reference.
      await Promise.all(
        uploaded.map((asset) =>
          deleteImageByPublicId(asset.publicId).catch(() => false),
        ),
      );
      throw error;
    }

    await prisma.templeImage.createMany({
      data: uploaded.map((asset) => ({
        templeId,
        url: asset.url,
        publicId: asset.publicId,
      })),
    });

    const rows = await prisma.templeImage.findMany({
      where: { publicId: { in: uploaded.map((a) => a.publicId) } },
      orderBy: { createdAt: "asc" },
    });

    return rows.map((row) => this.toImageDTO(row));
  }

  /**
   * Deletes from Cloudinary first: if the remote delete fails the row stays,
   * so the admin can retry rather than leaving an unreferenced remote asset.
   */
  async deleteTempleImage(imageId: string): Promise<void> {
    const image = await prisma.templeImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new ApiError("Image not found", STATUS_CODES.NOT_FOUND);
    }

    const removed = await deleteImageByPublicId(image.publicId);
    if (!removed) {
      throw new ApiError(
        "Could not remove the image from Cloudinary. Please try again.",
        STATUS_CODES.BAD_REQUEST,
      );
    }

    await prisma.templeImage.delete({ where: { id: imageId } });
  }

  // ── Pujas ─────────────────────────────────────────────────────────────────

  async listPujas(templeId: string): Promise<PujaDTO[]> {
    const temple = await prisma.temple.findUnique({
      where: { id: templeId },
      select: { id: true },
    });

    if (!temple) {
      throw new ApiError("Temple not found", STATUS_CODES.NOT_FOUND);
    }

    const pujas = await prisma.puja.findMany({
      where: { templeId },
      orderBy: { createdAt: "asc" },
    });

    return pujas.map((puja) => this.toPujaDTO(puja));
  }

  async createPuja(templeId: string, input: PujaInput): Promise<PujaDTO> {
    const temple = await prisma.temple.findUnique({
      where: { id: templeId },
      select: { id: true },
    });

    if (!temple) {
      throw new ApiError("Temple not found", STATUS_CODES.NOT_FOUND);
    }

    const puja = await prisma.puja.create({
      data: {
        templeId,
        name: input.name,
        price: input.price,
        duration: input.duration,
        benefits: input.benefits,
      },
    });

    return this.toPujaDTO(puja);
  }

  async updatePuja(pujaId: string, input: UpdatePujaInput): Promise<PujaDTO> {
    const existing = await prisma.puja.findUnique({ where: { id: pujaId } });
    if (!existing) {
      throw new ApiError("Puja not found", STATUS_CODES.NOT_FOUND);
    }

    const puja = await prisma.puja.update({
      where: { id: pujaId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.duration !== undefined && { duration: input.duration }),
        ...(input.benefits !== undefined && { benefits: input.benefits }),
      },
    });

    return this.toPujaDTO(puja);
  }

  async deletePuja(pujaId: string): Promise<void> {
    const existing = await prisma.puja.findUnique({ where: { id: pujaId } });
    if (!existing) {
      throw new ApiError("Puja not found", STATUS_CODES.NOT_FOUND);
    }

    await prisma.puja.delete({ where: { id: pujaId } });
  }

  // ── Public (unauthenticated) reads ────────────────────────────────────────

  /**
   * Ordered oldest-first so the public grid keeps a stable order as new
   * temples are added, rather than reshuffling on every insert.
   */
  async listPublicTemples(): Promise<PublicTempleDTO[]> {
    const temples = await prisma.temple.findMany({
      orderBy: { createdAt: "asc" },
      include: templeInclude,
    });

    return temples.map((temple) => this.toPublicTempleDTO(temple));
  }

  async getPublicTempleBySlug(slug: string): Promise<PublicTempleDTO> {
    const temple = await prisma.temple.findUnique({
      where: { slug },
      include: templeInclude,
    });

    if (!temple) {
      throw new ApiError("Temple not found", STATUS_CODES.NOT_FOUND);
    }

    return this.toPublicTempleDTO(temple);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async assertSlugAvailable(slug: string): Promise<void> {
    const clash = await prisma.temple.findUnique({ where: { slug } });
    if (clash) {
      throw new ApiError(
        `The slug "${slug}" is already used by another temple`,
        STATUS_CODES.CONFLICT,
      );
    }
  }

  private toImageDTO(row: {
    id: string;
    url: string;
    publicId: string;
    createdAt: Date;
  }): TempleImageDTO {
    return {
      id: row.id,
      url: row.url,
      publicId: row.publicId,
      createdAt: row.createdAt,
    };
  }

  private toPujaDTO(row: {
    id: string;
    templeId: string;
    name: string;
    price: number;
    duration: string;
    benefits: string[];
    createdAt: Date;
    updatedAt: Date | null;
  }): PujaDTO {
    return {
      id: row.id,
      templeId: row.templeId,
      name: row.name,
      price: row.price,
      duration: row.duration,
      benefits: row.benefits,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private toPublicTempleDTO(row: any): PublicTempleDTO {
    const images: string[] = row.images.map((image: any) => image.url);

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      location: row.location,
      state: row.state,
      deity: row.deity,
      description: row.description,
      priceFrom: row.priceFrom,
      gradient: row.gradient,
      image: images[0],
      images,
      pujas: row.pujas.map((puja: any) => ({
        id: puja.id,
        name: puja.name,
        price: puja.price,
        duration: puja.duration,
        benefits: puja.benefits,
      })),
    };
  }

  private toTempleDTO(row: any): TempleDTO {
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      location: row.location,
      state: row.state,
      deity: row.deity,
      description: row.description,
      priceFrom: row.priceFrom,
      gradient: row.gradient,
      images: row.images.map((image: any) => this.toImageDTO(image)),
      pujas: row.pujas.map((puja: any) => this.toPujaDTO(puja)),
      imageCount: row.images.length,
      pujaCount: row.pujas.length,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

export default PujaService;
