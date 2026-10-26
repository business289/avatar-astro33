// Astronomical primitives. astronomy-engine supplies the Sun/Moon positions,
// sunrise/sunset and new-moon times; the Lahiri ayanamsa and nutation
// correction below are implemented here because the library has no sidereal
// support.
import * as Astronomy from "astronomy-engine";

const J2000_JD = 2451545.0;
const MS_PER_DAY = 86400000;
const UNIX_EPOCH_JD = 2440587.5;

/** Chitrapaksha (Lahiri) reference, as defined by the Indian Calendar Reform Committee. */
const LAHIRI_EPOCH_JD = 2435553.5; // 1956-03-21 00:00 UT
/** Mean (nutation-free) ayanamsa at the epoch above, in degrees: 23°15'00.658" minus 16.77" of nutation. */
const LAHIRI_EPOCH_MEAN_AYANAMSA = 23.245524743;

export const norm360 = (deg: number): number => ((deg % 360) + 360) % 360;

const jdOf = (ms: number): number => ms / MS_PER_DAY + UNIX_EPOCH_JD;

/** General precession in ecliptic longitude since J2000, arcseconds (IAU 2006), T in Julian centuries. */
const precessionArcsec = (T: number): number => 5028.796195 * T + 1.1054348 * T * T;

/** Mean Lahiri ayanamsa (degrees) at the given instant. */
export function lahiriMeanAyanamsa(ms: number): number {
  const T = (jdOf(ms) - J2000_JD) / 36525;
  const T0 = (LAHIRI_EPOCH_JD - J2000_JD) / 36525;
  return LAHIRI_EPOCH_MEAN_AYANAMSA + (precessionArcsec(T) - precessionArcsec(T0)) / 3600;
}

/** Nutation in longitude (degrees), Meeus ch.22 low-accuracy series (~0.5"). */
export function nutationInLongitude(ms: number): number {
  const T = (jdOf(ms) - J2000_JD) / 36525;
  const rad = Math.PI / 180;
  const omega = (125.04452 - 1934.136261 * T) * rad;
  const sunL = (280.4665 + 36000.7698 * T) * rad;
  const moonL = (218.3165 + 481267.8813 * T) * rad;
  const arcsec =
    -17.2 * Math.sin(omega) -
    1.32 * Math.sin(2 * sunL) -
    0.23 * Math.sin(2 * moonL) +
    0.21 * Math.sin(2 * omega);
  return arcsec / 3600;
}

/**
 * astronomy-engine reports longitudes on the true equinox of date, which
 * includes nutation. Sidereal = true tropical − (mean ayanamsa + nutation).
 */
export const trueAyanamsa = (ms: number): number => lahiriMeanAyanamsa(ms) + nutationInLongitude(ms);

/** Apparent geocentric tropical longitude of the Sun (true equinox of date). */
export const sunTropical = (ms: number): number => norm360(Astronomy.SunPosition(new Date(ms)).elon);

/** Geocentric tropical longitude of the Moon (true equinox of date). */
export const moonTropical = (ms: number): number => norm360(Astronomy.EclipticGeoMoon(new Date(ms)).lon);

export const sunSidereal = (ms: number): number => norm360(sunTropical(ms) - trueAyanamsa(ms));
export const moonSidereal = (ms: number): number => norm360(moonTropical(ms) - trueAyanamsa(ms));

/** Moon − Sun elongation in degrees [0, 360). Ayanamsa cancels, so tropical values are used. */
export const elongation = (ms: number): number => norm360(moonTropical(ms) - sunTropical(ms));

/** Sidereal Sun + Moon longitude in degrees [0, 360), the Yoga angle. */
export const yogaAngle = (ms: number): number => norm360(sunSidereal(ms) + moonSidereal(ms));

export interface RiseSet {
  sunriseMs: number;
  sunsetMs: number;
  nextSunriseMs: number;
}

/**
 * First sunrise at or after `searchFromMs`, the following sunset, and the
 * next sunrise. Standard convention: upper limb, with atmospheric refraction,
 * observer at sea level. Returns null when the Sun does not rise/set (polar).
 */
export function sunTimes(latitude: number, longitude: number, searchFromMs: number): RiseSet | null {
  const observer = new Astronomy.Observer(latitude, longitude, 0);
  const rise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, new Date(searchFromMs), 1.5);
  if (!rise) return null;
  const set = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, rise.date, 1.5);
  if (!set) return null;
  const next = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, new Date(rise.date.getTime() + 3600000), 2);
  if (!next) return null;
  return { sunriseMs: rise.date.getTime(), sunsetMs: set.date.getTime(), nextSunriseMs: next.date.getTime() };
}

/** The new moons immediately before and after `ms`. */
export function surroundingNewMoons(ms: number): { prevMs: number; nextMs: number } {
  let cursor = ms - 35 * MS_PER_DAY;
  let prev = NaN;
  for (let i = 0; i < 4; i++) {
    const t = Astronomy.SearchMoonPhase(0, new Date(cursor), 35);
    if (!t) break;
    const tm = t.date.getTime();
    if (tm > ms) {
      if (Number.isNaN(prev)) break;
      return { prevMs: prev, nextMs: tm };
    }
    prev = tm;
    cursor = tm + MS_PER_DAY;
  }
  throw new Error("Could not bracket the new moon");
}
