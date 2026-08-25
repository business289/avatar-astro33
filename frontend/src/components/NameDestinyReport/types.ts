import type { NameProfileScore, NameVariant } from "@/lib/numerology";

export interface NarrativeResponse {
  frictionExplanation: string;
  wealthPotential: string;
  relationshipEnergy: string;
  careerAlignment: string;
  remedies: string[];
  signatureAnalysisNote: string;
  topVariantExplanation: string;
}

export interface NameDestinyReportProps {
  name: string;
  dob: string;
  zodiac: string;
  lifePath: number;
}

export type { NameProfileScore, NameVariant };
