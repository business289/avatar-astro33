import React, { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface TarotMode {
  id: string;
  name: string;
  trademark: boolean;
  theme: "gold" | "purple";
  tagline: string;
  description: string;
  tags: string[];
  icon: "sun-moon" | "mirror";
}

interface TarotLandingSceneProps {
  onModeSelect: (mode: string) => void;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const TAROT_MODES: TarotMode[] = [
  {
    id: "life-timeline",
    name: "Life Timeline Tarot",
    trademark: true,
    theme: "gold",
    tagline: "",
    description:
      "Journey through time – past, present and future. Five sacred cards reveal the arc of your destiny across career, love, finance, health and life purpose.",
    tags: ["Past Energy", "Current Energy", "Hidden Influence", "Next 6 Months", "Future Potential"],
    icon: "sun-moon",
  },
  {
    id: "karma-mirror",
    name: "Karma Mirror",
    trademark: true,
    theme: "purple",
    tagline: "",
    description:
      "Not future prediction – soul reflection. Three cards reveal karmic patterns, hidden blockages and your healing path forward. See what your soul already knows.",
    tags: ["Current Karma", "Hidden Blockage", "Healing Path"],
    icon: "mirror",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Animated star field canvas */
const StarField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    interface Star {
      x: number;
      y: number;
      r: number;
      alpha: number;
      speed: number;
      phase: number;
    }

    const stars: Star[] = Array.from({ length: 160 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.2 + 0.2,
      alpha: Math.random() * 0.6 + 0.1,
      speed: Math.random() * 0.008 + 0.002,
      phase: Math.random() * Math.PI * 2,
    }));

    let frame = 0;
    let rafId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;
      stars.forEach((s) => {
        const twinkle = Math.sin(s.phase + frame * s.speed) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 235, 180, ${s.alpha * twinkle})`;
        ctx.fill();
      });
      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
};

/** SVG – Celestial Sun/Moon oval illustration (gold) */
const SunMoonIllustration: React.FC = () => (
  <svg
    viewBox="0 0 260 320"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: "100%", height: "100%" }}
  >
    <defs>
      <radialGradient id="sunGlow" cx="50%" cy="42%" r="40%">
        <stop offset="0%" stopColor="#FFD97A" stopOpacity="1" />
        <stop offset="40%" stopColor="#C98B2A" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#1a0e00" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="bgOval" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#1a0d00" />
        <stop offset="100%" stopColor="#0a0812" />
      </radialGradient>
      <linearGradient id="oceanReflect" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#C98B2A" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#1a0e00" stopOpacity="0" />
      </linearGradient>
      <clipPath id="ovalClip">
        <ellipse cx="130" cy="158" rx="88" ry="116" />
      </clipPath>
    </defs>

    {/* Outer decorative ring */}
    <ellipse cx="130" cy="158" rx="112" ry="148" stroke="#C98B2A" strokeWidth="0.8" strokeOpacity="0.4" fill="none" strokeDasharray="3 6" />

    {/* Roman numeral positions around oval */}
    {[
      { label: "XII", x: 130, y: 8, anchor: "middle" },
      { label: "III", x: 252, y: 162, anchor: "start" },
      { label: "VI", x: 130, y: 315, anchor: "middle" },
      { label: "IX", x: 8, y: 162, anchor: "end" },
    ].map(({ label, x, y, anchor }) => (
      <text
        key={label}
        x={x}
        y={y}
        fill="#C98B2A"
        fillOpacity="0.55"
        fontSize="9"
        fontFamily="serif"
        textAnchor={anchor as "middle" | "start" | "end"}
        dominantBaseline="middle"
      >
        {label}
      </text>
    ))}

    {/* Star at top */}
    <text x="130" y="26" fill="#FFD97A" fontSize="10" textAnchor="middle" dominantBaseline="middle">
      ✦
    </text>

    {/* Inner oval background */}
    <ellipse cx="130" cy="158" rx="88" ry="116" fill="url(#bgOval)" />

    {/* Sky/clouds inside clip */}
    <g clipPath="url(#ovalClip)">
      {/* Dark sky */}
      <rect x="42" y="42" width="176" height="232" fill="#0c0500" />

      {/* Glow from sun */}
      <ellipse cx="130" cy="130" rx="60" ry="55" fill="url(#sunGlow)" />

      {/* Sun circle */}
      <circle cx="130" cy="118" r="28" fill="#FFD97A" />
      <circle cx="130" cy="118" r="22" fill="#FFE9A0" />
      <circle cx="130" cy="118" r="14" fill="#FFFBE0" />

      {/* Horizon line */}
      <rect x="42" y="200" width="176" height="74" fill="#0a0400" />

      {/* Ocean reflection pillar */}
      <rect x="118" y="200" width="24" height="70" fill="url(#oceanReflect)" opacity="0.7" />

      {/* Cloud shapes */}
      <ellipse cx="80" cy="190" rx="28" ry="10" fill="#1a0e00" opacity="0.9" />
      <ellipse cx="68" cy="186" rx="20" ry="9" fill="#241400" opacity="0.8" />
      <ellipse cx="180" cy="193" rx="26" ry="9" fill="#1a0e00" opacity="0.9" />
      <ellipse cx="192" cy="189" rx="18" ry="8" fill="#241400" opacity="0.8" />
    </g>

    {/* Inner oval border */}
    <ellipse cx="130" cy="158" rx="88" ry="116" stroke="#C98B2A" strokeWidth="1.2" fill="none" strokeOpacity="0.8" />

    {/* Crescent moon at bottom */}
    <g transform="translate(110, 264)">
      <circle cx="20" cy="14" r="14" fill="#C98B2A" opacity="0.9" />
      <circle cx="26" cy="12" r="11" fill="#0a0812" />
    </g>

    {/* Bottom diamond */}
    <text x="130" y="305" fill="#C98B2A" fontSize="8" textAnchor="middle" dominantBaseline="middle">
      ◆
    </text>

    {/* Tick marks around oval */}
    {Array.from({ length: 24 }).map((_, i) => {
      const angle = (i * 360) / 24 - 90;
      const rad = (angle * Math.PI) / 180;
      const rx = 95, ry = 122;
      const x1 = 130 + rx * Math.cos(rad);
      const y1 = 158 + ry * Math.sin(rad);
      const x2 = 130 + (rx - 5) * Math.cos(rad);
      const y2 = 158 + (ry - 5) * Math.sin(rad);
      return (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#C98B2A" strokeWidth="0.6" strokeOpacity="0.4" />
      );
    })}
  </svg>
);

/** SVG – Ornate Mirror with Moon illustration (purple) */
const MirrorIllustration: React.FC = () => (
  <svg
    viewBox="0 0 240 320"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: "100%", height: "100%" }}
  >
    <defs>
      <radialGradient id="mirrorGlow" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#7B3FBF" stopOpacity="0.8" />
        <stop offset="60%" stopColor="#3D1A6E" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#0a0812" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="purpleScene" cx="50%" cy="35%" r="55%">
        <stop offset="0%" stopColor="#6B2FA0" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#1a0d2e" stopOpacity="1" />
      </radialGradient>
      <linearGradient id="mirrorReflect" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#9B59D0" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#1a0d2e" stopOpacity="0" />
      </linearGradient>
      <clipPath id="mirrorClip">
        <path d="M80,290 L80,110 Q80,42 120,42 Q160,42 160,110 L160,290 Z" />
      </clipPath>
    </defs>

    {/* Outer glow */}
    <ellipse cx="120" cy="155" rx="100" ry="140" fill="url(#mirrorGlow)" opacity="0.3" />

    {/* Mirror frame outer */}
    <path
      d="M68,294 L68,108 Q68,28 120,28 Q172,28 172,108 L172,294 Z"
      stroke="#6B3FA0"
      strokeWidth="2"
      fill="#120820"
      strokeOpacity="0.9"
    />

    {/* Frame top ornament */}
    <circle cx="120" cy="26" r="8" fill="#2a1040" stroke="#7B3FBF" strokeWidth="1.5" />
    <circle cx="120" cy="26" r="4" fill="#9B59D0" opacity="0.8" />

    {/* Frame side ornaments */}
    {[-1, 1].map((side) => (
      <g key={side} transform={`translate(${120 + side * 52}, 155)`}>
        <rect x="-4" y="-20" width="8" height="40" fill="none" stroke="#5A2D8A" strokeWidth="1" strokeOpacity="0.6" />
        <circle cx="0" cy="0" r="3" fill="#7B3FBF" opacity="0.6" />
      </g>
    ))}

    {/* Mirror interior scene */}
    <g clipPath="url(#mirrorClip)">
      <rect x="68" y="28" width="104" height="266" fill="#0e0520" />
      <ellipse cx="120" cy="100" rx="55" ry="50" fill="#5A2090" opacity="0.5" />
      <ellipse cx="120" cy="100" rx="35" ry="32" fill="#7B35C0" opacity="0.4" />
      {/* Crescent moon */}
      <g transform="translate(98, 68)">
        <circle cx="18" cy="16" r="16" fill="#C8A0FF" opacity="0.9" />
        <circle cx="24" cy="13" r="13" fill="#0e0520" />
      </g>
      {/* Mist */}
      <ellipse cx="90" cy="185" rx="30" ry="12" fill="#4A1A7A" opacity="0.7" />
      <ellipse cx="155" cy="190" rx="25" ry="10" fill="#3D1560" opacity="0.7" />
      <ellipse cx="120" cy="195" rx="40" ry="14" fill="#5A2090" opacity="0.5" />
      {/* Water reflection */}
      <rect x="68" y="210" width="104" height="84" fill="#0a0318" />
      <rect x="114" y="210" width="12" height="84" fill="url(#mirrorReflect)" opacity="0.6" />
      <rect x="112" y="130" width="16" height="80" fill="#9B59D0" opacity="0.15" />
    </g>

    {/* Mirror inner border */}
    <path
      d="M80,290 L80,110 Q80,42 120,42 Q160,42 160,110 L160,290 Z"
      stroke="#7B3FBF"
      strokeWidth="1.5"
      fill="none"
      strokeOpacity="0.7"
    />

    {/* Bottom ornament */}
    <path d="M100,294 L120,304 L140,294" stroke="#6B3FA0" strokeWidth="1.5" fill="none" strokeOpacity="0.6" />
    <circle cx="120" cy="306" r="4" fill="#3D1560" stroke="#7B3FBF" strokeWidth="1" />

    {/* Corner filigrees */}
    {[{ x: 70, y: 115, rotate: 0 }, { x: 170, y: 115, rotate: 90 }].map((pos, i) => (
      <g key={i} transform={`translate(${pos.x},${pos.y}) rotate(${pos.rotate})`}>
        <path d="M0,0 Q8,-8 16,0 Q8,8 0,0" fill="none" stroke="#5A2D8A" strokeWidth="0.8" strokeOpacity="0.5" />
      </g>
    ))}
  </svg>
);

/** Diamond separator */
const DiamondSeparator: React.FC<{ color?: string; size?: number; glow?: boolean }> = ({
  color = "#C98B2A",
  size = 12,
  glow = false,
}) => (
  <span
    style={{
      display: "inline-block",
      color,
      fontSize: size,
      lineHeight: 1,
      textShadow: glow ? `0 0 12px ${color}, 0 0 24px ${color}80` : "none",
      verticalAlign: "middle",
    }}
  >
    ✦
  </span>
);

/** Pill tag badge */
const PillTag: React.FC<{ label: string; theme: "gold" | "purple" }> = ({ label, theme }) => {
  const borderColor = theme === "gold" ? "#C98B2A" : "#7B3FBF";
  const textColor   = theme === "gold" ? "#D4A850" : "#A87FD4";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: 99,
        border: `1px solid ${borderColor}`,
        color: textColor,
        fontSize: 9,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 600,
        lineHeight: 1.4,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
};

/** Mode card */
const ModeCard: React.FC<{
  mode: TarotMode;
  onSelect: (id: string) => void;
  animDelay: number;
}> = ({ mode, onSelect, animDelay }) => {
  const [hovered, setHovered] = useState(false);
  const isGold = mode.theme === "gold";

  const borderColor = isGold ? "#C98B2A" : "#6B3FA0";
  const borderGlow  = isGold ? "rgba(201,139,42,0.35)" : "rgba(107,63,160,0.35)";
  const titleColor  = isGold ? "#D4A850" : "#A87FD4";
  const ctaColor    = isGold ? "#C98B2A" : "#8B5FC0";
  const bgColor     = isGold ? "rgba(20,12,0,0.85)" : "rgba(14,8,28,0.85)";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(mode.id)}
      style={{
        flex: 1,
        minWidth: 0,
        position: "relative",
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 4,
        padding: "32px 28px 28px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "row",
        gap: 28,
        alignItems: "stretch",
        boxShadow: hovered
          ? `0 0 40px ${borderGlow}, 0 0 80px ${borderGlow}50, inset 0 0 30px ${borderGlow}20`
          : `0 0 20px ${borderGlow}50, inset 0 0 15px ${borderGlow}10`,
        transition: "box-shadow 0.4s ease, transform 0.3s ease",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        animation: `fadeSlideUp 0.7s ease ${animDelay}s both`,
        clipPath: "polygon(0 0, calc(100% - 0px) 0, 100% 0px, 100% 100%, 0 100%)",
      }}
    >
      {/* Chamfered corner SVG decorations */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="0" y1="18" x2="18" y2="0" stroke={borderColor} strokeWidth="1" strokeOpacity="0.6" />
        <line
          x1="100%"
          y1="calc(100% - 18px)"
          x2="calc(100% - 18px)"
          y2="100%"
          stroke={borderColor}
          strokeWidth="1"
          strokeOpacity="0.6"
        />
        <text
          x="50%"
          y="100%"
          dy="-8"
          fill={borderColor}
          fontSize="8"
          textAnchor="middle"
          dominantBaseline="middle"
          opacity="0.7"
        >
          ◆
        </text>
      </svg>

      {/* Illustration */}
      <div
        style={{
          flexShrink: 0,
          width: 180,
          minHeight: 260,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isGold ? <SunMoonIllustration /> : <MirrorIllustration />}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
        <h2
          style={{
            margin: "0 0 4px",
            color: titleColor,
            fontSize: 22,
            fontFamily: "'Cinzel', 'Playfair Display', serif",
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            lineHeight: 1.2,
          }}
        >
          {mode.name}
          {mode.trademark && (
            <span style={{ fontSize: 14, verticalAlign: "super", lineHeight: 0 }}>™</span>
          )}
        </h2>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            margin: "10px 0 14px",
            color: titleColor,
            opacity: 0.6,
          }}
        >
          <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${borderColor}, transparent)` }} />
          <span style={{ fontSize: 10 }}>{isGold ? "☀" : "☽"}</span>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, ${borderColor}, transparent)` }} />
        </div>

        <p
          style={{
            margin: "0 0 20px",
            color: "#b8aac0",
            fontSize: 13,
            lineHeight: 1.7,
            fontFamily: "'Lato', 'Inter', sans-serif",
            fontWeight: 400,
          }}
        >
          {mode.description}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
          {mode.tags.map((tag) => (
            <PillTag key={tag} label={tag} theme={mode.theme} />
          ))}
        </div>

        <div
          style={{
            marginTop: "auto",
            color: ctaColor,
            fontSize: 11,
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: 10,
            opacity: hovered ? 1 : 0.75,
            transition: "opacity 0.3s ease",
          }}
        >
          <span>Explore Reading</span>
          <span
            style={{
              display: "inline-block",
              transform: hovered ? "translateX(5px)" : "translateX(0)",
              transition: "transform 0.3s ease",
            }}
          >
            →
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const TarotLandingScene: React.FC<TarotLandingSceneProps> = ({ onModeSelect }) => {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0c0a18 0%, #080612 40%, #0a0610 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px 40px",
        overflow: "hidden",
        fontFamily: "'Inter', 'Lato', sans-serif",
      }}
    >
      {/* Ambient gradients */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 40% at 20% 80%, rgba(120,60,20,0.08) 0%, transparent 70%), radial-gradient(ellipse 50% 35% at 80% 20%, rgba(80,30,120,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <StarField />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 1200,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 20,
            animation: "fadeIn 0.8s ease 0.1s both",
          }}
        >
          <div style={{ width: 48, height: 1, background: "linear-gradient(to right, transparent, #C98B2A)", opacity: 0.6 }} />
          <DiamondSeparator color="#C98B2A" size={8} />
          <span
            style={{
              color: "#C98B2A",
              fontSize: 10,
              letterSpacing: "0.25em",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
              textTransform: "uppercase",
              opacity: 0.85,
            }}
          >
            Choose Your Sacred Reading
          </span>
          <DiamondSeparator color="#C98B2A" size={8} />
          <div style={{ width: 48, height: 1, background: "linear-gradient(to left, transparent, #C98B2A)", opacity: 0.6 }} />
        </div>

        {/* Main headline */}
        <h1 style={{ margin: "0 0 6px", textAlign: "center", lineHeight: 1.05, animation: "fadeSlideUp 0.9s ease 0.2s both" }}>
          <span
            style={{
              display: "block",
              fontSize: "clamp(40px, 7vw, 88px)",
              fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              background: "linear-gradient(180deg, #F0D080 0%, #C98B2A 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            How Shall
          </span>
          <span
            style={{
              display: "block",
              fontSize: "clamp(40px, 7vw, 88px)",
              fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              background: "linear-gradient(180deg, #D4A040 0%, #A06820 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            The Cards Speak?
          </span>
        </h1>

        <div style={{ margin: "14px 0 36px", animation: "fadeIn 0.8s ease 0.45s both" }}>
          <DiamondSeparator color="#C98B2A" size={16} glow />
        </div>

        {/* Mode cards */}
        <div
          style={{ width: "100%", display: "flex", flexDirection: "row", gap: 24, alignItems: "stretch" }}
          className="tarot-mode-grid"
        >
          {TAROT_MODES.map((mode, i) => (
            <ModeCard key={mode.id} mode={mode} onSelect={onModeSelect} animDelay={0.5 + i * 0.15} />
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 44,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 32,
            animation: "fadeIn 0.8s ease 0.9s both",
          }}
        >
          <span
            style={{
              color: "#6a5a7a",
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 500,
            }}
          >
            Your Energy. Your Story.
          </span>

          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <line x1="14" y1="0" x2="14" y2="28" stroke="#C98B2A" strokeWidth="0.8" strokeOpacity="0.5" />
            <line x1="0" y1="14" x2="28" y2="14" stroke="#C98B2A" strokeWidth="0.8" strokeOpacity="0.5" />
            <line x1="4" y1="4" x2="24" y2="24" stroke="#C98B2A" strokeWidth="0.5" strokeOpacity="0.3" />
            <line x1="24" y1="4" x2="4" y2="24" stroke="#C98B2A" strokeWidth="0.5" strokeOpacity="0.3" />
            <polygon points="14,2 15.2,12 14,13.5 12.8,12" fill="#C98B2A" opacity="0.8" />
            <polygon points="14,26 15.2,16 14,14.5 12.8,16" fill="#C98B2A" opacity="0.8" />
            <polygon points="2,14 12,15.2 13.5,14 12,12.8" fill="#C98B2A" opacity="0.8" />
            <polygon points="26,14 16,15.2 14.5,14 16,12.8" fill="#C98B2A" opacity="0.8" />
            <circle cx="14" cy="14" r="2.5" fill="#C98B2A" />
            <circle cx="14" cy="14" r="1.2" fill="#FFD97A" />
          </svg>

          <span
            style={{
              color: "#6a5a7a",
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 500,
            }}
          >
            The Cards Reveal.
          </span>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        @media (max-width: 900px) {
          .tarot-mode-grid { flex-direction: column !important; }
        }

        @media (max-width: 640px) {
          .tarot-mode-grid > div { flex-direction: column !important; }
          .tarot-mode-grid > div > div:first-child {
            width: 140px !important;
            min-height: 180px !important;
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  );
};

export { TarotLandingScene };
export default TarotLandingScene;
