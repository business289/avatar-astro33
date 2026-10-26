import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Hero from "./Hero";
import { HERO_POSTER_SRC, HERO_VIDEO_SRC } from "./HeroVideoBackground";

const originalMatchMedia = window.matchMedia;

function setReducedMotion(reduce: boolean) {
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
}

const renderHero = () =>
  render(
    <MemoryRouter>
      <Hero />
    </MemoryRouter>,
  );

const getVideo = () => document.querySelector("video") as HTMLVideoElement | null;

beforeEach(() => setReducedMotion(false));
afterEach(() => {
  cleanup();
  window.matchMedia = originalMatchMedia;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete (navigator as unknown as { connection?: unknown }).connection;
});

describe("Hero: content", () => {
  it("keeps the existing heading, description and calls to action", () => {
    renderHero();
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("AI Astrology for");
    expect(h1).toHaveTextContent("Every Moment of");
    expect(h1).toHaveTextContent("Your Life");
    expect(screen.getByText(/Get your Birth Chart, Tarot Reading/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Start Free Reading/ })).toHaveAttribute("href", "/birth-chart");
    expect(screen.getByRole("link", { name: "Explore Tools" })).toHaveAttribute("href", "/zodiac");
    for (const label of ["Happy Users", "Verified", "Astrologers", "Languages", "Countries"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("fills the viewport and starts under the navbar", () => {
    const { container } = renderHero();
    const section = container.querySelector("section")!;
    expect(section).toHaveClass("min-h-screen"); // 100vh fallback
    expect(section).toHaveClass("-mt-8"); // cancels Layout's pt-8 so the hero starts at the top
    expect(section).toHaveClass("overflow-hidden"); // no horizontal scroll from the media
  });
});

describe("Hero: background video", () => {
  it("is a muted, looping, inline decorative video with a poster and no controls", () => {
    renderHero();
    const video = getVideo()!;
    expect(video).not.toBeNull();
    expect(video.getAttribute("src")).toBe(HERO_VIDEO_SRC);
    expect(video.getAttribute("poster")).toBe(HERO_POSTER_SRC);
    expect(video.autoplay).toBe(true);
    expect(video.loop).toBe(true);
    expect(video.muted).toBe(true);
    expect(video.playsInline).toBe(true);
    expect(video.controls).toBe(false);
    expect(video.getAttribute("preload")).toBe("metadata");
    expect(video).toHaveClass("object-cover");
    expect(video).toHaveAttribute("tabindex", "-1");
  });

  it("is hidden from assistive technology and ignores the pointer", () => {
    renderHero();
    const media = screen.getByTestId("hero-media");
    expect(media).toHaveAttribute("aria-hidden", "true");
    expect(media).toHaveClass("pointer-events-none");
    expect(media).toHaveClass("absolute", "inset-0");
  });

  it("never requests the browser Fullscreen API", () => {
    const requestFullscreen = vi.fn();
    (HTMLElement.prototype as unknown as { requestFullscreen: unknown }).requestFullscreen = requestFullscreen;
    const { container } = renderHero();
    fireEvent.click(getVideo()!);
    fireEvent.doubleClick(getVideo()!);
    fireEvent.click(container.querySelector("section")!);
    expect(requestFullscreen).not.toHaveBeenCalled();
    delete (HTMLElement.prototype as unknown as { requestFullscreen?: unknown }).requestFullscreen;
  });

  it("pauses when scrolled out of view and resumes when visible again", () => {
    let callback: IntersectionObserverCallback = () => {};
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: IntersectionObserverCallback) {
          callback = cb;
        }
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
          return [];
        }
      },
    );
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    const pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    renderHero();

    callback([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(pause).toHaveBeenCalledTimes(1);
    callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(play).toHaveBeenCalledTimes(1);
  });
});

describe("Hero: reduced motion and data saver", () => {
  it("shows only the poster, and no video, when the user prefers reduced motion", () => {
    setReducedMotion(true);
    renderHero();
    expect(getVideo()).toBeNull();
    const img = screen.getByTestId("hero-media").querySelector("img")!;
    expect(img.getAttribute("src")).toBe(HERO_POSTER_SRC);
    expect(img).toHaveAttribute("alt", "");
    expect(img).toHaveClass("object-cover");
  });

  it("skips the video when the browser asks to save data", () => {
    (navigator as unknown as { connection: { saveData: boolean } }).connection = { saveData: true };
    renderHero();
    expect(getVideo()).toBeNull();
    expect(screen.getByTestId("hero-media").querySelector("img")).not.toBeNull();
  });

  it("still renders all hero content without motion", () => {
    setReducedMotion(true);
    renderHero();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Start Free Reading/ })).toBeInTheDocument();
  });
});

describe("Hero: legibility overlays", () => {
  it("adds non-interactive gradient overlays above the media and below the copy", () => {
    const { container } = renderHero();
    const overlays = Array.from(container.querySelectorAll('section > div[aria-hidden="true"]')).filter(
      (el) => el.getAttribute("data-testid") !== "hero-media",
    );
    expect(overlays.length).toBeGreaterThanOrEqual(3);
    for (const el of overlays) expect(el).toHaveClass("pointer-events-none");
    const copy = container.querySelector("section > div.container")!;
    expect(copy).toHaveClass("relative", "z-10");
  });
});
