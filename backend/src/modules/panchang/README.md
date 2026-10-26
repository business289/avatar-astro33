# Today's Panchang — calculation method

Deterministic, no LLM and no paid provider. `astronomy-engine` supplies astronomy
(Sun/Moon positions, sunrise/sunset, new moons). Everything Vedic (ayanamsa,
Tithi/Nakshatra/Yoga/Karana, Kalams, Abhijit, lunar month) is implemented in this
module, because the library has no sidereal or Panchang support.

## API

`GET /api/panchang?date=YYYY-MM-DD&lat=<deg>&lon=<deg>&name=<label>`

- `date` is optional; when omitted it is **today at the place** (in the place's timezone, not the server's).
- Timezone is resolved on the server from the coordinates with `tz-lookup` (IANA). It is never taken from the client.
- Valid range: years 1900–2100, latitude ±90, longitude ±180.
- Response envelope is the repo-standard `{ status, data, message }`. Errors carry `data.code`:
  `INVALID_DATE`, `DATE_OUT_OF_RANGE`, `INVALID_LOCATION` (400), `NO_SUNRISE` (422), `CALCULATION_FAILED` (500).
- Results are cached in memory for 24 h per (date, rounded coordinates, name). Rate limit: 60 requests/min/IP.

`GET /api/panchang/locations?q=<text>` — place search behind the backend (Nominatim / OpenStreetMap).
At least 3 characters; results cached 24 h; upstream calls serialised and spaced ≥ 1.1 s
(Nominatim's usage policy); 30 requests/min/IP. Each result carries name, latitude, longitude and IANA timezone.
Set `GEOCODER_URL` / `GEOCODER_USER_AGENT` to use a different geocoder or to identify your deployment (add a contact address to the User-Agent).
Upstream pacing is process-wide (not per IP). At most 8 searches may wait for their turn; further ones get `503 SEARCH_BUSY`.

**Nominatim caveat:** the public instance's usage policy discourages search-as-you-type use. The 500 ms debounce, 3-character minimum, caching and global pacing keep traffic low, but for sustained production traffic point `GEOCODER_URL` at a hosted geocoder or your own instance.

## Conventions

| Item | Convention |
|---|---|
| Ayanamsa | Lahiri (Chitrapaksha). Mean value 23.245524743° at 1956-03-21 0h UT (23°15′00.658″ true, less 16.77″ nutation), advanced with IAU 2006 general precession (5028.796195″T + 1.1054348″T², T in Julian centuries from J2000). True ayanamsa = mean + nutation in longitude (Meeus 22 low-accuracy series, ≈0.5″). Value at J2000 = 23°51′11″. |
| Longitudes | Sun: `SunPosition().elon`; Moon: `EclipticGeoMoon().lon` — both true equinox of date. Sidereal = tropical − true ayanamsa. |
| Day | Local calendar date at the place. Sunrise = first sunrise after local midnight (must fall on that date, else `NO_SUNRISE`). |
| Sunrise / sunset | Upper limb with standard refraction, sea level (`SearchRiseSet`). |
| Vara | Weekday of the requested local date; the Hindu day runs sunrise → next sunrise. |
| Tithi | `floor(elongation / 12°) + 1`, elongation = (Moon − Sun) mod 360. 1–15 Shukla (15 = Purnima), 16–30 Krishna (30 = Amavasya). |
| Karana | Half-tithi, `k = floor(elongation / 6°)`, 0–59. k=0 Kinstughna; k=1…56 cycle Bava, Balava, Kaulava, Taitila, Garaja, Vanija, Vishti ×8; k=57 Shakuni, 58 Chatushpada, 59 Nagava. |
| Nakshatra | `floor(sidereal Moon / 13°20′) + 1`. |
| Yoga | `floor(((sidereal Sun + sidereal Moon) mod 360) / 13°20′) + 1`. |
| Transitions | Each element is listed as the segment running **at sunrise**, followed by every segment that begins before the next sunrise. Boundaries are found by scanning in 30-minute steps and bisecting to ±0.25 s; times are rounded to whole seconds. Start times may fall on the previous date; end times on the next (`dayOffset`). |
| Rahu Kalam / Yamaganda / Gulika | Daylight (sunrise→sunset) split into 8 equal parts; the part number by weekday (Sun…Sat): Rahu 8,2,7,5,6,4,3 · Yamaganda 5,4,3,2,1,7,6 · Gulika 7,6,5,4,3,2,1. |
| Abhijit Muhurta | Daylight split into 15 parts; the 8th (middle) part. On Wednesdays the range is still returned but flagged, since it is traditionally not observed. |
| Lunar month | Amanta (month ends at new moon). Named for the sidereal sign the Sun enters during the month (Mesha→Chaitra … Meena→Phalguna). If the Sun enters no sign between the bounding new moons the month is **Adhika** and takes the name of the following month. |
| Time zones | Wall times come from Intl/IANA rules per instant (DST aware), never a fixed offset. A local-midnight that does not exist (DST gap) resolves to the instant after the gap. |

## Reference comparison

`__tests__/reference.fixtures.ts` holds values published by Drik Panchang (Lahiri, Amanta, sunrise-based)
for New Delhi 2025-03-14, New York 2025-10-21, Sydney 2026-01-05, Mumbai 2025-08-20 and Pune 2026-10-15, and
`panchang.engine.test.ts` compares the engine against them. Observed agreement:

- Sunrise, sunset, Rahu/Yamaganda/Gulika and Abhijit: within 1 minute (Drik prints whole minutes).
- Tithi, Nakshatra, Yoga and Karana end times: within 2 minutes. Typically < 1 minute; the largest
  deviations seen were Tithi end times for Delhi 2025-03-14 (+1.6 min) and New York 2025-10-21 (+1.1 min).
  Drik prints minutes only and appears to truncate seconds, which accounts for part of this.
- Names, Paksha, Amanta month and which segments occur before the next sunrise match in all four cases.
- Naming differences vs. some almanacs are spelling only (Drik spellings are used: Garaja, Nagava, Kinstughna, Ashwina).

The other tests check the engine independently of any published table: every end time lies on its
astronomical boundary (elongation = n·12°, etc.), segments are contiguous, the ayanamsa matches its
defining epoch and J2000 value, DST/zone behaviour, Adhika Shravana 2023, and failure modes.

## Known limitations

- Moon position comes from astronomy-engine's lunar series; expect end times to differ by up to ~2 minutes from
  almanacs based on Swiss Ephemeris. Transitions near a minute boundary may round differently.
- Kshaya months and Kshaya/Vriddhi tithi naming for festival dates are not modelled; only the astronomical segments are reported.
- Polar day/night (no sunrise or sunset) returns `NO_SUNRISE`; no alternative convention is substituted.
- Sunrise uses sea level; elevation is not applied. Some almanacs use geometric/disc-centre sunrise, which shifts sunrise-based
  timings (Kalams, Abhijit) by a minute or so.
- Years outside 1900–2100 are rejected rather than extrapolated.
- The page shows times truncated to the minute (06:20:53 -> 6:20 AM). Drik Panchang appears to round sunrise, sunset and the Kalams, so those can read 1 minute earlier than Drik. Browser QA against five cities showed no larger difference.
