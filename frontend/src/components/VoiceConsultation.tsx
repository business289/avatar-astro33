import { useState, useRef, useEffect } from "react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useTextToSpeech } from "../hooks/useTextToSpeech";
import { useLanguageDetection } from "../hooks/useLanguageDetection";
import { useConsultationGuard } from "../hooks/useConsultationGuard";

// ── API ─────────────────────────────────────────────────────────────────────
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Future-upgrade hook: swap this provider object to use ElevenLabs / OpenAI TTS / Google TTS
export const TTS_PROVIDER = "browser"; // "browser" | "elevenlabs" | "openai" | "google"

const VOICE_SYSTEM_PROMPT = `You are Pandit Rameshwar Ji, a compassionate spiritual guide with 40 years of Jyotish experience. A seeker is speaking to you directly and will hear your words aloud.

You ONLY discuss: career, relationships, health, finances, spirituality, emotional struggles, and life guidance. Politely refuse all other topics.

LANGUAGE RULE — match the seeker's exact language:
- Devanagari / pure Hindi → respond in Hindi
- English words → respond in English
- Hindi-English mix (Hinglish) → respond in Hinglish

Your response must:
1. Warmly acknowledge the person's feelings with empathy
2. Provide wise spiritual or practical guidance
3. Suggest one concrete, actionable step
4. Include a brief mantra or affirmation if helpful
5. Close with ONE thoughtful follow-up question

CRITICAL RULES:
- Keep response to 3–5 sentences MAXIMUM — it will be read aloud
- Never mention AI, ChatGPT, OpenAI, or technology of any kind
- Never reveal that you are an artificial intelligence or a bot
- You are Pandit Rameshwar Ji — a wise, caring human spiritual guide
- Speak with warmth, patience, and genuine compassion`;

// ── Types ────────────────────────────────────────────────────────────────────
type MicState = "idle" | "listening" | "processing" | "speaking" | "error";
interface ConvEntry { role: "user" | "pandit"; text: string; }

// ── Constants ────────────────────────────────────────────────────────────────
const WELCOME =
  "🕉️ Namaste.\n\nPlease share what troubles your heart — whether it is career, relationships, health, finances, or spiritual matters — and I will listen carefully.\n\nYou may speak in Hindi, English, or Hinglish.";

const MIC_ICONS: Record<MicState, string> = {
  idle: "🎤",
  listening: "🔴",
  processing: "🔮",
  speaking: "🕉️",
  error: "⚠️",
};

const MIC_COLORS: Record<MicState, string> = {
  idle: "rgba(212,175,55,.75)",
  listening: "#fda4af",
  processing: "#c4b5fd",
  speaking: "#6EE7F9",
  error: "#f87171",
};

// ── CSS ──────────────────────────────────────────────────────────────────────
const VC_CSS = `
.vc-root{display:flex;flex-direction:column;height:100%;overflow:hidden;}
.vc-topbar{flex-shrink:0;padding:7px 20px;display:flex;align-items:center;gap:8px;border-bottom:1px solid rgba(255,255,255,.06);background:rgba(10,10,15,.55);}
.vc-topbar-title{font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:rgba(255,255,255,.25);font-family:'Space Mono',monospace;margin-right:auto;}
.vc-ctrl-btn{display:flex;align-items:center;gap:5px;padding:5px 11px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:7px;color:rgba(255,255,255,.6);font-size:12px;cursor:pointer;transition:all .2s;font-family:'Inter',sans-serif;white-space:nowrap;}
.vc-ctrl-btn:hover{background:rgba(255,255,255,.1);color:#fff;}
.vc-ctrl-btn.vc-muted{background:rgba(251,113,133,.08);border-color:rgba(251,113,133,.22);color:#fda4af;}
.vc-ctrl-btn.vc-muted:hover{background:rgba(251,113,133,.15);}
.vc-history{flex:1;overflow-y:auto;padding:22px 26px;display:flex;flex-direction:column;gap:14px;}
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
.vc-msg-text{max-width:82%;font-size:15px;line-height:1.78;padding:12px 16px;}
.vc-msg-pandit .vc-msg-text{background:#14141c;border:1px solid rgba(255,255,255,.08);border-radius:4px 14px 14px 14px;color:#e8e8e8;}
.vc-msg-user .vc-msg-text{background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.13);border-radius:14px 14px 4px 14px;color:#fff;}
.vc-mic-area{flex-shrink:0;padding:18px 24px 26px;display:flex;flex-direction:column;align-items:center;gap:11px;border-top:1px solid rgba(255,255,255,.06);background:rgba(8,8,14,.8);}
.vc-mic-ring{width:88px;height:88px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;user-select:none;transition:background .3s,border-color .3s,box-shadow .3s;}
.vc-mic-ring:not(.vc-mic-processing):active{transform:scale(.94);}
.vc-mic-idle{background:rgba(212,175,55,.07);border:2px solid rgba(212,175,55,.38);box-shadow:0 0 20px rgba(212,175,55,.14);}
.vc-mic-idle:hover{background:rgba(212,175,55,.14);box-shadow:0 0 34px rgba(212,175,55,.3);}
.vc-mic-listening{background:rgba(251,113,133,.1);border:2px solid rgba(251,113,133,.55);animation:vc-pr 1s ease-in-out infinite;}
.vc-mic-processing{background:rgba(167,139,250,.08);border:2px solid rgba(167,139,250,.5);animation:vc-pp 1.6s ease-in-out infinite;cursor:default;}
.vc-mic-speaking{background:rgba(110,231,249,.08);border:2px solid rgba(110,231,249,.45);animation:vc-pt 1.2s ease-in-out infinite;}
.vc-mic-error{background:rgba(248,113,113,.08);border:2px solid rgba(248,113,113,.38);box-shadow:0 0 18px rgba(248,113,113,.15);cursor:default;}
@keyframes vc-pr{0%,100%{box-shadow:0 0 20px rgba(251,113,133,.28);}50%{box-shadow:0 0 50px rgba(251,113,133,.62),0 0 88px rgba(251,113,133,.18);}}
@keyframes vc-pp{0%,100%{box-shadow:0 0 20px rgba(167,139,250,.22);}50%{box-shadow:0 0 50px rgba(167,139,250,.48),0 0 88px rgba(167,139,250,.12);}}
@keyframes vc-pt{0%,100%{box-shadow:0 0 20px rgba(110,231,249,.22);}50%{box-shadow:0 0 50px rgba(110,231,249,.48),0 0 88px rgba(110,231,249,.12);}}
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
.vc-no-support{text-align:center;padding:60px 24px;color:rgba(255,255,255,.45);font-size:15px;line-height:1.7;}
.vc-no-support-icon{font-size:44px;margin-bottom:16px;}
`;

// ── Component ─────────────────────────────────────────────────────────────────
export default function VoiceConsultation() {
  const [micState, setMicState] = useState<MicState>("idle");
  const [transcript, setTranscript] = useState("");
  const [conversation, setConversation] = useState<ConvEntry[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const transcriptRef = useRef("");
  const abortRef = useRef(false);
  const historyRef = useRef<HTMLDivElement>(null);

  const tts = useTextToSpeech();
  const { detectLanguage, getTTSLang } = useLanguageDetection();
  const { isAllowedTopic, getRejectionMessage } = useConsultationGuard();

  // Inject component CSS once
  useEffect(() => {
    const id = "vc-style-tag";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = VC_CSS;
      document.head.appendChild(s);
    }
    return () => {
      document.getElementById(id)?.remove();
    };
  }, []);

  // Auto-scroll conversation
  useEffect(() => {
    historyRef.current?.scrollTo({
      top: historyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [conversation]);

  // Speech recognition
  const { start, stop, supported } = useSpeechRecognition({
    lang: "hi-IN",
    onResult: (text) => {
      setTranscript(text);
      transcriptRef.current = text;
    },
    onEnd: () => {
      const text = transcriptRef.current.trim();
      transcriptRef.current = "";
      setTranscript("");
      if (!text) {
        setMicState("idle");
        return;
      }
      processUserSpeech(text);
    },
    onError: (err) => {
      const friendly =
        err === "no-speech"
          ? "No speech detected. Please tap and try again."
          : "Microphone error. Please check permissions and try again.";
      setErrorMsg(friendly);
      setMicState("error");
      setTimeout(() => {
        setMicState("idle");
        setErrorMsg("");
      }, 3500);
    },
  });

  // Core conversation handler — defined as a function declaration so it is
  // hoisted and available to the onEnd closure above.
  async function processUserSpeech(text: string) {
    if (abortRef.current) return;

    const lang = detectLanguage(text);
    const updatedConv: ConvEntry[] = [
      ...conversation,
      { role: "user", text },
    ];
    setConversation(updatedConv);

    // Topic guard
    if (!isAllowedTopic(text)) {
      const rejection = getRejectionMessage(lang);
      if (abortRef.current) return;
      setConversation((c) => [...c, { role: "pandit", text: rejection }]);
      setMicState("speaking");
      tts.speak(rejection, getTTSLang(lang), () => {
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.75,
          max_tokens: 380,
          messages: [
            { role: "system", content: VOICE_SYSTEM_PROMPT },
            ...history,
          ],
        }),
      });

      if (abortRef.current) return;

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      const reply = (data.choices?.[0]?.message?.content || "").trim();
      if (!reply) throw new Error("Empty response from AI");

      const replyLang = detectLanguage(reply);
      setConversation((c) => [...c, { role: "pandit", text: reply }]);
      setMicState("speaking");
      tts.speak(reply, getTTSLang(replyLang), () => {
        if (!abortRef.current) setMicState("idle");
      });
    } catch {
      if (abortRef.current) return;
      const fallback =
        "Kshama karein, kuch technical samasya aayi hai. Kripaya thodi der baad dobara prayaas karein.";
      setConversation((c) => [...c, { role: "pandit", text: fallback }]);
      setMicState("speaking");
      tts.speak(fallback, "hi-IN", () => {
        if (!abortRef.current) setMicState("idle");
      });
    }
  }

  const handleMicClick = () => {
    if (!supported) {
      setErrorMsg(
        "Speech recognition requires Chrome or Edge browser."
      );
      setMicState("error");
      setTimeout(() => {
        setMicState("idle");
        setErrorMsg("");
      }, 3500);
      return;
    }
    if (micState === "processing") return;
    if (micState === "speaking") {
      tts.stop();
      setMicState("idle");
      return;
    }
    if (micState === "listening") {
      stop();
      return;
    }
    // idle or error → start listening
    abortRef.current = false;
    transcriptRef.current = "";
    setTranscript("");
    setErrorMsg("");
    start();
    setMicState("listening");
  };

  const newSession = () => {
    abortRef.current = true;
    tts.stop();
    stop();
    setConversation([]);
    transcriptRef.current = "";
    setTranscript("");
    setMicState("idle");
    setErrorMsg("");
    setTimeout(() => {
      abortRef.current = false;
    }, 50);
  };

  const micLabel =
    micState === "error"
      ? errorMsg || "⚠️ Please try again"
      : {
          idle: "🎤 Tap to Speak",
          listening: "🌟 I am listening...",
          processing: "🔮 Understanding your situation...",
          speaking: "🕉️ Pandit Ji is speaking...",
        }[micState as Exclude<MicState, "error">];

  return (
    <div className="vc-root">
      {/* ── Top controls ── */}
      <div className="vc-topbar">
        <span className="vc-topbar-title">Voice Session</span>
        <button
          className={`vc-ctrl-btn${tts.muted ? " vc-muted" : ""}`}
          onClick={tts.toggleMute}
          title={tts.muted ? "Voice is muted — click to unmute" : "Click to mute voice"}
        >
          {tts.muted ? "🔇 Unmute" : "🔊 Voice On"}
        </button>
        {micState === "listening" && (
          <button className="vc-ctrl-btn" onClick={() => stop()}>
            ⏹ Stop Listening
          </button>
        )}
        {micState === "speaking" && (
          <button className="vc-ctrl-btn" onClick={() => { tts.stop(); setMicState("idle"); }}>
            ⏹ Stop Speaking
          </button>
        )}
        {conversation.length > 0 && (
          <button className="vc-ctrl-btn" onClick={newSession} title="Start a new consultation">
            🔄 New Consultation
          </button>
        )}
      </div>

      {/* ── Conversation history ── */}
      <div className="vc-history" ref={historyRef}>
        {conversation.length === 0 ? (
          <div className="vc-welcome">
            <div className="vc-welcome-om">🕉️</div>
            <div className="vc-welcome-text">{WELCOME}</div>
          </div>
        ) : (
          conversation.map((entry, i) => (
            <div key={i} className={`vc-msg vc-msg-${entry.role}`}>
              <div className="vc-msg-av">
                {entry.role === "user" ? "🙏" : "🧘"}
              </div>
              <div className="vc-msg-text">{entry.text}</div>
            </div>
          ))
        )}
      </div>

      {/* ── Mic area ── */}
      <div className="vc-mic-area">
        {/* Speaking waveform indicator */}
        {micState === "speaking" && (
          <div className="vc-speak-bars">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="vc-sp-bar" />
            ))}
          </div>
        )}

        {/* Live transcript */}
        {transcript && micState === "listening" && (
          <div className="vc-transcript-box">{transcript}</div>
        )}

        {/* Microphone button */}
        <div
          className={`vc-mic-ring vc-mic-${micState}`}
          onClick={handleMicClick}
          role="button"
          aria-label={micLabel}
        >
          <span className="vc-mic-icon">{MIC_ICONS[micState]}</span>
        </div>

        {/* State label */}
        <div
          className="vc-mic-label"
          style={{ color: MIC_COLORS[micState] }}
        >
          {micLabel}
        </div>
      </div>
    </div>
  );
}
