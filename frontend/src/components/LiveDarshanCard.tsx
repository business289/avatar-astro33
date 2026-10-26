import { memo } from "react";
import { liveDarshanFeature } from "@/data/features";
import FeatureButton from "./FeatureButton";
import FeatureCardShell from "./FeatureCardShell";

interface LiveDarshanCardProps {
  index: number;
}

const LiveDarshanCard = ({ index }: LiveDarshanCardProps) => (
  <FeatureCardShell index={index} className="flex h-full flex-col p-4">
    <div className="mb-1 flex items-center gap-2">
      <h3 className="font-heading text-xl font-semibold normal-case leading-tight tracking-[0.03em] text-white">
        {liveDarshanFeature.title}
      </h3>
      <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 font-ui text-[10px] font-bold tracking-wide text-white">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white motion-reduce:animate-none" />
        {liveDarshanFeature.liveLabel}
      </span>
    </div>
    <p className="mb-2 font-ui text-[0.9rem] leading-[1.45] text-white/60">{liveDarshanFeature.description}</p>

    <div className="mb-2 h-[110px] w-full overflow-hidden rounded-lg">
      <img
        src={liveDarshanFeature.image}
        alt={liveDarshanFeature.title}
        className="h-full w-full object-cover object-[50%_42%] transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        loading="lazy"
      />
    </div>

    <div className="mb-3 grid grid-cols-3 gap-2">
      {liveDarshanFeature.thumbnails.map((thumb, i) => (
        <div key={i} className="h-9 overflow-hidden rounded-md border border-white/10">
          <img src={thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
        </div>
      ))}
    </div>

    <FeatureButton to={liveDarshanFeature.buttonPath} label={liveDarshanFeature.buttonLabel} size="sm" className="mt-auto self-start" />
  </FeatureCardShell>
);

export default memo(LiveDarshanCard);
