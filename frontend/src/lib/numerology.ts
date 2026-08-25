// ── Numerology engine ──────────────────────────────────────────────────────
// Pure, dependency-free functions. No React, no fetch — safe to call on
// every keystroke (e.g. the Name Evolution Lab playground) with zero cost.

export const CHALDEAN_MAP: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

export const PYTHAGOREAN_MAP: Record<string, number> = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9,
};

export const VOWELS = new Set(["A", "E", "I", "O", "U"]);
const MASTER_NUMBERS = new Set([11, 22, 33]);

function cleanName(name: string): string {
  return (name || "").toUpperCase().replace(/[^A-Z]/g, "");
}

function sumDigits(n: number): number {
  return String(Math.abs(n))
    .split("")
    .reduce((a, b) => a + Number(b), 0);
}

export function reduceNumber(n: number, keepMaster = true): number {
  let v = n;
  while (v > 9 && !(keepMaster && MASTER_NUMBERS.has(v))) {
    v = sumDigits(v);
  }
  return v;
}

function sumByMap(letters: string, map: Record<string, number>): number {
  return letters.split("").reduce((sum, ch) => sum + (map[ch] || 0), 0);
}

export function chaldeanNameNumber(name: string): number {
  const letters = cleanName(name);
  return reduceNumber(sumByMap(letters, CHALDEAN_MAP));
}

export function pythagoreanNameNumber(name: string): number {
  const letters = cleanName(name);
  return reduceNumber(sumByMap(letters, PYTHAGOREAN_MAP));
}

/** Expression / Destiny Number — Pythagorean sum of every letter in the full name. */
export function destinyNumber(fullName: string): number {
  return pythagoreanNameNumber(fullName);
}

/** Soul Urge / Heart's Desire Number — Pythagorean sum of vowels only. */
export function soulUrgeNumber(fullName: string): number {
  const letters = cleanName(fullName)
    .split("")
    .filter((ch) => VOWELS.has(ch))
    .join("");
  return reduceNumber(sumByMap(letters, PYTHAGOREAN_MAP));
}

/** Personality Number — Pythagorean sum of consonants only. */
export function personalityNumber(fullName: string): number {
  const letters = cleanName(fullName)
    .split("")
    .filter((ch) => !VOWELS.has(ch))
    .join("");
  return reduceNumber(sumByMap(letters, PYTHAGOREAN_MAP));
}

/**
 * Life Path Number from a YYYY-MM-DD date of birth.
 * Preserves master numbers (11/22/33), unlike the legacy `getLP` helper
 * in BirthChart.tsx which this supersedes for the Destiny Report feature.
 */
export function lifePathNumber(dob: string): number {
  const digits = (dob || "").replace(/[^0-9]/g, "");
  const total = digits.split("").reduce((a, b) => a + Number(b), 0);
  return reduceNumber(total);
}

/** Birth Number — day-of-month reduced, distinct from Life Path. */
export function birthNumber(dob: string): number {
  const parts = (dob || "").split("-");
  const day = Number(parts[2] || parts[0] || 0);
  return reduceNumber(day || 0);
}

/** Zodiac sign from a YYYY-MM-DD date of birth. */
export function zodiacFromDob(dob: string): string {
  const parts = (dob || "").split("-");
  const month = Number(parts[1] || 0);
  const day = Number(parts[2] || 0);
  const cutoffs: [string, number, number][] = [
    ["Capricorn", 1, 19], ["Aquarius", 2, 18], ["Pisces", 3, 20], ["Aries", 4, 19],
    ["Taurus", 5, 20], ["Gemini", 6, 20], ["Cancer", 7, 22], ["Leo", 8, 22],
    ["Virgo", 9, 22], ["Libra", 10, 22], ["Scorpio", 11, 21], ["Sagittarius", 12, 21],
    ["Capricorn", 12, 31],
  ];
  for (const [zodiac, cutoffMonth, cutoffDay] of cutoffs) {
    if (month < cutoffMonth || (month === cutoffMonth && day <= cutoffDay)) return zodiac;
  }
  return "Capricorn";
}

// ── Planet mapping ──────────────────────────────────────────────────────────

export interface PlanetInfo {
  planet: string;
  symbol: string;
}

export const PLANET_BY_NUMBER: Record<number, PlanetInfo> = {
  1: { planet: "Sun", symbol: "☉" },
  2: { planet: "Moon", symbol: "☽" },
  3: { planet: "Jupiter", symbol: "♃" },
  4: { planet: "Rahu", symbol: "☊" },
  5: { planet: "Mercury", symbol: "☿" },
  6: { planet: "Venus", symbol: "♀" },
  7: { planet: "Ketu", symbol: "☋" },
  8: { planet: "Saturn", symbol: "♄" },
  9: { planet: "Mars", symbol: "♂" },
  11: { planet: "Moon", symbol: "☽" },
  22: { planet: "Saturn", symbol: "♄" },
  33: { planet: "Jupiter", symbol: "♃" },
};

export function planetForNumber(n: number): PlanetInfo {
  if (PLANET_BY_NUMBER[n]) return PLANET_BY_NUMBER[n];
  const reduced = reduceNumber(n, false);
  return PLANET_BY_NUMBER[reduced] || { planet: "Sun", symbol: "☉" };
}

// ── Compatibility engine ────────────────────────────────────────────────────

export const PLANET_RELATIONSHIPS: Record<
  string,
  { friends: string[]; neutral: string[]; enemies: string[] }
> = {
  Sun: { friends: ["Moon", "Mars", "Jupiter"], neutral: ["Mercury"], enemies: ["Venus", "Saturn"] },
  Moon: { friends: ["Sun", "Mercury"], neutral: ["Mars", "Jupiter", "Venus", "Saturn"], enemies: [] },
  Mars: { friends: ["Sun", "Moon", "Jupiter"], neutral: ["Venus", "Saturn"], enemies: ["Mercury"] },
  Mercury: { friends: ["Sun", "Venus"], neutral: ["Mars", "Jupiter", "Saturn"], enemies: ["Moon"] },
  Jupiter: { friends: ["Sun", "Moon", "Mars"], neutral: ["Saturn"], enemies: ["Mercury", "Venus"] },
  Venus: { friends: ["Mercury", "Saturn"], neutral: ["Mars", "Jupiter"], enemies: ["Sun", "Moon"] },
  Saturn: { friends: ["Mercury", "Venus"], neutral: ["Jupiter"], enemies: ["Sun", "Moon", "Mars"] },
  Rahu: { friends: ["Mercury", "Venus", "Saturn"], neutral: ["Jupiter"], enemies: ["Sun", "Moon"] },
  Ketu: { friends: ["Mars", "Venus", "Saturn"], neutral: ["Mercury"], enemies: ["Sun", "Moon"] },
};

export interface CompatibilityResult {
  planet: string;
  score: number; // 0-100
  verdict: "friendly" | "neutral" | "friction";
  note: string;
}

export function planetCompatibility(destinyPlanet: string, otherPlanet: string): CompatibilityResult {
  const rel = PLANET_RELATIONSHIPS[destinyPlanet];
  let verdict: CompatibilityResult["verdict"] = "neutral";
  let score = 60;
  if (destinyPlanet === otherPlanet) {
    verdict = "friendly";
    score = 92;
  } else if (rel?.friends.includes(otherPlanet)) {
    verdict = "friendly";
    score = 82;
  } else if (rel?.enemies.includes(otherPlanet)) {
    verdict = "friction";
    score = 38;
  }
  const note =
    verdict === "friendly"
      ? `${otherPlanet} tends to support your ${destinyPlanet}-ruled energy.`
      : verdict === "friction"
      ? `${otherPlanet} may create some friction with your ${destinyPlanet}-ruled energy.`
      : `${otherPlanet} sits in a neutral relationship with your ${destinyPlanet}-ruled energy.`;
  return { planet: otherPlanet, score, verdict, note };
}

const REQUIRED_PLANETS = ["Sun", "Moon", "Mercury", "Venus", "Saturn", "Jupiter", "Mars"];

export interface NameProfileScore {
  destiny: number;
  soulUrge: number;
  personality: number;
  chaldean: number;
  lifePath: number;
  destinyPlanet: string;
  lifePathPlanet: string;
  overallScore: number; // 0-100
  planetCompat: CompatibilityResult[];
}

export function scoreNameAgainstProfile(name: string, dob: string): NameProfileScore {
  const destiny = destinyNumber(name);
  const soulUrge = soulUrgeNumber(name);
  const personality = personalityNumber(name);
  const chaldean = chaldeanNameNumber(name);
  const lifePath = lifePathNumber(dob);

  const destinyPlanet = planetForNumber(destiny).planet;
  const lifePathPlanet = planetForNumber(lifePath).planet;

  const planetCompat = REQUIRED_PLANETS.map((p) => planetCompatibility(destinyPlanet, p));

  // Weighted composite — tunable constants, not a black box.
  const lifePathCompat = planetCompatibility(destinyPlanet, lifePathPlanet).score; // 0-100
  const chaldeanFavorability = [1, 3, 5, 6].includes(chaldean) ? 90 : [2, 9].includes(chaldean) ? 55 : 70; // favorable/neutral/soft tiers
  const letters = cleanName(name);
  const vowelCount = letters.split("").filter((c) => VOWELS.has(c)).length;
  const balanceRatio = letters.length ? vowelCount / letters.length : 0.4;
  const balanceScore = 100 - Math.abs(balanceRatio - 0.4) * 150; // ideal ~40% vowels
  const syllablePenalty = letters.length > 14 ? -8 : letters.length > 10 ? -3 : 0;

  const overallScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        lifePathCompat * 0.4 +
          chaldeanFavorability * 0.3 +
          Math.max(0, Math.min(100, balanceScore)) * 0.2 +
          70 * 0.1 +
          syllablePenalty
      )
    )
  );

  return {
    destiny,
    soulUrge,
    personality,
    chaldean,
    lifePath,
    destinyPlanet,
    lifePathPlanet,
    overallScore,
    planetCompat,
  };
}

// ── Name-variant generator + ranking ────────────────────────────────────────

const FAVORABLE_LETTERS = ["A", "E", "H", "S", "R"]; // curated favorable-Chaldean-value letters

export function generateNameVariants(baseName: string, count = 12): string[] {
  const base = (baseName || "").trim();
  if (!base) return [];
  const variants = new Set<string>();
  const words = base.split(/\s+/);
  const firstWord = words[0];

  // Strategy: double a vowel/consonant at a few positions
  for (let i = 1; i < firstWord.length; i++) {
    const doubled = firstWord.slice(0, i) + firstWord[i] + firstWord.slice(i);
    variants.add([doubled, ...words.slice(1)].join(" "));
  }

  // Strategy: phonetic swaps
  const swaps: [RegExp, string][] = [
    [/k/gi, "c"],
    [/c/gi, "k"],
    [/i/gi, "y"],
    [/y/gi, "i"],
    [/s/gi, "z"],
    [/z/gi, "s"],
  ];
  for (const [pattern, replacement] of swaps) {
    if (pattern.test(firstWord)) {
      const swapped = firstWord.replace(pattern, replacement);
      if (swapped !== firstWord) variants.add([swapped, ...words.slice(1)].join(" "));
    }
  }

  // Strategy: append a favorable letter
  for (const letter of FAVORABLE_LETTERS) {
    variants.add([firstWord + letter.toLowerCase(), ...words.slice(1)].join(" "));
  }

  // Strategy: drop a trailing silent vowel / add one
  if (/[aeiou]$/i.test(firstWord)) {
    variants.add([firstWord.slice(0, -1), ...words.slice(1)].join(" "));
  } else {
    variants.add([firstWord + "a", ...words.slice(1)].join(" "));
  }

  variants.delete(base);
  return Array.from(variants).slice(0, count);
}

export interface NameVariant {
  spelling: string;
  score: number;
  deltas: { career: number; business: number; wealth: number; relationship: number };
  planet: string;
}

export function rankNameVariants(baseName: string, dob: string, variants?: string[]): NameVariant[] {
  const baseProfile = scoreNameAgainstProfile(baseName, dob);
  const candidates = variants && variants.length ? variants : generateNameVariants(baseName, 12);

  const ranked: NameVariant[] = candidates.map((spelling) => {
    const profile = scoreNameAgainstProfile(spelling, dob);
    const diff = profile.overallScore - baseProfile.overallScore;
    return {
      spelling,
      score: profile.overallScore,
      deltas: {
        career: Math.round(diff * 0.9),
        business: Math.round(diff * 1.1),
        wealth: Math.round(diff * 0.8),
        relationship: Math.round(diff * 0.6),
      },
      planet: profile.destinyPlanet,
    };
  });

  ranked.sort((a, b) => b.score - a.score);
  return ranked.slice(0, 5);
}

// ── Lucky attributes ─────────────────────────────────────────────────────────

export const LUCKY_COLOR_BY_NUMBER: Record<number, string[]> = {
  1: ["Gold", "Orange", "Amber"],
  2: ["Pearl White", "Silver"],
  3: ["Violet", "Lavender"],
  4: ["Electric Blue", "Grey"],
  5: ["Emerald Green", "Turquoise"],
  6: ["Rose Pink", "Ivory"],
  7: ["Sea Green", "Champagne"],
  8: ["Navy Blue", "Charcoal"],
  9: ["Crimson Red", "Coral"],
  11: ["Silver", "Moonlight Blue"],
  22: ["Slate Grey", "Deep Indigo"],
  33: ["Royal Purple", "Sapphire"],
};

export function luckyNumbers(destiny: number, lifePath: number): number[] {
  const combined = reduceNumber(destiny + lifePath, false);
  const nums = new Set<number>([destiny, lifePath, combined, reduceNumber(destiny * 2, false)]);
  return Array.from(nums).slice(0, 4);
}

export function luckyDates(lifePath: number): number[] {
  const base = lifePath === 0 ? 9 : lifePath;
  return [base, base + 9, base + 18, base + 27].filter((d) => d >= 1 && d <= 31);
}

export interface DigitalSuggestions {
  mobileLastDigit: number;
  usernamePattern: string;
  domainSuggestion: string;
}

export function digitalHandleSuggestions(name: string, destiny: number): DigitalSuggestions {
  const clean = cleanName(name).toLowerCase();
  const short = clean.slice(0, 8) || "yourname";
  return {
    mobileLastDigit: destiny,
    usernamePattern: `${short}${destiny}`,
    domainSuggestion: `${short}${destiny}.com`,
  };
}
