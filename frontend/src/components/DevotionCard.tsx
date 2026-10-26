import { memo } from "react";
import { Link } from "react-router-dom";
import { devotionFeature } from "@/data/features";
import FeatureButton from "./FeatureButton";
import FeatureCardShell from "./FeatureCardShell";

interface DevotionCardProps {
  index: number;
}

const DevotionCard = ({ index }: DevotionCardProps) => (
  <FeatureCardShell index={index} className="flex h-full flex-col p-4">
    <div className="mb-1 flex items-center">
      <h3 className="font-heading text-xl font-semibold normal-case leading-tight tracking-[0.03em] text-white">
        {devotionFeature.title}
      </h3>
    </div>
    <p className="mb-2 font-ui text-[0.9rem] leading-[1.45] text-white/60">{devotionFeature.description}</p>

    {/* The six tiles start straight under the description: 3 columns x 2 rows of 60px tiles on
        desktop and down to 460px; 2 columns on narrower phones. */}
    <div className="mb-3 grid grid-cols-2 auto-rows-fr gap-2 min-[460px]:grid-cols-3">
      {devotionFeature.items.map((item) => (
        <Link
          key={item.label}
          to={item.path}
          className="group/item flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-lg border border-brand-accent/25 bg-black/25 px-1.5 py-2 text-center transition-colors duration-300 hover:border-brand-accent/60 hover:bg-brand-accent/[0.08] motion-reduce:transition-none"
        >
          <item.icon className="h-[18px] w-[18px] text-brand-accent" strokeWidth={1.75} />
          <span className="font-ui text-[0.8125rem] leading-tight text-white/75">{item.label}</span>
        </Link>
      ))}
    </div>

    <FeatureButton to={devotionFeature.buttonPath} label={devotionFeature.buttonLabel} size="sm" className="mt-auto self-start" />
  </FeatureCardShell>
);

export default memo(DevotionCard);
