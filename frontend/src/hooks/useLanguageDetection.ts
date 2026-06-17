export type Language = "hindi" | "hinglish" | "english";

const HINGLISH_MARKERS = [
  "mujhe","mera","meri","mere","main","mai","aap","apna","apni",
  "hoon","hun","hai","hain","tha","thi","the","ho","hoga","hogi",
  "karo","karna","kar","nahi","nahin","kya","kyun","kaise","kab",
  "kahan","kitna","kitni","aur","lekin","kyunki","toh","par","mein",
  "pe","se","ko","ka","ki","ke","bhi","sochna","lagta","lagti",
  "bahut","bilkul","zaroor","thoda","zyada","sirf","abhi","pehle",
  "baad","phir","agar","isliye","aisa","waisa","jab","tab","yeh",
  "woh","kuch","sab","haan","theek","sahi","galat","accha","bura",
  "boht","naukri","paisa","rishta","vivah","parivar","swasthya",
  "tension","ghar","pyaar","shaadi","dost","zindagi","duniya","log",
  "baat","kaam","problem","samasya","mushkil","rasta","ummeed",
  "dukh","sukh","takleef","pareshan","khushi","mann","dil","darr",
  "gussa","nafrat","akela","safalta","sapna","sochta","sochti",
];

function containsDevanagari(text: string): boolean {
  return /[ऀ-ॿ]/.test(text);
}

function containsHinglish(text: string): boolean {
  const lower = text.toLowerCase();
  const words = lower.split(/[\s,।?!.]+/);
  return HINGLISH_MARKERS.some(
    (marker) =>
      words.includes(marker) ||
      lower.includes(` ${marker} `) ||
      lower.startsWith(`${marker} `) ||
      lower.endsWith(` ${marker}`)
  );
}

export function useLanguageDetection() {
  const detectLanguage = (text: string): Language => {
    if (!text || !text.trim()) return "english";
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
