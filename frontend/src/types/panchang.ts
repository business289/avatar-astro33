// Mirrors backend/src/modules/panchang/panchang.types.ts (the API contract).

export interface LocalTime {
  iso: string;
  /** Wall-clock time at the location, "YYYY-MM-DDTHH:mm:ss". */
  local: string;
  date: string;
  /** "HH:mm:ss" */
  time: string;
  /** Local days between this time and the requested date (1 = next day). */
  dayOffset: number;
}

export interface TimeRange {
  start: LocalTime;
  end: LocalTime;
}

export interface PanchangSegment {
  number: number;
  name: string;
  startsAt: LocalTime;
  endsAt: LocalTime;
  atSunrise: boolean;
}

export interface TithiSegment extends PanchangSegment {
  paksha: "Shukla" | "Krishna";
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

export interface PanchangData {
  date: string;
  location: PanchangLocation;
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

/** A place chosen from the location search; the timezone is resolved by the backend. */
export interface PanchangPlace {
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
}
