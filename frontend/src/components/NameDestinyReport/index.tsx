import { useNameReport } from "./useNameReport";
import type { NameDestinyReportProps } from "./types";
import DestinyHero from "./sections/DestinyHero";
import BeforeAfterCompare from "./sections/BeforeAfterCompare";
import CoreNumbersGrid from "./sections/CoreNumbersGrid";
import FutureTimeline from "./sections/FutureTimeline";
import LifeHeatmap from "./sections/LifeHeatmap";
import NameFrequencyWave from "./sections/NameFrequencyWave";
import AuraVisualization from "./sections/AuraVisualization";
import NameEvolutionLab from "./sections/NameEvolutionLab";
import SuccessProbability from "./sections/SuccessProbability";
import NameSimulationDeltas from "./sections/NameSimulationDeltas";
import WhatsIncludedGrid from "./sections/WhatsIncludedGrid";
import PricingPaywall from "./sections/PricingPaywall";
import PdfExportButton from "./sections/PdfExportButton";

export default function NameDestinyReport({ name, dob, zodiac }: NameDestinyReportProps) {
  const report = useNameReport(name, dob, zodiac);
  const { profile, topVariant, topVariants, unlocked, setUnlocked } = report;

  return (
    <div className="my-16">
      <DestinyHero profile={profile} topVariant={topVariant} />
      <BeforeAfterCompare name={name} profile={profile} topVariant={topVariant} />
      <CoreNumbersGrid report={report} name={name} />
      <FutureTimeline name={name} profile={profile} topVariant={topVariant} />
      <LifeHeatmap profile={profile} />
      <NameFrequencyWave profile={profile} topVariant={topVariant} />
      <AuraVisualization name={name} dob={dob} report={report} />
      <NameEvolutionLab report={report} />
      <SuccessProbability name={name} profile={profile} />
      <NameSimulationDeltas name={name} profile={profile} topVariants={topVariants} />
      <WhatsIncludedGrid />
      <PdfExportButton name={name} dob={dob} report={report} />
      <PricingPaywall unlocked={unlocked} onUnlock={() => setUnlocked(true)} />
    </div>
  );
}
