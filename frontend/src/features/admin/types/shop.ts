export interface AdminShopCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface AdminShopCategoryListResult {
  items: AdminShopCategory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ShopCategoryFormValues {
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
}

export interface AdminShopProduct {
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
  createdAt: string;
  updatedAt: string | null;
}

export interface AdminShopProductListResult {
  items: AdminShopProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ShopProductFormValues {
  categoryId: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  description: string;
  benefits: string[];
  authenticity: string;
  gradient?: string;
  isActive?: boolean;
}
