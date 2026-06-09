import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const fl = document.createElement("link"); fl.rel = "stylesheet";
fl.href = "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Space+Mono:wght@400;700&display=swap";
if (!document.head.querySelector("link[href*='Cinzel']")) document.head.appendChild(fl);

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const ANALYSIS_SYSTEM = `You are a Vedic karma analyst. Analyze journal entries and return ONLY a JSON object with exactly these keys:
{
  "rulingPlanet": "e.g. Saturn — this reflects Saturn transiting the 10th house of career",
  "karmaType": "e.g. Prarabdha Karma — past karma playing out",
  "karmaImpact": "Positive or Negative or Neutral or Mixed",
  "karmaScore": 5,
  "transitConnection": "e.g. Jupiter currently aspects your Moon, triggering emotional sensitivity",
  "patternNote": "e.g. This is a recurring pattern of suppressing emotions under authority figures",
  "karmicLesson": "The specific lesson this event is teaching the soul (2-3 sentences)",
  "pastLifeEcho": "What past-life karma this may be clearing (thoughtful, Vedic perspective)",
  "remedy": "Exact remedy: specific mantra, pooja, fasting day, or behavioral change",
  "affirmation": "A personalized Vedic affirmation for this situation"
}
All fields are required. karmaScore must be an integer from -10 to +10.`;

const PATTERN_SYSTEM = `Analyze these journal entries and identify a recurring karmic theme. 
Return ONLY: {"insight": "2 sentences describing the recurring karmic pattern and what it means for the person's soul journey"}`;

async function callAI(system, userMsg) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1200,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: system }, { role: "user", content: userMsg }]
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  const raw = data.choices?.[0]?.message?.content || "{}";
  try { return JSON.parse(raw); } catch { return {}; }
}

const CSS = `
*{box-sizing:border-box;}
.ivj-app{min-height:100vh;background:#03010a;color:#e8e0f0;font-family:'Cormorant Garamond',serif;overflow-x:hidden;position:relative;}
.ivj-stars{position:fixed;inset:0;pointer-events:none;z-index:0;}
.ivj-star{position:absolute;border-radius:50%;background:#fff;animation:jtwk var(--d,3s) ease-in-out infinite var(--dl,0s);opacity:var(--op,.4);}
@keyframes jtwk{0%,100%{opacity:var(--op);transform:scale(1);}50%{opacity:.05;transform:scale(.2);}}
.ivj-nb{position:fixed;border-radius:50%;filter:blur(120px);pointer-events:none;z-index:0;}
.ivj-wrap{position:relative;z-index:1;max-width:860px;margin:0 auto;padding:70px 24px 100px;}

.ivj-back{display:inline-flex;align-items:center;gap:6px;font-family:'Space Mono',monospace;font-size:11px;letter-spacing:2px;color:rgba(245,197,24,.5);text-transform:uppercase;text-decoration:none;margin-bottom:32px;transition:color .3s;}
.ivj-back:hover{color:#f5c518;}

.ivj-hdr{text-align:center;margin-bottom:40px;}
.ivj-eyebrow{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:5px;color:#ff6b9d;text-transform:uppercase;margin-bottom:14px;}
.ivj-h1{font-family:'Cinzel Decorative',serif;font-size:clamp(32px,6vw,52px);color:#f5c518;line-height:1.1;margin-bottom:14px;text-shadow:0 0 60px rgba(245,197,24,.4);}
.ivj-hsub{color:rgba(232,224,240,.5);font-style:italic;font-size:20px;line-height:1.7;}

/* Pattern insight */
.ivj-pattern{background:linear-gradient(135deg,rgba(123,47,255,.1),rgba(245,197,24,.07));border:1px solid rgba(123,47,255,.28);border-radius:18px;padding:22px 26px;margin-bottom:28px;display:flex;gap:16px;align-items:flex-start;}
.ivj-pattern-icon{font-size:26px;flex-shrink:0;margin-top:2px;}
.ivj-pattern-lbl{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:3px;color:#b57fff;text-transform:uppercase;margin-bottom:8px;}
.ivj-pattern-txt{font-size:18px;color:rgba(232,224,240,.8);line-height:1.75;font-style:italic;}

/* Form */
.ivj-form{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:24px;padding:32px;margin-bottom:28px;}
.ivj-form-title{font-family:'Cinzel Decorative',serif;font-size:20px;color:#f5c518;margin-bottom:22px;}

/* Event type grid */
.ivj-event-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:22px;}
@media(max-width:540px){.ivj-event-grid{grid-template-columns:repeat(2,1fr);}}
.ivj-ev{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:12px 8px;text-align:center;cursor:pointer;transition:all .3s;}
.ivj-ev:hover{border-color:rgba(245,197,24,.3);}
.ivj-ev.on{background:rgba(245,197,24,.1);border-color:rgba(245,197,24,.45);}
.ivj-ev-icon{font-size:24px;margin-bottom:6px;}
.ivj-ev-lbl{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:1px;color:rgba(232,224,240,.5);text-transform:uppercase;}
.ivj-ev.on .ivj-ev-lbl{color:rgba(245,197,24,.85);}

.ivj-flabel{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:3px;color:rgba(232,224,240,.4);text-transform:uppercase;display:block;margin-bottom:12px;}
.ivj-ta{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:18px;color:#e8e0f0;font-family:'Cormorant Garamond',serif;font-size:20px;line-height:1.75;resize:vertical;min-height:140px;outline:none;transition:border .3s;margin-bottom:20px;}
.ivj-ta:focus{border-color:#f5c518;box-shadow:0 0 0 3px rgba(245,197,24,.1);}
.ivj-ta::placeholder{color:rgba(232,224,240,.22);}

/* Intensity */
.ivj-intensity{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:22px;}
@media(max-width:480px){.ivj-intensity{grid-template-columns:repeat(2,1fr);}}
.ivj-int{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:11px;padding:10px;text-align:center;cursor:pointer;transition:all .3s;font-size:15px;color:rgba(232,224,240,.55);}
.ivj-int:hover{border-color:rgba(245,197,24,.3);}
.ivj-int.on{background:rgba(245,197,24,.1);border-color:rgba(245,197,24,.45);color:#f5c518;}

.ivj-save-btn{width:100%;background:linear-gradient(135deg,#f5c518,#f5a623);color:#03010a;border:none;border-radius:14px;padding:18px;font-family:'Space Mono',monospace;font-size:12px;letter-spacing:3px;text-transform:uppercase;cursor:pointer;font-weight:700;transition:all .3s;}
.ivj-save-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 12px 40px rgba(245,197,24,.4);}
.ivj-save-btn:disabled{opacity:.4;cursor:not-allowed;}

/* Entries */
.ivj-entries{display:flex;flex-direction:column;gap:16px;}
.ivj-empty{text-align:center;padding:60px 20px;color:rgba(232,224,240,.3);}
.ivj-empty-icon{font-size:48px;margin-bottom:16px;}
.ivj-empty-txt{font-style:italic;font-size:20px;}

.ivj-entry{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:20px;overflow:hidden;transition:border .3s;}
.ivj-entry:hover{border-color:rgba(245,197,24,.2);}
.ivj-entry-head{display:flex;align-items:center;gap:14px;padding:18px 22px;cursor:pointer;}
.ivj-ev-badge{font-size:26px;flex-shrink:0;}
.ivj-entry-meta{flex:1;min-width:0;}
.ivj-entry-type{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(245,197,24,.55);margin-bottom:4px;}
.ivj-entry-preview{font-size:17px;color:rgba(232,224,240,.55);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.ivj-entry-right{display:flex;align-items:center;gap:10px;flex-shrink:0;}
.ivj-entry-date{font-family:'Space Mono',monospace;font-size:10px;color:rgba(232,224,240,.3);}
.ivj-kscore{font-family:'Cinzel Decorative',serif;font-size:16px;padding:4px 12px;border-radius:50px;}
.ks-pos{background:rgba(0,255,170,.1);border:1px solid rgba(0,255,170,.3);color:#00ffaa;}
.ks-neg{background:rgba(255,45,120,.1);border:1px solid rgba(255,45,120,.3);color:#ff6b9d;}
.ks-neu{background:rgba(245,197,24,.1);border:1px solid rgba(245,197,24,.25);color:rgba(245,197,24,.8);}
.ivj-del{background:transparent;border:none;color:rgba(255,45,120,.4);cursor:pointer;font-size:18px;transition:color .3s;padding:4px 6px;}
.ivj-del:hover{color:#ff6b9d;}

.ivj-entry-body{padding:0 22px 24px;border-top:1px solid rgba(255,255,255,.06);}
.ivj-entry-txt{font-size:19px;line-height:1.85;color:rgba(232,224,240,.85);padding-top:18px;white-space:pre-wrap;margin-bottom:18px;}

/* Analysis block */
.ivj-analysis{background:rgba(123,47,255,.07);border:1px solid rgba(123,47,255,.22);border-radius:16px;padding:24px;}
.ivj-an-hdr{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:3px;color:#b57fff;text-transform:uppercase;margin-bottom:20px;}

.ivj-an-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
@media(max-width:540px){.ivj-an-grid{grid-template-columns:1fr;}}
.ivj-an-item{padding:0;}
.ivj-an-item.full{grid-column:1/-1;}
.ivj-an-lbl{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:2px;color:rgba(232,224,240,.35);text-transform:uppercase;margin-bottom:8px;display:block;}
.ivj-an-val{font-size:18px;line-height:1.75;color:#e8e0f0;}
.ivj-an-val.planet{font-family:'Cinzel Decorative',serif;font-size:17px;color:#f5c518;}
.ivj-an-val.echo{font-style:italic;color:rgba(123,47,255,.9);}
.ivj-an-val.affirm{font-style:italic;font-size:19px;color:rgba(245,197,24,.85);line-height:1.8;}
.ivj-remedy-box{background:rgba(0,229,255,.05);border:1px solid rgba(0,229,255,.18);border-radius:12px;padding:16px;font-size:17px;color:rgba(232,224,240,.85);line-height:1.7;}

.ivj-karma-impact{display:inline-flex;align-items:center;gap:6px;border-radius:50px;padding:5px 14px;font-family:'Space Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-top:6px;}

.ivj-analyze-btn{display:inline-flex;align-items:center;gap:8px;background:rgba(123,47,255,.12);border:1px solid rgba(123,47,255,.3);border-radius:10px;padding:10px 18px;color:#b57fff;font-family:'Space Mono',monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all .3s;margin-top:4px;}
.ivj-analyze-btn:hover:not(:disabled){background:rgba(123,47,255,.22);}
.ivj-analyze-btn:disabled{opacity:.45;}
.ivj-ai-loading{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:2px;color:rgba(123,47,255,.7);padding:16px 0;text-align:center;}
`;

const EVENT_TYPES = [
  { id:"career", icon:"💼", label:"Career" },
  { id:"relationship", icon:"💛", label:"Love/Family" },
  { id:"health", icon:"🌿", label:"Health" },
  { id:"finance", icon:"💰", label:"Finance" },
  { id:"spiritual", icon:"🕉", label:"Spiritual" },
  { id:"conflict", icon:"⚡", label:"Conflict" },
  { id:"gratitude", icon:"🙏", label:"Gratitude" },
  { id:"dream", icon:"🌙", label:"Dream" },
];

const INTENSITIES = [
  { id:"low", label:"😌 Mild" },
  { id:"medium", label:"😰 Moderate" },
  { id:"high", label:"🔥 Intense" },
  { id:"transformative", label:"✨ Transformative" },
];

function Stars() {
  return (
    <div className="ivj-stars">
      {Array.from({ length: 70 }).map((_, i) => (
        <div key={i} className="ivj-star" style={{
          width:`${Math.random()*2+1}px`, height:`${Math.random()*2+1}px`,
          left:`${Math.random()*100}%`, top:`${Math.random()*100}%`,
          "--d":`${2+Math.random()*5}s`, "--dl":`${Math.random()*5}s`,
          "--op":`${0.1+Math.random()*0.5}`,
        }} />
      ))}
      <div className="ivj-nb" style={{ width:450, height:450, left:"-10%", top:"8%", background:"rgba(255,107,157,.07)" }} />
      <div className="ivj-nb" style={{ width:380, height:380, right:"-8%", bottom:"18%", background:"rgba(245,197,24,.06)" }} />
    </div>
  );
}

export default function InnerVoiceJournal() {
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem("iv_journal_v2") || "[]"); } catch { return []; }
  });
  const [text, setText] = useState("");
  const [eventType, setEventType] = useState("");
  const [intensity, setIntensity] = useState("medium");
  const [expanded, setExpanded] = useState(null);
  const [analyzing, setAnalyzing] = useState(null);
  const [patternInsight, setPatternInsight] = useState(null);

  const profile = (() => { try { return JSON.parse(localStorage.getItem("iv_profile") || "null"); } catch { return null; } })();

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  useEffect(() => {
    if (entries.length >= 3 && !patternInsight) loadPattern();
  }, [entries.length]);

  const persist = (updated) => {
    setEntries(updated);
    localStorage.setItem("iv_journal_v2", JSON.stringify(updated));
  };

  const saveEntry = async () => {
    if (!text.trim() || !eventType) return;
    const entry = { id: Date.now().toString(), date: new Date().toISOString(), text, eventType, intensity, analysis: null };
    const updated = [entry, ...entries];
    persist(updated);
    setText(""); setEventType(""); setIntensity("medium");
    await analyzeEntry(entry, updated);
  };

  const analyzeEntry = async (entry, current = entries) => {
    setAnalyzing(entry.id);
    const today = new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
    const profileCtx = profile ? `User: ${profile.name}, Sign: ${profile.sign}, Nakshatra: ${profile.nakshatra || "unknown"}, Dasha: ${profile.dasha || "unknown"}` : "No birth profile available";
    try {
      const data = await callAI(
        ANALYSIS_SYSTEM,
        `${profileCtx}\nToday: ${today}\nEvent: ${entry.eventType}\nIntensity: ${entry.intensity}\nJournal Entry:\n${entry.text}`
      );
      if (!data || Object.keys(data).length === 0) throw new Error("Empty response");
      const updated = current.map(e => e.id === entry.id ? { ...e, analysis: data } : e);
      persist(updated);
      setExpanded(entry.id);
    } catch(err) {
      console.error("Analysis failed:", err);
    } finally {
      setAnalyzing(null);
    }
  };

  const loadPattern = async () => {
    const recent = entries.slice(0, 5).map(e => `[${e.eventType}] ${e.text.slice(0, 120)}`).join("\n");
    try {
      const data = await callAI(PATTERN_SYSTEM, `Recent journal entries:\n${recent}`);
      if (data?.insight) setPatternInsight(data.insight);
    } catch {}
  };

  const deleteEntry = (id) => {
    persist(entries.filter(e => e.id !== id));
    if (expanded === id) setExpanded(null);
  };

  const getEvent = (id) => EVENT_TYPES.find(e => e.id === id) || { icon:"📓", label: id };

  const scoreClass = (score) => {
    if (!score && score !== 0) return "ks-neu";
    if (score > 0) return "ks-pos";
    if (score < 0) return "ks-neg";
    return "ks-neu";
  };

  return (
    <div className="ivj-app">
      <style>{CSS}</style>
      <Stars />
      <div className="ivj-wrap">
        <Link to="/inner-voice" className="ivj-back">← Inner Voice</Link>

        <div className="ivj-hdr">
          <div className="ivj-eyebrow">Planetary Diary</div>
          <h1 className="ivj-h1">Karma Journal</h1>
          <p className="ivj-hsub">Log life events — AI reveals the karmic pattern behind them</p>
        </div>

        {patternInsight && (
          <div className="ivj-pattern">
            <div className="ivj-pattern-icon">🔭</div>
            <div>
              <div className="ivj-pattern-lbl">Recurring Karma Pattern</div>
              <div className="ivj-pattern-txt">{patternInsight}</div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="ivj-form">
          <div className="ivj-form-title">Record a Life Event</div>

          <label className="ivj-flabel">What area of life?</label>
          <div className="ivj-event-grid">
            {EVENT_TYPES.map(e => (
              <div key={e.id} className={`ivj-ev${eventType===e.id?" on":""}`} onClick={()=>setEventType(e.id)}>
                <div className="ivj-ev-icon">{e.icon}</div>
                <div className="ivj-ev-lbl">{e.label}</div>
              </div>
            ))}
          </div>

          <label className="ivj-flabel">What happened?</label>
          <textarea
            className="ivj-ta"
            placeholder={`Be specific and honest. What happened? How did you respond? What did you feel? Did you act from your highest self or from fear/ego?\n\nExample: "My boss criticised me unfairly in front of the team. I felt humiliated and responded with silence. Later I felt resentment building..."`}
            value={text}
            onChange={e=>setText(e.target.value)}
          />

          <label className="ivj-flabel">Emotional intensity</label>
          <div className="ivj-intensity" style={{marginBottom:22}}>
            {INTENSITIES.map(i => (
              <div key={i.id} className={`ivj-int${intensity===i.id?" on":""}`} onClick={()=>setIntensity(i.id)}>
                {i.label}
              </div>
            ))}
          </div>

          <button
            className="ivj-save-btn"
            onClick={saveEntry}
            disabled={text.trim().length < 10 || !eventType || !!analyzing}
          >
            {analyzing ? "Analysing your karma..." : "Save & Analyse Karma"}
          </button>
        </div>

        {/* Entries */}
        {entries.length === 0 ? (
          <div className="ivj-empty">
            <div className="ivj-empty-icon">📓</div>
            <div className="ivj-empty-txt">Your karma journal is empty. Record your first life event above.</div>
          </div>
        ) : (
          <div className="ivj-entries">
            {entries.map(entry => {
              const ev = getEvent(entry.eventType);
              const isExpanded = expanded === entry.id;
              const an = entry.analysis;
              return (
                <div key={entry.id} className="ivj-entry">
                  <div className="ivj-entry-head" onClick={()=>setExpanded(isExpanded ? null : entry.id)}>
                    <div className="ivj-ev-badge">{ev.icon}</div>
                    <div className="ivj-entry-meta">
                      <div className="ivj-entry-type">{ev.label} · {entry.intensity}</div>
                      <div className="ivj-entry-preview">{entry.text}</div>
                    </div>
                    <div className="ivj-entry-right">
                      <div className="ivj-entry-date">
                        {new Date(entry.date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
                      </div>
                      {an?.karmaScore !== undefined && (
                        <span className={`ivj-kscore ${scoreClass(an.karmaScore)}`}>
                          {an.karmaScore > 0 ? "+" : ""}{an.karmaScore}
                        </span>
                      )}
                      <button className="ivj-del" onClick={e=>{e.stopPropagation();deleteEntry(entry.id);}}>✕</button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="ivj-entry-body">
                      <div className="ivj-entry-txt">{entry.text}</div>

                      {analyzing === entry.id && (
                        <div className="ivj-ai-loading">🕉 Reading planetary influences...</div>
                      )}

                      {an && Object.keys(an).length > 0 ? (
                        <div className="ivj-analysis">
                          <div className="ivj-an-hdr">🕉 Karmic Analysis</div>
                          <div className="ivj-an-grid">

                            {an.rulingPlanet && (
                              <div className="ivj-an-item">
                                <span className="ivj-an-lbl">Ruling Planet</span>
                                <div className="ivj-an-val planet">{an.rulingPlanet}</div>
                              </div>
                            )}

                            {an.karmaType && (
                              <div className="ivj-an-item">
                                <span className="ivj-an-lbl">Karma Type</span>
                                <div className="ivj-an-val">{an.karmaType}
                                  {an.karmaImpact && (
                                    <div className={`ivj-karma-impact ${scoreClass(an.karmaScore)}`}>
                                      {an.karmaImpact}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {an.transitConnection && (
                              <div className="ivj-an-item">
                                <span className="ivj-an-lbl">Transit Connection</span>
                                <div className="ivj-an-val">{an.transitConnection}</div>
                              </div>
                            )}

                            {an.patternNote && (
                              <div className="ivj-an-item">
                                <span className="ivj-an-lbl">Pattern Note</span>
                                <div className="ivj-an-val">{an.patternNote}</div>
                              </div>
                            )}

                            {an.karmicLesson && (
                              <div className="ivj-an-item full">
                                <span className="ivj-an-lbl">Karmic Lesson</span>
                                <div className="ivj-an-val">{an.karmicLesson}</div>
                              </div>
                            )}

                            {an.pastLifeEcho && (
                              <div className="ivj-an-item full">
                                <span className="ivj-an-lbl">Past Life Echo</span>
                                <div className="ivj-an-val echo">{an.pastLifeEcho}</div>
                              </div>
                            )}

                            {an.remedy && (
                              <div className="ivj-an-item full">
                                <span className="ivj-an-lbl">Prescribed Remedy</span>
                                <div className="ivj-remedy-box">{an.remedy}</div>
                              </div>
                            )}

                            {an.affirmation && (
                              <div className="ivj-an-item full">
                                <span className="ivj-an-lbl">Affirmation</span>
                                <div className="ivj-an-val affirm">"{an.affirmation}"</div>
                              </div>
                            )}

                          </div>
                        </div>
                      ) : (!analyzing && (
                        <button className="ivj-analyze-btn" onClick={()=>analyzeEntry(entry)}>
                          🕉 Analyse Karma
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}