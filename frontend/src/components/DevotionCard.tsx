import { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { devotionFeature } from "@/data/features";
import FeatureButton from "./FeatureButton";

interface DevotionCardProps {
  index: number;
}

const DevotionCard = ({ index }: DevotionCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
    whileHover={{ y: -8 }}
    className="group relative flex flex-col rounded-2xl overflow-hidden border border-[#ffaa50]/[0.18] shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-[border-color,box-shadow] duration-300 hover:border-[#ffaa50]/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.35),0_0_32px_rgba(232,147,95,0.22)] p-6"
    style={{ background: "linear-gradient(180deg, rgba(13,28,52,0.7) 0%, rgba(5,11,24,0.85) 100%)" }}
  >
    <h3 className="font-['Inter'] font-bold text-lg text-white mb-4">{devotionFeature.title}</h3>

    <div className="grid grid-cols-3 gap-2.5 mb-5">
      {devotionFeature.items.map((item) => (
        <Link
          key={item.label}
          to={item.path}
          className="group/item flex flex-col items-center justify-center gap-2 rounded-xl border border-[#e8935f]/25 bg-black/25 px-2 py-3.5 text-center transition-colors duration-300 hover:border-[#e8935f]/60 hover:bg-[#e8935f]/[0.08]"
        >
          <item.icon className="w-5 h-5 text-[#e8935f]" strokeWidth={1.75} />
          <span className="font-['Inter'] text-[11px] leading-tight text-white/75">
            {item.label}
          </span>
        </Link>
      ))}
    </div>

    <FeatureButton
      to={devotionFeature.buttonPath}
      label={devotionFeature.buttonLabel}
      className="mt-auto self-start"
    />
  </motion.div>
);

export default memo(DevotionCard);
