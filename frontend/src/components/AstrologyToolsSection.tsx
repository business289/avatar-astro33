import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { homepageTools } from "@/data/tools";
import ToolCard from "./ToolCard";

/**
 * Homepage tools row: exactly four tools (see HOMEPAGE_TOOL_PATHS), in one row
 * from 1200px up, two columns on tablets and one column on phones.
 */
const AstrologyToolsSection = () => (
  <section className="relative w-full py-8 md:py-10">
    <div className="container relative z-10 mx-auto px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="mb-6 text-center md:mb-7"
      >
        <h2 className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-heading text-[1.625rem] font-semibold normal-case leading-[1.15] tracking-[0.03em] text-white sm:text-[1.875rem] md:text-[2.1rem]">
          <Sparkles className="h-5 w-5 text-brand-accent md:h-6 md:w-6" strokeWidth={1.75} />
          Explore Our <span className="text-brand-accent">Astrology Tools</span>
        </h2>
      </motion.div>

      <div
        className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 min-[1200px]:grid-cols-4 lg:gap-5"
        data-testid="tools-grid"
      >
        {homepageTools.map((tool, index) => (
          <ToolCard key={tool.path} tool={tool} index={index} />
        ))}
      </div>
    </div>
  </section>
);

export default AstrologyToolsSection;
