import { useEffect, useRef } from "react";

/**
 * CosmicBackground — Deep navy static background with minimal star field.
 * No animation, no movement. Drawn once per mount/resize.
 */
export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false })!;

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W   = window.innerWidth;
      const H   = window.innerHeight;

      canvas.width  = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width  = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // ── Base: deep navy ─────────────────────────────────────────────────
      ctx.fillStyle = "#020B1F";
      ctx.fillRect(0, 0, W, H);

      // ── Central depth glow: midnight blue radial ─────────────────────────
      const cx = W * 0.5;
      const cy = H * 0.44;
      const depth = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.72);
      depth.addColorStop(0,    "rgba(18, 58, 117, 0.60)");  // #123A75 centre
      depth.addColorStop(0.40, "rgba(11, 42,  91, 0.38)");  // #0B2A5B mid
      depth.addColorStop(1,    "rgba( 2, 11,  31, 0)");     // fade to base
      ctx.fillStyle = depth;
      ctx.fillRect(0, 0, W, H);

      // ── Vignette: darkens corners & edges ───────────────────────────────
      const vig = ctx.createRadialGradient(cx, cy, Math.min(W, H) * 0.28, cx, cy, Math.max(W, H) * 0.88);
      vig.addColorStop(0, "rgba(0, 0,  0, 0)");
      vig.addColorStop(1, "rgba(0, 4, 14, 0.72)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      // ── Minimal static stars ─────────────────────────────────────────────
      // Deterministic PRNG (LCG) so positions are consistent on re-draw.
      let seed = 0x9e3779b9;
      const rand = () => {
        seed = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b);
        seed = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b);
        seed ^= seed >>> 16;
        return (seed >>> 0) / 0xffffffff;
      };

      const STAR_COUNT = 52;

      for (let i = 0; i < STAR_COUNT; i++) {
        const x  = rand() * W;
        const y  = rand() * H;
        const r  = 0.4 + rand() * 0.75;          // 0.4 – 1.15 px
        const op = 0.12 + rand() * 0.28;          // 0.12 – 0.40 opacity

        ctx.globalAlpha = op;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 6.2832);
        ctx.fillStyle = op > 0.28
          ? "rgb(210, 222, 255)"   // slightly warmer blue-white
          : "rgb(180, 200, 255)";  // cooler dim stars
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    };

    draw();

    const onResize = () => draw();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:        "fixed",
        top:             0,
        left:            0,
        width:           "100%",
        height:          "100%",
        zIndex:          -2,
        display:         "block",
        pointerEvents:   "none",
        backgroundColor: "transparent",
      }}
      aria-hidden="true"
    />
  );
}
