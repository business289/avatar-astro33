import { authRequest } from "@/lib/authClient";
import type { AdminDashboardData } from "../types";

export const adminApi = {
  getDashboard() {
    return authRequest<AdminDashboardData>("/admin/dashboard");
  },
};
