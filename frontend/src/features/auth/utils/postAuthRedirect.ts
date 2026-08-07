import type { AuthUser } from "../types";

/** Where to send the user after a successful auth session is stored. */
export function getPostAuthPath(user: AuthUser | null | undefined): string {
  if (user && user.profileCompleted === false) {
    return "/google-onboarding";
  }
  return "/";
}
