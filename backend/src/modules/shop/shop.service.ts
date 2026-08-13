import prisma from "@root/prisma.js";
import { ApiError } from "@/utils/ApiError.js";
import STATUS_CODES from "@/utils/statusCodes.js";
import {
  deleteImageByPublicId,
  uploadImageBuffer,
} from "@/config/cloudinary.js";
import type {
  ListPublicShopProductsInput,
  ListShopCategoriesInput,
  ListShopProductsInput,
  PublicShopCategoryDTO,
  PublicShopProductDTO,
  ShopCategoryDTO,
  ShopCategoryInput,
  ShopCategoryListResult,
  ShopProductDTO,
  ShopProductInput,
  ShopProductListResult,
  UpdateShopCategoryInput,
  UpdateShopProductInput,
  UploadFile,
} from "./shop.types.js";

const CATEGORY_FOLDER = "shop/categories";
const PRODUCT_FOLDER = "shop/products";

const productInclude = {
  category: { select: { id: true, name: true, slug: true, isActive: true } },
} as const;

class ShopService {
  // ── Categories ────────────────────────────────────────────────────────────

  async listCategories({
    search,
    page,
    limit,
  }: ListShopCategoriesInput): Promise<ShopCategoryListResult> {
    const term = search?.trim();

    const where = term
      ? { name: { contains: term, mode: "insensitive" as const } }
      : {};

    const [rows, total] = await Promise.all([
      prisma.shopCategory.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { products: true } } },
      }),
      prisma.shopCategory.count({ where }),
    ]);

    return {
      items: rows.map((row) => this.toCategoryDTO(row)),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  /** All active categories, unpaginated — used to populate the product form's category picker. */
  async listAllActiveCategories(): Promise<ShopCategoryDTO[]> {
    const rows = await prisma.shopCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });

    return rows.map((row) => this.toCategoryDTO(row));
  }

  async getCategoryById(id: string): Promise<ShopCategoryDTO> {
    const category = await prisma.shopCategory.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      throw new ApiError("Category not found", STATUS_CODES.NOT_FOUND);
    }

    return this.toCategoryDTO(category);
  }

  async createCategory(input: ShopCategoryInput): Promise<ShopCategoryDTO> {
    await this.assertCategoryNameAvailable(input.name);
    await this.assertCategorySlugAvailable(input.slug);

    const category = await prisma.shopCategory.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description?.trim() || null,
        isActive: input.isActive ?? true,
      },
      include: { _count: { select: { products: true } } },
    });

    return this.toCategoryDTO(category);
  }

  async updateCategory(
    id: string,
    input: UpdateShopCategoryInput,
  ): Promise<ShopCategoryDTO> {
    const existing = await prisma.shopCategory.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Category not found", STATUS_CODES.NOT_FOUND);
    }

    if (input.name && input.name !== existing.name) {
      await this.assertCategoryNameAvailable(input.name, id);
    }
    if (input.slug && input.slug !== existing.slug) {
      await this.assertCategorySlugAvailable(input.slug, id);
    }

    const category = await prisma.shopCategory.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.description !== undefined && {
          description: input.description?.trim() || null,
        }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
      include: { _count: { select: { products: true } } },
    });

    return this.toCategoryDTO(category);
  }

  /**
   * Categories that still own products are never deleted implicitly — the
   * admin must move or delete those products first, so nothing in the shop
   * silently loses its category.
   */
  async deleteCategory(id: string): Promise<void> {
    const category = await prisma.shopCategory.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      throw new ApiError("Category not found", STATUS_CODES.NOT_FOUND);
    }

    if (category._count.products > 0) {
      throw new ApiError(
        `Cannot delete this category because ${category._count.products} product(s) are associated with it. Move or delete those products first.`,
        STATUS_CODES.CONFLICT,
      );
    }

    if (category.imagePublicId) {
      await deleteImageByPublicId(category.imagePublicId).catch(() => false);
    }

    await prisma.shopCategory.delete({ where: { id } });
  }

  async setCategoryImage(
    id: string,
    file: UploadFile,
  ): Promise<ShopCategoryDTO> {
    const category = await prisma.shopCategory.findUnique({ where: { id } });
    if (!category) {
      throw new ApiError("Category not found", STATUS_CODES.NOT_FOUND);
    }

    const uploaded = await uploadImageBuffer(file.buffer, CATEGORY_FOLDER);

    if (category.imagePublicId) {
      await deleteImageByPublicId(category.imagePublicId).catch(() => false);
    }

    const updated = await prisma.shopCategory.update({
      where: { id },
      data: { image: uploaded.url, imagePublicId: uploaded.publicId },
      include: { _count: { select: { products: true } } },
    });

    return this.toCategoryDTO(updated);
  }

  // ── Products ──────────────────────────────────────────────────────────────

  async listProducts({
    search,
    categoryId,
    isActive,
    page,
    limit,
  }: ListShopProductsInput): Promise<ShopProductListResult> {
    const term = search?.trim();

    const where = {
      ...(categoryId && { categoryId }),
      ...(isActive !== undefined && { isActive }),
      ...(term && {
        OR: [
          { name: { contains: term, mode: "insensitive" as const } },
          { slug: { contains: term, mode: "insensitive" as const } },
        ],
      }),
    };

    const [rows, total] = await Promise.all([
      prisma.shopProduct.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: productInclude,
      }),
      prisma.shopProduct.count({ where }),
    ]);

    return {
      items: rows.map((row) => this.toProductDTO(row)),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async getProductById(id: string): Promise<ShopProductDTO> {
    const product = await prisma.shopProduct.findUnique({
      where: { id },
      include: productInclude,
    });

    if (!product) {
      throw new ApiError("Product not found", STATUS_CODES.NOT_FOUND);
    }

    return this.toProductDTO(product);
  }

  async createProduct(input: ShopProductInput): Promise<ShopProductDTO> {
    await this.assertCategoryExists(input.categoryId);
    await this.assertProductSlugAvailable(input.slug);

    const product = await prisma.shopProduct.create({
      data: {
        categoryId: input.categoryId,
        name: input.name,
        slug: input.slug,
        price: input.price,
        originalPrice: input.originalPrice ?? null,
        description: input.description,
        benefits: input.benefits,
        authenticity: input.authenticity,
        gradient: input.gradient?.trim() || null,
        isActive: input.isActive ?? true,
      },
      include: productInclude,
    });

    return this.toProductDTO(product);
  }

  async updateProduct(
    id: string,
    input: UpdateShopProductInput,
  ): Promise<ShopProductDTO> {
    const existing = await prisma.shopProduct.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Product not found", STATUS_CODES.NOT_FOUND);
    }

    if (input.categoryId && input.categoryId !== existing.categoryId) {
      await this.assertCategoryExists(input.categoryId);
    }
    if (input.slug && input.slug !== existing.slug) {
      await this.assertProductSlugAvailable(input.slug, id);
    }

    const product = await prisma.shopProduct.update({
      where: { id },
      data: {
        ...(input.categoryId !== undefined && {
          categoryId: input.categoryId,
        }),
        ...(input.name !== undefined && { name: input.name }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.originalPrice !== undefined && {
          originalPrice: input.originalPrice,
        }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
        ...(input.benefits !== undefined && { benefits: input.benefits }),
        ...(input.authenticity !== undefined && {
          authenticity: input.authenticity,
        }),
        ...(input.gradient !== undefined && {
          gradient: input.gradient?.trim() || null,
        }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
      include: productInclude,
    });

    return this.toProductDTO(product);
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await prisma.shopProduct.findUnique({ where: { id } });
    if (!product) {
      throw new ApiError("Product not found", STATUS_CODES.NOT_FOUND);
    }

    if (product.imagePublicId) {
      await deleteImageByPublicId(product.imagePublicId).catch(() => false);
    }

    await prisma.shopProduct.delete({ where: { id } });
  }

  async setProductImage(
    id: string,
    file: UploadFile,
  ): Promise<ShopProductDTO> {
    const product = await prisma.shopProduct.findUnique({ where: { id } });
    if (!product) {
      throw new ApiError("Product not found", STATUS_CODES.NOT_FOUND);
    }

    const uploaded = await uploadImageBuffer(file.buffer, PRODUCT_FOLDER);

    if (product.imagePublicId) {
      await deleteImageByPublicId(product.imagePublicId).catch(() => false);
    }

    const updated = await prisma.shopProduct.update({
      where: { id },
      data: { image: uploaded.url, imagePublicId: uploaded.publicId },
      include: productInclude,
    });

    return this.toProductDTO(updated);
  }

  // ── Public (unauthenticated) reads ────────────────────────────────────────

  async listPublicCategories(): Promise<PublicShopCategoryDTO[]> {
    const categories = await prisma.shopCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    });

    return categories;
  }

  async listPublicProducts({
    search,
    category,
  }: ListPublicShopProductsInput): Promise<PublicShopProductDTO[]> {
    const term = search?.trim();

    const where = {
      isActive: true,
      category: {
        isActive: true,
        ...(category && { slug: category }),
      },
      ...(term && {
        OR: [
          { name: { contains: term, mode: "insensitive" as const } },
          { description: { contains: term, mode: "insensitive" as const } },
          {
            category: { name: { contains: term, mode: "insensitive" as const } },
          },
        ],
      }),
    };

    const rows = await prisma.shopProduct.findMany({
      where,
      orderBy: { createdAt: "asc" },
      include: productInclude,
    });

    return rows.map((row) => this.toPublicProductDTO(row));
  }

  async getPublicProductBySlug(slug: string): Promise<PublicShopProductDTO> {
    const product = await prisma.shopProduct.findUnique({
      where: { slug },
      include: productInclude,
    });

    if (
      !product ||
      !product.isActive ||
      !(product as any).category ||
      !(product as any).category.isActive
    ) {
      throw new ApiError("Product not found", STATUS_CODES.NOT_FOUND);
    }

    return this.toPublicProductDTO(product);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async assertCategoryExists(categoryId: string): Promise<void> {
    const category = await prisma.shopCategory.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });

    if (!category) {
      throw new ApiError("Category not found", STATUS_CODES.NOT_FOUND);
    }
  }

  private async assertCategoryNameAvailable(
    name: string,
    ignoreId?: string,
  ): Promise<void> {
    const clash = await prisma.shopCategory.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        ...(ignoreId && { id: { not: ignoreId } }),
      },
      select: { id: true },
    });

    if (clash) {
      throw new ApiError(
        `A category named "${name}" already exists`,
        STATUS_CODES.CONFLICT,
      );
    }
  }

  private async assertCategorySlugAvailable(
    slug: string,
    ignoreId?: string,
  ): Promise<void> {
    const clash = await prisma.shopCategory.findFirst({
      where: { slug, ...(ignoreId && { id: { not: ignoreId } }) },
      select: { id: true },
    });

    if (clash) {
      throw new ApiError(
        `The slug "${slug}" is already used by another category`,
        STATUS_CODES.CONFLICT,
      );
    }
  }

  private async assertProductSlugAvailable(
    slug: string,
    ignoreId?: string,
  ): Promise<void> {
    const clash = await prisma.shopProduct.findFirst({
      where: { slug, ...(ignoreId && { id: { not: ignoreId } }) },
      select: { id: true },
    });

    if (clash) {
      throw new ApiError(
        `The slug "${slug}" is already used by another product`,
        STATUS_CODES.CONFLICT,
      );
    }
  }

  private toCategoryDTO(row: any): ShopCategoryDTO {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      image: row.image,
      isActive: row.isActive,
      productCount: row._count?.products ?? 0,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private toProductDTO(row: any): ShopProductDTO {
    return {
      id: row.id,
      categoryId: row.categoryId,
      categoryName: row.category?.name ?? "",
      categorySlug: row.category?.slug ?? "",
      name: row.name,
      slug: row.slug,
      price: row.price,
      originalPrice: row.originalPrice,
      description: row.description,
      benefits: row.benefits,
      authenticity: row.authenticity,
      gradient: row.gradient,
      image: row.image,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private toPublicProductDTO(row: any): PublicShopProductDTO {
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      price: row.price,
      originalPrice: row.originalPrice,
      description: row.description,
      benefits: row.benefits,
      authenticity: row.authenticity,
      gradient: row.gradient,
      image: row.image,
      category: {
        id: row.category.id,
        name: row.category.name,
        slug: row.category.slug,
      },
    };
  }
}

export default ShopService;
