import { memo } from "react";
import { Mic, Send } from "lucide-react";
import { aiGuruFeature } from "@/data/features";
import FeatureButton from "./FeatureButton";
import FeatureCardShell from "./FeatureCardShell";

interface AIGuruCardProps {
  index: number;
}

const AIGuruCard = ({ index }: AIGuruCardProps) => (
  <FeatureCardShell index={index} className="flex h-full flex-col p-4">
    <div className="mb-1 flex items-center">
      <h3 className="font-heading text-xl font-semibold normal-case leading-tight tracking-[0.03em] text-white">
        {aiGuruFeature.title}
      </h3>
    </div>
    <p className="mb-2 font-ui text-[0.9rem] leading-[1.45] text-white/60">{aiGuruFeature.description}</p>

    <div className="mb-2 h-[110px] w-full overflow-hidden rounded-lg">
      <img
        src={aiGuruFeature.image}
        alt={aiGuruFeature.imageAlt}
        width={960}
        height={274}
        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        loading="lazy"
        decoding="async"
      />
    </div>

    <div className="mb-3 flex h-9 items-center gap-2 rounded-full border border-white/15 bg-black/25 px-4">
      <span className="flex-1 truncate font-ui text-[0.9rem] text-white/40">{aiGuruFeature.inputPlaceholder}</span>
      <Mic className="h-4 w-4 shrink-0 text-white/50" />
      <Send className="h-4 w-4 shrink-0 text-brand-accent" />
    </div>

    <FeatureButton to={aiGuruFeature.buttonPath} label={aiGuruFeature.buttonLabel} size="sm" className="mt-auto self-start" />
  </FeatureCardShell>
);

export default memo(AIGuruCard);
