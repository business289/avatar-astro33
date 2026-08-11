import prisma from "@root/prisma.js";
import { ApiError } from "@/utils/ApiError.js";
import STATUS_CODES from "@/utils/statusCodes.js";
import type {
  ChadhawaDTO,
  ChadhawaInput,
  ChadhawaListResult,
  ListChadhawasInput,
  UpdateChadhawaInput,
} from "./chadhawa.types.js";

const chadhawaInclude = {
  temple: { select: { name: true, slug: true } },
} as const;

class ChadhawaService {
  async listChadhawas({
    templeId,
    search,
    isActive,
    sortBy,
    sortOrder,
    page,
    limit,
  }: ListChadhawasInput): Promise<ChadhawaListResult> {
    if (templeId) await this.assertTempleExists(templeId);

    const term = search?.trim();

    const where = {
      ...(templeId && { templeId }),
      ...(isActive !== undefined && { isActive }),
      ...(term && {
        OR: [
          { name: { contains: term, mode: "insensitive" as const } },
          { description: { contains: term, mode: "insensitive" as const } },
          {
            temple: { name: { contains: term, mode: "insensitive" as const } },
          },
        ],
      }),
    };

    // displayOrder alone is not unique, so a stable secondary key keeps
    // pagination from re-shuffling rows that share an order value.
    const orderBy =
      sortBy === "displayOrder"
        ? [{ displayOrder: sortOrder }, { createdAt: "asc" as const }]
        : [{ [sortBy]: sortOrder }];

    const [rows, total] = await Promise.all([
      prisma.chadhawa.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: chadhawaInclude,
      }),
      prisma.chadhawa.count({ where }),
    ]);

    return {
      items: rows.map((row) => this.toDTO(row)),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async getChadhawaById(id: string): Promise<ChadhawaDTO> {
    const chadhawa = await prisma.chadhawa.findUnique({
      where: { id },
      include: chadhawaInclude,
    });

    if (!chadhawa) {
      throw new ApiError("Chadhawa offering not found", STATUS_CODES.NOT_FOUND);
    }

    return this.toDTO(chadhawa);
  }

  async createChadhawa(input: ChadhawaInput): Promise<ChadhawaDTO> {
    await this.assertTempleExists(input.templeId);
    await this.assertNameAvailable(input.templeId, input.name);

    const displayOrder =
      input.displayOrder ?? (await this.nextDisplayOrder(input.templeId));

    const chadhawa = await prisma.chadhawa.create({
      data: {
        templeId: input.templeId,
        name: input.name,
        description: input.description,
        price: input.price,
        emoji: input.emoji || null,
        isActive: input.isActive ?? true,
        displayOrder,
      },
      include: chadhawaInclude,
    });

    return this.toDTO(chadhawa);
  }

  async updateChadhawa(
    id: string,
    input: UpdateChadhawaInput,
  ): Promise<ChadhawaDTO> {
    const existing = await prisma.chadhawa.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Chadhawa offering not found", STATUS_CODES.NOT_FOUND);
    }

    const templeId = input.templeId ?? existing.templeId;
    if (input.templeId && input.templeId !== existing.templeId) {
      await this.assertTempleExists(input.templeId);
    }

    const name = input.name ?? existing.name;
    if (name !== existing.name || templeId !== existing.templeId) {
      await this.assertNameAvailable(templeId, name, id);
    }

    const chadhawa = await prisma.chadhawa.update({
      where: { id },
      data: {
        ...(input.templeId !== undefined && { templeId: input.templeId }),
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.emoji !== undefined && { emoji: input.emoji || null }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.displayOrder !== undefined && {
          displayOrder: input.displayOrder,
        }),
      },
      include: chadhawaInclude,
    });

    return this.toDTO(chadhawa);
  }

  async deleteChadhawa(id: string): Promise<void> {
    const existing = await prisma.chadhawa.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Chadhawa offering not found", STATUS_CODES.NOT_FOUND);
    }

    await prisma.chadhawa.delete({ where: { id } });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async assertTempleExists(templeId: string): Promise<void> {
    const temple = await prisma.temple.findUnique({
      where: { id: templeId },
      select: { id: true },
    });

    if (!temple) {
      throw new ApiError("Temple not found", STATUS_CODES.NOT_FOUND);
    }
  }

  /**
   * Two offerings with the same name under one temple would be
   * indistinguishable on the public page, so they are rejected. Names may
   * still repeat across different temples.
   */
  private async assertNameAvailable(
    templeId: string,
    name: string,
    ignoreId?: string,
  ): Promise<void> {
    const clash = await prisma.chadhawa.findFirst({
      where: {
        templeId,
        name: { equals: name, mode: "insensitive" },
        ...(ignoreId && { id: { not: ignoreId } }),
      },
      select: { id: true },
    });

    if (clash) {
      throw new ApiError(
        `"${name}" already exists for this temple`,
        STATUS_CODES.CONFLICT,
      );
    }
  }

  /** Appends new offerings to the end of the temple's existing sequence. */
  private async nextDisplayOrder(templeId: string): Promise<number> {
    const last = await prisma.chadhawa.findFirst({
      where: { templeId },
      orderBy: { displayOrder: "desc" },
      select: { displayOrder: true },
    });

    return last ? last.displayOrder + 1 : 1;
  }

  private toDTO(row: any): ChadhawaDTO {
    return {
      id: row.id,
      templeId: row.templeId,
      templeName: row.temple?.name ?? "",
      templeSlug: row.temple?.slug ?? "",
      name: row.name,
      description: row.description,
      price: row.price,
      emoji: row.emoji,
      isActive: row.isActive,
      displayOrder: row.displayOrder,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

export default ChadhawaService;
