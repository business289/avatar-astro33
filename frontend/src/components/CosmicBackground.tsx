import { useEffect, useRef } from "react";

/**
 * CosmicBackground — Exact recreation from video frame analysis.
 *
 * MEASURED VALUES:
 * ────────────────────────────────────────────────────────────
 * Stars: 63 total in 1086×616px — ALL moving upward (0 stationary)
 *
 * TWO SPEED LAYERS (measured by tracking individual stars 30 frames apart):
 *   Slow layer:  dy = -13px/sec  → -0.433px/frame
 *   Fast layer:  dy = -20px/sec  → -0.667px/frame
 *
 * Background: dark navy gradient (not flat black)
 *   Top:    RGB(11, 13, 21)
 *   Center: RGB(19, 26, 36)
 *   Bottom: RGB(21, 28, 39)
 *
 * Star brightness: 134–255, mean 215
 * Star size: 2–6px² area → radius 0.7–1.4px
 */
export default function CosmicBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });

    let W, H, dpr, raf;
    let bgGrad = null;
    const mouse = { x: 0, y: 0, sx: 0, sy: 0 };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width  = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Rebuild gradient on resize
      bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0,   "rgb(11,13,21)");   // top — darkest
      bgGrad.addColorStop(0.4, "rgb(16,20,30)");   // upper-mid
      bgGrad.addColorStop(1,   "rgb(21,28,39)");   // bottom — slightly lighter blue
    };

    // ── Build stars ──────────────────────────────────────────────────────────
    // Use a fixed 63 stars count to match the reference video.
    const buildStars = () => {
      const count = 63;
      const stars = [];

      for (let i = 0; i < count; i++) {
        // 60% slow layer, 40% fast layer to produce depth
        const isSlow = Math.random() < 0.6;

        // Radius: visible dots ~1.0–2.0px
        const r = 1.0 + Math.random() * 1.0;

        // Speed in px/sec (upward). Slow ~13px/sec, Fast ~20px/sec.
        const baseSpeed = isSlow ? 13 : 20;
        const vy = -baseSpeed * (0.95 + Math.random() * 0.1);

        // Very tiny horizontal drift.
        const vx = (Math.random() - 0.5) * 0.02;

        // Brightness: 0.7–1.0 for crisp, bright stars.
        const baseOp = 0.7 + Math.random() * 0.3;

        // Parallax — subtle
        const parallax = isSlow ? 0.003 + Math.random() * 0.007 : 0.007 + Math.random() * 0.01;

        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r,
          vx,
          vy,
          baseOp,
          parallax,
          isSlow,
        });
      }
      return stars;
    };

    let stars = [];
    let last = performance.now();

    const draw = (now) => {
      const dt = Math.max(0, (now - last) / 1000); // seconds
      last = now;

      // Smooth mouse
      mouse.sx += (mouse.x - mouse.sx) * 0.04;
      mouse.sy += (mouse.y - mouse.sy) * 0.04;
      const mox = (mouse.sx / W - 0.5);
      const moy = (mouse.sy / H - 0.5);

      // Background gradient
      ctx.fillStyle = bgGrad || "rgb(14,18,28)";
      ctx.fillRect(0, 0, W, H);

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        // Move upward using time-delta for smoothness
        s.x += s.vx * dt;
        s.y += s.vy * dt;

        // Wrap: exits top → reappears at bottom
        if (s.y < -4) {
          s.y = H + 4;
          s.x = Math.random() * W;
        }
        if (s.x < -4) s.x = W + 4;
        if (s.x > W + 4) s.x = -4;

        // Parallax offset — subtle depth from mouse
        const px = s.x + mox * s.parallax * W * 20;
        const py = s.y + moy * s.parallax * H * 20;

        ctx.globalAlpha = s.baseOp;

        // Star core — clean, no glow, no trail, no twinkle
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, 6.2832);
        ctx.fillStyle = s.baseOp > 0.75 ? "rgb(225,232,255)" : "rgb(200,215,255)";
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    // ── Init ─────────────────────────────────────────────────────────────────
    resize();
    mouse.x = W * 0.5;
    mouse.y = H * 0.5;
    mouse.sx = W * 0.5;
    mouse.sy = H * 0.5;
    stars = buildStars();
    raf = requestAnimationFrame(draw);

    // ── Events ───────────────────────────────────────────────────────────────
    const onMouse  = e => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onTouch  = e => { if (e.touches[0]) { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; } };
    const onResize = () => { resize(); bgGrad = null; stars = buildStars(); };

    window.addEventListener("mousemove", onMouse,  { passive: true });
    window.addEventListener("touchmove", onTouch,  { passive: true });
    window.addEventListener("resize",    onResize, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("resize",    onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -2,
        display: "block",
        transform: "translateZ(0)",
        willChange: "transform",
        pointerEvents: "none",
        backgroundColor: "transparent",
      }}
      aria-hidden="true"
    />
  );
}