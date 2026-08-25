import { authRequest } from "@/lib/authClient";
import type { PublicTemple } from "./types";

/**
 * Reuses the shared fetch wrapper for its response-envelope unwrapping and
 * error mapping, with `skipAuth` because these endpoints are public — sending
 * a stale token would otherwise trigger a pointless refresh round-trip.
 */
export const templeApi = {
  listTemples() {
    return authRequest<PublicTemple[]>("/temples", { skipAuth: true });
  },

  getTempleBySlug(slug: string) {
    return authRequest<PublicTemple>(`/temples/${encodeURIComponent(slug)}`, {
      skipAuth: true,
    });
  },
};
