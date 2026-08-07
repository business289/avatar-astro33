import { useEffect, useMemo, useState } from "react";
import {
  scoreNameAgainstProfile,
  rankNameVariants,
  luckyNumbers,
  luckyDates,
  digitalHandleSuggestions,
  LUCKY_COLOR_BY_NUMBER,
  type NameVariant,
} from "@/lib/numerology";
import { fetchNameNarrative } from "./lib/fetchNarrative";
import type { NarrativeResponse } from "./types";

export function useNameReport(name: string, dob: string, zodiac: string) {
  const profile = useMemo(() => scoreNameAgainstProfile(name, dob), [name, dob]);
  const topVariants = useMemo(() => rankNameVariants(name, dob), [name, dob]);
  const topVariant = topVariants[0];

  const lucky = useMemo(
    () => ({
      numbers: luckyNumbers(profile.destiny, profile.lifePath),
      dates: luckyDates(profile.lifePath),
      colors: LUCKY_COLOR_BY_NUMBER[profile.destiny] || LUCKY_COLOR_BY_NUMBER[1],
      digital: digitalHandleSuggestions(name, profile.destiny),
    }),
    [name, profile]
  );

  const [narrative, setNarrative] = useState<NarrativeResponse | null>(null);
  const [narrativeLoading, setNarrativeLoading] = useState(true);
  const [narrativeError, setNarrativeError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setNarrativeLoading(true);
    setNarrativeError(false);
    fetchNameNarrative(name, dob, zodiac, profile, topVariant)
      .then((res) => {
        if (!cancelled) setNarrative(res);
      })
      .catch(() => {
        if (!cancelled) setNarrativeError(true);
      })
      .finally(() => {
        if (!cancelled) setNarrativeLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, dob, zodiac]);

  // Name Evolution Lab playground state — local/ephemeral, no persistence.
  const [playgroundSpelling, setPlaygroundSpelling] = useState(name);
  const playgroundProfile = useMemo(
    () => (playgroundSpelling.trim() ? scoreNameAgainstProfile(playgroundSpelling, dob) : profile),
    [playgroundSpelling, dob, profile]
  );
  const [favorites, setFavorites] = useState<NameVariant[]>([]);
  function addFavorite(v: NameVariant) {
    setFavorites((prev) => (prev.find((f) => f.spelling === v.spelling) ? prev : [...prev, v]));
  }
  function removeFavorite(spelling: string) {
    setFavorites((prev) => prev.filter((f) => f.spelling !== spelling));
  }

  const [selectedAuraSpelling, setSelectedAuraSpelling] = useState(name);

  const [unlocked, setUnlocked] = useState(false);

  return {
    profile,
    topVariants,
    topVariant,
    lucky,
    narrative,
    narrativeLoading,
    narrativeError,
    playgroundSpelling,
    setPlaygroundSpelling,
    playgroundProfile,
    favorites,
    addFavorite,
    removeFavorite,
    selectedAuraSpelling,
    setSelectedAuraSpelling,
    unlocked,
    setUnlocked,
  };
}

export type UseNameReport = ReturnType<typeof useNameReport>;
