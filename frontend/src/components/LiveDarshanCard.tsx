import { memo } from "react";
import { motion } from "framer-motion";
import { liveDarshanFeature } from "@/data/features";
import FeatureButton from "./FeatureButton";

interface LiveDarshanCardProps {
  index: number;
}

const LiveDarshanCard = ({ index }: LiveDarshanCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
    whileHover={{ y: -8 }}
    className="group relative flex flex-col rounded-2xl overflow-hidden border border-[#ffaa50]/[0.18] shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-[border-color,box-shadow] duration-300 hover:border-[#ffaa50]/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.35),0_0_32px_rgba(232,147,95,0.22)] p-6"
    style={{ background: "linear-gradient(180deg, rgba(13,28,52,0.7) 0%, rgba(5,11,24,0.85) 100%)" }}
  >
    <div className="flex items-center gap-2.5 mb-2">
      <h3 className="font-['Inter'] font-bold text-lg text-white">{liveDarshanFeature.title}</h3>
      <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 font-['Inter'] text-[10px] font-bold tracking-wide text-white">
        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
        {liveDarshanFeature.liveLabel}
      </span>
    </div>
    <p className="font-['Inter'] text-sm text-white/55 leading-relaxed mb-4">
      {liveDarshanFeature.description}
    </p>

    <div className="relative aspect-[16/10] overflow-hidden rounded-xl mb-3">
      <img
        src={liveDarshanFeature.image}
        alt={liveDarshanFeature.title}
        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        loading="lazy"
      />
    </div>

    <div className="grid grid-cols-3 gap-2 mb-5">
      {liveDarshanFeature.thumbnails.map((thumb, i) => (
        <div key={i} className="aspect-square overflow-hidden rounded-lg border border-white/10">
          <img src={thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
        </div>
      ))}
    </div>

    <FeatureButton
      to={liveDarshanFeature.buttonPath}
      label={liveDarshanFeature.buttonLabel}
      className="mt-auto self-start"
    />
  </motion.div>
);

export default memo(LiveDarshanCard);
