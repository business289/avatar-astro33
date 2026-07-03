import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { zodiacSigns, ZodiacSign } from '@/data/zodiacData';

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

// Card position & style for each offset from center (-2 … +2)
function getSlotAnimate(offset: number) {
  if (offset === 0)             return { x: 0,    scale: 1.00, opacity: 1.00 };
  if (Math.abs(offset) === 1)   return { x: offset * 295, scale: 0.72, opacity: 0.50 };
  return                               { x: offset < 0 ? -640 : 640, scale: 0.55, opacity: 0.00 };
}

export const ZodiacWheelSection = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection]       = useState(1);
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
    <section
      className="relative z-10 overflow-hidden"
      style={{ background: 'transparent', padding: '80px 0 100px' }}
    >
      {/* Fixed ambient glow — same blue for every sign */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[160px]"
          style={{ background: `rgba(${GLOW}, 0.06)` }}
        />
      </div>

      {/* ── Header ── */}
      <div className="text-center mb-16 px-4">
        <h2
          className="font-display tracking-wider leading-tight mb-4"
          style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}
        >
          <span className="text-white block">THE TWELVE</span>
          <span className="block" style={{ color: '#BC6A4D' }}>ZODIAC SIGNS</span>
        </h2>
        <p className="text-white/55 text-lg tracking-wide">
          Explore the cosmic wisdom of each celestial sign
        </p>
      </div>

      {/* ── Carousel ── */}
      <div className="relative">

        {/* Navigation arrows — outside overflow:hidden so they're never clipped */}
        <button
          onClick={() => paginate(-1)}
          aria-label="Previous sign"
          className="absolute left-4 md:left-10 z-30 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
          style={{
            top: 130,
            border: '1px solid rgba(188,106,77,0.4)',
            background: 'rgba(188,106,77,0.08)',
          }}
        >
          <ChevronLeft className="w-6 h-6" style={{ color: '#BC6A4D' }} />
        </button>
        <button
          onClick={() => paginate(1)}
          aria-label="Next sign"
          className="absolute right-4 md:right-10 z-30 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
          style={{
            top: 130,
            border: '1px solid rgba(188,106,77,0.4)',
            background: 'rgba(188,106,77,0.08)',
          }}
        >
          <ChevronRight className="w-6 h-6" style={{ color: '#BC6A4D' }} />
        </button>

        {/* Physical sliding card track — overflow:hidden clips off-screen cards */}
        <div style={{ overflow: 'hidden', position: 'relative', height: 310 }}>
          <AnimatePresence initial={false}>
            {([-2, -1, 0, 1, 2] as const).map(offset => {
              const idx    = wrap(currentIndex + offset, zodiacSigns.length);
              const sign   = zodiacSigns[idx];
              const isCenter = offset === 0;
              const slotAnim = getSlotAnimate(offset);

              return (
                <motion.div
                  key={sign.name}
                  // Framer Motion smoothly transitions each card to its new slot position
                  animate={slotAnim}
                  // New cards entering the DOM start from off-screen in the direction of travel
                  initial={{
                    x: dirRef.current > 0 ? 720 : -720,
                    scale: 0.50,
                    opacity: 0,
                  }}
                  // Removed cards exit in the direction of travel
                  exit={{
                    x: dirRef.current > 0 ? -720 : 720,
                    scale: 0.50,
                    opacity: 0,
                  }}
                  transition={{ duration: 0.60, ease: [0.25, 0.10, 0.25, 1.00] }}
                  onClick={!isCenter ? () => paginate(offset > 0 ? 1 : -1) : undefined}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 280,
                    height: 280,
                    marginLeft: -140,
                    marginTop: -140,
                    zIndex: isCenter ? 10 : Math.abs(offset) === 1 ? 5 : 1,
                    cursor: !isCenter ? 'pointer' : 'default',
                    // Off-screen cards: disable pointer events to avoid invisible click targets
                    pointerEvents: Math.abs(offset) >= 2 ? 'none' : 'auto',
                    borderRadius: 20,
                    border: isCenter
                      ? `1px solid rgba(${GLOW}, 0.35)`
                      : `1px solid rgba(${GLOW}, 0.10)`,
                    boxShadow: isCenter
                      ? [
                          `0 0 12px rgba(${GLOW}, 0.18)`,
                          `0 0 30px rgba(${GLOW}, 0.10)`,
                          `inset 0 0 10px rgba(${GLOW}, 0.05)`,
                        ].join(', ')
                      : 'none',
                    background: isCenter
                      ? `rgba(${GLOW}, 0.04)`
                      : `rgba(${GLOW}, 0.01)`,
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
                      filter: isCenter
                        ? `drop-shadow(0 0 18px rgba(${GLOW}, 0.35))`
                        : undefined,
                    }}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Text content — fades independently so it doesn't interfere with card physics */}
        <div className="relative text-center" style={{ zIndex: 20, marginTop: 28 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={current.name + '-text'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.38, ease: 'easeInOut' }}
            >
              {/* Sign name */}
              <h3
                className="font-display text-white tracking-[0.2em] mb-1"
                style={{ fontSize: 36 }}
              >
                {current.name.toUpperCase()}
              </h3>

              {/* Dates */}
              <p
                className="tracking-widest uppercase mb-6 text-sm"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                {current.dates}
              </p>

              {/* Trait pills */}
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {current.traits.slice(0, 4).map((trait, i) => (
                  <span
                    key={i}
                    className="px-4 py-1.5 text-sm rounded-full"
                    style={{
                      border: '1px solid rgba(188,106,77,0.35)',
                      color: 'rgba(188,106,77,0.9)',
                      background: 'rgba(188,106,77,0.08)',
                      fontFamily: "'Iceland', 'Cinzel', sans-serif",
                      letterSpacing: '0.08em',
                    }}
                  >
                    {trait}
                  </span>
                ))}
              </div>

              {/* Read full profile */}
              <button
                onClick={() => navigate(`/zodiac/${current.name.toLowerCase()}`)}
                className="inline-flex items-center gap-2 transition-opacity hover:opacity-70"
                style={{
                  color: 'white',
                  fontFamily: "'Iceland', 'Cinzel', sans-serif",
                  fontSize: 16,
                  letterSpacing: '0.1em',
                }}
              >
                Read Full Profile
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Dot indicators ── */}
      <div className="flex justify-center gap-2 mt-10">
        {zodiacSigns.map((_, i) => (
          <button
            key={i}
            onClick={() => goToIndex(i, currentIndex)}
            aria-label={zodiacSigns[i].name}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === currentIndex ? 24 : 6,
              height: 6,
              background: i === currentIndex
                ? '#BC6A4D'
                : 'rgba(188,106,77,0.25)',
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default ZodiacWheelSection;
