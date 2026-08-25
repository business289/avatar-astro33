import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthApiError } from "@/lib/authClient";
import {
  shopApi,
  type ListCategoriesParams,
  type ListProductsParams,
} from "../api/shopApi";
import type {
  ShopCategoryFormValues,
  ShopProductFormValues,
} from "../types/shop";

export const ADMIN_SHOP_CATEGORIES_QUERY_KEY = [
  "admin",
  "shop",
  "categories",
] as const;
export const ADMIN_SHOP_PRODUCTS_QUERY_KEY = [
  "admin",
  "shop",
  "products",
] as const;

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof AuthApiError || error instanceof Error
    ? error.message
    : fallback;

/** Auth failures are terminal here — AdminRoute handles the redirect. */
const retryUnlessAuthError = (failureCount: number, error: unknown) => {
  if (
    error instanceof AuthApiError &&
    (error.status === 401 || error.status === 403)
  ) {
    return false;
  }
  return failureCount < 1;
};

// ── Categories ────────────────────────────────────────────────────────────

export function useAdminShopCategories(params: ListCategoriesParams) {
  return useQuery({
    queryKey: [...ADMIN_SHOP_CATEGORIES_QUERY_KEY, "list", params] as const,
    queryFn: () => shopApi.listCategories(params),
    retry: retryUnlessAuthError,
    placeholderData: (previous) => previous,
    staleTime: 30_000,
  });
}

/** Unpaginated, active-only list for the product form's category picker. */
export function useActiveShopCategories() {
  return useQuery({
    queryKey: [...ADMIN_SHOP_CATEGORIES_QUERY_KEY, "active"] as const,
    queryFn: () => shopApi.listAllActiveCategories(),
    retry: retryUnlessAuthError,
    staleTime: 30_000,
  });
}

function useCategoryInvalidator() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_SHOP_CATEGORIES_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ADMIN_SHOP_PRODUCTS_QUERY_KEY });
  };
}

export function useCreateShopCategory() {
  const invalidate = useCategoryInvalidator();

  return useMutation({
    mutationFn: (values: ShopCategoryFormValues) =>
      shopApi.createCategory(values),
    onSuccess: (category) => {
      invalidate();
      toast.success(`${category.name} created`);
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not create the category")),
  });
}

export function useUpdateShopCategory() {
  const invalidate = useCategoryInvalidator();

  return useMutation({
    mutationFn: ({
      categoryId,
      values,
    }: {
      categoryId: string;
      values: Partial<ShopCategoryFormValues>;
    }) => shopApi.updateCategory(categoryId, values),
    onSuccess: (category) => {
      invalidate();
      toast.success(`${category.name} updated`);
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not update the category")),
  });
}

export function useDeleteShopCategory() {
  const invalidate = useCategoryInvalidator();

  return useMutation({
    mutationFn: (categoryId: string) => shopApi.deleteCategory(categoryId),
    onSuccess: () => {
      invalidate();
      toast.success("Category deleted");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not delete the category")),
  });
}

export function useUploadCategoryImage() {
  const invalidate = useCategoryInvalidator();

  return useMutation({
    mutationFn: ({
      categoryId,
      file,
    }: {
      categoryId: string;
      file: File;
    }) => shopApi.uploadCategoryImage(categoryId, file),
    onSuccess: () => {
      invalidate();
      toast.success("Category image updated");
    },
    onError: (error) => toast.error(errorMessage(error, "Image upload failed")),
  });
}

// ── Products ──────────────────────────────────────────────────────────────

export function useAdminShopProducts(params: ListProductsParams) {
  return useQuery({
    queryKey: [...ADMIN_SHOP_PRODUCTS_QUERY_KEY, "list", params] as const,
    queryFn: () => shopApi.listProducts(params),
    retry: retryUnlessAuthError,
    placeholderData: (previous) => previous,
    staleTime: 30_000,
  });
}

function useProductInvalidator() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_SHOP_PRODUCTS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ADMIN_SHOP_CATEGORIES_QUERY_KEY });
  };
}

export function useCreateShopProduct() {
  const invalidate = useProductInvalidator();

  return useMutation({
    mutationFn: (values: ShopProductFormValues) =>
      shopApi.createProduct(values),
    onSuccess: (product) => {
      invalidate();
      toast.success(`${product.name} created`);
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not create the product")),
  });
}

export function useUpdateShopProduct() {
  const invalidate = useProductInvalidator();

  return useMutation({
    mutationFn: ({
      productId,
      values,
    }: {
      productId: string;
      values: Partial<ShopProductFormValues>;
    }) => shopApi.updateProduct(productId, values),
    onSuccess: (product) => {
      invalidate();
      toast.success(`${product.name} updated`);
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not update the product")),
  });
}

export function useDeleteShopProduct() {
  const invalidate = useProductInvalidator();

  return useMutation({
    mutationFn: (productId: string) => shopApi.deleteProduct(productId),
    onSuccess: () => {
      invalidate();
      toast.success("Product deleted");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not delete the product")),
  });
}

export function useUploadProductImage() {
  const invalidate = useProductInvalidator();

  return useMutation({
    mutationFn: ({ productId, file }: { productId: string; file: File }) =>
      shopApi.uploadProductImage(productId, file),
    onSuccess: () => {
      invalidate();
      toast.success("Product image updated");
    },
    onError: (error) => toast.error(errorMessage(error, "Image upload failed")),
  });
}
