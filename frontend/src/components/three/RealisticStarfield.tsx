import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  baseSize: number;
  baseOpacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
  layer: number;
  parallaxFactor: number;
}

const RealisticStarfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const heroStarsRef = useRef<Star[]>([]);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
    const ease = (value: number) => value * value * (3 - 2 * value);

    const resetCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      sizeRef.current = { width, height, dpr };
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      initStarfield(width, height);
    };

    const initStarfield = (width: number, height: number) => {
      starsRef.current = [];
      heroStarsRef.current = [];

      const clusterCenters = Array.from({ length: 7 }, () => ({
        x: (Math.random() - 0.5) * width * 0.82,
        y: (Math.random() - 0.5) * height * 0.6,
        radius: 70 + Math.random() * 100,
      }));

      const layerDefinitions = [
        { count: 220, sizeRange: [0.28, 0.7], opacityRange: [0.12, 0.26], speed: 0.28, layer: 0.6 },
        { count: 160, sizeRange: [0.72, 1.3], opacityRange: [0.20, 0.44], speed: 0.52, layer: 1.0 },
        { count: 90, sizeRange: [1.2, 2.0], opacityRange: [0.38, 0.82], speed: 0.92, layer: 1.6 },
        { count: 20, sizeRange: [2.8, 4.4], opacityRange: [0.35, 0.78], speed: 1.45, layer: 2.2 },
      ];

      layerDefinitions.forEach((definition) => {
        for (let i = 0; i < definition.count; i++) {
          const isCluster = Math.random() < 0.16;
          const cluster = isCluster ? clusterCenters[Math.floor(Math.random() * clusterCenters.length)] : null;
          const x = cluster
            ? clamp(cluster.x + (Math.random() - 0.5) * cluster.radius, -width * 0.45, width * 0.45)
            : (Math.random() - 0.5) * width * 0.9;
          const y = cluster
            ? clamp(cluster.y + (Math.random() - 0.5) * cluster.radius, -height * 0.42, height * 0.42)
            : (Math.random() - 0.5) * height * 0.9;

          starsRef.current.push({
            x,
            y,
            z: Math.random(),
            baseSize: definition.sizeRange[0] + Math.random() * (definition.sizeRange[1] - definition.sizeRange[0]),
            baseOpacity: definition.opacityRange[0] + Math.random() * (definition.opacityRange[1] - definition.opacityRange[0]),
            twinkleSpeed: 0.6 + Math.random() * 1.6,
            twinklePhase: Math.random() * Math.PI * 2,
            layer: definition.layer,
            parallaxFactor: definition.speed,
          });
        }
      });

      for (let i = 0; i < 5; i++) {
        heroStarsRef.current.push({
          x: (Math.random() - 0.5) * width * 0.45,
          y: (Math.random() - 0.5) * height * 0.32,
          z: 0.06 + Math.random() * 0.16,
          baseSize: 2.8 + Math.random() * 3.2,
          baseOpacity: 0.72 + Math.random() * 0.2,
          twinkleSpeed: 0.35 + Math.random() * 0.66,
          twinklePhase: Math.random() * Math.PI * 2,
          layer: 2.6,
          parallaxFactor: 1.5,
        });
      }
    };

    const drawStar = (star: Star, time: number, density: number) => {
      const { width, height } = sizeRef.current;
      const scrollRatio = clamp(scrollRef.current / (height * 1.65), 0, 1);
      const shiftedZ = (star.z - scrollRatio * star.parallaxFactor + 2) % 1;
      const depth = 1 - shiftedZ;
      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const perspective = 0.3 + depth * 0.72;
      const x = centerX + star.x * perspective + (mouseRef.current.x - centerX) * 0.0022 * star.layer;
      const y = centerY + star.y * perspective + (mouseRef.current.y - centerY) * 0.0022 * star.layer;
      const radius = star.baseSize * (0.75 + depth * 1.75);
      const twinkle = 0.72 + Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.26;
      const alpha = clamp(star.baseOpacity * (0.4 + density * 0.6) * twinkle * (0.55 + depth * 0.7), 0, 1);

      if (radius > 1.4) {
        const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 3.2);
        glow.addColorStop(0, `rgba(255,255,255,${alpha * 0.28})`);
        glow.addColorStop(0.22, `rgba(250,250,255,${alpha * 0.14})`);
        glow.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, radius * 3.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(x, y, radius * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    };

    const drawHeroStar = (star: Star, time: number, density: number) => {
      const { width, height } = sizeRef.current;
      const scrollRatio = clamp(scrollRef.current / (height * 1.65), 0, 1);
      const shiftedZ = (star.z - scrollRatio * star.parallaxFactor + 2) % 1;
      const depth = 1 - shiftedZ;
      const centerX = width * 0.5;
      const centerY = height * 0.45;
      const x = centerX + star.x * (0.88 + depth * 0.42) + (mouseRef.current.x - centerX) * 0.003 * star.layer;
      const y = centerY + star.y * (0.88 + depth * 0.42) + (mouseRef.current.y - centerY) * 0.003 * star.layer;
      const radius = star.baseSize * (1 + depth * 2.4);
      const twinkle = 0.78 + Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.18;
      const alpha = clamp(star.baseOpacity * (0.65 + density * 0.5) * twinkle * (0.65 + depth * 0.6), 0, 1);
      const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 4.2);
      glow.addColorStop(0, `rgba(255,255,255,${alpha * 0.52})`);
      glow.addColorStop(0.24, `rgba(138,43,226,${alpha * 0.12})`);
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, radius * 4.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, radius * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    };

    const render = () => {
      if (!ctx || !canvasRef.current) return;
      const { width, height } = sizeRef.current;
      const time = performance.now() * 0.001;
      const scrollRatio = clamp(scrollRef.current / (height * 1.65), 0, 1);
      const density = 0.18 + ease(scrollRatio) * 0.82;
      const glowStrength = 0.05 + ease(scrollRatio) * 0.16;

      ctx.clearRect(0, 0, width, height);

      const background = ctx.createLinearGradient(0, 0, 0, height);
      background.addColorStop(0, '#05050f');
      background.addColorStop(0.32, '#04030a');
      background.addColorStop(1, '#000000');
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);

      const nebula = ctx.createRadialGradient(width * 0.55, height * 0.28, 0, width * 0.55, height * 0.28, width * 0.42);
      nebula.addColorStop(0, `rgba(106,13,173,${glowStrength * 0.66})`);
      nebula.addColorStop(0.38, `rgba(32,10,56,${glowStrength * 0.26})`);
      nebula.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = `rgba(255,255,255,${0.02 + glowStrength * 0.09})`;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';

      starsRef.current.forEach((star) => drawStar(star, time, density));
      heroStarsRef.current.forEach((star) => drawHeroStar(star, time, density));

      animationRef.current = requestAnimationFrame(render);
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current = { x: event.clientX, y: event.clientY };
    };

    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };

    const handleResize = () => {
      resetCanvas();
    };

    resetCanvas();
    render();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, width: '100%', height: '100vh' }}
      aria-hidden="true"
    />
  );
};

export default RealisticStarfield;
