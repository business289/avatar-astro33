import { authRequest } from "@/lib/authClient";
import type { PublicChadhawaTemple } from "./types";

/**
 * Reuses the shared fetch wrapper for its response-envelope unwrapping and
 * error mapping, with `skipAuth` because these endpoints are public — sending
 * a stale token would otherwise trigger a pointless refresh round-trip.
 */
export const chadhawaApi = {
  listTemples() {
    return authRequest<PublicChadhawaTemple[]>("/chadhawa", { skipAuth: true });
  },

  getTempleBySlug(slug: string) {
    return authRequest<PublicChadhawaTemple>(
      `/chadhawa/${encodeURIComponent(slug)}`,
      { skipAuth: true },
    );
  },
};
