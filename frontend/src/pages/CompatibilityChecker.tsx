// import { useState, useEffect, useRef, useCallback } from "react";
// import { useBackOverride } from "../context/NavigationContext";

// const fontLink = document.createElement("link");
// fontLink.rel = "stylesheet";
// fontLink.href = "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Space+Mono:wght@400;700&display=swap";
// document.head.appendChild(fontLink);

// const css = `
//   :root {
//     --void: #03010a;
//     --deep: #07030f;
//     --nebula: #0d0520;
//     --aurora-1: #BC6A4D;
//     --aurora-2: #BC6A4D;
//     --aurora-3: #BC6A4D;
//     --gold: #BC6A4D;
//     --stardust: rgba(255,255,255,0.07);
//     --glass: rgba(255,255,255,0.05);
//     --glass-border: rgba(255,255,255,0.12);
//     --font-display: 'Astra','Iceland',sans-serif;
//     --font-body: 'Astra','Iceland',sans-serif;
//     --font-mono: 'Astra','Iceland',sans-serif;
//   }
//   * { box-sizing: border-box; margin: 0; padding: 0; }
//   .universe-app {
//     min-height: 100vh; background: var(--void); color: #e8e0f0;
//     font-family: var(--font-body); font-size: 18px; overflow-x: hidden; position: relative;
//   }
//   .starfield { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
//   .star { position: absolute; border-radius: 50%; background: white; animation: twinkle var(--d,3s) ease-in-out infinite; animation-delay: var(--delay,0s); opacity: var(--op,0.6); }
//   @keyframes twinkle { 0%,100%{opacity:var(--op,0.6);transform:scale(1);}50%{opacity:0.1;transform:scale(0.5);} }
//   .nebula-blob { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; animation: drift 20s ease-in-out infinite alternate; }
//   @keyframes drift { from{transform:translate(0,0) scale(1);}to{transform:translate(40px,30px) scale(1.1);} }
//   .content { position: relative; z-index: 1; }
//   .header { text-align: center; padding: 60px 20px 40px; }
//   .header-tag { font-family: var(--font-mono); font-size: 11px; letter-spacing: 6px; color: var(--aurora-3); text-transform: uppercase; margin-bottom: 16px; opacity: 0.8; }
//   .header h1 { font-family: var(--font-display); font-size: clamp(22px,4vw,44px); font-weight: 900; background: linear-gradient(135deg,var(--gold) 0%,var(--aurora-2) 40%,var(--aurora-1) 80%,var(--aurora-3) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1.2; margin-bottom: 12px; }
//   .header p { color: rgba(255,255,255,0.72); font-size: 17px; font-style: italic; letter-spacing: 0.5px; }
//   .form-container { max-width: 900px; margin: 0 auto; padding: 0 20px 60px; }
//   .persons-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
//   @media(max-width:680px){.persons-grid{grid-template-columns:1fr;}}
//   .person-card { background: var(--glass); border: 1px solid var(--glass-border); border-radius: 20px; padding: 28px 24px; backdrop-filter: blur(16px); position: relative; overflow: hidden; transition: border-color 0.3s, box-shadow 0.3s; }
//   .person-card::before { content:''; position:absolute; inset:0; background:var(--grad); opacity:0.04; pointer-events:none; }
//   .person-card:hover { border-color: rgba(255,255,255,0.22); box-shadow: 0 0 40px rgba(188,106,77,0.15); }
//   .card-title { font-family: var(--font-display); font-size: 13px; letter-spacing: 2px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
//   .card-icon { font-size: 20px; }
//   .field { margin-bottom: 16px; }
//   .field label { font-family: var(--font-mono); font-size: 10px; letter-spacing: 3px; color: rgba(255,255,255,0.75); text-transform: uppercase; display: block; margin-bottom: 6px; }
//   .field input,.field select { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:11px 14px; color:#e8e0f0; font-family:var(--font-body); font-size:16px; outline:none; transition:border 0.3s,box-shadow 0.3s; -webkit-appearance:none; }
//   .field input:focus,.field select:focus { border-color:var(--aurora-1); box-shadow:0 0 0 3px rgba(188,106,77,0.15); }
//   .field input::placeholder { color:rgba(232,224,240,0.25); }
//   .field select option { background:#1a0a2e; }
//   .date-row { display:grid; grid-template-columns:2fr 2fr 3fr; gap:8px; }
//   .time-row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; }
//   .place-wrap { position:relative; }
//   .place-dropdown { position:absolute; top:calc(100% + 6px); left:0; right:0; background:#1a0a2e; border:1px solid rgba(188,106,77,0.4); border-radius:10px; z-index:100; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.6); }
//   .place-item { padding:10px 14px; cursor:pointer; font-size:15px; color:rgba(255,255,255,0.9); transition:background 0.2s; border-bottom:1px solid rgba(255,255,255,0.05); }
//   .place-item:hover { background:rgba(188,106,77,0.2); }
//   .place-item small { display:block; font-size:12px; color:rgba(255,255,255,0.5); margin-top:2px; font-family:var(--font-mono); }
//   .submit-btn { display:block; width:100%; max-width:400px; margin:0 auto; padding:18px 40px; background:linear-gradient(135deg,var(--aurora-1),var(--aurora-2)); border:none; border-radius:50px; color:white; font-family:var(--font-display); font-size:14px; letter-spacing:2px; cursor:pointer; position:relative; overflow:hidden; transition:transform 0.2s,box-shadow 0.3s; text-transform:uppercase; }
//   .submit-btn:hover { transform:translateY(-2px); box-shadow:0 20px 60px rgba(188,106,77,0.4); }
//   .submit-btn:active { transform:translateY(0); }
//   .submit-btn:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
//   .loading-screen { position:fixed; inset:0; background:var(--void); z-index:200; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:32px; }
//   .loading-cosmos { width:180px; height:180px; position:relative; }
//   .orbit-ring { position:absolute; border-radius:50%; border:1px solid transparent; animation:orbit-spin linear infinite; }
//   .orbit-ring:nth-child(1){inset:0;border-color:rgba(188,106,77,0.5);animation-duration:4s;}
//   .orbit-ring:nth-child(2){inset:20px;border-color:rgba(188,106,77,0.5);animation-duration:3s;animation-direction:reverse;}
//   .orbit-ring:nth-child(3){inset:40px;border-color:rgba(188,106,77,0.5);animation-duration:5s;}
//   .orbit-dot { position:absolute; width:8px; height:8px; border-radius:50%; top:-4px; left:50%; transform:translateX(-50%); }
//   @keyframes orbit-spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
//   .orbit-center { position:absolute; inset:60px; border-radius:50%; background:radial-gradient(circle,var(--aurora-1),var(--aurora-2)); display:flex; align-items:center; justify-content:center; font-size:24px; animation:pulse-glow 2s ease-in-out infinite; }
//   @keyframes pulse-glow{0%,100%{box-shadow:0 0 20px rgba(188,106,77,0.5);}50%{box-shadow:0 0 60px rgba(188,106,77,0.8),0 0 100px rgba(188,106,77,0.4);}}
//   .loading-steps { display:flex; flex-direction:column; gap:10px; text-align:center; }
//   .loading-step { font-family:var(--font-mono); font-size:12px; letter-spacing:2px; color:rgba(255,255,255,0.65); transition:color 0.5s,opacity 0.5s; display:flex; align-items:center; gap:10px; justify-content:center; }
//   .loading-step.active { color:var(--aurora-3); text-shadow:0 0 20px var(--aurora-3); }
//   .loading-step.done { color:var(--gold); }
//   .step-dot { width:6px; height:6px; border-radius:50%; background:currentColor; flex-shrink:0; }
//   .results { max-width: 1000px; margin: 0 auto; padding: 20px 20px 80px; }

//   /* ── COUPLE HEADER — LARGE VISIBLE NAMES ── */
//   .couple-header { text-align:center; padding:50px 20px 44px; }
//   .couple-names {
//     font-family: var(--font-display);
//     font-size: clamp(16px, 3.5vw, 48px);
//     background: linear-gradient(135deg,var(--gold) 0%,var(--aurora-2) 45%,var(--aurora-1) 80%,var(--aurora-3) 100%);
//     -webkit-background-clip: text;
//     -webkit-text-fill-color: transparent;
//     background-clip: text;
//     margin-bottom: 16px;
//     display: block;
//     filter: drop-shadow(0 0 28px rgba(188,106,77,0.5));
//     line-height: 1.3;
//     white-space: nowrap;
//     overflow: hidden;
//     text-overflow: ellipsis;
//     max-width: 100%;
//   }
//   .couple-sub { font-family:var(--font-mono); font-size:12px; letter-spacing:4px; color:rgba(255,255,255,0.65); text-transform:uppercase; display:block; }

//   /* ── SCORE CIRCLE ── */
//   .score-hero { display:flex; justify-content:center; margin-bottom:48px; }
//   .score-circle-wrap { text-align:center; }
//   .score-circle { width:200px; height:200px; display:grid; place-items:center; margin:0 auto 16px; position:relative; }
//   .score-svg { width:200px; height:200px; transform:rotate(-90deg); position:absolute; top:0; left:0; }
//   .score-track { fill:none; stroke:rgba(255,255,255,0.08); stroke-width:10; }
//   .score-fill { fill:none; stroke-width:10; stroke-linecap:round; stroke:url(#scoreGrad); }
//   .score-inner { display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; z-index:10; }
//   .score-num { font-family:var(--font-display); font-size:54px; font-weight:900; color:#BC6A4D; line-height:1; display:block; text-shadow:0 0 32px rgba(188,106,77,0.7); }
//   .score-pct { font-family:var(--font-mono); font-size:18px; color:rgba(255,255,255,0.82); margin-top:4px; display:block; }
//   .score-label { font-family:var(--font-display); font-size:15px; letter-spacing:2px; color:var(--gold); margin-bottom:4px; }
//   .score-tag { font-family:var(--font-mono); font-size:11px; letter-spacing:3px; color:rgba(255,255,255,0.5); text-transform:uppercase; }
//   .section-head { font-family:var(--font-display); font-size:13px; letter-spacing:3px; color:var(--aurora-3); text-transform:uppercase; margin-bottom:20px; display:flex; align-items:center; gap:12px; }
//   .section-head::after { content:''; flex:1; height:1px; background:linear-gradient(to right,rgba(188,106,77,0.3),transparent); }
//   .cards-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; margin-bottom:40px; }

//   /* ── COMPAT CARD — HOVER GLOW ── */
//   .compat-card {
//     background: var(--glass);
//     border: 1px solid var(--glass-border);
//     border-radius: 16px;
//     padding: 20px;
//     backdrop-filter: blur(12px);
//     transition: transform 0.32s ease, border-color 0.32s ease, box-shadow 0.32s ease;
//     position: relative;
//     overflow: hidden;
//     cursor: pointer;
//   }
//   .compat-card::after {
//     content: "";
//     position: absolute;
//     inset: 0;
//     opacity: 0;
//     transition: opacity 0.35s ease;
//     z-index: 0;
//     pointer-events: none;
//     border-radius: 16px;
//     background: var(--hov, linear-gradient(135deg,rgba(188,106,77,.2),rgba(188,106,77,.14)));
//   }
//   .compat-card:hover::after { opacity: 1; }
//   .compat-card:hover {
//     transform: translateY(-8px) scale(1.025);
//     border-color: rgba(255,255,255,0.4);
//     box-shadow: 0 24px 70px var(--hov-shadow, rgba(188,106,77,.45)), 0 0 50px rgba(188,106,77,.2);
//   }
//   .compat-card > * { position: relative; z-index: 1; }

//   .card-head { display:flex; align-items:center; gap:10px; margin-bottom:14px; }
//   .card-emoji { font-size:22px; }
//   .card-name { font-family:var(--font-display); font-size:12px; letter-spacing:1px; color:rgba(255,255,255,0.95); flex:1; }
//   .card-score-num { font-family:var(--font-mono); font-size:18px; font-weight:700; color:var(--gold); }
//   .prog-bar { height:6px; background:rgba(255,255,255,0.08); border-radius:3px; overflow:hidden; margin-bottom:8px; }
//   .prog-fill { height:100%; border-radius:3px; background:var(--bar-color,linear-gradient(to right,var(--aurora-1),var(--aurora-2))); transition:width 1.5s cubic-bezier(0.4,0,0.2,1); width:0; }
//   .prog-fill.animate { width:var(--target-width,0%); }
//   .prog-label { display:flex; justify-content:space-between; font-family:var(--font-mono); font-size:10px; color:rgba(255,255,255,0.55); letter-spacing:1px; }
//   .sub-metrics { display:flex; flex-direction:column; gap:10px; }
//   .sub-metric-row { display:flex; align-items:center; gap:10px; }
//   .sub-metric-label { font-size:13px; color:rgba(255,255,255,0.88); width:130px; flex-shrink:0; font-style:italic; }
//   .sub-metric-bar { flex:1; height:4px; background:rgba(255,255,255,0.07); border-radius:2px; overflow:hidden; }
//   .sub-metric-fill { height:100%; border-radius:2px; background:var(--fill-c,var(--aurora-3)); transition:width 1.8s cubic-bezier(0.4,0,0.2,1); width:0; }
//   .sub-metric-fill.animate { width:var(--w,0%); }
//   .sub-metric-val { font-family:var(--font-mono); font-size:11px; color:var(--fill-c,var(--aurora-3)); width:32px; text-align:right; }
//   .insight-box { background:rgba(188,106,77,0.08); border:1px solid rgba(188,106,77,0.25); border-radius:12px; padding:14px 16px; margin-top:12px; font-size:14px; font-style:italic; color:rgba(255,255,255,0.82); line-height:1.6; }
//   .insight-label { font-family:var(--font-mono); font-size:9px; letter-spacing:3px; color:var(--aurora-1); text-transform:uppercase; margin-bottom:6px; }
//   .planet-row { display:grid; grid-template-columns:repeat(auto-fill,minmax(100px,1fr)); gap:12px; margin-bottom:40px; }
//   .planet-item { background:var(--glass); border:1px solid var(--glass-border); border-radius:14px; padding:14px 10px; text-align:center; backdrop-filter:blur(8px); transition:transform 0.2s; }
//   .planet-item:hover { transform:translateY(-4px); }
//   .planet-symbol { font-size:28px; margin-bottom:6px; }
//   .planet-name { font-family:var(--font-mono); font-size:9px; letter-spacing:2px; color:rgba(255,255,255,0.75); text-transform:uppercase; margin-bottom:6px; }
//   .planet-score { font-family:var(--font-display); font-size:16px; color:var(--gold); }
//   .timeline { position:relative; padding:20px 0 20px 30px; margin-bottom:40px; }
//   .timeline::before { content:''; position:absolute; left:8px; top:0; bottom:0; width:2px; background:linear-gradient(to bottom,var(--aurora-1),var(--aurora-2),var(--aurora-3)); }
//   .tl-item { position:relative; margin-bottom:20px; padding-left:20px; }
//   .tl-dot { position:absolute; left:-26px; top:6px; width:12px; height:12px; border-radius:50%; background:var(--dot-c,var(--aurora-1)); border:2px solid var(--void); box-shadow:0 0 12px var(--dot-c,var(--aurora-1)); }
//   .tl-phase { font-family:var(--font-mono); font-size:10px; letter-spacing:2px; color:var(--dot-c,var(--aurora-1)); text-transform:uppercase; margin-bottom:3px; }
//   .tl-desc { font-size:14px; color:rgba(255,255,255,0.82); font-style:italic; }
//   .flags-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:40px; }
//   @media(max-width:600px){.flags-grid{grid-template-columns:1fr;}}
//   .flags-col { background:var(--glass); border:1px solid var(--glass-border); border-radius:16px; padding:20px; }
//   .flags-col-title { font-family:var(--font-mono); font-size:10px; letter-spacing:3px; text-transform:uppercase; margin-bottom:14px; }
//   .flag-item { display:flex; align-items:flex-start; gap:10px; margin-bottom:10px; font-size:14px; color:rgba(255,255,255,0.85); font-style:italic; }
//   .flag-icon { flex-shrink:0; font-size:16px; }
//   .ai-insights-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:14px; margin-bottom:40px; }
//   .ai-card { background:linear-gradient(135deg,rgba(188,106,77,0.08),rgba(188,106,77,0.05)); border:1px solid rgba(188,106,77,0.2); border-radius:14px; padding:18px; }
//   .ai-card-title { font-family:var(--font-mono); font-size:10px; letter-spacing:3px; color:var(--aurora-1); text-transform:uppercase; margin-bottom:10px; }
//   .ai-card-text { font-size:15px; color:rgba(255,255,255,0.85); line-height:1.65; font-style:italic; }
//   .reset-btn { display:block; margin:0 auto; padding:14px 40px; background:transparent; border:1px solid rgba(255,255,255,0.2); border-radius:50px; color:rgba(255,255,255,0.75); font-family:var(--font-mono); font-size:11px; letter-spacing:3px; text-transform:uppercase; cursor:pointer; transition:all 0.3s; }
//   .reset-btn:hover { border-color:var(--aurora-1); color:var(--aurora-3); box-shadow:0 0 30px rgba(188,106,77,0.2); }
//   .error-box { background:rgba(188,106,77,0.1); border:1px solid rgba(188,106,77,0.3); border-radius:12px; padding:14px 18px; color:#ff8ab0; font-family:var(--font-mono); font-size:12px; letter-spacing:1px; margin-bottom:20px; text-align:center; }
//   ::-webkit-scrollbar { width:6px; }
//   ::-webkit-scrollbar-track { background:var(--void); }
//   ::-webkit-scrollbar-thumb { background:rgba(188,106,77,0.4); border-radius:3px; }

//   /* ── WHO LOVES MORE ── */
//   .wlm-wrap { margin-bottom: 40px; }
//   .wlm-card {
//     background: linear-gradient(135deg, rgba(188,106,77,.07), rgba(188,106,77,.07));
//     border: 1px solid rgba(188,106,77,.25);
//     border-radius: 20px;
//     padding: 28px 24px;
//     position: relative;
//     overflow: hidden;
//   }
//   .wlm-card::before {
//     content: "♥";
//     position: absolute;
//     right: 24px; top: 16px;
//     font-size: 80px;
//     color: rgba(188,106,77,.06);
//     line-height: 1;
//   }
//   .wlm-disclaimer {
//     font-family: var(--font-mono);
//     font-size: 9px;
//     letter-spacing: 2px;
//     color: rgba(255,255,255,.35);
//     text-transform: uppercase;
//     margin-bottom: 20px;
//     text-align: center;
//   }
//   .wlm-persons { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
//   @media(max-width:560px){ .wlm-persons { grid-template-columns: 1fr; } }
//   .wlm-person { text-align: center; }
//   .wlm-person-name {
//     font-family: var(--font-display);
//     font-size: 14px;
//     letter-spacing: 1px;
//     margin-bottom: 14px;
//     white-space: nowrap;
//     overflow: hidden;
//     text-overflow: ellipsis;
//   }
//   .wlm-ring-wrap {
//     width: 130px;
//     height: 130px;
//     position: relative;
//     margin: 0 auto 14px;
//   }
//   .wlm-ring-svg { width: 130px; height: 130px; transform: rotate(-90deg); position: absolute; top:0; left:0; }
//   .wlm-ring-bg { fill: none; stroke: rgba(255,255,255,.07); stroke-width: 10; }
//   .wlm-ring-fg { fill: none; stroke-width: 10; stroke-linecap: round; transition: stroke-dashoffset 1.8s cubic-bezier(.4,0,.2,1); }
//   .wlm-ring-inner {
//     position: absolute; inset: 0;
//     display: flex; flex-direction: column;
//     align-items: center; justify-content: center;
//     gap: 0;
//   }
//   .wlm-pct-num {
//     font-family: var(--font-display);
//     font-size: 30px;
//     font-weight: 900;
//     line-height: 1;
//   }
//   .wlm-pct-sym { font-size: 14px; color: rgba(255,255,255,.6); font-family: var(--font-mono); margin-top: 2px; }
//   .wlm-label {
//     font-family: var(--font-mono);
//     font-size: 10px;
//     letter-spacing: 2px;
//     text-transform: uppercase;
//     color: rgba(255,255,255,.5);
//     margin-bottom: 6px;
//   }
//   .wlm-bar-wrap { height: 6px; background: rgba(255,255,255,.08); border-radius: 3px; overflow: hidden; margin-bottom: 6px; }
//   .wlm-bar-fill { height: 100%; border-radius: 3px; transition: width 1.8s cubic-bezier(.4,0,.2,1); width: 0; }
//   .wlm-bar-fill.animate { width: var(--w, 0%); }
//   .wlm-intensity-label {
//     font-size: 12px;
//     font-style: italic;
//     color: rgba(255,255,255,.55);
//     font-family: var(--font-body);
//     margin-top: 4px;
//   }
//   .wlm-vs {
//     position: relative;
//     height: 6px;
//     background: rgba(255,255,255,.06);
//     border-radius: 3px;
//     overflow: hidden;
//     margin: 8px 0 20px;
//   }
//   .wlm-vs-fill1 { position: absolute; left: 0; top: 0; height: 100%; border-radius: 3px 0 0 3px; transition: width 1.8s cubic-bezier(.4,0,.2,1); }
//   .wlm-vs-fill2 { position: absolute; right: 0; top: 0; height: 100%; border-radius: 0 3px 3px 0; transition: width 1.8s cubic-bezier(.4,0,.2,1); }
//   .wlm-vs-labels { display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 10px; color: rgba(255,255,255,.4); margin-bottom: 4px; }
//   .wlm-insight {
//     background: rgba(0,0,0,.25);
//     border: 1px solid rgba(188,106,77,.18);
//     border-radius: 12px;
//     padding: 14px 16px;
//     margin-bottom: 14px;
//   }
//   .wlm-insight-lbl { font-family: var(--font-mono); font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: rgba(188,106,77,.7); margin-bottom: 6px; }
//   .wlm-insight-txt { font-size: 14px; color: rgba(255,255,255,.85); line-height: 1.7; font-style: italic; }
//   .wlm-pattern-badge {
//     display: inline-flex;
//     align-items: center;
//     gap: 8px;
//     background: rgba(188,106,77,.1);
//     border: 1px solid rgba(188,106,77,.25);
//     border-radius: 50px;
//     padding: 6px 16px;
//     font-family: var(--font-mono);
//     font-size: 10px;
//     letter-spacing: 2px;
//     text-transform: uppercase;
//     color: #BC6A4D;
//     margin-bottom: 14px;
//   }
//   .wlm-confidence {
//     display: flex;
//     align-items: center;
//     gap: 10px;
//     font-family: var(--font-mono);
//     font-size: 10px;
//     color: rgba(255,255,255,.45);
//     letter-spacing: 1px;
//     text-transform: uppercase;
//     margin-top: 4px;
//   }
//   .wlm-conf-bar { flex: 1; height: 3px; background: rgba(255,255,255,.08); border-radius: 2px; overflow: hidden; }
//   .wlm-conf-fill { height: 100%; background: linear-gradient(to right, #BC6A4D, #BC6A4D); border-radius: 2px; transition: width 2s ease; width: 0; }
//   .wlm-conf-fill.animate { width: var(--w, 0%); }

// `;

// const styleEl = document.createElement("style");
// styleEl.textContent = css;
// document.head.appendChild(styleEl);

// async function fetchCompatibilityReport(p1, p2, scores) {
//   const res = await fetch("/api/compatibility/analyze", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ p1, p2, scores }),
//   });
//   if (!res.ok) throw new Error(`Backend error: ${res.status}`);
//   return res.json();
// }

// const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
// const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
// const YEARS = Array.from({ length: 120 }, (_, i) => new Date().getFullYear() - i);
// const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
// const MINS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

// function getZodiac(day, month) {
//   const signs = [
//     ["Capricorn",1,19],["Aquarius",2,18],["Pisces",3,20],["Aries",4,19],
//     ["Taurus",5,20],["Gemini",6,20],["Cancer",7,22],["Leo",8,22],
//     ["Virgo",9,22],["Libra",10,22],["Scorpio",11,21],["Sagittarius",12,21],["Capricorn",12,31]
//   ];
//   for (const [s, m, d] of signs) if (month < m || (month === m && day <= d)) return s;
//   return "Capricorn";
// }

// function getLifePath(dob) {
//   const digits = dob.replace(/-/g, "").split("").map(Number);
//   let sum = digits.reduce((a, b) => a + b, 0);
//   while (sum > 9 && sum !== 11 && sum !== 22) {
//     sum = String(sum).split("").map(Number).reduce((a, b) => a + b, 0);
//   }
//   return sum;
// }

// function deriveScore(base, name1, name2, seed) {
//   const n = (name1 + name2 + seed).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
//   return Math.min(99, Math.max(52, base + (n % 20) - 10));
// }

// async function searchPlaces(q) {
//   if (!q || q.length < 2) return [];
//   const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`;
//   const res = await fetch(url, { headers: { "Accept-Language": "en", "User-Agent": "SpiritualAIApp/1.0" } });
//   const data = await res.json();
//   return data.map(d => ({
//     display: d.display_name.split(",").slice(0, 3).join(", "),
//     city: d.address?.city || d.address?.town || d.address?.village || d.name,
//     state: d.address?.state || "",
//     country: d.address?.country || "",
//     lat: parseFloat(d.lat),
//     lon: parseFloat(d.lon),
//   }));
// }

// function Starfield() {
//   const stars = Array.from({ length: 120 }, (_, i) => ({
//     id: i, x: Math.random() * 100, y: Math.random() * 100,
//     size: Math.random() * 2.5 + 0.5,
//     d: (Math.random() * 4 + 2).toFixed(1),
//     delay: (Math.random() * 6).toFixed(2),
//     op: (Math.random() * 0.6 + 0.2).toFixed(2),
//   }));
//   return (
//     <div className="starfield">
//       {stars.map(s => (
//         <div key={s.id} className="star" style={{ left:`${s.x}%`, top:`${s.y}%`, width:s.size, height:s.size, "--d":`${s.d}s`, "--delay":`${s.delay}s`, "--op":s.op }} />
//       ))}
//     </div>
//   );
// }

// function ProgBar({ value, color }) {
//   const ref = useRef(null);
//   useEffect(() => { const el = ref.current; if (!el) return; setTimeout(() => el.classList.add("animate"), 100); }, []);
//   return (
//     <div className="prog-bar">
//       <div ref={ref} className="prog-fill" style={{ "--target-width":`${value}%`, "--bar-color":color || undefined }} />
//     </div>
//   );
// }

// function SubMetric({ label, value, color }) {
//   const ref = useRef(null);
//   useEffect(() => { const el = ref.current; if (!el) return; setTimeout(() => el.classList.add("animate"), 200); }, []);
//   return (
//     <div className="sub-metric-row">
//       <div className="sub-metric-label">{label}</div>
//       <div className="sub-metric-bar">
//         <div ref={ref} className="sub-metric-fill" style={{ "--w":`${value}%`, "--fill-c":color || "var(--aurora-3)" }} />
//       </div>
//       <div className="sub-metric-val" style={{ color: color || "var(--aurora-3)" }}>{value}%</div>
//     </div>
//   );
// }

// function ScoreCircle({ score }) {
//   const r = 80, circ = 2 * Math.PI * r;
//   const [offset, setOffset] = useState(circ);
//   useEffect(() => { setTimeout(() => setOffset(circ - (score / 100) * circ), 200); }, [score, circ]);
//   const medal = score >= 90 ? "✨ Cosmic Soulmates" : score >= 75 ? "💫 Stellar Match" : score >= 60 ? "⭐ Promising Pair" : "🌙 Growing Bond";
//   return (
//     <div className="score-circle-wrap">
//       <div className="score-circle">
//         <svg className="score-svg" viewBox="0 0 180 180">
//           <defs>
//             <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
//               <stop offset="0%" stopColor="#BC6A4D" />
//               <stop offset="50%" stopColor="#BC6A4D" />
//               <stop offset="100%" stopColor="#BC6A4D" />
//             </linearGradient>
//           </defs>
//           <circle className="score-track" cx="90" cy="90" r={r} />
//           <circle className="score-fill" cx="90" cy="90" r={r} strokeDasharray={circ} strokeDashoffset={offset} style={{ transition:"stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1)" }} />
//         </svg>
//         <div className="score-inner">
//           <span className="score-num">{score}</span>
//           <span className="score-pct">%</span>
//         </div>
//       </div>
//       <div className="score-label">{medal}</div>
//       <div className="score-tag">Overall Compatibility</div>
//     </div>
//   );
// }

// function PlaceInput({ value, onChange }) {
//   const [query, setQuery] = useState(value?.display || "");
//   const [results, setResults] = useState([]);
//   const [open, setOpen] = useState(false);
//   const timer = useRef(null);
//   const handleChange = (e) => {
//     const v = e.target.value; setQuery(v); clearTimeout(timer.current);
//     if (v.length < 2) { setResults([]); return; }
//     timer.current = setTimeout(async () => { const res = await searchPlaces(v); setResults(res); setOpen(res.length > 0); }, 400);
//   };
//   const pick = (r) => { setQuery(r.display); onChange(r); setOpen(false); };
//   return (
//     <div className="place-wrap">
//       <input value={query} onChange={handleChange} onBlur={() => setTimeout(() => setOpen(false), 200)}
//         placeholder="Type city name…" style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"11px 14px", color:"#e8e0f0", fontFamily:"var(--font-body)", fontSize:16, outline:"none" }} />
//       {open && (
//         <div className="place-dropdown">
//           {results.map((r, i) => (
//             <div key={i} className="place-item" onMouseDown={() => pick(r)}>
//               {r.display}
//               <small>{r.lat?.toFixed(4)}, {r.lon?.toFixed(4)}</small>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// function PersonForm({ title, icon, grad, data, onChange }) {
//   const up = (k, v) => onChange({ ...data, [k]: v });
//   return (
//     <div className="person-card" style={{ "--grad": grad }}>
//       <div className="card-title">
//         <span className="card-icon">{icon}</span>
//         <span style={{ background:grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>{title}</span>
//       </div>
//       <div className="field">
//         <label>Full Name *</label>
//         <input value={data.name} onChange={e => up("name", e.target.value)} placeholder="Enter full name" />
//       </div>
//       <div className="field">
//         <label>Date of Birth *</label>
//         <div className="date-row">
//           <select value={data.day} onChange={e => up("day", e.target.value)}>
//             <option value="">DD</option>
//             {DAYS.map(d => <option key={d} value={d}>{String(d).padStart(2,"0")}</option>)}
//           </select>
//           <select value={data.month} onChange={e => up("month", e.target.value)}>
//             <option value="">MM</option>
//             {MONTHS.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
//           </select>
//           <select value={data.year} onChange={e => up("year", e.target.value)}>
//             <option value="">YYYY</option>
//             {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
//           </select>
//         </div>
//       </div>
//       <div className="field">
//         <label>Time of Birth (optional)</label>
//         <div className="time-row">
//           <select value={data.hour} onChange={e => up("hour", e.target.value)}>
//             <option value="">HH</option>
//             {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
//           </select>
//           <select value={data.min} onChange={e => up("min", e.target.value)}>
//             <option value="">MM</option>
//             {MINS.filter((_,i) => i%5===0).map(m => <option key={m} value={m}>{m}</option>)}
//           </select>
//           <select value={data.ampm} onChange={e => up("ampm", e.target.value)}>
//             <option value="AM">AM</option>
//             <option value="PM">PM</option>
//           </select>
//         </div>
//       </div>
//       <div className="field">
//         <label>Place of Birth (optional)</label>
//         <PlaceInput value={data.place} onChange={v => up("place", v)} />
//       </div>
//     </div>
//   );
// }

// const LOADING_STEPS = [
//   "Reading Birth Charts","Mapping Planetary Positions","Aligning Cosmic Energies",
//   "Matching Soul Frequencies","Calculating Love Compatibility","Analyzing Marriage Potential",
//   "Generating Personalized Insights","Preparing Universe Report",
// ];

// function LoadingScreen() {
//   const [step, setStep] = useState(0);
//   useEffect(() => { const t = setInterval(() => setStep(s => Math.min(s+1,LOADING_STEPS.length-1)), 700); return () => clearInterval(t); }, []);
//   return (
//     <div className="loading-screen">
//       <div className="loading-cosmos">
//         <div className="orbit-ring"><div className="orbit-dot" style={{ background:"#BC6A4D" }}/></div>
//         <div className="orbit-ring"><div className="orbit-dot" style={{ background:"#BC6A4D" }}/></div>
//         <div className="orbit-ring"><div className="orbit-dot" style={{ background:"#BC6A4D" }}/></div>
//         <div className="orbit-center">💫</div>
//       </div>
//       <div className="loading-steps">
//         {LOADING_STEPS.map((s,i) => (
//           <div key={s} className={`loading-step ${i===step?"active":i<step?"done":""}`}>
//             <div className="step-dot"/><span>✨ {s}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// // Card hover colors config
// const CARD_HOVERS = {
//   love:     { hov:"linear-gradient(135deg,rgba(188,106,77,.22),rgba(188,106,77,.14))",  shadow:"rgba(188,106,77,.5)"  },
//   emo:      { hov:"linear-gradient(135deg,rgba(188,106,77,.24),rgba(188,106,77,.14))",   shadow:"rgba(188,106,77,.5)"  },
//   phys:     { hov:"linear-gradient(135deg,rgba(255,107,53,.24),rgba(188,106,77,.16))",  shadow:"rgba(255,107,53,.5)"  },
//   fri:      { hov:"linear-gradient(135deg,rgba(188,106,77,.22),rgba(188,106,77,.14))",   shadow:"rgba(188,106,77,.45)"  },
//   mar:      { hov:"linear-gradient(135deg,rgba(188,106,77,.22),rgba(188,106,77,.16))",  shadow:"rgba(188,106,77,.45)" },
//   fin:      { hov:"linear-gradient(135deg,rgba(46,204,113,.22),rgba(188,106,77,.14))",  shadow:"rgba(46,204,113,.45)" },
//   fam:      { hov:"linear-gradient(135deg,rgba(230,126,34,.22),rgba(188,106,77,.14))",  shadow:"rgba(230,126,34,.45)" },
//   fam2:     { hov:"linear-gradient(135deg,rgba(188,106,77,.2),rgba(188,106,77,.14))",   shadow:"rgba(188,106,77,.4)"  },
//   spi:      { hov:"linear-gradient(135deg,rgba(188,106,77,.24),rgba(188,106,77,.2))",    shadow:"rgba(188,106,77,.55)" },
// };

// function CC({ type, children }) {
//   const h = CARD_HOVERS[type] || CARD_HOVERS.love;
//   return <div className="compat-card" style={{"--hov":h.hov,"--hov-shadow":h.shadow}}>{children}</div>;
// }

// // ── WHO LOVES MORE — deterministic from compatibility factors ────────────────
// function computeWhoLovesMore(p1, p2, scores) {
//   // Factors that indicate emotional investment
//   const s = scores;

//   // P1 investment signals: emotional score relative to love, high friendship
//   // P2 investment signals: spiritual alignment, physical
//   const p1Base =
//     (s.emotional * 0.35) +
//     (s.love * 0.25) +
//     (s.friendship * 0.2) +
//     (s.marriage * 0.2);

//   const p2Base =
//     (s.spiritual * 0.35) +
//     (s.physical * 0.25) +
//     (s.family * 0.2) +
//     (s.financial * 0.2);

//   // Name-derived tiebreaker (deterministic)
//   const n1 = p1.name.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
//   const n2 = p2.name.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
//   const nameBias = ((n1 - n2) % 15); // -14 to +14 range

//   const raw1 = p1Base + nameBias;
//   const raw2 = p2Base - nameBias;
//   const total = raw1 + raw2;
//   let pct1 = Math.round((raw1 / total) * 100);
//   let pct2 = 100 - pct1;

//   // Clamp to 15-85 range (avoid extremes)
//   pct1 = Math.min(85, Math.max(15, pct1));
//   pct2 = 100 - pct1;

//   // Determine pattern label
//   const diff = Math.abs(pct1 - pct2);
//   const pattern =
//     diff <= 4  ? "Balanced Love" :
//     diff <= 12 ? "Slightly More Invested" :
//     diff <= 22 ? "Noticeably More Invested" :
//     diff <= 35 ? "Deeply Invested" :
//                  "One-Sided Attraction";

//   const patternEmoji =
//     diff <= 4  ? "⚖️" :
//     diff <= 12 ? "💛" :
//     diff <= 22 ? "💕" :
//     diff <= 35 ? "💗" : "❤️‍🔥";

//   // Confidence: higher when signals are clear (big diff = more confident)
//   const confidence = Math.min(95, 55 + diff * 1.2);

//   // Who loves more
//   const moreInvested = pct1 >= pct2 ? p1.name : p2.name;
//   const lessInvested = pct1 >= pct2 ? p2.name : p1.name;
//   const morePct = Math.max(pct1, pct2);
//   const lessPct = Math.min(pct1, pct2);

//   // Insight text
//   const insightMap = [
//     { max: 4,  text: `${p1.name} and ${p2.name} share a beautifully balanced emotional investment. Both are equally committed, creating a foundation of mutual love and stability. This rare equilibrium is one of the strongest indicators of lasting partnership.` },
//     { max: 12, text: `${moreInvested} tends to be slightly more emotionally expressive and invests just a little more in the relationship. ${lessInvested} is deeply caring too — the difference is subtle and reflects complementary love styles rather than imbalance.` },
//     { max: 22, text: `${moreInvested} is noticeably more emotionally invested at this stage, often being the initiator and emotional anchor. ${lessInvested} shows love through actions and loyalty rather than emotional expression. This dynamic can work beautifully when both understand each other's style.` },
//     { max: 35, text: `${moreInvested} carries significantly more of the emotional weight in this relationship. Their deep feelings drive the connection forward. ${lessInvested} values the relationship but expresses it differently — understanding this difference is key to harmony.` },
//     { max: 100, text: `The emotional intensity is strongly skewed toward ${moreInvested}. This doesn't mean ${lessInvested} doesn't care — it reflects a deeply different emotional expression style. Open communication about love languages could transform this dynamic significantly.` },
//   ];
//   const insight = insightMap.find(i => diff <= i.max)?.text || insightMap[insightMap.length-1].text;

//   // Intensity labels
//   const intensity = (pct) =>
//     pct >= 75 ? "Deeply Devoted" :
//     pct >= 62 ? "Strongly Invested" :
//     pct >= 52 ? "Warmly Engaged" :
//     pct >= 42 ? "Steadily Present" :
//                 "Quietly Caring";

//   return { pct1, pct2, pattern, patternEmoji, confidence: Math.round(confidence), moreInvested, morePct, lessInvested, lessPct, insight, intensity1: intensity(pct1), intensity2: intensity(pct2) };
// }

// function WhoLovesMore({ p1, p2, scores }) {
//   const wlm = computeWhoLovesMore(p1, p2, scores);
//   const r = 52, circ = 2 * Math.PI * r;
//   const offset1 = circ - (wlm.pct1 / 100) * circ;
//   const offset2 = circ - (wlm.pct2 / 100) * circ;

//   const ref1 = useRef(null), ref2 = useRef(null);
//   const refBar1 = useRef(null), refBar2 = useRef(null);
//   const refConf = useRef(null);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       ref1.current?.style && (ref1.current.style.strokeDashoffset = offset1);
//       ref2.current?.style && (ref2.current.style.strokeDashoffset = offset2);
//       refBar1.current?.classList.add("animate");
//       refBar2.current?.classList.add("animate");
//       refConf.current?.classList.add("animate");
//     }, 300);
//     return () => clearTimeout(timer);
//   }, []);

//   const c1 = "#BC6A4D", c2 = "#BC6A4D";

//   return (
//     <div className="wlm-wrap">
//       <div className="wlm-card">
//         <div className="wlm-disclaimer">✦ AI-Generated Relationship Analysis — For Entertainment & Insight Only ✦</div>

//         <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18,flexWrap:"wrap"}}>
//           <div className="wlm-pattern-badge">{wlm.patternEmoji} {wlm.pattern}</div>
//         </div>

//         {/* Two rings side by side */}
//         <div className="wlm-persons">
//           {[
//             {name:p1.name, pct:wlm.pct1, color:c1, offset:offset1, ref:ref1, barRef:refBar1, intensity:wlm.intensity1},
//             {name:p2.name, pct:wlm.pct2, color:c2, offset:offset2, ref:ref2, barRef:refBar2, intensity:wlm.intensity2},
//           ].map((person, i) => (
//             <div key={i} className="wlm-person">
//               <div className="wlm-person-name" style={{color:person.color}}>{person.name}</div>
//               <div className="wlm-ring-wrap">
//                 <svg className="wlm-ring-svg" viewBox="0 0 120 120">
//                   <circle className="wlm-ring-bg" cx="60" cy="60" r={r}/>
//                   <circle ref={person.ref} className="wlm-ring-fg" cx="60" cy="60" r={r}
//                     stroke={person.color} strokeDasharray={circ}
//                     strokeDashoffset={circ}
//                     style={{transition:"stroke-dashoffset 1.8s cubic-bezier(.4,0,.2,1)"}}/>
//                 </svg>
//                 <div className="wlm-ring-inner">
//                   <span className="wlm-pct-num" style={{color:person.color}}>{person.pct}</span>
//                   <span className="wlm-pct-sym">%</span>
//                 </div>
//               </div>
//               <div className="wlm-label">Love Intensity</div>
//               <div className="wlm-bar-wrap">
//                 <div ref={person.barRef} className="wlm-bar-fill"
//                   style={{"--w":`${person.pct}%`, background:person.color}}/>
//               </div>
//               <div className="wlm-intensity-label">{person.intensity}</div>
//             </div>
//           ))}
//         </div>

//         {/* VS bar */}
//         <div className="wlm-vs-labels">
//           <span style={{color:c1}}>{p1.name}</span>
//           <span style={{color:"rgba(255,255,255,.3)"}}>vs</span>
//           <span style={{color:c2}}>{p2.name}</span>
//         </div>
//         <div className="wlm-vs">
//           <div className="wlm-vs-fill1" style={{width:`${wlm.pct1}%`, background:`linear-gradient(to right,${c1},rgba(188,106,77,.5))`}}/>
//           <div className="wlm-vs-fill2" style={{width:`${wlm.pct2}%`, background:`linear-gradient(to left,${c2},rgba(188,106,77,.5))`}}/>
//         </div>
//         <div style={{display:"flex",justifyContent:"space-between",fontFamily:"var(--font-mono)",fontSize:11,color:"rgba(255,255,255,.5)",marginBottom:20}}>
//           <span style={{color:c1}}>{wlm.pct1}%</span>
//           <span style={{color:c2}}>{wlm.pct2}%</span>
//         </div>

//         {/* Insight */}
//         <div className="wlm-insight">
//           <div className="wlm-insight-lbl">💬 Relationship Dynamics Insight</div>
//           <div className="wlm-insight-txt">{wlm.insight}</div>
//         </div>

//         {/* Summary message */}
//         <div style={{fontSize:14,color:"rgba(255,255,255,.75)",lineHeight:1.7,fontStyle:"italic",marginBottom:16,textAlign:"center"}}>
//           Based on the relationship dynamics, <strong style={{color:wlm.moreInvested===p1.name?c1:c2}}>{wlm.moreInvested}</strong> appears to be {wlm.pattern === "Balanced Love" ? "equally" : "more"} emotionally invested{wlm.pattern !== "Balanced Love" ? ` at ${wlm.morePct}%` : ""}.
//         </div>

//         {/* Confidence score */}
//         <div className="wlm-confidence">
//           <span>Analysis Confidence</span>
//           <div className="wlm-conf-bar">
//             <div ref={refConf} className="wlm-conf-fill" style={{"--w":`${wlm.confidence}%`}}/>
//           </div>
//           <span style={{color:"#BC6A4D",minWidth:32}}>{wlm.confidence}%</span>
//         </div>
//       </div>
//     </div>
//   );
// }


// function Results({ p1, p2, report, onReset }) {
//   const s = report.scores;
//   const PLANETS = [
//     { symbol:"☀️", name:"Sun",     score:deriveScore(s.overall,   p1.name,p2.name,"sun")   },
//     { symbol:"🌙", name:"Moon",    score:deriveScore(s.emotional, p1.name,p2.name,"moon")  },
//     { symbol:"⬆️", name:"Rising",  score:deriveScore(s.love,      p1.name,p2.name,"rise")  },
//     { symbol:"♀️", name:"Venus",   score:deriveScore(s.love,      p1.name,p2.name,"venus") },
//     { symbol:"♂️", name:"Mars",    score:deriveScore(s.physical,  p1.name,p2.name,"mars")  },
//     { symbol:"☿",  name:"Mercury", score:deriveScore(s.emotional, p1.name,p2.name,"merc")  },
//     { symbol:"♃",  name:"Jupiter", score:deriveScore(s.spiritual, p1.name,p2.name,"jup")   },
//     { symbol:"♄",  name:"Saturn",  score:deriveScore(s.marriage,  p1.name,p2.name,"sat")   },
//   ];
//   const TL = [
//     { phase:"First Attraction",   desc:report.timeline?.attraction,  c:"#BC6A4D" },
//     { phase:"Connection Phase",   desc:report.timeline?.connection,   c:"#BC6A4D" },
//     { phase:"Relationship Growth",desc:report.timeline?.growth,       c:"#BC6A4D" },
//     { phase:"Commitment Phase",   desc:report.timeline?.commitment,   c:"#BC6A4D" },
//     { phase:"Marriage Potential", desc:report.timeline?.marriage,     c:"#BC6A4D" },
//     { phase:"Long-Term Stability",desc:report.timeline?.stability,    c:"#BC6A4D" },
//   ];
//   return (
//     <div className="results">
//       {/* Couple names — BIG and VISIBLE */}
//       <div className="couple-header">
//         <span className="couple-names">{p1.name} ✦ {p2.name}</span>
//         <span className="couple-sub">Universe Compatibility Analysis · {p1.zodiac} & {p2.zodiac}</span>
//       </div>

//       <div className="score-hero"><ScoreCircle score={s.overall}/></div>

//       <div className="section-head">💞 Who Loves More?</div>
//       <WhoLovesMore p1={p1} p2={p2} scores={s}/>


//       <div className="section-head">❤️ Love Compatibility</div>
//       <div className="cards-grid">
//         <CC type="love">
//           <div className="card-head"><span className="card-emoji">💕</span><span className="card-name">Love Score</span><span className="card-score-num">{s.love}%</span></div>
//           <ProgBar value={s.love} color="linear-gradient(to right,#BC6A4D,#BC6A4D)"/>
//           <div className="sub-metrics" style={{marginTop:12}}>
//             <SubMetric label="Emotional Bond"     value={deriveScore(s.love,p1.name,p2.name,"bond")}  color="#BC6A4D"/>
//             <SubMetric label="Romantic Spark"     value={deriveScore(s.love,p1.name,p2.name,"spark")} color="#BC6A4D"/>
//             <SubMetric label="Soulmate Potential" value={deriveScore(s.love,p1.name,p2.name,"soul")}  color="#BC6A4D"/>
//           </div>
//           {report.loveInsight && <div className="insight-box"><div className="insight-label">AI Insight</div>{report.loveInsight}</div>}
//         </CC>
//         <CC type="emo">
//           <div className="card-head"><span className="card-emoji">🧠</span><span className="card-name">Emotional Compatibility</span><span className="card-score-num">{s.emotional}%</span></div>
//           <ProgBar value={s.emotional} color="linear-gradient(to right,#BC6A4D,#BC6A4D)"/>
//           <div className="sub-metrics" style={{marginTop:12}}>
//             <SubMetric label="Understanding" value={deriveScore(s.emotional,p1.name,p2.name,"und")}   color="#BC6A4D"/>
//             <SubMetric label="Trust"         value={deriveScore(s.emotional,p1.name,p2.name,"trust")} color="#BC6A4D"/>
//             <SubMetric label="Communication" value={deriveScore(s.emotional,p1.name,p2.name,"comm")}  color="#BC6A4D"/>
//             <SubMetric label="Loyalty"       value={deriveScore(s.emotional,p1.name,p2.name,"loyal")} color="#BC6A4D"/>
//           </div>
//         </CC>
//         <CC type="phys">
//           <div className="card-head"><span className="card-emoji">🔥</span><span className="card-name">Physical Attraction</span><span className="card-score-num">{s.physical}%</span></div>
//           <ProgBar value={s.physical} color="linear-gradient(to right,#ff6b35,#BC6A4D)"/>
//           <div className="sub-metrics" style={{marginTop:12}}>
//             <SubMetric label="Chemistry"       value={deriveScore(s.physical,p1.name,p2.name,"chem")} color="#ff6b35"/>
//             <SubMetric label="Passion Index"   value={deriveScore(s.physical,p1.name,p2.name,"pass")} color="#BC6A4D"/>
//             <SubMetric label="Attraction Score"value={deriveScore(s.physical,p1.name,p2.name,"attr")} color="#BC6A4D"/>
//           </div>
//         </CC>
//       </div>

//       <div className="section-head">🤝 Friendship & Commitment</div>
//       <div className="cards-grid">
//         <CC type="fri">
//           <div className="card-head"><span className="card-emoji">🤝</span><span className="card-name">Friendship Score</span><span className="card-score-num">{s.friendship}%</span></div>
//           <ProgBar value={s.friendship} color="linear-gradient(to right,#BC6A4D,#BC6A4D)"/>
//           <div className="sub-metrics" style={{marginTop:12}}>
//             <SubMetric label="Support Level"  value={deriveScore(s.friendship,p1.name,p2.name,"sup")}  color="#BC6A4D"/>
//             <SubMetric label="Long-Term Bond" value={deriveScore(s.friendship,p1.name,p2.name,"ltb")}  color="#BC6A4D"/>
//             <SubMetric label="Teamwork"       value={deriveScore(s.friendship,p1.name,p2.name,"team")} color="#BC6A4D"/>
//           </div>
//         </CC>
//         <CC type="mar">
//           <div className="card-head"><span className="card-emoji">💍</span><span className="card-name">Marriage Potential</span><span className="card-score-num">{s.marriage}%</span></div>
//           <ProgBar value={s.marriage} color="linear-gradient(to right,#BC6A4D,#BC6A4D)"/>
//           <div className="sub-metrics" style={{marginTop:12}}>
//             <SubMetric label="Marriage Readiness" value={deriveScore(s.marriage,p1.name,p2.name,"mrd")}  color="#BC6A4D"/>
//             <SubMetric label="Commitment Score"   value={deriveScore(s.marriage,p1.name,p2.name,"com")}  color="#BC6A4D"/>
//             <SubMetric label="Stability"          value={deriveScore(s.marriage,p1.name,p2.name,"stab")} color="#BC6A4D"/>
//           </div>
//           {report.marriageWindow && <div className="insight-box"><div className="insight-label">Most Favorable Period</div>{report.marriageWindow}</div>}
//         </CC>
//         <CC type="fin">
//           <div className="card-head"><span className="card-emoji">💰</span><span className="card-name">Financial Compatibility</span><span className="card-score-num">{s.financial}%</span></div>
//           <ProgBar value={s.financial} color="linear-gradient(to right,#2ecc71,#BC6A4D)"/>
//           <div className="sub-metrics" style={{marginTop:12}}>
//             <SubMetric label="Wealth Building"  value={deriveScore(s.financial,p1.name,p2.name,"wb")} color="#2ecc71"/>
//             <SubMetric label="Money Management" value={deriveScore(s.financial,p1.name,p2.name,"mm")} color="#BC6A4D"/>
//             <SubMetric label="Spending Style"   value={deriveScore(s.financial,p1.name,p2.name,"sp")} color="#BC6A4D"/>
//           </div>
//         </CC>
//       </div>

//       <div className="section-head">🏠 Family & Spiritual</div>
//       <div className="cards-grid">
//         <CC type="fam">
//           <div className="card-head"><span className="card-emoji">🏠</span><span className="card-name">Family Harmony</span><span className="card-score-num">{s.family}%</span></div>
//           <ProgBar value={s.family} color="linear-gradient(to right,#e67e22,#BC6A4D)"/>
//           <div className="sub-metrics" style={{marginTop:12}}>
//             <SubMetric label="Domestic Harmony"  value={deriveScore(s.family,p1.name,p2.name,"dh")} color="#e67e22"/>
//             <SubMetric label="Family Acceptance" value={deriveScore(s.family,p1.name,p2.name,"fa")} color="#BC6A4D"/>
//             <SubMetric label="Parenting Energy"  value={deriveScore(s.family,p1.name,p2.name,"pe")} color="#BC6A4D"/>
//           </div>
//         </CC>
//         <CC type="fam2">
//           <div className="card-head"><span className="card-emoji">👶</span><span className="card-name">Future Family Energy</span><span className="card-score-num">{deriveScore(s.family,p1.name,p2.name,"ffe")}%</span></div>
//           <ProgBar value={deriveScore(s.family,p1.name,p2.name,"ffe")} color="linear-gradient(to right,#BC6A4D,#BC6A4D)"/>
//           <div className="sub-metrics" style={{marginTop:12}}>
//             <SubMetric label="Family Growth"      value={deriveScore(s.family,p1.name,p2.name,"fg")} color="#BC6A4D"/>
//             <SubMetric label="Nurturing Potential"value={deriveScore(s.family,p1.name,p2.name,"np")} color="#BC6A4D"/>
//             <SubMetric label="Child Compatibility"value={deriveScore(s.family,p1.name,p2.name,"cc")} color="#BC6A4D"/>
//           </div>
//           <div className="insight-box" style={{fontSize:13}}><div className="insight-label">Note</div>These are astrology-based compatibility indicators, not guarantees of future outcomes.</div>
//         </CC>
//         <CC type="spi">
//           <div className="card-head"><span className="card-emoji">🌙</span><span className="card-name">Spiritual Connection</span><span className="card-score-num">{s.spiritual}%</span></div>
//           <ProgBar value={s.spiritual} color="linear-gradient(to right,#BC6A4D,#BC6A4D)"/>
//           <div className="sub-metrics" style={{marginTop:12}}>
//             <SubMetric label="Karma Connection"    value={deriveScore(s.spiritual,p1.name,p2.name,"karma")} color="#BC6A4D"/>
//             <SubMetric label="Soul Bond"            value={deriveScore(s.spiritual,p1.name,p2.name,"soul2")} color="#BC6A4D"/>
//             <SubMetric label="Past Life Indicators" value={deriveScore(s.spiritual,p1.name,p2.name,"past")}  color="#BC6A4D"/>
//             <SubMetric label="Destiny Connection"   value={deriveScore(s.spiritual,p1.name,p2.name,"dest")}  color="#BC6A4D"/>
//           </div>
//         </CC>
//       </div>

//       <div className="section-head">🪐 Planetary Analysis</div>
//       <div className="planet-row">
//         {PLANETS.map(pl => (
//           <div key={pl.name} className="planet-item">
//             <div className="planet-symbol">{pl.symbol}</div>
//             <div className="planet-name">{pl.name}</div>
//             <div className="planet-score">{pl.score}%</div>
//           </div>
//         ))}
//       </div>

//       <div className="section-head">📅 Relationship Timeline</div>
//       <div className="timeline">
//         {TL.map((t,i) => (
//           <div key={i} className="tl-item">
//             <div className="tl-dot" style={{"--dot-c":t.c}}/>
//             <div className="tl-phase" style={{color:t.c}}>{t.phase}</div>
//             <div className="tl-desc">{t.desc || "Cosmic energies align for this phase of your journey."}</div>
//           </div>
//         ))}
//       </div>

//       <div className="section-head">🚩 Compatibility Indicators</div>
//       <div className="flags-grid">
//         <div className="flags-col">
//           <div className="flags-col-title" style={{color:"#2ecc71"}}>✅ Green Flags</div>
//           {(report.greenFlags||[]).map((f,i) => <div key={i} className="flag-item"><span className="flag-icon">✅</span>{f}</div>)}
//         </div>
//         <div className="flags-col">
//           <div className="flags-col-title" style={{color:"#ff6b35"}}>⚠️ Areas to Navigate</div>
//           {(report.redFlags||[]).map((f,i) => <div key={i} className="flag-item"><span className="flag-icon">⚠️</span>{f}</div>)}
//         </div>
//       </div>

//       <div className="section-head">🤖 AI Relationship Insights</div>
//       <div className="ai-insights-grid">
//         {(report.aiInsights||[]).map((ins,i) => (
//           <div key={i} className="ai-card">
//             <div className="ai-card-title">{ins.title}</div>
//             <div className="ai-card-text">{ins.text}</div>
//           </div>
//         ))}
//       </div>

//       <button className="reset-btn" onClick={onReset}>✦ New Reading</button>
//     </div>
//   );
// }

// const empty = () => ({ name:"", day:"", month:"", year:"", hour:"", min:"", ampm:"AM", place:null });

// export default function App() {
//   const [p1,setP1] = useState(empty());
//   const [p2,setP2] = useState(empty());
//   const [phase,setPhase] = useState("form");
//   const [report,setReport] = useState(null);
//   const [error,setError] = useState("");

//   // Back button returns to form from loading/results phases
//   useBackOverride(
//     phase !== "form" ? () => { setPhase("form"); setReport(null); setError(""); } : null,
//     [phase],
//   );

//   const compute = useCallback(async () => {
//     setError("");
//     if (!p1.name||!p2.name||!p1.day||!p1.month||!p1.year||!p2.day||!p2.month||!p2.year) {
//       setError("Please fill in the required fields (Name & Date of Birth) for both persons."); return;
//     }
//     setPhase("loading");
//     const z1=getZodiac(+p1.day,+p1.month), z2=getZodiac(+p2.day,+p2.month);
//     const dob1=`${p1.year}-${String(p1.month).padStart(2,"0")}-${String(p1.day).padStart(2,"0")}`;
//     const dob2=`${p2.year}-${String(p2.month).padStart(2,"0")}-${String(p2.day).padStart(2,"0")}`;
//     const lp1=getLifePath(dob1), lp2=getLifePath(dob2);
//     const seed=p1.name+p2.name+dob1+dob2;
//     const hash=seed.split("").reduce((a,c)=>(a*31+c.charCodeAt(0))&0xffff,0);
//     const base=60+(hash%35);
//     const scores={
//       overall:Math.min(99,base+5), love:deriveScore(base,p1.name,p2.name,"love"),
//       emotional:deriveScore(base,p1.name,p2.name,"emo"), physical:deriveScore(base,p1.name,p2.name,"phys"),
//       friendship:deriveScore(base,p1.name,p2.name,"fri"), marriage:deriveScore(base,p1.name,p2.name,"mar"),
//       financial:deriveScore(base,p1.name,p2.name,"fin"), family:deriveScore(base,p1.name,p2.name,"fam"),
//       spiritual:deriveScore(base,p1.name,p2.name,"spi"),
//     };
//     let aiData=null;
//     try { aiData=await fetchCompatibilityReport({name:p1.name,dob:dob1,zodiac:z1,lifePath:lp1,place:p1.place?.city},{name:p2.name,dob:dob2,zodiac:z2,lifePath:lp2,place:p2.place?.city},scores); }
//     catch(e) { console.warn("AI backend error:",e); }
//     const fallback={
//       loveInsight:`${p1.name} and ${p2.name} share a profound emotional resonance rooted in their ${z1}–${z2} cosmic alignment. Their life path numbers ${lp1} and ${lp2} create a complementary energetic balance.`,
//       marriageWindow:`${2027+(hash%5)} – ${2029+(hash%5)}`,
//       greenFlags:["Strong emotional connection and mutual understanding","Complementary zodiac energies create natural harmony","Shared life path resonance supports long-term growth","Deep spiritual alignment and karmic connection","High marriage potential with stable long-term outlook"],
//       redFlags:["Occasional communication style differences to navigate","Financial planning approaches may need alignment","Personal space and independence balance requires attention"],
//       timeline:{attraction:"Initial cosmic attraction is powerful and immediate, drawing these souls together.",connection:"Emotional bonds deepen as shared values and dreams align beautifully.",growth:"The relationship blossoms through mutual support and spiritual growth.",commitment:"A natural progression toward deeper commitment feels destined.",marriage:`Marriage energy peaks around ${2027+(hash%5)}, supported by favorable planetary alignments.`,stability:"Long-term cosmic compatibility ensures enduring happiness and harmony."},
//       aiInsights:[
//         {title:"Relationship Strengths",text:`${p1.name} and ${p2.name} possess remarkable compatibility rooted in their ${z1} and ${z2} synergy. Their combined life path numbers ${lp1} and ${lp2} create a relationship that balances ambition with emotional depth.`},
//         {title:"Communication Style",text:"Your communication is naturally intuitive, often understanding each other without words. Building clear channels for expressing needs will transform this connection from good to extraordinary."},
//         {title:"Love Languages",text:`${p1.name} expresses love through thoughtful gestures and quality time, while ${p2.name}'s love language centers around words of affirmation and deep emotional sharing.`},
//         {title:"Growth Opportunities",text:"Together you inspire each other's highest potential. Embrace your differences as cosmic teachers rather than obstacles, and watch your relationship evolve beautifully."},
//         {title:"Conflict Resolution",text:"When tensions arise, return to your core emotional connection. Both partners benefit from taking reflective pauses before discussing sensitive topics, honoring each other's processing styles."},
//         {title:"Long-Term Vision",text:"The stars indicate a relationship built for the long journey. Your combined energies create a stable, loving foundation that grows stronger with each passing year."},
//       ],
//     };
//     await new Promise(r=>setTimeout(r,5600));
//     setP1(prev=>({...prev,zodiac:z1,lifePath:lp1}));
//     setP2(prev=>({...prev,zodiac:z2,lifePath:lp2}));
//     setReport({scores,...(aiData||fallback)});
//     setPhase("results");
//   },[p1,p2]);

//   return (
//     <div className="universe-app">
//       <Starfield/>
//       <div className="nebula-blob" style={{width:600,height:600,top:"-200px",left:"-200px",background:"radial-gradient(circle,rgba(188,106,77,0.15),transparent 70%)",animationDuration:"18s"}}/>
//       <div className="nebula-blob" style={{width:500,height:500,bottom:"10%",right:"-150px",background:"radial-gradient(circle,rgba(188,106,77,0.12),transparent 70%)",animationDuration:"22s",animationDelay:"3s"}}/>
//       <div className="nebula-blob" style={{width:400,height:400,top:"40%",left:"30%",background:"radial-gradient(circle,rgba(188,106,77,0.07),transparent 70%)",animationDuration:"25s",animationDelay:"6s"}}/>
//       {phase==="loading" && <LoadingScreen/>}
//       <div className="content" style={{display:phase==="loading"?"none":"block"}}>
//         {phase==="form" && (
//           <>
//             <div className="header">
//               <div className="header-tag">✦ Universe Relationship Analyzer ✦</div>
//               <h1>Cosmic Compatibility<br/>Oracle</h1>
//               <p>Let the universe reveal the truth of your connection</p>
//             </div>
//             <div className="form-container">
//               {error && <div className="error-box">⚠ {error}</div>}
//               <div className="persons-grid">
//                 <PersonForm title="The Divine Masculine" icon="♂" grad="linear-gradient(135deg,#BC6A4D,#BC6A4D)" data={p1} onChange={setP1}/>
//                 <PersonForm title="The Divine Feminine"  icon="♀" grad="linear-gradient(135deg,#BC6A4D,#BC6A4D)" data={p2} onChange={setP2}/>
//               </div>
//               <button className="submit-btn" onClick={compute}>✦ Reveal Cosmic Compatibility ✦</button>
//             </div>
//           </>
//         )}
//         {phase==="results" && report && (
//           <Results p1={p1} p2={p2} report={report} onReset={()=>{setPhase("form");setReport(null);setP1(empty());setP2(empty());}}/>
//         )}
//       </div>
//     </div>
//   );
// }



//komal nsp
import { useState, useEffect, useRef, useCallback, type CSSProperties } from "react";
import { useBackOverride } from "../context/NavigationContext";
import {
  User, MapPin, ArrowRight, Heart, Brain, Flame, Star, MessageCircle, MessageSquare,
  Puzzle, TrendingUp, CalendarDays, CheckCircle2, XCircle, Send, Lock,
  Infinity as InfinityIcon,
} from "lucide-react";

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Space+Mono:wght@400;700&display=swap";
document.head.appendChild(fontLink);

const css = `
  :root {
    --void: #080c1f;
    --deep: #0b1030;
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
    min-height: 100vh; background: var(--void); color: #e8e0f0;
    font-family: var(--font-body); font-size: 18px; overflow-x: hidden; position: relative;
  }
  .starfield { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
  .star { position: absolute; border-radius: 50%; background: white; animation: twinkle var(--d,3s) ease-in-out infinite; animation-delay: var(--delay,0s); opacity: var(--op,0.6); }
  @keyframes twinkle { 0%,100%{opacity:var(--op,0.6);transform:scale(1);}50%{opacity:0.1;transform:scale(0.5);} }
  .nebula-blob { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; animation: drift 20s ease-in-out infinite alternate; }
  @keyframes drift { from{transform:translate(0,0) scale(1);}to{transform:translate(40px,30px) scale(1.1);} }
  .content { position: relative; z-index: 1; }
  .header { text-align: center; padding: 60px 20px 40px; }
  .header-tag { font-family: var(--font-mono); font-size: 11px; letter-spacing: 6px; color: var(--aurora-3); text-transform: uppercase; margin-bottom: 16px; opacity: 0.8; }
  .header h1 { font-family: var(--font-display); font-size: clamp(22px,4vw,44px); font-weight: 900; background: linear-gradient(135deg,var(--gold) 0%,var(--aurora-2) 40%,var(--aurora-1) 80%,var(--aurora-3) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1.2; margin-bottom: 12px; }
  .header p { color: rgba(255,255,255,0.72); font-size: 17px; font-style: italic; letter-spacing: 0.5px; }
  .form-container { max-width: 900px; margin: 0 auto; padding: 0 20px 60px; }
  .persons-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
  @media(max-width:680px){.persons-grid{grid-template-columns:1fr;}}
  .person-card { background: var(--glass); border: 1px solid var(--glass-border); border-radius: 20px; padding: 28px 24px; backdrop-filter: blur(16px); position: relative; overflow: hidden; transition: border-color 0.3s, box-shadow 0.3s; }
  .person-card::before { content:''; position:absolute; inset:0; background:var(--grad); opacity:0.04; pointer-events:none; }
  .person-card:hover { border-color: rgba(255,255,255,0.22); box-shadow: 0 0 40px rgba(123,47,255,0.15); }
  .card-title { font-family: var(--font-display); font-size: 13px; letter-spacing: 2px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
  .card-icon { font-size: 20px; }
  .field { margin-bottom: 16px; }
  .field label { font-family: var(--font-mono); font-size: 10px; letter-spacing: 3px; color: rgba(255,255,255,0.75); text-transform: uppercase; display: block; margin-bottom: 6px; }
  .field input,.field select { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:11px 14px; color:#e8e0f0; font-family:var(--font-body); font-size:16px; outline:none; transition:border 0.3s,box-shadow 0.3s; -webkit-appearance:none; }
  .field input:focus,.field select:focus { border-color:var(--aurora-1); box-shadow:0 0 0 3px rgba(123,47,255,0.15); }
  .field input::placeholder { color:rgba(232,224,240,0.25); }
  .field select option { background:#1a0a2e; }
  .date-row { display:grid; grid-template-columns:2fr 2fr 3fr; gap:8px; }
  .time-row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; }
  .place-wrap { position:relative; }
  .place-dropdown { position:absolute; top:calc(100% + 6px); left:0; right:0; background:#1a0a2e; border:1px solid rgba(123,47,255,0.4); border-radius:10px; z-index:100; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.6); }
  .place-item { padding:10px 14px; cursor:pointer; font-size:15px; color:rgba(255,255,255,0.9); transition:background 0.2s; border-bottom:1px solid rgba(255,255,255,0.05); }
  .place-item:hover { background:rgba(123,47,255,0.2); }
  .place-item small { display:block; font-size:12px; color:rgba(255,255,255,0.5); margin-top:2px; font-family:var(--font-mono); }
  .submit-btn { display:block; width:100%; max-width:400px; margin:0 auto; padding:18px 40px; background:linear-gradient(135deg,var(--aurora-1),var(--aurora-2)); border:none; border-radius:50px; color:white; font-family:var(--font-display); font-size:14px; letter-spacing:2px; cursor:pointer; position:relative; overflow:hidden; transition:transform 0.2s,box-shadow 0.3s; text-transform:uppercase; }
  .submit-btn:hover { transform:translateY(-2px); box-shadow:0 20px 60px rgba(255,45,120,0.4); }
  .submit-btn:active { transform:translateY(0); }
  .submit-btn:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
  .loading-screen { position:fixed; inset:0; background:var(--void); z-index:200; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:32px; }
  .loading-cosmos { width:200px; height:200px; position:relative; }
  .orbit-ring { position:absolute; border-radius:50%; border:1.5px solid transparent; animation:orbit-spin linear infinite; }
  .orbit-ring:nth-child(1){inset:0;   border-color:rgba(230,228,245,.8); box-shadow:0 0 8px rgba(230,228,245,.55),0 0 18px rgba(230,228,245,.3); animation-duration:20s;}
  .orbit-ring:nth-child(2){inset:24px;border-color:rgba(123,47,255,0.7); box-shadow:0 0 8px rgba(123,47,255,.55),0 0 18px rgba(123,47,255,.3); animation-duration:14s;animation-direction:reverse;}
  .orbit-ring:nth-child(3){inset:52px;border-color:rgba(0,229,255,0.75); box-shadow:0 0 8px rgba(0,229,255,.6), 0 0 18px rgba(0,229,255,.32); animation-duration:8s;}
  .orbit-ring:nth-child(4){inset:80px;border-color:rgba(0,255,170,.7);  box-shadow:0 0 8px rgba(0,255,170,.55),0 0 18px rgba(0,255,170,.3); animation-duration:4.5s;animation-direction:reverse;}
  .orbit-dot { position:absolute; width:9px; height:9px; border-radius:50%; top:-4.5px; left:50%; transform:translateX(-50%); box-shadow:0 0 6px currentColor,0 0 14px currentColor,0 0 26px currentColor; }
  @keyframes orbit-spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
  .orbit-center { position:absolute; inset:88px; border-radius:50%; background:radial-gradient(circle at 36% 34%,#ffffff 0%,#fff6d0 14%,#ffd54f 42%,#ffb300 72%,#ff8f00 100%); animation:pulse-glow 2s ease-in-out infinite; z-index:2; }
  .orbit-center::after{ content:''; position:absolute; inset:-90%; border-radius:50%; background:linear-gradient(to right,transparent 0%,rgba(255,246,208,.85) 49.3%,rgba(255,246,208,.85) 50.7%,transparent 100%),linear-gradient(to bottom,transparent 0%,rgba(255,246,208,.85) 49.3%,rgba(255,246,208,.85) 50.7%,transparent 100%); mix-blend-mode:screen; -webkit-mask-image:radial-gradient(circle,black 12%,transparent 62%); mask-image:radial-gradient(circle,black 12%,transparent 62%); pointer-events:none; animation:flare-spin 24s linear infinite; }
  @keyframes flare-spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
  @keyframes pulse-glow{0%,100%{box-shadow:0 0 8px 2px rgba(255,213,79,.6),0 0 20px 6px rgba(255,179,0,.35),0 0 44px 14px rgba(255,143,0,.18);opacity:.9;}50%{box-shadow:0 0 12px 3px rgba(255,213,79,.8),0 0 30px 10px rgba(255,179,0,.5),0 0 60px 20px rgba(255,143,0,.28);opacity:1;}}
  .loading-steps { display:flex; flex-direction:column; gap:10px; text-align:center; }
  .loading-step { font-family:var(--font-mono); font-size:12px; letter-spacing:2px; color:rgba(255,255,255,0.65); transition:color 0.5s,opacity 0.5s; display:flex; align-items:center; gap:10px; justify-content:center; }
  .loading-step.active { color:var(--aurora-3); text-shadow:0 0 20px var(--aurora-3); }
  .loading-step.done { color:var(--gold); }
  .step-dot { width:6px; height:6px; border-radius:50%; background:currentColor; flex-shrink:0; }
  .results { max-width: 1000px; margin: 0 auto; padding: 20px 20px 80px; }

  /* ── COUPLE HEADER — LARGE VISIBLE NAMES ── */
  .couple-header { text-align:center; padding:50px 20px 44px; }
  .couple-names {
    font-family: var(--font-display);
    font-size: clamp(16px, 3.5vw, 48px);
    background: linear-gradient(135deg,var(--gold) 0%,var(--aurora-2) 45%,var(--aurora-1) 80%,var(--aurora-3) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 16px;
    display: block;
    filter: drop-shadow(0 0 28px rgba(255,45,120,0.5));
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
  .couple-sub { font-family:var(--font-mono); font-size:12px; letter-spacing:4px; color:rgba(255,255,255,0.65); text-transform:uppercase; display:block; }

  /* ── SCORE CIRCLE ── */
  .score-hero { display:flex; justify-content:center; margin-bottom:48px; }
  .score-circle-wrap { text-align:center; }
  .score-circle { width:200px; height:200px; display:grid; place-items:center; margin:0 auto 16px; position:relative; }
  .score-svg { width:200px; height:200px; transform:rotate(-90deg); position:absolute; top:0; left:0; }
  .score-track { fill:none; stroke:rgba(255,255,255,0.08); stroke-width:10; }
  .score-fill { fill:none; stroke-width:10; stroke-linecap:round; stroke:url(#scoreGrad); }
  .score-inner { display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; z-index:10; }
  .score-num { font-family:var(--font-display); font-size:54px; font-weight:900; color:#f5c842; line-height:1; display:block; text-shadow:0 0 32px rgba(245,200,66,0.7); }
  .score-pct { font-family:var(--font-mono); font-size:18px; color:rgba(255,255,255,0.82); margin-top:4px; display:block; }
  .score-label { font-family:var(--font-display); font-size:15px; letter-spacing:2px; color:var(--gold); margin-bottom:4px; }
  .score-tag { font-family:var(--font-mono); font-size:11px; letter-spacing:3px; color:rgba(255,255,255,0.5); text-transform:uppercase; }
  .section-head { font-family:var(--font-display); font-size:13px; letter-spacing:3px; color:var(--aurora-3); text-transform:uppercase; margin-bottom:20px; display:flex; align-items:center; gap:12px; }
  .section-head::after { content:''; flex:1; height:1px; background:linear-gradient(to right,rgba(0,229,255,0.3),transparent); }
  .cards-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; margin-bottom:40px; }

  /* ── COMPAT CARD — HOVER GLOW ── */
  .compat-card {
    background: var(--glass);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    padding: 20px;
    backdrop-filter: blur(12px);
    transition: transform 0.32s ease, border-color 0.32s ease, box-shadow 0.32s ease;
    position: relative;
    overflow: hidden;
    cursor: pointer;
  }
  .compat-card::after {
    content: "";
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.35s ease;
    z-index: 0;
    pointer-events: none;
    border-radius: 16px;
    background: var(--hov, linear-gradient(135deg,rgba(123,47,255,.2),rgba(255,45,120,.14)));
  }
  .compat-card:hover::after { opacity: 1; }
  .compat-card:hover {
    transform: translateY(-8px) scale(1.025);
    border-color: rgba(255,255,255,0.4);
    box-shadow: 0 24px 70px var(--hov-shadow, rgba(123,47,255,.45)), 0 0 50px rgba(255,45,120,.2);
  }
  .compat-card > * { position: relative; z-index: 1; }

  .card-head { display:flex; align-items:center; gap:10px; margin-bottom:14px; }
  .card-emoji { font-size:22px; }
  .card-name { font-family:var(--font-display); font-size:12px; letter-spacing:1px; color:rgba(255,255,255,0.95); flex:1; }
  .card-score-num { font-family:var(--font-mono); font-size:18px; font-weight:700; color:var(--gold); }
  .prog-bar { height:6px; background:rgba(255,255,255,0.08); border-radius:3px; overflow:hidden; margin-bottom:8px; }
  .prog-fill { height:100%; border-radius:3px; background:var(--bar-color,linear-gradient(to right,var(--aurora-1),var(--aurora-2))); transition:width 1.5s cubic-bezier(0.4,0,0.2,1); width:0; }
  .prog-fill.animate { width:var(--target-width,0%); }
  .prog-label { display:flex; justify-content:space-between; font-family:var(--font-mono); font-size:10px; color:rgba(255,255,255,0.55); letter-spacing:1px; }
  .sub-metrics { display:flex; flex-direction:column; gap:10px; }
  .sub-metric-row { display:flex; align-items:center; gap:10px; }
  .sub-metric-label { font-size:13px; color:rgba(255,255,255,0.88); width:130px; flex-shrink:0; font-style:italic; }
  .sub-metric-bar { flex:1; height:4px; background:rgba(255,255,255,0.07); border-radius:2px; overflow:hidden; }
  .sub-metric-fill { height:100%; border-radius:2px; background:var(--fill-c,var(--aurora-3)); transition:width 1.8s cubic-bezier(0.4,0,0.2,1); width:0; }
  .sub-metric-fill.animate { width:var(--w,0%); }
  .sub-metric-val { font-family:var(--font-mono); font-size:11px; color:var(--fill-c,var(--aurora-3)); width:32px; text-align:right; }
  .insight-box { background:rgba(123,47,255,0.08); border:1px solid rgba(123,47,255,0.25); border-radius:12px; padding:14px 16px; margin-top:12px; font-size:14px; font-style:italic; color:rgba(255,255,255,0.82); line-height:1.6; }
  .insight-label { font-family:var(--font-mono); font-size:9px; letter-spacing:3px; color:var(--aurora-1); text-transform:uppercase; margin-bottom:6px; }
  .planet-row { display:grid; grid-template-columns:repeat(auto-fill,minmax(100px,1fr)); gap:12px; margin-bottom:40px; }
  .planet-item { background:var(--glass); border:1px solid var(--glass-border); border-radius:14px; padding:14px 10px; text-align:center; backdrop-filter:blur(8px); transition:transform 0.2s; }
  .planet-item:hover { transform:translateY(-4px); }
  .planet-symbol { font-size:28px; margin-bottom:6px; }
  .planet-name { font-family:var(--font-mono); font-size:9px; letter-spacing:2px; color:rgba(255,255,255,0.75); text-transform:uppercase; margin-bottom:6px; }
  .planet-score { font-family:var(--font-display); font-size:16px; color:var(--gold); }
  .timeline { position:relative; padding:20px 0 20px 30px; margin-bottom:40px; }
  .timeline::before { content:''; position:absolute; left:8px; top:0; bottom:0; width:2px; background:linear-gradient(to bottom,var(--aurora-1),var(--aurora-2),var(--aurora-3)); }
  .tl-item { position:relative; margin-bottom:20px; padding-left:20px; }
  .tl-dot { position:absolute; left:-26px; top:6px; width:12px; height:12px; border-radius:50%; background:var(--dot-c,var(--aurora-1)); border:2px solid var(--void); box-shadow:0 0 12px var(--dot-c,var(--aurora-1)); }
  .tl-phase { font-family:var(--font-mono); font-size:10px; letter-spacing:2px; color:var(--dot-c,var(--aurora-1)); text-transform:uppercase; margin-bottom:3px; }
  .tl-desc { font-size:14px; color:rgba(255,255,255,0.82); font-style:italic; }
  .flags-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:40px; }
  @media(max-width:600px){.flags-grid{grid-template-columns:1fr;}}
  .flags-col { background:var(--glass); border:1px solid var(--glass-border); border-radius:16px; padding:20px; }
  .flags-col-title { font-family:var(--font-mono); font-size:10px; letter-spacing:3px; text-transform:uppercase; margin-bottom:14px; }
  .flag-item { display:flex; align-items:flex-start; gap:10px; margin-bottom:10px; font-size:14px; color:rgba(255,255,255,0.85); font-style:italic; }
  .flag-icon { flex-shrink:0; font-size:16px; }
  .ai-insights-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:14px; margin-bottom:40px; }
  .ai-card { background:linear-gradient(135deg,rgba(123,47,255,0.08),rgba(255,45,120,0.05)); border:1px solid rgba(123,47,255,0.2); border-radius:14px; padding:18px; }
  .ai-card-title { font-family:var(--font-mono); font-size:10px; letter-spacing:3px; color:var(--aurora-1); text-transform:uppercase; margin-bottom:10px; }
  .ai-card-text { font-size:15px; color:rgba(255,255,255,0.85); line-height:1.65; font-style:italic; }
  .reset-btn { display:block; margin:0 auto; padding:14px 40px; background:transparent; border:1px solid rgba(255,255,255,0.2); border-radius:50px; color:rgba(255,255,255,0.75); font-family:var(--font-mono); font-size:11px; letter-spacing:3px; text-transform:uppercase; cursor:pointer; transition:all 0.3s; }
  .reset-btn:hover { border-color:var(--aurora-1); color:var(--aurora-3); box-shadow:0 0 30px rgba(123,47,255,0.2); }
  .error-box { background:rgba(255,45,120,0.1); border:1px solid rgba(255,45,120,0.3); border-radius:12px; padding:14px 18px; color:#ff8ab0; font-family:var(--font-mono); font-size:12px; letter-spacing:1px; margin-bottom:20px; text-align:center; }
  ::-webkit-scrollbar { width:6px; }
  ::-webkit-scrollbar-track { background:var(--void); }
  ::-webkit-scrollbar-thumb { background:rgba(123,47,255,0.4); border-radius:3px; }

  /* ── WHO LOVES MORE ── */
  .wlm-wrap { margin-bottom: 40px; }
  .wlm-card {
    background: linear-gradient(135deg, rgba(255,45,120,.07), rgba(123,47,255,.07));
    border: 1px solid rgba(255,45,120,.25);
    border-radius: 20px;
    padding: 28px 24px;
    position: relative;
    overflow: hidden;
  }
  .wlm-card::before {
    content: "♥";
    position: absolute;
    right: 24px; top: 16px;
    font-size: 80px;
    color: rgba(255,45,120,.06);
    line-height: 1;
  }
  .wlm-disclaimer {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 2px;
    color: rgba(255,255,255,.35);
    text-transform: uppercase;
    margin-bottom: 20px;
    text-align: center;
  }
  .wlm-persons { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
  @media(max-width:560px){ .wlm-persons { grid-template-columns: 1fr; } }
  .wlm-person { text-align: center; }
  .wlm-person-name {
    font-family: var(--font-display);
    font-size: 14px;
    letter-spacing: 1px;
    margin-bottom: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .wlm-ring-wrap {
    width: 130px;
    height: 130px;
    position: relative;
    margin: 0 auto 14px;
  }
  .wlm-ring-svg { width: 130px; height: 130px; transform: rotate(-90deg); position: absolute; top:0; left:0; }
  .wlm-ring-bg { fill: none; stroke: rgba(255,255,255,.07); stroke-width: 10; }
  .wlm-ring-fg { fill: none; stroke-width: 10; stroke-linecap: round; transition: stroke-dashoffset 1.8s cubic-bezier(.4,0,.2,1); }
  .wlm-ring-inner {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 0;
  }
  .wlm-pct-num {
    font-family: var(--font-display);
    font-size: 30px;
    font-weight: 900;
    line-height: 1;
  }
  .wlm-pct-sym { font-size: 14px; color: rgba(255,255,255,.6); font-family: var(--font-mono); margin-top: 2px; }
  .wlm-label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(255,255,255,.5);
    margin-bottom: 6px;
  }
  .wlm-bar-wrap { height: 6px; background: rgba(255,255,255,.08); border-radius: 3px; overflow: hidden; margin-bottom: 6px; }
  .wlm-bar-fill { height: 100%; border-radius: 3px; transition: width 1.8s cubic-bezier(.4,0,.2,1); width: 0; }
  .wlm-bar-fill.animate { width: var(--w, 0%); }
  .wlm-intensity-label {
    font-size: 12px;
    font-style: italic;
    color: rgba(255,255,255,.55);
    font-family: var(--font-body);
    margin-top: 4px;
  }
  .wlm-vs {
    position: relative;
    height: 6px;
    background: rgba(255,255,255,.06);
    border-radius: 3px;
    overflow: hidden;
    margin: 8px 0 20px;
  }
  .wlm-vs-fill1 { position: absolute; left: 0; top: 0; height: 100%; border-radius: 3px 0 0 3px; transition: width 1.8s cubic-bezier(.4,0,.2,1); }
  .wlm-vs-fill2 { position: absolute; right: 0; top: 0; height: 100%; border-radius: 0 3px 3px 0; transition: width 1.8s cubic-bezier(.4,0,.2,1); }
  .wlm-vs-labels { display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 10px; color: rgba(255,255,255,.4); margin-bottom: 4px; }
  .wlm-insight {
    background: rgba(0,0,0,.25);
    border: 1px solid rgba(255,45,120,.18);
    border-radius: 12px;
    padding: 14px 16px;
    margin-bottom: 14px;
  }
  .wlm-insight-lbl { font-family: var(--font-mono); font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,45,120,.7); margin-bottom: 6px; }
  .wlm-insight-txt { font-size: 14px; color: rgba(255,255,255,.85); line-height: 1.7; font-style: italic; }
  .wlm-pattern-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,45,120,.1);
    border: 1px solid rgba(255,45,120,.25);
    border-radius: 50px;
    padding: 6px 16px;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #ff2d78;
    margin-bottom: 14px;
  }
  .wlm-confidence {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-mono);
    font-size: 10px;
    color: rgba(255,255,255,.45);
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-top: 4px;
  }
  .wlm-conf-bar { flex: 1; height: 3px; background: rgba(255,255,255,.08); border-radius: 2px; overflow: hidden; }
  .wlm-conf-fill { height: 100%; background: linear-gradient(to right, #7b2fff, #00e5ff); border-radius: 2px; transition: width 2s ease; width: 0; }
  .wlm-conf-fill.animate { width: var(--w, 0%); }

`;

const styleEl = document.createElement("style");
styleEl.textContent = css;
document.head.appendChild(styleEl);

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

function Starfield() {
  const stars = Array.from({ length: 120 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5,
    d: (Math.random() * 4 + 2).toFixed(1),
    delay: (Math.random() * 6).toFixed(2),
    op: (Math.random() * 0.6 + 0.2).toFixed(2),
  }));
  return (
    <div className="starfield">
      {stars.map(s => (
        <div key={s.id} className="star" style={{ left:`${s.x}%`, top:`${s.y}%`, width:s.size, height:s.size, "--d":`${s.d}s`, "--delay":`${s.delay}s`, "--op":s.op }} />
      ))}
    </div>
  );
}

function PlaceInput({ value, onChange }) {
  const [query, setQuery] = useState(value?.display || "");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const timer = useRef(null);
  const handleChange = (e) => {
    const v = e.target.value; setQuery(v); clearTimeout(timer.current);
    if (v.length < 2) { setResults([]); return; }
    timer.current = setTimeout(async () => { const res = await searchPlaces(v); setResults(res); setOpen(res.length > 0); }, 400);
  };
  const pick = (r) => { setQuery(r.display); onChange(r); setOpen(false); };
  return (
    <div style={{position:"relative"}}>
      <MapPin size={16} style={{position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.4)", zIndex:1, pointerEvents:"none"}}/>
      <input value={query} onChange={handleChange} onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder="Enter city or place of birth" style={{ width:"100%", background:"rgba(20,28,58,0.7)", border:"1px solid rgba(255,255,255,0.08)", borderBottom:"2px solid rgba(255,126,71,0.5)", borderRadius:10, padding:"14px 16px 14px 38px", color:"#fff", fontFamily:"'Inter',sans-serif", fontSize:15, outline:"none" }} />
      {open && (
        <div style={{position:"absolute", top:"calc(100% + 6px)", left:0, right:0, background:"#0d1226", border:"1px solid rgba(255,126,71,0.35)", borderRadius:10, zIndex:100, overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,0.6)"}}>
          {results.map((r, i) => (
            <div key={i} onMouseDown={() => pick(r)} style={{padding:"10px 14px", cursor:"pointer", fontSize:14, color:"rgba(255,255,255,0.9)", borderBottom:"1px solid rgba(255,255,255,0.05)"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,126,71,0.15)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              {r.display}
              <small style={{display:"block", fontSize:11, color:"rgba(255,255,255,0.5)", marginTop:2}}>{r.lat?.toFixed(4)}, {r.lon?.toFixed(4)}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const ccInputStyle = {
  width:"100%", background:"rgba(20,28,58,0.7)", border:"1px solid rgba(255,255,255,0.08)",
  borderBottom:"2px solid rgba(255,126,71,0.5)", borderRadius:10, padding:"14px 16px",
  color:"#fff", fontFamily:"'Inter',sans-serif", fontSize:15, outline:"none",
};
const ccLabelStyle:CSSProperties = { display:"block", color:"#ff7e47", fontWeight:700, fontSize:13, letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:10 };

function PersonForm({ title, symbol, accentColor, data, onChange }) {
  const up = (k, v) => onChange({ ...data, [k]: v });
  return (
    <div style={{background:"rgba(15,20,45,0.55)", border:`1px solid ${accentColor}33`, borderRadius:20, padding:32}}>
      <div style={{display:"flex", alignItems:"center", gap:14, marginBottom:28}}>
        <div style={{width:44, height:44, borderRadius:"50%", background:`${accentColor}22`, display:"flex", alignItems:"center", justifyContent:"center", color:accentColor, fontSize:20, flexShrink:0}}>{symbol}</div>
        <div style={{fontFamily:"'Astra','Cinzel',serif", fontSize:20, fontWeight:700, color:"#fff", textTransform:"uppercase", letterSpacing:"0.05em"}}>{title}</div>
      </div>

      <div style={{marginBottom:20}}>
        <label style={ccLabelStyle}>Full Name *</label>
        <div style={{position:"relative"}}>
          <User size={16} style={{position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.4)", pointerEvents:"none"}}/>
          <input value={data.name} onChange={e => up("name", e.target.value)} placeholder="Enter full name" style={{...ccInputStyle, paddingLeft:38}} />
        </div>
      </div>

      <div style={{marginBottom:20}}>
        <label style={ccLabelStyle}>Date of Birth *</label>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1.3fr", gap:10}}>
          <select value={data.day} onChange={e => up("day", e.target.value)} style={ccInputStyle}>
            <option value="">DD</option>
            {DAYS.map(d => <option key={d} value={d}>{String(d).padStart(2,"0")}</option>)}
          </select>
          <select value={data.month} onChange={e => up("month", e.target.value)} style={ccInputStyle}>
            <option value="">MM</option>
            {MONTHS.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
          </select>
          <select value={data.year} onChange={e => up("year", e.target.value)} style={ccInputStyle}>
            <option value="">YYYY</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div style={{marginBottom:20}}>
        <label style={ccLabelStyle}>Time of Birth <span style={{opacity:0.6, fontWeight:400, textTransform:"none"}}>(Optional)</span></label>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10}}>
          <select value={data.hour} onChange={e => up("hour", e.target.value)} style={ccInputStyle}>
            <option value="">HH</option>
            {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          <select value={data.min} onChange={e => up("min", e.target.value)} style={ccInputStyle}>
            <option value="">MM</option>
            {MINS.filter((_,i) => i%5===0).map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={data.ampm} onChange={e => up("ampm", e.target.value)} style={ccInputStyle}>
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      </div>

      <div style={{marginBottom:0}}>
        <label style={ccLabelStyle}>Place of Birth <span style={{opacity:0.6, fontWeight:400, textTransform:"none"}}>(Optional)</span></label>
        <PlaceInput value={data.place} onChange={v => up("place", v)} />
      </div>
    </div>
  );
}

const LOADING_STEPS = [
  "Reading Birth Charts","Mapping Planetary Positions","Aligning Cosmic Energies",
  "Matching Soul Frequencies","Calculating Love Compatibility","Analyzing Marriage Potential",
  "Generating Personalized Insights","Preparing Universe Report",
];

function LoadingScreen() {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => Math.min(s+1,LOADING_STEPS.length-1)), 700); return () => clearInterval(t); }, []);
  return (
    <div className="loading-screen">
      <div className="loading-cosmos">
        <div className="orbit-ring"><div className="orbit-dot" style={{ background:"#e6e4f5", color:"#e6e4f5" }}/></div>
        <div className="orbit-ring"><div className="orbit-dot" style={{ background:"#7b2fff", color:"#7b2fff" }}/></div>
        <div className="orbit-ring"><div className="orbit-dot" style={{ background:"#00e5ff", color:"#00e5ff" }}/></div>
        <div className="orbit-ring"><div className="orbit-dot" style={{ background:"#00ffaa", color:"#00ffaa" }}/></div>
        <div className="orbit-center"/>
      </div>
      <div className="loading-steps">
        {LOADING_STEPS.map((s,i) => (
          <div key={s} className={`loading-step ${i===step?"active":i<step?"done":""}`}>
            <div className="step-dot"/><span>✨ {s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── WHO LOVES MORE — deterministic from compatibility factors ────────────────
function computeWhoLovesMore(p1, p2, scores) {
  // Factors that indicate emotional investment
  const s = scores;

  // P1 investment signals: emotional score relative to love, high friendship
  // P2 investment signals: spiritual alignment, physical
  const p1Base =
    (s.emotional * 0.35) +
    (s.love * 0.25) +
    (s.friendship * 0.2) +
    (s.marriage * 0.2);

  const p2Base =
    (s.spiritual * 0.35) +
    (s.physical * 0.25) +
    (s.family * 0.2) +
    (s.financial * 0.2);

  // Name-derived tiebreaker (deterministic)
  const n1 = p1.name.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
  const n2 = p2.name.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
  const nameBias = ((n1 - n2) % 15); // -14 to +14 range

  const raw1 = p1Base + nameBias;
  const raw2 = p2Base - nameBias;
  const total = raw1 + raw2;
  let pct1 = Math.round((raw1 / total) * 100);
  let pct2 = 100 - pct1;

  // Clamp to 15-85 range (avoid extremes)
  pct1 = Math.min(85, Math.max(15, pct1));
  pct2 = 100 - pct1;

  // Determine pattern label
  const diff = Math.abs(pct1 - pct2);
  const pattern =
    diff <= 4  ? "Balanced Love" :
    diff <= 12 ? "Slightly More Invested" :
    diff <= 22 ? "Noticeably More Invested" :
    diff <= 35 ? "Deeply Invested" :
                 "One-Sided Attraction";

  const patternEmoji =
    diff <= 4  ? "⚖️" :
    diff <= 12 ? "💛" :
    diff <= 22 ? "💕" :
    diff <= 35 ? "💗" : "❤️‍🔥";

  // Confidence: higher when signals are clear (big diff = more confident)
  const confidence = Math.min(95, 55 + diff * 1.2);

  // Who loves more
  const moreInvested = pct1 >= pct2 ? p1.name : p2.name;
  const lessInvested = pct1 >= pct2 ? p2.name : p1.name;
  const morePct = Math.max(pct1, pct2);
  const lessPct = Math.min(pct1, pct2);

  // Insight text
  const insightMap = [
    { max: 4,  text: `${p1.name} and ${p2.name} share a beautifully balanced emotional investment. Both are equally committed, creating a foundation of mutual love and stability. This rare equilibrium is one of the strongest indicators of lasting partnership.` },
    { max: 12, text: `${moreInvested} tends to be slightly more emotionally expressive and invests just a little more in the relationship. ${lessInvested} is deeply caring too — the difference is subtle and reflects complementary love styles rather than imbalance.` },
    { max: 22, text: `${moreInvested} is noticeably more emotionally invested at this stage, often being the initiator and emotional anchor. ${lessInvested} shows love through actions and loyalty rather than emotional expression. This dynamic can work beautifully when both understand each other's style.` },
    { max: 35, text: `${moreInvested} carries significantly more of the emotional weight in this relationship. Their deep feelings drive the connection forward. ${lessInvested} values the relationship but expresses it differently — understanding this difference is key to harmony.` },
    { max: 100, text: `The emotional intensity is strongly skewed toward ${moreInvested}. This doesn't mean ${lessInvested} doesn't care — it reflects a deeply different emotional expression style. Open communication about love languages could transform this dynamic significantly.` },
  ];
  const insight = insightMap.find(i => diff <= i.max)?.text || insightMap[insightMap.length-1].text;

  // Intensity labels
  const intensity = (pct) =>
    pct >= 75 ? "Deeply Devoted" :
    pct >= 62 ? "Strongly Invested" :
    pct >= 52 ? "Warmly Engaged" :
    pct >= 42 ? "Steadily Present" :
                "Quietly Caring";

  return { pct1, pct2, pattern, patternEmoji, confidence: Math.round(confidence), moreInvested, morePct, lessInvested, lessPct, insight, intensity1: intensity(pct1), intensity2: intensity(pct2) };
}

const ZODIAC_SYMBOLS = {Aries:"♈",Taurus:"♉",Gemini:"♊",Cancer:"♋",Leo:"♌",Virgo:"♍",Libra:"♎",Scorpio:"♏",Sagittarius:"♐",Capricorn:"♑",Aquarius:"♒",Pisces:"♓"};

function ZodiacPortrait({ zodiac, color }) {
  const sym = ZODIAC_SYMBOLS[zodiac] || "✦";
  return (
    <div style={{position:"relative", width:200, height:200, flexShrink:0}}>
      <div style={{position:"absolute", inset:0, borderRadius:"50%", border:`1px solid ${color}33`}}></div>
      <div style={{position:"absolute", inset:16, borderRadius:"50%", background:`radial-gradient(circle, ${color}1f, transparent 72%)`, display:"flex", alignItems:"center", justifyContent:"center"}}>
        <span style={{fontSize:90, color, textShadow:`0 0 40px ${color}55`}}>{sym}</span>
      </div>
      <div style={{position:"absolute", top:6, right:6, width:40, height:40, borderRadius:"50%", background:"rgba(15,20,45,0.85)", border:`1px solid ${color}66`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color}}>{sym}</div>
    </div>
  );
}

const SCORE_TIERS = [
  { min:90, label:"Cosmic Soulmates", desc:"An extraordinary connection written in the stars — rare, deep, and destined." },
  { min:75, label:"Strong Match",     desc:"A powerful connection built on attraction, curiosity, and emotional growth." },
  { min:60, label:"Promising Pair",   desc:"A hopeful bond with real potential, ready to deepen with time and care." },
  { min:0,  label:"Growing Bond",     desc:"An early connection still finding its rhythm — patience will reveal its shape." },
];

function ScoreRing({ score }) {
  const r = 80, circ = 2 * Math.PI * r;
  const [off, setOff] = useState(circ);
  useEffect(() => { const t = setTimeout(() => setOff(circ - (score / 100) * circ), 200); return () => clearTimeout(t); }, [score]);
  const tier = SCORE_TIERS.find(t => score >= t.min);
  return (
    <div style={{textAlign:"center"}}>
      <div style={{position:"relative", width:200, height:200, margin:"0 auto"}}>
        <svg width={200} height={200} viewBox="0 0 180 180" style={{transform:"rotate(-90deg)"}}>
          <defs>
            <linearGradient id="ccScoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffc94a"/>
              <stop offset="100%" stopColor="#ff7e47"/>
            </linearGradient>
          </defs>
          <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10"/>
          <circle cx="90" cy="90" r={r} fill="none" stroke="url(#ccScoreGrad)" strokeWidth="10" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} style={{transition:"stroke-dashoffset 2s cubic-bezier(.4,0,.2,1)"}}/>
        </svg>
        <div style={{position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center"}}>
          <span style={{fontFamily:"'Astra','Cinzel',serif", fontSize:52, fontWeight:800, color:"#fff"}}>{score}<span style={{fontSize:20, color:"rgba(255,255,255,0.6)"}}>%</span></span>
        </div>
      </div>
      <div style={{fontFamily:"'Astra','Cinzel',serif", fontSize:20, color:"#ff7e47", fontWeight:700, marginTop:16, marginBottom:8}}>{tier.label}</div>
      <div style={{color:"rgba(255,255,255,0.6)", fontSize:15, maxWidth:420, margin:"0 auto"}}>{tier.desc}</div>
    </div>
  );
}

function EmotionalBalance({ p1, p2, scores }) {
  const wlm = computeWhoLovesMore(p1, p2, scores);
  const r = 52, circ = 2 * Math.PI * r;
  const offset1 = circ - (wlm.pct1 / 100) * circ;
  const offset2 = circ - (wlm.pct2 / 100) * circ;
  const ref1 = useRef(null), ref2 = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => {
      if (ref1.current) ref1.current.style.strokeDashoffset = offset1;
      if (ref2.current) ref2.current.style.strokeDashoffset = offset2;
    }, 300);
    return () => clearTimeout(t);
  }, []);
  const c1 = "#ff4d6d", c2 = "#a78bfa";
  const summary = wlm.pattern === "Balanced Love"
    ? `${p1.name} and ${p2.name} share an equally balanced emotional investment.`
    : "Both express love differently — one through emotions, the other through actions.";

  const Ring = ({ name, pct, color, r0, intensity }) => (
    <div style={{textAlign:"center"}}>
      <div style={{color, fontFamily:"'Astra','Cinzel',serif", fontSize:16, fontWeight:700, marginBottom:16, textTransform:"uppercase"}}>{name}</div>
      <div style={{position:"relative", width:130, height:130, margin:"0 auto"}}>
        <svg width={130} height={130} viewBox="0 0 120 120" style={{transform:"rotate(-90deg)"}}>
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9"/>
          <circle ref={r0} cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ} style={{transition:"stroke-dashoffset 1.8s cubic-bezier(.4,0,.2,1)"}}/>
        </svg>
        <div style={{position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center"}}>
          <span style={{fontFamily:"'Astra','Cinzel',serif", fontSize:28, fontWeight:800, color}}>{pct}<span style={{fontSize:13}}>%</span></span>
        </div>
      </div>
      <div style={{color:"rgba(255,255,255,0.55)", fontSize:13, marginTop:14, fontStyle:"italic"}}>{intensity}</div>
    </div>
  );

  return (
    <div style={{background:"rgba(15,20,45,0.55)", border:"1px solid rgba(255,126,71,0.2)", borderRadius:20, padding:40}}>
      <div style={{display:"flex", alignItems:"center", justifyContent:"center", gap:60, flexWrap:"wrap"}}>
        <Ring name={p1.name} pct={wlm.pct1} color={c1} r0={ref1} intensity={wlm.intensity1}/>
        <div style={{width:100, height:100, borderRadius:"50%", background:"radial-gradient(circle, rgba(255,126,71,0.18), transparent 70%)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
          <Heart size={38} color="#ff7e47" fill="#ff7e47" fillOpacity={0.2}/>
        </div>
        <Ring name={p2.name} pct={wlm.pct2} color={c2} r0={ref2} intensity={wlm.intensity2}/>
      </div>
      <div style={{textAlign:"center", color:"rgba(255,255,255,0.65)", fontSize:15, fontStyle:"italic", marginTop:32}}>{summary}</div>
    </div>
  );
}

const COMPAT_PRESET_QS = [
  { icon:Heart, text:"Why do we fight?" },
  { icon:InfinityIcon, text:"Is this long-term?" },
  { icon:MessageCircle, text:"How can we improve communication?" },
  { icon:User, text:"What does my partner need emotionally?" },
];

function getCompatFallback(question, p1, p2, s) {
  const q = question.toLowerCase();
  if (q.includes("fight") || q.includes("argue") || q.includes("conflict")) {
    return `${p1.name} and ${p2.name}, most friction between you likely stems from different emotional processing styles rather than a lack of care. With a ${s.emotional}% emotional compatibility score, small misunderstandings can escalate faster than they should — pausing before reacting, and naming what you actually feel instead of what you assume the other meant, resolves most of it.`;
  }
  if (q.includes("long") || q.includes("future") || q.includes("last")) {
    return `With a ${s.marriage}% long-term potential score, ${p1.name} and ${p2.name} have real staying power — but longevity isn't guaranteed by the stars alone. Consistency, shared goals, and how you handle hard seasons together matter more than the initial spark.`;
  }
  if (q.includes("communicat")) {
    return `Your communication compatibility sits at ${s.emotional}%. The biggest improvement usually comes from timing — raising sensitive topics when you're both calm, not mid-conflict — and reflecting back what you heard before responding.`;
  }
  if (q.includes("need") || q.includes("emotional")) {
    return `${p1.name} tends to need to feel emotionally seen and acknowledged, while ${p2.name} often needs reassurance through consistency and follow-through. Naming these needs directly — instead of expecting the other to guess — closes most emotional gaps quickly.`;
  }
  return `${p1.name} and ${p2.name}, your ${s.overall}% overall compatibility suggests a genuinely strong foundation. Like any real connection, the specifics matter less than how you both choose to show up for each other, especially when things get hard.`;
}

function CompatChat({ p1, p2, scores }) {
  const [msgs, setMsgs] = useState([{ role:"ai", text:`Ask me anything about ${p1.name} and ${p2.name}'s connection — every answer is based on your actual compatibility scores.` }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    endRef.current?.scrollIntoView({ behavior:"smooth", block:"nearest" });
  }, [msgs]);

  const send = (q?: string) => {
    const question = q || input.trim();
    if (!question || loading) return;
    setInput("");
    setMsgs(m => [...m, { role:"user", text:question }]);
    setLoading(true);
    setTimeout(() => {
      setMsgs(m => [...m, { role:"ai", text:getCompatFallback(question, p1, p2, scores) }]);
      setLoading(false);
    }, 900);
  };

  return (
    <div style={{background:"rgba(15,20,45,0.55)", border:"1px solid rgba(255,126,71,0.2)", borderRadius:20, padding:28}}>
      <div style={{display:"flex", gap:10, flexWrap:"wrap", marginBottom:20}}>
        {COMPAT_PRESET_QS.map(({ icon:Icon, text }) => (
          <button key={text} onClick={() => !loading && send(text)}
            style={{display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:30, padding:"10px 16px", color:"#e8e0f0", fontSize:13, cursor:"pointer"}}>
            <Icon size={14} color="#ff7e47"/> {text}
          </button>
        ))}
      </div>

      <div style={{maxHeight:280, overflowY:"auto", display:"flex", flexDirection:"column", gap:12, marginBottom:16}}>
        {msgs.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth:"85%", padding:"12px 16px", borderRadius:12, fontSize:14, lineHeight:1.6,
            background: m.role === "user" ? "rgba(255,126,71,0.15)" : "rgba(255,255,255,0.04)",
            border: m.role === "user" ? "1px solid rgba(255,126,71,0.3)" : "1px solid rgba(255,255,255,0.08)",
            color:"#e8e0f0",
          }}>
            {m.text}
          </div>
        ))}
        {loading && <div style={{fontSize:13, color:"rgba(255,255,255,0.4)", fontStyle:"italic"}}>Consulting the stars...</div>}
        <div ref={endRef}/>
      </div>

      <div style={{display:"flex", gap:10}}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !loading && send()}
          placeholder="Ask anything about your compatibility..."
          style={{flex:1, background:"rgba(20,28,58,0.7)", border:"1px solid rgba(255,255,255,0.08)", borderBottom:"2px solid rgba(255,126,71,0.5)", borderRadius:10, padding:"14px 16px", color:"#fff", fontFamily:"'Inter',sans-serif", fontSize:14, outline:"none"}}/>
        <button onClick={() => send()} disabled={loading || !input.trim()}
          style={{width:48, height:48, borderRadius:"50%", background:"#ff7e47", border:"none", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, opacity:loading || !input.trim() ? 0.5 : 1}}>
          <Send size={18}/>
        </button>
      </div>
    </div>
  );
}

function Results({ p1, p2, report, onReset }) {
  const s = report.scores;
  const communication = deriveScore(s.emotional, p1.name, p2.name, "comm2");

  const SNAPSHOT = [
    { icon:Heart,         label:"Love & Romance",         value:s.love,      color:"#ff6b8a", desc:"Deep affection and romantic connection." },
    { icon:Brain,         label:"Emotional Understanding",value:s.emotional, color:"#a78bfa", desc:"You understand each other well." },
    { icon:Flame,         label:"Physical Chemistry",     value:s.physical,  color:"#ff7e47", desc:"Strong attraction and natural chemistry." },
    { icon:Star,          label:"Long-Term Potential",    value:s.marriage,  color:"#60a5fa", desc:"Great potential for a lasting future." },
    { icon:MessageCircle, label:"Communication",          value:communication,color:"#4ade80", desc:"Open conversations keep you connected." },
  ];

  const WORKS_WELL = [
    { icon:Heart,       title:"Strong Emotional Pull",         desc:"You naturally draw each other in." },
    { icon:Puzzle,      title:"Different But Complementary",   desc:"Your differences make you stronger together." },
    { icon:TrendingUp,  title:"Growth-Oriented Bond",          desc:"You inspire each other to grow." },
  ];
  const NEEDS_CARE = [
    { icon:MessageSquare, title:"Communication Gaps", desc:"Misunderstandings can create distance." },
    { icon:User,          title:"Personal Space",     desc:"Both need room to be independent." },
    { icon:CalendarDays,  title:"Future Planning",    desc:"Align your goals and long-term vision." },
  ];
  const DO_MORE = ["Talk openly", "Respect each other's emotional style", "Build trust through consistency"];
  const AVOID_L = ["Testing each other's love", "Expecting instant clarity", "Ignoring small issues"];

  const cardStyle = { background:"rgba(15,20,45,0.55)", border:"1px solid rgba(255,126,71,0.2)", borderRadius:16, padding:28 };
  const sectionTitle: CSSProperties = { fontFamily:"'Astra','Cinzel',serif", fontSize:26, color:"#fff", fontWeight:700, textAlign:"center", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:36 };

  return (
    <div style={{maxWidth:1200, margin:"0 auto", padding:"20px 24px 100px", color:"#e8e0f0", fontFamily:"'Inter',sans-serif"}}>

      {/* ── HERO ── */}
      <div style={{textAlign:"center", marginBottom:20, paddingTop:20}}>
        <div style={{fontFamily:"'Astra','Cinzel',serif", fontSize:"clamp(30px,5vw,48px)", color:"#fff", fontWeight:700, letterSpacing:"0.04em"}}>
          {p1.name} <span style={{color:"#ff7e47"}}>✦</span> {p2.name}
        </div>
        <div style={{color:"#ff7e47", fontWeight:600, fontSize:15, letterSpacing:"0.05em", textTransform:"uppercase", marginTop:10}}>
          Universe Compatibility Analysis · {p1.zodiac} & {p2.zodiac}
        </div>
      </div>

      <div style={{display:"flex", alignItems:"center", justifyContent:"center", gap:40, marginBottom:80, flexWrap:"wrap"}}>
        <ZodiacPortrait zodiac={p1.zodiac} color="#ffc94a"/>
        <ScoreRing score={s.overall}/>
        <ZodiacPortrait zodiac={p2.zodiac} color="#60a5fa"/>
      </div>

      {/* ── COMPATIBILITY SNAPSHOT ── */}
      <div style={{marginBottom:80}}>
        <div style={sectionTitle}>Compatibility Snapshot</div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:20}}>
          {SNAPSHOT.map(m => { const Icon = m.icon; return (
            <div key={m.label} style={cardStyle}>
              <div style={{width:48, height:48, borderRadius:"50%", background:`${m.color}22`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px"}}>
                <Icon size={22} color={m.color}/>
              </div>
              <div style={{color:"#fff", fontWeight:700, fontSize:15, textAlign:"center", marginBottom:10}}>{m.label}</div>
              <div style={{fontFamily:"'Astra','Cinzel',serif", fontSize:28, fontWeight:800, color:m.color, textAlign:"center", marginBottom:10}}>{m.value}%</div>
              <div style={{color:"rgba(255,255,255,0.55)", fontSize:13, textAlign:"center", lineHeight:1.5}}>{m.desc}</div>
            </div>
          );})}
        </div>
      </div>

      {/* ── EMOTIONAL BALANCE ── */}
      <div style={{marginBottom:80}}>
        <div style={sectionTitle}>Emotional Balance</div>
        <EmotionalBalance p1={p1} p2={p2} scores={s}/>
      </div>

      {/* ── WHAT WORKS / NEEDS CARE ── */}
      <div style={{marginBottom:80}}>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:24}}>
          <div style={cardStyle}>
            <div style={{color:"#4ade80", fontWeight:700, fontSize:16, letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:24, textAlign:"center"}}>What Works Well</div>
            {WORKS_WELL.map(w => { const Icon = w.icon; return (
              <div key={w.title} style={{display:"flex", gap:14, marginBottom:20}}>
                <div style={{width:40, height:40, borderRadius:"50%", background:"rgba(74,222,128,0.12)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}><Icon size={18} color="#4ade80"/></div>
                <div><div style={{color:"#fff", fontWeight:700, fontSize:15, marginBottom:3}}>{w.title}</div><div style={{color:"rgba(255,255,255,0.55)", fontSize:14}}>{w.desc}</div></div>
              </div>
            );})}
          </div>
          <div style={cardStyle}>
            <div style={{color:"#f87171", fontWeight:700, fontSize:16, letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:24, textAlign:"center"}}>What Needs Care</div>
            {NEEDS_CARE.map(w => { const Icon = w.icon; return (
              <div key={w.title} style={{display:"flex", gap:14, marginBottom:20}}>
                <div style={{width:40, height:40, borderRadius:"50%", background:"rgba(248,113,113,0.12)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}><Icon size={18} color="#f87171"/></div>
                <div><div style={{color:"#fff", fontWeight:700, fontSize:15, marginBottom:3}}>{w.title}</div><div style={{color:"rgba(255,255,255,0.55)", fontSize:14}}>{w.desc}</div></div>
              </div>
            );})}
          </div>
        </div>
      </div>

      {/* ── BEST RELATIONSHIP ADVICE ── */}
      <div style={{marginBottom:80}}>
        <div style={sectionTitle}>Best Relationship Advice</div>
        <div style={cardStyle}>
          <div style={{display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:32, alignItems:"start"}}>
            <div>
              <div style={{color:"#4ade80", fontWeight:700, fontSize:14, letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:16}}>Do More Of This</div>
              {DO_MORE.map(t => (<div key={t} style={{display:"flex", alignItems:"center", gap:8, marginBottom:12, fontSize:14, color:"#f8f8f8"}}><CheckCircle2 size={16} color="#4ade80"/> {t}</div>))}
            </div>
            <div style={{width:90, height:90, borderRadius:"50%", background:"radial-gradient(circle, rgba(255,126,71,0.15), transparent 70%)", display:"flex", alignItems:"center", justifyContent:"center"}}>
              <Heart size={34} color="#ff7e47"/>
            </div>
            <div>
              <div style={{color:"#f87171", fontWeight:700, fontSize:14, letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:16}}>Avoid This</div>
              {AVOID_L.map(t => (<div key={t} style={{display:"flex", alignItems:"center", gap:8, marginBottom:12, fontSize:14, color:"#f8f8f8"}}><XCircle size={16} color="#f87171"/> {t}</div>))}
            </div>
          </div>
        </div>
      </div>

      {/* ── ASK ABOUT YOUR CONNECTION ── */}
      <div style={{marginBottom:60}}>
        <div style={sectionTitle}>Ask About Your Connection</div>
        <CompatChat p1={p1} p2={p2} scores={s}/>
      </div>

      <button onClick={onReset} style={{display:"block", margin:"0 auto 16px", padding:"16px 44px", background:"#ff7e47", border:"none", borderRadius:40, color:"#fff", fontWeight:700, fontSize:16, cursor:"pointer"}}>
        New Compatibility Reading ✦
      </button>
      <div style={{textAlign:"center", color:"rgba(255,255,255,0.35)", fontSize:12, display:"flex", justifyContent:"center", gap:16, alignItems:"center"}}>
        <span style={{display:"flex", alignItems:"center", gap:5}}><Lock size={12}/> AI-Powered</span>
        <span>·</span><span>Private</span><span>·</span><span>Secure</span>
      </div>
    </div>
  );
}

const empty = () => ({ name:"", day:"", month:"", year:"", hour:"", min:"", ampm:"AM", place:null });

export default function App() {
  const [p1,setP1] = useState(empty());
  const [p2,setP2] = useState(empty());
  const [phase,setPhase] = useState("form");
  const [report,setReport] = useState(null);
  const [error,setError] = useState("");

  // Scroll offset carries over across phase changes (nothing resets it), so
  // without this the loading/results views can open scrolled down wherever
  // the user had scrolled the (long) form to instead of at the top.
  useEffect(() => { window.scrollTo(0, 0); }, [phase]);

  // Back button returns to form from loading/results phases
  useBackOverride(
    phase !== "form" ? () => { setPhase("form"); setReport(null); setError(""); } : null,
    [phase],
  );

  const compute = useCallback(async () => {
    setError("");
    if (!p1.name||!p2.name||!p1.day||!p1.month||!p1.year||!p2.day||!p2.month||!p2.year) {
      setError("Please fill in the required fields (Name & Date of Birth) for both persons."); return;
    }
    setPhase("loading");
    const z1=getZodiac(+p1.day,+p1.month), z2=getZodiac(+p2.day,+p2.month);
    const dob1=`${p1.year}-${String(p1.month).padStart(2,"0")}-${String(p1.day).padStart(2,"0")}`;
    const dob2=`${p2.year}-${String(p2.month).padStart(2,"0")}-${String(p2.day).padStart(2,"0")}`;
    const lp1=getLifePath(dob1), lp2=getLifePath(dob2);
    const seed=p1.name+p2.name+dob1+dob2;
    const hash=seed.split("").reduce((a,c)=>(a*31+c.charCodeAt(0))&0xffff,0);
    const base=60+(hash%35);
    const scores={
      overall:Math.min(99,base+5), love:deriveScore(base,p1.name,p2.name,"love"),
      emotional:deriveScore(base,p1.name,p2.name,"emo"), physical:deriveScore(base,p1.name,p2.name,"phys"),
      friendship:deriveScore(base,p1.name,p2.name,"fri"), marriage:deriveScore(base,p1.name,p2.name,"mar"),
      financial:deriveScore(base,p1.name,p2.name,"fin"), family:deriveScore(base,p1.name,p2.name,"fam"),
      spiritual:deriveScore(base,p1.name,p2.name,"spi"),
    };
    await new Promise(r=>setTimeout(r,5600));
    setP1(prev=>({...prev,zodiac:z1,lifePath:lp1}));
    setP2(prev=>({...prev,zodiac:z2,lifePath:lp2}));
    setReport({scores});
    setPhase("results");
  },[p1,p2]);

  return (
    <div className="universe-app">
      <Starfield/>
      <div className="nebula-blob" style={{width:600,height:600,top:"-200px",left:"-200px",background:"radial-gradient(circle,rgba(123,47,255,0.15),transparent 70%)",animationDuration:"18s"}}/>
      <div className="nebula-blob" style={{width:500,height:500,bottom:"10%",right:"-150px",background:"radial-gradient(circle,rgba(255,45,120,0.12),transparent 70%)",animationDuration:"22s",animationDelay:"3s"}}/>
      <div className="nebula-blob" style={{width:400,height:400,top:"40%",left:"30%",background:"radial-gradient(circle,rgba(0,229,255,0.07),transparent 70%)",animationDuration:"25s",animationDelay:"6s"}}/>
      {phase==="loading" && <LoadingScreen/>}
      <div className="content" style={{display:phase==="loading"?"none":"block"}}>
        {phase==="form" && (
          <>
            <div style={{textAlign:"center", padding:"60px 20px 40px"}}>
              <div style={{display:"flex", alignItems:"center", justifyContent:"center", gap:16, marginBottom:24}}>
                <div style={{width:80, height:1, background:"linear-gradient(90deg, transparent, rgba(255,126,71,0.6))"}}></div>
                <div style={{color:"#f8f8f8", fontStyle:"italic", fontSize:15, whiteSpace:"nowrap", letterSpacing:"0.1em", textTransform:"uppercase"}}>
                  <span style={{color:"#ff7e47"}}>✦</span> Universe Relationship Analyzer <span style={{color:"#ff7e47"}}>✦</span>
                </div>
                <div style={{width:80, height:1, background:"linear-gradient(90deg, rgba(255,126,71,0.6), transparent)"}}></div>
              </div>
              <h1 style={{fontFamily:"'Astra','Cinzel',serif", fontSize:"clamp(30px,5vw,48px)", fontWeight:700, color:"#fff", letterSpacing:"0.05em", textTransform:"uppercase", lineHeight:1.25, marginBottom:20}}>
                Cosmic Compatibility<br/><span style={{color:"#ff7e47"}}>Oracle</span>
              </h1>
              <p style={{color:"#f8f8f8", fontStyle:"italic", fontSize:18}}>Let The Universe Reveal The Truth Of Your Connection</p>
            </div>
            <div style={{maxWidth:1000, margin:"0 auto", padding:"20px 24px 80px"}}>
              {error && <div style={{background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:10, padding:"12px 16px", color:"#f87171", fontSize:14, marginBottom:24, textAlign:"center"}}>⚠ {error}</div>}
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, marginBottom:32}}>
                <PersonForm title="Divine Feminine" symbol="♀" accentColor="#c084fc" data={p2} onChange={setP2}/>
                <PersonForm title="Divine Masculine" symbol="♂" accentColor="#60a5fa" data={p1} onChange={setP1}/>
              </div>
              <button
                onClick={compute}
                style={{display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%", maxWidth:420, margin:"0 auto", padding:"18px", background:"#ff7e47", border:"none", borderRadius:40, color:"#fff", fontWeight:700, fontSize:16, cursor:"pointer", transition:"transform 0.2s ease, box-shadow 0.2s ease"}}
                onMouseOver={e=>{e.currentTarget.style.transform="translateY(-2px)";}}
                onMouseOut={e=>{e.currentTarget.style.transform="translateY(0)";}}
              >
                Begin Journey <ArrowRight size={18}/>
              </button>
            </div>
          </>
        )}
        {phase==="results" && report && (
          <Results p1={p1} p2={p2} report={report} onReset={()=>{setPhase("form");setReport(null);setP1(empty());setP2(empty());}}/>
        )}
      </div>
    </div>
  );
}