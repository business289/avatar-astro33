import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthApiError } from "@/lib/authClient";
import { chadhawaApi, type ListChadhawasParams } from "../api/chadhawaApi";
import { pujaApi } from "../api/pujaApi";
import type { ChadhawaFormValues } from "../types/chadhawa";

export const ADMIN_CHADHAWAS_QUERY_KEY = ["admin", "chadhawa"] as const;

/** Temple dropdown options — reuses the existing admin temple listing. */
export const ADMIN_TEMPLE_OPTIONS_QUERY_KEY = [
  "admin",
  "puja",
  "temples",
  "options",
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

export function useAdminChadhawas(params: ListChadhawasParams) {
  return useQuery({
    queryKey: [...ADMIN_CHADHAWAS_QUERY_KEY, "list", params] as const,
    queryFn: () => chadhawaApi.listChadhawas(params),
    retry: retryUnlessAuthError,
    placeholderData: (previous) => previous,
    staleTime: 30_000,
  });
}

/**
 * Every temple, for the filter and form selects. The admin temple count is
 * small enough to fetch in one page rather than paginating a dropdown.
 */
export function useAdminTempleOptions() {
  return useQuery({
    queryKey: ADMIN_TEMPLE_OPTIONS_QUERY_KEY,
    queryFn: () => pujaApi.listTemples({ page: 1, limit: 100 }),
    retry: retryUnlessAuthError,
    staleTime: 60_000,
    select: (data) =>
      data.items.map((temple) => ({ id: temple.id, name: temple.name })),
  });
}

function useChadhawaInvalidator() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_CHADHAWAS_QUERY_KEY });
  };
}

export function useCreateChadhawa() {
  const invalidate = useChadhawaInvalidator();

  return useMutation({
    mutationFn: (values: ChadhawaFormValues) =>
      chadhawaApi.createChadhawa(values),
    onSuccess: (chadhawa) => {
      invalidate();
      toast.success(`${chadhawa.name} added`);
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not add the offering")),
  });
}

export function useUpdateChadhawa() {
  const invalidate = useChadhawaInvalidator();

  return useMutation({
    mutationFn: ({
      chadhawaId,
      values,
    }: {
      chadhawaId: string;
      values: Partial<ChadhawaFormValues>;
    }) => chadhawaApi.updateChadhawa(chadhawaId, values),
    onSuccess: (chadhawa) => {
      invalidate();
      toast.success(`${chadhawa.name} updated`);
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not update the offering")),
  });
}

export function useDeleteChadhawa() {
  const invalidate = useChadhawaInvalidator();

  return useMutation({
    mutationFn: (chadhawaId: string) => chadhawaApi.deleteChadhawa(chadhawaId),
    onSuccess: () => {
      invalidate();
      toast.success("Offering deleted");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not delete the offering")),
  });
}
