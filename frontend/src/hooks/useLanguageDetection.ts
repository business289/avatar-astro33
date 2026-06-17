export type Language = "hindi" | "hinglish" | "english";

// Common Hindi words that appear in Roman-script (Hinglish) text.
// Since recognition is now en-IN, these will always be in Roman letters.
const HINGLISH_MARKERS = [
  "mujhe","mera","meri","mere","main","mai","aap","apna","apni",
  "hoon","hun","hai","hain","tha","thi","the","ho","hoga","hogi",
  "karo","karna","kar","nahi","nahin","kya","kyun","kaise","kab",
  "kahan","kitna","kitni","aur","lekin","kyunki","toh","par","mein",
  "pe","se","ko","ka","ki","ke","bhi","sochna","lagta","lagti",
  "bahut","bilkul","zaroor","thoda","zyada","sirf","abhi","pehle",
  "baad","phir","agar","isliye","aisa","waisa","jab","tab","yeh",
  "woh","kuch","sab","haan","theek","sahi","galat","achha","bura",
  "boht","naukri","paisa","rishta","vivah","parivar","swasthya",
  "ghar","pyaar","shaadi","dost","zindagi","duniya","baat","kaam",
  "problem","pareshan","mushkil","ummeed","dukh","sukh","takleef",
  "darr","gussa","dil","khushi","chinta","safalta","sapna","mann",
  "karma","dharm","ishwar","bhagwan","puja","mantra","jeevan",
  "karun","karu","batao","samajh","sochta","sochti","lagta","rehna",
  "pandit","ji","mujhse","aapse","unse","inse","unka","unki",
];

function containsDevanagari(text: string): boolean {
  return /[ऀ-ॿ]/.test(text);
}

function containsHinglish(text: string): boolean {
  const lower = text.toLowerCase();
  // Tokenize on spaces and common punctuation
  const words = lower.split(/[\s,।?!.;:'"()\-]+/).filter(Boolean);
  return HINGLISH_MARKERS.some(
    (m) => words.includes(m) || lower.includes(` ${m} `)
  );
}

export function useLanguageDetection() {
  const detectLanguage = (text: string): Language => {
    if (!text?.trim()) return "english";
    // Devanagari check kept as fallback (e.g. Pandit Ji's reply might be in Hindi)
    if (containsDevanagari(text)) return "hindi";
    if (containsHinglish(text)) return "hinglish";
    return "english";
  };

  const getTTSLang = (lang: Language): string => {
    if (lang === "hindi") return "hi-IN";
    if (lang === "hinglish") return "hi-IN";
    return "en-IN";
  };

  return { detectLanguage, getTTSLang };
}
