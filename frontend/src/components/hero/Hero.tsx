import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Gem, ShieldCheck, Globe2, MapPinned } from "lucide-react";
import HeroVideoBackground from "./HeroVideoBackground";

const stats = [
  { icon: Gem, value: "50,000+", label: "Happy Users" },
  { icon: ShieldCheck, value: "Verified", label: "Astrologers" },
  { icon: Globe2, value: "13+", label: "Languages" },
  { icon: MapPinned, value: "60+", label: "Countries" },
];

const Hero = () => {
  return (
    // -mt-8 cancels Layout's `pt-8` so the hero starts at the very top, under the
    // fixed navbar. `min-h-screen` (100vh) is the fallback for browsers without
    // `svh` units, which make the hero match the visible viewport on mobile.
    <section
      className="relative -mt-8 flex min-h-screen w-full items-center overflow-hidden pb-12 pt-28 lg:pt-32"
      style={{ minHeight: "100svh" }}
    >
      <HeroVideoBackground />

      {/* Legibility overlays: an even tint on small screens (text spans the width),
          a left-weighted gradient on large screens, and a top fade behind the navbar. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[#020B1F]/55 lg:bg-transparent" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          background:
            "linear-gradient(90deg, rgba(2,11,31,0.85) 0%, rgba(2,11,31,0.6) 36%, rgba(2,11,31,0.12) 68%, rgba(2,11,31,0) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{ background: "linear-gradient(180deg, rgba(2,11,31,0.75) 0%, rgba(2,11,31,0) 100%)" }}
      />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        {/* ── Copy ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto max-w-xl text-center lg:mx-0 lg:max-w-[34rem] lg:text-left"
        >
          {/* Heading */}
          <h1 className="font-heading normal-case font-bold tracking-[0.02em] leading-[1.14] text-[1.65rem] min-[380px]:text-3xl sm:text-4xl xl:text-5xl mb-6">
            <span className="block text-white">AI Astrology for</span>
            <span className="block text-brand-accent">Every Moment of</span>
            <span className="block text-white">Your Life</span>
          </h1>

          {/* Description */}
          <p className="font-ui text-[1rem] md:text-[1.125rem] leading-[1.5] text-white/80 max-w-[30rem] mx-auto lg:mx-0 mb-9">
            Get your Birth Chart, Tarot Reading, Name Analysis, Palm Reading,
            Compatibility Report, Live Darshan, and AI-powered spiritual
            guidance—all in one place.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-12">
            <Link
              to="/birth-chart"
              className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-ui font-semibold text-sm text-[#1a0f08] transition-transform duration-300 hover:-translate-y-0.5"
              style={{
                background: "var(--brand-accent)",
                boxShadow: "0 0 32px rgba(199,164,106,0.35)",
              }}
            >
              Start Free Reading
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/zodiac"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 font-ui font-semibold text-sm text-white/90 backdrop-blur-sm transition-colors duration-300 hover:border-white/40 hover:bg-white/[0.06]"
            >
              Explore Tools
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-7 gap-y-4">
            {stats.map((s, i) => (
              <div key={s.label} className="flex items-center gap-6">
                <div className="flex items-center gap-2.5">
                  <s.icon className="w-5 h-5 text-brand-accent shrink-0" strokeWidth={1.75} />
                  <div className="text-left leading-tight">
                    <div className="font-ui font-bold text-white text-base">
                      {s.value}
                    </div>
                    <div className="font-ui text-white/65 text-xs">
                      {s.label}
                    </div>
                  </div>
                </div>
                {i < stats.length - 1 && (
                  <span className="hidden sm:block h-8 w-px bg-white/15" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
