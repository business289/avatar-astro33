export interface LocalTime {
  /** UTC instant, ISO-8601 with "Z". */
  iso: string;
  /** Wall-clock time at the location, "YYYY-MM-DDTHH:mm:ss" (no offset). */
  local: string;
  /** Local calendar date, "YYYY-MM-DD". */
  date: string;
  /** Local time of day, "HH:mm:ss". */
  time: string;
  /** Whole local days between this instant's local date and the requested date. */
  dayOffset: number;
}

export interface TimeRange {
  start: LocalTime;
  end: LocalTime;
}

export interface PanchangSegment {
  /** 1-based index within the element's cycle (tithi 1-30, nakshatra 1-27, ...). */
  number: number;
  name: string;
  startsAt: LocalTime;
  endsAt: LocalTime;
  /** True for the single segment that is running at sunrise. */
  atSunrise: boolean;
}

export interface TithiSegment extends PanchangSegment {
  paksha: "Shukla" | "Krishna";
  /** 1-15 within the paksha. */
  pakshaNumber: number;
}

export interface NakshatraSegment extends PanchangSegment {
  lord: string;
}

export interface PanchangLocation {
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface PanchangResult {
  date: string;
  location: PanchangLocation;
  /** UTC offset in minutes at the moment of sunrise. */
  utcOffsetMinutes: number;
  calculation: {
    engine: string;
    ayanamsa: "Lahiri";
    ayanamsaDegrees: number;
    lunarMonthSystem: "Amanta";
  };
  sun: {
    sunrise: LocalTime;
    sunset: LocalTime;
    nextSunrise: LocalTime;
    dayLengthMinutes: number;
  };
  vara: { number: number; name: string; sanskritName: string; lord: string };
  lunarMonth: { name: string; adhika: boolean };
  /** Every element lists the segment running at sunrise first, then any that begin before the next sunrise. */
  tithi: TithiSegment[];
  nakshatra: NakshatraSegment[];
  yoga: PanchangSegment[];
  karana: PanchangSegment[];
  rahuKalam: TimeRange;
  yamaganda: TimeRange;
  gulika: TimeRange;
  abhijitMuhurta: TimeRange & { note?: string };
  summary: string;
}

export type PanchangErrorCode =
  | "INVALID_DATE"
  | "INVALID_LOCATION"
  | "DATE_OUT_OF_RANGE"
  | "NO_SUNRISE"
  | "SEARCH_BUSY"
  | "CALCULATION_FAILED";

export class PanchangError extends Error {
  code: PanchangErrorCode;
  statusCode: number;
  constructor(code: PanchangErrorCode, message: string, statusCode = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, PanchangError.prototype);
  }
}
