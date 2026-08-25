export interface AstrologyTool {
  title: string;
  description: string;
  /** Path under /public — swap these files for final artwork, no code changes needed. */
  image: string;
  button: string;
  path: string;
}

export const tools: AstrologyTool[] = [
  {
    title: "AI Tarot Reading",
    description:
      "Receive AI-powered tarot guidance for love, career, finance, and life's important decisions.",
    image: "/placeholders/tarot-card.webp",
    button: "Try Now",
    path: "/tarot",
  },
  {
    title: "Birth Chart",
    description:
      "Generate your complete birth chart with detailed astrological insights.",
    image: "/placeholders/Birth-Chart.webp",
    button: "Generate",
    path: "/birth-chart",
  },
  {
    title: "Compatibility",
    description:
      "Discover relationship compatibility using advanced astrology matching.",
    image: "/placeholders/Compatibility.webp",
    button: "Check Now",
    path: "/compatibility",
  },
  {
    title: "Palm Reading",
    description:
      "Upload your palm and receive an AI-generated palm analysis.",
    image: "/placeholders/Palm-Reading.webp",
    button: "Analyze",
    path: "/palm-reading",
  },
  {
    title: "AI Name Analysis",
    description:
      "Analyze your name's numerology and discover hidden personality insights.",
    image: "/placeholders/AI-name-analysis.webp",
    button: "Analyze",
    path: "/name-destiny-report",
  },
  {
    title: "Daily Horoscope",
    description:
      "Read personalized daily horoscope predictions based on your zodiac sign.",
    image: "/placeholders/Daily-horoscope.webp",
    button: "Read Now",
    path: "/horoscopes",
  },
];
