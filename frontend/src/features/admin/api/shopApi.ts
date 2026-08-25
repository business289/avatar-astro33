import { authRequest } from "@/lib/authClient";
import type {
  AdminShopCategory,
  AdminShopCategoryListResult,
  AdminShopProduct,
  AdminShopProductListResult,
  ShopCategoryFormValues,
  ShopProductFormValues,
} from "../types/shop";

const BASE = "/admin/shop";

export interface ListCategoriesParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListProductsParams {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export const shopApi = {
  listCategories({ search, page = 1, limit = 20 }: ListCategoriesParams = {}) {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search?.trim()) query.set("search", search.trim());

    return authRequest<AdminShopCategoryListResult>(
      `${BASE}/categories?${query.toString()}`,
    );
  },

  listAllActiveCategories() {
    return authRequest<AdminShopCategory[]>(`${BASE}/categories/all`);
  },

  getCategory(categoryId: string) {
    return authRequest<AdminShopCategory>(`${BASE}/categories/${categoryId}`);
  },

  createCategory(values: ShopCategoryFormValues) {
    return authRequest<AdminShopCategory>(`${BASE}/categories`, {
      method: "POST",
      body: values,
    });
  },

  updateCategory(categoryId: string, values: Partial<ShopCategoryFormValues>) {
    return authRequest<AdminShopCategory>(`${BASE}/categories/${categoryId}`, {
      method: "PATCH",
      body: values,
    });
  },

  deleteCategory(categoryId: string) {
    return authRequest<null>(`${BASE}/categories/${categoryId}`, {
      method: "DELETE",
    });
  },

  uploadCategoryImage(categoryId: string, file: File) {
    const formData = new FormData();
    formData.append("image", file);

    return authRequest<AdminShopCategory>(
      `${BASE}/categories/${categoryId}/image`,
      { method: "POST", body: formData },
    );
  },

  listProducts({
    search,
    categoryId,
    isActive,
    page = 1,
    limit = 20,
  }: ListProductsParams = {}) {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search?.trim()) query.set("search", search.trim());
    if (categoryId) query.set("categoryId", categoryId);
    if (isActive !== undefined) query.set("isActive", String(isActive));

    return authRequest<AdminShopProductListResult>(
      `${BASE}/products?${query.toString()}`,
    );
  },

  getProduct(productId: string) {
    return authRequest<AdminShopProduct>(`${BASE}/products/${productId}`);
  },

  createProduct(values: ShopProductFormValues) {
    return authRequest<AdminShopProduct>(`${BASE}/products`, {
      method: "POST",
      body: values,
    });
  },

  updateProduct(productId: string, values: Partial<ShopProductFormValues>) {
    return authRequest<AdminShopProduct>(`${BASE}/products/${productId}`, {
      method: "PATCH",
      body: values,
    });
  },

  deleteProduct(productId: string) {
    return authRequest<null>(`${BASE}/products/${productId}`, {
      method: "DELETE",
    });
  },

  uploadProductImage(productId: string, file: File) {
    const formData = new FormData();
    formData.append("image", file);

    return authRequest<AdminShopProduct>(
      `${BASE}/products/${productId}/image`,
      { method: "POST", body: formData },
    );
  },
};
