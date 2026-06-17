import { useState, useRef, useEffect, useCallback } from "react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useTextToSpeech } from "../hooks/useTextToSpeech";
import { useLanguageDetection } from "../hooks/useLanguageDetection";
import { useConsultationGuard } from "../hooks/useConsultationGuard";

// ── API ──────────────────────────────────────────────────────────────────────
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Future-upgrade hook: swap provider to use ElevenLabs / OpenAI TTS / Google TTS
// without touching the UI — just change TTS_PROVIDER and implement the adapter below.
export const TTS_PROVIDER = "browser"; // "browser" | "elevenlabs" | "openai" | "google"

// ── Transliteration ──────────────────────────────────────────────────────────
// Safety net: if speech recognition still returns Devanagari, convert to Roman.
// Primary fix is using lang="en-IN" for recognition which prevents Devanagari output.
const DEVA_WORDS: Record<string, string> = {
  "मुझे":"mujhe","मेरा":"mera","मेरी":"meri","मेरे":"mere","मैं":"main",
  "आप":"aap","हूं":"hoon","हूँ":"hoon","है":"hai","हैं":"hain",
  "था":"tha","थी":"thi","थे":"the","हो":"ho","होगा":"hoga","होगी":"hogi",
  "नहीं":"nahi","क्या":"kya","क्यों":"kyun","कैसे":"kaise","कब":"kab",
  "कहाँ":"kahan","कितना":"kitna","और":"aur","लेकिन":"lekin","क्योंकि":"kyunki",
  "तो":"toh","पर":"par","में":"mein","से":"se","को":"ko","का":"ka","की":"ki","के":"ke",
  "भी":"bhi","बहुत":"bahut","थोड़ा":"thoda","ज्यादा":"zyada","सिर्फ":"sirf",
  "अभी":"abhi","पहले":"pehle","बाद":"baad","फिर":"phir","अगर":"agar",
  "जब":"jab","हाँ":"haan","ठीक":"theek","सही":"sahi","अच्छा":"achha",
  "नौकरी":"naukri","पैसा":"paisa","रिश्ता":"rishta","विवाह":"vivah",
  "परिवार":"parivar","स्वास्थ्य":"swasthya","तनाव":"tanav","घर":"ghar",
  "प्यार":"pyaar","शादी":"shaadi","जिंदगी":"zindagi","काम":"kaam",
  "करियर":"career","जॉब":"job","प्रॉब्लम":"problem","समझ":"samajh",
  "पंडित":"Pandit","जी":"ji","आपके":"aapke",
  "दोस्त":"dost","भाई":"bhai","बहन":"behen","माँ":"maa","बाप":"baap",
  "बच्चा":"bachcha","चिंता":"chinta","डर":"darr","खुश":"khush",
  "दुखी":"dukhi","प्रेम":"prem","सोचना":"sochna",
  "मिलता":"milta","रहना":"rehna","भविष्य":"bhavishy","शांति":"shanti",
  "जीवन":"jeevan","आध्यात्म":"adhyatm","कर्म":"karma","मन":"mann",
  "धर्म":"dharm","ईश्वर":"ishwar",
};

const DEVA_CHARS: Record<string, string> = {
  "क":"k","ख":"kh","ग":"g","घ":"gh","ङ":"ng",
  "च":"ch","छ":"chh","ज":"j","झ":"jh","ञ":"ny",
  "ट":"t","ठ":"th","ड":"d","ढ":"dh","ण":"n",
  "त":"t","थ":"th","द":"d","ध":"dh","न":"n",
  "प":"p","फ":"ph","ब":"b","भ":"bh","म":"m",
  "य":"y","र":"r","ल":"l","व":"v","श":"sh",
  "ष":"sh","स":"s","ह":"h","ळ":"l",
  "अ":"a","आ":"aa","इ":"i","ई":"ee","उ":"u","ऊ":"oo","ऋ":"ri",
  "ए":"e","ऐ":"ai","ओ":"o","औ":"au",
  "ा":"aa","ि":"i","ी":"ee","ु":"u","ू":"oo",
  "े":"e","ै":"ai","ो":"o","ौ":"au",
  "ं":"n","ः":"h","ँ":"n","्":"",
  "।":"."," ॥":".",
  "०":"0","१":"1","२":"2","३":"3","४":"4",
  "५":"5","६":"6","७":"7","८":"8","९":"9",
};

function transliterateToRoman(text: string): string {
  if (!/[ऀ-ॿ]/.test(text)) return text;
  let result = text;
  // Word-level replacements first (more accurate)
  for (const [key, val] of Object.entries(DEVA_WORDS)) {
    result = result.replace(new RegExp(key, "g"), val);
  }
  // Character-level fallback for remaining Devanagari
  result = result.replace(/[ऀ-ॿ]+/g, (match) =>
    match.split("").map((c) => DEVA_CHARS[c] ?? "").join("")
  );
  return result.replace(/\s{2,}/g, " ").trim();
}

// ── Male Voice Selection ─────────────────────────────────────────────────────
// Priority: Microsoft Ravi → Google हिन्दी male → en-IN male → any hi-IN → null
let _cachedMaleVoice: SpeechSynthesisVoice | null | undefined = undefined;

function getPreferredMaleVoice(): SpeechSynthesisVoice | null {
  if (_cachedMaleVoice !== undefined) return _cachedMaleVoice;
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const name = (v: SpeechSynthesisVoice) => v.name.toLowerCase();
  const isFemale = (v: SpeechSynthesisVoice) =>
    name(v).includes("female") || name(v).includes("woman") ||
    name(v).includes("zira") || name(v).includes("heera") ||
    name(v).includes("lekha");

  const pick =
    voices.find((v) => name(v).includes("ravi")) ||
    voices.find((v) => v.lang === "hi-IN" && !isFemale(v)) ||
    voices.find((v) => v.lang.startsWith("hi") && !isFemale(v)) ||
    voices.find((v) => v.lang === "en-IN" && !isFemale(v)) ||
    voices.find((v) => v.lang === "hi-IN") ||
    voices.find((v) => v.lang.startsWith("hi")) ||
    voices.find((v) => v.lang === "en-IN") ||
    null;

  _cachedMaleVoice = pick;
  return pick;
}

// ── System Prompt ────────────────────────────────────────────────────────────
const VOICE_SYSTEM_PROMPT = `You are Pandit Rameshwar Ji, a deeply compassionate spiritual guide with 40 years of Jyotish experience. A seeker is speaking to you and your words will be read aloud.

You ONLY discuss: career, job, business, relationships, marriage, family, health, finances, stress, anxiety, spirituality, karma, life purpose, emotional struggles, inner peace, future guidance. Politely refuse every other topic.

LANGUAGE RULE — always match the seeker's style exactly:
- If they used Roman Hindi / Hinglish words (meri, nahi, bahut, karo, etc.) → respond in Hinglish
- If they spoke English → respond in English
- Never use Devanagari script in your response — always write in Roman letters

Your response structure:
1. Warmly acknowledge their feelings with empathy (1 sentence)
2. Provide wise spiritual or practical guidance (1–2 sentences)
3. Suggest one specific, actionable step they can take today
4. Include a brief mantra or affirmation in Roman script if helpful
5. Close with ONE caring follow-up question

RULES:
- MAXIMUM 4–5 sentences total — this is read aloud by a voice
- Never mention AI, ChatGPT, OpenAI, or any technology
- Never say you are artificial, a bot, or a program
- You are Pandit Rameshwar Ji — a warm, wise human spiritual guide`;

// ── Types ────────────────────────────────────────────────────────────────────
type MicState = "idle" | "listening" | "processing" | "speaking" | "error";

interface ConvEntry {
  role: "user" | "pandit";
  text: string;
  ttsLang: string;
}

interface AudioState {
  playingIdx: number | null;
  paused: boolean;
  progress: number;   // 0–100
  elapsed: number;    // seconds
  duration: number;   // seconds (estimated)
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const VC_CSS = `
.vc-root{display:flex;flex-direction:column;height:100%;overflow:hidden;}
.vc-topbar{flex-shrink:0;padding:7px 20px;display:flex;align-items:center;gap:8px;border-bottom:1px solid rgba(255,255,255,.06);background:rgba(10,10,15,.55);}
.vc-topbar-title{font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:rgba(255,255,255,.25);font-family:'Space Mono',monospace;margin-right:auto;}
.vc-ctrl-btn{display:flex;align-items:center;gap:5px;padding:5px 11px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:7px;color:rgba(255,255,255,.6);font-size:12px;cursor:pointer;transition:all .2s;font-family:'Inter',sans-serif;white-space:nowrap;}
.vc-ctrl-btn:hover{background:rgba(255,255,255,.1);color:#fff;}
.vc-ctrl-btn.vc-muted{background:rgba(251,113,133,.08);border-color:rgba(251,113,133,.22);color:#fda4af;}
.vc-history{flex:1;overflow-y:auto;padding:22px 26px;display:flex;flex-direction:column;gap:16px;}
.vc-history::-webkit-scrollbar{width:3px;}
.vc-history::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:2px;}
.vc-welcome{text-align:center;padding:44px 24px 24px;max-width:480px;margin:auto;}
.vc-welcome-om{font-size:58px;filter:drop-shadow(0 0 28px rgba(212,175,55,.5));margin-bottom:18px;line-height:1;}
.vc-welcome-text{font-size:17px;color:rgba(255,255,255,.62);line-height:1.9;white-space:pre-line;font-family:'Cormorant Garamond',serif;}
.vc-msg{display:flex;gap:10px;animation:vc-in .3s ease-out;}
@keyframes vc-in{from{opacity:0;transform:translateY(7px);}to{opacity:1;transform:translateY(0);}}
.vc-msg-user{flex-direction:row-reverse;}
.vc-msg-av{width:32px;height:32px;min-width:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;margin-top:2px;flex-shrink:0;}
.vc-msg-pandit .vc-msg-av{background:linear-gradient(135deg,rgba(139,92,246,.45),rgba(212,175,55,.2));border:1.5px solid rgba(212,175,55,.3);}
.vc-msg-user .vc-msg-av{background:rgba(255,255,255,.1);border:1.5px solid rgba(255,255,255,.14);}
.vc-msg-body{max-width:82%;display:flex;flex-direction:column;gap:8px;}
.vc-msg-text{font-size:15px;line-height:1.78;padding:12px 16px;}
.vc-msg-pandit .vc-msg-text{background:#14141c;border:1px solid rgba(255,255,255,.08);border-radius:4px 14px 14px 14px;color:#e8e8e8;}
.vc-msg-user .vc-msg-text{background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.13);border-radius:14px 14px 4px 14px;color:#fff;}
/* ── Audio Player ── */
.vc-audio-card{background:rgba(8,8,16,.9);border:1px solid rgba(251,113,133,.18);border-radius:12px;overflow:hidden;}
.vc-audio-wave{display:flex;gap:2px;align-items:center;height:44px;padding:6px 14px;background:rgba(251,113,133,.04);}
.vc-wave-bar{flex:1;background:rgba(251,113,133,.28);border-radius:2px;transform:scaleY(0.3);transform-origin:center;}
.vc-wave-bar.vc-wave-on{animation:vc-wv .7s ease-in-out infinite;background:rgba(251,113,133,.8);}
@keyframes vc-wv{0%,100%{transform:scaleY(0.25);}50%{transform:scaleY(1);}}
.vc-audio-prog-row{display:flex;align-items:center;gap:8px;padding:4px 14px 2px;}
.vc-audio-time{font-size:10px;color:rgba(255,255,255,.38);font-family:'Space Mono',monospace;min-width:32px;}
.vc-audio-track{flex:1;height:3px;background:rgba(255,255,255,.1);border-radius:2px;position:relative;cursor:pointer;}
.vc-audio-fill{height:100%;background:linear-gradient(90deg,#fb7185,#D4AF37);border-radius:2px;position:relative;transition:width .1s linear;}
.vc-audio-thumb{width:9px;height:9px;background:#fb7185;border-radius:50%;position:absolute;right:-4px;top:-3px;box-shadow:0 0 6px rgba(251,113,133,.7);}
.vc-audio-btns{display:flex;gap:5px;padding:8px 12px 10px;flex-wrap:wrap;}
.vc-ab{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;font-size:11px;cursor:pointer;transition:all .18s;font-family:'Inter',sans-serif;border:1px solid;white-space:nowrap;}
.vc-ab-play{background:rgba(251,113,133,.12);border-color:rgba(251,113,133,.28);color:#fda4af;}
.vc-ab-play:hover{background:rgba(251,113,133,.22);}
.vc-ab-pause{background:rgba(251,113,133,.12);border-color:rgba(251,113,133,.28);color:#fda4af;}
.vc-ab-stop{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.1);color:rgba(255,255,255,.55);}
.vc-ab-stop:hover{background:rgba(255,255,255,.1);}
.vc-ab-replay{background:rgba(212,175,55,.08);border-color:rgba(212,175,55,.22);color:rgba(212,175,55,.8);}
.vc-ab-replay:hover{background:rgba(212,175,55,.18);}
/* ── Mic area ── */
.vc-mic-area{flex-shrink:0;padding:18px 24px 26px;display:flex;flex-direction:column;align-items:center;gap:11px;border-top:1px solid rgba(255,255,255,.06);background:rgba(8,8,14,.8);}
.vc-mic-ring{width:88px;height:88px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;user-select:none;transition:background .3s,border-color .3s,box-shadow .3s;}
.vc-mic-ring:not(.vc-mic-processing):active{transform:scale(.94);}
.vc-mic-idle{background:rgba(212,175,55,.07);border:2px solid rgba(212,175,55,.38);box-shadow:0 0 20px rgba(212,175,55,.14);}
.vc-mic-idle:hover{background:rgba(212,175,55,.14);box-shadow:0 0 34px rgba(212,175,55,.3);}
.vc-mic-listening{background:rgba(251,113,133,.1);border:2px solid rgba(251,113,133,.55);animation:vc-pr 1s ease-in-out infinite;}
.vc-mic-processing{background:rgba(167,139,250,.08);border:2px solid rgba(167,139,250,.5);animation:vc-pp 1.6s ease-in-out infinite;cursor:default;}
.vc-mic-speaking{background:rgba(110,231,249,.08);border:2px solid rgba(110,231,249,.45);animation:vc-pt 1.2s ease-in-out infinite;}
.vc-mic-error{background:rgba(248,113,113,.08);border:2px solid rgba(248,113,113,.38);cursor:default;}
@keyframes vc-pr{0%,100%{box-shadow:0 0 20px rgba(251,113,133,.28);}50%{box-shadow:0 0 52px rgba(251,113,133,.65),0 0 90px rgba(251,113,133,.18);}}
@keyframes vc-pp{0%,100%{box-shadow:0 0 20px rgba(167,139,250,.22);}50%{box-shadow:0 0 52px rgba(167,139,250,.5),0 0 90px rgba(167,139,250,.12);}}
@keyframes vc-pt{0%,100%{box-shadow:0 0 20px rgba(110,231,249,.22);}50%{box-shadow:0 0 52px rgba(110,231,249,.5),0 0 90px rgba(110,231,249,.12);}}
.vc-mic-icon{font-size:34px;line-height:1;}
.vc-mic-label{font-size:13px;letter-spacing:.3px;text-align:center;transition:color .3s;font-family:'Inter',sans-serif;min-height:18px;}
.vc-transcript-box{max-width:460px;width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:9px 15px;font-size:14px;color:rgba(255,255,255,.56);text-align:center;font-style:italic;line-height:1.6;}
.vc-speak-bars{display:flex;gap:4px;align-items:center;height:20px;}
.vc-sp-bar{width:3px;border-radius:3px;background:#6EE7F9;animation:vc-sb .8s ease-in-out infinite;}
.vc-sp-bar:nth-child(1){height:6px;animation-delay:0s;}
.vc-sp-bar:nth-child(2){height:13px;animation-delay:.11s;}
.vc-sp-bar:nth-child(3){height:20px;animation-delay:.22s;}
.vc-sp-bar:nth-child(4){height:13px;animation-delay:.33s;}
.vc-sp-bar:nth-child(5){height:6px;animation-delay:.44s;}
@keyframes vc-sb{0%,100%{transform:scaleY(.3);opacity:.45;}50%{transform:scaleY(1);opacity:1;}}
`;

// Bar heights for waveform (static random-ish pattern that looks natural)
const WAVE_HEIGHTS = [
  0.35,0.55,0.80,0.65,0.90,0.50,1.00,0.70,0.45,0.85,
  0.60,0.95,0.40,0.75,0.55,0.88,0.45,0.70,0.60,0.38,
];

function fmtSec(s: number) {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

function estimateDuration(text: string) {
  // ~130 words/min for slow speech; avg word ~5 chars
  return Math.max((text.replace(/\s+/g, " ").length / 5) / (130 / 60), 2);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function VoiceConsultation() {
  const [micState, setMicState] = useState<MicState>("idle");
  const [transcript, setTranscript] = useState("");
  const [conversation, setConversation] = useState<ConvEntry[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [audio, setAudio] = useState<AudioState>({
    playingIdx: null, paused: false, progress: 0, elapsed: 0, duration: 0,
  });

  const transcriptRef = useRef("");
  const abortRef = useRef(false);
  const historyRef = useRef<HTMLDivElement>(null);
  const audioTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioStartRef = useRef(0);
  const audioPausedElapsedRef = useRef(0);

  const tts = useTextToSpeech();
  const { detectLanguage, getTTSLang } = useLanguageDetection();
  const { isAllowedTopic, getRejectionMessage } = useConsultationGuard();

  // Voices load asynchronously in Chrome — reset cache when they arrive
  useEffect(() => {
    const onVoicesChanged = () => { _cachedMaleVoice = undefined; };
    window.speechSynthesis?.addEventListener("voiceschanged", onVoicesChanged);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", onVoicesChanged);
  }, []);

  // CSS injection
  useEffect(() => {
    const id = "vc-style-tag";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id; s.textContent = VC_CSS;
      document.head.appendChild(s);
    }
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  // Auto-scroll
  useEffect(() => {
    historyRef.current?.scrollTo({ top: historyRef.current.scrollHeight, behavior: "smooth" });
  }, [conversation]);

  // ── Audio helpers ────────────────────────────────────────────────────────────
  const clearAudioTimer = useCallback(() => {
    if (audioTimerRef.current) { clearInterval(audioTimerRef.current); audioTimerRef.current = null; }
  }, []);

  const speakWithControls = useCallback((idx: number, text: string, ttsLang: string, onDone?: () => void) => {
    clearAudioTimer();
    tts.stop();

    // Select preferred male voice
    const voice = getPreferredMaleVoice();
    const dur = estimateDuration(text);
    audioPausedElapsedRef.current = 0;
    audioStartRef.current = Date.now();

    setAudio({ playingIdx: idx, paused: false, progress: 0, elapsed: 0, duration: dur });

    audioTimerRef.current = setInterval(() => {
      const elapsed = audioPausedElapsedRef.current + (Date.now() - audioStartRef.current) / 1000;
      setAudio((a) => ({ ...a, elapsed, progress: Math.min((elapsed / dur) * 100, 99) }));
    }, 80);

    // Speak — inject preferred voice via the utterance override
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = ttsLang;
      utt.rate = 0.86;
      utt.pitch = 0.90;
      if (voice) utt.voice = voice;
      utt.onend = () => {
        clearAudioTimer();
        setAudio((a) => ({ ...a, playingIdx: null, paused: false, progress: 100, elapsed: dur }));
        onDone?.();
      };
      utt.onerror = () => {
        clearAudioTimer();
        setAudio((a) => ({ ...a, playingIdx: null, paused: false }));
        onDone?.();
      };
      window.speechSynthesis.speak(utt);
    }
  }, [tts, clearAudioTimer]);

  const pauseAudio = useCallback(() => {
    window.speechSynthesis?.pause();
    clearAudioTimer();
    audioPausedElapsedRef.current += (Date.now() - audioStartRef.current) / 1000;
    setAudio((a) => ({ ...a, paused: true }));
  }, [clearAudioTimer]);

  const resumeAudio = useCallback((idx: number, text: string, ttsLang: string) => {
    if (window.speechSynthesis?.paused) {
      window.speechSynthesis.resume();
      audioStartRef.current = Date.now();
      const dur = audio.duration;
      audioTimerRef.current = setInterval(() => {
        const elapsed = audioPausedElapsedRef.current + (Date.now() - audioStartRef.current) / 1000;
        setAudio((a) => ({ ...a, elapsed, progress: Math.min((elapsed / dur) * 100, 99) }));
      }, 80);
      setAudio((a) => ({ ...a, paused: false }));
    } else {
      // Some browsers don't support resume — replay instead
      speakWithControls(idx, text, ttsLang);
    }
  }, [audio.duration, speakWithControls]);

  const stopAudio = useCallback(() => {
    window.speechSynthesis?.cancel();
    clearAudioTimer();
    audioPausedElapsedRef.current = 0;
    setAudio({ playingIdx: null, paused: false, progress: 0, elapsed: 0, duration: 0 });
  }, [clearAudioTimer]);

  // ── Speech Recognition ────────────────────────────────────────────────────────
  // lang: "en-IN" ensures browser returns Roman-script output (not Devanagari).
  const { start, stop, supported } = useSpeechRecognition({
    lang: "en-IN",
    onResult: (text) => {
      const roman = transliterateToRoman(text);
      setTranscript(roman);
      transcriptRef.current = roman;
    },
    onEnd: () => {
      const text = transcriptRef.current.trim();
      transcriptRef.current = "";
      setTranscript("");
      if (!text) { setMicState("idle"); return; }
      processUserSpeech(text);
    },
    onError: (err) => {
      const msg = err === "no-speech"
        ? "No speech detected. Please tap and try again."
        : "Microphone error. Please check permissions.";
      setErrorMsg(msg);
      setMicState("error");
      setTimeout(() => { setMicState("idle"); setErrorMsg(""); }, 3500);
    },
  });

  // ── Main conversation handler ────────────────────────────────────────────────
  async function processUserSpeech(text: string) {
    if (abortRef.current) return;

    const lang = detectLanguage(text);
    const ttsLang = getTTSLang(lang);
    const updatedConv: ConvEntry[] = [...conversation, { role: "user", text, ttsLang }];
    setConversation(updatedConv);

    // Topic guard
    if (!isAllowedTopic(text)) {
      const rejection = getRejectionMessage(lang);
      if (abortRef.current) return;
      const newIdx = updatedConv.length;
      setConversation((c) => [...c, { role: "pandit", text: rejection, ttsLang }]);
      setMicState("speaking");
      speakWithControls(newIdx, rejection, ttsLang, () => {
        if (!abortRef.current) setMicState("idle");
      });
      return;
    }

    setMicState("processing");

    try {
      const history = updatedConv.map((e) => ({
        role: e.role === "user" ? ("user" as const) : ("assistant" as const),
        content: e.text,
      }));
      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.75,
          max_tokens: 380,
          messages: [{ role: "system", content: VOICE_SYSTEM_PROMPT }, ...history],
        }),
      });
      if (abortRef.current) return;
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const reply = (data.choices?.[0]?.message?.content || "").trim();
      if (!reply) throw new Error("Empty response");
      const replyLang = detectLanguage(reply);
      const replyTtsLang = getTTSLang(replyLang);
      const newIdx = updatedConv.length;
      setConversation((c) => [...c, { role: "pandit", text: reply, ttsLang: replyTtsLang }]);
      setMicState("speaking");
      speakWithControls(newIdx, reply, replyTtsLang, () => {
        if (!abortRef.current) setMicState("idle");
      });
    } catch {
      if (abortRef.current) return;
      const fallback = "Kshama karein, kuch technical samasya aayi hai. Kripaya thodi der baad dobara prayaas karein.";
      const newIdx = updatedConv.length;
      setConversation((c) => [...c, { role: "pandit", text: fallback, ttsLang: "hi-IN" }]);
      setMicState("speaking");
      speakWithControls(newIdx, fallback, "hi-IN", () => {
        if (!abortRef.current) setMicState("idle");
      });
    }
  }

  // ── Mic controls ─────────────────────────────────────────────────────────────
  const handleMicClick = () => {
    if (!supported) {
      setErrorMsg("Speech recognition requires Chrome or Edge browser.");
      setMicState("error");
      setTimeout(() => { setMicState("idle"); setErrorMsg(""); }, 3500);
      return;
    }
    if (micState === "processing") return;
    if (micState === "speaking") { stopAudio(); setMicState("idle"); return; }
    if (micState === "listening") { stop(); return; }
    abortRef.current = false;
    transcriptRef.current = "";
    setTranscript("");
    setErrorMsg("");
    start();
    setMicState("listening");
  };

  const newSession = () => {
    abortRef.current = true;
    stopAudio();
    stop();
    setConversation([]);
    transcriptRef.current = "";
    setTranscript("");
    setMicState("idle");
    setErrorMsg("");
    setTimeout(() => { abortRef.current = false; }, 60);
  };

  // ── Derived display values ────────────────────────────────────────────────────
  const MIC_ICONS: Record<MicState, string> = {
    idle: "🎤", listening: "🔴", processing: "🔮", speaking: "🕉️", error: "⚠️",
  };
  const MIC_COLORS: Record<MicState, string> = {
    idle: "rgba(212,175,55,.75)", listening: "#fda4af",
    processing: "#c4b5fd", speaking: "#6EE7F9", error: "#f87171",
  };
  const micLabel =
    micState === "error" ? (errorMsg || "⚠️ Please try again") :
    micState === "idle" ? "🎤 Tap to Speak" :
    micState === "listening" ? "🌟 I am listening..." :
    micState === "processing" ? "🔮 Understanding your situation..." :
    "🕉️ Pandit Ji is speaking...";

  const WELCOME = "🕉️ Namaste.\n\nPlease share what troubles your heart — whether it is career, relationships, health, finances, or spiritual matters — and I will listen carefully.\n\nYou may speak in Hindi, English, or Hinglish.";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="vc-root">
      {/* Top controls */}
      <div className="vc-topbar">
        <span className="vc-topbar-title">Voice Session</span>
        <button className={`vc-ctrl-btn${tts.muted ? " vc-muted" : ""}`} onClick={tts.toggleMute}>
          {tts.muted ? "🔇 Unmute" : "🔊 Voice On"}
        </button>
        {micState === "listening" && (
          <button className="vc-ctrl-btn" onClick={() => stop()}>⏹ Stop Listening</button>
        )}
        {micState === "speaking" && (
          <button className="vc-ctrl-btn" onClick={() => { stopAudio(); setMicState("idle"); }}>⏹ Stop Speaking</button>
        )}
        {conversation.length > 0 && (
          <button className="vc-ctrl-btn" onClick={newSession}>🔄 New Consultation</button>
        )}
      </div>

      {/* Conversation history */}
      <div className="vc-history" ref={historyRef}>
        {conversation.length === 0 ? (
          <div className="vc-welcome">
            <div className="vc-welcome-om">🕉️</div>
            <div className="vc-welcome-text">{WELCOME}</div>
          </div>
        ) : (
          conversation.map((entry, i) => (
            <div key={i} className={`vc-msg vc-msg-${entry.role}`}>
              <div className="vc-msg-av">{entry.role === "user" ? "🙏" : "🧘"}</div>
              <div className="vc-msg-body">
                <div className="vc-msg-text">{entry.text}</div>
                {/* Audio player for every Pandit Ji response */}
                {entry.role === "pandit" && (
                  <AudioPlayer
                    idx={i}
                    text={entry.text}
                    audio={audio}
                    onPlay={() => speakWithControls(i, entry.text, entry.ttsLang)}
                    onPause={pauseAudio}
                    onResume={() => resumeAudio(i, entry.text, entry.ttsLang)}
                    onStop={stopAudio}
                    onReplay={() => speakWithControls(i, entry.text, entry.ttsLang)}
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mic area */}
      <div className="vc-mic-area">
        {micState === "speaking" && (
          <div className="vc-speak-bars">
            {[1,2,3,4,5].map((n) => <div key={n} className="vc-sp-bar" />)}
          </div>
        )}
        {transcript && micState === "listening" && (
          <div className="vc-transcript-box">{transcript}</div>
        )}
        <div className={`vc-mic-ring vc-mic-${micState}`} onClick={handleMicClick} role="button" aria-label={micLabel}>
          <span className="vc-mic-icon">{MIC_ICONS[micState]}</span>
        </div>
        <div className="vc-mic-label" style={{ color: MIC_COLORS[micState] }}>{micLabel}</div>
      </div>
    </div>
  );
}

// ── AudioPlayer sub-component ─────────────────────────────────────────────────
interface AudioPlayerProps {
  idx: number;
  text: string;
  audio: AudioState;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReplay: () => void;
}

function AudioPlayer({ idx, text, audio, onPlay, onPause, onResume, onStop, onReplay }: AudioPlayerProps) {
  const isThisActive = audio.playingIdx === idx;
  const isPlaying = isThisActive && !audio.paused;
  const isPaused = isThisActive && audio.paused;

  const progress = isThisActive ? audio.progress : 0;
  const elapsed = isThisActive ? audio.elapsed : 0;
  const duration = isThisActive ? audio.duration : estimateDuration(text);

  return (
    <div className="vc-audio-card">
      {/* Waveform */}
      <div className="vc-audio-wave">
        {WAVE_HEIGHTS.map((h, i) => (
          <div
            key={i}
            className={`vc-wave-bar${isPlaying ? " vc-wave-on" : ""}`}
            style={{
              transform: `scaleY(${isPlaying ? h : h * 0.35})`,
              animationDelay: `${(i * 71) % 700}ms`,
              animationDuration: `${0.45 + (i % 4) * 0.15}s`,
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="vc-audio-prog-row">
        <span className="vc-audio-time">{fmtSec(elapsed)}</span>
        <div className="vc-audio-track">
          <div className="vc-audio-fill" style={{ width: `${progress}%` }}>
            {isThisActive && <div className="vc-audio-thumb" />}
          </div>
        </div>
        <span className="vc-audio-time">{fmtSec(duration)}</span>
      </div>

      {/* Controls */}
      <div className="vc-audio-btns">
        {!isThisActive && (
          <button className="vc-ab vc-ab-play" onClick={onPlay}>▶ Play</button>
        )}
        {isPlaying && (
          <button className="vc-ab vc-ab-pause" onClick={onPause}>⏸ Pause</button>
        )}
        {isPaused && (
          <button className="vc-ab vc-ab-play" onClick={onResume}>▶ Resume</button>
        )}
        {isThisActive && (
          <button className="vc-ab vc-ab-stop" onClick={onStop}>⏹ Stop</button>
        )}
        <button className="vc-ab vc-ab-replay" onClick={onReplay}>🔁 Replay</button>
      </div>
    </div>
  );
}
