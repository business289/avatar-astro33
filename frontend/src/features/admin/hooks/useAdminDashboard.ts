import { useQuery } from "@tanstack/react-query";
import { AuthApiError } from "@/lib/authClient";
import { adminApi } from "../api/adminApi";

export const ADMIN_DASHBOARD_QUERY_KEY = ["admin", "dashboard"] as const;

export function useAdminDashboard() {
  return useQuery({
    queryKey: ADMIN_DASHBOARD_QUERY_KEY,
    queryFn: () => adminApi.getDashboard(),
    retry: (failureCount, error) => {
      if (error instanceof AuthApiError && (error.status === 401 || error.status === 403)) {
        return false;
      }
      return failureCount < 1;
    },
    staleTime: 60_000,
  });
}
