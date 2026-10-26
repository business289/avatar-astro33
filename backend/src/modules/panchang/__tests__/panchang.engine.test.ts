import { describe, expect, it } from "vitest";
import { calculatePanchang } from "../panchang.engine.js";
import { elongation, lahiriMeanAyanamsa, moonSidereal, nutationInLongitude, trueAyanamsa, yogaAngle } from "../panchang.astro.js";
import { PanchangError, type LocalTime, type PanchangResult } from "../panchang.types.js";
import { REFERENCE_CASES, TOLERANCE_MINUTES } from "./reference.fixtures.js";

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Minutes since local midnight of the requested date, including day offset. */
const minutesOf = (t: LocalTime) => t.dayOffset * 1440 + toMinutes(t.time.slice(0, 5)) + Number(t.time.slice(6)) / 60;

/** Parses "HH:mm" or "HH:mm+1" into minutes since local midnight of the requested date. */
const refMinutes = (s: string) => {
  const [time, off] = s.split("+");
  return (off ? Number(off) * 1440 : 0) + (time ? toMinutes(time) : 0);
};

describe("reference Panchang comparison (Drik Panchang, Lahiri/Amanta)", () => {
  for (const ref of REFERENCE_CASES) {
    describe(ref.label, () => {
      const r = calculatePanchang({ date: ref.date, location: ref.location });

      it("sunrise and sunset", () => {
        expect(Math.abs(minutesOf(r.sun.sunrise) - refMinutes(ref.sunrise))).toBeLessThanOrEqual(TOLERANCE_MINUTES.sunTimes);
        expect(Math.abs(minutesOf(r.sun.sunset) - refMinutes(ref.sunset))).toBeLessThanOrEqual(TOLERANCE_MINUTES.sunTimes);
      });

      it("lunar month", () => {
        expect(r.lunarMonth).toEqual({ name: ref.lunarMonth, adhika: false });
      });

      for (const key of ["tithi", "nakshatra", "yoga", "karana"] as const) {
        it(`${key}: names and end times`, () => {
          const segs = r[key];
          const expected = ref[key];
          expect(segs.length).toBeGreaterThanOrEqual(expected.length);
          expected.forEach(([name, end], i) => {
            expect(segs[i].name).toBe(name);
            if (end === "+1") {
              // Reference only says "ends after the next sunrise".
              expect(minutesOf(segs[i].endsAt)).toBeGreaterThan(minutesOf(r.sun.nextSunrise) - 1);
            } else {
              expect(Math.abs(minutesOf(segs[i].endsAt) - refMinutes(end))).toBeLessThanOrEqual(TOLERANCE_MINUTES.transitions);
            }
          });
        });
      }

      it("Rahu Kalam, Yamaganda, Gulika", () => {
        for (const [got, want] of [
          [r.rahuKalam, ref.rahuKalam],
          [r.yamaganda, ref.yamaganda],
          [r.gulika, ref.gulika],
        ] as const) {
          expect(Math.abs(minutesOf(got.start) - refMinutes(want[0]))).toBeLessThanOrEqual(TOLERANCE_MINUTES.kalams);
          expect(Math.abs(minutesOf(got.end) - refMinutes(want[1]))).toBeLessThanOrEqual(TOLERANCE_MINUTES.kalams);
        }
      });

      it("Abhijit Muhurta", () => {
        if (ref.abhijit === null) {
          expect(r.abhijitMuhurta.note).toMatch(/Wednesday/);
          return;
        }
        expect(Math.abs(minutesOf(r.abhijitMuhurta.start) - refMinutes(ref.abhijit[0]))).toBeLessThanOrEqual(TOLERANCE_MINUTES.kalams);
        expect(Math.abs(minutesOf(r.abhijitMuhurta.end) - refMinutes(ref.abhijit[1]))).toBeLessThanOrEqual(TOLERANCE_MINUTES.kalams);
        expect(r.abhijitMuhurta.note).toBeUndefined();
      });
    });
  }
});

describe("independent consistency checks", () => {
  const delhi = { name: "New Delhi", latitude: 28.6139, longitude: 77.209, timezone: "Asia/Kolkata" };
  const r = calculatePanchang({ date: "2025-03-14", location: delhi });
  const ms = (t: LocalTime) => Date.parse(t.iso);
  const angleDiff = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

  it("every element has exactly one segment at sunrise, listed first", () => {
    for (const key of ["tithi", "nakshatra", "yoga", "karana"] as const) {
      const flags = r[key].map((s) => s.atSunrise);
      expect(flags.filter(Boolean)).toHaveLength(1);
      expect(flags[0]).toBe(true);
    }
  });

  it("segments are contiguous, ordered and start before the next sunrise", () => {
    for (const key of ["tithi", "nakshatra", "yoga", "karana"] as const) {
      const segs = r[key];
      segs.forEach((s, i) => {
        expect(ms(s.endsAt)).toBeGreaterThan(ms(s.startsAt));
        if (i > 0) {
          expect(s.startsAt.iso).toBe(segs[i - 1].endsAt.iso);
          expect(ms(s.startsAt)).toBeLessThan(ms(r.sun.nextSunrise));
        }
      });
      expect(ms(segs[0].startsAt)).toBeLessThanOrEqual(ms(r.sun.sunrise));
      expect(ms(segs[0].endsAt)).toBeGreaterThan(ms(r.sun.sunrise));
    }
  });

  it("end times sit on the astronomical boundary (to within seconds of arc)", () => {
    const tol = 0.01; // degrees; Moon moves ~0.55° per hour, so this is ~1 minute of time
    for (const s of r.tithi) expect(angleDiff(elongation(ms(s.endsAt)), (s.number * 12) % 360)).toBeLessThan(tol);
    for (const s of r.karana) expect(angleDiff(elongation(ms(s.endsAt)), (s.number * 6) % 360)).toBeLessThan(tol);
    for (const s of r.nakshatra) expect(angleDiff(moonSidereal(ms(s.endsAt)), (s.number * 360) / 27 % 360)).toBeLessThan(tol);
    for (const s of r.yoga) expect(angleDiff(yogaAngle(ms(s.endsAt)), (s.number * 360) / 27 % 360)).toBeLessThan(tol);
  });

  it("flags end times that fall on the following date", () => {
    const nak = r.nakshatra[0];
    expect(nak.endsAt.dayOffset).toBe(1);
    expect(nak.endsAt.date).toBe("2025-03-15");
    expect(r.tithi[0].endsAt.dayOffset).toBe(0);
  });

  it("paksha and tithi numbering", () => {
    expect(r.tithi[0]).toMatchObject({ number: 15, name: "Purnima", paksha: "Shukla", pakshaNumber: 15 });
    expect(r.tithi[1]).toMatchObject({ number: 16, name: "Pratipada", paksha: "Krishna", pakshaNumber: 1 });
  });

  it("kalams are consecutive eighths of the daylight period", () => {
    const eighth = (ms(r.sun.sunset) - ms(r.sun.sunrise)) / 8;
    for (const k of [r.rahuKalam, r.yamaganda, r.gulika]) {
      expect(Math.abs(ms(k.end) - ms(k.start) - eighth)).toBeLessThan(2000); // times are rounded to whole seconds
      expect(ms(k.start)).toBeGreaterThanOrEqual(ms(r.sun.sunrise) - 1000);
      expect(ms(k.end)).toBeLessThanOrEqual(ms(r.sun.sunset) + 1000);
    }
    // Friday: Rahu is the 4th eighth, Yamaganda the 7th, Gulika the 2nd.
    expect((ms(r.rahuKalam.start) - ms(r.sun.sunrise)) / eighth).toBeCloseTo(3, 1);
    expect((ms(r.yamaganda.start) - ms(r.sun.sunrise)) / eighth).toBeCloseTo(6, 1);
    expect((ms(r.gulika.start) - ms(r.sun.sunrise)) / eighth).toBeCloseTo(1, 1);
  });

  it("Abhijit is the middle fifteenth of the day", () => {
    const fifteenth = (ms(r.sun.sunset) - ms(r.sun.sunrise)) / 15;
    expect((ms(r.abhijitMuhurta.start) - ms(r.sun.sunrise)) / fifteenth).toBeCloseTo(7, 1);
    expect((ms(r.abhijitMuhurta.end) - ms(r.sun.sunrise)) / fifteenth).toBeCloseTo(8, 1);
  });

  it("vara follows the requested calendar date", () => {
    expect(r.vara).toMatchObject({ name: "Friday", lord: "Venus", number: 6 });
  });

  it("summary is built from the calculated values", () => {
    expect(r.summary).toContain("Purnima");
    expect(r.summary).toContain("Uttara Phalguni");
    expect(r.summary).toContain("Shula");
    expect(r.summary).toContain("Asia/Kolkata");
  });
});

describe("Lahiri ayanamsa", () => {
  it("matches the published value at J2000 (23°51'11\" true ayanamsa)", () => {
    const j2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
    expect(trueAyanamsa(j2000)).toBeCloseTo(23.85306, 2);
  });

  it("matches the defining epoch (1956-03-21: 23°15'00.658\" true)", () => {
    const epoch = Date.UTC(1956, 2, 21, 0, 0, 0);
    expect(lahiriMeanAyanamsa(epoch) + nutationInLongitude(epoch)).toBeCloseTo(23.250182778, 3);
  });

  it("grows by about 50.3 arcseconds per year", () => {
    const a = lahiriMeanAyanamsa(Date.UTC(2025, 0, 1));
    const b = lahiriMeanAyanamsa(Date.UTC(2026, 0, 1));
    expect((b - a) * 3600).toBeCloseTo(50.3, 0);
  });
});

describe("timezone handling", () => {
  const ny = { name: "New York", latitude: 40.7128, longitude: -74.006, timezone: "America/New_York" };

  it("uses the DST offset in force at sunrise (spring forward 2025-03-09)", () => {
    const r = calculatePanchang({ date: "2025-03-09", location: ny });
    expect(r.utcOffsetMinutes).toBe(-240);
    expect(r.sun.sunrise.time.slice(0, 2)).toBe("07"); // ~07:3x EDT; would read 06:3x if the pre-change EST offset were used
  });

  it("uses the standard offset after fall back (2025-11-02)", () => {
    const r = calculatePanchang({ date: "2025-11-02", location: ny });
    expect(r.utcOffsetMinutes).toBe(-300);
    expect(r.sun.sunrise.time.slice(0, 2)).toBe("06");
    expect(r.sun.sunrise.date).toBe("2025-11-02");
  });

  it("changing the location changes location-dependent timings", () => {
    const delhi = calculatePanchang({ date: "2025-10-21", location: { name: "Delhi", latitude: 28.6139, longitude: 77.209, timezone: "Asia/Kolkata" } });
    const nyc = calculatePanchang({ date: "2025-10-21", location: ny });
    expect(delhi.sun.sunrise.iso).not.toBe(nyc.sun.sunrise.iso);
    expect(delhi.rahuKalam.start.iso).not.toBe(nyc.rahuKalam.start.iso);
    expect(delhi.location.timezone).toBe("Asia/Kolkata");
  });

  it("changing the date changes date-dependent results", () => {
    const a = calculatePanchang({ date: "2025-10-21", location: ny });
    const b = calculatePanchang({ date: "2025-10-22", location: ny });
    expect(a.vara.name).toBe("Tuesday");
    expect(b.vara.name).toBe("Wednesday");
    expect(a.tithi[0].name).not.toBe(b.tithi[0].name);
  });

  it("a Date line / far-east timezone keeps sunrise on the requested local date", () => {
    const auckland = { name: "Auckland", latitude: -36.8485, longitude: 174.7633, timezone: "Pacific/Auckland" };
    const r = calculatePanchang({ date: "2025-06-15", location: auckland });
    expect(r.sun.sunrise.date).toBe("2025-06-15");
    expect(r.utcOffsetMinutes).toBe(720);
  });
});

describe("lunar month", () => {
  const delhi = { name: "Delhi", latitude: 28.6139, longitude: 77.209, timezone: "Asia/Kolkata" };

  it("flags the 2023 Adhika Shravana (18 Jul - 16 Aug 2023)", () => {
    const r = calculatePanchang({ date: "2023-08-01", location: delhi });
    expect(r.lunarMonth).toEqual({ name: "Shravana", adhika: true });
  });

  it("names the following Nija Shravana month normally", () => {
    const r = calculatePanchang({ date: "2023-08-25", location: delhi });
    expect(r.lunarMonth).toEqual({ name: "Shravana", adhika: false });
  });

  it("Chaitra begins at the Ugadi/Gudi Padwa new moon (30 Mar 2025)", () => {
    expect(calculatePanchang({ date: "2025-03-30", location: delhi }).lunarMonth.name).toBe("Chaitra");
    expect(calculatePanchang({ date: "2025-03-28", location: delhi }).lunarMonth.name).toBe("Phalguna");
  });
});

describe("failure modes", () => {
  it("reports no sunrise during the polar day", () => {
    const tromso = { name: "Tromsø", latitude: 69.6492, longitude: 18.9553, timezone: "Europe/Oslo" };
    try {
      calculatePanchang({ date: "2025-06-21", location: tromso });
      throw new Error("expected NO_SUNRISE");
    } catch (e) {
      expect(e).toBeInstanceOf(PanchangError);
      expect((e as PanchangError).code).toBe("NO_SUNRISE");
      expect((e as PanchangError).statusCode).toBe(422);
    }
  });

  it("wraps unexpected calculation failures as CALCULATION_FAILED", () => {
    const bad = { name: "x", latitude: 0, longitude: 0, timezone: "Not/AZone" };
    expect(() => calculatePanchang({ date: "2025-01-01", location: bad })).toThrowError(PanchangError);
  });
});

describe("response shape", () => {
  it("has every documented field with the right types", () => {
    const r: PanchangResult = calculatePanchang({
      date: "2025-10-21",
      location: { name: "Mumbai", latitude: 19.076, longitude: 72.8777, timezone: "Asia/Kolkata" },
    });
    expect(r).toMatchObject({
      date: "2025-10-21",
      location: { name: "Mumbai", timezone: "Asia/Kolkata" },
      utcOffsetMinutes: 330,
      calculation: { ayanamsa: "Lahiri", lunarMonthSystem: "Amanta" },
    });
    const lt = expect.objectContaining({ iso: expect.stringMatching(/Z$/), local: expect.any(String), dayOffset: expect.any(Number) });
    expect(r.sun).toMatchObject({ sunrise: lt, sunset: lt, nextSunrise: lt, dayLengthMinutes: expect.any(Number) });
    for (const k of [r.rahuKalam, r.yamaganda, r.gulika, r.abhijitMuhurta]) expect(k).toMatchObject({ start: lt, end: lt });
    expect(r.tithi[0]).toMatchObject({ number: expect.any(Number), name: expect.any(String), paksha: expect.any(String), startsAt: lt, endsAt: lt });
    expect(r.nakshatra[0].lord).toEqual(expect.any(String));
    expect(typeof r.summary).toBe("string");
  });
});
