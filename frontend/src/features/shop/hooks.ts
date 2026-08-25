import { useQuery } from "@tanstack/react-query";
import { AuthApiError } from "@/lib/authClient";
import { shopApi } from "./api";

export const SHOP_CATEGORIES_QUERY_KEY = ["shop", "categories"] as const;
export const SHOP_PRODUCTS_QUERY_KEY = ["shop", "products"] as const;

/** A missing product is a real answer, not a transient failure — don't retry it. */
const retryUnlessNotFound = (failureCount: number, error: unknown) => {
  if (error instanceof AuthApiError && error.status === 404) return false;
  return failureCount < 1;
};

export function useShopCategories() {
  return useQuery({
    queryKey: SHOP_CATEGORIES_QUERY_KEY,
    queryFn: () => shopApi.listCategories(),
    retry: retryUnlessNotFound,
    staleTime: 60_000,
  });
}

export function useShopProducts() {
  return useQuery({
    queryKey: SHOP_PRODUCTS_QUERY_KEY,
    queryFn: () => shopApi.listProducts(),
    retry: retryUnlessNotFound,
    staleTime: 60_000,
  });
}

export function useShopProduct(slug: string | undefined) {
  return useQuery({
    queryKey: [...SHOP_PRODUCTS_QUERY_KEY, slug] as const,
    queryFn: () => shopApi.getProductBySlug(slug as string),
    enabled: Boolean(slug),
    retry: retryUnlessNotFound,
    staleTime: 60_000,
  });
}

/** True when the failure was specifically "this product does not exist". */
export function isNotFoundError(error: unknown): boolean {
  return error instanceof AuthApiError && error.status === 404;
}
