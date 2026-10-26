import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ChevronLeft, ChevronRight, Loader2, MapPin, RefreshCw } from "lucide-react";
import { DEFAULT_PLACE } from "@/components/panchang/defaultPlace";
import LocationSearch from "@/components/panchang/LocationSearch";
import PanchangResults from "@/components/panchang/PanchangResults";
import { fetchPanchang, PanchangApiError } from "@/lib/panchangApi";
import { addDays, formatLongDate, isSupportedDate, MAX_DATE, MIN_DATE } from "@/lib/panchangFormat";
import type { PanchangPlace } from "@/types/panchang";


const STORAGE_KEY = "panchang:place";

const isPlace = (v: unknown): v is PanchangPlace => {
  const p = v as PanchangPlace;
  return (
    !!p &&
    typeof p.name === "string" &&
    typeof p.timezone === "string" &&
    Number.isFinite(p.latitude) && Math.abs(p.latitude) <= 90 &&
    Number.isFinite(p.longitude) && Math.abs(p.longitude) <= 180
  );
};

function loadPlace(): PanchangPlace {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isPlace(parsed)) return parsed;
    }
  } catch {
    // storage unavailable or corrupt: fall back to the default
  }
  return DEFAULT_PLACE;
}

const friendlyError = (err: unknown): string => {
  if (err instanceof PanchangApiError) {
    if (err.code === "NO_SUNRISE") {
      return "The Sun does not rise and set at this location on this date (polar day or night), so a sunrise-based Panchang cannot be calculated. Try another location or date.";
    }
    return err.message;
  }
  return "Something went wrong while calculating the Panchang.";
};

const Panchang = () => {
  const [place, setPlace] = useState<PanchangPlace>(loadPlace);
  // null = "today at the selected place"; the server resolves it in the place's own timezone.
  const [date, setDate] = useState<string | null>(null);
  const [dateInput, setDateInput] = useState("");
  const dateValid = date === null || isSupportedDate(date);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(place));
    } catch {
      // ignore
    }
  }, [place]);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["panchang", date ?? "today", place.latitude, place.longitude, place.name],
    queryFn: ({ signal }) => fetchPanchang({ date: date ?? undefined, place }, signal),
    enabled: dateValid,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  // The date box shows the resolved date while in "today" mode.
  const shownDate = date ?? data?.date ?? dateInput;
  useEffect(() => setDateInput(shownDate), [shownDate]);

  const onDateChange = (value: string) => {
    setDateInput(value);
    setDate(value === "" ? "" : value);
  };

  const step = (days: number) => {
    const base = date && isSupportedDate(date) ? date : data?.date;
    if (!base) return;
    const next = addDays(base, days);
    if (isSupportedDate(next)) setDate(next);
  };

  const dateError =
    date !== null && !isSupportedDate(date)
      ? `Choose a valid date between ${MIN_DATE.slice(0, 4)} and ${MAX_DATE.slice(0, 4)}.`
      : null;

  return (
    <div className="relative z-10 min-h-screen pb-16 pt-24">
      <div className="container mx-auto max-w-5xl px-4">
        <header className="mb-8 text-center">
          <h1 className="font-heading text-4xl text-glow text-primary md:text-5xl">Today's Panchang</h1>
          <p className="mx-auto mt-3 max-w-2xl text-white/60">
            The five limbs of the Vedic almanac — Tithi, Vara, Nakshatra, Yoga and Karana — with sunrise, sunset and the
            day's key time windows, calculated for your location.
          </p>
        </header>

        <div
          className="mb-8 grid grid-cols-1 gap-4 rounded-2xl border border-[#C7A46A]/[0.18] p-5 md:grid-cols-[1fr_auto]"
          style={{ background: "linear-gradient(180deg, rgba(13,28,52,0.7) 0%, rgba(5,11,24,0.85) 100%)" }}
        >
          <LocationSearch place={place} onSelect={setPlace} />

          <div>
            <label htmlFor="panchang-date" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
              Date
            </label>
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto]">
              <button
                type="button"
                aria-label="Previous day"
                onClick={() => step(-1)}
                className="rounded-xl border border-white/15 p-3 text-white/80 hover:border-[#C7A46A]/60 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <input
                id="panchang-date"
                type="date"
                min={MIN_DATE}
                max={MAX_DATE}
                value={dateInput}
                onChange={(e) => onDateChange(e.target.value)}
                aria-invalid={!!dateError}
                className="min-w-0 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-sm text-white [color-scheme:dark] focus:border-[#C7A46A]/70 focus:outline-none focus:ring-2 focus:ring-[#C7A46A]/30"
              />
              <button
                type="button"
                aria-label="Next day"
                onClick={() => step(1)}
                className="rounded-xl border border-white/15 p-3 text-white/80 hover:border-[#C7A46A]/60 hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setDate(null)}
                disabled={date === null}
                className="col-span-3 rounded-xl sm:col-span-1 border border-[#C7A46A]/55 px-4 py-3 text-sm font-semibold text-[#C7A46A] hover:bg-[#C7A46A] hover:text-[#0b0f1a] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#C7A46A]"
              >
                Today
              </button>
            </div>
            {dateError && (
              <p role="alert" className="mt-2 text-sm text-red-300" data-testid="date-error">
                {dateError}
              </p>
            )}
          </div>
        </div>

        <p className="mb-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-white/80" data-testid="panchang-heading">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-[#C7A46A]" aria-hidden />
            {place.name}
          </span>
          {data && <span className="text-white/50">·</span>}
          {data && <span>{formatLongDate(data.date)}</span>}
          {isFetching && !isLoading && <Loader2 className="h-4 w-4 animate-spin text-white/50" aria-label="Updating" />}
        </p>

        {dateError ? null : isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Calculating Panchang" data-testid="panchang-loading">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
            ))}
          </div>
        ) : isError ? (
          <div role="alert" className="mx-auto max-w-xl rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-center" data-testid="panchang-error">
            <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-red-300" aria-hidden />
            <p className="text-white/90">{friendlyError(error)}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#C7A46A]/55 px-5 py-2 text-sm font-semibold text-[#C7A46A] hover:bg-[#C7A46A] hover:text-[#0b0f1a]"
            >
              <RefreshCw className="h-4 w-4" /> Try again
            </button>
          </div>
        ) : data ? (
          <PanchangResults data={data} />
        ) : null}
      </div>
    </div>
  );
};

export default Panchang;
