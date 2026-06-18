import React, { useState, useEffect, useRef, memo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { InteractiveSolarSystem } from "./InteractiveSolarSystem";
import { PlanetInfoPanel } from "../PlanetInfoPanel";
import { Planet, getDailyInfluence, PlanetaryInfluence, ZodiacSign } from "@/data/planetaryData";

gsap.registerPlugin(ScrollTrigger);

class PanelBoundary extends React.Component<
  { children: React.ReactNode },
  { crashed: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { crashed: false };
  }
  static getDerivedStateFromError() { return { crashed: true }; }
  componentDidCatch(err: Error, info: React.ErrorInfo) {
    console.error("[PlanetInfoPanel crash]", err.message, "\n", info.componentStack);
  }
  render() {
    return this.state.crashed ? null : this.props.children;
  }
}

class SceneBoundary extends React.Component<
  { children: React.ReactNode },
  { crashed: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { crashed: false };
  }
  static getDerivedStateFromError() { return { crashed: true }; }
  componentDidCatch(err: Error, info: React.ErrorInfo) {
    console.error("[SolarSystem crash]", err.message, "\n", info.componentStack);
  }
  render() {
    if (this.state.crashed) {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm text-muted-foreground font-display tracking-wider">
            Scene unavailable — reload to retry
          </span>
        </div>
      );
    }
    return this.props.children;
  }
}

const SceneLoader = memo(() => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <span className="text-sm text-muted-foreground font-display tracking-wider">Loading cosmos...</span>
    </div>
  </div>
));
SceneLoader.displayName = "SceneLoader";

export const ScrollytellingHero = () => {
  // ── Refs ────────────────────────────────────────────────────────────────
  const sectionRef    = useRef<HTMLDivElement>(null);   // pinned element
  const heroTextRef   = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const interactRef   = useRef<HTMLDivElement>(null);

  // shared scroll progress — updated by GSAP, read by Three.js useFrame
  const scrollRef      = useRef({ progress: 0 });
  const canInteractRef = useRef(false);

  // ── State (only updated at threshold crossings) ──────────────────────
  const [canInteract, setCanInteract]     = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [userZodiac, setUserZodiac]       = useState<ZodiacSign>("sagittarius");
  const [dailyInfluence, setDailyInfluence] = useState<PlanetaryInfluence | null>(null);

  // Load stored zodiac
  useEffect(() => {
    const stored = localStorage.getItem("userZodiac");
    if (stored) setUserZodiac(stored as ZodiacSign);
  }, []);

  // Update influence when planet is clicked
  useEffect(() => {
    if (selectedPlanet) {
      setDailyInfluence(getDailyInfluence(userZodiac, new Date(), selectedPlanet.id));
    } else {
      setDailyInfluence(null);
    }
  }, [selectedPlanet, userZodiac]);

  // ── GSAP pin + scroll-driven animation ──────────────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const st = ScrollTrigger.create({
      trigger:    section,
      start:      "top top",
      end:        "+=3000",       // 3 000 px of scroll while pinned
      pin:        true,
      pinSpacing: true,
      scrub:      1,
      onUpdate:   (self) => {
        // ── Write progress directly — zero React overhead ──
        scrollRef.current.progress = self.progress;

        // Hero text: fade out + drift upward
        if (heroTextRef.current) {
          const op = Math.max(0, 1 - self.progress * 2.8);
          heroTextRef.current.style.opacity   = String(op);
          heroTextRef.current.style.transform = `translateY(${-self.progress * 52}px)`;
        }

        // Scroll hint: disappears quickly
        if (scrollHintRef.current) {
          scrollHintRef.current.style.opacity = String(
            Math.max(0, 1 - self.progress * 5)
          );
        }

        // Interact hint: fades in near end
        if (interactRef.current) {
          const op = self.progress > 0.8
            ? Math.min(1, (self.progress - 0.8) / 0.18)
            : 0;
          interactRef.current.style.opacity = String(op);
        }

        // Interaction threshold
        const nowInteract = self.progress > 0.8;
        if (nowInteract !== canInteractRef.current) {
          canInteractRef.current = nowInteract;
          setCanInteract(nowInteract);
          if (!nowInteract) setSelectedPlanet(null);
        }
      },
    });

    return () => st.kill();
  }, []);

  return (
    <>
      {/* Glassmorphism info panel — fixed, unaffected by scroll */}
      <PanelBoundary key={selectedPlanet?.id ?? 'none'}>
        <AnimatePresence>
          {selectedPlanet && dailyInfluence && (
            <PlanetInfoPanel
              key={selectedPlanet.id}
              planet={selectedPlanet}
              influence={dailyInfluence}
              isOpen
              onClose={() => setSelectedPlanet(null)}
              zodiacSign={userZodiac}
            />
          )}
        </AnimatePresence>
      </PanelBoundary>

      {/*
        ── Pinned hero section ──────────────────────────────────────────
        GSAP pins this element for 3 000 px of scroll.
        Nothing inside should move with the scroll — all motion is
        driven by `scrollRef.current.progress` inside Three.js useFrame.
      */}
      <div
        ref={sectionRef}
        className="relative w-full overflow-hidden"
        style={{ height: "100vh" }}
      >
        {/* ── Full-screen Three.js canvas — absolutely positioned ── */}
        <div className="absolute inset-0 z-0">
          <Suspense fallback={<SceneLoader />}>
            <SceneBoundary>
              <InteractiveSolarSystem
                selectedPlanet={selectedPlanet}
                onPlanetSelect={setSelectedPlanet}
                scrollRef={scrollRef}
                canInteract={canInteract}
              />
            </SceneBoundary>
          </Suspense>
        </div>

        {/* ── Hero text (fades via direct DOM) ── */}
        <div
          ref={heroTextRef}
          className="absolute inset-0 z-20 flex flex-col items-center justify-start pt-20 px-4 pointer-events-none"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: "easeOut" }}
            className="text-center"
          >
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-wider mb-4 leading-none">
              <span className="text-primary text-glow">Journey Through</span>
              <br />
              <span className="text-foreground">The Cosmos</span>
            </h1>

            <p className="text-base md:text-xl text-muted-foreground max-w-xl mx-auto mb-8 tracking-wide">
              Discover daily planetary wisdom aligned with your zodiac sign
            </p>

          </motion.div>
        </div>

        {/* ── Scroll indicator (disappears as soon as user starts scrolling) ── */}
        <div
          ref={scrollHintRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center gap-2"
        >
          <span className="text-xs text-muted-foreground font-display tracking-widest uppercase">
            Scroll to explore
          </span>
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5 text-primary" />
          </motion.div>
        </div>

        {/* ── Interact hint (appears when fully zoomed in) ── */}
        <div
          ref={interactRef}
          className="absolute bottom-14 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-center whitespace-nowrap"
          style={{ opacity: 0 }}
        >
          <p
            className="text-sm font-display tracking-[0.22em] uppercase"
            style={{
              color:      "rgba(255,255,255,0.7)",
              textShadow: "0 0 24px rgba(255,200,80,0.5)",
            }}
          >
            ✦ Click a planet to discover today's cosmic influence ✦
          </p>
        </div>
      </div>
    </>
  );
};

export default ScrollytellingHero;
