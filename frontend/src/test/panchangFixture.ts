import type { LocalTime, PanchangData, PanchangPlace } from "@/types/panchang";

/**
 * UI-test fixture in the API's response shape. These values exercise
 * rendering only; calculation accuracy is tested in the backend against
 * published reference Panchang data.
 */
export function lt(local: string, requestedDate: string): LocalTime {
  const [date, time] = local.split("T");
  const dayOffset = Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${requestedDate}T00:00:00Z`)) / 86400000);
  return { iso: `${local}Z`, local, date, time, dayOffset };
}

export function makePanchang(date: string, place: PanchangPlace, overrides: Partial<PanchangData> = {}): PanchangData {
  const d = (time: string) => lt(`${date}T${time}`, date);
  const next = (time: string) => lt(`${nextDay(date)}T${time}`, date);
  return {
    date,
    location: place,
    utcOffsetMinutes: 330,
    calculation: { engine: "astronomy-engine", ayanamsa: "Lahiri", ayanamsaDegrees: 24.2, lunarMonthSystem: "Amanta" },
    sun: { sunrise: d("06:32:03"), sunset: d("18:29:01"), nextSunrise: next("06:31:00"), dayLengthMinutes: 717 },
    vara: { number: 6, name: "Friday", sanskritName: "Shukravara", lord: "Venus" },
    lunarMonth: { name: "Phalguna", adhika: false },
    tithi: [
      { number: 15, name: "Purnima", paksha: "Shukla", pakshaNumber: 15, startsAt: lt(`${prevDay(date)}T10:36:19`, date), endsAt: d("12:24:35"), atSunrise: true },
      { number: 16, name: "Pratipada", paksha: "Krishna", pakshaNumber: 1, startsAt: d("12:24:35"), endsAt: next("14:33:35"), atSunrise: false },
    ],
    nakshatra: [{ number: 12, name: "Uttara Phalguni", lord: "Sun", startsAt: d("06:19:34"), endsAt: next("08:54:13"), atSunrise: true }],
    yoga: [{ number: 9, name: "Shula", startsAt: lt(`${prevDay(date)}T13:02:39`, date), endsAt: d("13:23:26"), atSunrise: true }],
    karana: [{ number: 1, name: "Bava", startsAt: lt(`${prevDay(date)}T23:27:38`, date), endsAt: d("12:24:35"), atSunrise: true }],
    rahuKalam: { start: d("11:00:55"), end: d("12:30:00") },
    yamaganda: { start: d("15:29:00"), end: d("16:58:00") },
    gulika: { start: d("08:02:00"), end: d("09:31:00") },
    abhijitMuhurta: { start: d("12:06:38"), end: d("12:54:00") },
    summary: `Friday at ${place.name}: Purnima Tithi at sunrise, Nakshatra Uttara Phalguni, Yoga Shula, Karana Bava.`,
    ...overrides,
  };
}

function shift(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * 86400000).toISOString().slice(0, 10);
}
export const nextDay = (date: string) => shift(date, 1);
export const prevDay = (date: string) => shift(date, -1);
