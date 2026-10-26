import { useEffect, useId, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MapPin, Search } from "lucide-react";
import { searchPlaces } from "@/lib/panchangApi";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { PanchangPlace } from "@/types/panchang";

export const MIN_SEARCH_CHARS = 3;
export const SEARCH_DEBOUNCE_MS = 500;

interface LocationSearchProps {
  place: PanchangPlace;
  onSelect: (place: PanchangPlace) => void;
}

const LocationSearch = ({ place, onSelect }: LocationSearchProps) => {
  const listId = useId();
  const [text, setText] = useState(place.name);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Keep the box in sync when the place is changed from outside.
  useEffect(() => setText(place.name), [place.name]);

  const query = useDebouncedValue(text.trim(), SEARCH_DEBOUNCE_MS);
  const searching = open && query.length >= MIN_SEARCH_CHARS && query !== place.name;

  const { data, isFetching, isError, error } = useQuery({
    queryKey: ["panchang-places", query.toLowerCase()],
    queryFn: ({ signal }) => searchPlaces(query, signal),
    enabled: searching,
    staleTime: 24 * 3600 * 1000,
    retry: false,
  });

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const typedEnough = text.trim().length >= MIN_SEARCH_CHARS;
  const waiting = typedEnough && text.trim() !== query; // debounce still pending

  return (
    <div ref={wrapRef} className="relative">
      <label htmlFor={`${listId}-input`} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
        Location
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C7A46A]" aria-hidden />
        <input
          id={`${listId}-input`}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          value={text}
          placeholder="Search a city or town"
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
          }}
          onFocus={(e) => {
            e.currentTarget.select();
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
          className="w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-10 pr-10 text-sm text-white placeholder:text-white/35 focus:border-[#C7A46A]/70 focus:outline-none focus:ring-2 focus:ring-[#C7A46A]/30"
        />
        {(isFetching || waiting) && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-white/50" aria-label="Searching" />
        )}
      </div>

      {open && text.trim() !== place.name && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-white/15 bg-[#0b1426]/95 p-1 shadow-2xl backdrop-blur"
        >
          {!typedEnough && (
            <li className="px-3 py-2 text-sm text-white/50">Type at least {MIN_SEARCH_CHARS} characters to search.</li>
          )}
          {typedEnough && isError && (
            <li role="alert" className="px-3 py-2 text-sm text-red-300">
              {error instanceof Error ? error.message : "Location search failed."}
            </li>
          )}
          {searching && !isError && data && data.length === 0 && (
            <li className="px-3 py-2 text-sm text-white/60">No places found for “{query}”. Try a nearby city.</li>
          )}
          {searching &&
            data?.map((p) => (
              <li key={`${p.latitude},${p.longitude},${p.name}`} role="option" aria-selected={false}>
                <button
                  type="button"
                  className="flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm text-white/85 hover:bg-[#C7A46A]/15 focus:bg-[#C7A46A]/15 focus:outline-none"
                  onClick={() => {
                    onSelect(p);
                    setText(p.name);
                    setOpen(false);
                  }}
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#C7A46A]" aria-hidden />
                  <span>
                    {p.name}
                    <span className="block text-xs text-white/40">{p.timezone}</span>
                  </span>
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default LocationSearch;
