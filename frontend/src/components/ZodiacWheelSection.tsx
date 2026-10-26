import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { zodiacSigns, ZodiacSign } from '@/data/zodiacData';
import SectionContainer from './SectionContainer';

import ariesImg from '@/assets/zodiac/aries.png';
import taurusImg from '@/assets/zodiac/taurus.png';
import geminiImg from '@/assets/zodiac/gemini.png';
import cancerImg from '@/assets/zodiac/cancer.png';
import leoImg from '@/assets/zodiac/leo.png';
import virgoImg from '@/assets/zodiac/virgo.png';
import libraImg from '@/assets/zodiac/libra.png';
import scorpioImg from '@/assets/zodiac/scorpio.png';
import sagittariusImg from '@/assets/zodiac/sagittarius.png';
import capricornImg from '@/assets/zodiac/capricorn.png';
import aquariusImg from '@/assets/zodiac/aquarius.png';
import piscesImg from '@/assets/zodiac/pisces.png';

const zodiacImages: Record<string, string> = {
  Aries: ariesImg, Taurus: taurusImg, Gemini: geminiImg, Cancer: cancerImg,
  Leo: leoImg, Virgo: virgoImg, Libra: libraImg, Scorpio: scorpioImg,
  Sagittarius: sagittariusImg, Capricorn: capricornImg, Aquarius: aquariusImg, Pisces: piscesImg,
};

const wrap = (index: number, length: number) => ((index % length) + length) % length;

const AUTO_SLIDE_DELAY = 4500;

// Consistent blue glow — matches Capricorn reference image, identical for every sign
const GLOW = '132, 168, 255';

// Card geometry per breakpoint: active card size, neighbour scale/offset and track height.
interface Geometry { size: number; scale: number; gap: number; trackH: number }

const readGeometry = (): Geometry => {
  const w = typeof window === 'undefined' ? 1280 : window.innerWidth;
  if (w < 480) return { size: 180, scale: 0.6, gap: 142, trackH: 190 };
  if (w < 768) return { size: 204, scale: 0.65, gap: 172, trackH: 214 };
  if (w < 1024) return { size: 236, scale: 0.72, gap: 222, trackH: 246 };
  return { size: 256, scale: 0.72, gap: 244, trackH: 264 };
};

const useGeometry = (): Geometry => {
  const [g, setG] = useState<Geometry>(readGeometry);
  useEffect(() => {
    const on = () => setG(readGeometry());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return g;
};

// Card position & style for each offset from center (-2 … +2)
function getSlotAnimate(offset: number, g: Geometry) {
  if (offset === 0)           return { x: 0, scale: 1.0, opacity: 1.0 };
  if (Math.abs(offset) === 1) return { x: offset * g.gap, scale: g.scale, opacity: 0.5 };
  return { x: (offset < 0 ? -1 : 1) * g.gap * 2.2, scale: 0.5, opacity: 0 };
}

const arrowStyle = { border: '1px solid rgba(199,164,106,0.4)', background: 'rgba(199,164,106,0.08)' };
const arrowClass =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 hover:scale-110';

export const ZodiacWheelSection = () => {
  const navigate = useNavigate();
  const geo = useGeometry();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [, setDirection] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Track direction in a ref so AnimatePresence initial/exit closures always read the latest value
  const dirRef = useRef(1);

  const current: ZodiacSign = zodiacSigns[currentIndex];

  // ── Auto-slide ──────────────────────────────────────────────────────────────
  const startAutoSlide = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      dirRef.current = 1;
      setDirection(1);
      setCurrentIndex(i => wrap(i + 1, zodiacSigns.length));
    }, AUTO_SLIDE_DELAY);
  }, []);

  useEffect(() => {
    startAutoSlide();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startAutoSlide]);

  // ── Navigation ──────────────────────────────────────────────────────────────
  const paginate = useCallback((dir: number) => {
    dirRef.current = dir;
    setDirection(dir);
    setCurrentIndex(i => wrap(i + dir, zodiacSigns.length));
    startAutoSlide();
  }, [startAutoSlide]);

  const goToIndex = useCallback((target: number, from: number) => {
    const d = target > from ? 1 : -1;
    dirRef.current = d;
    setDirection(d);
    setCurrentIndex(target);
    startAutoSlide();
  }, [startAutoSlide]);

  return (
    <section className="relative z-10 scroll-mt-16 py-8 md:py-10" style={{ background: 'transparent' }}>
      {/* Fixed ambient glow — same blue for every sign */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full blur-[140px]"
          style={{ background: `rgba(${GLOW}, 0.06)` }}
        />
      </div>

      <SectionContainer className="relative z-10">
        {/* ── Header ── */}
        <div className="mb-4 text-center md:mb-5">
          <h2
            className="mb-2 font-heading font-semibold leading-[1.15] tracking-[0.04em]"
            style={{ fontSize: 'clamp(28px, 4.6vw, 50px)' }}
          >
            <span className="block text-white md:inline">THE TWELVE </span>
            <span className="block md:inline" style={{ color: '#C7A46A' }}>ZODIAC SIGNS</span>
          </h2>
          <p className="font-ui text-base tracking-wide text-white/55 md:text-[18.5px]">
            Explore the cosmic wisdom of each celestial sign
          </p>
        </div>

        {/* ── Carousel: arrows beside the track on tablet/desktop, under it on phones ── */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 md:flex-nowrap md:gap-x-6">
          <button
            onClick={() => paginate(-1)}
            aria-label="Previous sign"
            className={`${arrowClass} order-2 md:order-none`}
            style={arrowStyle}
          >
            <ChevronLeft className="h-5 w-5" style={{ color: '#C7A46A' }} />
          </button>

          {/* Sliding card track: clips only the off-screen neighbours on the x axis */}
          <div
            className="relative order-first w-full max-w-[720px] md:order-none md:flex-1"
            style={{ overflowX: 'clip', height: geo.trackH }}
          >
            <AnimatePresence initial={false}>
              {([-2, -1, 0, 1, 2] as const).map(offset => {
                const idx = wrap(currentIndex + offset, zodiacSigns.length);
                const sign = zodiacSigns[idx];
                const isCenter = offset === 0;

                return (
                  <motion.div
                    key={sign.name}
                    animate={getSlotAnimate(offset, geo)}
                    // New cards entering the DOM start from off-screen in the direction of travel
                    initial={{ x: dirRef.current > 0 ? geo.gap * 2.4 : -geo.gap * 2.4, scale: 0.5, opacity: 0 }}
                    // Removed cards exit in the direction of travel
                    exit={{ x: dirRef.current > 0 ? -geo.gap * 2.4 : geo.gap * 2.4, scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1.0] }}
                    onClick={!isCenter ? () => paginate(offset > 0 ? 1 : -1) : undefined}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: geo.size,
                      height: geo.size,
                      marginLeft: -geo.size / 2,
                      marginTop: -geo.size / 2,
                      zIndex: isCenter ? 10 : Math.abs(offset) === 1 ? 5 : 1,
                      cursor: !isCenter ? 'pointer' : 'default',
                      pointerEvents: Math.abs(offset) >= 2 ? 'none' : 'auto',
                      borderRadius: 16,
                      border: isCenter ? `1px solid rgba(${GLOW}, 0.35)` : `1px solid rgba(${GLOW}, 0.10)`,
                      boxShadow: isCenter
                        ? `0 0 10px rgba(${GLOW}, 0.16), inset 0 0 8px rgba(${GLOW}, 0.05)`
                        : 'none',
                      background: isCenter ? `rgba(${GLOW}, 0.04)` : `rgba(${GLOW}, 0.01)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      src={zodiacImages[sign.name]}
                      alt={sign.name}
                      draggable={false}
                      style={{
                        width: '92%',
                        height: '92%',
                        objectFit: 'contain',
                        mixBlendMode: 'screen',
                        userSelect: 'none',
                        filter: isCenter ? `drop-shadow(0 0 10px rgba(${GLOW}, 0.3))` : undefined,
                      }}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <button
            onClick={() => paginate(1)}
            aria-label="Next sign"
            className={`${arrowClass} order-3 md:order-none`}
            style={arrowStyle}
          >
            <ChevronRight className="h-5 w-5" style={{ color: '#C7A46A' }} />
          </button>
        </div>

        {/* Text content — fades independently so it doesn't interfere with card physics */}
        <div className="relative mt-3 text-center" style={{ zIndex: 20 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={current.name + '-text'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.38, ease: 'easeInOut' }}
            >
              <h3
                className="mb-1 font-heading font-semibold leading-tight tracking-[0.12em] text-white"
                style={{ fontSize: 'clamp(28px, 3.2vw, 38px)' }}
              >
                {current.name.toUpperCase()}
              </h3>

              <p className="mb-3 font-ui text-base md:text-[16.5px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {current.dates}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {current.traits.slice(0, 4).map((trait, i) => (
                  <span
                    key={i}
                    className="inline-flex h-11 items-center rounded-full px-4 font-ui text-sm"
                    style={{
                      border: '1px solid rgba(199,164,106,0.35)',
                      color: 'rgba(199,164,106,0.9)',
                      background: 'rgba(199,164,106,0.08)',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {trait}
                  </span>
                ))}
                <button
                  onClick={() => navigate(`/zodiac/${current.name.toLowerCase()}`)}
                  className="inline-flex h-11 items-center gap-2 px-3 font-ui text-base text-white transition-opacity hover:opacity-70"
                  style={{ letterSpacing: '0.1em' }}
                >
                  Read Full Profile
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Dot indicators ── */}
        <div className="mt-3 flex justify-center gap-2">
          {zodiacSigns.map((_, i) => (
            <button
              key={i}
              onClick={() => goToIndex(i, currentIndex)}
              aria-label={zodiacSigns[i].name}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === currentIndex ? 24 : 6,
                height: 6,
                background: i === currentIndex ? '#C7A46A' : 'rgba(199,164,106,0.25)',
              }}
            />
          ))}
        </div>
      </SectionContainer>
    </section>
  );
};

export default ZodiacWheelSection;
