import type { AuthUser } from "@/features/auth/types";
import { isAdminUser } from "@/features/admin/utils/roles";

/** Where to send the user after a successful auth session is stored. */
export function getPostAuthPath(user: AuthUser | null | undefined): string {
  if (user && user.profileCompleted === false) {
    return "/google-onboarding";
  }
  if (isAdminUser(user)) {
    return "/admin";
  }
  return "/";
}
