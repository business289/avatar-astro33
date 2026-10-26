import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FeatureShowcase from "./FeatureShowcase";
import { aiGuruFeature, devotionFeature, featuredSlides } from "@/data/features";

const originalMatchMedia = window.matchMedia;
const setReducedMotion = (reduce: boolean) => {
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
};

beforeAll(() => {
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

const renderShowcase = () =>
  render(
    <MemoryRouter>
      <FeatureShowcase />
    </MemoryRouter>,
  );

const carousel = () => screen.getByTestId("featured-carousel");
const activeSlide = () => carousel().querySelector('[role="group"][data-active="true"]') as HTMLElement;
const activeTitle = () => within(activeSlide()).getByRole("heading", { level: 3 }).textContent;

afterEach(() => {
  cleanup();
  window.matchMedia = originalMatchMedia;
});

describe("FeaturedCarousel", () => {
  it("shows the AI Birth Chart first, with its description, button and four benefits", () => {
    renderShowcase();
    const slide = activeSlide();
    expect(activeTitle()).toBe("AI Birth Chart");
    expect(within(slide).getByText("Featured")).toBeInTheDocument();
    expect(within(slide).getByText(/Generate your accurate Kundli/)).toBeInTheDocument();
    expect(within(slide).getByRole("link", { name: /Generate Your Chart/ })).toHaveAttribute("href", "/birth-chart");
    for (const item of ["Detailed Planet Positions", "Dasha & Predictions", "Strengths & Challenges", "Remedies & Guidance"]) {
      expect(within(slide).getByText(item)).toBeInTheDocument();
    }
  });

  it("no longer shows development placeholder artwork", () => {
    renderShowcase();
    expect(document.body.textContent).not.toMatch(/placeholder artwork/i);
    for (const slide of featuredSlides) {
      expect(slide.image).toMatch(/^\/images\/tools\/[a-z-]+-feature\.jpg$/);
      expect(slide.image).not.toMatch(/placeholder/i);
    }
  });

  it("is an accessible carousel: one visible slide, the rest hidden from assistive tech", () => {
    renderShowcase();
    const region = screen.getByRole("region", { name: "Featured tools" });
    expect(region).toHaveAttribute("aria-roledescription", "carousel");
    const slides = Array.from(region.querySelectorAll('[aria-roledescription="slide"]'));
    expect(slides).toHaveLength(4);
    expect(slides.map((s) => s.getAttribute("aria-hidden"))).toEqual(["false", "true", "true", "true"]);
    expect(slides.map((s) => s.getAttribute("aria-label"))).toEqual(["1 of 4", "2 of 4", "3 of 4", "4 of 4"]);
  });

  it("the next and previous buttons walk through every slide and wrap around", () => {
    renderShowcase();
    const next = screen.getByRole("button", { name: "Next featured tool" });
    const prev = screen.getByRole("button", { name: "Previous featured tool" });
    const seen = [activeTitle()];
    for (let i = 0; i < 3; i++) {
      fireEvent.click(next);
      seen.push(activeTitle());
    }
    expect(seen).toEqual(["AI Birth Chart", "AI Tarot Reading", "Compatibility Report", "AI Palm Reading"]);
    fireEvent.click(next); // last -> first
    expect(activeTitle()).toBe("AI Birth Chart");
    fireEvent.click(prev); // first -> last
    expect(activeTitle()).toBe("AI Palm Reading");
  });

  it("each slide links to its own tool", () => {
    renderShowcase();
    const next = screen.getByRole("button", { name: "Next featured tool" });
    const hrefs: string[] = [];
    for (let i = 0; i < 4; i++) {
      hrefs.push(within(activeSlide()).getByRole("link").getAttribute("href")!);
      fireEvent.click(next);
    }
    expect(hrefs).toEqual(["/birth-chart", "/tarot", "/compatibility", "/palm-reading"]);
  });

  it("pagination dots mark and select the active slide", () => {
    renderShowcase();
    const dots = within(screen.getByRole("group", { name: "Choose featured tool" })).getAllByRole("button");
    expect(dots).toHaveLength(4);
    expect(dots[0]).toHaveAttribute("aria-current", "true");
    fireEvent.click(dots[2]);
    expect(activeTitle()).toBe("Compatibility Report");
    expect(dots[2]).toHaveAttribute("aria-current", "true");
    expect(dots[0]).not.toHaveAttribute("aria-current");
  });

  it("responds to the arrow keys", () => {
    renderShowcase();
    const region = screen.getByRole("region", { name: "Featured tools" });
    fireEvent.keyDown(region, { key: "ArrowRight" });
    expect(activeTitle()).toBe("AI Tarot Reading");
    fireEvent.keyDown(region, { key: "ArrowLeft" });
    fireEvent.keyDown(region, { key: "ArrowLeft" });
    expect(activeTitle()).toBe("AI Palm Reading");
  });

  it("keeps the controls in the same container as the slides", () => {
    renderShowcase();
    const region = screen.getByRole("region", { name: "Featured tools" });
    for (const name of ["Previous featured tool", "Next featured tool"]) {
      expect(region.contains(screen.getByRole("button", { name }))).toBe(true);
    }
    expect(region.contains(screen.getByRole("group", { name: "Choose featured tool" }))).toBe(true);
  });
});

describe("Cards under the carousel", () => {
  it("keeps Live Darshan, AI Guru and Devotion & Spirituality with their links", () => {
    renderShowcase();
    expect(screen.getByRole("heading", { name: /Live Darshan/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "AI Guru" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Devotion & Spirituality" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Watch Live/ })).toHaveAttribute("href", "/avatar-live/darshan");
    expect(screen.getByRole("link", { name: /Talk to AI Guru/ })).toHaveAttribute("href", "/inner-voice/chat");
    expect(screen.getByRole("link", { name: /Explore All/ })).toHaveAttribute("href", "/puja");
  });

  it("shows all six devotion tiles as links", () => {
    renderShowcase();
    for (const item of devotionFeature.items) {
      expect(screen.getByRole("link", { name: item.label })).toHaveAttribute("href", item.path);
    }
    expect(devotionFeature.items).toHaveLength(6);
  });

  it("gives the Devotion card a description and puts the six tiles straight after it", () => {
    renderShowcase();
    const card = screen.getByRole("heading", { name: "Devotion & Spirituality" }).closest("div[class*=rounded-2xl]") as HTMLElement;
    expect(within(card).getByText(devotionFeature.description)).toBeInTheDocument();
    const description = within(card).getByText(devotionFeature.description);
    const firstTile = within(card).getByRole("link", { name: devotionFeature.items[0].label });
    expect(description.nextElementSibling).toBe(firstTile.parentElement);
    expect(firstTile.parentElement!.querySelectorAll("a")).toHaveLength(6);
  });

  it("shows a real photograph, not the old cosmic illustration, in the AI Guru card", () => {
    renderShowcase();
    expect(aiGuruFeature.image).toBe("/images/tools/ai-guru.jpg");
    const img = screen.getByAltText(aiGuruFeature.imageAlt) as HTMLImageElement;
    expect(img.getAttribute("src")).toBe("/images/tools/ai-guru.jpg");
    const sources = Array.from(screen.getByTestId("feature-showcase").querySelectorAll("img")).map((i) => i.getAttribute("src"));
    expect(sources.some((s) => /guruji/.test(s ?? ""))).toBe(false);
    expect(sources.some((s) => (s ?? "").startsWith("/images/tools/") && (s ?? "").endsWith(".jpg"))).toBe(true);
  });

  it("keeps the existing Live Darshan photographs", () => {
    renderShowcase();
    const sources = Array.from(screen.getByTestId("feature-showcase").querySelectorAll("img")).map((i) => i.getAttribute("src"));
    expect(sources).toContain("/placeholders/golden-temple.webp");
    for (const thumb of ["iskon", "mahalaskhmi-temple", "ram-mandir"]) expect(sources).toContain(`/placeholders/${thumb}.webp`);
  });

  it("still renders everything and keeps working when the user prefers reduced motion", () => {
    setReducedMotion(true);
    renderShowcase();
    expect(activeTitle()).toBe("AI Birth Chart");
    fireEvent.click(screen.getByRole("button", { name: "Next featured tool" }));
    expect(activeTitle()).toBe("AI Tarot Reading");
    expect(screen.getByRole("heading", { name: "AI Guru" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Explore All/ })).toBeInTheDocument();
  });

  it("uses one shared container for the carousel and the cards", () => {
    renderShowcase();
    const container = screen.getByTestId("feature-showcase");
    expect(container).toHaveClass("max-w-[1440px]", "mx-auto");
    expect(container.contains(carousel())).toBe(true);
    expect(container.contains(screen.getByRole("heading", { name: "AI Guru" }))).toBe(true);
  });
});
