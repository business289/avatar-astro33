import { motion } from "framer-motion";
import FeaturedBirthChart from "./FeaturedBirthChart";
import LiveDarshanCard from "./LiveDarshanCard";
import AIGuruCard from "./AIGuruCard";
import DevotionCard from "./DevotionCard";

/**
 * Continues straight off the Hero/Astrology Tools sections — no background
 * of its own, so the app-wide starfield shows through and there's no
 * visible seam between sections.
 */
const FeatureShowcase = () => (
  <section className="relative w-full py-10 md:py-14">
    <div className="container relative z-10 mx-auto px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col gap-6 lg:gap-7"
      >
        <FeaturedBirthChart />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
          <LiveDarshanCard index={0} />
          <AIGuruCard index={1} />
          <DevotionCard index={2} />
        </div>
      </motion.div>
    </div>
  </section>
);

export default FeatureShowcase;
