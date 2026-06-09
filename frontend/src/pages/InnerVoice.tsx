import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const fl = document.createElement("link"); fl.rel = "stylesheet";
fl.href = "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Space+Mono:wght@400;700&display=swap";
if (!document.head.querySelector("link[href*='Cinzel']")) document.head.appendChild(fl);

const CSS = `
.iv-app{min-height:100vh;background:#03010a;color:#e8e0f0;font-family:'Cormorant Garamond',serif;font-size:18px;overflow-x:hidden;position:relative;}
.iv-stars{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;}
.iv-star{position:absolute;border-radius:50%;background:#fff;animation:iv-twk var(--d,3s) ease-in-out infinite;animation-delay:var(--dl,0s);opacity:var(--op,.5);}
@keyframes iv-twk{0%,100%{opacity:var(--op,.5);transform:scale(1);}50%{opacity:.05;transform:scale(.3);}}
.iv-nb{position:fixed;border-radius:50%;filter:blur(110px);pointer-events:none;z-index:0;animation:iv-drift var(--nd,25s) ease-in-out infinite alternate;}
@keyframes iv-drift{from{transform:translate(0,0);}to{transform:translate(50px,35px);}}
.iv-content{position:relative;z-index:1;}

/* Hero */
.iv-hero{text-align:center;padding:100px 20px 50px;max-width:760px;margin:0 auto;}
.iv-om{font-size:52px;margin-bottom:16px;filter:drop-shadow(0 0 30px rgba(245,197,24,.6));animation:iv-om-pulse 4s ease-in-out infinite;}
@keyframes iv-om-pulse{0%,100%{filter:drop-shadow(0 0 20px rgba(245,197,24,.4));}50%{filter:drop-shadow(0 0 50px rgba(245,197,24,.9));}}
.iv-eyebrow{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:6px;color:#00e5ff;text-transform:uppercase;margin-bottom:14px;}
.iv-title{font-family:'Cinzel Decorative',serif;font-size:clamp(30px,6vw,62px);font-weight:900;line-height:1.1;margin-bottom:12px;background:linear-gradient(135deg,#f5c518 0%,#ffe066 40%,#f5a623 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.iv-tagline{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:5px;color:rgba(245,197,24,.65);text-transform:uppercase;margin-bottom:22px;}
.iv-subtitle{color:rgba(232,224,240,.5);font-style:italic;font-size:17px;line-height:1.8;max-width:560px;margin:0 auto 36px;}

/* Karma strip */
.iv-karma-strip{display:flex;justify-content:center;gap:32px;flex-wrap:wrap;margin-bottom:60px;}
.iv-ks-item{text-align:center;}
.iv-ks-val{font-family:'Cinzel Decorative',serif;font-size:28px;color:#f5c518;}
.iv-ks-lbl{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:3px;color:rgba(232,224,240,.35);text-transform:uppercase;margin-top:4px;}

/* Feature nav grid */
.iv-nav{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;max-width:720px;margin:0 auto 70px;padding:0 20px;}
@media(max-width:480px){.iv-nav{grid-template-columns:1fr;}}
.iv-nav-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:28px 24px;text-decoration:none;transition:all .35s;position:relative;overflow:hidden;display:block;}
.iv-nav-card::before{content:'';position:absolute;inset:0;opacity:0;transition:opacity .35s;border-radius:20px;}
.iv-nav-card:hover{border-color:rgba(245,197,24,.35);transform:translateY(-4px);}
.iv-nav-card:hover::before{opacity:1;}
.iv-nav-card.gold::before{background:linear-gradient(135deg,rgba(245,197,24,.07),transparent);}
.iv-nav-card.purple::before{background:linear-gradient(135deg,rgba(123,47,255,.1),transparent);}
.iv-nav-card.cyan::before{background:linear-gradient(135deg,rgba(0,229,255,.07),transparent);}
.iv-nav-card.rose::before{background:linear-gradient(135deg,rgba(255,107,157,.07),transparent);}
.iv-nc-icon{font-size:36px;margin-bottom:12px;display:block;}
.iv-nc-tag{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:3px;text-transform:uppercase;margin-bottom:6px;}
.iv-nc-tag.gold{color:rgba(245,197,24,.6);}
.iv-nc-tag.purple{color:rgba(123,47,255,.7);}
.iv-nc-tag.cyan{color:rgba(0,229,255,.6);}
.iv-nc-tag.rose{color:rgba(255,107,157,.7);}
.iv-nc-name{font-family:'Cinzel Decorative',serif;font-size:15px;color:#e8e0f0;margin-bottom:8px;}
.iv-nc-desc{font-size:14px;color:rgba(232,224,240,.4);line-height:1.6;font-style:italic;}
.iv-nc-arrow{position:absolute;top:24px;right:24px;color:rgba(245,197,24,.3);font-size:18px;transition:transform .3s,color .3s;}
.iv-nav-card:hover .iv-nc-arrow{transform:translateX(4px);color:#f5c518;}

/* Quick karma pulse */
.iv-quick-section{max-width:720px;margin:0 auto;padding:0 20px 90px;}
.iv-section-title{font-family:'Cinzel Decorative',serif;font-size:clamp(16px,2.5vw,20px);color:#f5c518;text-align:center;margin-bottom:6px;}
.iv-section-sub{text-align:center;color:rgba(232,224,240,.4);font-style:italic;font-size:14px;margin-bottom:22px;}
.iv-quick-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:28px;backdrop-filter:blur(20px);}
.iv-voice-row{display:flex;gap:10px;margin-bottom:16px;align-items:center;}
.iv-voice-btn{background:rgba(0,229,255,.08);border:1px solid rgba(0,229,255,.25);border-radius:10px;padding:9px 16px;color:#00e5ff;font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;cursor:pointer;transition:all .3s;display:flex;align-items:center;gap:7px;}
.iv-voice-btn:hover{background:rgba(0,229,255,.18);}
.iv-voice-btn.listening{background:rgba(255,45,120,.12);border-color:rgba(255,45,120,.45);color:#ff2d78;animation:iv-pulse 1s ease-in-out infinite;}
@keyframes iv-pulse{0%,100%{opacity:1;}50%{opacity:.45;}}
.iv-char{font-family:'Space Mono',monospace;font-size:9px;color:rgba(232,224,240,.25);margin-left:auto;}
.iv-textarea{width:100%;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:16px;color:#e8e0f0;font-family:'Cormorant Garamond',serif;font-size:17px;line-height:1.7;resize:vertical;min-height:130px;outline:none;transition:border .3s,box-shadow .3s;box-sizing:border-box;}
.iv-textarea:focus{border-color:#f5c518;box-shadow:0 0 0 3px rgba(245,197,24,.1);}
.iv-textarea::placeholder{color:rgba(232,224,240,.2);}
.iv-submit-btn{width:100%;background:linear-gradient(135deg,#f5c518,#f5a623);color:#03010a;border:none;border-radius:12px;padding:15px;font-family:'Space Mono',monospace;font-size:10px;letter-spacing:3px;text-transform:uppercase;cursor:pointer;transition:all .3s;font-weight:700;margin-top:14px;}
.iv-submit-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 35px rgba(245,197,24,.38);}
.iv-submit-btn:disabled{opacity:.45;cursor:not-allowed;}

/* Loading */
.iv-loading{text-align:center;padding:36px 0;}
.iv-loader{width:52px;height:52px;border:2px solid rgba(245,197,24,.15);border-top-color:#f5c518;border-radius:50%;animation:iv-spin 1s linear infinite;margin:0 auto 16px;}
@keyframes iv-spin{to{transform:rotate(360deg);}}
.iv-loading-text{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;color:rgba(245,197,24,.6);text-transform:uppercase;animation:iv-twk 2s ease-in-out infinite;}

/* Results */
.iv-results{animation:iv-fade-in .6s ease-out;}
@keyframes iv-fade-in{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
.iv-result-badges{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px;justify-content:center;}
.iv-badge{display:inline-flex;align-items:center;gap:6px;border-radius:50px;padding:5px 16px;font-family:'Space Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;}
.iv-badge.karma-type{background:rgba(245,197,24,.12);border:1px solid rgba(245,197,24,.35);color:#f5c518;}
.iv-badge.sev-gentle{background:rgba(0,255,170,.08);border:1px solid rgba(0,255,170,.28);color:#00ffaa;}
.iv-badge.sev-significant{background:rgba(255,170,0,.1);border:1px solid rgba(255,170,0,.3);color:#ffaa00;}
.iv-badge.sev-deep{background:rgba(255,45,120,.1);border:1px solid rgba(255,45,120,.3);color:#ff6b9d;}
.iv-badge.sev-breakthrough{background:rgba(123,47,255,.12);border:1px solid rgba(123,47,255,.4);color:#b57fff;}
.iv-result-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;}
@media(max-width:560px){.iv-result-grid{grid-template-columns:1fr;}}
.iv-rc{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:20px;}
.iv-rc.full{grid-column:1/-1;}
.iv-rc.gold{border-color:rgba(245,197,24,.25);}
.iv-rc.cyan{border-color:rgba(0,229,255,.18);}
.iv-rc.purple{border-color:rgba(123,47,255,.25);}
.iv-rc-lbl{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:3px;color:rgba(232,224,240,.35);text-transform:uppercase;margin-bottom:7px;}
.iv-rc-val{font-size:15px;line-height:1.7;color:#e8e0f0;}
.iv-rc-val.gold{color:#f5c518;font-weight:600;}
.iv-rc-val.cyan{color:#00e5ff;}
.iv-affirmation{background:linear-gradient(135deg,rgba(123,47,255,.12),rgba(245,197,24,.07));border:1px solid rgba(245,197,24,.2);border-radius:14px;padding:22px;text-align:center;margin-top:12px;}
.iv-affirmation p{font-style:italic;font-size:17px;line-height:1.85;color:rgba(232,224,240,.9);margin:0;}
.iv-action-card{background:rgba(0,229,255,.05);border:1px solid rgba(0,229,255,.2);border-radius:14px;padding:20px;margin-top:12px;}
.iv-action-lbl{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:3px;color:#00e5ff;text-transform:uppercase;margin-bottom:9px;}
.iv-reset-btn{width:100%;background:transparent;border:1px solid rgba(245,197,24,.25);border-radius:12px;padding:13px;color:rgba(245,197,24,.7);font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;cursor:pointer;transition:all .3s;margin-top:16px;}
.iv-reset-btn:hover{background:rgba(245,197,24,.07);color:#f5c518;}
.iv-error{background:rgba(255,45,120,.08);border:1px solid rgba(255,45,120,.25);border-radius:10px;padding:14px;color:#ff6b9d;font-family:'Space Mono',monospace;font-size:10px;text-align:center;margin-top:14px;}
`;

const NAV_CARDS = [
  { icon: "🧘", name: "AI Guru", tag: "Pandit Intelligence", desc: "Converse with a Vedic pandit. Get pooja prescriptions, mantra remedies, and personal dharmic guidance.", path: "/inner-voice/chat", color: "gold" },
  { icon: "⚡", name: "Karma Score", tag: "Natal + Behavioral", desc: "Your real karma score — calculated from your birth chart, planetary transits, and daily actions combined.", path: "/inner-voice/dashboard", color: "purple" },
  { icon: "📓", name: "Karma Journal", tag: "Planetary Diary", desc: "Log life events and let AI cross-reference them with your running dasha and transit chart.", path: "/inner-voice/journal", color: "rose" },
  { icon: "🕉", name: "Shloka Oracle", tag: "Live Vedic Wisdom", desc: "Not a random verse — the exact shloka from Gita, Upanishads, or Puranas that speaks to your exact situation.", path: "/inner-voice/wisdom", color: "cyan" },
];

function Stars() {
  return (
    <div className="iv-stars">
      {Array.from({ length: 90 }).map((_, i) => (
        <div key={i} className="iv-star" style={{
          width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px`,
          left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
          "--d": `${2 + Math.random() * 5}s`, "--dl": `${Math.random() * 5}s`,
          "--op": `${0.15 + Math.random() * 0.55}`,
        }} />
      ))}
      <div className="iv-nb" style={{ width: 550, height: 550, left: "-12%", top: "8%", background: "rgba(123,47,255,.11)", "--nd": "28s" }} />
      <div className="iv-nb" style={{ width: 420, height: 420, right: "-6%", bottom: "18%", background: "rgba(245,197,24,.07)", "--nd": "22s" }} />
      <div className="iv-nb" style={{ width: 300, height: 300, left: "40%", top: "50%", background: "rgba(0,229,255,.05)", "--nd": "32s" }} />
    </div>
  );
}



const SYSTEM_DIAGNOSE = `You are Pandit Ji, a wise Vedic astrologer and karma expert with 40 years of experience. When someone shares their situation, you diagnose the karmic root cause through the lens of Vedic astrology and dharma.

Respond ONLY with valid JSON, no other text:
{
  "lifeDomain": "Career / Relationships / Family / Health / Finance / Spiritual / Mind",
  "karmaType": "Sanchita Karma / Prarabdha Karma / Kriyamana Karma / Agami Karma",
  "severity": "Gentle Turbulence / Significant Lesson / Deep Karmic Debt / Breakthrough Moment",
  "karmicPattern": "A 2-3 sentence description of the karmic pattern at play from a Vedic perspective",
  "rootPlanet": "Which planet/house is responsible and why (e.g., Saturn in 7th house...)",
  "spiritualInsight": "The deeper soul lesson being offered here — specific, not generic",
  "suggestedAction": "One concrete action: a specific pooja, mantra with count, donation, or behavioral change",
  "remedyUrgency": "Today / This Week / This Month",
  "affirmation": "A personalized Vedic-style affirmation based on their specific situation"
}`;

export default function InnerVoice() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  // Read karma score from localStorage
  const karmaHistory = (() => { try { return JSON.parse(localStorage.getItem("iv_karma_v2") || "[]"); } catch { return []; } })();
  const latestScore = karmaHistory[0]?.composite || null;

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Use Chrome for voice input."); return; }
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const rec = new SR();
    rec.continuous = true; rec.interimResults = true; rec.lang = "hi-IN";
    rec.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join(" ");
      setText(t);
    };
    rec.onend = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  };

  const diagnose = async () => {
    if (!text.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const data = await callAI(SYSTEM_DIAGNOSE, `My situation: ${text}`);
      setResult(data);
    } catch (e) {
      console.error("❌ Full error:", e);
      setError(e.message || "Could not read your karma. Please check your API connection.");
    } finally {
      setLoading(false);
    }
  };

  const sevClass = (s = "") => {
    if (s.includes("Gentle")) return "sev-gentle";
    if (s.includes("Significant")) return "sev-significant";
    if (s.includes("Deep")) return "sev-deep";
    if (s.includes("Breakthrough")) return "sev-breakthrough";
    return "sev-gentle";
  };

  return (
    <div className="iv-app">
      <style>{CSS}</style>
      <Stars />
      <div className="iv-content">

        {/* Hero */}
        <div className="iv-hero">
          <div className="iv-om">🕉</div>
          <div className="iv-eyebrow">Spiritual Intelligence Platform</div>
          <h1 className="iv-title">Inner Voice</h1>
          <div className="iv-tagline">Know Your Karma · Improve Your Karma</div>
          <p className="iv-subtitle">
            Your personal Vedic guidance system — powered by ancient wisdom and modern AI.
            Diagnose karmic patterns, track your dharmic progress, and receive actionable remedies.
          </p>
          {latestScore && (
            <div className="iv-karma-strip">
              <div className="iv-ks-item"><div className="iv-ks-val">{latestScore}</div><div className="iv-ks-lbl">Karma Score</div></div>
              <div className="iv-ks-item"><div className="iv-ks-val">{karmaHistory.length}</div><div className="iv-ks-lbl">Days Tracked</div></div>
            </div>
          )}
        </div>

        {/* 4 Feature nav cards */}
        <div className="iv-nav">
          {NAV_CARDS.map(c => (
            <Link key={c.path} to={c.path} className={`iv-nav-card ${c.color}`}>
              <span className="iv-nc-icon">{c.icon}</span>
              <div className={`iv-nc-tag ${c.color}`}>{c.tag}</div>
              <div className="iv-nc-name">{c.name}</div>
              <div className="iv-nc-desc">{c.desc}</div>
              <span className="iv-nc-arrow">→</span>
            </Link>
          ))}
        </div>

        {/* Quick karma diagnosis */}
        <div className="iv-quick-section">
          <h2 className="iv-section-title">Quick Karma Diagnosis</h2>
          <p className="iv-section-sub">Share your situation in any language — Hindi, English, or Hinglish</p>

          <div className="iv-quick-card">
            {!result ? (
              <>
                <div className="iv-voice-row">
                  <button className={`iv-voice-btn${listening ? " listening" : ""}`} onClick={startVoice}>
                    {listening ? "🔴 Listening..." : "🎙️ Speak"}
                  </button>
                  <span className="iv-char">{text.length} / 1500</span>
                </div>
                <textarea
                  className="iv-textarea"
                  placeholder="Apni situation batayein... What is weighing on your heart right now? A difficult relationship, career stagnation, recurring bad luck, health issues, family conflict — be honest and specific."
                  value={text}
                  onChange={e => setText(e.target.value.slice(0, 1500))}
                />
                {loading ? (
                  <div className="iv-loading">
                    <div className="iv-loader" />
                    <div className="iv-loading-text">Pandit Ji is reading your karma...</div>
                  </div>
                ) : (
                  <button className="iv-submit-btn" onClick={diagnose} disabled={text.trim().length < 10}>
                    ॐ Diagnose My Karma
                  </button>
                )}
                {error && <div className="iv-error">{error}</div>}
              </>
            ) : (
              <div className="iv-results">
                <div className="iv-result-badges">
                  <span className="iv-badge karma-type">{result.karmaType}</span>
                  <span className={`iv-badge ${sevClass(result.severity)}`}>{result.severity}</span>
                </div>
                <div className="iv-result-grid">
                  <div className="iv-rc gold">
                    <div className="iv-rc-lbl">Life Domain</div>
                    <div className="iv-rc-val gold">{result.lifeDomain}</div>
                  </div>
                  <div className="iv-rc cyan">
                    <div className="iv-rc-lbl">Ruling Planet</div>
                    <div className="iv-rc-val cyan">{result.rootPlanet}</div>
                  </div>
                  <div className="iv-rc full">
                    <div className="iv-rc-lbl">Karmic Pattern</div>
                    <div className="iv-rc-val">{result.karmicPattern}</div>
                  </div>
                  <div className="iv-rc full purple">
                    <div className="iv-rc-lbl">Soul Lesson</div>
                    <div className="iv-rc-val">{result.spiritualInsight}</div>
                  </div>
                </div>
                <div className="iv-action-card">
                  <div className="iv-action-lbl">⚡ Remedy — {result.remedyUrgency}</div>
                  <div className="iv-rc-val">{result.suggestedAction}</div>
                </div>
                <div className="iv-affirmation">
                  <p>"{result.affirmation}"</p>
                </div>
                <button className="iv-reset-btn" onClick={() => { setResult(null); setText(""); }}>
                  ↩ New Diagnosis
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Need useRef
import { useRef } from "react";


const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callAI(systemPrompt, userMsg) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1200,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMsg }
      ]
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`API error: ${data.error.message}`);
  const raw = data.choices?.[0]?.message?.content || "{}";
  try { return JSON.parse(raw); } catch(e) { const m = raw.match(/[\s\S]*}/); return m ? JSON.parse(m[0]) : {}; }
}