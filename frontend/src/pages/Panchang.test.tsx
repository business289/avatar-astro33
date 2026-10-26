import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import Panchang from "./Panchang";
import { DEFAULT_PLACE } from "@/components/panchang/defaultPlace";
import { makePanchang } from "@/test/panchangFixture";
import type { PanchangPlace } from "@/types/panchang";

const LONDON: PanchangPlace = { name: "London, England, United Kingdom", latitude: 51.5074, longitude: -0.1278, timezone: "Europe/London" };

type FetchCall = { path: string; params: URLSearchParams };
let calls: FetchCall[];

const envelope = (data: unknown, status = true, message = "") => ({ status, data, message });
const respond = (body: unknown, httpStatus = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status: httpStatus, headers: { "Content-Type": "application/json" } }));

/** Default fake backend: Panchang echoes the requested place/date; search returns London. */
function installFetch(handler?: (c: FetchCall) => Promise<Response> | undefined) {
  calls = [];
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string) => {
      const u = new URL(url);
      const call = { path: u.pathname.replace(/^.*\/api/, ""), params: u.searchParams };
      calls.push(call);
      const custom = handler?.(call);
      if (custom) return custom;
      if (call.path === "/panchang/locations") return respond(envelope([LONDON]));
      const place: PanchangPlace = {
        name: call.params.get("name") ?? "",
        latitude: Number(call.params.get("lat")),
        longitude: Number(call.params.get("lon")),
        timezone: call.params.get("lat") === String(LONDON.latitude) ? "Europe/London" : "Asia/Kolkata",
      };
      const date = call.params.get("date") ?? "2025-03-14";
      return respond(envelope(makePanchang(date, place, { utcOffsetMinutes: place.timezone === "Europe/London" ? 0 : 330 })));
    }),
  );
}

/** Simulates typing: one change event per character. */
const typeInto = (el: HTMLElement, text: string, from = "") => {
  for (let i = 1; i <= text.length; i++) fireEvent.change(el, { target: { value: from + text.slice(0, i) } });
};

const panchangCalls = () => calls.filter((c) => c.path === "/panchang");
const searchCalls = () => calls.filter((c) => c.path === "/panchang/locations");

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <Panchang />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  installFetch();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Panchang page: defaults", () => {
  it("loads today's Panchang for the default location without sending a date", async () => {
    renderPage();
    expect(screen.getByTestId("panchang-loading")).toBeInTheDocument();
    await screen.findByTestId("panchang-results");

    expect(panchangCalls()).toHaveLength(1);
    const p = panchangCalls()[0].params;
    expect(p.get("lat")).toBe(String(DEFAULT_PLACE.latitude));
    expect(p.get("lon")).toBe(String(DEFAULT_PLACE.longitude));
    expect(p.get("name")).toBe(DEFAULT_PLACE.name);
    expect(p.has("date")).toBe(false); // the server decides "today" in the place's own timezone

    expect(screen.getByTestId("panchang-heading")).toHaveTextContent("New Delhi, India");
    expect(screen.getByTestId("panchang-heading")).toHaveTextContent("Friday, 14 March 2025");
    expect(screen.getByLabelText("Date")).toHaveValue("2025-03-14");
  });

  it("restores the last chosen location from storage", async () => {
    localStorage.setItem("panchang:place", JSON.stringify(LONDON));
    renderPage();
    await screen.findByTestId("panchang-results");
    expect(panchangCalls()[0].params.get("lat")).toBe(String(LONDON.latitude));
  });

  it("ignores corrupt stored data", async () => {
    localStorage.setItem("panchang:place", "{not json");
    renderPage();
    await screen.findByTestId("panchang-results");
    expect(panchangCalls()[0].params.get("name")).toBe(DEFAULT_PLACE.name);
  });
});

describe("Panchang page: rendering", () => {
  it("shows the five elements, sun times and time windows with end times", async () => {
    renderPage();
    await screen.findByTestId("panchang-results");

    expect(within(screen.getByTestId("element-vara")).getByText("Friday")).toBeInTheDocument();

    const tithi = screen.getByTestId("element-tithi");
    expect(within(tithi).getByText("Purnima")).toBeInTheDocument();
    expect(tithi).toHaveTextContent("Shukla Paksha");
    expect(tithi).toHaveTextContent("12:24 PM");
    expect(tithi).toHaveTextContent("Then Pratipada until 2:33 PM, 15 Mar"); // ends on the following date

    const nak = screen.getByTestId("element-nakshatra");
    expect(nak).toHaveTextContent("Uttara Phalguni");
    expect(nak).toHaveTextContent("8:54 AM, 15 Mar");

    expect(screen.getByTestId("element-yoga")).toHaveTextContent("Shula");
    expect(screen.getByTestId("element-yoga")).toHaveTextContent("1:23 PM");
    expect(screen.getByTestId("element-karana")).toHaveTextContent("Bava");

    expect(screen.getByTestId("sunrise")).toHaveTextContent("6:32 AM");
    expect(screen.getByTestId("sunset")).toHaveTextContent("6:29 PM");
    expect(screen.getByTestId("rahu-kalam")).toHaveTextContent("11:00 AM – 12:30 PM");
    expect(screen.getByTestId("yamaganda")).toHaveTextContent("3:29 PM – 4:58 PM");
    expect(screen.getByTestId("gulika")).toHaveTextContent("8:02 AM – 9:31 AM");
    expect(screen.getByTestId("abhijit")).toHaveTextContent("12:06 PM – 12:54 PM");
    expect(screen.getByTestId("panchang-summary")).toHaveTextContent("Purnima Tithi at sunrise");
    expect(screen.getByTestId("method-note")).toHaveTextContent("Lahiri");
  });

  it("shows the place's own timezone, independent of the browser's", async () => {
    renderPage();
    await screen.findByTestId("panchang-results");
    expect(screen.getByTestId("timezone")).toHaveTextContent("Asia/Kolkata (UTC+05:30)");
  });

  it("shows the Wednesday note for Abhijit Muhurta", async () => {
    installFetch((c) => {
      if (c.path !== "/panchang") return undefined;
      const data = makePanchang("2025-08-20", DEFAULT_PLACE);
      data.abhijitMuhurta.note = "Abhijit Muhurta is traditionally not observed on Wednesdays.";
      return respond(envelope(data));
    });
    renderPage();
    await screen.findByTestId("panchang-results");
    expect(screen.getByTestId("abhijit")).toHaveTextContent("not observed on Wednesdays");
  });
});

describe("Panchang page: date changes", () => {
  it("recalculates for a chosen date", async () => {
    renderPage();
    await screen.findByTestId("panchang-results");
    fireEvent.change(screen.getByLabelText("Date"), { target: { value: "2025-10-21" } });

    await waitFor(() => expect(panchangCalls()).toHaveLength(2));
    expect(panchangCalls()[1].params.get("date")).toBe("2025-10-21");
    await waitFor(() => expect(screen.getByTestId("panchang-heading")).toHaveTextContent("Tuesday, 21 October 2025"));
  });

  it("next/previous day buttons step the date, and Today returns to the default", async () => {
    renderPage();
    await screen.findByTestId("panchang-results");

    fireEvent.click(screen.getByRole("button", { name: "Next day" }));
    await waitFor(() => expect(panchangCalls().at(-1)!.params.get("date")).toBe("2025-03-15"));
    fireEvent.click(screen.getByRole("button", { name: "Previous day" }));
    fireEvent.click(screen.getByRole("button", { name: "Previous day" }));
    await waitFor(() => expect(panchangCalls().at(-1)!.params.get("date")).toBe("2025-03-13"));

    fireEvent.click(screen.getByRole("button", { name: "Today" }));
    // The "today" result is still cached (10 min), so no new request is needed to show it again.
    await waitFor(() => expect(screen.getByLabelText("Date")).toHaveValue("2025-03-14"));
    expect(screen.getByRole("button", { name: "Today" })).toBeDisabled();
  });

  it("steps across month and year boundaries without using the browser timezone", async () => {
    renderPage();
    await screen.findByTestId("panchang-results");
    fireEvent.change(screen.getByLabelText("Date"), { target: { value: "2025-12-31" } });
    await waitFor(() => expect(panchangCalls().at(-1)!.params.get("date")).toBe("2025-12-31"));
    await screen.findByText(/31 December 2025/);
    fireEvent.click(screen.getByRole("button", { name: "Next day" }));
    await waitFor(() => expect(panchangCalls().at(-1)!.params.get("date")).toBe("2026-01-01"));
  });

  it("rejects an empty or out-of-range date without calling the API", async () => {
    renderPage();
    await screen.findByTestId("panchang-results");
    const before = panchangCalls().length;

    fireEvent.change(screen.getByLabelText("Date"), { target: { value: "" } });
    expect(await screen.findByTestId("date-error")).toHaveTextContent("valid date");
    expect(screen.queryByTestId("panchang-results")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Date"), { target: { value: "2150-01-01" } });
    expect(screen.getByTestId("date-error")).toBeInTheDocument();
    expect(panchangCalls()).toHaveLength(before);
  });
});

describe("Panchang page: location changes", () => {
  it("searches after a pause, then recalculates for the chosen place", async () => {
    renderPage();
    await screen.findByTestId("panchang-results");

    const box = screen.getByRole("combobox");
    fireEvent.change(box, { target: { value: "" } });
    typeInto(box, "London");
    const option = await screen.findByRole("option", { name: /London, England/ }, { timeout: 3000 });
    fireEvent.click(within(option).getByRole("button"));

    await waitFor(() => expect(panchangCalls().at(-1)!.params.get("lat")).toBe(String(LONDON.latitude)));
    const last = panchangCalls().at(-1)!.params;
    expect(last.get("lon")).toBe(String(LONDON.longitude));
    expect(last.get("name")).toBe(LONDON.name);
    await waitFor(() => expect(screen.getByTestId("timezone")).toHaveTextContent("Europe/London (UTC+00:00)"));
    expect(screen.getByTestId("panchang-heading")).toHaveTextContent("London, England");
    expect(JSON.parse(localStorage.getItem("panchang:place")!)).toMatchObject({ latitude: LONDON.latitude });
  });

  it("does not query the geocoder on every keystroke or for short text", async () => {
    renderPage();
    await screen.findByTestId("panchang-results");
    const box = screen.getByRole("combobox");
    fireEvent.change(box, { target: { value: "" } });
    typeInto(box, "Lo");
    expect(screen.getByText(/at least 3 characters/)).toBeInTheDocument();
    typeInto(box, "ndon", "Lo"); // four more keystrokes in quick succession
    await screen.findByRole("option", {}, { timeout: 3000 });
    expect(searchCalls()).toHaveLength(1);
    expect(searchCalls()[0].params.get("q")).toBe("London");
  });

  it("shows an empty state when nothing matches", async () => {
    installFetch((c) => (c.path === "/panchang/locations" ? respond(envelope([])) : undefined));
    renderPage();
    await screen.findByTestId("panchang-results");
    const box = screen.getByRole("combobox");
    fireEvent.change(box, { target: { value: "" } });
    typeInto(box, "Zzzzzz");
    expect(await screen.findByText(/No places found/, {}, { timeout: 3000 })).toBeInTheDocument();
  });

  it("shows a search error without breaking the page", async () => {
    installFetch((c) =>
      c.path === "/panchang/locations" ? respond(envelope({ code: "CALCULATION_FAILED" }, false, "Location search is temporarily unavailable."), 502) : undefined,
    );
    renderPage();
    await screen.findByTestId("panchang-results");
    const box = screen.getByRole("combobox");
    fireEvent.change(box, { target: { value: "" } });
    typeInto(box, "Paris");
    expect(await screen.findByText("Location search is temporarily unavailable.", {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByTestId("panchang-results")).toBeInTheDocument();
  });
});

describe("Panchang page: error and loading states", () => {
  it("explains polar-day/night failures and lets the user retry", async () => {
    let fail = true;
    installFetch((c) => {
      if (c.path !== "/panchang" || !fail) return undefined;
      return respond(envelope({ code: "NO_SUNRISE" }, false, "The Sun does not rise and set at this location on this date."), 422);
    });
    renderPage();
    const err = await screen.findByTestId("panchang-error");
    expect(err).toHaveTextContent(/polar day or night/);
    expect(screen.queryByTestId("panchang-results")).not.toBeInTheDocument();

    fail = false;
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    await screen.findByTestId("panchang-results");
  });

  it("shows the server's message for a provider/calculation failure", async () => {
    installFetch((c) => (c.path === "/panchang" ? respond(envelope({ code: "CALCULATION_FAILED" }, false, "Panchang calculation failed."), 500) : undefined));
    renderPage();
    expect(await screen.findByTestId("panchang-error")).toHaveTextContent("Panchang calculation failed.");
  });

  it("handles an unreachable server", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new TypeError("Failed to fetch"))));
    renderPage();
    expect(await screen.findByTestId("panchang-error")).toHaveTextContent(/Could not reach the server/);
  });

  it("handles a non-JSON error response", async () => {
    installFetch((c) => (c.path === "/panchang" ? Promise.resolve(new Response("<html>Bad gateway</html>", { status: 502 })) : undefined));
    renderPage();
    expect(await screen.findByTestId("panchang-error")).toHaveTextContent(/Something went wrong/);
  });
});
