export interface AdminDashboardUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

export interface AdminDashboardData {
  user: AdminDashboardUser;
  role: "ADMIN" | "SUPERADMIN";
}
