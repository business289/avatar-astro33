import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  baseOp: number;
  ampOp: number;
  speed: number;
  phase: number;
  warm: boolean;
}

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false })!;

    let W = 0, H = 0, dpr = 1;
    let rafId: number;
    let stars: Star[] = [];

    const makePRNG = (seed0: number) => {
      let seed = seed0;
      return () => {
        seed = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b);
        seed = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b);
        seed ^= seed >>> 16;
        return (seed >>> 0) / 0xffffffff;
      };
    };

    const buildStars = () => {
      const rand = makePRNG(0x9e3779b9);
      stars = [];
      for (let i = 0; i < 140; i++) {
        const baseOp = 0.08 + rand() * 0.26;
        const twinkles = rand() < 0.62;
        stars.push({
          x: rand() * W,
          y: rand() * H,
          r: 0.30 + rand() * 0.95,
          baseOp,
          ampOp: twinkles ? 0.04 + rand() * 0.16 : 0,
          speed: 0.35 + rand() * 1.1,
          phase: rand() * Math.PI * 2,
          warm: rand() > 0.5,
        });
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width  = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStars();
    };

    const drawBg = () => {
      // Base: rich deep space blue
      ctx.fillStyle = "#081426";
      ctx.fillRect(0, 0, W, H);

      const cx = W * 0.5;
      const cy = H * 0.44;

      // Central depth glow — midnight blue radial
      const depth = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.72);
      depth.addColorStop(0,    "rgba(13, 27, 51, 0.65)");
      depth.addColorStop(0.45, "rgba(8, 18, 40, 0.40)");
      depth.addColorStop(1,    "rgba(5, 11, 24, 0)");
      ctx.fillStyle = depth;
      ctx.fillRect(0, 0, W, H);

      // Vignette — darkens corners
      const vig = ctx.createRadialGradient(
        cx, cy, Math.min(W, H) * 0.28,
        cx, cy, Math.max(W, H) * 0.88
      );
      vig.addColorStop(0, "rgba(0, 0, 0, 0)");
      vig.addColorStop(1, "rgba(0, 2, 8, 0.72)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);
    };

    const loop = () => {
      drawBg();

      const t = Date.now() * 0.001;
      for (const s of stars) {
        const op = s.ampOp > 0
          ? s.baseOp + s.ampOp * (Math.sin(t * s.speed + s.phase) * 0.5 + 0.5)
          : s.baseOp;
        ctx.globalAlpha = Math.max(0, Math.min(1, op));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 6.2832);
        ctx.fillStyle = s.warm ? "rgb(220, 215, 255)" : "rgb(185, 205, 255)";
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(loop);
    };

    resize();
    loop();

    window.addEventListener("resize", resize, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      "fixed",
        top:           0,
        left:          0,
        width:         "100%",
        height:        "100%",
        zIndex:        -2,
        display:       "block",
        pointerEvents: "none",
        backgroundColor: "transparent",
      }}
      aria-hidden="true"
    />
  );
}
