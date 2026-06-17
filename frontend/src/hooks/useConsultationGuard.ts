import { type Language } from "./useLanguageDetection";

// ── Clearly off-topic — ONLY these patterns are rejected ─────────────────────
// Anything not matching here is accepted (spiritual questions are always personal)
const OFF_TOPIC: RegExp[] = [
  // Programming / tech
  /\b(python|javascript|typescript|java|c\+\+|golang|rust|php|ruby|swift|kotlin)\b/i,
  /\b(html|css|sql|react|angular|vue|node\.?js|express|django|flask)\b/i,
  /\b(write.*code|generate.*code|code.*for|debug|compile|syntax error|algorithm)\b/i,
  /\b(create.*website|build.*app|make.*program|develop.*software)\b/i,
  /\b(machine learning|neural network|deep learning|artificial intelligence|chatgpt|openai|gemini)\b/i,
  // Sports / trivia / news
  /\b(ipl|cricket.*score|football.*score|match.*result|sports.*score)\b/i,
  /\b(tell.*joke|jokes|funny story|comedy)\b/i,
  /\b(recipe|how.*cook|cooking.*steps|ingredients)\b/i,
  // Finance/geo facts (not personal)
  /\bgdp\b.*\b(india|country|state)\b/i,
  /\b(stock.*market.*predict|share.*price.*today|nifty.*sensex)\b/i,
  /\b(weather.*forecast|temperature.*today)\b/i,
  /\b(translate.*document|translate.*text)\b/i,
];

const REJECTION: Record<Language, string> = {
  hindi:
    "Mujhe maafi chahiye, main sirf jeevan ke personal muddon mein — career, rishte, swasthya, finances aur adhyatm mein — aapki madad kar sakta hoon.",
  english:
    "I am here only to listen to matters of the heart and spirit — career, relationships, health, finances, and spiritual guidance.",
  hinglish:
    "Main sirf aapke jeevan, career, relationships, health aur spiritual guidance se jude sawalon mein madad kar sakta hoon.",
};

export function useConsultationGuard() {
  const isAllowedTopic = (text: string): boolean => {
    const q = text.toLowerCase().trim();
    if (!q || q.split(/\s+/).length < 2) return false; // too short
    // Reject only if clearly off-topic
    return !OFF_TOPIC.some((p) => p.test(q));
  };

  const getRejectionMessage = (lang: Language): string => REJECTION[lang];

  return { isAllowedTopic, getRejectionMessage };
}
