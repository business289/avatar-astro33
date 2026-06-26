import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { TarotCard, ALL_CARDS, shuffleDeck } from '../data/tarotData';
import { TarotLandingScene } from '../components/tarot/TarotLandingScene';
import { useBackOverride } from '../context/NavigationContext';

// ─── Types ────────────────────────────────────────────────────────────────────
type Phase = 'landing' | 'opening' | 'shuffling' | 'mode' | 'question' | 'spread' | 'revealing' | 'reading';
type Mode = 'timeline' | 'karma';

interface AIReading {
  currentLifeStage?: string;
  mainOpportunity?: string;
  hiddenChallenge?: string;
  nextMajorTurningPoint?: string;
  recommendedAction?: string;
  spiritualGuidance?: string;
  probabilityScore?: number;
  timelineNarrative?: { position: string; card: string; insight: string }[];
  overallMessage?: string;
  currentKarmaTheme?: string;
  rootCause?: string;
  lifeAreasAffected?: string[];
  energyScore?: number;
  karmaBlockScore?: number;
  spiritualGrowthScore?: number;
  dailyAction?: string;
  weeklyAction?: string;
  spiritualPractice?: string;
  recommendedHabit?: string;
  reflectionQuestion?: string;
  positiveAffirmation?: string;
  cardInsights?: { position: string; card: string; insight: string }[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const TIMELINE_POSITIONS = ['Past Energy', 'Current Energy', 'Hidden Influence', 'Next 6 Months', 'Future Potential'];
const KARMA_POSITIONS = ['Current Karma', 'Hidden Blockage', 'Healing Path'];

// ─── Card Theme Helper ────────────────────────────────────────────────────────
interface CardTheme { bg: string; border: string; glow: string; accent: string; dim: string; }

const SUIT_THEMES: Record<string, CardTheme> = {
  Wands:     { bg: 'linear-gradient(165deg, #1c0a00 0%, #0e0500 55%, #1a0800 100%)', border: '#FF7043', glow: 'rgba(255,112,67,0.55)', accent: '#FF8A65', dim: 'rgba(255,112,67,0.3)' },
  Cups:      { bg: 'linear-gradient(165deg, #001520 0%, #000b14 55%, #001018 100%)', border: '#29B6F6', glow: 'rgba(41,182,246,0.55)',  accent: '#4FC3F7', dim: 'rgba(41,182,246,0.3)'  },
  Swords:    { bg: 'linear-gradient(165deg, #0c0e20 0%, #060810 55%, #0a0c1e 100%)', border: '#90A4AE', glow: 'rgba(144,164,174,0.55)', accent: '#B0BEC5', dim: 'rgba(144,164,174,0.3)' },
  Pentacles: { bg: 'linear-gradient(165deg, #081008 0%, #040a05 55%, #061008 100%)', border: '#66BB6A', glow: 'rgba(102,187,106,0.55)', accent: '#81C784', dim: 'rgba(102,187,106,0.3)'  },
};

const MAJOR_THEME: CardTheme = {
  bg: 'linear-gradient(165deg, #140b1a 0%, #0a0510 55%, #120818 100%)',
  border: '#FFD700', glow: 'rgba(255,215,0,0.55)', accent: '#FFD700', dim: 'rgba(255,215,0,0.35)',
};

const getCardTheme = (card: TarotCard): CardTheme => {
  if (card.arcana === 'major') return MAJOR_THEME;
  return SUIT_THEMES[card.suit || ''] ?? SUIT_THEMES.Swords;
};

// ─── Card Back SVG ────────────────────────────────────────────────────────────
const CardBackSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 160" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
    <defs>
      <radialGradient id="cb" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#1a1040" />
        <stop offset="100%" stopColor="#07050f" />
      </radialGradient>
    </defs>
    <rect width="100" height="160" rx="7" fill="url(#cb)" />
    <rect x="2.5" y="2.5" width="95" height="155" rx="5.5" fill="none" stroke="#FFD700" strokeWidth="1.4" opacity="0.9" />
    <rect x="5.5" y="5.5" width="89" height="149" rx="4" fill="none" stroke="#FFD700" strokeWidth="0.5" opacity="0.4" />
    <circle cx="50" cy="80" r="38" fill="none" stroke="#FFD700" strokeWidth="0.4" opacity="0.4" strokeDasharray="2 5" />
    <circle cx="50" cy="80" r="28" fill="none" stroke="#FFD700" strokeWidth="0.6" opacity="0.45" />
    <circle cx="50" cy="80" r="16" fill="none" stroke="#FFD700" strokeWidth="1" opacity="0.7" />
    <path d="M50,42 L53.5,66 L72,50 L57,70 L76,80 L57,90 L72,110 L53.5,94 L50,118 L46.5,94 L28,110 L43,90 L24,80 L43,70 L28,50 L46.5,66 Z" fill="none" stroke="#FFD700" strokeWidth="0.6" opacity="0.6" />
    <ellipse cx="50" cy="80" rx="9" ry="6" fill="none" stroke="#FFD700" strokeWidth="1" opacity="0.8" />
    <circle cx="50" cy="80" r="3" fill="#FFD700" opacity="0.6" />
    <circle cx="50" cy="80" r="1.3" fill="#FFD700" opacity="0.9" />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i * 30 - 90) * (Math.PI / 180);
      return <circle key={i} cx={50 + Math.cos(a) * 38} cy={80 + Math.sin(a) * 38} r="1.2" fill="#FFD700" opacity="0.7" />;
    })}
    {([[10, 11], [90, 11], [10, 149], [90, 149]] as [number, number][]).map(([x, y], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r="5.5" fill="none" stroke="#FFD700" strokeWidth="0.7" opacity="0.55" />
        <circle cx={x} cy={y} r="2.5" fill="#FFD700" opacity="0.35" />
      </g>
    ))}
    <line x1="50" y1="16" x2="50" y2="26" stroke="#FFD700" strokeWidth="0.6" opacity="0.5" />
    <line x1="50" y1="134" x2="50" y2="144" stroke="#FFD700" strokeWidth="0.6" opacity="0.5" />
    <line x1="16" y1="80" x2="26" y2="80" stroke="#FFD700" strokeWidth="0.6" opacity="0.5" />
    <line x1="74" y1="80" x2="84" y2="80" stroke="#FFD700" strokeWidth="0.6" opacity="0.5" />
  </svg>
);

// ─── Card Face component ──────────────────────────────────────────────────────
const CardFace = ({ card, size = 'md' }: { card: TarotCard; size?: 'sm' | 'md' | 'lg' }) => {
  const theme = getCardTheme(card);
  const isMajor = card.arcana === 'major';

  const cfg = {
    sm: { symbol: 28, name: 8,  sub: 7,  kw: 6.5, pad: '5px 4px', numSize: 8  },
    md: { symbol: 40, name: 11, sub: 9,  kw: 8,   pad: '8px 6px', numSize: 10 },
    lg: { symbol: 52, name: 14, sub: 11, kw: 10,  pad: '10px 8px', numSize: 12 },
  }[size];

  const topLabel = isMajor ? card.number : (card.suit || '');

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'space-between', padding: cfg.pad,
      background: theme.bg,
      borderRadius: '7px', border: `1.5px solid ${theme.border}`,
      boxSizing: 'border-box', overflow: 'hidden',
    }}>
      {/* Sacred geometry overlay */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.12 }}>
        <circle cx="50%" cy="50%" r="38%" fill="none" stroke={theme.accent} strokeWidth="0.8" />
        <circle cx="50%" cy="50%" r="25%" fill="none" stroke={theme.accent} strokeWidth="0.6" />
        {isMajor && <>
          <line x1="50%" y1="10%" x2="50%" y2="90%" stroke={theme.accent} strokeWidth="0.4" />
          <line x1="10%" y1="50%" x2="90%" y2="50%" stroke={theme.accent} strokeWidth="0.4" />
        </>}
      </svg>

      {/* Corner glow */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 55%, ${theme.glow} 0%, transparent 65%)`, pointerEvents: 'none' }} />

      {/* Top label */}
      <div style={{ fontSize: `${cfg.numSize}px`, color: theme.accent, letterSpacing: '2px', opacity: 0.95, fontFamily: 'Iceland, sans-serif', textTransform: 'uppercase', zIndex: 1, fontWeight: 600 }}>
        {topLabel}
      </div>

      {/* Symbol */}
      <div style={{
        fontSize: `${cfg.symbol}px`, lineHeight: 1, zIndex: 1,
        filter: `drop-shadow(0 0 ${cfg.symbol / 3}px ${theme.accent})`,
        textShadow: `0 0 ${cfg.symbol / 2}px ${theme.glow}`,
      }}>
        {card.symbol}
      </div>

      {/* Name */}
      <div style={{ fontSize: `${cfg.name}px`, color: theme.accent, fontFamily: 'Iceland, sans-serif', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center', lineHeight: 1.2, zIndex: 1 }}>
        {card.name}
      </div>

      {/* Keywords */}
      {size !== 'sm' && (
        <div style={{ fontSize: `${cfg.kw}px`, color: theme.dim, textAlign: 'center', lineHeight: 1.3, zIndex: 1 }}>
          {card.keywords.slice(0, 2).join(' · ')}
        </div>
      )}

      {/* Major Arcana glow strip at top */}
      {isMajor && <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '2px', background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)`, opacity: 0.8 }} />}
    </div>
  );
};

// ─── Floating Particles ───────────────────────────────────────────────────────
const Particles = ({ count = 40 }: { count?: number }) => {
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i, left: Math.random() * 100, top: Math.random() * 100,
      size: Math.random() * 3 + 1, delay: Math.random() * 5,
      duration: 5 + Math.random() * 8, type: i % 3,
    })), [count]);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.left}%`, top: `${p.top}%`,
          width: `${p.size}px`, height: `${p.size}px`, borderRadius: '50%',
          background: p.type === 0 ? '#FFD700' : p.type === 1 ? 'rgba(255,248,220,0.9)' : 'rgba(255,215,0,0.35)',
          animation: `floatParticle ${p.duration}s ${p.delay}s ease-in-out infinite`,
          boxShadow: `0 0 ${p.size * 2}px rgba(255,215,0,0.7)`,
        }} />
      ))}
    </div>
  );
};

// ─── Score Circle ─────────────────────────────────────────────────────────────
const ScoreCircle = ({ score, label, color = '#FFD700' }: { score: number; label: string; color?: string }) => {
  const [displayed, setDisplayed] = useState(0);
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (displayed / 100) * circ;

  useEffect(() => {
    let frame: number;
    let current = 0;
    const step = () => {
      current += (score - current) * 0.06;
      if (Math.abs(current - score) < 0.5) { setDisplayed(score); return; }
      setDisplayed(Math.round(current));
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <div style={{ position: 'relative', width: 100, height: 100 }}>
        <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <span style={{ fontSize: '22px', fontWeight: 'bold', color, fontFamily: 'Iceland, sans-serif' }}>{displayed}</span>
        </div>
      </div>
      <span style={{ fontSize: '12px', color: 'rgba(255,215,0,0.7)', textTransform: 'uppercase', letterSpacing: '1.5px', textAlign: 'center', fontFamily: 'Iceland, sans-serif' }}>{label}</span>
    </div>
  );
};

// ─── Opening Scene (legacy, kept) ────────────────────────────────────────────
const OpeningScene = ({ onBegin }: { onBegin: () => void }) => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
    <Particles count={50} />
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4 }}
      style={{ textAlign: 'center', zIndex: 10, padding: '0 24px', maxWidth: '700px' }}>
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 1 }}
        style={{ fontSize: 'clamp(42px, 8vw, 80px)', fontFamily: 'Iceland, sans-serif', textTransform: 'uppercase', letterSpacing: '8px', lineHeight: 1.1, marginBottom: '16px', background: 'linear-gradient(135deg, #FFF8DC 0%, #FFD700 50%, #FFC200 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        Welcome<br />Seeker
      </motion.h1>
      <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2.4, type: 'spring' }}
        onClick={onBegin}
        style={{ padding: '18px 52px', fontSize: '16px', fontFamily: 'Iceland, sans-serif', letterSpacing: '4px', textTransform: 'uppercase', color: '#0a0c14', cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg, #FFD700 0%, #FFC200 50%, #FFD700 100%)', borderRadius: '4px', boxShadow: '0 0 30px rgba(255,215,0,0.5)' }}>
        Begin Journey
      </motion.button>
    </motion.div>
  </div>
);

// ─── Shuffle Scene (legacy, kept) ────────────────────────────────────────────
const ShuffleScene = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const cardData = useMemo(() => Array.from({ length: 20 }, (_, i) => {
    const angle = (i / 20) * Math.PI * 2;
    return { explodeX: Math.cos(angle) * 180, explodeY: Math.sin(angle) * 100, orbitX: Math.cos(angle) * 160, orbitY: Math.sin(angle) * 85, shuffleX: (Math.random() - 0.5) * 500, shuffleY: (Math.random() - 0.5) * 200, explodeRot: Math.random() * 720 - 360, orbitRot: (i / 20) * 360, shuffleRot: Math.random() * 360 - 180 };
  }), []);
  useEffect(() => {
    const ts = [setTimeout(() => setStep(1), 400), setTimeout(() => setStep(2), 2200), setTimeout(() => setStep(3), 4200), setTimeout(() => setStep(4), 5800), setTimeout(onComplete, 7200)];
    return () => ts.forEach(clearTimeout);
  }, [onComplete]);
  const getAnimate = (card: typeof cardData[0]) => {
    if (step === 0) return { x: 0, y: 0, rotate: 0, scale: 0 };
    if (step === 1) return { x: card.explodeX, y: card.explodeY, rotate: card.explodeRot, scale: 0.7 };
    if (step === 2) return { x: card.orbitX, y: card.orbitY, rotate: card.orbitRot, scale: 0.75 };
    if (step === 3) return { x: card.shuffleX, y: card.shuffleY, rotate: card.shuffleRot, scale: 0.8 };
    return { x: (Math.random() - 0.5) * 800, y: (Math.random() - 0.5) * 400, rotate: Math.random() * 360, scale: 0 };
  };
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <Particles count={30} />
      <div style={{ position: 'relative', width: 1, height: 1 }}>
        {cardData.map((card, i) => (
          <motion.div key={i} animate={getAnimate(card)} transition={{ duration: step === 3 ? 0.4 : 1.2, delay: i * 0.04 }}
            style={{ position: 'absolute', width: 60, height: 92, left: -30, top: -46, borderRadius: '5px', overflow: 'hidden' }}>
            <CardBackSVG />
          </motion.div>
        ))}
      </div>
      <button onClick={onComplete} style={{ position: 'absolute', bottom: '30px', background: 'transparent', border: '1px solid rgba(255,215,0,0.3)', color: 'rgba(255,215,0,0.5)', fontFamily: 'Iceland, sans-serif', letterSpacing: '3px', fontSize: '11px', padding: '8px 20px', cursor: 'pointer', textTransform: 'uppercase', borderRadius: '2px' }}>Skip</button>
    </div>
  );
};

// ─── Question Select Scene ────────────────────────────────────────────────────
const QuestionSelectScene = ({ onSelect }: { onSelect: (q: string) => void }) => {
  const [hov, setHov] = useState<string|null>(null);
  const canRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canRef.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize(); window.addEventListener('resize', resize);
    const stars = Array.from({length:220}, () => ({
      x:Math.random()*window.innerWidth, y:Math.random()*window.innerHeight,
      r:Math.random()*1.2+0.2, a:Math.random()*0.65+0.1, s:Math.random()*0.006+0.002, p:Math.random()*Math.PI*2
    }));
    let f=0, rid:number;
    const draw = () => {
      ctx.clearRect(0,0,c.width,c.height); f++;
      stars.forEach(s => {
        const tw = Math.sin(s.p+f*s.s)*0.3+0.7;
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,235,180,${s.a*tw})`; ctx.fill();
      });
      rid = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(rid); window.removeEventListener('resize',resize); };
  }, []);

  const meta: Record<string,{icon:string;bg:string;color:string}> = {
    'Career':      {icon:'💼',bg:'#120a00',color:'#FFD700'},
    'Love':        {icon:'❤️',bg:'#1a0015',color:'#FF6B9D'},
    'Marriage':    {icon:'💍',bg:'#150a00',color:'#FFB6C1'},
    'Business':    {icon:'🚀',bg:'#001520',color:'#4FC3F7'},
    'Finance':     {icon:'$', bg:'#120e00',color:'#FFAB40'},
    'Health':      {icon:'🌸',bg:'#001208',color:'#80DEEA'},
    'Life Purpose':{icon:'✦', bg:'#0d0020',color:'#CE93D8'},
  };

  const scenes: Record<string, React.ReactNode> = {
    'Career': (
      <svg viewBox="0 0 210 155" style={{width:'100%',height:'100%',display:'block'}}>
        <defs>
          <linearGradient id="qsCrBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#030818"/><stop offset="70%" stopColor="#0c1840"/><stop offset="100%" stopColor="#1a2860"/></linearGradient>
          <radialGradient id="qsCrGl" cx="50%" cy="68%" r="40%"><stop offset="0%" stopColor="#FFD700" stopOpacity="0.75"/><stop offset="100%" stopColor="#FF8C00" stopOpacity="0"/></radialGradient>
        </defs>
        <rect width="210" height="155" fill="url(#qsCrBg)"/>
        <ellipse cx="105" cy="105" rx="90" ry="38" fill="url(#qsCrGl)"/>
        {[[8,95,14,25],[24,87,11,33],[37,76,16,44],[55,67,18,53],[75,57,20,63],[97,50,22,70],[121,60,18,60],[141,70,15,50],[158,78,16,42],[176,86,13,34],[191,91,11,29]].map(([x,y,w,h],i)=>(
          <rect key={i} x={x} y={y} width={w} height={h} fill={i>=4&&i<=6?'#060b20':'#08102e'}/>
        ))}
        {[[79,60],[84,68],[98,53],[103,61],[110,54],[101,70]].map(([x,y],i)=>(
          <rect key={i} x={x} y={y} width="2.5" height="3.5" fill="rgba(255,215,0,0.75)"/>
        ))}
        <polygon points="96,155 114,155 112,128 98,128" fill="rgba(255,180,0,0.2)"/>
        <polygon points="99,128 111,128 109,108 101,108" fill="rgba(255,180,0,0.28)"/>
        <polygon points="101,108 109,108 108,93 102,93" fill="rgba(255,180,0,0.35)"/>
        <circle cx="105" cy="84" r="3.5" fill="#111"/>
        <rect x="102.5" y="87.5" width="5" height="9" fill="#111" rx="1"/>
        <line x1="105" y1="92" x2="101" y2="99" stroke="#111" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="105" y1="92" x2="109" y2="99" stroke="#111" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="103" y1="88" x2="99" y2="94" stroke="#111" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="107" y1="88" x2="111" y2="94" stroke="#111" strokeWidth="1.8" strokeLinecap="round"/>
        {[[22,18],[55,10],[145,14],[175,20],[30,38],[160,34]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="0.8" fill="white" opacity="0.55"/>
        ))}
      </svg>
    ),
    'Love': (
      <svg viewBox="0 0 210 155" style={{width:'100%',height:'100%',display:'block'}}>
        <defs>
          <radialGradient id="qsLvBg" cx="50%" cy="35%" r="65%"><stop offset="0%" stopColor="#3d0a50"/><stop offset="100%" stopColor="#090318"/></radialGradient>
          <radialGradient id="qsLvMn" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#FF69B4" stopOpacity="0.75"/><stop offset="55%" stopColor="#9B59B6" stopOpacity="0.4"/><stop offset="100%" stopColor="#3d0a50" stopOpacity="0"/></radialGradient>
        </defs>
        <rect width="210" height="155" fill="url(#qsLvBg)"/>
        <circle cx="105" cy="62" r="48" fill="url(#qsLvMn)"/>
        <circle cx="105" cy="62" r="34" fill="#B060D8" opacity="0.45"/>
        <circle cx="105" cy="62" r="22" fill="#D080FF" opacity="0.45"/>
        <circle cx="118" cy="56" r="30" fill="#09031a" opacity="0.72"/>
        <rect x="0" y="126" width="210" height="29" fill="#060212"/>
        <ellipse cx="105" cy="126" rx="88" ry="7" fill="#3d0a50" opacity="0.35"/>
        <rect x="16" y="90" width="5" height="38" fill="#180a2e"/>
        {[[-9,78],[0,70],[9,78],[-5,85],[5,85]].map(([dx,dy],i)=>(<ellipse key={i} cx={18+dx} cy={dy} rx="11" ry="9" fill="#FF69B4" opacity="0.5"/>))}
        <rect x="189" y="90" width="5" height="38" fill="#180a2e"/>
        {[[9,78],[0,70],[-9,78],[5,85],[-5,85]].map(([dx,dy],i)=>(<ellipse key={i} cx={191+dx} cy={dy} rx="11" ry="9" fill="#FF69B4" opacity="0.5"/>))}
        <circle cx="91" cy="116" r="5.5" fill="#0a0420"/><ellipse cx="91" cy="128" rx="5.5" ry="8" fill="#0a0420"/>
        <circle cx="119" cy="116" r="5.5" fill="#0a0420"/><ellipse cx="119" cy="128" rx="5.5" ry="8" fill="#0a0420"/>
        {[[32,18],[60,10],[152,12],[178,20],[42,32]].map(([x,y],i)=>(<circle key={i} cx={x} cy={y} r="0.9" fill="white" opacity="0.7"/>))}
        {[[62,50],[148,46],[68,92],[140,88]].map(([x,y],i)=>(<ellipse key={i} cx={x} cy={y} rx="2" ry="1.3" fill="#FF69B4" opacity="0.5" transform={`rotate(${i*35},${x},${y})`}/>))}
      </svg>
    ),
    'Marriage': (
      <svg viewBox="0 0 210 155" style={{width:'100%',height:'100%',display:'block'}}>
        <defs>
          <radialGradient id="qsMrBg" cx="50%" cy="50%" r="60%"><stop offset="0%" stopColor="#1c1035"/><stop offset="100%" stopColor="#06040e"/></radialGradient>
          <radialGradient id="qsMrGl" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#FFD700" stopOpacity="0.5"/><stop offset="100%" stopColor="#FF8C00" stopOpacity="0"/></radialGradient>
        </defs>
        <rect width="210" height="155" fill="url(#qsMrBg)"/>
        <ellipse cx="105" cy="88" rx="65" ry="58" fill="url(#qsMrGl)"/>
        <rect x="18" y="35" width="14" height="108" fill="#100820" stroke="rgba(201,139,42,0.35)" strokeWidth="0.8"/>
        <rect x="16" y="33" width="18" height="6" fill="#1c1040" stroke="rgba(201,139,42,0.45)" strokeWidth="0.6"/>
        <rect x="16" y="137" width="18" height="6" fill="#1c1040" stroke="rgba(201,139,42,0.35)" strokeWidth="0.6"/>
        <rect x="178" y="35" width="14" height="108" fill="#100820" stroke="rgba(201,139,42,0.35)" strokeWidth="0.8"/>
        <rect x="176" y="33" width="18" height="6" fill="#1c1040" stroke="rgba(201,139,42,0.45)" strokeWidth="0.6"/>
        <rect x="176" y="137" width="18" height="6" fill="#1c1040" stroke="rgba(201,139,42,0.35)" strokeWidth="0.6"/>
        <path d="M32,38 Q105,16 178,38" stroke="rgba(201,139,42,0.45)" strokeWidth="1.8" fill="none"/>
        <circle cx="88" cy="88" r="28" fill="none" stroke="#FFD700" strokeWidth="7" opacity="0.92"/>
        <circle cx="88" cy="88" r="28" fill="none" stroke="#FFF8DC" strokeWidth="2.5" opacity="0.35"/>
        <circle cx="122" cy="88" r="23" fill="none" stroke="#C98B2A" strokeWidth="7" opacity="0.92"/>
        <circle cx="122" cy="88" r="23" fill="none" stroke="#FFD97A" strokeWidth="2.5" opacity="0.35"/>
        <ellipse cx="80" cy="79" rx="7" ry="3" fill="rgba(255,255,200,0.28)" transform="rotate(-30,80,79)"/>
        <ellipse cx="116" cy="82" rx="6" ry="2.5" fill="rgba(255,255,200,0.22)" transform="rotate(-25,116,82)"/>
        {[[55,52],[158,58],[105,42],[68,132],[142,130],[48,98],[162,104],[105,148]].map(([x,y],i)=>(<circle key={i} cx={x} cy={y} r={i%2===0?1.3:0.9} fill="rgba(255,215,0,0.55)"/>))}
      </svg>
    ),
    'Business': (
      <svg viewBox="0 0 210 155" style={{width:'100%',height:'100%',display:'block'}}>
        <defs>
          <linearGradient id="qsBsBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#01060e"/><stop offset="100%" stopColor="#040f1e"/></linearGradient>
          <radialGradient id="qsBsEx" cx="50%" cy="85%" r="40%"><stop offset="0%" stopColor="#FF6600" stopOpacity="0.85"/><stop offset="100%" stopColor="#FF2200" stopOpacity="0"/></radialGradient>
        </defs>
        <rect width="210" height="155" fill="url(#qsBsBg)"/>
        {[[22,18],[62,10],[132,8],[172,14],[42,34],[158,30],[82,22],[108,5]].map(([x,y],i)=>(<circle key={i} cx={x} cy={y} r="0.9" fill="white" opacity="0.65"/>))}
        <ellipse cx="28"  cy="146" rx="38" ry="14" fill="rgba(200,210,220,0.17)"/>
        <ellipse cx="65"  cy="140" rx="48" ry="18" fill="rgba(200,210,220,0.21)"/>
        <ellipse cx="105" cy="136" rx="55" ry="21" fill="rgba(200,210,220,0.24)"/>
        <ellipse cx="148" cy="140" rx="48" ry="18" fill="rgba(200,210,220,0.21)"/>
        <ellipse cx="182" cy="146" rx="38" ry="14" fill="rgba(200,210,220,0.17)"/>
        <ellipse cx="105" cy="138" rx="20" ry="30" fill="url(#qsBsEx)"/>
        <polygon points="93,126 105,155 117,126" fill="#FF4500" opacity="0.92"/>
        <polygon points="97,126 105,148 113,126" fill="#FF8C00" opacity="0.88"/>
        <polygon points="100,126 105,140 110,126" fill="#FFD700" opacity="0.85"/>
        <rect x="92" y="62" width="26" height="64" fill="#C0C8D8" rx="4"/>
        <polygon points="92,62 105,26 118,62" fill="#D0D8E8"/>
        <circle cx="105" cy="76" r="7.5" fill="#0a1a38" stroke="rgba(80,150,220,0.65)" strokeWidth="1.5"/>
        <circle cx="105" cy="76" r="5" fill="#06102a"/>
        <circle cx="102" cy="74" r="1.4" fill="rgba(255,255,255,0.5)"/>
        <rect x="92" y="92" width="26" height="3.5" fill="rgba(0,180,255,0.45)" rx="1"/>
        <polygon points="92,108 78,130 92,124" fill="#A0A8B8"/>
        <polygon points="118,108 132,130 118,124" fill="#A0A8B8"/>
      </svg>
    ),
    'Finance': (
      <svg viewBox="0 0 210 155" style={{width:'100%',height:'100%',display:'block'}}>
        <defs>
          <radialGradient id="qsFnBg" cx="50%" cy="80%" r="70%"><stop offset="0%" stopColor="#1c1200"/><stop offset="100%" stopColor="#060408"/></radialGradient>
          <radialGradient id="qsFnGl" cx="50%" cy="40%" r="55%"><stop offset="0%" stopColor="#FFD700" stopOpacity="0.65"/><stop offset="100%" stopColor="#CC8800" stopOpacity="0"/></radialGradient>
        </defs>
        <rect width="210" height="155" fill="url(#qsFnBg)"/>
        <rect x="0" y="128" width="210" height="27" fill="#0c0800"/>
        <ellipse cx="105" cy="78" rx="62" ry="72" fill="url(#qsFnGl)"/>
        <rect x="97" y="98" width="16" height="42" fill="#1a0e00" rx="3"/>
        {[[105,108,62,82],[105,102,145,74],[105,98,82,62],[105,97,128,58],[105,92,105,52],[62,82,46,65],[62,82,70,58],[145,74,158,56],[145,74,132,54]].map(([x1,y1,x2,y2],i)=>(
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1a0e00" strokeWidth={5-i*0.4} strokeLinecap="round"/>
        ))}
        {[[46,60,20],[70,54,18],[105,46,20],[132,50,18],[158,52,20],[62,76,16],[90,56,17],[120,54,17],[148,68,16],[78,44,14],[108,38,16],[126,44,14]].map(([x,y,r],i)=>(
          <circle key={i} cx={x} cy={y} r={r} fill={i%2===0?'#CC8800':'#FFD700'} opacity={i%2===0?0.72:0.5}/>
        ))}
        {[[72,2],[85,2],[100,3],[115,2],[128,2]].map(([x,h],i)=>(
          <g key={i}>
            <ellipse cx={x} cy={138} rx="6.5" ry="2.5" fill="#CC8800"/>
            <rect x={x-6.5} y={138-h*3} width="13" height={h*3} fill="#BB7700"/>
            <ellipse cx={x} cy={138-h*3} rx="6.5" ry="2.5" fill="#FFD700"/>
          </g>
        ))}
      </svg>
    ),
    'Health': (
      <svg viewBox="0 0 210 155" style={{width:'100%',height:'100%',display:'block'}}>
        <defs>
          <radialGradient id="qsHlBg" cx="50%" cy="80%" r="70%"><stop offset="0%" stopColor="#021a0a"/><stop offset="100%" stopColor="#020806"/></radialGradient>
          <radialGradient id="qsHlGl" cx="50%" cy="60%" r="42%"><stop offset="0%" stopColor="#00FF88" stopOpacity="0.52"/><stop offset="100%" stopColor="#00CC44" stopOpacity="0"/></radialGradient>
        </defs>
        <rect width="210" height="155" fill="url(#qsHlBg)"/>
        {[[0,1],[24,0],[48,1],[158,0],[174,1],[192,0]].map(([x,o],i)=>(
          <g key={i}>
            <rect x={x+7} y={62+o*12} width="9" height={90} fill="#010e03" rx="2"/>
            <ellipse cx={x+11} cy={58+o*12} rx="20" ry="30" fill="#011503" opacity="0.92"/>
          </g>
        ))}
        <rect x="0" y="138" width="210" height="17" fill="#010802"/>
        <circle cx="105" cy="104" r="58" fill="url(#qsHlGl)"/>
        {[48,38,28,20,14].map((r,i)=>(<circle key={i} cx="105" cy="104" r={r} fill="none" stroke={`rgba(0,255,${100+i*22},${0.14+i*0.05})`} strokeWidth="0.9"/>))}
        <circle cx="105" cy="82" r="7.5" fill="#0a1a08" stroke="rgba(0,255,100,0.3)" strokeWidth="0.5"/>
        <ellipse cx="105" cy="98" rx="9.5" ry="13" fill="#0a1a08" stroke="rgba(0,255,100,0.18)" strokeWidth="0.5"/>
        <path d="M95.5,93 Q83,104 80,112" stroke="#0a1a08" strokeWidth="5.5" strokeLinecap="round" fill="none"/>
        <path d="M114.5,93 Q127,104 130,112" stroke="#0a1a08" strokeWidth="5.5" strokeLinecap="round" fill="none"/>
        <ellipse cx="88"  cy="122" rx="11" ry="6" fill="#0a1a08"/>
        <ellipse cx="122" cy="122" rx="11" ry="6" fill="#0a1a08"/>
        {[82,90,98,106].map((y,i)=>(<circle key={i} cx="105" cy={y} r="2.2" fill={`rgba(0,255,${80+i*45},0.72)`}/>))}
      </svg>
    ),
    'Life Purpose': (
      <svg viewBox="0 0 210 155" style={{width:'100%',height:'100%',display:'block'}}>
        <defs>
          <radialGradient id="qsLpBg" cx="50%" cy="50%" r="60%"><stop offset="0%" stopColor="#1a0a38"/><stop offset="100%" stopColor="#040312"/></radialGradient>
          <radialGradient id="qsLpGl" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#9B59D0" stopOpacity="0.82"/><stop offset="55%" stopColor="#5B2D90" stopOpacity="0.38"/><stop offset="100%" stopColor="#1a0a38" stopOpacity="0"/></radialGradient>
        </defs>
        <rect width="210" height="155" fill="url(#qsLpBg)"/>
        {[[15,20],[45,10],[82,8],[132,12],[168,18],[182,30],[25,45],[195,50],[10,62]].map(([x,y],i)=>(<circle key={i} cx={x} cy={y} r="0.9" fill="white" opacity="0.65"/>))}
        <circle cx="105" cy="74" r="58" fill="url(#qsLpGl)"/>
        {[52,43,35,27,20].map((r,i)=>(<circle key={i} cx="105" cy="74" r={r} fill="none" stroke={`rgba(${185-i*8},${108+i*14},255,${0.22+i*0.08})`} strokeWidth={i===0?1.6:0.8}/>))}
        <circle cx="105" cy="74" r="14" fill="rgba(200,150,255,0.38)"/>
        <circle cx="105" cy="74" r="8"  fill="rgba(220,180,255,0.48)"/>
        <circle cx="105" cy="74" r="4"  fill="rgba(255,230,255,0.62)"/>
        <path d="M50,130 L50,74 Q50,26 105,26 Q160,26 160,74 L160,130" stroke="rgba(180,100,255,0.62)" strokeWidth="2.2" fill="none"/>
        <rect x="0" y="133" width="210" height="22" fill="#030210"/>
        <circle cx="105" cy="120" r="4.5" fill="#08051a"/>
        <rect x="102" y="124" width="6" height="10" fill="#08051a" rx="1"/>
      </svg>
    ),
  };

  const rows = [['Career','Love','Marriage','Business'],['Finance','Health','Life Purpose']];

  return (
    <div style={{
      minHeight:'100vh', position:'relative', overflow:'hidden',
      background:'linear-gradient(175deg,#030818 0%,#050522 40%,#070318 100%)',
      display:'flex', flexDirection:'column', alignItems:'center',
      paddingTop:64, paddingBottom:44,
    }}>
      <canvas ref={canRef} style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0}}/>

      <svg style={{position:'absolute',bottom:0,left:0,width:'100%',height:'32%',pointerEvents:'none',zIndex:1}} preserveAspectRatio="none">
        <defs><linearGradient id="qsMtW" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a0530" stopOpacity="0.5"/><stop offset="100%" stopColor="#030818" stopOpacity="0.95"/></linearGradient></defs>
        <path d="M0,100% L0,55% L8%,22% L18%,52% L30%,12% L42%,48% L50%,28% L58%,48% L70%,12% L82%,52% L92%,22% L100%,55% L100%,100% Z" fill="#040316" opacity="0.82"/>
        <rect x="0" y="68%" width="100%" height="32%" fill="url(#qsMtW)"/>
      </svg>

      <div style={{position:'relative',zIndex:10,width:'100%',maxWidth:1100,padding:'0 20px'}}>
        <div style={{textAlign:'center',marginBottom:38}}>
          <p style={{fontFamily:"'Montserrat',sans-serif",fontWeight:600,fontSize:11,letterSpacing:'0.26em',color:'rgba(201,139,42,0.82)',textTransform:'uppercase',marginBottom:14}}>
            ✦ Life Timeline Tarot™ ✦
          </p>
          <h1 style={{fontFamily:"'Cinzel',serif",fontWeight:700,margin:'0 0 10px',lineHeight:1.04,textAlign:'center'}}>
            <span style={{display:'block',fontSize:'clamp(36px,5.8vw,74px)',color:'#FFFFFF',letterSpacing:'0.02em'}}>What calls to</span>
            <span style={{display:'block',fontSize:'clamp(36px,5.8vw,74px)',background:'linear-gradient(180deg,#F0D080 0%,#C98B2A 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',letterSpacing:'0.02em'}}>your soul?</span>
          </h1>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:14,margin:'12px 0 4px'}}>
            <div style={{width:44,height:1,background:'linear-gradient(to right,transparent,rgba(201,139,42,0.5))'}}/>
            <p style={{fontFamily:"'Lato',sans-serif",fontSize:15,color:'rgba(220,210,238,0.68)',letterSpacing:'0.08em',margin:0}}>Choose the area of life you wish to illuminate</p>
            <div style={{width:44,height:1,background:'linear-gradient(to left,transparent,rgba(201,139,42,0.5))'}}/>
          </div>
        </div>

        {rows.map((row, ri) => (
          <div key={ri} style={{display:'flex',justifyContent:'center',gap:16,marginBottom:ri===0?18:0}}>
            {row.map(id => {
              const m = meta[id];
              const isHov = hov === id;
              return (
                <div key={id}
                  onMouseEnter={() => setHov(id)}
                  onMouseLeave={() => setHov(null)}
                  onClick={() => onSelect(id)}
                  style={{width:216,flexShrink:0,position:'relative',cursor:'pointer',
                    transition:'transform 0.3s ease',
                    transform: isHov ? 'translateY(-7px) scale(1.035)' : 'translateY(0) scale(1)'}}>
                  <div style={{
                    position:'absolute',top:-19,left:'50%',transform:'translateX(-50%)',
                    width:38,height:38,borderRadius:'50%',zIndex:4,
                    background:m.bg,
                    border:`1.5px solid ${isHov ? m.color : 'rgba(201,139,42,0.58)'}`,
                    boxShadow:isHov?`0 0 18px ${m.color}55`:'none',
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:17,transition:'border-color 0.3s,box-shadow 0.3s',
                  }}>
                    {m.icon==='$'
                      ? <span style={{fontFamily:"'Cinzel',serif",fontSize:15,color:'#FFD700',fontWeight:700}}>$</span>
                      : m.icon==='✦'
                      ? <span style={{color:'#9B59D0',fontSize:15}}>✦</span>
                      : <span>{m.icon}</span>}
                  </div>
                  <div style={{
                    borderRadius:14,overflow:'hidden',
                    border:`1.5px solid ${isHov ? m.color+'bb' : 'rgba(201,139,42,0.32)'}`,
                    boxShadow: isHov
                      ? `0 0 32px ${m.color}44,0 10px 32px rgba(0,0,0,0.65)`
                      : '0 0 14px rgba(201,139,42,0.12),0 4px 18px rgba(0,0,0,0.52)',
                    transition:'box-shadow 0.35s,border-color 0.35s',
                    paddingTop:20,
                    background:'rgba(5,3,18,0.72)',
                  }}>
                    <div style={{height:155,overflow:'hidden'}}>
                      {scenes[id]}
                    </div>
                    <div style={{padding:'12px 8px 14px',textAlign:'center',background:'rgba(4,2,14,0.88)'}}>
                      <span style={{
                        fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:600,letterSpacing:'0.08em',
                        textTransform:'uppercase',transition:'color 0.3s',
                        color: isHov ? m.color : 'rgba(255,248,235,0.82)',
                      }}>{id}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        <div style={{textAlign:'center',marginTop:38}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:14,marginBottom:12,opacity:0.62}}>
            <div style={{width:55,height:1,background:'linear-gradient(to right,transparent,rgba(201,139,42,0.55))'}}/>
            <span style={{fontFamily:"'Lato',sans-serif",fontSize:12,color:'rgba(201,139,42,0.78)',letterSpacing:'0.2em',whiteSpace:'nowrap'}}>Your answers are within...</span>
            <div style={{width:55,height:1,background:'linear-gradient(to left,transparent,rgba(201,139,42,0.55))'}}/>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Card Spread Scene ────────────────────────────────────────────────────────
const CardSpreadScene = ({ numCards, positions, onComplete }: { numCards: number; positions: string[]; onComplete: (cards: TarotCard[]) => void }) => {
  const [fanCards] = useState(() => shuffleDeck(ALL_CARDS).slice(0, 21));
  const [selected, setSelected] = useState<{ card: TarotCard; fanIdx: number }[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);

  const handleSelect = (card: TarotCard, fanIdx: number) => {
    if (selected.length >= numCards) return;
    if (selected.some(s => s.fanIdx === fanIdx)) return;
    const next = [...selected, { card, fanIdx }];
    setSelected(next);
    if (next.length === numCards) setTimeout(() => onComplete(next.map(s => s.card)), 700);
  };

  const isSel = (i: number) => selected.some(s => s.fanIdx === i);
  const selIdx = (i: number) => selected.findIndex(s => s.fanIdx === i);
  const containerW = Math.min(typeof window !== 'undefined' ? window.innerWidth - 48 : 900, 1000);
  const cardW = 80;
  const cardH = 124;

  const getFanStyle = (i: number, total: number): React.CSSProperties => {
    const center = (total - 1) / 2;
    const offset = i - center;
    const xStep = Math.min((containerW - cardW) / (total - 1), 64);
    const x = offset * xStep;
    const angle = offset * 3.2;
    const arcY = Math.abs(offset) * 1.6;
    const s = isSel(i);
    const h = hovered === i && !s;
    return {
      position: 'absolute', width: `${cardW}px`, height: `${cardH}px`,
      left: `calc(50% + ${x}px - ${cardW / 2}px)`,
      bottom: s ? '180px' : h ? '28px' : `${4 - arcY}px`,
      transform: `rotate(${s ? 0 : angle}deg) scale(${s ? 1.15 : h ? 1.1 : 1})`,
      zIndex: s ? total + 50 + selIdx(i) : hovered === i ? total + 1 : total - Math.abs(offset),
      transition: 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
      cursor: isSel(i) ? 'default' : 'pointer',
      borderRadius: '8px', overflow: 'hidden',
      boxShadow: s
        ? '0 0 35px rgba(255,215,0,0.7), 0 14px 45px rgba(0,0,0,0.7)'
        : h ? '0 0 22px rgba(255,215,0,0.5), 0 10px 28px rgba(0,0,0,0.55)'
        : '0 5px 18px rgba(0,0,0,0.55)',
    };
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '80px', position: 'relative', overflow: 'hidden' }}>
      <Particles count={20} />

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', zIndex: 10, marginBottom: '24px', padding: '0 24px' }}>
        <p style={{ letterSpacing: '5px', fontSize: '12px', color: 'rgba(255,215,0,0.65)', textTransform: 'uppercase', fontFamily: 'Iceland, sans-serif', marginBottom: '10px' }}>
          {selected.length}/{numCards} Cards Selected
        </p>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontFamily: 'Iceland, sans-serif', letterSpacing: '4px', textTransform: 'uppercase', color: '#FFD700' }}>
          Choose Your {numCards === 5 ? 'Five' : 'Three'} Sacred Cards
        </h2>
        <p style={{ color: 'rgba(255,248,220,0.55)', fontSize: '14px', marginTop: '10px', fontFamily: 'Iceland, sans-serif', letterSpacing: '1px' }}>
          Hover over each card · Trust your intuition · Let the cards call to you
        </p>
      </motion.div>

      {/* Selected card slots */}
      <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '28px', padding: '0 24px', zIndex: 10 }}>
        {positions.map((pos, i) => {
          const s = selected[i];
          const theme = s ? getCardTheme(s.card) : null;
          return (
            <motion.div key={pos} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: `${cardW}px`, height: `${cardH}px`, borderRadius: '8px', border: s ? `1.5px solid ${theme!.border}` : '1.5px dashed rgba(255,215,0,0.25)', background: s ? 'transparent' : 'rgba(255,215,0,0.04)', position: 'relative', overflow: 'hidden', boxShadow: s ? `0 0 18px ${theme!.glow}` : 'none', transition: 'all 0.4s' }}>
                {s && <CardFace card={s.card} size="md" />}
              </div>
              <span style={{ fontSize: '10px', letterSpacing: '1.5px', color: s ? 'rgba(255,215,0,0.85)' : 'rgba(255,215,0,0.3)', fontFamily: 'Iceland, sans-serif', textTransform: 'uppercase', textAlign: 'center', maxWidth: '85px' }}>{pos}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Fan spread */}
      <div style={{ position: 'relative', width: '100%', height: '220px', flex: '0 0 220px' }}>
        {fanCards.map((card, i) => (
          <div key={card.id} style={getFanStyle(i, fanCards.length)}
            onClick={() => handleSelect(card, i)}
            onMouseEnter={() => !isSel(i) && setHovered(i)}
            onMouseLeave={() => setHovered(null)}>
            {isSel(i) ? <CardFace card={card} size="md" /> : <CardBackSVG />}
            {hovered === i && !isSel(i) && (
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(255,215,0,0.18) 0%, transparent 70%)', borderRadius: '8px', pointerEvents: 'none' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Card Reveal Scene ────────────────────────────────────────────────────────
const CardRevealScene = ({ cards, positions, onComplete }: { cards: TarotCard[]; positions: string[]; onComplete: () => void }) => {
  const [revealed, setRevealed] = useState<boolean[]>(new Array(cards.length).fill(false));
  const [current, setCurrent] = useState(0);
  const [autoReveal] = useState(true);

  useEffect(() => {
    if (!autoReveal) return;
    const t = setTimeout(() => {
      if (current < cards.length) {
        setRevealed(prev => { const n = [...prev]; n[current] = true; return n; });
        setCurrent(c => c + 1);
      } else {
        setTimeout(onComplete, 1400);
      }
    }, current === 0 ? 900 : 2400);
    return () => clearTimeout(t);
  }, [current, autoReveal, cards.length, onComplete]);

  const cardW = 140, cardH = 216;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
      <Particles count={40} />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', marginBottom: '48px', zIndex: 10 }}>
        <p style={{ letterSpacing: '6px', fontSize: '12px', color: 'rgba(255,215,0,0.65)', textTransform: 'uppercase', fontFamily: 'Iceland, sans-serif', marginBottom: '12px' }}>
          The Cards Reveal Themselves
        </p>
        <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontFamily: 'Iceland, sans-serif', letterSpacing: '5px', textTransform: 'uppercase', color: '#FFD700', textShadow: '0 0 30px rgba(255,215,0,0.4)' }}>
          Your Sacred Reading
        </h2>
        <div style={{ width: '80px', height: '1px', background: 'linear-gradient(90deg,transparent,#FFD700,transparent)', margin: '16px auto 0' }} />
      </motion.div>

      <div style={{ display: 'flex', gap: 'clamp(14px, 3vw, 32px)', justifyContent: 'center', flexWrap: 'wrap', zIndex: 10 }}>
        {cards.map((card, i) => {
          const theme = getCardTheme(card);
          return (
            <motion.div key={card.id} initial={{ y: 70, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.18, duration: 0.7 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>

              <div
                style={{ width: `${cardW}px`, height: `${cardH}px`, position: 'relative', cursor: 'pointer' }}
                onClick={() => {
                  if (!revealed[i] && i === current) {
                    setRevealed(prev => { const n = [...prev]; n[i] = true; return n; });
                    setCurrent(c => c + 1);
                  }
                }}>
                <div style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', transition: 'transform 1.4s cubic-bezier(0.4, 0, 0.2, 1)', transform: revealed[i] ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                  <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: '9px', overflow: 'hidden', boxShadow: revealed[i] ? `0 0 50px ${theme.glow}, 0 24px 60px rgba(0,0,0,0.8)` : '0 10px 35px rgba(0,0,0,0.7)' }}>
                    <CardBackSVG />
                  </div>
                  <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: '9px', overflow: 'hidden', boxShadow: `0 0 50px ${theme.glow}, 0 24px 60px rgba(0,0,0,0.8)` }}>
                    <CardFace card={card} size="lg" />
                  </div>
                </div>

                {revealed[i] && (
                  <div style={{ position: 'absolute', inset: -24, borderRadius: '50%', background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`, animation: 'revealBurst 0.9s ease-out forwards', pointerEvents: 'none' }} />
                )}
              </div>

              {/* Position label */}
              <span style={{ fontSize: '11px', letterSpacing: '2.5px', color: revealed[i] ? theme.accent : 'rgba(255,215,0,0.45)', fontFamily: 'Iceland, sans-serif', textTransform: 'uppercase', textAlign: 'center', maxWidth: '150px', transition: 'color 0.6s' }}>
                {positions[i]}
              </span>

              <AnimatePresence>
                {revealed[i] && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                    style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '16px', color: theme.accent, fontFamily: 'Iceland, sans-serif', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>{card.name}</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,248,220,0.55)', fontFamily: 'Iceland, sans-serif' }}>{card.keywords[0]}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {current >= cards.length && (
          <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            onClick={onComplete}
            style={{ marginTop: '56px', padding: '18px 52px', fontFamily: 'Iceland, sans-serif', letterSpacing: '5px', fontSize: '15px', textTransform: 'uppercase', color: '#0a0c14', background: 'linear-gradient(135deg, #FFD700, #FFC200)', border: 'none', borderRadius: '4px', cursor: 'pointer', boxShadow: '0 0 35px rgba(255,215,0,0.55)', zIndex: 10 }}>
            Reveal My Reading
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Shared sub-components for result screens ────────────────────────────────

/** A card thumbnail that wraps CardFace with the required position:relative */
const CardThumb = ({ card, width, height, size }: { card: TarotCard; width: number; height: number; size: 'sm' | 'md' | 'lg' }) => {
  const theme = getCardTheme(card);
  return (
    <div style={{
      position: 'relative', width, height, flexShrink: 0,
      borderRadius: '9px', overflow: 'hidden',
      border: `1.5px solid ${theme.border}55`,
      boxShadow: `0 0 24px ${theme.glow}, 0 10px 28px rgba(0,0,0,0.6)`,
    }}>
      <CardFace card={card} size={size} />
    </div>
  );
};

/** One labelled section card in the insight grid */
const InsightCard = ({
  icon, label, value, accent = '#FFD700', delay = 0,
}: { icon: string; label: string; value?: string; accent?: string; delay?: number }) => {
  if (!value) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.55 }}
      style={{
        display: 'flex', flexDirection: 'column', gap: '12px',
        padding: '24px 22px',
        background: `linear-gradient(160deg, ${accent}12 0%, ${accent}05 100%)`,
        border: `1px solid ${accent}35`,
        borderRadius: '16px',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '20px', lineHeight: 1 }}>{icon}</span>
        <span style={{
          fontSize: '11px', letterSpacing: '2.5px', textTransform: 'uppercase',
          color: `${accent}cc`, fontFamily: 'Iceland, sans-serif', fontWeight: 600,
        }}>{label}</span>
      </div>
      <p style={{
        margin: 0, color: 'rgba(255,248,220,0.9)', fontSize: '17px',
        lineHeight: 1.78, fontFamily: 'Iceland, sans-serif',
        wordBreak: 'break-word', overflowWrap: 'break-word',
      }}>{value}</p>
    </motion.div>
  );
};

// ─── Timeline Reading Display ─────────────────────────────────────────────────
const TimelineReadingDisplay = ({
  cards, positions, question, reading, onReset,
}: { cards: TarotCard[]; positions: string[]; question: string; reading: AIReading; onReset: () => void }) => (
  <div style={{ minHeight: '100vh', padding: 'clamp(80px,10vh,120px) clamp(16px,5vw,40px) 80px', maxWidth: '1160px', margin: '0 auto', position: 'relative' }}>
    <Particles count={18} />

    {/* ── Header ─────────────────────────────────────────────────────── */}
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: 'center', marginBottom: '52px', position: 'relative', zIndex: 10 }}>
      <p style={{ letterSpacing: '6px', fontSize: '12px', color: 'rgba(255,215,0,0.65)', textTransform: 'uppercase', fontFamily: 'Iceland, sans-serif', marginBottom: '10px' }}>
        Life Timeline Tarot™ · {question}
      </p>
      <h2 style={{ fontSize: 'clamp(26px,5vw,52px)', fontFamily: 'Iceland, sans-serif', letterSpacing: '5px', textTransform: 'uppercase', color: '#FFD700', textShadow: '0 0 30px rgba(255,215,0,0.4)' }}>
        Your Soul's Timeline
      </h2>
      <div style={{ width: '100px', height: '1px', background: 'linear-gradient(90deg,transparent,#FFD700,transparent)', margin: '14px auto 0' }} />
    </motion.div>

    {/* ── 5 cards strip ─────────────────────────────────────────────── */}
    <div style={{ position: 'relative', zIndex: 10, marginBottom: '56px' }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        flexWrap: 'wrap', gap: '0', overflowX: 'auto', paddingBottom: '8px',
      }}>
        {cards.map((card, i) => {
          const theme = getCardTheme(card);
          return (
            <div key={card.id} style={{ display: 'flex', alignItems: 'center' }}>
              <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.14 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '0 8px' }}>
                <CardThumb card={card} width={110} height={170} size="md" />
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: theme.accent, boxShadow: `0 0 10px ${theme.accent}` }} />
                <p style={{ fontSize: '10px', letterSpacing: '1.5px', color: 'rgba(255,215,0,0.65)', fontFamily: 'Iceland, sans-serif', textTransform: 'uppercase', textAlign: 'center', maxWidth: '100px', margin: 0 }}>{positions[i]}</p>
                <p style={{ fontSize: '12px', color: theme.accent, fontFamily: 'Iceland, sans-serif', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center', maxWidth: '100px', margin: 0, fontWeight: 600 }}>{card.name}</p>
              </motion.div>
              {i < cards.length - 1 && (
                <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.38 + i * 0.14, duration: 0.6 }}
                  style={{ width: '28px', height: '1px', background: 'linear-gradient(90deg,rgba(255,215,0,0.5),rgba(255,215,0,0.15))', transformOrigin: 'left', flexShrink: 0, marginBottom: '80px' }} />
              )}
            </div>
          );
        })}
      </div>
    </div>

    {/* ── Overall Message ────────────────────────────────────────────── */}
    {(reading.overallMessage || reading.spiritualGuidance) && (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        style={{
          display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap',
          padding: '32px 36px', marginBottom: '40px',
          background: 'linear-gradient(135deg,rgba(255,215,0,0.1) 0%,rgba(255,180,0,0.04) 100%)',
          border: '1px solid rgba(255,215,0,0.3)', borderRadius: '20px',
          position: 'relative', zIndex: 10,
        }}>
        <div style={{ flexShrink: 0 }}>
          <ScoreCircle score={reading.probabilityScore ?? 75} label="Path Probability" />
        </div>
        <div style={{ flex: '1 1 260px', minWidth: 0 }}>
          <p style={{ fontSize: '11px', letterSpacing: '3px', color: 'rgba(255,215,0,0.65)', fontFamily: 'Iceland, sans-serif', textTransform: 'uppercase', marginBottom: '12px' }}>✨ Your Overall Reading</p>
          <p style={{ margin: 0, color: 'rgba(255,248,220,0.9)', fontSize: '19px', lineHeight: 1.85, fontFamily: 'Iceland, sans-serif', wordBreak: 'break-word' }}>
            {reading.overallMessage || reading.spiritualGuidance}
          </p>
        </div>
      </motion.div>
    )}

    {/* ── 6 insight sections ─────────────────────────────────────────── */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: '18px', marginBottom: '44px', position: 'relative', zIndex: 10 }}>
      <InsightCard icon="🌱" label="What This Means For You" value={reading.currentLifeStage}     delay={0.5}  />
      <InsightCard icon="✨" label="What's Helping You"       value={reading.mainOpportunity}       delay={0.58} accent="#80DEEA" />
      <InsightCard icon="🔮" label="What's Blocking You"      value={reading.hiddenChallenge}       delay={0.66} accent="#CE93D8" />
      <InsightCard icon="⭐" label="What's Coming Next"       value={reading.nextMajorTurningPoint} delay={0.74} accent="#FFD700" />
      <InsightCard icon="⚡" label="What To Do Right Now"     value={reading.recommendedAction}     delay={0.82} accent="#4FC3F7" />
      <InsightCard icon="🕯" label="Guidance For This Week"   value={reading.spiritualGuidance}     delay={0.9}  accent="#F48FB1" />
    </div>

    {/* ── Card-by-card narrative ─────────────────────────────────────── */}
    {reading.timelineNarrative && reading.timelineNarrative.length > 0 && (
      <div style={{ marginBottom: '48px', position: 'relative', zIndex: 10 }}>
        <h3 style={{ fontFamily: 'Iceland, sans-serif', fontSize: '20px', letterSpacing: '4px', color: '#FFD700', textTransform: 'uppercase', marginBottom: '24px', textAlign: 'center' }}>
          Your Card-by-Card Story
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reading.timelineNarrative.map((n, i) => {
            const card = cards[i];
            const theme = card ? getCardTheme(card) : MAJOR_THEME;
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 + i * 0.1 }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '18px',
                  padding: '20px 22px',
                  background: `linear-gradient(160deg,${theme.accent}0e 0%,rgba(0,0,0,0.01) 100%)`,
                  border: `1px solid ${theme.accent}28`, borderRadius: '14px',
                }}>
                {card && <CardThumb card={card} width={56} height={86} size="sm" />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 4px', fontSize: '11px', letterSpacing: '2px', color: `${theme.accent}99`, fontFamily: 'Iceland, sans-serif', textTransform: 'uppercase' }}>{n.position}</p>
                  <p style={{ margin: '0 0 10px', fontSize: '15px', color: theme.accent, fontFamily: 'Iceland, sans-serif', fontWeight: 600 }}>{n.card}</p>
                  <p style={{ margin: 0, fontSize: '16px', color: 'rgba(255,248,220,0.82)', lineHeight: 1.75, wordBreak: 'break-word' }}>{n.insight}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    )}

    <ResetButton onReset={onReset} />
  </div>
);

// ─── Karma Mirror Reading Display ─────────────────────────────────────────────
const KarmaMirrorDisplay = ({
  cards, positions, reading, onReset,
}: { cards: TarotCard[]; positions: string[]; reading: AIReading; onReset: () => void }) => {
  const karmaThemes = [
    { color: '#FF7043', glow: 'rgba(255,112,67,0.5)', arrow: '↓' },
    { color: '#CE93D8', glow: 'rgba(206,147,216,0.5)', arrow: '↓' },
    { color: '#4DB6AC', glow: 'rgba(77,182,172,0.5)', arrow: null },
  ];
  const journeyLabels = ['Current Karma', 'Hidden Blockage', 'Healing Path'];
  const journeyIcons  = ['🔥', '🌑', '🌿'];

  return (
    <div style={{ minHeight: '100vh', padding: 'clamp(80px,10vh,120px) clamp(16px,5vw,40px) 80px', maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
      <Particles count={18} />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: '52px', position: 'relative', zIndex: 10 }}>
        <p style={{ letterSpacing: '6px', fontSize: '12px', color: 'rgba(255,215,0,0.65)', textTransform: 'uppercase', fontFamily: 'Iceland, sans-serif', marginBottom: '10px' }}>
          Karma Mirror™ Reading
        </p>
        <h2 style={{ fontSize: 'clamp(26px,5vw,52px)', fontFamily: 'Iceland, sans-serif', letterSpacing: '5px', textTransform: 'uppercase', color: '#FFD700', textShadow: '0 0 30px rgba(255,215,0,0.4)', marginBottom: '12px' }}>
          The Mirror Reveals
        </h2>
        <p style={{ color: 'rgba(255,248,220,0.5)', fontFamily: 'Iceland, sans-serif', fontSize: '16px', fontStyle: 'italic' }}>
          "The cards do not judge. They reflect."
        </p>
        <div style={{ width: '100px', height: '1px', background: 'linear-gradient(90deg,transparent,#FFD700,transparent)', margin: '16px auto 0' }} />
      </motion.div>

      {/* ── Journey: 3 cards with flow arrows ─────────────────────────── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'center', flexWrap: 'wrap', gap: '0', marginBottom: '56px', position: 'relative', zIndex: 10 }}>
        {cards.map((card, i) => {
          const kt = karmaThemes[i];
          return (
            <div key={card.id} style={{ display: 'flex', alignItems: 'center' }}>
              {/* Card column */}
              <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.22 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                {/* Journey label above card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>{journeyIcons[i]}</span>
                  <span style={{ fontSize: '11px', letterSpacing: '2px', color: kt.color, fontFamily: 'Iceland, sans-serif', textTransform: 'uppercase' }}>{journeyLabels[i]}</span>
                </div>
                {/* Card — fixed container with position:relative */}
                <div style={{
                  position: 'relative', width: '130px', height: '200px',
                  borderRadius: '10px', overflow: 'hidden', flexShrink: 0,
                  border: `2px solid ${kt.color}80`,
                  boxShadow: `0 0 36px ${kt.glow}, 0 18px 45px rgba(0,0,0,0.7)`,
                }}>
                  <CardFace card={card} size="lg" />
                </div>
                <p style={{ margin: 0, fontSize: '15px', color: '#FFD700', fontFamily: 'Iceland, sans-serif', textTransform: 'uppercase', textAlign: 'center', letterSpacing: '1px', maxWidth: '130px' }}>{card.name}</p>
              </motion.div>

              {/* Arrow connector between cards */}
              {i < cards.length - 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 12px', marginBottom: '56px' }}>
                  <div style={{ width: '32px', height: '1px', background: `linear-gradient(90deg,${karmaThemes[i].color}80,${karmaThemes[i+1].color}80)` }} />
                  <span style={{ fontSize: '14px', color: 'rgba(255,215,0,0.4)', marginTop: '4px' }}>→</span>
                </div>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* ── Karma Theme + Root Cause ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '18px', marginBottom: '36px', position: 'relative', zIndex: 10 }}>
        <InsightCard icon="🔮" label="What Your Karma Is Showing You" value={reading.currentKarmaTheme} delay={0.4} accent="#CE93D8" />
        <InsightCard icon="🌱" label="Where This Pattern Comes From"  value={reading.rootCause}         delay={0.48} />
      </div>

      {/* ── Life areas affected ────────────────────────────────────────── */}
      {reading.lifeAreasAffected && reading.lifeAreasAffected.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
          style={{ padding: '22px 26px', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '16px', marginBottom: '32px', position: 'relative', zIndex: 10 }}>
          <p style={{ fontSize: '11px', letterSpacing: '2.5px', color: 'rgba(255,215,0,0.6)', fontFamily: 'Iceland, sans-serif', textTransform: 'uppercase', marginBottom: '14px' }}>
            Life Areas Being Affected
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {reading.lifeAreasAffected.map(area => (
              <span key={area} style={{ padding: '6px 16px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '24px', fontSize: '14px', color: '#FFD700', fontFamily: 'Iceland, sans-serif', letterSpacing: '1px' }}>
                {area}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Score circles ──────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.62 }}
        style={{ display: 'flex', gap: '36px', justifyContent: 'center', flexWrap: 'wrap', padding: '32px', background: 'linear-gradient(135deg,rgba(255,215,0,0.07) 0%,rgba(255,215,0,0.02) 100%)', border: '1px solid rgba(255,215,0,0.16)', borderRadius: '20px', marginBottom: '40px', position: 'relative', zIndex: 10 }}>
        <ScoreCircle score={reading.energyScore ?? 65}          label="Your Energy"       color="#FFD700" />
        <ScoreCircle score={reading.karmaBlockScore ?? 70}      label="Karma Block Level" color="#FF7043" />
        <ScoreCircle score={reading.spiritualGrowthScore ?? 58} label="Growth Potential"  color="#4DB6AC" />
      </motion.div>

      {/* ── Action Plan ────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '40px', position: 'relative', zIndex: 10 }}>
        <h3 style={{ fontFamily: 'Iceland, sans-serif', fontSize: '20px', letterSpacing: '4px', color: '#FFD700', textTransform: 'uppercase', marginBottom: '22px', textAlign: 'center' }}>
          Your Healing Action Plan
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '16px' }}>
          <InsightCard icon="☀" label="Do This Every Day"    value={reading.dailyAction}       delay={0.7}  accent="#FFD700" />
          <InsightCard icon="🌙" label="Do This Every Week"   value={reading.weeklyAction}      delay={0.76} accent="#CE93D8" />
          <InsightCard icon="🧘" label="Spiritual Practice"   value={reading.spiritualPractice} delay={0.82} accent="#4DB6AC" />
          <InsightCard icon="⭐" label="New Habit To Build"   value={reading.recommendedHabit}  delay={0.88} accent="#4FC3F7" />
        </div>
      </div>

      {/* ── Reflection + Affirmation ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '18px', marginBottom: '44px', position: 'relative', zIndex: 10 }}>
        {reading.reflectionQuestion && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95 }}
            style={{ padding: '26px', background: 'linear-gradient(135deg,rgba(100,80,200,0.1) 0%,rgba(100,80,200,0.03) 100%)', border: '1px solid rgba(150,100,255,0.22)', borderRadius: '16px' }}>
            <p style={{ margin: '0 0 12px', fontSize: '11px', letterSpacing: '2.5px', color: 'rgba(180,150,255,0.7)', fontFamily: 'Iceland, sans-serif', textTransform: 'uppercase' }}>🔍 Think About This</p>
            <p style={{ margin: 0, color: 'rgba(255,248,220,0.9)', fontSize: '18px', lineHeight: 1.8, fontFamily: 'Iceland, sans-serif', fontStyle: 'italic', wordBreak: 'break-word' }}>"{reading.reflectionQuestion}"</p>
          </motion.div>
        )}
        {reading.positiveAffirmation && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.04 }}
            style={{ padding: '26px', background: 'linear-gradient(135deg,rgba(255,215,0,0.1) 0%,rgba(255,180,0,0.03) 100%)', border: '1px solid rgba(255,215,0,0.28)', borderRadius: '16px' }}>
            <p style={{ margin: '0 0 12px', fontSize: '11px', letterSpacing: '2.5px', color: 'rgba(255,215,0,0.6)', fontFamily: 'Iceland, sans-serif', textTransform: 'uppercase' }}>✨ Say This To Yourself</p>
            <p style={{ margin: 0, color: '#FFD700', fontSize: '18px', lineHeight: 1.8, fontFamily: 'Iceland, sans-serif', fontStyle: 'italic', textShadow: '0 0 20px rgba(255,215,0,0.3)', wordBreak: 'break-word' }}>"{reading.positiveAffirmation}"</p>
          </motion.div>
        )}
      </div>

      {/* ── Card-by-card insights ──────────────────────────────────────── */}
      {reading.cardInsights && reading.cardInsights.length > 0 && (
        <div style={{ marginBottom: '48px', position: 'relative', zIndex: 10 }}>
          <h3 style={{ fontFamily: 'Iceland, sans-serif', fontSize: '20px', letterSpacing: '4px', color: '#FFD700', textTransform: 'uppercase', marginBottom: '22px', textAlign: 'center' }}>
            What Each Card Is Telling You
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reading.cardInsights.map((n, i) => {
              const kt = karmaThemes[i] ?? karmaThemes[0];
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.1 + i * 0.1 }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '18px',
                    padding: '20px 22px',
                    background: `linear-gradient(160deg,${kt.color}0d 0%,rgba(0,0,0,0.01) 100%)`,
                    border: `1px solid ${kt.color}28`, borderRadius: '14px',
                  }}>
                  {cards[i] && (
                    <div style={{ position: 'relative', width: '56px', height: '86px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                      <CardFace card={cards[i]} size="sm" />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 4px', fontSize: '11px', letterSpacing: '2px', color: `${kt.color}99`, fontFamily: 'Iceland, sans-serif', textTransform: 'uppercase' }}>{n.position}</p>
                    <p style={{ margin: '0 0 10px', fontSize: '14px', color: kt.color, fontFamily: 'Iceland, sans-serif', fontWeight: 600 }}>{n.card}</p>
                    <p style={{ margin: 0, fontSize: '16px', color: 'rgba(255,248,220,0.82)', lineHeight: 1.76, wordBreak: 'break-word' }}>{n.insight}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <ResetButton onReset={onReset} />
    </div>
  );
};

// ─── Reset button ─────────────────────────────────────────────────────────────
const ResetButton = ({ onReset }: { onReset: () => void }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
    style={{ textAlign: 'center', paddingBottom: '48px', position: 'relative', zIndex: 10 }}>
    <button onClick={onReset}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '16px 36px', background: 'transparent', border: '1px solid rgba(255,215,0,0.32)', color: 'rgba(255,215,0,0.7)', fontFamily: 'Iceland, sans-serif', letterSpacing: '4px', fontSize: '13px', textTransform: 'uppercase', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.3s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,215,0,0.75)'; (e.currentTarget as HTMLElement).style.color = '#FFD700'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 24px rgba(255,215,0,0.22)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,215,0,0.32)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,215,0,0.7)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
      <RotateCcw size={15} /> Begin New Reading
    </button>
  </motion.div>
);

// ─── Loading Overlay ──────────────────────────────────────────────────────────
const LOADING_MESSAGES = [
  'Consulting the Cosmic Archive...',
  'Reading the Threads of Destiny...',
  'Decoding Hidden Influences...',
  'Aligning Sacred Energies...',
  'Traversing the Akashic Records...',
  'Unveiling the Soul\'s Pattern...',
  'Weaving Your Timeline...',
];

const LoadingOverlay = () => {
  const [msgIdx, setMsgIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setMsgIdx(i => (i + 1) % LOADING_MESSAGES.length);
        setFade(true);
      }, 400);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(6,4,18,0.97)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(14px)' }}>
      <Particles count={35} />

      {/* Nested spinning rings */}
      <div style={{ position: 'relative', width: 120, height: 120, marginBottom: '40px' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', inset: 0, border: '2px solid transparent', borderTop: '2px solid #FFD700', borderRadius: '50%', boxShadow: '0 0 20px rgba(255,215,0,0.5)' }} />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', inset: '14px', border: '1px solid transparent', borderTop: '1px solid rgba(255,215,0,0.5)', borderRadius: '50%' }} />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', inset: '28px', border: '1px solid transparent', borderBottom: '1px solid rgba(255,215,0,0.3)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '28px' }}>🔮</motion.span>
        </div>
      </div>

      <p style={{
        color: 'rgba(255,215,0,0.85)', fontFamily: 'Iceland, sans-serif', letterSpacing: '4px', fontSize: '15px',
        textTransform: 'uppercase', transition: 'opacity 0.4s ease', opacity: fade ? 1 : 0,
        textShadow: '0 0 20px rgba(255,215,0,0.4)',
      }}>
        {LOADING_MESSAGES[msgIdx]}
      </p>
    </div>
  );
};

// ─── Main Experience ──────────────────────────────────────────────────────────
const TarotExperience = () => {
  const [phase, setPhase] = useState<Phase>('landing');
  const [mode, setMode] = useState<Mode | null>(null);
  const [question, setQuestion] = useState('');
  const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
  const [reading, setReading] = useState<AIReading | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const positions = mode === 'timeline' ? TIMELINE_POSITIONS : KARMA_POSITIONS;
  const numCards = mode === 'timeline' ? 5 : 3;

  // Map each phase to the one the Back button should return to.
  // 'landing' has no override → route-level back navigates away from the page.
  const phaseBackMap: Partial<Record<Phase, Phase>> = {
    opening:  'landing',
    shuffling: 'opening',
    mode:     'landing',
    question: 'mode',
    spread:   mode === 'timeline' ? 'question' : 'mode',
    revealing: 'spread',
    reading:  'spread',
  };

  const targetPhase = phaseBackMap[phase] ?? null;
  useBackOverride(
    targetPhase !== null ? () => setPhase(targetPhase) : null,
    [phase, mode],
  );

  const fetchReading = useCallback(async (cards: TarotCard[], modeArg: Mode, q: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tarot/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: modeArg, question: q, cards: cards.map(c => ({ name: c.name, meaning: c.meaning, keywords: c.keywords, symbol: c.symbol })) }),
      });
      const data = await res.json();
      if (data.success) setReading(data.data);
      else setReading(generateFallbackReading(modeArg, cards));
    } catch {
      setReading(generateFallbackReading(modeArg, cards));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCardSpreadComplete = useCallback((cards: TarotCard[]) => {
    setSelectedCards(cards);
    setPhase('revealing');
  }, []);

  const handleRevealComplete = useCallback(() => {
    setPhase('reading');
    if (mode) fetchReading(selectedCards, mode, question);
  }, [mode, selectedCards, question, fetchReading]);

  const handleReset = useCallback(() => {
    setPhase('landing');
    setMode(null);
    setQuestion('');
    setSelectedCards([]);
    setReading(null);
    setIsLoading(false);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', position: 'relative' }}>
      {isLoading && <LoadingOverlay />}

      <AnimatePresence mode="wait">
        {phase === 'landing' && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <TarotLandingScene
              onModeSelect={(id) => {
                if (id === 'life-timeline') { setMode('timeline'); setPhase('question'); }
                else { setMode('karma'); setPhase('spread'); }
              }}
            />
          </motion.div>
        )}

        {phase === 'opening' && (
          <motion.div key="opening" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <OpeningScene onBegin={() => setPhase('shuffling')} />
          </motion.div>
        )}

        {phase === 'shuffling' && (
          <motion.div key="shuffling" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <ShuffleScene onComplete={() => setPhase('question')} />
          </motion.div>
        )}

        {phase === 'question' && (
          <motion.div key="question" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
            <QuestionSelectScene onSelect={q => { setQuestion(q); setPhase('spread'); }} />
          </motion.div>
        )}

        {phase === 'spread' && (
          <motion.div key="spread" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <CardSpreadScene numCards={numCards} positions={positions} onComplete={handleCardSpreadComplete} />
          </motion.div>
        )}

        {phase === 'revealing' && (
          <motion.div key="revealing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <CardRevealScene cards={selectedCards} positions={positions} onComplete={handleRevealComplete} />
          </motion.div>
        )}

        {phase === 'reading' && reading && !isLoading && (
          <motion.div key="reading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            {mode === 'timeline' ? (
              <TimelineReadingDisplay cards={selectedCards} positions={positions} question={question} reading={reading} onReset={handleReset} />
            ) : (
              <KarmaMirrorDisplay cards={selectedCards} positions={positions} reading={reading} onReset={handleReset} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Fallback reading generator ───────────────────────────────────────────────
function generateFallbackReading(mode: Mode, cards: TarotCard[]): AIReading {
  if (mode === 'timeline') {
    return {
      currentLifeStage: `You stand at a threshold of transformation, embodied by the energy of ${cards[1]?.name}.`,
      mainOpportunity: `${cards[3]?.name} opens a doorway of significant growth and aligned action in the coming months.`,
      hiddenChallenge: `${cards[2]?.name} reveals a hidden pattern that quietly shapes your experience. Acknowledge it with compassion.`,
      nextMajorTurningPoint: `Around the energy of ${cards[3]?.name}, a significant pivotal shift arrives — prepare your heart and mind.`,
      recommendedAction: 'Take one courageous step aligned with your highest truth each day, without waiting for perfect conditions.',
      spiritualGuidance: 'The cosmos supports those who act from love rather than fear. Trust the path unfolding before you.',
      probabilityScore: 72 + Math.floor(Math.random() * 20),
      timelineNarrative: cards.map((c, i) => ({
        position: TIMELINE_POSITIONS[i],
        card: c.name,
        insight: c.meaning,
      })),
      overallMessage: `Your reading reveals a soul in beautiful motion. ${cards[0]?.meaning} Trust this journey — it leads exactly where you are meant to go.`,
    };
  }
  return {
    currentKarmaTheme: `${cards[0]?.keywords[0]} — a pattern asking for your loving attention and conscious healing.`,
    rootCause: `Past experiences have created ${cards[0]?.keywords[1]?.toLowerCase() ?? 'limiting'} patterns. Awareness is the first act of liberation.`,
    lifeAreasAffected: ['Career', 'Relationships', 'Inner Peace'],
    energyScore: 55 + Math.floor(Math.random() * 30),
    karmaBlockScore: 50 + Math.floor(Math.random() * 35),
    spiritualGrowthScore: 60 + Math.floor(Math.random() * 25),
    dailyAction: 'Begin each morning with 5 minutes of conscious breath awareness before any digital input.',
    weeklyAction: `Journal on this question: Where in my ${cards[1]?.keywords[0]?.toLowerCase() ?? 'life'} am I resisting what the soul already accepts?`,
    spiritualPractice: `The energy of ${cards[2]?.name} invites a practice of ${cards[2]?.keywords[2]?.toLowerCase() ?? 'stillness and reflection'}.`,
    recommendedHabit: 'Create one act of self-kindness each day that costs nothing but your willingness to receive it.',
    reflectionQuestion: `What would I do today if I truly believed I deserved the healing that ${cards[2]?.name} is offering me?`,
    positiveAffirmation: `I release what no longer serves my soul. I walk forward in the full light of ${cards[2]?.keywords[0]?.toLowerCase() ?? 'healing and grace'}.`,
    cardInsights: cards.map((c, i) => ({
      position: KARMA_POSITIONS[i],
      card: c.name,
      insight: c.meaning,
    })),
  };
}

export default TarotExperience;
