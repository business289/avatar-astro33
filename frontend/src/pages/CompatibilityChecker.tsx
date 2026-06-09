import { useState, useEffect, useRef, useCallback } from "react";

// ── Fonts via Google Fonts (injected once) ──────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Space+Mono:wght@400;700&display=swap";
document.head.appendChild(fontLink);

// ── CSS ─────────────────────────────────────────────────────────────────────
const css = `
  :root {
    --void: #03010a;
    --deep: #07030f;
    --nebula: #0d0520;
    --aurora-1: #7b2fff;
    --aurora-2: #ff2d78;
    --aurora-3: #00e5ff;
    --gold: #f5c842;
    --stardust: rgba(255,255,255,0.07);
    --glass: rgba(255,255,255,0.05);
    --glass-border: rgba(255,255,255,0.12);
    --font-display: 'Cinzel Decorative', serif;
    --font-body: 'Cormorant Garamond', serif;
    --font-mono: 'Space Mono', monospace;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .universe-app {
    min-height: 100vh;
    background: var(--void);
    color: #e8e0f0;
    font-family: var(--font-body);
    font-size: 18px;
    overflow-x: hidden;
    position: relative;
  }

  /* ── Starfield ── */
  .starfield {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }
  .star {
    position: absolute;
    border-radius: 50%;
    background: white;
    animation: twinkle var(--d, 3s) ease-in-out infinite;
    animation-delay: var(--delay, 0s);
    opacity: var(--op, 0.6);
  }
  @keyframes twinkle {
    0%, 100% { opacity: var(--op, 0.6); transform: scale(1); }
    50% { opacity: 0.1; transform: scale(0.5); }
  }

  /* ── Nebula blobs ── */
  .nebula-blob {
    position: fixed;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
    z-index: 0;
    animation: drift 20s ease-in-out infinite alternate;
  }
  @keyframes drift {
    from { transform: translate(0, 0) scale(1); }
    to { transform: translate(40px, 30px) scale(1.1); }
  }

  /* ── Layout ── */
  .content { position: relative; z-index: 1; }

  /* ── Header ── */
  .header {
    text-align: center;
    padding: 60px 20px 40px;
  }
  .header-tag {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 6px;
    color: var(--aurora-3);
    text-transform: uppercase;
    margin-bottom: 16px;
    opacity: 0.8;
  }
  .header h1 {
    font-family: var(--font-display);
    font-size: clamp(22px, 4vw, 44px);
    font-weight: 900;
    background: linear-gradient(135deg, var(--gold) 0%, var(--aurora-2) 40%, var(--aurora-1) 80%, var(--aurora-3) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.2;
    margin-bottom: 12px;
  }
  .header p {
    color: rgba(232,224,240,0.55);
    font-size: 17px;
    font-style: italic;
    letter-spacing: 0.5px;
  }

  /* api-bar removed — key is hardcoded server-side */

  /* ── Form container ── */
  .form-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 20px 60px;
  }
  .persons-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 32px;
  }
  @media (max-width: 680px) {
    .persons-grid { grid-template-columns: 1fr; }
  }

  /* ── Person Card ── */
  .person-card {
    background: var(--glass);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    padding: 28px 24px;
    backdrop-filter: blur(16px);
    position: relative;
    overflow: hidden;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .person-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--grad);
    opacity: 0.04;
    pointer-events: none;
  }
  .person-card:hover {
    border-color: rgba(255,255,255,0.22);
    box-shadow: 0 0 40px rgba(123,47,255,0.15);
  }
  .card-title {
    font-family: var(--font-display);
    font-size: 13px;
    letter-spacing: 2px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .card-icon { font-size: 20px; }

  /* ── Field ── */
  .field { margin-bottom: 16px; }
  .field label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 3px;
    color: rgba(232,224,240,0.5);
    text-transform: uppercase;
    display: block;
    margin-bottom: 6px;
  }
  .field input, .field select {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 11px 14px;
    color: #e8e0f0;
    font-family: var(--font-body);
    font-size: 16px;
    outline: none;
    transition: border 0.3s, box-shadow 0.3s;
    -webkit-appearance: none;
  }
  .field input:focus, .field select:focus {
    border-color: var(--aurora-1);
    box-shadow: 0 0 0 3px rgba(123,47,255,0.15);
  }
  .field input::placeholder { color: rgba(232,224,240,0.25); }
  .field select option { background: #1a0a2e; }

  /* ── Date row ── */
  .date-row { display: grid; grid-template-columns: 2fr 2fr 3fr; gap: 8px; }

  /* ── Time row ── */
  .time-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }

  /* ── Place autocomplete ── */
  .place-wrap { position: relative; }
  .place-dropdown {
    position: absolute;
    top: calc(100% + 6px);
    left: 0; right: 0;
    background: #1a0a2e;
    border: 1px solid rgba(123,47,255,0.4);
    border-radius: 10px;
    z-index: 100;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.6);
  }
  .place-item {
    padding: 10px 14px;
    cursor: pointer;
    font-size: 15px;
    transition: background 0.2s;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .place-item:hover { background: rgba(123,47,255,0.2); }
  .place-item small {
    display: block;
    font-size: 12px;
    color: rgba(232,224,240,0.45);
    margin-top: 2px;
    font-family: var(--font-mono);
  }

  /* ── Submit button ── */
  .submit-btn {
    display: block;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    padding: 18px 40px;
    background: linear-gradient(135deg, var(--aurora-1), var(--aurora-2));
    border: none;
    border-radius: 50px;
    color: white;
    font-family: var(--font-display);
    font-size: 14px;
    letter-spacing: 2px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.3s;
    text-transform: uppercase;
  }
  .submit-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0);
    transition: background 0.3s;
  }
  .submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 60px rgba(255,45,120,0.4);
  }
  .submit-btn:active { transform: translateY(0); }
  .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* ── LOADING ── */
  .loading-screen {
    position: fixed;
    inset: 0;
    background: var(--void);
    z-index: 200;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 32px;
  }
  .loading-cosmos {
    width: 180px;
    height: 180px;
    position: relative;
  }
  .orbit-ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid transparent;
    animation: orbit-spin linear infinite;
  }
  .orbit-ring:nth-child(1) {
    inset: 0;
    border-color: rgba(123,47,255,0.5);
    animation-duration: 4s;
  }
  .orbit-ring:nth-child(2) {
    inset: 20px;
    border-color: rgba(255,45,120,0.5);
    animation-duration: 3s;
    animation-direction: reverse;
  }
  .orbit-ring:nth-child(3) {
    inset: 40px;
    border-color: rgba(0,229,255,0.5);
    animation-duration: 5s;
  }
  .orbit-dot {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
  }
  @keyframes orbit-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .orbit-center {
    position: absolute;
    inset: 60px;
    border-radius: 50%;
    background: radial-gradient(circle, var(--aurora-1), var(--aurora-2));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    animation: pulse-glow 2s ease-in-out infinite;
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(123,47,255,0.5); }
    50% { box-shadow: 0 0 60px rgba(255,45,120,0.8), 0 0 100px rgba(123,47,255,0.4); }
  }
  .loading-steps {
    display: flex;
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  .loading-step {
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 2px;
    color: rgba(232,224,240,0.3);
    transition: color 0.5s, opacity 0.5s;
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: center;
  }
  .loading-step.active {
    color: var(--aurora-3);
    text-shadow: 0 0 20px var(--aurora-3);
  }
  .loading-step.done { color: var(--gold); }
  .step-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }

  /* ── RESULTS ── */
  .results {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px 20px 80px;
  }

  /* ── Couple header ── */
  .couple-header {
    text-align: center;
    padding: 50px 20px 40px;
  }
  .couple-names {
    font-family: var(--font-display);
    font-size: clamp(16px, 3vw, 28px);
    background: linear-gradient(135deg, var(--aurora-2), var(--gold));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 8px;
  }
  .couple-sub {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 4px;
    color: rgba(232,224,240,0.4);
    text-transform: uppercase;
  }

  /* ── Overall score ── */
  .score-hero {
    display: flex;
    justify-content: center;
    margin-bottom: 48px;
  }
  .score-circle-wrap {
    text-align: center;
  }
  .score-circle {
    width: 200px;
    height: 200px;
    display: grid;
    place-items: center;
    margin: 0 auto 16px;
  }
  .score-svg {
    width: 200px;
    height: 200px;
    transform: rotate(-90deg);
    grid-area: 1/1;
  }
  .score-track { fill: none; stroke: rgba(255,255,255,0.08); stroke-width: 10; }
  .score-fill {
    fill: none;
    stroke-width: 10;
    stroke-linecap: round;
    stroke: url(#scoreGrad);
    transition: stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1);
  }
  .score-inner {
    grid-area: 1/1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 10; 
  }
  .score-num {
  font-family: var(--font-display);
  font-size: 48px;
  font-weight: 900;
  color: #f5c842;
  line-height: 1;
  position: relative;
  z-index: 10;
}
  .score-pct {
  font-family: var(--font-mono);
  font-size: 16px;
  color: rgba(232,224,240,0.7);
  position: relative;
  z-index: 10;
}
  .score-label {
    font-family: var(--font-display);
    font-size: 15px;
    letter-spacing: 2px;
    color: var(--gold);
    margin-bottom: 4px;
  }
  .score-tag {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 3px;
    color: rgba(232,224,240,0.4);
    text-transform: uppercase;
  }

  /* ── Section header ── */
  .section-head {
    font-family: var(--font-display);
    font-size: 13px;
    letter-spacing: 3px;
    color: var(--aurora-3);
    text-transform: uppercase;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .section-head::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, rgba(0,229,255,0.3), transparent);
  }

  /* ── Cards grid ── */
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    margin-bottom: 40px;
  }
  .compat-card {
    background: var(--glass);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    padding: 20px;
    backdrop-filter: blur(12px);
    transition: transform 0.2s, border-color 0.3s;
  }
  .compat-card:hover {
    transform: translateY(-3px);
    border-color: rgba(255,255,255,0.2);
  }
  .card-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }
  .card-emoji { font-size: 22px; }
  .card-name {
    font-family: var(--font-display);
    font-size: 12px;
    letter-spacing: 1px;
    color: rgba(232,224,240,0.8);
    flex: 1;
  }
  .card-score-num {
    font-family: var(--font-mono);
    font-size: 18px;
    font-weight: 700;
    color: var(--gold);
  }

  /* ── Progress bar ── */
  .prog-bar {
    height: 6px;
    background: rgba(255,255,255,0.08);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 8px;
  }
  .prog-fill {
    height: 100%;
    border-radius: 3px;
    background: var(--bar-color, linear-gradient(to right, var(--aurora-1), var(--aurora-2)));
    transition: width 1.5s cubic-bezier(0.4,0,0.2,1);
    width: 0;
  }
  .prog-fill.animate { width: var(--target-width, 0%); }
  .prog-label {
    display: flex;
    justify-content: space-between;
    font-family: var(--font-mono);
    font-size: 10px;
    color: rgba(232,224,240,0.4);
    letter-spacing: 1px;
  }

  /* ── Sub metrics ── */
  .sub-metrics { display: flex; flex-direction: column; gap: 10px; }
  .sub-metric-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .sub-metric-label {
    font-size: 13px;
    color: rgba(232,224,240,0.6);
    width: 130px;
    flex-shrink: 0;
    font-style: italic;
  }
  .sub-metric-bar {
    flex: 1;
    height: 4px;
    background: rgba(255,255,255,0.07);
    border-radius: 2px;
    overflow: hidden;
  }
  .sub-metric-fill {
    height: 100%;
    border-radius: 2px;
    background: var(--fill-c, var(--aurora-3));
    transition: width 1.8s cubic-bezier(0.4,0,0.2,1);
    width: 0;
  }
  .sub-metric-fill.animate { width: var(--w, 0%); }
  .sub-metric-val {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--fill-c, var(--aurora-3));
    width: 32px;
    text-align: right;
  }

  /* ── Insight box ── */
  .insight-box {
    background: rgba(123,47,255,0.08);
    border: 1px solid rgba(123,47,255,0.25);
    border-radius: 12px;
    padding: 14px 16px;
    margin-top: 12px;
    font-size: 14px;
    font-style: italic;
    color: rgba(232,224,240,0.7);
    line-height: 1.6;
  }
  .insight-label {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 3px;
    color: var(--aurora-1);
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  /* ── Planetary row ── */
  .planet-row {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
    margin-bottom: 40px;
  }
  .planet-item {
    background: var(--glass);
    border: 1px solid var(--glass-border);
    border-radius: 14px;
    padding: 14px 10px;
    text-align: center;
    backdrop-filter: blur(8px);
    transition: transform 0.2s;
  }
  .planet-item:hover { transform: translateY(-4px); }
  .planet-symbol { font-size: 28px; margin-bottom: 6px; }
  .planet-name {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 2px;
    color: rgba(232,224,240,0.4);
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .planet-score {
    font-family: var(--font-display);
    font-size: 16px;
    color: var(--gold);
  }

  /* ── Timeline ── */
  .timeline {
    position: relative;
    padding: 20px 0 20px 30px;
    margin-bottom: 40px;
  }
  .timeline::before {
    content: '';
    position: absolute;
    left: 8px;
    top: 0; bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, var(--aurora-1), var(--aurora-2), var(--aurora-3));
  }
  .tl-item {
    position: relative;
    margin-bottom: 20px;
    padding-left: 20px;
  }
  .tl-dot {
    position: absolute;
    left: -26px;
    top: 6px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--dot-c, var(--aurora-1));
    border: 2px solid var(--void);
    box-shadow: 0 0 12px var(--dot-c, var(--aurora-1));
  }
  .tl-phase {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 2px;
    color: var(--dot-c, var(--aurora-1));
    text-transform: uppercase;
    margin-bottom: 3px;
  }
  .tl-desc {
    font-size: 14px;
    color: rgba(232,224,240,0.6);
    font-style: italic;
  }

  /* ── Flags ── */
  .flags-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 40px;
  }
  @media (max-width: 600px) { .flags-grid { grid-template-columns: 1fr; } }
  .flags-col {
    background: var(--glass);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    padding: 20px;
  }
  .flags-col-title {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 14px;
  }
  .flag-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 10px;
    font-size: 14px;
    color: rgba(232,224,240,0.75);
    font-style: italic;
  }
  .flag-icon { flex-shrink: 0; font-size: 16px; }

  /* ── AI insights ── */
  .ai-insights-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 14px;
    margin-bottom: 40px;
  }
  .ai-card {
    background: linear-gradient(135deg, rgba(123,47,255,0.08), rgba(255,45,120,0.05));
    border: 1px solid rgba(123,47,255,0.2);
    border-radius: 14px;
    padding: 18px;
  }
  .ai-card-title {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 3px;
    color: var(--aurora-1);
    text-transform: uppercase;
    margin-bottom: 10px;
  }
  .ai-card-text {
    font-size: 15px;
    color: rgba(232,224,240,0.72);
    line-height: 1.65;
    font-style: italic;
  }

  /* ── Reset button ── */
  .reset-btn {
    display: block;
    margin: 0 auto;
    padding: 14px 40px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 50px;
    color: rgba(232,224,240,0.6);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s;
  }
  .reset-btn:hover {
    border-color: var(--aurora-1);
    color: var(--aurora-3);
    box-shadow: 0 0 30px rgba(123,47,255,0.2);
  }

  /* ── Error ── */
  .error-box {
    background: rgba(255,45,120,0.1);
    border: 1px solid rgba(255,45,120,0.3);
    border-radius: 12px;
    padding: 14px 18px;
    color: #ff8ab0;
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 1px;
    margin-bottom: 20px;
    text-align: center;
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--void); }
  ::-webkit-scrollbar-thumb { background: rgba(123,47,255,0.4); border-radius: 3px; }
`;

// ── Inject CSS ───────────────────────────────────────────────────────────────
const styleEl = document.createElement("style");
styleEl.textContent = css;
document.head.appendChild(styleEl);

// ── Compatibility API — calls YOUR backend (key stays server-side) ───────────
async function fetchCompatibilityReport(p1: any, p2: any, scores: any) {
  const res = await fetch("/api/compatibility/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ p1, p2, scores }),
  });
  if (!res.ok) throw new Error(`Backend error: ${res.status}`);
  return res.json();
}
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const YEARS = Array.from({ length: 120 }, (_, i) => new Date().getFullYear() - i);
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

function getZodiac(day, month) {
  const signs = [
    ["Capricorn",1,19],["Aquarius",2,18],["Pisces",3,20],["Aries",4,19],
    ["Taurus",5,20],["Gemini",6,20],["Cancer",7,22],["Leo",8,22],
    ["Virgo",9,22],["Libra",10,22],["Scorpio",11,21],["Sagittarius",12,21],["Capricorn",12,31]
  ];
  for (const [s, m, d] of signs) if (month < m || (month === m && day <= d)) return s;
  return "Capricorn";
}

function getLifePath(dob) {
  const digits = dob.replace(/-/g, "").split("").map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9 && sum !== 11 && sum !== 22) {
    sum = String(sum).split("").map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

function deriveScore(base, name1, name2, seed) {
  const n = (name1 + name2 + seed).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return Math.min(99, Math.max(52, base + (n % 20) - 10));
}

// ── Nominatim place search ───────────────────────────────────────────────────
async function searchPlaces(q) {
  if (!q || q.length < 2) return [];
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`;
  const res = await fetch(url, { headers: { "Accept-Language": "en", "User-Agent": "SpiritualAIApp/1.0" } });
  const data = await res.json();
  return data.map(d => ({
    display: d.display_name.split(",").slice(0, 3).join(", "),
    city: d.address?.city || d.address?.town || d.address?.village || d.name,
    state: d.address?.state || "",
    country: d.address?.country || "",
    lat: parseFloat(d.lat),
    lon: parseFloat(d.lon),
  }));
}

// ── Stars component ──────────────────────────────────────────────────────────
function Starfield() {
  const stars = Array.from({ length: 120 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5,
    d: (Math.random() * 4 + 2).toFixed(1),
    delay: (Math.random() * 6).toFixed(2),
    op: (Math.random() * 0.6 + 0.2).toFixed(2),
  }));
  return (
    <div className="starfield">
      {stars.map(s => (
        <div key={s.id} className="star" style={{
          left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size,
          "--d": `${s.d}s`, "--delay": `${s.delay}s`, "--op": s.op,
        }} />
      ))}
    </div>
  );
}

// ── Animated progress bar ────────────────────────────────────────────────────
function ProgBar({ value, color }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setTimeout(() => el.classList.add("animate"), 100);
  }, []);
  return (
    <div className="prog-bar">
      <div ref={ref} className="prog-fill" style={{ "--target-width": `${value}%`, "--bar-color": color || undefined }} />
    </div>
  );
}

// ── Sub metric ───────────────────────────────────────────────────────────────
function SubMetric({ label, value, color }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setTimeout(() => el.classList.add("animate"), 200);
  }, []);
  return (
    <div className="sub-metric-row">
      <div className="sub-metric-label">{label}</div>
      <div className="sub-metric-bar">
        <div ref={ref} className="sub-metric-fill" style={{ "--w": `${value}%`, "--fill-c": color || "var(--aurora-3)" }} />
      </div>
      <div className="sub-metric-val" style={{ color: color || "var(--aurora-3)" }}>{value}%</div>
    </div>
  );
}

// ── Score circle ─────────────────────────────────────────────────────────────
function ScoreCircle({ score, label, tag }) {
  const r = 80;
  const circ = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circ);
  useEffect(() => {
    setTimeout(() => setOffset(circ - (score / 100) * circ), 200);
  }, [score, circ]);
  const medal = score >= 90 ? "✨ Cosmic Soulmates" : score >= 75 ? "💫 Stellar Match" : score >= 60 ? "⭐ Promising Pair" : "🌙 Growing Bond";
  return (
    <div className="score-circle-wrap">
      <div className="score-circle">
        <svg className="score-svg" viewBox="0 0 180 180">
          <defs>
            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f5c842" />
              <stop offset="50%" stopColor="#ff2d78" />
              <stop offset="100%" stopColor="#7b2fff" />
            </linearGradient>
          </defs>
          <circle className="score-track" cx="90" cy="90" r={r} />
          <circle className="score-fill" cx="90" cy="90" r={r}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1)" }}
          />
        </svg>
        <div className="score-inner">
          <span className="score-num">{score}</span>
          <span className="score-pct">%</span>
        </div>
      </div>
      <div className="score-label">{medal}</div>
      <div className="score-tag">{tag || "Overall Compatibility"}</div>
    </div>
  );
}

// ── Place input ──────────────────────────────────────────────────────────────
function PlaceInput({ value, onChange }) {
  const [query, setQuery] = useState(value?.display || "");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const timer = useRef(null);

  const handleChange = (e) => {
    const v = e.target.value;
    setQuery(v);
    clearTimeout(timer.current);
    if (v.length < 2) { setResults([]); return; }
    timer.current = setTimeout(async () => {
      const res = await searchPlaces(v);
      setResults(res);
      setOpen(res.length > 0);
    }, 400);
  };

  const pick = (r) => {
    setQuery(r.display);
    onChange(r);
    setOpen(false);
  };

  return (
    <div className="place-wrap">
      <input value={query} onChange={handleChange} onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder="Type city name…" style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "#e8e0f0", fontFamily: "var(--font-body)", fontSize: 16, outline: "none" }} />
      {open && (
        <div className="place-dropdown">
          {results.map((r, i) => (
            <div key={i} className="place-item" onMouseDown={() => pick(r)}>
              {r.display}
              <small>{r.lat?.toFixed(4)}, {r.lon?.toFixed(4)}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Person form ──────────────────────────────────────────────────────────────
function PersonForm({ title, icon, grad, data, onChange }) {
  const up = (k, v) => onChange({ ...data, [k]: v });
  return (
    <div className="person-card" style={{ "--grad": grad }}>
      <div className="card-title">
        <span className="card-icon">{icon}</span>
        <span style={{ background: grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{title}</span>
      </div>
      <div className="field">
        <label>Full Name *</label>
        <input value={data.name} onChange={e => up("name", e.target.value)} placeholder="Enter full name" />
      </div>
      <div className="field">
        <label>Date of Birth *</label>
        <div className="date-row">
          <select value={data.day} onChange={e => up("day", e.target.value)}>
            <option value="">DD</option>
            {DAYS.map(d => <option key={d} value={d}>{String(d).padStart(2,"0")}</option>)}
          </select>
          <select value={data.month} onChange={e => up("month", e.target.value)}>
            <option value="">MM</option>
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select value={data.year} onChange={e => up("year", e.target.value)}>
            <option value="">YYYY</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label>Time of Birth (optional)</label>
        <div className="time-row">
          <select value={data.hour} onChange={e => up("hour", e.target.value)}>
            <option value="">HH</option>
            {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          <select value={data.min} onChange={e => up("min", e.target.value)}>
            <option value="">MM</option>
            {MINS.filter((_, i) => i % 5 === 0).map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={data.ampm} onChange={e => up("ampm", e.target.value)}>
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      </div>
      <div className="field">
        <label>Place of Birth (optional)</label>
        <PlaceInput value={data.place} onChange={v => up("place", v)} />
      </div>
    </div>
  );
}

// ── Loading ──────────────────────────────────────────────────────────────────
const LOADING_STEPS = [
  "Reading Birth Charts",
  "Mapping Planetary Positions",
  "Aligning Cosmic Energies",
  "Matching Soul Frequencies",
  "Calculating Love Compatibility",
  "Analyzing Marriage Potential",
  "Generating Personalized Insights",
  "Preparing Universe Report",
];

function LoadingScreen() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep(s => Math.min(s + 1, LOADING_STEPS.length - 1)), 700);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="loading-screen">
      <div className="loading-cosmos">
        <div className="orbit-ring"><div className="orbit-dot" style={{ background: "#7b2fff" }} /></div>
        <div className="orbit-ring"><div className="orbit-dot" style={{ background: "#ff2d78" }} /></div>
        <div className="orbit-ring"><div className="orbit-dot" style={{ background: "#00e5ff" }} /></div>
        <div className="orbit-center">💫</div>
      </div>
      <div className="loading-steps">
        {LOADING_STEPS.map((s, i) => (
          <div key={s} className={`loading-step ${i === step ? "active" : i < step ? "done" : ""}`}>
            <div className="step-dot" />
            <span>✨ {s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Results ──────────────────────────────────────────────────────────────────
function Results({ p1, p2, report, onReset }) {
  const s = report.scores;

  const PLANETS = [
    { symbol: "☀️", name: "Sun", score: deriveScore(s.overall, p1.name, p2.name, "sun") },
    { symbol: "🌙", name: "Moon", score: deriveScore(s.emotional, p1.name, p2.name, "moon") },
    { symbol: "⬆️", name: "Rising", score: deriveScore(s.love, p1.name, p2.name, "rise") },
    { symbol: "♀️", name: "Venus", score: deriveScore(s.love, p1.name, p2.name, "venus") },
    { symbol: "♂️", name: "Mars", score: deriveScore(s.physical, p1.name, p2.name, "mars") },
    { symbol: "☿", name: "Mercury", score: deriveScore(s.emotional, p1.name, p2.name, "merc") },
    { symbol: "♃", name: "Jupiter", score: deriveScore(s.spiritual, p1.name, p2.name, "jup") },
    { symbol: "♄", name: "Saturn", score: deriveScore(s.marriage, p1.name, p2.name, "sat") },
  ];

  const TL = [
    { phase: "First Attraction", desc: report.timeline?.attraction, c: "#7b2fff" },
    { phase: "Connection Phase", desc: report.timeline?.connection, c: "#ff2d78" },
    { phase: "Relationship Growth", desc: report.timeline?.growth, c: "#f5c842" },
    { phase: "Commitment Phase", desc: report.timeline?.commitment, c: "#00e5ff" },
    { phase: "Marriage Potential", desc: report.timeline?.marriage, c: "#7b2fff" },
    { phase: "Long-Term Stability", desc: report.timeline?.stability, c: "#ff2d78" },
  ];

  return (
    <div className="results">
      <div className="couple-header">
        <div className="couple-names">{p1.name} ✦ {p2.name}</div>
        <div className="couple-sub">Universe Compatibility Analysis · {p1.zodiac} & {p2.zodiac}</div>
      </div>

      {/* Overall Score */}
      <div className="score-hero">
        <ScoreCircle score={s.overall} tag="Overall Compatibility" />
      </div>

      {/* Love */}
      <div className="section-head">❤️ Love Compatibility</div>
      <div className="cards-grid">
        <div className="compat-card">
          <div className="card-head">
            <span className="card-emoji">💕</span>
            <span className="card-name">Love Score</span>
            <span className="card-score-num">{s.love}%</span>
          </div>
          <ProgBar value={s.love} color="linear-gradient(to right,#ff2d78,#f5c842)" />
          <div className="sub-metrics" style={{ marginTop: 12 }}>
            <SubMetric label="Emotional Bond" value={deriveScore(s.love, p1.name, p2.name, "bond")} color="#ff2d78" />
            <SubMetric label="Romantic Spark" value={deriveScore(s.love, p1.name, p2.name, "spark")} color="#f5c842" />
            <SubMetric label="Soulmate Potential" value={deriveScore(s.love, p1.name, p2.name, "soul")} color="#7b2fff" />
          </div>
          {report.loveInsight && <div className="insight-box"><div className="insight-label">AI Insight</div>{report.loveInsight}</div>}
        </div>

        <div className="compat-card">
          <div className="card-head">
            <span className="card-emoji">🧠</span>
            <span className="card-name">Emotional Compatibility</span>
            <span className="card-score-num">{s.emotional}%</span>
          </div>
          <ProgBar value={s.emotional} color="linear-gradient(to right,#7b2fff,#00e5ff)" />
          <div className="sub-metrics" style={{ marginTop: 12 }}>
            <SubMetric label="Understanding" value={deriveScore(s.emotional, p1.name, p2.name, "und")} color="#00e5ff" />
            <SubMetric label="Trust" value={deriveScore(s.emotional, p1.name, p2.name, "trust")} color="#7b2fff" />
            <SubMetric label="Communication" value={deriveScore(s.emotional, p1.name, p2.name, "comm")} color="#ff2d78" />
            <SubMetric label="Loyalty" value={deriveScore(s.emotional, p1.name, p2.name, "loyal")} color="#f5c842" />
          </div>
        </div>

        <div className="compat-card">
          <div className="card-head">
            <span className="card-emoji">🔥</span>
            <span className="card-name">Physical Attraction</span>
            <span className="card-score-num">{s.physical}%</span>
          </div>
          <ProgBar value={s.physical} color="linear-gradient(to right,#ff6b35,#ff2d78)" />
          <div className="sub-metrics" style={{ marginTop: 12 }}>
            <SubMetric label="Chemistry" value={deriveScore(s.physical, p1.name, p2.name, "chem")} color="#ff6b35" />
            <SubMetric label="Passion Index" value={deriveScore(s.physical, p1.name, p2.name, "pass")} color="#ff2d78" />
            <SubMetric label="Attraction Score" value={deriveScore(s.physical, p1.name, p2.name, "attr")} color="#f5c842" />
          </div>
        </div>
      </div>

      {/* Friendship + Marriage */}
      <div className="section-head">🤝 Friendship & Commitment</div>
      <div className="cards-grid">
        <div className="compat-card">
          <div className="card-head">
            <span className="card-emoji">🤝</span>
            <span className="card-name">Friendship Score</span>
            <span className="card-score-num">{s.friendship}%</span>
          </div>
          <ProgBar value={s.friendship} color="linear-gradient(to right,#00e5ff,#7b2fff)" />
          <div className="sub-metrics" style={{ marginTop: 12 }}>
            <SubMetric label="Support Level" value={deriveScore(s.friendship, p1.name, p2.name, "sup")} color="#00e5ff" />
            <SubMetric label="Long-Term Bond" value={deriveScore(s.friendship, p1.name, p2.name, "ltb")} color="#7b2fff" />
            <SubMetric label="Teamwork" value={deriveScore(s.friendship, p1.name, p2.name, "team")} color="#ff2d78" />
          </div>
        </div>

        <div className="compat-card">
          <div className="card-head">
            <span className="card-emoji">💍</span>
            <span className="card-name">Marriage Potential</span>
            <span className="card-score-num">{s.marriage}%</span>
          </div>
          <ProgBar value={s.marriage} color="linear-gradient(to right,#f5c842,#ff2d78)" />
          <div className="sub-metrics" style={{ marginTop: 12 }}>
            <SubMetric label="Marriage Readiness" value={deriveScore(s.marriage, p1.name, p2.name, "mrd")} color="#f5c842" />
            <SubMetric label="Commitment Score" value={deriveScore(s.marriage, p1.name, p2.name, "com")} color="#ff2d78" />
            <SubMetric label="Stability" value={deriveScore(s.marriage, p1.name, p2.name, "stab")} color="#7b2fff" />
          </div>
          {report.marriageWindow && (
            <div className="insight-box">
              <div className="insight-label">Most Favorable Period</div>
              {report.marriageWindow}
            </div>
          )}
        </div>

        <div className="compat-card">
          <div className="card-head">
            <span className="card-emoji">💰</span>
            <span className="card-name">Financial Compatibility</span>
            <span className="card-score-num">{s.financial}%</span>
          </div>
          <ProgBar value={s.financial} color="linear-gradient(to right,#2ecc71,#f5c842)" />
          <div className="sub-metrics" style={{ marginTop: 12 }}>
            <SubMetric label="Wealth Building" value={deriveScore(s.financial, p1.name, p2.name, "wb")} color="#2ecc71" />
            <SubMetric label="Money Management" value={deriveScore(s.financial, p1.name, p2.name, "mm")} color="#f5c842" />
            <SubMetric label="Spending Style" value={deriveScore(s.financial, p1.name, p2.name, "sp")} color="#00e5ff" />
          </div>
        </div>
      </div>

      {/* Family + Spiritual */}
      <div className="section-head">🏠 Family & Spiritual</div>
      <div className="cards-grid">
        <div className="compat-card">
          <div className="card-head">
            <span className="card-emoji">🏠</span>
            <span className="card-name">Family Harmony</span>
            <span className="card-score-num">{s.family}%</span>
          </div>
          <ProgBar value={s.family} color="linear-gradient(to right,#e67e22,#f5c842)" />
          <div className="sub-metrics" style={{ marginTop: 12 }}>
            <SubMetric label="Domestic Harmony" value={deriveScore(s.family, p1.name, p2.name, "dh")} color="#e67e22" />
            <SubMetric label="Family Acceptance" value={deriveScore(s.family, p1.name, p2.name, "fa")} color="#f5c842" />
            <SubMetric label="Parenting Energy" value={deriveScore(s.family, p1.name, p2.name, "pe")} color="#ff2d78" />
          </div>
        </div>
        <div className="compat-card">
          <div className="card-head">
            <span className="card-emoji">👶</span>
            <span className="card-name">Future Family Energy</span>
            <span className="card-score-num">{deriveScore(s.family, p1.name, p2.name, "ffe")}%</span>
          </div>
          <ProgBar value={deriveScore(s.family, p1.name, p2.name, "ffe")} color="linear-gradient(to right,#ff2d78,#f5c842)" />
          <div className="sub-metrics" style={{ marginTop: 12 }}>
            <SubMetric label="Family Growth" value={deriveScore(s.family, p1.name, p2.name, "fg")} color="#f5c842" />
            <SubMetric label="Nurturing Potential" value={deriveScore(s.family, p1.name, p2.name, "np")} color="#ff2d78" />
            <SubMetric label="Child Compatibility" value={deriveScore(s.family, p1.name, p2.name, "cc")} color="#7b2fff" />
          </div>
          <div className="insight-box" style={{ fontSize: 13 }}>
            <div className="insight-label">Note</div>
            These are astrology-based compatibility indicators, not guarantees of future outcomes.
          </div>
        </div>
        <div className="compat-card">
          <div className="card-head">
            <span className="card-emoji">🌙</span>
            <span className="card-name">Spiritual Connection</span>
            <span className="card-score-num">{s.spiritual}%</span>
          </div>
          <ProgBar value={s.spiritual} color="linear-gradient(to right,#7b2fff,#00e5ff)" />
          <div className="sub-metrics" style={{ marginTop: 12 }}>
            <SubMetric label="Karma Connection" value={deriveScore(s.spiritual, p1.name, p2.name, "karma")} color="#7b2fff" />
            <SubMetric label="Soul Bond" value={deriveScore(s.spiritual, p1.name, p2.name, "soul2")} color="#00e5ff" />
            <SubMetric label="Past Life Indicators" value={deriveScore(s.spiritual, p1.name, p2.name, "past")} color="#ff2d78" />
            <SubMetric label="Destiny Connection" value={deriveScore(s.spiritual, p1.name, p2.name, "dest")} color="#f5c842" />
          </div>
        </div>
      </div>

      {/* Planets */}
      <div className="section-head">🪐 Planetary Analysis</div>
      <div className="planet-row">
        {PLANETS.map(pl => (
          <div key={pl.name} className="planet-item">
            <div className="planet-symbol">{pl.symbol}</div>
            <div className="planet-name">{pl.name}</div>
            <div className="planet-score">{pl.score}%</div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="section-head">📅 Relationship Timeline</div>
      <div className="timeline">
        {TL.map((t, i) => (
          <div key={i} className="tl-item">
            <div className="tl-dot" style={{ "--dot-c": t.c }} />
            <div className="tl-phase" style={{ color: t.c }}>{t.phase}</div>
            <div className="tl-desc">{t.desc || "Cosmic energies align for this phase of your journey."}</div>
          </div>
        ))}
      </div>

      {/* Flags */}
      <div className="section-head">🚩 Compatibility Indicators</div>
      <div className="flags-grid">
        <div className="flags-col">
          <div className="flags-col-title" style={{ color: "#2ecc71" }}>✅ Green Flags</div>
          {(report.greenFlags || []).map((f, i) => (
            <div key={i} className="flag-item"><span className="flag-icon">✅</span>{f}</div>
          ))}
        </div>
        <div className="flags-col">
          <div className="flags-col-title" style={{ color: "#ff6b35" }}>⚠️ Areas to Navigate</div>
          {(report.redFlags || []).map((f, i) => (
            <div key={i} className="flag-item"><span className="flag-icon">⚠️</span>{f}</div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="section-head">🤖 AI Relationship Insights</div>
      <div className="ai-insights-grid">
        {(report.aiInsights || []).map((ins, i) => (
          <div key={i} className="ai-card">
            <div className="ai-card-title">{ins.title}</div>
            <div className="ai-card-text">{ins.text}</div>
          </div>
        ))}
      </div>

      <button className="reset-btn" onClick={onReset}>✦ New Reading</button>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
const empty = () => ({ name: "", day: "", month: "", year: "", hour: "", min: "", ampm: "AM", place: null });

export default function App() {
  const [p1, setP1] = useState(empty());
  const [p2, setP2] = useState(empty());
  const [phase, setPhase] = useState("form"); // form | loading | results
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  const compute = useCallback(async () => {
    setError("");
    if (!p1.name || !p2.name || !p1.day || !p1.month || !p1.year || !p2.day || !p2.month || !p2.year) {
      setError("Please fill in the required fields (Name & Date of Birth) for both persons.");
      return;
    }

    setPhase("loading");

    // Derive zodiac & life path
    const z1 = getZodiac(+p1.day, +p1.month);
    const z2 = getZodiac(+p2.day, +p2.month);
    const dob1 = `${p1.year}-${String(p1.month).padStart(2,"0")}-${String(p1.day).padStart(2,"0")}`;
    const dob2 = `${p2.year}-${String(p2.month).padStart(2,"0")}-${String(p2.day).padStart(2,"0")}`;
    const lp1 = getLifePath(dob1);
    const lp2 = getLifePath(dob2);

    // Deterministic base scores from names + DOB
    const seed = p1.name + p2.name + dob1 + dob2;
    const hash = seed.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0xffff, 0);
    const base = 60 + (hash % 35);
    const scores = {
      overall:    Math.min(99, base + 5),
      love:       deriveScore(base, p1.name, p2.name, "love"),
      emotional:  deriveScore(base, p1.name, p2.name, "emo"),
      physical:   deriveScore(base, p1.name, p2.name, "phys"),
      friendship: deriveScore(base, p1.name, p2.name, "fri"),
      marriage:   deriveScore(base, p1.name, p2.name, "mar"),
      financial:  deriveScore(base, p1.name, p2.name, "fin"),
      family:     deriveScore(base, p1.name, p2.name, "fam"),
      spiritual:  deriveScore(base, p1.name, p2.name, "spi"),
    };

    // Try AI via backend
    let aiData = null;
    try {
      aiData = await fetchCompatibilityReport(
        { name: p1.name, dob: dob1, zodiac: z1, lifePath: lp1, place: p1.place?.city },
        { name: p2.name, dob: dob2, zodiac: z2, lifePath: lp2, place: p2.place?.city },
        scores
      );
    } catch (e) {
      console.warn("AI backend error — using fallback:", e);
    }

    // Fallback static data
    const fallback = {
      loveInsight: `${p1.name} and ${p2.name} share a profound emotional resonance rooted in their ${z1}–${z2} cosmic alignment. Their life path numbers ${lp1} and ${lp2} create a complementary energetic balance.`,
      marriageWindow: `${2027 + (hash % 5)} – ${2029 + (hash % 5)}`,
      greenFlags: ["Strong emotional connection and mutual understanding","Complementary zodiac energies create natural harmony","Shared life path resonance supports long-term growth","Deep spiritual alignment and karmic connection","High marriage potential with stable long-term outlook"],
      redFlags: ["Occasional communication style differences to navigate","Financial planning approaches may need alignment","Personal space and independence balance requires attention"],
      timeline: {
        attraction: "Initial cosmic attraction is powerful and immediate, drawing these souls together.",
        connection: "Emotional bonds deepen as shared values and dreams align beautifully.",
        growth: "The relationship blossoms through mutual support and spiritual growth.",
        commitment: "A natural progression toward deeper commitment feels destined.",
        marriage: `Marriage energy peaks around ${2027 + (hash % 5)}, supported by favorable planetary alignments.`,
        stability: "Long-term cosmic compatibility ensures enduring happiness and harmony.",
      },
      aiInsights: [
        { title: "Relationship Strengths", text: `${p1.name} and ${p2.name} possess remarkable compatibility rooted in their ${z1} and ${z2} synergy. Their combined life path numbers ${lp1} and ${lp2} create a relationship that balances ambition with emotional depth.` },
        { title: "Communication Style", text: "Your communication is naturally intuitive, often understanding each other without words. Building clear channels for expressing needs will transform this connection from good to extraordinary." },
        { title: "Love Languages", text: `${p1.name} expresses love through thoughtful gestures and quality time, while ${p2.name}'s love language centers around words of affirmation and deep emotional sharing.` },
        { title: "Growth Opportunities", text: "Together you inspire each other's highest potential. Embrace your differences as cosmic teachers rather than obstacles, and watch your relationship evolve beautifully." },
        { title: "Conflict Resolution", text: "When tensions arise, return to your core emotional connection. Both partners benefit from taking reflective pauses before discussing sensitive topics, honoring each other's processing styles." },
        { title: "Long-Term Vision", text: "The stars indicate a relationship built for the long journey. Your combined energies create a stable, loving foundation that grows stronger with each passing year." },
      ],
    };

    const finalReport = {
      scores,
      ...(aiData || fallback),
    };

    // Simulate minimum loading time
    await new Promise(r => setTimeout(r, 5600));
    setP1(prev => ({ ...prev, zodiac: z1, lifePath: lp1 }));
    setP2(prev => ({ ...prev, zodiac: z2, lifePath: lp2 }));
    setReport(finalReport);
    setPhase("results");
  }, [p1, p2]);

  return (
    <div className="universe-app">
      {/* Fixed background */}
      <Starfield />
      <div className="nebula-blob" style={{ width: 600, height: 600, top: "-200px", left: "-200px", background: "radial-gradient(circle, rgba(123,47,255,0.15), transparent 70%)", animationDuration: "18s" }} />
      <div className="nebula-blob" style={{ width: 500, height: 500, bottom: "10%", right: "-150px", background: "radial-gradient(circle, rgba(255,45,120,0.12), transparent 70%)", animationDuration: "22s", animationDelay: "3s" }} />
      <div className="nebula-blob" style={{ width: 400, height: 400, top: "40%", left: "30%", background: "radial-gradient(circle, rgba(0,229,255,0.07), transparent 70%)", animationDuration: "25s", animationDelay: "6s" }} />

      {phase === "loading" && <LoadingScreen />}

      <div className="content" style={{ display: phase === "loading" ? "none" : "block" }}>
        {phase === "form" && (
          <>
            <div className="header">
              <div className="header-tag">✦ Universe Relationship Analyzer ✦</div>
              <h1>Cosmic Compatibility<br />Oracle</h1>
              <p>Let the universe reveal the truth of your connection</p>
            </div>

            <div className="form-container">
              {error && <div className="error-box">⚠ {error}</div>}
              <div className="persons-grid">
                <PersonForm title="The Divine Masculine" icon="♂" grad="linear-gradient(135deg,#7b2fff,#00e5ff)" data={p1} onChange={setP1} />
                <PersonForm title="The Divine Feminine" icon="♀" grad="linear-gradient(135deg,#ff2d78,#f5c842)" data={p2} onChange={setP2} />
              </div>
              <button className="submit-btn" onClick={compute}>
                ✦ Reveal Cosmic Compatibility ✦
              </button>
            </div>
          </>
        )}

        {phase === "results" && report && (
          <Results p1={p1} p2={p2} report={report} onReset={() => { setPhase("form"); setReport(null); setP1(empty()); setP2(empty()); }} />
        )}
      </div>
    </div>
  );
}