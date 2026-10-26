import tzlookup from "tz-lookup";
import { TtlCache } from "../../utils/ttlCache.js";
import { calculatePanchang } from "./panchang.engine.js";
import { toDateString, wallPartsAt } from "./panchang.time.js";
import { PanchangError, type PanchangResult } from "./panchang.types.js";

/** astronomy-engine is validated over a few centuries; keep requests well inside that. */
export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const NUMBER_RE = /^[+-]?\d+(\.\d+)?$/;

export interface PanchangQuery {
  date?: string;
  lat?: string;
  lon?: string;
  name?: string;
}

export function resolveTimezone(latitude: number, longitude: number): string {
  try {
    return tzlookup(latitude, longitude);
  } catch {
    throw new PanchangError("INVALID_LOCATION", "Could not determine a timezone for these coordinates.");
  }
}

export function validateDate(date: string): void {
  const m = DATE_RE.exec(date);
  if (!m) throw new PanchangError("INVALID_DATE", "Date must be in YYYY-MM-DD format.");
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const probe = new Date(Date.UTC(y, mo - 1, d));
  if (probe.getUTCFullYear() !== y || probe.getUTCMonth() !== mo - 1 || probe.getUTCDate() !== d) {
    throw new PanchangError("INVALID_DATE", "That calendar date does not exist.");
  }
  if (y < MIN_YEAR || y > MAX_YEAR) {
    throw new PanchangError("DATE_OUT_OF_RANGE", `Date must be between ${MIN_YEAR} and ${MAX_YEAR}.`);
  }
}

function parseCoordinate(raw: string | undefined, label: string, limit: number): number {
  if (raw === undefined || !NUMBER_RE.test(raw.trim())) {
    throw new PanchangError("INVALID_LOCATION", `${label} is required and must be a number.`);
  }
  const value = Number(raw);
  if (!Number.isFinite(value) || Math.abs(value) > limit) {
    throw new PanchangError("INVALID_LOCATION", `${label} must be between -${limit} and ${limit}.`);
  }
  return value;
}

// A result for one date + place never changes, so it is cached for a day.
const cache = new TtlCache<PanchangResult>(24 * 3600 * 1000, 1000);

export function getPanchang(query: PanchangQuery): PanchangResult {
  const latitude = parseCoordinate(query.lat, "Latitude", 90);
  const longitude = parseCoordinate(query.lon, "Longitude", 180);
  const timezone = resolveTimezone(latitude, longitude);

  const name = (query.name ?? "").trim().slice(0, 120) || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;

  let date = query.date?.trim();
  if (date) {
    validateDate(date);
  } else {
    // "Today" is whatever the calendar says at the selected place, not on the server.
    const w = wallPartsAt(Date.now(), timezone);
    date = toDateString(w.year, w.month, w.day);
  }

  const key = `${date}|${latitude.toFixed(4)}|${longitude.toFixed(4)}|${name}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const result = calculatePanchang({ date, location: { name, latitude, longitude, timezone } });
  cache.set(key, result);
  return result;
}
