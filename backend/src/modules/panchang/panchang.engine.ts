// Panchang calculation for one local calendar date and place.
// See README.md in this folder for the conventions and formulas.
import {
  elongation, moonSidereal, sunSidereal, sunTimes, surroundingNewMoons,
  trueAyanamsa, yogaAngle,
} from "./panchang.astro.js";
import { toLocalTime, offsetMinutesAt, weekdayOf, wallTimeToUtcMs } from "./panchang.time.js";
import {
  GULIKA_PART, LUNAR_MONTH_BY_SOLAR_SIGN, NAKSHATRAS, RAHU_KALAM_PART, TITHI_NAMES,
  VARAS, YAMAGANDA_PART, YOGA_NAMES, karanaName,
} from "./vedic.constants.js";
import {
  PanchangError,
  type NakshatraSegment, type PanchangLocation, type PanchangResult,
  type PanchangSegment, type TimeRange, type TithiSegment,
} from "./panchang.types.js";

const STEP_MS = 30 * 60 * 1000; // < 1/10 of the shortest segment, so a scan can never skip a boundary
const MAX_SCAN_MS = 72 * 3600 * 1000;
const PRECISION_MS = 250;
const NAKSHATRA_SPAN = 360 / 27;

interface ElementDef {
  span: number;
  count: number;
  angle: (ms: number) => number;
}

const TITHI: ElementDef = { span: 12, count: 30, angle: elongation };
const KARANA: ElementDef = { span: 6, count: 60, angle: elongation };
const NAKSHATRA: ElementDef = { span: NAKSHATRA_SPAN, count: 27, angle: moonSidereal };
const YOGA: ElementDef = { span: NAKSHATRA_SPAN, count: 27, angle: yogaAngle };

const indexAt = (def: ElementDef, ms: number): number =>
  Math.floor(def.angle(ms) / def.span) % def.count;

/** Instant at which the element enters the index it holds at `ms`. */
function segmentStart(def: ElementDef, ms: number): number {
  const idx = indexAt(def, ms);
  let hi = ms;
  while (indexAt(def, hi - STEP_MS) === idx) {
    hi -= STEP_MS;
    if (ms - hi > MAX_SCAN_MS) throw new Error("segment start not found");
  }
  let lo = hi - STEP_MS;
  while (hi - lo > PRECISION_MS) {
    const mid = (lo + hi) / 2;
    if (indexAt(def, mid) === idx) hi = mid; else lo = mid;
  }
  return hi;
}

/** Instant at which the element leaves the index it holds at `ms`. */
function segmentEnd(def: ElementDef, ms: number): number {
  const idx = indexAt(def, ms);
  let lo = ms;
  while (indexAt(def, lo + STEP_MS) === idx) {
    lo += STEP_MS;
    if (lo - ms > MAX_SCAN_MS) throw new Error("segment end not found");
  }
  let hi = lo + STEP_MS;
  while (hi - lo > PRECISION_MS) {
    const mid = (lo + hi) / 2;
    if (indexAt(def, mid) === idx) lo = mid; else hi = mid;
  }
  return hi;
}

interface RawSegment {
  index: number;
  startMs: number;
  endMs: number;
}

/** Segment running at sunrise followed by every segment that starts before the next sunrise. */
function collectSegments(def: ElementDef, sunriseMs: number, nextSunriseMs: number): RawSegment[] {
  const out: RawSegment[] = [];
  let probe = sunriseMs;
  let startMs = segmentStart(def, sunriseMs);
  for (let guard = 0; guard < 8; guard++) {
    const endMs = segmentEnd(def, probe);
    out.push({ index: indexAt(def, probe), startMs, endMs });
    if (endMs >= nextSunriseMs) break;
    startMs = endMs;
    probe = endMs + 1000; // just inside the next segment
  }
  return out;
}

function lunarMonthAt(ms: number): { name: string; adhika: boolean } {
  const { prevMs, nextMs } = surroundingNewMoons(ms);
  const signAtStart = Math.floor(sunSidereal(prevMs) / 30);
  const signAtEnd = Math.floor(sunSidereal(nextMs) / 30);
  if (signAtStart === signAtEnd) {
    // No sankranti inside the month: adhika, named after the month that follows.
    return { name: LUNAR_MONTH_BY_SOLAR_SIGN[(signAtEnd + 1) % 12], adhika: true };
  }
  return { name: LUNAR_MONTH_BY_SOLAR_SIGN[signAtEnd], adhika: false };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export interface PanchangInput {
  /** Requested local calendar date, "YYYY-MM-DD". */
  date: string;
  location: PanchangLocation;
}

export function calculatePanchang({ date, location }: PanchangInput): PanchangResult {
  const [year, month, day] = date.split("-").map(Number);
  const tz = location.timezone;
  const { latitude, longitude } = location;

  let result: PanchangResult;
  try {
    const midnightMs = wallTimeToUtcMs(year, month, day, 0, 0, 0, tz);
    const sun = sunTimes(latitude, longitude, midnightMs);
    if (!sun) {
      throw new PanchangError("NO_SUNRISE", "The Sun does not rise and set at this location on this date.", 422);
    }
    const { sunriseMs, sunsetMs, nextSunriseMs } = sun;
    const sunriseLocal = toLocalTime(sunriseMs, tz, date);
    if (sunriseLocal.dayOffset !== 0) {
      throw new PanchangError("NO_SUNRISE", "There is no sunrise on this local date at this location.", 422);
    }

    const t = (ms: number) => toLocalTime(ms, tz, date);
    const range = (startMs: number, endMs: number): TimeRange => ({ start: t(startMs), end: t(endMs) });
    const base = (raw: RawSegment, name: string): PanchangSegment => ({
      number: raw.index + 1,
      name,
      startsAt: t(raw.startMs),
      endsAt: t(raw.endMs),
      atSunrise: raw.startMs <= sunriseMs && raw.endMs > sunriseMs,
    });

    const tithi: TithiSegment[] = collectSegments(TITHI, sunriseMs, nextSunriseMs).map((raw) => {
      const shukla = raw.index < 15;
      const pakshaNumber = (raw.index % 15) + 1;
      const name = pakshaNumber === 15 ? (shukla ? "Purnima" : "Amavasya") : TITHI_NAMES[pakshaNumber - 1];
      return { ...base(raw, name), paksha: shukla ? "Shukla" : "Krishna", pakshaNumber };
    });
    const nakshatra: NakshatraSegment[] = collectSegments(NAKSHATRA, sunriseMs, nextSunriseMs).map((raw) => ({
      ...base(raw, NAKSHATRAS[raw.index].name),
      lord: NAKSHATRAS[raw.index].lord,
    }));
    const yoga = collectSegments(YOGA, sunriseMs, nextSunriseMs).map((raw) => base(raw, YOGA_NAMES[raw.index]));
    const karana = collectSegments(KARANA, sunriseMs, nextSunriseMs).map((raw) => base(raw, karanaName(raw.index)));

    const weekday = weekdayOf(date);
    const vara = VARAS[weekday];
    const dayMs = sunsetMs - sunriseMs;
    const eighth = (part: number) => range(sunriseMs + ((part - 1) * dayMs) / 8, sunriseMs + (part * dayMs) / 8);
    const abhijit = {
      ...range(sunriseMs + (7 * dayMs) / 15, sunriseMs + (8 * dayMs) / 15),
      ...(weekday === 3 ? { note: "Abhijit Muhurta is traditionally not observed on Wednesdays." } : {}),
    };

    const lunarMonth = lunarMonthAt(sunriseMs);
    const hhmm = (l: { time: string }) => l.time.slice(0, 5);
    const until = (l: { time: string; date: string; dayOffset: number }) => {
      if (l.dayOffset === 0) return hhmm(l);
      const [, m, d] = l.date.split("-").map(Number);
      return `${hhmm(l)} on ${d} ${MONTHS[m - 1]}`;
    };
    const tSun = tithi.find((s) => s.atSunrise)!;
    const nSun = nakshatra.find((s) => s.atSunrise)!;
    const ySun = yoga.find((s) => s.atSunrise)!;
    const kSun = karana.find((s) => s.atSunrise)!;
    const [dy, dm, dd] = [year, month, day];
    const summary =
      `${vara.name} ${dd} ${MONTHS[dm - 1]} ${dy} at ${location.name} (${tz}): sunrise ${hhmm(sunriseLocal)}, sunset ${hhmm(t(sunsetMs))}. ` +
      `${lunarMonth.adhika ? "Adhika " : ""}${lunarMonth.name} month, ${tSun.paksha} Paksha ${tSun.name} Tithi at sunrise (until ${until(tSun.endsAt)}). ` +
      `Nakshatra ${nSun.name} (until ${until(nSun.endsAt)}), Yoga ${ySun.name} (until ${until(ySun.endsAt)}), Karana ${kSun.name} (until ${until(kSun.endsAt)}). ` +
      `Rahu Kalam ${hhmm(eighth(RAHU_KALAM_PART[weekday]).start)}–${hhmm(eighth(RAHU_KALAM_PART[weekday]).end)} is best avoided for new ventures; ` +
      `Abhijit Muhurta runs ${hhmm(abhijit.start)}–${hhmm(abhijit.end)}${weekday === 3 ? " (not observed on Wednesdays)" : ""}.`;

    result = {
      date,
      location,
      utcOffsetMinutes: offsetMinutesAt(sunriseMs, tz),
      calculation: {
        engine: "astronomy-engine",
        ayanamsa: "Lahiri",
        ayanamsaDegrees: Math.round(trueAyanamsa(sunriseMs) * 1e6) / 1e6,
        lunarMonthSystem: "Amanta",
      },
      sun: {
        sunrise: sunriseLocal,
        sunset: t(sunsetMs),
        nextSunrise: t(nextSunriseMs),
        dayLengthMinutes: Math.round(dayMs / 60000),
      },
      vara: { number: weekday + 1, name: vara.name, sanskritName: vara.sanskrit, lord: vara.lord },
      lunarMonth,
      tithi,
      nakshatra,
      yoga,
      karana,
      rahuKalam: eighth(RAHU_KALAM_PART[weekday]),
      yamaganda: eighth(YAMAGANDA_PART[weekday]),
      gulika: eighth(GULIKA_PART[weekday]),
      abhijitMuhurta: abhijit,
      summary,
    };
  } catch (err) {
    if (err instanceof PanchangError) throw err;
    throw new PanchangError("CALCULATION_FAILED", "Panchang calculation failed.", 500);
  }
  return result;
}

