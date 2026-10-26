import FeaturedCarousel from "./FeaturedCarousel";
import LiveDarshanCard from "./LiveDarshanCard";
import AIGuruCard from "./AIGuruCard";
import DevotionCard from "./DevotionCard";
import SectionContainer from "./SectionContainer";

/**
 * Compact featured carousel plus three cards. Continues straight off the
 * sections above with no background of its own, so the app-wide starfield shows
 * through. The carousel and the card row share one container, so they share the
 * same left and right edges, and one 16px gap runs between and under them.
 */
const FeatureShowcase = () => (
  <section className="relative w-full scroll-mt-16 py-6 md:py-8">
    <SectionContainer className="relative z-10 flex flex-col gap-4" data-testid="feature-showcase">
      <FeaturedCarousel />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <LiveDarshanCard index={0} />
        <AIGuruCard index={1} />
        <div className="md:col-span-2 lg:col-span-1">
          <DevotionCard index={2} />
        </div>
      </div>
    </SectionContainer>
  </section>
);

export default FeatureShowcase;
