export interface ShopCategoryDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  productCount: number;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface ShopCategoryListResult {
  items: ShopCategoryDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListShopCategoriesInput {
  search?: string;
  page: number;
  limit: number;
}

export interface ShopCategoryInput {
  name: string;
  slug: string;
  description?: string | null;
  isActive?: boolean;
}

export type UpdateShopCategoryInput = Partial<ShopCategoryInput>;

export interface ShopProductDTO {
  id: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  description: string;
  benefits: string[];
  authenticity: string;
  gradient: string | null;
  image: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface ShopProductListResult {
  items: ShopProductDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListShopProductsInput {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  page: number;
  limit: number;
}

export interface ShopProductInput {
  categoryId: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  description: string;
  benefits: string[];
  authenticity: string;
  gradient?: string | null;
  isActive?: boolean;
}

export type UpdateShopProductInput = Partial<ShopProductInput>;

/** Multer's in-memory file shape, narrowed to what the service needs. */
export interface UploadFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

// ── Public (unauthenticated) DTOs ────────────────────────────────────────────

export interface PublicShopCategoryDTO {
  id: string;
  name: string;
  slug: string;
}

export interface PublicShopProductDTO {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice: number | null;
  description: string;
  benefits: string[];
  authenticity: string;
  gradient: string | null;
  image: string | null;
  category: PublicShopCategoryDTO;
}

export interface ListPublicShopProductsInput {
  search?: string;
  category?: string;
}
