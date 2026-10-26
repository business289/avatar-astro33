import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import express from "express";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("axios", () => ({ default: { get: vi.fn() } }));

import axios from "axios";
import panchangRoutes from "../panchang.route.js";
import { getPanchang } from "../panchang.service.js";
import { normalizeQuery, searchLocations } from "../location.service.js";
import { PanchangError } from "../panchang.types.js";

const codeOf = (fn: () => unknown): string | undefined => {
  try {
    fn();
  } catch (e) {
    return e instanceof PanchangError ? e.code : "UNEXPECTED";
  }
  return undefined;
};

describe("input validation", () => {
  const ok = { date: "2025-10-21", lat: "28.6139", lon: "77.2090" };

  it("accepts valid input", () => {
    expect(codeOf(() => getPanchang(ok))).toBeUndefined();
  });

  it.each([
    ["wrong format", { ...ok, date: "21-10-2025" }, "INVALID_DATE"],
    ["non-existent day", { ...ok, date: "2025-02-30" }, "INVALID_DATE"],
    ["month 13", { ...ok, date: "2025-13-01" }, "INVALID_DATE"],
    ["year too early", { ...ok, date: "1850-01-01" }, "DATE_OUT_OF_RANGE"],
    ["year too late", { ...ok, date: "2150-01-01" }, "DATE_OUT_OF_RANGE"],
    ["missing latitude", { date: ok.date, lon: ok.lon }, "INVALID_LOCATION"],
    ["missing longitude", { date: ok.date, lat: ok.lat }, "INVALID_LOCATION"],
    ["non-numeric latitude", { ...ok, lat: "abc" }, "INVALID_LOCATION"],
    ["empty latitude (would parse as 0)", { ...ok, lat: "" }, "INVALID_LOCATION"],
    ["latitude out of range", { ...ok, lat: "91" }, "INVALID_LOCATION"],
    ["longitude out of range", { ...ok, lon: "-181" }, "INVALID_LOCATION"],
  ])("rejects %s", (_label, query, code) => {
    expect(codeOf(() => getPanchang(query))).toBe(code);
  });
});

describe("default date and location behaviour", () => {
  afterEach(() => vi.useRealTimers());

  it("defaults the date to today at the selected place, not on the server", () => {
    vi.useFakeTimers();
    // 20:00 UTC on 13 Mar is already 14 Mar (01:30) in India but still 13 Mar (16:00) in New York.
    vi.setSystemTime(new Date("2025-03-13T20:00:00Z"));
    expect(getPanchang({ lat: "28.6139", lon: "77.209" }).date).toBe("2025-03-14");
    expect(getPanchang({ lat: "40.7128", lon: "-74.006" }).date).toBe("2025-03-13");
  });

  it("resolves the IANA timezone from the coordinates", () => {
    expect(getPanchang({ date: "2025-10-21", lat: "28.6139", lon: "77.209" }).location.timezone).toBe("Asia/Kolkata");
    expect(getPanchang({ date: "2025-10-21", lat: "51.5074", lon: "-0.1278" }).location.timezone).toBe("Europe/London");
  });

  it("uses the supplied name, or falls back to the coordinates", () => {
    expect(getPanchang({ date: "2025-10-21", lat: "19.076", lon: "72.8777", name: "  Mumbai  " }).location.name).toBe("Mumbai");
    expect(getPanchang({ date: "2025-10-21", lat: "19.076", lon: "72.8777" }).location.name).toBe("19.08, 72.88");
  });

  it("serves repeated identical requests from the cache", () => {
    const q = { date: "2025-10-21", lat: "19.0760", lon: "72.8777", name: "Mumbai" };
    expect(getPanchang(q)).toBe(getPanchang(q));
  });
});

describe("HTTP routes", () => {
  let server: Server;
  let base: string;

  beforeAll(async () => {
    const app = express();
    app.use("/api/panchang", panchangRoutes);
    server = app.listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/panchang`;
  });
  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  it("GET / returns the envelope with a typed Panchang payload", async () => {
    const res = await fetch(`${base}?date=2025-10-21&lat=19.076&lon=72.8777&name=Mumbai`);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.status).toBe(true);
    expect(body.data).toMatchObject({
      date: "2025-10-21",
      location: { name: "Mumbai", latitude: 19.076, longitude: 72.8777, timezone: "Asia/Kolkata" },
      calculation: { ayanamsa: "Lahiri" },
    });
    expect(body.data.tithi.length).toBeGreaterThan(0);
    expect(body.data.sun.sunrise.iso).toMatch(/Z$/);
  });

  it("GET / returns 400 with a code for invalid input", async () => {
    const res = await fetch(`${base}?date=2025-02-30&lat=19&lon=72`);
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body).toMatchObject({ status: false, data: { code: "INVALID_DATE" } });
  });

  it("GET / returns 422 when the Sun does not rise", async () => {
    const res = await fetch(`${base}?date=2025-06-21&lat=69.6492&lon=18.9553&name=Tromso`);
    const body = await res.json();
    expect(res.status).toBe(422);
    expect(body.data.code).toBe("NO_SUNRISE");
  });

  it("GET /locations rejects short queries before calling any geocoder", async () => {
    const get = vi.mocked(axios.get);
    get.mockClear();
    const res = await fetch(`${base}/locations?q=ab`);
    expect(res.status).toBe(400);
    expect(get).not.toHaveBeenCalled();
  });
});

describe("location search", () => {
  beforeEach(() => vi.mocked(axios.get).mockReset());

  it("normalises and validates the query", () => {
    expect(normalizeQuery("  new   delhi ")).toBe("new delhi");
    expect(() => normalizeQuery("ab")).toThrowError(PanchangError);
    expect(() => normalizeQuery(undefined)).toThrowError(PanchangError);
    expect(() => normalizeQuery("x".repeat(101))).toThrowError(PanchangError);
  });

  it("maps geocoder results, adds the IANA timezone, and caches repeat searches", async () => {
    const get = vi.mocked(axios.get);
    get.mockResolvedValue({
      data: [
        { display_name: "Pune, Maharashtra, India", lat: "18.5204", lon: "73.8567" },
        { display_name: "broken entry", lat: "nan", lon: "1" },
      ],
    });
    const first = await searchLocations("Pune");
    expect(first).toEqual([
      { name: "Pune, Maharashtra, India", latitude: 18.5204, longitude: 73.8567, timezone: "Asia/Kolkata" },
    ]);
    const second = await searchLocations("  pune ");
    expect(second).toBe(first);
    expect(get).toHaveBeenCalledTimes(1);
    expect(get.mock.calls[0][1]?.headers).toMatchObject({ "User-Agent": expect.any(String) });
  });

  it("reports a geocoder failure as a 502 without leaking details", async () => {
    const err = (await searchLocations("Nowhereville").catch((e: unknown) => e)) as PanchangError;
    expect(err).toBeInstanceOf(PanchangError);
    expect(err.statusCode).toBe(502);
    expect(err.message).not.toContain("secret-host");
  });
});
