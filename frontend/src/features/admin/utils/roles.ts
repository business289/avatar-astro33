import type { AuthUser, RoleName } from "@/features/auth/types";

const ADMIN_ROLE_NAMES = new Set<RoleName>([
  "ADMIN",
  "SUPERADMIN",
  "SUPER_ADMIN",
]);

export function getUserRoleNames(user: AuthUser | null | undefined): string[] {
  return user?.userRoleMappings?.map((mapping) => mapping.role.name) ?? [];
}

export function hasAnyRole(
  user: AuthUser | null | undefined,
  ...roles: RoleName[]
): boolean {
  const roleNames = getUserRoleNames(user);
  return roles.some((role) => roleNames.includes(role));
}

export function isAdminUser(user: AuthUser | null | undefined): boolean {
  return getUserRoleNames(user).some((name) => ADMIN_ROLE_NAMES.has(name));
}
