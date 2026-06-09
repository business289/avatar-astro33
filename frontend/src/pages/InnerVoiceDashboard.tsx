import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

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
.ivd-app{min-height:100vh;background:#03010a;color:#e8e0f0;font-family:'Cormorant Garamond',serif;font-size:18px;overflow-x:hidden;position:relative;}
.ivd-stars{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;}
.ivd-star{position:absolute;border-radius:50%;background:#fff;animation:ivd-twk var(--d,3s) ease-in-out infinite;animation-delay:var(--dl,0s);opacity:var(--op,.5);}
@keyframes ivd-twk{0%,100%{opacity:var(--op,.5);transform:scale(1);}50%{opacity:.05;transform:scale(.3);}}
.ivd-nb{position:fixed;border-radius:50%;filter:blur(110px);pointer-events:none;z-index:0;}
.ivd-content{position:relative;z-index:1;max-width:880px;margin:0 auto;padding:80px 20px 80px;}

.ivd-back{display:inline-block;font-family:'Space Mono',monospace;font-size:8px;letter-spacing:3px;color:rgba(245,197,24,.5);text-transform:uppercase;text-decoration:none;transition:color .3s;margin-bottom:28px;}
.ivd-back:hover{color:#f5c518;}
.ivd-hdr{text-align:center;margin-bottom:36px;}
.ivd-eyebrow{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:5px;color:#00ffaa;text-transform:uppercase;margin-bottom:10px;}
.ivd-title{font-family:'Cinzel Decorative',serif;font-size:clamp(22px,4vw,38px);color:#f5c518;text-shadow:0 0 40px rgba(245,197,24,.35);margin-bottom:6px;}
.ivd-sub{color:rgba(232,224,240,.4);font-style:italic;font-size:14px;}

/* Birth setup form */
.ivd-setup{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:28px;margin-bottom:28px;}
.ivd-setup-title{font-family:'Cinzel Decorative',serif;font-size:15px;color:#f5c518;margin-bottom:6px;}
.ivd-setup-sub{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:2px;color:rgba(232,224,240,.35);text-transform:uppercase;margin-bottom:22px;}
.ivd-grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;}
@media(max-width:500px){.ivd-grid2{grid-template-columns:1fr;}}
.ivd-field label{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:2px;color:rgba(232,224,240,.38);text-transform:uppercase;display:block;margin-bottom:7px;}
.ivd-input{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:11px 14px;color:#e8e0f0;font-family:'Cormorant Garamond',serif;font-size:16px;outline:none;transition:border .3s;box-sizing:border-box;}
.ivd-input:focus{border-color:rgba(245,197,24,.45);}
.ivd-select{width:100%;background:#07030f;border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:11px 14px;color:#e8e0f0;font-family:'Cormorant Garamond',serif;font-size:16px;outline:none;cursor:pointer;}
.ivd-select option{background:#07030f;}
.ivd-setup-btn{width:100%;background:linear-gradient(135deg,#f5c518,#f5a623);color:#03010a;border:none;border-radius:11px;padding:14px;font-family:'Space Mono',monospace;font-size:10px;letter-spacing:3px;text-transform:uppercase;cursor:pointer;font-weight:700;transition:all .3s;margin-top:6px;}
.ivd-setup-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 28px rgba(245,197,24,.36);}
.ivd-setup-btn:disabled{opacity:.45;cursor:not-allowed;}

/* Score ring */
.ivd-score-section{display:flex;align-items:center;justify-content:center;gap:36px;flex-wrap:wrap;margin-bottom:32px;}
.ivd-ring-wrap{position:relative;width:160px;height:160px;flex-shrink:0;}
.ivd-ring-svg{width:160px;height:160px;transform:rotate(-90deg);}
.ivd-ring-bg{fill:none;stroke:rgba(255,255,255,.07);stroke-width:10;}
.ivd-ring-fill{fill:none;stroke-width:10;stroke-linecap:round;transition:stroke-dashoffset 1.2s ease;}
.ivd-ring-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
.ivd-ring-num{font-family:'Cinzel Decorative',serif;font-size:38px;font-weight:900;color:#f5c518;line-height:1;}
.ivd-ring-den{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:2px;color:rgba(232,224,240,.35);margin-top:4px;}
.ivd-score-meta{max-width:280px;}
.ivd-score-name{font-family:'Cinzel Decorative',serif;font-size:15px;color:#e8e0f0;margin-bottom:6px;}
.ivd-score-msg{font-size:15px;line-height:1.75;color:rgba(232,224,240,.7);font-style:italic;}
.ivd-score-dasha{font-family:'Space Mono',monospace;font-size:9px;color:rgba(0,229,255,.7);margin-top:8px;letter-spacing:1px;}

/* Today's karma actions */
.ivd-actions-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:26px;margin-bottom:22px;}
.ivd-card-title{font-family:'Cinzel Decorative',serif;font-size:15px;color:#f5c518;margin-bottom:4px;}
.ivd-card-sub{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:2px;color:rgba(232,224,240,.35);text-transform:uppercase;margin-bottom:20px;}
.ivd-actions-list{display:flex;flex-direction:column;gap:10px;}
.ivd-action-row{display:flex;align-items:center;gap:14px;padding:12px 16px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:12px;transition:border .3s;}
.ivd-action-row.done{border-color:rgba(0,255,170,.25);background:rgba(0,255,170,.04);}
.ivd-action-check{width:24px;height:24px;border-radius:50%;border:2px solid rgba(255,255,255,.2);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .3s;}
.ivd-action-check.done{background:#00ffaa;border-color:#00ffaa;color:#03010a;font-size:12px;}
.ivd-action-check:not(.done):hover{border-color:rgba(0,255,170,.5);}
.ivd-action-info{flex:1;}
.ivd-action-name{font-size:15px;color:#e8e0f0;margin-bottom:2px;}
.ivd-action-row.done .ivd-action-name{color:rgba(232,224,240,.45);text-decoration:line-through;}
.ivd-action-pts{font-family:'Space Mono',monospace;font-size:9px;color:rgba(0,255,170,.7);}
.ivd-action-type{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;border-radius:50px;padding:2px 10px;flex-shrink:0;}
.at-mantra{background:rgba(123,47,255,.12);border:1px solid rgba(123,47,255,.3);color:#b57fff;}
.at-pooja{background:rgba(255,170,0,.1);border:1px solid rgba(255,170,0,.25);color:#ffaa00;}
.at-charity{background:rgba(0,229,255,.08);border:1px solid rgba(0,229,255,.22);color:#00e5ff;}
.at-fast{background:rgba(255,107,157,.08);border:1px solid rgba(255,107,157,.22);color:#ff9ec8;}
.at-seva{background:rgba(0,255,170,.08);border:1px solid rgba(0,255,170,.22);color:#00ffaa;}
.ivd-save-btn{width:100%;background:linear-gradient(135deg,#f5c518,#f5a623);color:#03010a;border:none;border-radius:11px;padding:13px;font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;cursor:pointer;font-weight:700;transition:all .3s;margin-top:16px;}
.ivd-save-btn:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(245,197,24,.35);}
.ivd-saved{text-align:center;font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;color:#00ffaa;margin-top:8px;animation:ivd-fadein .4s ease;}

/* Karma breakdown */
.ivd-breakdown-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:22px;}
@media(max-width:540px){.ivd-breakdown-grid{grid-template-columns:1fr 1fr;}}
.ivd-bk-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:16px;text-align:center;}
.ivd-bk-icon{font-size:22px;margin-bottom:6px;}
.ivd-bk-val{font-family:'Cinzel Decorative',serif;font-size:22px;margin-bottom:3px;}
.ivd-bk-lbl{font-family:'Space Mono',monospace;font-size:7px;letter-spacing:2px;color:rgba(232,224,240,.35);text-transform:uppercase;}

/* Charts */
.ivd-chart-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:18px;padding:24px;margin-bottom:22px;}
.recharts-polar-angle-axis-tick-value{font-family:'Space Mono',monospace;font-size:9px;fill:rgba(232,224,240,.5);}

/* Transit alerts */
.ivd-transit-card{background:rgba(0,229,255,.04);border:1px solid rgba(0,229,255,.18);border-radius:18px;padding:24px;margin-bottom:22px;}
.ivd-transit-title{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;color:#00e5ff;text-transform:uppercase;margin-bottom:14px;}
.ivd-transit-row{display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.05);}
.ivd-transit-row:last-child{border-bottom:none;}
.ivd-transit-icon{font-size:18px;flex-shrink:0;margin-top:2px;}
.ivd-transit-text{font-size:14px;color:rgba(232,224,240,.75);line-height:1.6;}
.ivd-transit-impact{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:2px;border-radius:50px;padding:2px 10px;margin-left:auto;flex-shrink:0;}
.ti-pos{background:rgba(0,255,170,.08);border:1px solid rgba(0,255,170,.2);color:#00ffaa;}
.ti-neg{background:rgba(255,45,120,.08);border:1px solid rgba(255,45,120,.2);color:#ff6b9d;}
.ti-neu{background:rgba(245,197,24,.08);border:1px solid rgba(245,197,24,.2);color:#f5c518;}

/* History */
.ivd-history-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:18px;padding:24px;}
.ivd-h-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.05);}
.ivd-h-row:last-child{border-bottom:none;}
.ivd-h-date{font-family:'Space Mono',monospace;font-size:9px;color:rgba(232,224,240,.35);min-width:80px;}
.ivd-h-bar-wrap{flex:1;height:4px;background:rgba(255,255,255,.07);border-radius:2px;}
.ivd-h-bar{height:100%;border-radius:2px;background:linear-gradient(90deg,#7b2fff,#f5c518);}
.ivd-h-score{font-family:'Cinzel Decorative',serif;font-size:18px;color:#f5c518;min-width:50px;text-align:right;}
.ivd-h-pts{font-family:'Space Mono',monospace;font-size:8px;color:rgba(0,255,170,.6);text-align:right;}
.ivd-loading-ai{text-align:center;padding:30px;font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;color:rgba(245,197,24,.6);}
.ivd-loader{width:40px;height:40px;border:2px solid rgba(245,197,24,.15);border-top-color:#f5c518;border-radius:50%;animation:ivd-spin 1s linear infinite;margin:0 auto 12px;}
@keyframes ivd-spin{to{transform:rotate(360deg);}}
@keyframes ivd-fadein{from{opacity:0;}to{opacity:1;}}
.ivd-empty{text-align:center;color:rgba(232,224,240,.3);font-style:italic;padding:20px 0;}
`;


const KARMA_ACTIONS = [
  { id: "mantra", name: "Chant today's prescribed mantra", pts: 8, type: "mantra" },
  { id: "meditation", name: "15 minutes of morning meditation", pts: 5, type: "seva" },
  { id: "truth", name: "Speak only truth today (Satya)", pts: 6, type: "seva" },
  { id: "feed", name: "Feed a cow, dog, or needy person", pts: 10, type: "charity" },
  { id: "fast", name: "Keep today's vrat (if applicable)", pts: 12, type: "fast" },
  { id: "pooja", name: "Perform morning pooja / aarti", pts: 9, type: "pooja" },
  { id: "anger", name: "Did not lose temper today", pts: 7, type: "seva" },
  { id: "charity", name: "Made a charitable donation/seva", pts: 11, type: "charity" },
];

const ZODIAC_SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const NAKSHATRA = ["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishtha","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"];

function Stars() {
  return (
    <div className="ivd-stars">
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} className="ivd-star" style={{
          width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px`,
          left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
          "--d": `${2 + Math.random() * 5}s`, "--dl": `${Math.random() * 5}s`,
          "--op": `${0.12 + Math.random() * 0.5}`,
        }} />
      ))}
      <div className="ivd-nb" style={{ width: 500, height: 500, left: "-12%", top: "5%", background: "rgba(0,255,170,.06)" }} />
      <div className="ivd-nb" style={{ width: 400, height: 400, right: "-8%", bottom: "15%", background: "rgba(245,197,24,.07)" }} />
    </div>
  );
}

function ScoreRing({ score, max = 100 }) {
  const r = 65, circ = 2 * Math.PI * r;
  const offset = circ - (score / max) * circ;
  const color = score >= 70 ? "#00ffaa" : score >= 50 ? "#f5c518" : score >= 30 ? "#ffaa00" : "#ff6b9d";
  return (
    <div className="ivd-ring-wrap">
      <svg className="ivd-ring-svg" viewBox="0 0 160 160">
        <circle className="ivd-ring-bg" cx="80" cy="80" r={r} />
        <circle className="ivd-ring-fill" cx="80" cy="80" r={r}
          stroke={color} strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      <div className="ivd-ring-center">
        <div className="ivd-ring-num">{score}</div>
        <div className="ivd-ring-den">/ 100</div>
      </div>
    </div>
  );
}

export default function InnerVoiceDashboard() {
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem("iv_profile") || "null"); } catch { return null; }
  });
  const [form, setForm] = useState({ name: "", dob: "", sign: "", nakshatra: "", dasha: "" });
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("iv_karma_v2") || "[]"); } catch { return []; }
  });
  const [done, setDone] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    try { return JSON.parse(localStorage.getItem(`iv_done_${today}`) || "[]"); } catch { return []; }
  });
  const [aiData, setAiData] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  // Load AI data when profile exists and no aiData
  useEffect(() => {
    if (profile && !aiData) loadAIData();
  }, [profile]);

  const saveProfile = () => {
    if (!form.name || !form.sign) return;
    localStorage.setItem("iv_profile", JSON.stringify(form));
    setProfile(form);
  };

  const loadAIData = async () => {
    setLoadingAI(true);
    const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    try {
      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
          max_tokens: 1200,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: "You are a Vedic astrology karma calculator. Return ONLY valid JSON, no other text." },
            { role: "user", content: `Calculate karma score for:\nName: ${profile.name}\nSun Sign: ${profile.sign}\nNakshatra: ${profile.nakshatra || "Unknown"}\nCurrent Dasha: ${profile.dasha || "Unknown"}\nDOB: ${profile.dob || "Unknown"}\nToday: ${today}\n\nReturn JSON with these fields: composite (0-100 integer), natalBase (0-40), transitBonus (-20 to +30), behaviorBase (0-30), scoreMessage (2 sentences), currentDasha (string), transitAlerts (array of {planet, event, impact, tip}), radarData (array of {subject, value} for Dharma/Artha/Kama/Moksha/Karma/Seva each 1-10)` }
          ],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1200 },
        }),
      });
      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content || "{}";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setAiData(parsed);
    } catch (e) {
      // fallback static
      setAiData({
        composite: 62,
        natalBase: 28,
        transitBonus: 5,
        behaviorBase: 29,
        scoreMessage: "Your karma shows moderate alignment. Focus on completing your daily remedies to elevate your score.",
        currentDasha: "Consult Pandit Ji for your current dasha reading.",
        transitAlerts: [
          { planet: "Saturn", event: "Saturn's transit requires patience and discipline", impact: "neutral", tip: "Perform Shani Puja on Saturday" },
          { planet: "Jupiter", event: "Jupiter blesses your dharmic efforts", impact: "positive", tip: "Wear yellow, donate to education" }
        ],
        radarData: [
          { subject: "Dharma", value: 6 }, { subject: "Artha", value: 5 },
          { subject: "Kama", value: 4 }, { subject: "Moksha", value: 7 },
          { subject: "Karma", value: 6 }, { subject: "Seva", value: 5 }
        ]
      });
    } finally {
      setLoadingAI(false);
    }
  };

  const toggleAction = (id) => {
    const today = new Date().toISOString().slice(0, 10);
    const next = done.includes(id) ? done.filter(d => d !== id) : [...done, id];
    setDone(next);
    localStorage.setItem(`iv_done_${today}`, JSON.stringify(next));
  };

  const behaviorPts = done.reduce((s, id) => s + (KARMA_ACTIONS.find(a => a.id === id)?.pts || 0), 0);
  const composite = aiData ? Math.min(100, aiData.natalBase + aiData.transitBonus + Math.round((behaviorPts / 68) * aiData.behaviorBase)) : null;

  const saveToday = () => {
    if (!composite) return;
    const today = new Date().toISOString().slice(0, 10);
    const entry = { date: today, composite, behaviorPts, actionsCompleted: done.length };
    const updated = [entry, ...history.filter(e => e.date !== today)].slice(0, 60);
    setHistory(updated);
    localStorage.setItem("iv_karma_v2", JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const lineData = [...history].reverse().slice(-14).map(e => ({ date: e.date.slice(5), score: e.composite }));

  // ── Render: Setup ───────────────────────────────────────────────────────────
  if (!profile) return (
    <div className="ivd-app">
      <style>{CSS}</style>
      <Stars />
      <div className="ivd-content">
        <Link to="/inner-voice" className="ivd-back">← Inner Voice</Link>
        <div className="ivd-hdr">
          <div className="ivd-eyebrow">One-time Setup</div>
          <h1 className="ivd-title">Karma Score</h1>
          <p className="ivd-sub">Your personal karma score, calculated from your birth chart + today's planetary transits + your daily dharmic actions</p>
        </div>
        <div className="ivd-setup">
          <div className="ivd-setup-title">Your Vedic Profile</div>
          <div className="ivd-setup-sub">Needed to calculate your natal karma base score</div>
          <div className="ivd-grid2">
            <div className="ivd-field">
              <label>Your Name</label>
              <input className="ivd-input" placeholder="Enter your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="ivd-field">
              <label>Date of Birth</label>
              <input className="ivd-input" type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} />
            </div>
            <div className="ivd-field">
              <label>Sun Sign / Rashi</label>
              <select className="ivd-select" value={form.sign} onChange={e => setForm(f => ({ ...f, sign: e.target.value }))}>
                <option value="">Select your sign...</option>
                {ZODIAC_SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="ivd-field">
              <label>Nakshatra (if known)</label>
              <select className="ivd-select" value={form.nakshatra} onChange={e => setForm(f => ({ ...f, nakshatra: e.target.value }))}>
                <option value="">Select nakshatra...</option>
                {NAKSHATRA.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div className="ivd-field" style={{ marginBottom: 14 }}>
            <label>Current Mahadasha (if known)</label>
            <select className="ivd-select" value={form.dasha} onChange={e => setForm(f => ({ ...f, dasha: e.target.value }))}>
              <option value="">Select dasha...</option>
              {["Sun Dasha","Moon Dasha","Mars Dasha","Rahu Dasha","Jupiter Dasha","Saturn Dasha","Mercury Dasha","Ketu Dasha","Venus Dasha"].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <button className="ivd-setup-btn" onClick={saveProfile} disabled={!form.name || !form.sign}>
            Calculate My Karma Score →
          </button>
        </div>
      </div>
    </div>
  );

  // ── Render: Loading ─────────────────────────────────────────────────────────
  if (loadingAI) return (
    <div className="ivd-app">
      <style>{CSS}</style>
      <Stars />
      <div className="ivd-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <div style={{ textAlign: "center" }}>
          <div className="ivd-loader" />
          <div className="ivd-loading-ai">Calculating your karma from birth chart + today's transits...</div>
        </div>
      </div>
    </div>
  );

  // ── Render: Dashboard ────────────────────────────────────────────────────────
  return (
    <div className="ivd-app">
      <style>{CSS}</style>
      <Stars />
      <div className="ivd-content">
        <Link to="/inner-voice" className="ivd-back">← Inner Voice</Link>

        <div className="ivd-hdr">
          <div className="ivd-eyebrow">Daily Karma Score</div>
          <h1 className="ivd-title">Karma Score</h1>
          <p className="ivd-sub">{profile.name} · {profile.sign} · {profile.nakshatra || "Nakshatra unknown"}</p>
        </div>

        {/* Score ring */}
        {composite !== null && (
          <div className="ivd-score-section">
            <ScoreRing score={composite} />
            <div className="ivd-score-meta">
              <div className="ivd-score-name">Today's Composite Karma</div>
              <div className="ivd-score-msg">{aiData?.scoreMessage}</div>
              {aiData?.currentDasha && <div className="ivd-score-dasha">↳ {aiData.currentDasha}</div>}
            </div>
          </div>
        )}

        {/* Breakdown */}
        {aiData && (
          <div className="ivd-breakdown-grid">
            <div className="ivd-bk-card">
              <div className="ivd-bk-icon">🌟</div>
              <div className="ivd-bk-val" style={{ color: "#b57fff" }}>{aiData.natalBase}</div>
              <div className="ivd-bk-lbl">Natal Base</div>
            </div>
            <div className="ivd-bk-card">
              <div className="ivd-bk-icon">🪐</div>
              <div className="ivd-bk-val" style={{ color: aiData.transitBonus >= 0 ? "#00ffaa" : "#ff6b9d" }}>
                {aiData.transitBonus >= 0 ? "+" : ""}{aiData.transitBonus}
              </div>
              <div className="ivd-bk-lbl">Transit Bonus</div>
            </div>
            <div className="ivd-bk-card">
              <div className="ivd-bk-icon">⚡</div>
              <div className="ivd-bk-val" style={{ color: "#f5c518" }}>{behaviorPts}</div>
              <div className="ivd-bk-lbl">Today's Actions</div>
            </div>
          </div>
        )}

        {/* Today's karma actions */}
        <div className="ivd-actions-card">
          <div className="ivd-card-title">Today's Karma Actions</div>
          <div className="ivd-card-sub">Complete these to boost your score — each action has real karma value</div>
          <div className="ivd-actions-list">
            {KARMA_ACTIONS.map(a => (
              <div key={a.id} className={`ivd-action-row${done.includes(a.id) ? " done" : ""}`}>
                <div className={`ivd-action-check${done.includes(a.id) ? " done" : ""}`} onClick={() => toggleAction(a.id)}>
                  {done.includes(a.id) ? "✓" : ""}
                </div>
                <div className="ivd-action-info">
                  <div className="ivd-action-name">{a.name}</div>
                  <div className="ivd-action-pts">+{a.pts} karma points</div>
                </div>
                <span className={`ivd-action-type at-${a.type}`}>{a.type}</span>
              </div>
            ))}
          </div>
          <button className="ivd-save-btn" onClick={saveToday}>Save Today's Score</button>
          {saved && <div className="ivd-saved">✓ Score saved — {composite}/100 karma points</div>}
        </div>

        {/* Transit alerts */}
        {aiData?.transitAlerts?.length > 0 && (
          <div className="ivd-transit-card">
            <div className="ivd-transit-title">🪐 Today's Planetary Influences</div>
            {aiData.transitAlerts.map((t, i) => (
              <div key={i} className="ivd-transit-row">
                <div className="ivd-transit-icon">⭐</div>
                <div className="ivd-transit-text">
                  <strong>{t.planet}:</strong> {t.event}
                  <div style={{ marginTop: 4, fontSize: 13, color: "rgba(232,224,240,.5)" }}>↳ {t.tip}</div>
                </div>
                <span className={`ivd-transit-impact ti-${t.impact === "positive" ? "pos" : t.impact === "negative" ? "neg" : "neu"}`}>
                  {t.impact}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Purushartha Radar */}
        {aiData?.radarData && (
          <div className="ivd-chart-card">
            <div className="ivd-card-title">Purushartha Balance</div>
            <div className="ivd-card-sub" style={{ marginBottom: 16 }}>The four goals of life — how you're aligned today</div>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={aiData.radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.07)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(232,224,240,0.55)", fontSize: 10, fontFamily: "'Space Mono',monospace" }} />
                <Radar dataKey="value" stroke="#f5c518" fill="#f5c518" fillOpacity={0.12} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 14-day trend */}
        {lineData.length > 1 && (
          <div className="ivd-chart-card">
            <div className="ivd-card-title">Karma Trend</div>
            <div className="ivd-card-sub" style={{ marginBottom: 16 }}>Your composite score over the last 14 days</div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={lineData}>
                <XAxis dataKey="date" tick={{ fill: "rgba(232,224,240,0.35)", fontSize: 9, fontFamily: "'Space Mono',monospace" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "rgba(232,224,240,0.35)", fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0d0520", border: "1px solid rgba(245,197,24,.3)", borderRadius: 10, fontFamily: "'Space Mono',monospace", fontSize: 10 }} />
                <Line type="monotone" dataKey="score" stroke="#f5c518" strokeWidth={2} dot={{ fill: "#f5c518", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* History */}
        <div className="ivd-history-card">
          <div className="ivd-card-title">Score History</div>
          <div className="ivd-card-sub" style={{ marginBottom: 14 }}>Last 30 days</div>
          {history.length === 0 ? (
            <div className="ivd-empty">No history yet. Save your first score above.</div>
          ) : (
            history.slice(0, 15).map(e => (
              <div key={e.date} className="ivd-h-row">
                <div className="ivd-h-date">{new Date(e.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                <div className="ivd-h-bar-wrap"><div className="ivd-h-bar" style={{ width: `${e.composite}%` }} /></div>
                <div>
                  <div className="ivd-h-score">{e.composite}</div>
                  <div className="ivd-h-pts">{e.actionsCompleted} actions</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}