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
    image: "/images/tools/tarot.jpg",
    button: "Try Now",
    path: "/tarot",
  },
  {
    title: "Birth Chart",
    description:
      "Generate your complete birth chart with detailed astrological insights.",
    image: "/images/tools/birth-chart.jpg",
    button: "Generate",
    path: "/birth-chart",
  },
  {
    title: "Compatibility",
    description:
      "Discover relationship compatibility using advanced astrology matching.",
    image: "/images/tools/compatibility.jpg",
    button: "Check Now",
    path: "/compatibility",
  },
  {
    title: "Palm Reading",
    description:
      "Upload your palm and receive an AI-generated palm analysis.",
    image: "/images/tools/palm-reading.jpg",
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

/**
 * The four tools shown, in this order, in the homepage "Explore Our Astrology Tools" row.
 * The other tools stay in the catalogue above and keep their routes and menu links.
 */
export const HOMEPAGE_TOOL_PATHS = ["/birth-chart", "/tarot", "/compatibility", "/palm-reading"] as const;

export const homepageTools: AstrologyTool[] = HOMEPAGE_TOOL_PATHS.map((path) => {
  const tool = tools.find((t) => t.path === path);
  if (!tool) throw new Error(`Homepage tool ${path} is missing from the tools catalogue`);
  return tool;
});
