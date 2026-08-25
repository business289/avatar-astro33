import { useQuery } from "@tanstack/react-query";
import { AuthApiError } from "@/lib/authClient";
import { templeApi } from "./api";

export const TEMPLES_QUERY_KEY = ["temples"] as const;

/** A missing temple is a real answer, not a transient failure — don't retry it. */
const retryUnlessNotFound = (failureCount: number, error: unknown) => {
  if (error instanceof AuthApiError && error.status === 404) return false;
  return failureCount < 1;
};

export function useTemples() {
  return useQuery({
    queryKey: TEMPLES_QUERY_KEY,
    queryFn: () => templeApi.listTemples(),
    retry: retryUnlessNotFound,
    staleTime: 60_000,
  });
}

export function useTemple(slug: string | undefined) {
  return useQuery({
    queryKey: [...TEMPLES_QUERY_KEY, slug] as const,
    queryFn: () => templeApi.getTempleBySlug(slug as string),
    enabled: Boolean(slug),
    retry: retryUnlessNotFound,
    staleTime: 60_000,
  });
}

/** True when the failure was specifically "this temple does not exist". */
export function isNotFoundError(error: unknown): boolean {
  return error instanceof AuthApiError && error.status === 404;
}
