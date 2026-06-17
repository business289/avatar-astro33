import { type Language } from "./useLanguageDetection";

// ── Clearly off-topic patterns (checked first — these must ALWAYS be rejected) ──
const OFF_TOPIC_PATTERNS = [
  /\bgdp\b/i, /\bgross domestic/i, /\bpython\b/i, /\bjavascript\b/i,
  /\breact\b/i, /\bnode\.?js\b/i, /\bsql\b/i, /\bhtml\b/i, /\bcss\b/i,
  /\bapi\b.*\bcode\b/i, /\bwrite.*code\b/i, /\bcreate.*app\b/i,
  /\bbuild.*website\b/i, /\bipl\b/i, /\bcricket.*score\b/i,
  /\btell.*joke\b/i, /\bjoke\b/i, /\brecipe\b/i, /\bcooking\b/i,
  /\balgorithm\b/i, /\bcompile\b/i, /\bdebug\b/i, /\bprogram.*code\b/i,
  /\bsyntax\b/i, /\bchatgpt\b/i, /\bopenai\b/i, /\bmachine learning\b/i,
  /\bneural network\b/i, /\bstockmarket.*tips\b/i, /\bshare.*market.*predict\b/i,
  /\bweather.*forecast\b/i, /\bnews.*today\b/i, /\bsports.*score\b/i,
  /\bwrite.*essay\b/i, /\btranslate.*document\b/i,
];

// ── Allowed topic keywords (checked after off-topic filter) ──
const ALLOWED_KEYWORDS = [
  // Career / Work
  "career","job","naukri","work","kaam","office","boss","salary","promotion",
  "interview","business","employment","unemploy","resign","fired","layoff",
  "profession","colleague","coworker","workplace","manager","appraisal",
  // Relationships
  "relationship","rishta","love","pyaar","marriage","shaadi","vivah","divorce",
  "talaq","girlfriend","boyfriend","husband","wife","partner","breakup",
  "propose","wedding","engagement","affair","family","parivar",
  // Family
  "father","mother","maa","baap","papa","bhai","brother","behen","sister",
  "children","bachche","bachcha","son","daughter","parents","sibling",
  "in-law","sasural","joint family","ghar","home","domestic",
  // Health & Mental Wellness
  "health","swasthya","stress","tension","anxiety","depression","sad","dukhi",
  "mental","emotional","feeling","mood","sleep","neend","energy","tired",
  "sick","bimari","pain","suffering","peace","shanti","calm","restless",
  "panic","overwhelm","lonely","akela","hopeless","hopeful",
  // Finance
  "money","paisa","finance","debt","loan","savings","investment","rent","expense",
  "income","salary","financial","poor","amir","garib","budget","bankrupt",
  "afford","paise","kharcha",
  // Spiritual / Life purpose
  "spiritual","adhyatm","karma","dharma","dharm","purpose","meaning","soul",
  "god","ishwar","bhagwan","divine","prayer","puja","mantra","meditation",
  "destiny","fate","future","bhavishy","life","zindagi","jeevan","past life",
  "reincarnation","moksha","mukti","blessing","curse","luck","kismat",
  // Emotions / Struggles
  "fear","darr","anger","gussa","grief","loss","trauma","hurt","heartbreak",
  "worry","pareshan","problem","mushkil","issue","trouble","struggle",
  "confused","lost","direction","guidance","help","advice","support",
  // General personal
  "mujhe","meri","mera","mere","main","aap","hoon","chahta","chahti",
  "samajh","sochna","lagta","lagti","kya karun","kya karu","batao",
  "help me","guide me","tell me","please","kripaya","suggest",
];

const REJECTION: Record<Language, string> = {
  hindi:
    "मैं केवल जीवन, करियर, रिश्तों, स्वास्थ्य और आध्यात्मिक मार्गदर्शन से जुड़े विषयों पर आपकी बात सुन सकता हूँ।",
  english:
    "I am here only to listen to matters of the heart and spirit. Please share concerns related to career, relationships, health, finances, or spiritual guidance.",
  hinglish:
    "Main sirf aapke jeevan, career, relationships, health aur spiritual guidance se jude sawalon mein madad kar sakta hoon.",
};

export function useConsultationGuard() {
  const isAllowedTopic = (text: string): boolean => {
    const q = text.toLowerCase();

    // Step 1: Reject if clearly off-topic (tech, trivia, code, scores)
    if (OFF_TOPIC_PATTERNS.some((p) => p.test(q))) return false;

    // Step 2: Accept if any allowed keyword present
    if (ALLOWED_KEYWORDS.some((kw) => q.includes(kw))) return true;

    // Step 3: Accept short personal/emotional sentences that don't trigger off-topic
    // (e.g. "I don't know what to do", "bahut dukh ho raha hai")
    const wordCount = q.trim().split(/\s+/).length;
    if (wordCount >= 4 && wordCount <= 25) return true;

    return false;
  };

  const getRejectionMessage = (lang: Language): string => REJECTION[lang];

  return { isAllowedTopic, getRejectionMessage };
}
