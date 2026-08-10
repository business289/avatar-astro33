import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthApiError } from "@/lib/authClient";
import { pujaApi, type ListTemplesParams } from "../api/pujaApi";
import type { PujaFormValues, TempleFormValues } from "../types/puja";

export const ADMIN_TEMPLES_QUERY_KEY = ["admin", "puja", "temples"] as const;

const templeDetailKey = (templeId: string) =>
  [...ADMIN_TEMPLES_QUERY_KEY, templeId] as const;

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

export function useAdminTemples(params: ListTemplesParams) {
  return useQuery({
    queryKey: [...ADMIN_TEMPLES_QUERY_KEY, "list", params] as const,
    queryFn: () => pujaApi.listTemples(params),
    retry: retryUnlessAuthError,
    placeholderData: (previous) => previous,
    staleTime: 30_000,
  });
}

export function useAdminTemple(templeId: string | null) {
  return useQuery({
    queryKey: templeDetailKey(templeId ?? "none"),
    queryFn: () => pujaApi.getTemple(templeId as string),
    enabled: Boolean(templeId),
    retry: retryUnlessAuthError,
  });
}

/** Invalidates every temple list page plus the affected detail record. */
function useTempleInvalidator() {
  const queryClient = useQueryClient();

  return (templeId?: string) => {
    queryClient.invalidateQueries({ queryKey: ADMIN_TEMPLES_QUERY_KEY });
    if (templeId) {
      queryClient.invalidateQueries({ queryKey: templeDetailKey(templeId) });
    }
  };
}

export function useCreateTemple() {
  const invalidate = useTempleInvalidator();

  return useMutation({
    mutationFn: (values: TempleFormValues) => pujaApi.createTemple(values),
    onSuccess: (temple) => {
      invalidate(temple.id);
      toast.success(`${temple.name} created`);
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not create the temple")),
  });
}

export function useUpdateTemple() {
  const invalidate = useTempleInvalidator();

  return useMutation({
    mutationFn: ({
      templeId,
      values,
    }: {
      templeId: string;
      values: Partial<TempleFormValues>;
    }) => pujaApi.updateTemple(templeId, values),
    onSuccess: (temple) => {
      invalidate(temple.id);
      toast.success(`${temple.name} updated`);
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not update the temple")),
  });
}

export function useDeleteTemple() {
  const invalidate = useTempleInvalidator();

  return useMutation({
    mutationFn: (templeId: string) => pujaApi.deleteTemple(templeId),
    onSuccess: (result) => {
      invalidate();
      if (result.orphanedImages.length) {
        toast.warning(
          `Temple deleted, but ${result.orphanedImages.length} image(s) remain on Cloudinary`,
        );
      } else {
        toast.success("Temple deleted");
      }
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not delete the temple")),
  });
}

export function useUploadTempleImages() {
  const invalidate = useTempleInvalidator();

  return useMutation({
    mutationFn: ({ templeId, files }: { templeId: string; files: File[] }) =>
      pujaApi.uploadTempleImages(templeId, files),
    onSuccess: (images, { templeId }) => {
      invalidate(templeId);
      toast.success(`${images.length} image(s) uploaded`);
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Image upload failed")),
  });
}

export function useDeleteTempleImage() {
  const invalidate = useTempleInvalidator();

  return useMutation({
    mutationFn: ({ imageId }: { imageId: string; templeId: string }) =>
      pujaApi.deleteTempleImage(imageId),
    onSuccess: (_data, { templeId }) => {
      invalidate(templeId);
      toast.success("Image removed");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not remove the image")),
  });
}

export function useCreatePuja() {
  const invalidate = useTempleInvalidator();

  return useMutation({
    mutationFn: ({
      templeId,
      values,
    }: {
      templeId: string;
      values: PujaFormValues;
    }) => pujaApi.createPuja(templeId, values),
    onSuccess: (puja) => {
      invalidate(puja.templeId);
      toast.success(`${puja.name} added`);
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not add the Puja")),
  });
}

export function useUpdatePuja() {
  const invalidate = useTempleInvalidator();

  return useMutation({
    mutationFn: ({
      pujaId,
      values,
    }: {
      pujaId: string;
      templeId: string;
      values: Partial<PujaFormValues>;
    }) => pujaApi.updatePuja(pujaId, values),
    onSuccess: (puja) => {
      invalidate(puja.templeId);
      toast.success(`${puja.name} updated`);
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not update the Puja")),
  });
}

export function useDeletePuja() {
  const invalidate = useTempleInvalidator();

  return useMutation({
    mutationFn: ({ pujaId }: { pujaId: string; templeId: string }) =>
      pujaApi.deletePuja(pujaId),
    onSuccess: (_data, { templeId }) => {
      invalidate(templeId);
      toast.success("Puja deleted");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not delete the Puja")),
  });
}
