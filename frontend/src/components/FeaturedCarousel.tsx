import { useCallback, useState } from "react";
import type { KeyboardEvent } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { featuredSlides } from "@/data/features";
import FeatureButton from "./FeatureButton";
import FeatureCardShell from "./FeatureCardShell";

const arrowClass =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white/70 transition-colors duration-300 hover:border-brand-accent/60 hover:text-brand-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent motion-reduce:transition-none";

/**
 * Compact featured-tools carousel. The panel is only as tall as its content:
 * 24px padding, a 240 x 180 photo (the tallest item), and a one-line row of
 * dots. All slides share one grid cell so the height never changes between
 * slides, and nothing needs a fixed or minimum height. Arrows and dots are
 * ordinary grid items: beside the slide on large screens (arrows vertically
 * centred), in a row under it on small ones.
 */
const FeaturedCarousel = () => {
  const count = featuredSlides.length;
  const [active, setActive] = useState(0);

  const go = useCallback((to: number) => setActive(((to % count) + count) % count), [count]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(active - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(active + 1);
    }
  };

  return (
    <FeatureCardShell lift={false} data-testid="featured-carousel">
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured tools"
        onKeyDown={onKeyDown}
        className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 px-4 py-4 sm:px-5 lg:gap-x-4 lg:py-6"
      >
        <button
          type="button"
          aria-label="Previous featured tool"
          onClick={() => go(active - 1)}
          className={`${arrowClass} order-2 lg:order-1`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="order-1 col-span-3 min-w-0 lg:order-2 lg:col-span-1 lg:mx-auto lg:w-full lg:max-w-[1040px]" aria-live="polite">
          <div className="grid">
            {featuredSlides.map((slide, i) => {
              const isActive = i === active;
              return (
                <div
                  key={slide.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${count}`}
                  aria-hidden={!isActive}
                  data-active={isActive}
                  className={`col-start-1 row-start-1 grid grid-cols-1 items-center gap-4 transition-[opacity,visibility] duration-300 motion-reduce:transition-none md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,240px)_minmax(0,1fr)] lg:gap-8 ${
                    isActive ? "visible opacity-100" : "pointer-events-none invisible opacity-0"
                  }`}
                >
                  {/* Left: information */}
                  <div className="text-center md:text-left">
                    <span className="mb-1 inline-block font-ui text-[0.75rem] font-bold uppercase tracking-[0.2em] text-brand-accent">
                      {slide.badge}
                    </span>
                    <h3 className="mb-1.5 font-heading text-[1.625rem] font-semibold normal-case leading-tight tracking-[0.03em] text-white">
                      {slide.title}
                    </h3>
                    <p className="mx-auto mb-3 max-w-sm font-ui text-[0.9rem] leading-[1.45] text-white/60 md:mx-0">
                      {slide.description}
                    </p>
                    <FeatureButton to={slide.buttonPath} label={slide.buttonLabel} size="sm" />
                  </div>

                  {/* Centre: artwork, 240 x 180 at most, never stretched */}
                  <div className="mx-auto w-full max-w-[240px] overflow-hidden rounded-xl border border-white/10 shadow-[0_8px_22px_rgba(0,0,0,0.4)]">
                    <div className="aspect-[4/3] w-full">
                      <img
                        src={slide.image}
                        alt={slide.imageAlt}
                        width={800}
                        height={600}
                        className="h-full w-full object-cover"
                        loading={i === 0 ? "eager" : "lazy"}
                        decoding="async"
                      />
                    </div>
                  </div>

                  {/* Right: benefits */}
                  <ul className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2 md:col-span-2 lg:col-span-1 lg:grid-cols-1">
                    {slide.checklist.map((item) => (
                      <li key={item} className="flex items-start gap-2 font-ui text-[0.9rem] leading-snug text-white/80">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          aria-label="Next featured tool"
          onClick={() => go(active + 1)}
          className={`${arrowClass} order-4 lg:order-3`}
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="order-3 flex items-center justify-center lg:order-4 lg:col-span-3" role="group" aria-label="Choose featured tool">
          {featuredSlides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Show ${slide.title}`}
              aria-current={i === active ? "true" : undefined}
              onClick={() => go(i)}
              className="flex h-5 items-center justify-center px-1"
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none ${
                  i === active ? "w-5 bg-brand-accent" : "w-1.5 bg-white/25 hover:bg-white/50"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </FeatureCardShell>
  );
};

export default FeaturedCarousel;
