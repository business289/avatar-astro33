import { describe, expect, it, vi } from "vitest";

// A geocoder that never answers keeps every accepted search occupying the queue.
vi.mock("axios", () => ({ default: { get: vi.fn(() => new Promise(() => undefined)) } }));

import axios from "axios";
import { MAX_PENDING_SEARCHES, searchLocations } from "../location.service.js";
import { PanchangError } from "../panchang.types.js";

describe("location search load shedding", () => {
  it("rejects with 503 once too many searches are waiting, instead of queueing without limit", async () => {
    const accepted = Array.from({ length: MAX_PENDING_SEARCHES }, (_, i) => {
      const p = searchLocations(`place number ${i}`);
      p.catch(() => undefined);
      return p;
    });
    const err = await searchLocations("one search too many").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(PanchangError);
    expect((err as PanchangError).statusCode).toBe(503);
    expect((err as PanchangError).code).toBe("SEARCH_BUSY");
    expect(accepted).toHaveLength(MAX_PENDING_SEARCHES);
    // Only the first accepted search can have reached the (hung) geocoder: calls stay serialised.
    await new Promise((r) => setTimeout(r, 50));
    expect(vi.mocked(axios.get)).toHaveBeenCalledTimes(1);
  });

  it("an identical query shares the in-flight search instead of taking another slot", async () => {
    const a = searchLocations("place number 0");
    a.catch(() => undefined);
    const b = searchLocations("PLACE   number 0").catch((e: unknown) => e);
    expect(await Promise.race([b, Promise.resolve("still pending")])).toBe("still pending");
  });
});
