import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface FeatureCardShellProps {
  index?: number;
  /** Lift the card slightly on hover (off for the carousel, which people click inside). */
  lift?: boolean;
  className?: string;
  children: ReactNode;
  "data-testid"?: string;
}

/**
 * The one card surface used by the homepage feature carousel and the three
 * cards under it: same border, radius, background, shadow and hover. Padding
 * is left to the caller so the carousel can use its own. With reduced motion
 * the card fades in without moving and does not lift on hover.
 */
const FeatureCardShell = ({ index = 0, lift = true, className = "", children, ...rest }: FeatureCardShellProps) => {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: reduceMotion ? 0.2 : 0.5, delay: reduceMotion ? 0 : index * 0.08, ease: "easeOut" }}
      whileHover={lift && !reduceMotion ? { y: -4 } : undefined}
      className={`group relative overflow-hidden rounded-2xl border border-brand-accent/25 shadow-[0_6px_24px_rgba(0,0,0,0.35)] transition-[border-color,box-shadow] duration-300 hover:border-brand-accent/60 hover:shadow-[0_6px_24px_rgba(0,0,0,0.35),0_0_28px_rgba(199,164,106,0.18)] motion-reduce:transition-none ${className}`}
      style={{ background: "linear-gradient(180deg, rgba(13,28,52,0.7) 0%, rgba(5,11,24,0.85) 100%)" }}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export default FeatureCardShell;
