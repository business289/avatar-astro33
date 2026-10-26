import axios from "axios";
import { TtlCache } from "../../utils/ttlCache.js";
import { PanchangError } from "./panchang.types.js";
import { resolveTimezone } from "./panchang.service.js";

export interface LocationResult {
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export const MIN_QUERY_LENGTH = 3;
export const MAX_QUERY_LENGTH = 100;

// Nominatim's usage policy allows at most one request per second and requires
// an identifying User-Agent. Results are cached so repeat searches never reach it.
const GEOCODER_URL = process.env.GEOCODER_URL || "https://nominatim.openstreetmap.org/search";
// Nominatim asks for an identifying User-Agent; override with GEOCODER_USER_AGENT (ideally adding a contact address).
const USER_AGENT = process.env.GEOCODER_USER_AGENT || "avatar-astro-panchang/1.0 (+https://avatar-astro33.vercel.app)";
const MIN_INTERVAL_MS = 1100;
/** Searches allowed to wait for their turn. Beyond this we shed load instead of making callers wait minutes. */
export const MAX_PENDING_SEARCHES = 8;

const cache = new TtlCache<LocationResult[]>(24 * 3600 * 1000, 2000);
const inFlight = new Map<string, Promise<LocationResult[]>>();
let lastCallAt = 0;
let queue: Promise<unknown> = Promise.resolve();
let waiting = 0; // searches queued or running

/** Serialises upstream calls and spaces them at least MIN_INTERVAL_MS apart. */
function throttled<T>(task: () => Promise<T>): Promise<T> {
  if (waiting >= MAX_PENDING_SEARCHES) {
    return Promise.reject(new PanchangError("SEARCH_BUSY", "Location search is busy right now. Please try again in a moment.", 503));
  }
  waiting += 1;
  const run = queue.then(async () => {
    const wait = lastCallAt + MIN_INTERVAL_MS - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastCallAt = Date.now();
    return task();
  });
  const settle = () => { waiting -= 1; };
  run.then(settle, settle);
  queue = run.catch(() => undefined);
  return run;
}

interface RawPlace {
  display_name?: string;
  lat?: string;
  lon?: string;
}

export function normalizeQuery(q: unknown): string {
  if (typeof q !== "string") throw new PanchangError("INVALID_LOCATION", "Search text is required.");
  const clean = q.trim().replace(/\s+/g, " ");
  if (clean.length < MIN_QUERY_LENGTH) {
    throw new PanchangError("INVALID_LOCATION", `Type at least ${MIN_QUERY_LENGTH} characters to search.`);
  }
  if (clean.length > MAX_QUERY_LENGTH) {
    throw new PanchangError("INVALID_LOCATION", `Search text must be at most ${MAX_QUERY_LENGTH} characters.`);
  }
  return clean;
}

export async function searchLocations(q: unknown): Promise<LocationResult[]> {
  const query = normalizeQuery(q);
  const key = query.toLowerCase();

  const cached = cache.get(key);
  if (cached) return cached;
  const pending = inFlight.get(key);
  if (pending) return pending;

  const promise = throttled(async () => {
    let places: RawPlace[];
    try {
      const res = await axios.get<RawPlace[]>(GEOCODER_URL, {
        params: { q: query, format: "jsonv2", limit: 6 },
        headers: { "User-Agent": USER_AGENT, "Accept-Language": "en" },
        timeout: 6000,
      });
      places = Array.isArray(res.data) ? res.data : [];
    } catch {
      throw new PanchangError("CALCULATION_FAILED", "Location search is temporarily unavailable.", 502);
    }

    const results: LocationResult[] = [];
    for (const p of places) {
      const latitude = Number(p.lat);
      const longitude = Number(p.lon);
      if (!p.display_name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;
      try {
        results.push({ name: p.display_name, latitude, longitude, timezone: resolveTimezone(latitude, longitude) });
      } catch {
        // skip places whose timezone cannot be resolved
      }
    }
    cache.set(key, results);
    return results;
  }).finally(() => inFlight.delete(key));

  inFlight.set(key, promise);
  return promise;
}
