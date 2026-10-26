// Timezone-aware helpers built on Intl (IANA database), never on a fixed offset.
import type { LocalTime } from "./panchang.types.js";

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    formatters.set(timeZone, f);
  }
  return f;
}

interface WallParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export function wallPartsAt(utcMs: number, timeZone: string): WallParts {
  const out: Record<string, number> = {};
  for (const p of formatterFor(timeZone).formatToParts(new Date(utcMs))) {
    if (p.type !== "literal") out[p.type] = Number(p.value);
  }
  return {
    year: out.year,
    month: out.month,
    day: out.day,
    hour: out.hour === 24 ? 0 : out.hour,
    minute: out.minute,
    second: out.second,
  };
}

/** UTC offset (minutes, east positive) of `timeZone` at the given instant. */
export function offsetMinutesAt(utcMs: number, timeZone: string): number {
  const w = wallPartsAt(utcMs, timeZone);
  const asUtc = Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second);
  return Math.round((asUtc - Math.floor(utcMs / 1000) * 1000) / 60000);
}

/**
 * The UTC instant at which the wall clock in `timeZone` reads the given time.
 * If that wall time does not exist (DST gap) the instant after the gap is returned.
 */
export function wallTimeToUtcMs(
  year: number, month: number, day: number,
  hour: number, minute: number, second: number,
  timeZone: string,
): number {
  const guess = Date.UTC(year, month - 1, day, hour, minute, second);
  const off1 = offsetMinutesAt(guess, timeZone);
  let t = guess - off1 * 60000;
  const off2 = offsetMinutesAt(t, timeZone);
  if (off2 !== off1) t = guess - off2 * 60000;
  return t;
}

const pad = (n: number, w = 2) => String(n).padStart(w, "0");

export function toDateString(y: number, m: number, d: number): string {
  return `${pad(y, 4)}-${pad(m)}-${pad(d)}`;
}

function dayNumber(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
}

export function toLocalTime(utcMs: number, timeZone: string, requestedDate: string): LocalTime {
  // Whole seconds, so displayed times are stable.
  const ms = Math.round(utcMs / 1000) * 1000;
  const w = wallPartsAt(ms, timeZone);
  const date = toDateString(w.year, w.month, w.day);
  const time = `${pad(w.hour)}:${pad(w.minute)}:${pad(w.second)}`;
  return {
    iso: new Date(ms).toISOString().replace(".000Z", "Z"),
    local: `${date}T${time}`,
    date,
    time,
    dayOffset: dayNumber(date) - dayNumber(requestedDate),
  };
}

/** Weekday (0 = Sunday) of a calendar date string. */
export function weekdayOf(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}
