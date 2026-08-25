import { memo } from "react";
import { motion } from "framer-motion";
import { Mic, Send } from "lucide-react";
import { aiGuruFeature } from "@/data/features";
import FeatureButton from "./FeatureButton";

interface AIGuruCardProps {
  index: number;
}

const AIGuruCard = ({ index }: AIGuruCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
    whileHover={{ y: -8 }}
    className="group relative flex flex-col rounded-2xl overflow-hidden border border-[#ffaa50]/[0.18] shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-[border-color,box-shadow] duration-300 hover:border-[#ffaa50]/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.35),0_0_32px_rgba(232,147,95,0.22)] p-6"
    style={{ background: "linear-gradient(180deg, rgba(13,28,52,0.7) 0%, rgba(5,11,24,0.85) 100%)" }}
  >
    <h3 className="font-['Inter'] font-bold text-lg text-white mb-2">{aiGuruFeature.title}</h3>
    <p className="font-['Inter'] text-sm text-white/55 leading-relaxed mb-4">
      {aiGuruFeature.description}
    </p>

    <div className="relative aspect-[16/10] overflow-hidden rounded-xl mb-4">
      <img
        src={aiGuruFeature.image}
        alt={aiGuruFeature.title}
        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        loading="lazy"
      />
    </div>

    <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-4 py-2.5 mb-5">
      <span className="flex-1 font-['Inter'] text-sm text-white/40 truncate">
        {aiGuruFeature.inputPlaceholder}
      </span>
      <Mic className="w-4 h-4 text-white/50 shrink-0" />
      <Send className="w-4 h-4 text-[#e8935f] shrink-0" />
    </div>

    <FeatureButton
      to={aiGuruFeature.buttonPath}
      label={aiGuruFeature.buttonLabel}
      className="mt-auto self-start"
    />
  </motion.div>
);

export default memo(AIGuruCard);
