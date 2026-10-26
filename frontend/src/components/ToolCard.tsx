import { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { AstrologyTool } from "@/data/tools";

interface ToolCardProps {
  tool: AstrologyTool;
  index: number;
}

/**
 * Compact card for the homepage tools row. The photo has a fixed height and
 * `object-cover`; the description is clamped to three lines and the button is
 * pushed to the bottom, so every card in a row lines up regardless of copy.
 */
const ToolCard = ({ tool, index }: ToolCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.45, delay: index * 0.07, ease: "easeOut" }}
    whileHover={{ y: -3 }}
    data-testid="tool-card"
    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-brand-accent/25 shadow-[0_6px_20px_rgba(0,0,0,0.35)] transition-[border-color,box-shadow] duration-300 hover:border-brand-accent/60 hover:shadow-[0_6px_20px_rgba(0,0,0,0.35),0_0_24px_rgba(199,164,106,0.18)]"
    style={{ background: "linear-gradient(180deg, rgba(13,28,52,0.7) 0%, rgba(5,11,24,0.85) 100%)" }}
  >
    <div className="relative h-[140px] shrink-0 overflow-hidden">
      <img
        src={tool.image}
        alt={tool.title}
        width={960}
        height={492}
        className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        loading="lazy"
        decoding="async"
      />
      {/* Restrained navy tint so the photographs sit in the site's palette without being edited */}
      <div className="absolute inset-0 bg-[#081426]/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#081426]/90 via-[#081426]/0 to-transparent" />
    </div>

    <div className="flex flex-1 flex-col p-4">
      <h3 className="mb-1 font-heading text-base font-semibold normal-case tracking-[0.04em] text-white">
        {tool.title}
      </h3>
      <p className="mb-3 line-clamp-3 font-ui text-[0.875rem] leading-[1.45] text-white/60">
        {tool.description}
      </p>

      <Link
        to={tool.path}
        className="group/btn mt-auto inline-flex h-9 w-fit items-center gap-2 rounded-full border border-brand-accent/60 px-4 font-ui text-sm font-semibold text-brand-accent transition-all duration-300 hover:bg-brand-accent hover:text-[#081426] hover:shadow-[0_0_18px_rgba(199,164,106,0.35)]"
      >
        {tool.button}
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
      </Link>
    </div>
  </motion.div>
);

export default memo(ToolCard);
