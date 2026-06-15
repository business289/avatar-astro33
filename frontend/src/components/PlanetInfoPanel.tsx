import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Planet, PlanetaryInfluence, ZodiacSign } from '@/data/planetaryData';
import { useIsMobile } from '@/hooks/use-mobile';

interface PlanetInfoPanelProps {
  planet: Planet | null;
  influence: PlanetaryInfluence | null;
  isOpen: boolean;
  onClose: () => void;
  zodiacSign: ZodiacSign | string;
}

export const PlanetInfoPanel = ({ planet, influence, isOpen, onClose, zodiacSign }: PlanetInfoPanelProps) => {
  const isMobile = useIsMobile();

  if (!planet || !influence) return null;

  const mobileVariants = {
    initial:  { opacity: 0, y: 120 },
    animate:  { opacity: 1, y: 0 },
    exit:     { opacity: 0, y: 120 },
  };

  const desktopVariants = {
    initial:  { opacity: 0, x: -60 },
    animate:  { opacity: 1, x: 0 },
    exit:     { opacity: 0, x: -60 },
  };

  const variants = isMobile ? mobileVariants : desktopVariants;

  const panelClass = isMobile
    ? 'fixed bottom-0 left-0 right-0 w-full max-h-[72vh] rounded-t-3xl z-40 overflow-y-auto pointer-events-auto'
    : 'fixed left-6 top-1/2 -translate-y-1/2 w-[22rem] max-h-[88vh] rounded-3xl z-40 overflow-y-auto pointer-events-auto';

  return (
    <motion.div
      className={panelClass}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Glass background */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-xl rounded-[inherit] border border-white/15" />

      {/* Drag handle on mobile */}
      {isMobile && (
        <div className="relative flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/30" />
        </div>
      )}

      {/* Content */}
      <div className="relative px-7 pt-5 pb-8 text-white">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-5 p-2 hover:bg-white/15 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Planet header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div
            className="w-10 h-10 rounded-full mb-3"
            style={{ backgroundColor: planet.color, boxShadow: `0 0 24px ${planet.color}90` }}
          />
          <h2 className="text-3xl font-display tracking-widest mb-1">{planet.name.toUpperCase()}</h2>
          <p className="text-xs text-white/55 uppercase tracking-[0.25em]">
            Today's influence for {zodiacSign.charAt(0).toUpperCase() + zodiacSign.slice(1)}
          </p>
        </motion.div>

        {/* Spiritual essence */}
        <Section delay={0.1} label="Spiritual Essence">
          <p className="text-sm leading-relaxed text-white/85">{planet.spiritualMeaning}</p>
        </Section>

        {/* Daily influence */}
        <Section delay={0.18} label="Today's Influence">
          <p className="text-sm leading-relaxed italic text-white/80">"{influence.influence}"</p>
        </Section>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.26 }}
          className="grid grid-cols-3 gap-3 mb-5 pb-5 border-b border-white/12"
        >
          <Stat label="Energy" value={`${influence.energyLevel}/10`} />
          <Stat label="Lucky No." value={String(influence.luckyNumber)} />
          <div className="bg-white/5 rounded-xl p-3 border border-white/8 flex flex-col gap-2">
            <p className="text-[10px] uppercase tracking-widest text-white/45">Color</p>
            <div
              className="w-6 h-6 rounded-full border border-white/25"
              style={{ backgroundColor: influence.luckyColor, boxShadow: `0 0 8px ${influence.luckyColor}` }}
            />
          </div>
        </motion.div>

        {/* Chakra */}
        <Section delay={0.32} label="Chakra">
          <p className="text-sm font-semibold" style={{ color: influence.luckyColor }}>{influence.chakra}</p>
        </Section>

        {/* Best activities */}
        <Section delay={0.4} label="✨ Best Activities">
          <ul className="space-y-1.5">
            {influence.bestActivities.map((a, i) => (
              <li key={i} className="flex gap-2 text-sm text-white/80">
                <span className="text-primary/80 flex-shrink-0 mt-0.5">•</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* Things to avoid */}
        <Section delay={0.48} label="⚠️ Avoid Today">
          <ul className="space-y-1.5">
            {influence.thingsToAvoid.map((a, i) => (
              <li key={i} className="flex gap-2 text-sm text-white/75">
                <span className="text-red-400/80 flex-shrink-0 mt-0.5">•</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* Affirmation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.56 }}
          className="mt-1 rounded-2xl p-4 border"
          style={{
            background: `linear-gradient(135deg, ${planet.color}18, ${planet.color}08)`,
            borderColor: `${planet.color}35`,
          }}
        >
          <p className="text-[10px] uppercase tracking-widest text-white/50 mb-2">Today's Affirmation</p>
          <p className="text-sm leading-relaxed font-semibold italic" style={{ color: planet.color }}>
            "{influence.affirmation}"
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ── Small helpers ───────────────────────────────────────────────────────────
const Section = ({ label, children, delay }: { label: string; children: React.ReactNode; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    className="mb-5 pb-5 border-b border-white/10"
  >
    <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-2">{label}</p>
    {children}
  </motion.div>
);

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-white/5 rounded-xl p-3 border border-white/8">
    <p className="text-[10px] uppercase tracking-widest text-white/45 mb-1">{label}</p>
    <p className="text-xl font-bold text-white">{value}</p>
  </div>
);
