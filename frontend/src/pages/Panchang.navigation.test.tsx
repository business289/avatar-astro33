import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AstrologyToolsSection from "@/components/AstrologyToolsSection";
import Navbar from "@/components/Navbar";
import Panchang from "./Panchang";
import { homepageTools, tools } from "@/data/tools";
import { makePanchang } from "@/test/panchangFixture";
import App from "@/App";

beforeAll(() => {
  // The cosmic background draws on a canvas and route changes scroll; jsdom implements neither.
  const noop = () => undefined;
  // Any property is a callable that returns another such object (gradients, paths, ...).
  const fakeContext = (): unknown =>
    new Proxy(noop, { get: (_t, prop) => (prop === "canvas" ? document.createElement("canvas") : fakeContext()), apply: () => fakeContext(), set: () => true });
  HTMLCanvasElement.prototype.getContext = (() =>
    fakeContext()) as never;
  window.scrollTo = noop as never;
  // framer-motion's whileInView needs IntersectionObserver, which jsdom lacks.
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    },
  );
});

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string) => {
      const u = new URL(url);
      const place = { name: "New Delhi, India", latitude: 28.6139, longitude: 77.209, timezone: "Asia/Kolkata" };
      const data = makePanchang(u.searchParams.get("date") ?? "2025-03-14", place);
      return Promise.resolve(new Response(JSON.stringify({ status: true, data, message: "" }), { status: 200 }));
    }),
  );
});
afterEach(() => cleanup());

const withProviders = (ui: React.ReactNode, route = "/") => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
  </QueryClientProvider>
);

describe("Panchang navigation", () => {
  it("stays in the tools catalogue but is not one of the four homepage cards", () => {
    const entry = tools.find((t) => t.path === "/panchang");
    expect(entry).toMatchObject({ title: "Today's Panchang" });
    expect(homepageTools.map((t) => t.path)).not.toContain("/panchang");
  });

  it("the homepage tools row shows exactly the four chosen cards, in order", () => {
    render(
      withProviders(
        <Routes>
          <Route path="/" element={<AstrologyToolsSection />} />
        </Routes>,
      ),
    );
    const cards = screen.getAllByTestId("tool-card");
    expect(cards).toHaveLength(4);
    expect(cards.map((card) => within(card).getByRole("heading", { level: 3 }).textContent)).toEqual([
      "Birth Chart",
      "AI Tarot Reading",
      "Compatibility",
      "Palm Reading",
    ]);
    const hrefs = cards.map((card) => within(card).getByRole("link").getAttribute("href"));
    expect(hrefs).toEqual(["/birth-chart", "/tarot", "/compatibility", "/palm-reading"]);
    expect(screen.queryByText("Today's Panchang")).not.toBeInTheDocument();
    expect(screen.queryByText("AI Name Analysis")).not.toBeInTheDocument();
    expect(screen.queryByText("Daily Horoscope")).not.toBeInTheDocument();
  });

  it("each homepage card uses a locally stored photograph, not a remote URL", () => {
    for (const tool of homepageTools) {
      expect(tool.image).toMatch(/^\/images\/tools\/[a-z-]+\.jpg$/);
    }
    expect(new Set(homepageTools.map((t) => t.image)).size).toBe(4);
  });

  it("the other tools keep their routes in the catalogue and the navbar menu", () => {
    const paths = tools.map((t) => t.path);
    for (const p of ["/name-destiny-report", "/horoscopes", "/panchang"]) expect(paths).toContain(p);
    render(withProviders(<Navbar />));
    for (const label of ["Tarot Experience", "Birth Chart", "Compatibility", "Palm Reading", "AI Destiny Report", "Today's Panchang"]) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });

  it("the navbar's Astrology Tools menu contains a Today's Panchang link", () => {
    render(withProviders(<Navbar />));
    const links = screen.getAllByText("Today's Panchang").map((el) => el.closest("a")!);
    expect(links.length).toBeGreaterThan(0);
    for (const l of links) expect(l).toHaveAttribute("href", "/panchang");
  });

  it("the real application router serves /panchang", async () => {
    window.history.pushState({}, "", "/panchang");
    render(<App />);
    expect(await screen.findByRole("heading", { name: "Today's Panchang", level: 1 }, { timeout: 5000 })).toBeInTheDocument();
    expect(await screen.findByTestId("panchang-results", {}, { timeout: 5000 })).toBeInTheDocument();
  });
});
