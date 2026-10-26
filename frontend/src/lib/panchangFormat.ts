import type { LocalTime } from "@/types/panchang";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LONG_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** "06:32:03" -> "6:32 AM". Uses the location's wall-clock time, never the browser's timezone. */
export function formatClock(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** "2025-03-15" -> "15 Mar" */
export function formatShortDate(date: string): string {
  const [, m, d] = date.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}

/** A time, with the date appended when it falls on a different day than the one requested. */
export function formatWithDay(t: LocalTime): string {
  return t.dayOffset === 0 ? formatClock(t.time) : `${formatClock(t.time)}, ${formatShortDate(t.date)}`;
}

/** "2025-03-14" -> "Friday, 14 March 2025" */
export function formatLongDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${weekday}, ${d} ${LONG_MONTHS[m - 1]} ${y}`;
}

export function formatDuration(minutes: number): string {
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}

/** "UTC+05:30" */
export function formatOffset(minutes: number): string {
  const sign = minutes < 0 ? "-" : "+";
  const abs = Math.abs(minutes);
  return `UTC${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}

/** Adds days to a YYYY-MM-DD string without involving the browser timezone. */
export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return `${t.getUTCFullYear().toString().padStart(4, "0")}-${String(t.getUTCMonth() + 1).padStart(2, "0")}-${String(t.getUTCDate()).padStart(2, "0")}`;
}

export const MIN_DATE = "1900-01-01";
export const MAX_DATE = "2100-12-31";

/** True for a real calendar date inside the supported range. */
export function isSupportedDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  if (t.getUTCFullYear() !== y || t.getUTCMonth() !== m - 1 || t.getUTCDate() !== d) return false;
  return value >= MIN_DATE && value <= MAX_DATE;
}
