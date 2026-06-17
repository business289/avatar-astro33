import { type Language } from "./useLanguageDetection";

export const ALLOWED_TOPICS = [
  // English
  "career","job","business","finance","money","relationship","marriage",
  "family","health","stress","anxiety","spiritual","karma","purpose",
  "future","peace","emotions","guidance","life","work","office","boss",
  "salary","debt","loan","sick","pain","hurt","fear","angry","depression",
  "sad","happiness","loneliness","meaning","growth","success","failure",
  "dream","goal","love","worry","worried","depressed","grief","divorce",
  "children","parents","father","mother","brother","sister","friend",
  // Hindi (Hinglish transliterations)
  "naukri","paisa","rishta","vivah","parivar","swasthya","tension",
  "adhyatm","mann","sukh","dukh","mushkil","rasta","safalta","sapna",
  "darr","bimari","pyaar","shaadi","talaq","bachche","maa","baap",
  "bhai","behen","dost","nafrat","gussa","dil","khushi","takleef",
  "pareshan","ummeed","niraasha","akela","zindagi","duniya","baat",
  // Devanagari (partial match patterns covered by detectLanguage)
  "नौकरी","पैसा","रिश्ता","विवाह","परिवार","स्वास्थ्य","तनाव",
  "आध्यात्म","करियर","प्यार","शादी","भविष्य","शांति","जीवन",
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
    const query = text.toLowerCase();
    return ALLOWED_TOPICS.some((topic) =>
      query.includes(topic.toLowerCase())
    );
  };

  const getRejectionMessage = (lang: Language): string => REJECTION[lang];

  return { isAllowedTopic, getRejectionMessage };
}
