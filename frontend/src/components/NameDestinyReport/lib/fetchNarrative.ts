import { API_BASE_URL } from "@/lib/api";
import type { NameProfileScore, NameVariant } from "@/lib/numerology";
import type { NarrativeResponse } from "../types";

export async function fetchNameNarrative(
  name: string,
  dob: string,
  zodiac: string,
  profile: NameProfileScore,
  topVariant?: NameVariant
): Promise<NarrativeResponse> {
  const res = await fetch(`${API_BASE_URL}/name-analysis/narrative`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      dob,
      zodiac,
      lifePath: profile.lifePath,
      destiny: profile.destiny,
      soulUrge: profile.soulUrge,
      personality: profile.personality,
      chaldean: profile.chaldean,
      lifePathPlanet: profile.lifePathPlanet,
      destinyPlanet: profile.destinyPlanet,
      overallScore: profile.overallScore,
      topVariant: topVariant
        ? { spelling: topVariant.spelling, score: topVariant.score, planet: topVariant.planet }
        : undefined,
    }),
  });
  if (!res.ok) throw new Error("Failed to fetch name narrative");
  return res.json();
}
