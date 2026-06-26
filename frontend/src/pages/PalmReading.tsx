import { useState, useRef, useCallback } from "react";
import { useBackOverride } from "../context/NavigationContext";


// ─── Types ────────────────────────────────────────────────────────────────────
type Stage = "landing" | "scanning" | "results";

interface PalmResult {
  handType: string; handElement: string; dominance: string;
  score: number; confidence: number;
  lines: { heart: LineData; head: LineData; life: LineData; fate: LineData };
  mounts: MountData[];
  personality: TraitScore[];
  love: string[]; loveStrengths: string[]; loveChallenges: string[];
  career: string[]; careerTypes: string[];
  timeline: TimelineItem[];
  hiddenStrengths: string[];
  recommendations: RecoItem[];
  summary: string;
}
interface LineData { length: string; depth: string; clarity: string; interpretation: string; strengths: string[]; challenges: string[]; recommendations: string }
interface MountData { name: string; planet: string; strength: number; meaning: string }
interface TraitScore { name: string; score: number; icon: string }
interface TimelineItem { phase: string; years: string; theme: string; insight: string }
interface RecoItem { category: string; icon: string; tip: string }

// ─── Deterministic result generator ──────────────────────────────────────────
function generatePalmResult(seed: number): PalmResult {
  const s = (seed % 4);
  const handTypes = [
    { type: "Earth Hand", element: "Earth 🌍", traits: "Practical, stable, grounded, reliable, steadfast" },
    { type: "Air Hand",   element: "Air 💨",   traits: "Intelligent, logical, curious, communicative, analytical" },
    { type: "Water Hand", element: "Water 🌊", traits: "Emotional, sensitive, artistic, empathetic, intuitive" },
    { type: "Fire Hand",  element: "Fire 🔥",  traits: "Energetic, passionate, ambitious, spontaneous, bold" },
  ];
  const ht = handTypes[s];
  return {
    handType: ht.type, handElement: ht.element,
    dominance: seed % 2 === 0 ? "Right (Active)" : "Left (Receptive)",
    score: 7.8 + (seed % 3) * 0.4,
    confidence: 91 + (seed % 8),
    lines: {
      heart: {
        length: seed%2===0?"Long & curved":"Medium & straight",
        depth: "Deep", clarity: "Clear",
        interpretation: "Your heart line reveals a deeply emotional and loyal nature. You form lasting bonds and invest yourself fully in relationships. Emotional intelligence is one of your greatest gifts — you read people and situations with remarkable accuracy.",
        strengths: ["Deep emotional loyalty","Strong empathy","Passionate connections","Intuitive emotional awareness"],
        challenges: ["Tendency to over-give","Difficulty letting go","Emotional sensitivity"],
        recommendations: "Protect your emotional energy. Set healthy boundaries while honoring your natural depth of feeling."
      },
      head: {
        length: seed%3===0?"Long, extending across palm":"Medium with slight curve",
        depth: "Moderate", clarity: "Clear with minor breaks",
        interpretation: "Your head line indicates a sharp, creative mind that balances logic with imagination. You are a strategic thinker who considers multiple angles before deciding. Your intelligence is both analytical and intuitive.",
        strengths: ["Strategic thinking","Creative problem solving","Strong focus","Intellectual curiosity"],
        challenges: ["Overthinking at times","Difficulty with quick decisions","Analysis paralysis"],
        recommendations: "Trust your instincts alongside your analytical mind. Some of your best insights come from your gut."
      },
      life: {
        length: "Long, sweeping arc", depth: "Deep & strong", clarity: "Clear",
        interpretation: "Your life line speaks of strong vitality and adaptability. It does not predict lifespan, but rather reflects the quality, richness, and transformative depth of your life journey. Major life changes become stepping stones for you.",
        strengths: ["High physical vitality","Resilience through change","Strong personal growth","Adaptability"],
        challenges: ["Tendency to take on too much","Need for periodic recovery","Restless energy"],
        recommendations: "Honor your body's need for rest as much as your drive for activity. Balance fuels your greatest achievements."
      },
      fate: {
        length: seed%2===0?"Strong, runs from base to middle finger":"Starts mid-palm, indicating self-made path",
        depth: "Deep", clarity: seed%3===0?"Clear":"Moderate with branches",
        interpretation: "Your fate line indicates a clear sense of purpose and direction. You are not one to drift — there is an inner compass guiding you. Whether shaped by destiny or personal will, your professional path carries meaning and momentum.",
        strengths: ["Clear life direction","Career focus","Natural leadership","Purpose-driven work"],
        challenges: ["Rigidity in plans","Difficulty pivoting","External pressure sensitivity"],
        recommendations: "Your greatest career breakthroughs come when you align passion with discipline. Trust the path even when it curves."
      },
    },
    mounts: [
      { name: "Mount of Jupiter", planet: "Jupiter", strength: 78 + seed%15, meaning: "Strong ambition, natural leadership and wisdom. You are drawn to positions of influence and guide others with authority." },
      { name: "Mount of Saturn",  planet: "Saturn",  strength: 65 + seed%20, meaning: "Responsibility and perseverance define your career approach. You build slowly and surely toward lasting success." },
      { name: "Mount of Sun",     planet: "Sun",     strength: 82 + seed%12, meaning: "Creative flair and a magnetic personality draw recognition and fame. You shine naturally in public-facing roles." },
      { name: "Mount of Mercury", planet: "Mercury", strength: 70 + seed%18, meaning: "Sharp business acumen and eloquent communication. You excel in negotiation, sales, and intellectual pursuits." },
      { name: "Mount of Venus",   planet: "Venus",   strength: 75 + seed%16, meaning: "A rich capacity for love, beauty, and sensory pleasure. Relationships and aesthetics play a central role in your happiness." },
      { name: "Mount of Moon",    planet: "Moon",    strength: 68 + seed%22, meaning: "Deep intuition and a vivid imagination. You are emotionally receptive and often experience prophetic insights." },
    ],
    personality: [
      { name:"Leadership",            score: 78+seed%18, icon:"👑" },
      { name:"Communication",         score: 82+seed%12, icon:"💬" },
      { name:"Creativity",            score: 75+seed%20, icon:"🎨" },
      { name:"Discipline",            score: 70+seed%22, icon:"⚡" },
      { name:"Emotional Intelligence",score: 85+seed%10, icon:"❤️" },
      { name:"Adaptability",          score: 80+seed%15, icon:"🌊" },
      { name:"Confidence",            score: 72+seed%20, icon:"✨" },
      { name:"Decision Making",       score: 76+seed%18, icon:"🎯" },
    ],
    love: ["You love deeply and with full commitment","Loyalty is your highest relationship value","You are drawn to partners who match your emotional depth","You give generously in relationships and expect sincerity in return"],
    loveStrengths: ["Intense emotional loyalty","Empathetic listening","Romantic depth","Long-term commitment"],
    loveChallenges: ["Vulnerability to heartbreak","High expectations","Difficulty with casual connections"],
    career: ["Natural born communicator and strategist","Excel in roles requiring both creativity and analysis","Leadership emerges through trust and example","Work best when values align with profession"],
    careerTypes: ["Creative Direction","Consulting & Strategy","Education & Mentorship","Entrepreneurship","Healing & Wellness","Arts & Communications"],
    timeline: [
      { phase:"Early Life",    years:"0–20",  theme:"Learning & Foundation",    insight:"A period of deep observation, learning, and building the emotional and intellectual foundations that define your unique perspective." },
      { phase:"Young Adult",   years:"20–35", theme:"Growth & Ambition",        insight:"A dynamic phase of exploration, bold choices, and discovering your authentic path. Career and relationships take shape through meaningful experiences." },
      { phase:"Mid-Life",      years:"35–50", theme:"Expansion & Achievement",  insight:"The period of greatest professional and personal impact. Your accumulated wisdom begins to create visible, lasting results." },
      { phase:"Later Years",   years:"50+",   theme:"Wisdom & Contribution",    insight:"A season of deepened purpose, meaningful connections, and sharing your unique gifts with the world from a place of earned authority." },
    ],
    hiddenStrengths: [
      "Natural ability to read people and situations before others notice",
      "Reservoir of resilience that activates under pressure",
      "Creative problem-solving that appears effortless to others",
      "Magnetic presence that makes others feel seen and heard",
      "Strategic patience — you know when to act and when to wait",
    ],
    recommendations: [
      { category:"Career Development",    icon:"💼", tip:"Seek roles that blend creativity with strategy. Your best work happens at the intersection of ideas and execution." },
      { category:"Relationship Growth",   icon:"❤️", tip:"Communicate your needs clearly. Your depth is a gift — let the right people truly know you." },
      { category:"Personal Growth",       icon:"🌱", tip:"Dedicate 20 minutes daily to stillness. Your clearest insights emerge in quiet moments." },
      { category:"Communication",         icon:"💬", tip:"Your natural eloquence is powerful. Practice active listening to match your expressive gifts." },
      { category:"Financial Habits",      icon:"💰", tip:"Build a long-term wealth strategy. Your steady discipline, when applied to finances, creates remarkable security." },
      { category:"Wellness & Vitality",   icon:"🌿", tip:"Honor your body's energy cycles. Movement, nature, and rest are not luxuries — they are your fuel." },
    ],
    summary: `Your palm reveals a ${ht.type} — ${ht.traits}. The lines of your hand tell the story of someone with extraordinary emotional intelligence, a sharp and creative mind, and a life path marked by purposeful growth. Your heart speaks deeply, your mind moves strategically, and your fate line confirms that the path ahead is lit by genuine purpose.`,
  };
}

const SCAN_STEPS = [
  "Analyzing palm structure...",
  "Identifying major lines...",
  "Examining emotional indicators...",
  "Calculating career patterns...",
  "Mapping relationship traits...",
  "Reading mount elevations...",
  "Generating palmistry report...",
  "Preparing expert insights...",
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function ScoreBar({ value, color = "#C9A84C" }: { value: number; color?: string }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, height: 8, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.min(value,100)}%`, background: `linear-gradient(90deg, ${color}, #FFD700)`, borderRadius: 6, boxShadow: `0 0 8px ${color}60`, transition: "width 1.2s ease" }} />
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <h2 style={{ color: "#C9A84C", fontSize: 15, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 }}>{title}</h2>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PalmReading() {
  const [stage, setStage]           = useState<Stage>("landing");
  const [scanStep, setScanStep]     = useState(0);
  const [scanPct, setScanPct]       = useState(0);
  const [imageUrl, setImageUrl]     = useState<string | null>(null);
  const [result, setResult]         = useState<PalmResult | null>(null);
  const [activeLineTab, setActiveLineTab] = useState<"heart"|"head"|"life"|"fate">("heart");
  const fileRef = useRef<HTMLInputElement>(null);

  // Back button returns to landing from any non-landing stage
  const resetToLanding = useCallback(() => {
    setStage("landing");
    setResult(null);
    setImageUrl(null);
    setScanStep(0);
    setScanPct(0);
  }, []);
  useBackOverride(stage !== "landing" ? resetToLanding : null, [stage]);

  const startScan = useCallback((url: string) => {
    setImageUrl(url);
    setStage("scanning");
    setScanStep(0); setScanPct(0);

    let step = 0; let pct = 0;
    const interval = setInterval(() => {
      pct += 1.4;
      setScanPct(Math.min(Math.round(pct), 100));
      if (pct >= (step + 1) * (100 / SCAN_STEPS.length)) {
        step++;
        setScanStep(Math.min(step, SCAN_STEPS.length - 1));
      }
      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setResult(generatePalmResult(Date.now() % 1000));
          setStage("results");
        }, 600);
      }
    }, 60);
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => startScan(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const sec: React.CSSProperties = { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(201,168,76,0.18)", borderRadius: 24, padding: "36px 40px", marginBottom: 28 };
  const card: React.CSSProperties = { background: "rgba(255,255,255,0.035)", border: "1px solid rgba(201,168,76,0.14)", borderRadius: 16, padding: "24px" };
  const goldBtn: React.CSSProperties = { background: "linear-gradient(135deg,#C9A84C,#FFD700,#a07830)", color: "#000", fontWeight: 800, fontSize: 16, letterSpacing: "0.1em", padding: "16px 36px", borderRadius: 32, border: "none", cursor: "pointer", boxShadow: "0 0 24px rgba(201,168,76,0.4)" };

  // ── LANDING ────────────────────────────────────────────────────────────────
  if (stage === "landing") return (
    <div>
      <style>{`
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes pulse-glow{0%,100%{box-shadow:0 0 20px rgba(201,168,76,0.3)}50%{box-shadow:0 0 50px rgba(201,168,76,0.7)}}
        @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes fade-in{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .pr-card:hover{transform:translateY(-6px);border-color:rgba(201,168,76,0.5)!important;transition:all 0.3s ease}
        .pr-card{transition:all 0.3s ease}
      `}</style>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 32px 80px", color: "#e8e0f0" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 72, animation: "fade-in 0.7s ease" }}>
          <div style={{ fontSize: 14, color: "rgba(201,168,76,0.6)", letterSpacing: "0.3em", marginBottom: 16, fontWeight: 600 }}>✦ PREMIUM AI CONSULTATION ✦</div>
          <h1 style={{ fontSize: 58, fontWeight: 900, color: "#fff", letterSpacing: "0.06em", margin: "0 0 20px", lineHeight: 1.1 }}>
            AI Palm Reading<br/>
            <span style={{ background: "linear-gradient(135deg,#C9A84C,#FFD700,#C9A84C)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 3s linear infinite" }}>Analysis</span>
          </h1>
          <p style={{ fontSize: 20, color: "rgba(232,224,240,0.65)", maxWidth: 620, margin: "0 auto 40px", lineHeight: 1.8 }}>
            Discover your personality, relationships, career path, wealth potential, and life journey through advanced AI-powered palm analysis rooted in ancient Vedic palmistry.
          </p>
          {/* Detailed Palm SVG illustration */}
          <div style={{ animation: "float 5s ease-in-out infinite", marginBottom: 48, display: "inline-block" }}>
            <svg width={220} height={280} viewBox="0 0 220 280" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx={110} cy={200} rx={75} ry={65} fill="rgba(201,168,76,0.06)"/>
              <path d="M45 145 C38 145 32 155 32 175 C32 210 50 245 75 255 C90 260 130 260 145 255 C170 245 188 210 188 175 C188 155 182 145 175 145 Z"
                fill="rgba(201,168,76,0.07)" stroke="#C9A84C" strokeWidth={1.5} strokeLinejoin="round"/>
              <path d="M45 175 C40 165 35 148 38 132 C40 120 48 112 56 115 C64 118 66 130 65 148 C64 162 58 170 52 175 Z"
                fill="rgba(201,168,76,0.06)" stroke="#C9A84C" strokeWidth={1.3}/>
              <path d="M72 148 C70 130 69 110 71 90 C72 76 78 68 85 68 C92 68 97 76 98 90 C100 110 99 130 97 148 Z"
                fill="rgba(201,168,76,0.06)" stroke="#C9A84C" strokeWidth={1.3}/>
              <path d="M100 146 C99 126 98 104 100 82 C102 66 108 56 115 56 C122 56 128 66 130 82 C132 104 131 126 130 146 Z"
                fill="rgba(201,168,76,0.06)" stroke="#C9A84C" strokeWidth={1.3}/>
              <path d="M133 148 C132 130 131 110 133 90 C135 76 141 68 148 68 C155 68 160 76 161 90 C163 110 162 130 160 150 Z"
                fill="rgba(201,168,76,0.06)" stroke="#C9A84C" strokeWidth={1.3}/>
              <path d="M163 158 C162 142 162 124 163 108 C165 96 170 90 176 90 C182 90 186 96 187 108 C188 124 187 142 185 160 Z"
                fill="rgba(201,168,76,0.06)" stroke="#C9A84C" strokeWidth={1.3}/>
              <path d="M72 118 Q84 116 97 118" stroke="#C9A84C" strokeWidth={0.6} opacity={0.4} fill="none"/>
              <path d="M100 115 Q114 113 129 115" stroke="#C9A84C" strokeWidth={0.6} opacity={0.4} fill="none"/>
              <path d="M133 118 Q146 116 160 118" stroke="#C9A84C" strokeWidth={0.6} opacity={0.4} fill="none"/>
              <path d="M50 168 C65 155 85 150 110 152 C135 154 155 160 175 165"
                stroke="#e87070" strokeWidth={2.5} strokeLinecap="round" fill="none"/>
              <path d="M52 185 C70 182 90 180 115 181 C138 182 158 185 175 190"
                stroke="#7090e8" strokeWidth={2.2} strokeLinecap="round" fill="none"/>
              <path d="M72 152 C68 165 62 185 58 205 C54 225 52 240 55 252"
                stroke="#70e890" strokeWidth={2.2} strokeLinecap="round" fill="none"/>
              <path d="M108 252 C110 230 112 210 113 190 C114 172 115 162 116 152"
                stroke="#b070e8" strokeWidth={2.2} strokeLinecap="round" fill="none"/>
              <text x={178} y={163} fontSize={8} fill="#e87070" opacity={0.9} fontFamily="monospace">Heart</text>
              <text x={178} y={192} fontSize={8} fill="#7090e8" opacity={0.9} fontFamily="monospace">Head</text>
              <text x={36} y={255} fontSize={8} fill="#70e890" opacity={0.9} fontFamily="monospace">Life</text>
              <text x={118} y={258} fontSize={8} fill="#b070e8" opacity={0.9} fontFamily="monospace">Fate</text>
            </svg>
          </div>
        </div>

        {/* Upload cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginBottom: 60 }}>
          {/* Upload */}
          <div className="pr-card" style={{ ...sec, textAlign: "center", cursor: "pointer", marginBottom: 0 }} onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
            <div style={{ fontSize: 56, marginBottom: 20 }}>🖼️</div>
            <h3 style={{ color: "#C9A84C", fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Upload Palm Photo</h3>
            <p style={{ color: "rgba(232,224,240,0.6)", fontSize: 16, lineHeight: 1.7, marginBottom: 28 }}>Upload an existing photo of your palm from your device for instant analysis.</p>
            <button style={goldBtn}>📤 Upload Photo</button>
          </div>
          {/* Live scan (demo) */}
          <div className="pr-card" style={{ ...sec, textAlign: "center", marginBottom: 0, opacity: 0.7 }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>📷</div>
            <h3 style={{ color: "#C9A84C", fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Live Palm Scan</h3>
            <p style={{ color: "rgba(232,224,240,0.6)", fontSize: 16, lineHeight: 1.7, marginBottom: 28 }}>Use your camera for a real-time palm scan with live line detection overlay.</p>
            <button style={{ ...goldBtn, background: "rgba(201,168,76,0.15)", color: "rgba(201,168,76,0.6)", cursor: "not-allowed", boxShadow: "none" }}>📱 Coming Soon</button>
          </div>
        </div>

        {/* Guidelines */}
        <div style={sec}>
          <SectionTitle icon="📋" title="Photo Guidelines for Best Results"/>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div style={card}>
              <div style={{ color: "#4ade80", fontWeight: 700, fontSize: 14, letterSpacing: "0.15em", marginBottom: 16 }}>✅ IDEAL PHOTO</div>
              {["Full palm clearly visible","Bright, even natural lighting","Fingers slightly spread apart","Palm centered in frame","Sharp, high-resolution image"].map(g=>(
                <div key={g} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                  <span style={{ color: "#4ade80", fontSize: 16 }}>✓</span>
                  <span style={{ fontSize: 15, color: "rgba(232,224,240,0.8)" }}>{g}</span>
                </div>
              ))}
            </div>
            <div style={card}>
              <div style={{ color: "#f87171", fontWeight: 700, fontSize: 14, letterSpacing: "0.15em", marginBottom: 16 }}>❌ AVOID</div>
              {["Blurry or out-of-focus image","Dark or shadowed lighting","Fingers closed or curled","Palm partially cropped","Low resolution photos"].map(b=>(
                <div key={b} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                  <span style={{ color: "#f87171", fontSize: 16 }}>✗</span>
                  <span style={{ fontSize: 15, color: "rgba(232,224,240,0.8)" }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Line legend */}
        <div style={sec}>
          <SectionTitle icon="🖐️" title="What We Analyse"/>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
            {[
              { line: "Heart Line", color: "#e87070", desc: "Emotions, love & relationships" },
              { line: "Head Line",  color: "#7090e8", desc: "Intelligence & thinking patterns" },
              { line: "Life Line",  color: "#70e890", desc: "Vitality & personal growth" },
              { line: "Fate Line",  color: "#b070e8", desc: "Career, destiny & purpose" },
            ].map(l=>(
              <div key={l.line} style={{ ...card, textAlign: "center" }}>
                <div style={{ width: 40, height: 4, background: l.color, borderRadius: 2, margin: "0 auto 12px", boxShadow: `0 0 10px ${l.color}` }}/>
                <div style={{ color: l.color, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{l.line}</div>
                <div style={{ color: "rgba(232,224,240,0.55)", fontSize: 13, lineHeight: 1.5 }}>{l.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
            {[
              { item: "Palm Shape", icon: "🤚" },{ item: "7 Mounts", icon: "⛰️" },
              { item: "Hand Dominance", icon: "✋" },{ item: "Finger Structure", icon: "☝️" },
            ].map(i=>(
              <div key={i.item} style={{ ...card, textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{i.icon}</div>
                <div style={{ color: "#C9A84C", fontWeight: 600, fontSize: 14 }}>{i.item}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );

  // ── SCANNING ───────────────────────────────────────────────────────────────
  if (stage === "scanning") return (
    <div>
      <style>{`
        @keyframes scan-beam{0%{top:0%}100%{top:100%}}
        @keyframes pulse{0%,100%{opacity:0.6}50%{opacity:1}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>
      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", color: "#e8e0f0" }}>
        <div style={{ fontSize: 14, color: "rgba(201,168,76,0.6)", letterSpacing: "0.3em", marginBottom: 32, fontWeight: 600 }}>✦ AI ANALYSIS IN PROGRESS ✦</div>

        {/* Palm image with scan beam */}
        <div style={{ position: "relative", width: 280, height: 320, marginBottom: 48, borderRadius: 20, overflow: "hidden", border: "2px solid rgba(201,168,76,0.4)", boxShadow: "0 0 40px rgba(201,168,76,0.25)" }}>
          {imageUrl && <img src={imageUrl} alt="palm" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>}
          {/* Scan beam */}
          <div style={{ position: "absolute", left: 0, right: 0, height: 3, background: "linear-gradient(90deg,transparent,#00BFFF,transparent)", boxShadow: "0 0 20px #00BFFF, 0 0 40px #00BFFF80", animation: "scan-beam 1.8s linear infinite", top: 0 }}/>
          {/* Overlay lines being "detected" */}
          {scanPct > 30 && <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 280 320">
            {scanPct > 30 && <path d="M60 130 Q140 115 220 135" stroke="#e87070" strokeWidth={2.5} strokeLinecap="round" opacity={Math.min((scanPct-30)/30,1)} fill="none"/>}
            {scanPct > 45 && <path d="M55 155 Q135 145 215 160" stroke="#7090e8" strokeWidth={2} strokeLinecap="round" opacity={Math.min((scanPct-45)/30,1)} fill="none"/>}
            {scanPct > 60 && <path d="M75 290 Q90 230 105 160" stroke="#70e890" strokeWidth={2} strokeLinecap="round" opacity={Math.min((scanPct-60)/30,1)} fill="none"/>}
            {scanPct > 75 && <path d="M145 295 Q148 240 152 180" stroke="#b070e8" strokeWidth={2} strokeLinecap="round" opacity={Math.min((scanPct-75)/20,1)} fill="none"/>}
          </svg>}
          {/* Corner guides */}
          {["top:8px;left:8px","top:8px;right:8px","bottom:8px;left:8px","bottom:8px;right:8px"].map((pos,i)=>(
            <div key={i} style={{ position:"absolute", width:20, height:20, borderTop: i<2?"2px solid #C9A84C":"none", borderBottom: i>=2?"2px solid #C9A84C":"none", borderLeft: i%2===0?"2px solid #C9A84C":"none", borderRight: i%2===1?"2px solid #C9A84C":"none", ...Object.fromEntries(pos.split(";").map(p=>{ const [k,v]=p.split(":"); return [k.trim(),v.trim()]; })) }}/>
          ))}
        </div>

        {/* Progress */}
        <div style={{ width: "100%", maxWidth: 420, marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ color: "#C9A84C", fontSize: 14, fontWeight: 700 }}>Analysis Progress</span>
            <span style={{ color: "#C9A84C", fontSize: 14, fontWeight: 800 }}>{scanPct}%</span>
          </div>
          <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 6, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${scanPct}%`, background: "linear-gradient(90deg,#C9A84C,#FFD700)", borderRadius: 6, boxShadow: "0 0 12px #C9A84C", transition: "width 0.1s linear" }}/>
          </div>
        </div>

        {/* Current step */}
        <div style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 16, padding: "18px 32px", marginBottom: 32, textAlign: "center" }}>
          <div style={{ color: "#C9A84C", fontSize: 18, fontWeight: 700, animation: "pulse 1.5s ease-in-out infinite" }}>
            🔮 {SCAN_STEPS[scanStep]}
          </div>
        </div>

        {/* Step list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 320 }}>
          {SCAN_STEPS.map((s,i)=>(
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: i<scanStep?"#C9A84C":i===scanStep?"rgba(201,168,76,0.4)":"rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, flexShrink: 0, animation: i===scanStep?"pulse 1s ease-in-out infinite":"none" }}>
                {i < scanStep ? "✓" : i===scanStep ? "●" : ""}
              </div>
              <span style={{ fontSize: 13, color: i<scanStep?"rgba(201,168,76,0.9)":i===scanStep?"rgba(232,224,240,0.9)":"rgba(255,255,255,0.3)" }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── RESULTS ────────────────────────────────────────────────────────────────
  if (!result) return null;
  const lineColors: Record<string,string> = { heart:"#e87070", head:"#7090e8", life:"#70e890", fate:"#b070e8" };

  return (
    <div>
      <style>{`
        @keyframes fade-in{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        .tab-btn:hover{border-color:rgba(201,168,76,0.5)!important}
      `}</style>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 32px 80px", color: "#e8e0f0" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48, animation: "fade-in 0.6s ease" }}>
          <div style={{ fontSize: 13, color: "rgba(201,168,76,0.6)", letterSpacing: "0.3em", marginBottom: 12, fontWeight: 600 }}>✦ YOUR PALM READING CONSULTATION ✦</div>
          <h1 style={{ fontSize: 44, fontWeight: 900, color: "#fff", margin: "0 0 12px" }}>Your Cosmic Palm Report</h1>
          <p style={{ color: "rgba(232,224,240,0.5)", fontSize: 16 }}>Prepared exclusively based on your palm analysis</p>
        </div>

        {/* Palm Overview */}
        <div style={sec}>
          <SectionTitle icon="🤚" title="Palm Overview"/>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
            {/* Score card */}
            <div style={{ ...card, textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "rgba(201,168,76,0.6)", letterSpacing: "0.2em", marginBottom: 16 }}>PALM STRENGTH SCORE</div>
              <div style={{ fontSize: 56, fontWeight: 900, background: "linear-gradient(135deg,#C9A84C,#FFD700)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 3s linear infinite" }}>
                {result.score.toFixed(1)}<span style={{ fontSize: 24 }}>/10</span>
              </div>
              <div style={{ marginTop: 16 }}>
                <ScoreBar value={result.score * 10} color="#C9A84C"/>
              </div>
            </div>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { label: "Confidence Level", value: `${result.confidence}%`, color: "#4ade80" },
                { label: "Hand Type",        value: result.handType,         color: "#C9A84C" },
                { label: "Element",          value: result.handElement,      color: "#60a5fa" },
                { label: "Dominance",        value: result.dominance,        color: "#e879a0" },
              ].map(s=>(
                <div key={s.label} style={{ ...card, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "rgba(201,168,76,0.55)", letterSpacing: "0.15em", marginBottom: 8, textTransform: "uppercase" }}>{s.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Annotated palm */}
          {imageUrl && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", marginBottom: 12 }}>ORIGINAL</div>
                <img src={imageUrl} alt="palm" style={{ width: "100%", borderRadius: 14, border: "1px solid rgba(201,168,76,0.2)" }}/>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", marginBottom: 12 }}>ANNOTATED ANALYSIS</div>
                <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(201,168,76,0.3)" }}>
                  <img src={imageUrl} alt="palm annotated" style={{ width: "100%", display: "block" }}/>
                  {/* Anatomically correct palm lines overlay */}
                  <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 100 115" preserveAspectRatio="none">
                    {/* Heart Line — curved arc below fingers */}
                    <path d="M18 35 C28 29 42 27 58 28 C72 29 83 33 90 38"
                      stroke="#e87070" strokeWidth={1.4} fill="none" strokeLinecap="round"
                      style={{filter:"drop-shadow(0 0 3px #e87070)"}}/>
                    {/* Head Line — slightly diagonal mid palm */}
                    <path d="M17 47 C30 44 48 43 64 44 C76 45 85 48 90 52"
                      stroke="#7090e8" strokeWidth={1.3} fill="none" strokeLinecap="round"
                      style={{filter:"drop-shadow(0 0 3px #7090e8)"}}/>
                    {/* Life Line — curves from index-thumb web, arcs down to wrist */}
                    <path d="M30 32 C27 40 23 52 20 65 C17 78 16 90 18 103"
                      stroke="#70e890" strokeWidth={1.3} fill="none" strokeLinecap="round"
                      style={{filter:"drop-shadow(0 0 3px #70e890)"}}/>
                    {/* Fate Line — rises from wrist center to middle finger base */}
                    <path d="M50 108 C51 92 52 76 53 62 C54 50 55 40 56 32"
                      stroke="#b070e8" strokeWidth={1.3} fill="none" strokeLinecap="round"
                      style={{filter:"drop-shadow(0 0 3px #b070e8)"}}/>
                    {/* Endpoint glow dots */}
                    <circle cx={18} cy={35} r={1.8} fill="#e87070" opacity={0.9}/>
                    <circle cx={90} cy={38} r={1.8} fill="#e87070" opacity={0.9}/>
                    <circle cx={17} cy={47} r={1.8} fill="#7090e8" opacity={0.9}/>
                    <circle cx={90} cy={52} r={1.8} fill="#7090e8" opacity={0.9}/>
                    <circle cx={30} cy={32} r={1.8} fill="#70e890" opacity={0.9}/>
                    <circle cx={18} cy={103} r={1.8} fill="#70e890" opacity={0.9}/>
                    <circle cx={50} cy={108} r={1.8} fill="#b070e8" opacity={0.9}/>
                    <circle cx={56} cy={32} r={1.8} fill="#b070e8" opacity={0.9}/>
                  </svg>
                  {/* Interactive legend with info on hover */}
                  <div style={{ position: "absolute", bottom: 8, left: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                    {([
                      ["Heart","#e87070","Emotions & love — curved, deep"],
                      ["Head","#7090e8","Intelligence — long, diagonal"],
                      ["Life","#70e890","Vitality — sweeping arc"],
                      ["Fate","#b070e8","Career & destiny — vertical"],
                    ] as [string,string,string][]).map(([n,c,info])=>(
                      <div key={n} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.82)", borderRadius: 6, padding: "4px 8px", border: `1px solid ${c}44` }}>
                        <div style={{ width: 14, height: 3, background: c, borderRadius: 2, boxShadow: `0 0 6px ${c}`, flexShrink: 0 }}/>
                        <div>
                          <div style={{ fontSize: 10, color: c, fontWeight: 700, lineHeight: 1 }}>{n} Line</div>
                          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", lineHeight: 1.3 }}>{info}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div style={{ ...card, marginTop: 24 }}>
            <div style={{ fontSize: 13, color: "rgba(201,168,76,0.6)", letterSpacing: "0.15em", marginBottom: 12 }}>CONSULTATION SUMMARY</div>
            <p style={{ color: "rgba(232,224,240,0.8)", fontSize: 17, lineHeight: 1.85, margin: 0, fontStyle: "italic" }}>"{result.summary}"</p>
          </div>
        </div>

        {/* Major Lines Analysis */}
        <div style={sec}>
          <SectionTitle icon="✋" title="Major Lines Analysis"/>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
            {(["heart","head","life","fate"] as const).map(l=>(
              <button key={l} className="tab-btn" onClick={()=>setActiveLineTab(l)}
                style={{ padding: "10px 24px", borderRadius: 24, border: `2px solid ${activeLineTab===l?lineColors[l]:"rgba(255,255,255,0.1)"}`, background: activeLineTab===l?`${lineColors[l]}22`:"transparent", color: activeLineTab===l?lineColors[l]:"rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 14, cursor: "pointer", textTransform: "capitalize", transition: "all 0.2s" }}>
                {l} Line
              </button>
            ))}
          </div>
          {/* Active line content */}
          {(() => {
            const l = result.lines[activeLineTab];
            const col = lineColors[activeLineTab];
            return (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <div style={{ ...card, marginBottom: 16 }}>
                    <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
                      {[["Length",l.length],["Depth",l.depth],["Clarity",l.clarity]].map(([k,v])=>(
                        <div key={k} style={{ background: `${col}15`, border: `1px solid ${col}40`, borderRadius: 10, padding: "8px 16px" }}>
                          <div style={{ fontSize: 10, color: `${col}aa`, letterSpacing: "0.15em" }}>{k}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: col }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <p style={{ color: "rgba(232,224,240,0.8)", fontSize: 16, lineHeight: 1.8, margin: 0 }}>{l.interpretation}</p>
                  </div>
                  <div style={{ ...card, background: `${col}08` }}>
                    <div style={{ color: col, fontWeight: 700, fontSize: 13, letterSpacing: "0.15em", marginBottom: 12 }}>RECOMMENDATION</div>
                    <p style={{ color: "rgba(232,224,240,0.7)", fontSize: 15, lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>{l.recommendations}</p>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={card}>
                    <div style={{ color: "#4ade80", fontWeight: 700, fontSize: 13, letterSpacing: "0.15em", marginBottom: 14 }}>STRENGTHS</div>
                    {l.strengths.map(s=>(
                      <div key={s} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                        <span style={{ color: "#4ade80" }}>✦</span>
                        <span style={{ fontSize: 15, color: "rgba(232,224,240,0.8)" }}>{s}</span>
                      </div>
                    ))}
                  </div>
                  <div style={card}>
                    <div style={{ color: "#f87171", fontWeight: 700, fontSize: 13, letterSpacing: "0.15em", marginBottom: 14 }}>GROWTH AREAS</div>
                    {l.challenges.map(c=>(
                      <div key={c} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                        <span style={{ color: "#f87171" }}>◆</span>
                        <span style={{ fontSize: 15, color: "rgba(232,224,240,0.8)" }}>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Mounts */}
        <div style={sec}>
          <SectionTitle icon="⛰️" title="Planetary Mounts Analysis"/>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {result.mounts.map(m=>(
              <div key={m.name} style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ color: "#C9A84C", fontWeight: 700, fontSize: 14 }}>{m.name}</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Planet: {m.planet}</div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: m.strength>75?"#4ade80":"#C9A84C" }}>{m.strength}%</div>
                </div>
                <ScoreBar value={m.strength} color={m.strength>75?"#4ade80":"#C9A84C"}/>
                <p style={{ color: "rgba(232,224,240,0.6)", fontSize: 13, lineHeight: 1.6, margin: "12px 0 0" }}>{m.meaning}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Personality Blueprint */}
        <div style={sec}>
          <SectionTitle icon="🧠" title="Personality Blueprint"/>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
            {result.personality.map(t=>(
              <div key={t.name} style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 20 }}>{t.icon}</span>
                    <span style={{ color: "#e8e0f0", fontWeight: 700, fontSize: 15 }}>{t.name}</span>
                  </div>
                  <span style={{ color: "#C9A84C", fontWeight: 800, fontSize: 16 }}>{t.score}%</span>
                </div>
                <ScoreBar value={t.score}/>
              </div>
            ))}
          </div>
        </div>

        {/* Love & Career */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
          <div style={{ ...sec, marginBottom: 0 }}>
            <SectionTitle icon="❤️" title="Love & Relationships"/>
            {result.love.map(l=>(
              <div key={l} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <span style={{ color: "#e879a0", fontSize: 16, flexShrink: 0 }}>♥</span>
                <span style={{ fontSize: 16, color: "rgba(232,224,240,0.8)", lineHeight: 1.5 }}>{l}</span>
              </div>
            ))}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, color: "rgba(201,168,76,0.6)", letterSpacing: "0.15em", marginBottom: 12 }}>RELATIONSHIP STRENGTHS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {result.loveStrengths.map(s=>(
                  <span key={s} style={{ background: "rgba(232,121,160,0.1)", border: "1px solid rgba(232,121,160,0.3)", borderRadius: 20, padding: "4px 14px", fontSize: 13, color: "#e879a0" }}>{s}</span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ ...sec, marginBottom: 0 }}>
            <SectionTitle icon="💼" title="Career & Wealth"/>
            {result.career.map(c=>(
              <div key={c} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <span style={{ color: "#C9A84C", fontSize: 16, flexShrink: 0 }}>✦</span>
                <span style={{ fontSize: 16, color: "rgba(232,224,240,0.8)", lineHeight: 1.5 }}>{c}</span>
              </div>
            ))}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, color: "rgba(201,168,76,0.6)", letterSpacing: "0.15em", marginBottom: 12 }}>IDEAL CAREER PATHS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {result.careerTypes.map(c=>(
                  <span key={c} style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 20, padding: "4px 14px", fontSize: 13, color: "#C9A84C" }}>{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Life Timeline */}
        <div style={sec}>
          <SectionTitle icon="🌍" title="Life Journey Timeline"/>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 20, top: 0, bottom: 0, width: 2, background: "linear-gradient(180deg,#C9A84C,rgba(201,168,76,0.1))" }}/>
            {result.timeline.map((t,i)=>(
              <div key={i} style={{ display: "flex", gap: 28, marginBottom: 32, paddingLeft: 56, position: "relative" }}>
                <div style={{ position: "absolute", left: 10, top: 4, width: 22, height: 22, borderRadius: "50%", background: "#C9A84C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#000" }}>{i+1}</div>
                <div style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ color: "#C9A84C", fontWeight: 800, fontSize: 17 }}>{t.phase}</div>
                    <div style={{ color: "rgba(201,168,76,0.55)", fontSize: 13, fontWeight: 600 }}>{t.years}</div>
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, letterSpacing: "0.15em", marginBottom: 10 }}>{t.theme}</div>
                  <p style={{ color: "rgba(232,224,240,0.7)", fontSize: 15, lineHeight: 1.7, margin: 0 }}>{t.insight}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hidden Strengths */}
        <div style={sec}>
          <SectionTitle icon="💎" title="Hidden Strengths"/>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {result.hiddenStrengths.map((s,i)=>(
              <div key={i} style={{ ...card, display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#C9A84C,#a07830)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#000", flexShrink: 0 }}>{i+1}</div>
                <span style={{ fontSize: 16, color: "rgba(232,224,240,0.85)", lineHeight: 1.6 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div style={sec}>
          <SectionTitle icon="🌟" title="Personalized Recommendations"/>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {result.recommendations.map(r=>(
              <div key={r.category} style={card}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{r.icon}</div>
                <div style={{ color: "#C9A84C", fontWeight: 700, fontSize: 14, marginBottom: 10 }}>{r.category}</div>
                <p style={{ color: "rgba(232,224,240,0.7)", fontSize: 14, lineHeight: 1.65, margin: 0 }}>{r.tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ ...sec, textAlign: "center", background: "linear-gradient(135deg,rgba(201,168,76,0.08),rgba(0,0,0,0))" }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>✨</div>
          <h3 style={{ color: "#C9A84C", fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Want a Deeper Reading?</h3>
          <p style={{ color: "rgba(232,224,240,0.6)", fontSize: 16, marginBottom: 28, maxWidth: 480, margin: "0 auto 28px" }}>Combine your palm reading with your birth chart and zodiac profile for a complete cosmic consultation.</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={goldBtn} onClick={()=>setStage("landing")}>🔄 New Palm Reading</button>
            <button style={{ ...goldBtn, background: "rgba(201,168,76,0.12)", color: "#C9A84C", boxShadow: "none", border: "1px solid rgba(201,168,76,0.35)" }}>🌌 View Birth Chart</button>
          </div>
        </div>

      </div>
    </div>
  );
}