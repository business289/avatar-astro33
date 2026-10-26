// Published reference values, transcribed from Drik Panchang day pages
// (https://www.drikpanchang.com/panchang/day-panchang.html?geoname-id=<id>&date=DD/MM/YYYY),
// retrieved 2026-10-15. Drik uses Lahiri ayanamsa, sunrise-to-sunrise Vara and
// Amanta months, i.e. the same conventions as the engine. Times are local wall
// time "HH:mm" at the place, as printed; "+1" means the printed time was on the
// following date. Drik prints minutes only and appears to truncate seconds, so
// tests allow a tolerance (see TOLERANCE_MINUTES) instead of exact equality.

export interface ReferenceCase {
  label: string;
  source: string;
  date: string;
  location: { name: string; latitude: number; longitude: number; timezone: string };
  sunrise: string;
  sunset: string;
  lunarMonth: string;
  /** Element at sunrise followed by the next one(s) that start before the next sunrise, with end times. */
  tithi: Array<[name: string, end: string]>;
  nakshatra: Array<[name: string, end: string]>;
  yoga: Array<[name: string, end: string]>;
  karana: Array<[name: string, end: string]>;
  rahuKalam: [string, string];
  yamaganda: [string, string];
  gulika: [string, string];
  abhijit: [string, string] | null;
}

export const TOLERANCE_MINUTES = {
  sunTimes: 1,
  kalams: 1,
  transitions: 2,
};

export const REFERENCE_CASES: ReferenceCase[] = [
  {
    label: "New Delhi, Friday (Holi Purnima)",
    source: "drikpanchang.com geoname-id=1261481 date=14/03/2025",
    date: "2025-03-14",
    location: { name: "New Delhi", latitude: 28.6139, longitude: 77.209, timezone: "Asia/Kolkata" },
    sunrise: "06:32",
    sunset: "18:29",
    lunarMonth: "Phalguna",
    tithi: [["Purnima", "12:23"]],
    nakshatra: [["Uttara Phalguni", "+1"]], // Drik prints "Full Night": ends after the next sunrise
    yoga: [["Shula", "13:24"]],
    karana: [["Bava", "12:23"]],
    rahuKalam: ["11:01", "12:30"],
    yamaganda: ["15:30", "16:59"],
    gulika: ["08:02", "09:31"],
    abhijit: ["12:07", "12:54"],
  },
  {
    label: "New York, Tuesday (Amavasya, EDT)",
    source: "drikpanchang.com geoname-id=5128581 date=21/10/2025",
    date: "2025-10-21",
    location: { name: "New York", latitude: 40.7128, longitude: -74.006, timezone: "America/New_York" },
    sunrise: "07:14",
    sunset: "18:06",
    lunarMonth: "Ashwina",
    tithi: [["Amavasya", "08:24"]],
    nakshatra: [["Chitra", "13:29"]],
    yoga: [["Vishkambha", "17:47"]],
    karana: [["Nagava", "08:24"], ["Kinstughna", "21:34"]],
    rahuKalam: ["15:23", "16:45"],
    yamaganda: ["09:57", "11:19"],
    gulika: ["12:40", "14:02"],
    abhijit: ["12:19", "13:02"],
  },
  {
    label: "Sydney, Monday (southern hemisphere, AEDT)",
    source: "drikpanchang.com geoname-id=2147714 date=05/01/2026",
    date: "2026-01-05",
    location: { name: "Sydney", latitude: -33.8688, longitude: 151.2093, timezone: "Australia/Sydney" },
    sunrise: "05:51",
    sunset: "20:10",
    lunarMonth: "Pausha",
    tithi: [["Dwitiya", "15:26"]],
    nakshatra: [["Pushya", "18:55"]],
    yoga: [["Vaidhriti", "07:17"], ["Vishkambha", "04:17+1"]],
    karana: [["Garaja", "15:26"], ["Vanija", "02:23+1"]],
    rahuKalam: ["07:38", "09:26"],
    yamaganda: ["11:13", "13:00"],
    gulika: ["14:48", "16:35"],
    abhijit: ["12:32", "13:29"],
  },
  {
    label: "Mumbai, Wednesday (end times after midnight)",
    source: "drikpanchang.com geoname-id=1275339 date=20/08/2025",
    date: "2025-08-20",
    location: { name: "Mumbai", latitude: 19.076, longitude: 72.8777, timezone: "Asia/Kolkata" },
    sunrise: "06:21",
    sunset: "19:03",
    lunarMonth: "Shravana",
    tithi: [["Dwadashi", "13:58"]],
    nakshatra: [["Punarvasu", "00:27+1"]],
    yoga: [["Siddhi", "18:13"]],
    karana: [["Taitila", "13:58"], ["Garaja", "01:18+1"]],
    rahuKalam: ["12:42", "14:17"],
    yamaganda: ["07:56", "09:31"],
    gulika: ["11:06", "12:42"],
    // Drik prints "None" for Abhijit on Wednesdays; the engine reports the range with a note instead.
    abhijit: null,
  },
  {
    label: "Pune, Thursday (Shukla Panchami during Sharad Navratri)",
    source: "drikpanchang.com geoname-id=1259229 date=15/10/2026 (retrieved during QA, 2026-10-15)",
    date: "2026-10-15",
    location: { name: "Pune", latitude: 18.5204, longitude: 73.8567, timezone: "Asia/Kolkata" },
    sunrise: "06:28",
    sunset: "18:12",
    lunarMonth: "Ashwina",
    tithi: [["Panchami", "03:25+1"]],
    nakshatra: [["Jyeshtha", "+1"]], // Drik prints "Full Night"
    yoga: [["Saubhagya", "21:15"]],
    karana: [["Bava", "14:16"], ["Balava", "03:25+1"]],
    rahuKalam: ["13:48", "15:16"],
    yamaganda: ["06:28", "07:56"],
    gulika: ["09:24", "10:52"],
    abhijit: ["11:57", "12:44"],
  },
];
