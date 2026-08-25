import { authRequest } from "@/lib/authClient";
import type { PublicShopCategory, PublicShopProduct } from "./types";

export interface ListShopProductsParams {
  search?: string;
  category?: string;
}

/**
 * Reuses the shared fetch wrapper for its response-envelope unwrapping and
 * error mapping, with `skipAuth` because these endpoints are public — sending
 * a stale token would otherwise trigger a pointless refresh round-trip.
 */
export const shopApi = {
  listCategories() {
    return authRequest<PublicShopCategory[]>("/shop/categories", {
      skipAuth: true,
    });
  },

  listProducts(params: ListShopProductsParams = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.category) query.set("category", params.category);
    const qs = query.toString();

    return authRequest<PublicShopProduct[]>(
      `/shop/products${qs ? `?${qs}` : ""}`,
      { skipAuth: true },
    );
  },

  getProductBySlug(slug: string) {
    return authRequest<PublicShopProduct>(
      `/shop/products/${encodeURIComponent(slug)}`,
      { skipAuth: true },
    );
  },
};
