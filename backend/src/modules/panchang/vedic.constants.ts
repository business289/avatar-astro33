// Vedic Panchang names and tables. No calculation happens here.

/** 14 shared names; the 15th is Purnima (Shukla) or Amavasya (Krishna). */
export const TITHI_NAMES = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi",
] as const;

export const NAKSHATRAS: ReadonlyArray<{ name: string; lord: string }> = [
  { name: "Ashwini", lord: "Ketu" }, { name: "Bharani", lord: "Venus" },
  { name: "Krittika", lord: "Sun" }, { name: "Rohini", lord: "Moon" },
  { name: "Mrigashira", lord: "Mars" }, { name: "Ardra", lord: "Rahu" },
  { name: "Punarvasu", lord: "Jupiter" }, { name: "Pushya", lord: "Saturn" },
  { name: "Ashlesha", lord: "Mercury" }, { name: "Magha", lord: "Ketu" },
  { name: "Purva Phalguni", lord: "Venus" }, { name: "Uttara Phalguni", lord: "Sun" },
  { name: "Hasta", lord: "Moon" }, { name: "Chitra", lord: "Mars" },
  { name: "Swati", lord: "Rahu" }, { name: "Vishakha", lord: "Jupiter" },
  { name: "Anuradha", lord: "Saturn" }, { name: "Jyeshtha", lord: "Mercury" },
  { name: "Mula", lord: "Ketu" }, { name: "Purva Ashadha", lord: "Venus" },
  { name: "Uttara Ashadha", lord: "Sun" }, { name: "Shravana", lord: "Moon" },
  { name: "Dhanishta", lord: "Mars" }, { name: "Shatabhisha", lord: "Rahu" },
  { name: "Purva Bhadrapada", lord: "Jupiter" }, { name: "Uttara Bhadrapada", lord: "Saturn" },
  { name: "Revati", lord: "Mercury" },
];

export const YOGA_NAMES = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
  "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata",
  "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva",
  "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti",
] as const;

/** The seven repeating (chara) karanas, cycled eight times. */
export const MOVABLE_KARANAS = [
  "Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti",
] as const;

/** Half-tithi index 0..59 (counted from the new moon) -> karana name. */
export function karanaName(index: number): string {
  if (index === 0) return "Kinstughna";
  if (index === 57) return "Shakuni";
  if (index === 58) return "Chatushpada";
  if (index === 59) return "Nagava";
  return MOVABLE_KARANAS[(index - 1) % 7];
}

/** Index 0 = Sunday, matching Date#getUTCDay(). */
export const VARAS: ReadonlyArray<{ name: string; sanskrit: string; lord: string }> = [
  { name: "Sunday", sanskrit: "Ravivara", lord: "Sun" },
  { name: "Monday", sanskrit: "Somavara", lord: "Moon" },
  { name: "Tuesday", sanskrit: "Mangalavara", lord: "Mars" },
  { name: "Wednesday", sanskrit: "Budhavara", lord: "Mercury" },
  { name: "Thursday", sanskrit: "Guruvara", lord: "Jupiter" },
  { name: "Friday", sanskrit: "Shukravara", lord: "Venus" },
  { name: "Saturday", sanskrit: "Shanivara", lord: "Saturn" },
];

/**
 * Which eighth of the daylight period (1 = first, counted from sunrise) is the
 * inauspicious one, by weekday (index 0 = Sunday).
 */
export const RAHU_KALAM_PART = [8, 2, 7, 5, 6, 4, 3] as const;
export const YAMAGANDA_PART = [5, 4, 3, 2, 1, 7, 6] as const;
export const GULIKA_PART = [7, 6, 5, 4, 3, 2, 1] as const;

/** Amanta month, named for the sidereal sign (index 0 = Mesha) the Sun enters during it. */
export const LUNAR_MONTH_BY_SOLAR_SIGN = [
  "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada",
  "Ashwina", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna",
] as const;
