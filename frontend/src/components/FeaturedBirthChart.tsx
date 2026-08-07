import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { birthChartFeature } from "@/data/features";
import FeatureButton from "./FeatureButton";

const DOT_COUNT = 4;

const FeaturedBirthChart = () => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    whileHover={{ y: -8 }}
    className="group relative rounded-2xl overflow-hidden border border-[#ffaa50]/[0.18] shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-[border-color,box-shadow] duration-300 hover:border-[#ffaa50]/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.35),0_0_32px_rgba(232,147,95,0.22)]"
    style={{ background: "linear-gradient(180deg, rgba(13,28,52,0.7) 0%, rgba(5,11,24,0.85) 100%)" }}
  >
    {/* Nav arrows — UI only, no slide state yet */}
    <button
      type="button"
      aria-label="Previous"
      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white/70 backdrop-blur-sm transition-colors duration-300 hover:border-[#e8935f]/60 hover:text-[#e8935f]"
    >
      <ChevronLeft className="w-4 h-4" />
    </button>
    <button
      type="button"
      aria-label="Next"
      className="absolute right-6 bottom-16 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white/70 backdrop-blur-sm transition-colors duration-300 hover:border-[#e8935f]/60 hover:text-[#e8935f]"
    >
      <ChevronRight className="w-4 h-4" />
    </button>

    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr_0.85fr] gap-10 lg:gap-6 items-center px-8 py-12 md:px-14 md:py-14">
      {/* Left — copy + CTA */}
      <div className="text-center lg:text-left">
        <span className="inline-block font-['Inter'] text-xs font-bold tracking-[0.2em] uppercase text-[#e8935f] mb-3">
          {birthChartFeature.badge}
        </span>
        <h3 className="font-['Inter'] font-bold text-2xl md:text-3xl text-white mb-3">
          {birthChartFeature.title}
        </h3>
        <p className="font-['Inter'] text-sm md:text-[0.95rem] text-white/55 leading-relaxed mb-6 max-w-xs mx-auto lg:mx-0">
          {birthChartFeature.description}
        </p>
        <FeatureButton to={birthChartFeature.buttonPath} label={birthChartFeature.buttonLabel} />
      </div>

      {/* Center — illustration */}
      <div className="flex items-center justify-center">
        <img
          src={birthChartFeature.image}
          alt={birthChartFeature.title}
          className="w-full max-w-sm object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Right — checklist */}
      <ul className="space-y-3.5">
        {birthChartFeature.checklist.map((item) => (
          <li key={item} className="flex items-center gap-2.5 font-['Inter'] text-sm text-white/80">
            <CheckCircle2 className="w-4 h-4 text-[#e8935f] shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>

    {/* Pagination dots */}
    <div className="flex items-center justify-center gap-2 pb-6">
      {Array.from({ length: DOT_COUNT }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === 0 ? "w-5 bg-[#e8935f]" : "w-1.5 bg-white/20"
          }`}
        />
      ))}
    </div>
  </motion.div>
);

export default FeaturedBirthChart;
