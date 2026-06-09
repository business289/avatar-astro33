import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

const fl = document.createElement("link"); fl.rel = "stylesheet";
fl.href = "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Space+Mono:wght@400;700&display=swap";
if (!document.head.querySelector("link[href*='Cinzel']")) document.head.appendChild(fl);


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


const CSS = `
.ivc-app{min-height:100vh;background:#03010a;color:#e8e0f0;font-family:'Cormorant Garamond',serif;font-size:18px;overflow-x:hidden;position:relative;}
.ivc-stars{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;}
.ivc-star{position:absolute;border-radius:50%;background:#fff;animation:ivc-twk var(--d,3s) ease-in-out infinite;animation-delay:var(--dl,0s);opacity:var(--op,.5);}
@keyframes ivc-twk{0%,100%{opacity:var(--op,.5);transform:scale(1);}50%{opacity:.05;transform:scale(.3);}}
.ivc-nb{position:fixed;border-radius:50%;filter:blur(110px);pointer-events:none;z-index:0;}
.ivc-content{position:relative;z-index:1;display:flex;flex-direction:column;min-height:100vh;}

/* Header */
.ivc-header{padding:70px 20px 20px;text-align:center;}
.ivc-back{display:inline-flex;align-items:center;gap:6px;font-family:'Space Mono',monospace;font-size:8px;letter-spacing:3px;color:rgba(245,197,24,.5);text-transform:uppercase;text-decoration:none;transition:color .3s;margin-bottom:18px;}
.ivc-back:hover{color:#f5c518;}
.ivc-avatar-ring{width:76px;height:76px;border-radius:50%;background:linear-gradient(135deg,rgba(123,47,255,.5),rgba(245,197,24,.3));border:2px solid rgba(245,197,24,.4);display:flex;align-items:center;justify-content:center;font-size:34px;margin:0 auto 12px;box-shadow:0 0 40px rgba(123,47,255,.35);}
.ivc-eyebrow{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:5px;color:rgba(123,47,255,.8);text-transform:uppercase;margin-bottom:6px;}
.ivc-hdr-title{font-family:'Cinzel Decorative',serif;font-size:clamp(20px,3.5vw,34px);color:#f5c518;margin-bottom:4px;}
.ivc-hdr-sub{color:rgba(232,224,240,.4);font-style:italic;font-size:14px;margin-bottom:16px;}

/* Online indicator */
.ivc-status{display:inline-flex;align-items:center;gap:7px;font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;color:rgba(0,255,170,.7);}
.ivc-status-dot{width:8px;height:8px;border-radius:50%;background:#00ffaa;box-shadow:0 0 8px #00ffaa;animation:ivc-blink 2s ease-in-out infinite;}
@keyframes ivc-blink{0%,100%{opacity:1;}50%{opacity:.3;}}

/* Chat area */
.ivc-chat{flex:1;max-width:800px;width:100%;margin:0 auto;padding:20px 20px 170px;display:flex;flex-direction:column;gap:18px;}

/* Messages */
.ivc-msg{display:flex;gap:10px;animation:ivc-fadein .4s ease-out;}
@keyframes ivc-fadein{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
.ivc-msg.user{flex-direction:row-reverse;}
.ivc-av{width:36px;height:36px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:15px;}
.ivc-av.guru{background:linear-gradient(135deg,rgba(123,47,255,.4),rgba(245,197,24,.2));border:1px solid rgba(245,197,24,.3);}
.ivc-av.user{background:rgba(0,229,255,.12);border:1px solid rgba(0,229,255,.28);}
.ivc-bubble{max-width:88%;}
.ivc-user-bubble{background:rgba(0,229,255,.06);border:1px solid rgba(0,229,255,.17);border-radius:18px 18px 4px 18px;padding:16px 20px;}
.ivc-user-text{font-size:16px;line-height:1.7;color:#e8e0f0;}

/* Structured guru response */
.ivc-guru-bubble{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:18px 18px 18px 4px;overflow:hidden;}
.ivc-response-block{padding:14px 20px;border-bottom:1px solid rgba(255,255,255,.05);}
.ivc-response-block:last-child{border-bottom:none;}
.ivc-rblock-lbl{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:3px;text-transform:uppercase;margin-bottom:7px;display:flex;align-items:center;gap:6px;}
.rbl-diagnosis{color:rgba(245,197,24,.75);}
.rbl-remedy{color:rgba(255,107,157,.8);}
.rbl-mantra{color:rgba(123,47,255,.85);}
.rbl-pooja{color:rgba(255,170,0,.85);}
.rbl-guidance{color:rgba(0,229,255,.75);}
.rbl-question{color:rgba(232,224,240,.45);}
.ivc-rblock-text{font-size:15px;line-height:1.75;color:#e8e0f0;}
.ivc-mantra-text{font-family:'Cinzel Decorative',serif;font-size:14px;letter-spacing:2px;color:#b57fff;line-height:1.9;}
.ivc-mantra-count{font-family:'Space Mono',monospace;font-size:9px;color:rgba(123,47,255,.6);margin-top:6px;}
.ivc-pooja-box{background:rgba(255,170,0,.06);border:1px solid rgba(255,170,0,.2);border-radius:10px;padding:14px;}
.ivc-pooja-name{font-family:'Cinzel Decorative',serif;font-size:13px;color:#ffaa00;margin-bottom:5px;}
.ivc-pooja-detail{font-size:13px;color:rgba(232,224,240,.65);line-height:1.6;}
.ivc-question-text{font-size:15px;font-style:italic;color:rgba(232,224,240,.6);line-height:1.7;}
.ivc-karma-tag{display:inline-flex;align-items:center;gap:5px;background:rgba(245,197,24,.1);border:1px solid rgba(245,197,24,.25);border-radius:50px;padding:3px 12px;font-family:'Space Mono',monospace;font-size:8px;letter-spacing:2px;color:rgba(245,197,24,.8);margin-top:8px;}

/* Preset prompts */
.ivc-presets{max-width:800px;margin:0 auto;padding:0 20px 14px;display:flex;flex-wrap:wrap;gap:8px;}
.ivc-preset{background:rgba(123,47,255,.1);border:1px solid rgba(123,47,255,.25);border-radius:50px;padding:7px 16px;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:14px;color:rgba(232,224,240,.65);cursor:pointer;transition:all .3s;white-space:nowrap;}
.ivc-preset:hover{background:rgba(123,47,255,.22);color:#e8e0f0;border-color:rgba(123,47,255,.5);}

/* Welcome */
.ivc-welcome{background:rgba(123,47,255,.07);border:1px solid rgba(123,47,255,.2);border-radius:18px;padding:26px;text-align:center;}
.ivc-welcome p{font-style:italic;font-size:17px;line-height:1.85;color:rgba(232,224,240,.75);margin:0;}

/* Typing */
.ivc-typing{display:flex;gap:5px;padding:12px 20px;align-items:center;}
.ivc-dot{width:7px;height:7px;border-radius:50%;background:#f5c518;opacity:.4;animation:ivc-bounce .9s ease-in-out infinite;}
.ivc-dot:nth-child(2){animation-delay:.2s;}
.ivc-dot:nth-child(3){animation-delay:.4s;}
@keyframes ivc-bounce{0%,60%,100%{transform:translateY(0);opacity:.4;}30%{transform:translateY(-7px);opacity:1;}}

/* Input */
.ivc-input-area{position:fixed;bottom:0;left:0;right:0;z-index:10;background:linear-gradient(to top,#03010a 65%,transparent);padding:14px 20px 22px;}
.ivc-input-inner{max-width:800px;margin:0 auto;display:flex;gap:10px;align-items:flex-end;}
.ivc-input-box{flex:1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:13px 17px;color:#e8e0f0;font-family:'Cormorant Garamond',serif;font-size:17px;resize:none;outline:none;transition:border .3s;min-height:50px;max-height:110px;}
.ivc-input-box:focus{border-color:rgba(245,197,24,.45);box-shadow:0 0 0 2px rgba(245,197,24,.08);}
.ivc-input-box::placeholder{color:rgba(232,224,240,.22);}
.ivc-send-btn{background:linear-gradient(135deg,#f5c518,#f5a623);border:none;border-radius:13px;width:50px;height:50px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .3s;flex-shrink:0;font-size:18px;color:#03010a;}
.ivc-send-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 6px 22px rgba(245,197,24,.38);}
.ivc-send-btn:disabled{opacity:.35;cursor:not-allowed;}
`;

const PANDIT_SYSTEM = `You are Pandit Rameshwar Ji, a revered Vedic astrologer and karma guru with 40 years of experience. You have deep knowledge of Jyotish, Ayurveda, Sanskrit shlokas, all 18 Puranas, Bhagavad Gita, Vedic remedies, and Hindu rituals.

Your role: Guide the seeker with actionable Vedic wisdom. When someone shares their problem:
1. DIAGNOSE the karmic/astrological root cause (which planet, house, dasha period)
2. PRESCRIBE specific remedies: exact poojas, mantras with recitation counts, fasting days, charity items
3. SHARE relevant shlokas or wisdom from Gita/Puranas
4. ASK one follow-up question to deepen understanding

IMPORTANT TONE: Speak as a real pandit would — with authority, warmth, and Vedic vocabulary. Use occasional Sanskrit terms (with meaning). Be specific, not vague. Never say "it depends" without explaining exactly what it depends on.

Respond ONLY with this JSON structure, no extra text:
{
  "diagnosis": "Your astrological diagnosis — which planet/dasha/house is responsible and why. Be specific.",
  "remedy": "The primary remedy — exact steps, timing, duration (e.g., 'Perform Rudrabhishek on 3 consecutive Mondays during Brahma muhurta — 4:30 AM to 6 AM. Offer milk, honey, and bilva leaves on Shivling.')",
  "mantra": "The exact mantra to chant (in Sanskrit/Devanagari if possible)",
  "mantraCount": "Number of repetitions and frequency (e.g., '108 times daily for 40 days')",
  "pooja": {
    "name": "Name of the specific pooja",
    "detail": "What materials needed, which day to perform, who should perform it, estimated cost range"
  },
  "guidance": "The dharmic wisdom and life guidance — the deeper lesson and path forward",
  "karmaPoints": "+5 / -3 / +0 (karma score impact if remedy is followed)",
  "question": "One specific follow-up question to understand their situation better"
}

If the person asks a general question (not a problem), skip remedy/pooja and focus on guidance and question.
Always respond in the same language the user writes in (Hindi, English, or Hinglish).`;


const PRESETS = [
  "Meri job nahi lag rahi — 3 saal ho gaye",
  "My marriage has been delayed for years",
  "Ghar mein baar baar bimari ho rahi hai",
  "I keep failing despite hard work — why?",
  "Which pooja should I do for financial growth?",
  "I have Mangal Dosha — what are the remedies?",
];

function Stars() {
  return (
    <div className="ivc-stars">
      {Array.from({ length: 65 }).map((_, i) => (
        <div key={i} className="ivc-star" style={{
          width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px`,
          left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
          "--d": `${2 + Math.random() * 5}s`, "--dl": `${Math.random() * 5}s`,
          "--op": `${0.12 + Math.random() * 0.5}`,
        }} />
      ))}
      <div className="ivc-nb" style={{ width: 500, height: 500, left: "-15%", top: "5%", background: "rgba(123,47,255,.1)" }} />
      <div className="ivc-nb" style={{ width: 380, height: 380, right: "-5%", bottom: "15%", background: "rgba(245,197,24,.07)" }} />
    </div>
  );
}

function GurBubble({ resp }) {
  if (!resp) return null;
  return (
    <div className="ivc-guru-bubble">
      {resp.diagnosis && (
        <div className="ivc-response-block">
          <div className="ivc-rblock-lbl rbl-diagnosis">🔭 Astrological Diagnosis</div>
          <div className="ivc-rblock-text">{resp.diagnosis}</div>
        </div>
      )}
      {resp.remedy && (
        <div className="ivc-response-block">
          <div className="ivc-rblock-lbl rbl-remedy">🌿 Prescribed Remedy</div>
          <div className="ivc-rblock-text">{resp.remedy}</div>
        </div>
      )}
      {resp.mantra && (
        <div className="ivc-response-block">
          <div className="ivc-rblock-lbl rbl-mantra">📿 Mantra</div>
          <div className="ivc-mantra-text">{resp.mantra}</div>
          {resp.mantraCount && <div className="ivc-mantra-count">↳ {resp.mantraCount}</div>}
        </div>
      )}
      {resp.pooja?.name && (
        <div className="ivc-response-block">
          <div className="ivc-rblock-lbl rbl-pooja">🪔 Prescribed Pooja</div>
          <div className="ivc-pooja-box">
            <div className="ivc-pooja-name">{resp.pooja.name}</div>
            <div className="ivc-pooja-detail">{resp.pooja.detail}</div>
          </div>
        </div>
      )}
      {resp.guidance && (
        <div className="ivc-response-block">
          <div className="ivc-rblock-lbl rbl-guidance">🧘 Dharmic Guidance</div>
          <div className="ivc-rblock-text">{resp.guidance}</div>
          {resp.karmaPoints && (
            <div className="ivc-karma-tag">⚡ Karma Impact: {resp.karmaPoints}</div>
          )}
        </div>
      )}
      {resp.question && (
        <div className="ivc-response-block">
          <div className="ivc-rblock-lbl rbl-question">❓ Pandit Ji asks</div>
          <div className="ivc-question-text">{resp.question}</div>
        </div>
      )}
    </div>
  );
}

export default function InnerVoiceChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const buildHistory = () =>
    messages.map(m => ({
      role: m.role === "user" ? "user" : "assistant",
      content: typeof m.content === "string" ? m.content : `[Pandit response about: ${m.userMsg || "previous topic"}]`,
    }));

  const send = async (text) => {
    const msg = text.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const history = buildHistory();
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
            { role: "system", content: PANDIT_SYSTEM },
            ...history.map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.content })),
            { role: "user", content: msg }
          ]
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(`API error: ${data.error.message}`);
      const raw = data.choices?.[0]?.message?.content || "{}";
      const parsed = JSON.parse(raw);
      setMessages(prev => [...prev, { role: "guru", content: parsed, userMsg: msg }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "guru",
        content: {
          guidance: "Mera connection thoda weak hai abhi. Thodi der mein dobara poochiye. (My connection is weak — please try again in a moment.)",
          question: "Can you repeat your question?",
        },
        userMsg: msg,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <div className="ivc-app">
      <style>{CSS}</style>
      <Stars />
      <div className="ivc-content">
        <div className="ivc-header">
          <Link to="/inner-voice" className="ivc-back">← Inner Voice</Link>
          <div className="ivc-avatar-ring">🧘</div>
          <div className="ivc-eyebrow">Vedic Pandit Intelligence</div>
          <h1 className="ivc-hdr-title">AI Guru</h1>
          <p className="ivc-hdr-sub">Pandit Rameshwar Ji · 40 years of Jyotish experience</p>
          <div className="ivc-status">
            <span className="ivc-status-dot" />
            Available · Responds in Hindi & English
          </div>
        </div>

        {messages.length === 0 && (
          <div className="ivc-presets">
            {PRESETS.map(p => (
              <button key={p} className="ivc-preset" onClick={() => send(p)}>{p}</button>
            ))}
          </div>
        )}

        <div className="ivc-chat">
          {messages.length === 0 && (
            <div className="ivc-welcome">
              <p>
                "Namaste, seeker. I am here to read your karma and guide your path.
                Whatever trouble weighs on your soul — career, marriage, health, finance, family — 
                speak openly. I will diagnose the planetary root cause and prescribe the exact remedy.
                There is no problem that Vedic wisdom cannot illuminate."
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`ivc-msg${msg.role === "user" ? " user" : ""}`}>
              <div className={`ivc-av ${msg.role === "user" ? "user" : "guru"}`}>
                {msg.role === "user" ? "🙏" : "🧘"}
              </div>
              {msg.role === "user" ? (
                <div className="ivc-user-bubble">
                  <div className="ivc-user-text">{msg.content}</div>
                </div>
              ) : (
                <div className="ivc-bubble">
                  <GurBubble resp={msg.content} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="ivc-msg">
              <div className="ivc-av guru">🧘</div>
              <div className="ivc-guru-bubble">
                <div className="ivc-typing">
                  <div className="ivc-dot" /><div className="ivc-dot" /><div className="ivc-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="ivc-input-area">
          <div className="ivc-input-inner">
            <textarea
              ref={textareaRef}
              className="ivc-input-box"
              placeholder="Pandit Ji se kuch bhi poochiye... Ask anything in Hindi or English"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
            />
            <button className="ivc-send-btn" onClick={() => send(input)} disabled={!input.trim() || loading}>
              ✦
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}