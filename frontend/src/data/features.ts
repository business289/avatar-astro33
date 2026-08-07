import type { LucideIcon } from "lucide-react";
import { Landmark, PartyPopper, Flame, BookOpen, Bell, Music2 } from "lucide-react";

export interface BirthChartFeature {
  badge: string;
  title: string;
  description: string;
  buttonLabel: string;
  buttonPath: string;
  /** Path under /public — swap for final artwork, no code changes needed. */
  image: string;
  checklist: string[];
}

export const birthChartFeature: BirthChartFeature = {
  badge: "Featured",
  title: "AI Birth Chart",
  description:
    "Generate your accurate Kundli in seconds with AI and get detailed planetary insights.",
  buttonLabel: "Generate Your Chart",
  buttonPath: "/birth-chart",
  image: "/placeholders/birth-chart-placeholder.svg",
  checklist: [
    "Detailed Planet Positions",
    "Dasha & Predictions",
    "Strengths & Challenges",
    "Remedies & Guidance",
  ],
};

export interface LiveDarshanFeature {
  title: string;
  liveLabel: string;
  description: string;
  image: string;
  thumbnails: string[];
  buttonLabel: string;
  buttonPath: string;
}

export const liveDarshanFeature: LiveDarshanFeature = {
  title: "Live Darshan",
  liveLabel: "LIVE",
  description:
    "Watch live darshan from India's sacred temples and feel divine blessings from anywhere.",
  image: "/placeholders/golden-temple.webp",
  thumbnails: [
    "/placeholders/iskon.webp",
    "/placeholders/mahalaskhmi-temple.webp",
    "/placeholders/ram-mandir.webp",
  ],
  buttonLabel: "Watch Live",
  buttonPath: "/avatar-live/darshan",
};

export interface AIGuruFeature {
  title: string;
  description: string;
  image: string;
  inputPlaceholder: string;
  buttonLabel: string;
  buttonPath: string;
}

export const aiGuruFeature: AIGuruFeature = {
  title: "AI Guru",
  description:
    "Ask anything, anytime. Get spiritual guidance, answers and clarity from our AI-powered guru.",
  image: "/placeholders/guruji.webp",
  inputPlaceholder: "Ask your question...",
  buttonLabel: "Talk to AI Guru",
  buttonPath: "/inner-voice/chat",
};

export interface DevotionItem {
  label: string;
  icon: LucideIcon;
  path: string;
}

export const devotionItems: DevotionItem[] = [
  { label: "Temples", icon: Landmark, path: "/avatar-live/darshan" },
  { label: "Festivals", icon: PartyPopper, path: "/puja" },
  { label: "Daily Aarti", icon: Flame, path: "/avatar-live/darshan" },
  { label: "Spiritual Books", icon: BookOpen, path: "/inner-voice/wisdom" },
  { label: "Puja & Remedies", icon: Bell, path: "/puja" },
  { label: "Mantras & Chants", icon: Music2, path: "/inner-voice/wisdom" },
];

export const devotionFeature = {
  title: "Devotion & Spirituality",
  items: devotionItems,
  buttonLabel: "Explore All",
  buttonPath: "/puja",
};
