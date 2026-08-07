import { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { AstrologyTool } from "@/data/tools";

interface ToolCardProps {
  tool: AstrologyTool;
  index: number;
}

const ToolCard = ({ tool, index }: ToolCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
    whileHover={{ y: -8, scale: 1.02 }}
    className="group relative rounded-2xl overflow-hidden border border-[#ffaa50]/[0.18] shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-[border-color,box-shadow] duration-300 hover:border-[#ffaa50]/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.35),0_0_32px_rgba(232,147,95,0.22)]"
    style={{ background: "linear-gradient(180deg, rgba(13,28,52,0.7) 0%, rgba(5,11,24,0.85) 100%)" }}
  >
    <div className="relative aspect-[16/10] overflow-hidden">
      <img
        src={tool.image}
        alt={tool.title}
        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050b18] via-transparent to-transparent" />
    </div>

    <div className="p-6">
      <h3 className="font-['Inter'] font-bold text-lg text-white mb-2">{tool.title}</h3>
      <p className="font-['Inter'] text-sm text-white/55 leading-relaxed mb-5 min-h-[40px]">
        {tool.description}
      </p>

      <Link
        to={tool.path}
        className="group/btn inline-flex items-center gap-2 rounded-full border border-[#e8935f]/55 px-5 py-2.5 font-['Inter'] text-sm font-semibold text-[#e8935f] transition-all duration-300 hover:bg-[#e8935f] hover:text-[#0b0f1a] hover:shadow-[0_0_22px_rgba(232,147,95,0.45)]"
      >
        {tool.button}
        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
      </Link>
    </div>
  </motion.div>
);

export default memo(ToolCard);
