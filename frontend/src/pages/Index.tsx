import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Shield } from "lucide-react";
import NewsletterForm from "@/components/NewsletterForm";
import ZodiacWheelSection from "@/components/ZodiacWheelSection";
import Hero from "@/components/hero/Hero";
import AstrologyToolsSection from "@/components/AstrologyToolsSection";
import FeatureShowcase from "@/components/FeatureShowcase";
import sunMoonImg from "@/assets/sun-moon.png";
import newsletterBg from "@/assets/newsletter-bg.png";

gsap.registerPlugin(ScrollTrigger);

/* ── Data ──────────────────────────────────────────────────────────────── */

const trustReasons = [
  {
    title: "Expert-Backed Insights",
    description: "Based On Thousands Of Years Of Astrological Tradition",
  },
  {
    title: "Precise Astrological Calculations",
    description: "Enhanced With Contemporary Psychological Insights",
  },
  {
    title: "Personalized Guidance",
    description: "Tailored Interpretations For Your Unique Chart",
  },
  {
    title: "Continuous Accuracy Improvements",
    description: "Fresh Content Aligned With Celestial Movements",
  },
];

/* ── Component ─────────────────────────────────────────────────────────── */

const Index = () => {
  const trustRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".trust-item",
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          stagger: 0.12,
          duration: 0.55,
          ease: "power3.out",
          scrollTrigger: { trigger: trustRef.current, start: "top 80%" },
        },
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="relative">
      <div className="relative z-10">
        {/* ── HERO ──────────────────────────────────────────────────── */}
        <Hero />

        {/* ── ASTROLOGY TOOLS ──────────────────────────────────────── */}
        <AstrologyToolsSection />

        {/* ── EXPLORE SOLAR SYSTEM ──────────────────────────────────── */}
        <section className="relative z-10 py-16 flex flex-col items-center text-center px-6">
          <div
            className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden flex flex-col items-center justify-center py-16 px-8"
            style={{
              background:
                "linear-gradient(135deg, rgba(8,20,38,0.85) 0%, rgba(11,42,91,0.6) 50%, rgba(8,20,38,0.85) 100%)",
              border: "1px solid rgba(188,106,77,0.18)",
              boxShadow: "0 0 80px rgba(11,42,91,0.4)",
            }}
          >
            {/* Decorative orbit ring */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(18,58,117,0.25) 0%, transparent 70%)",
              }}
            />

            <p
              className="text-xs font-display tracking-[0.35em] uppercase mb-4"
              style={{ color: "#BC6A4D" }}
            >
              Interactive Experience
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-widest uppercase mb-4 leading-tight text-white">
              Explore the
              <span className="block" style={{ color: "#BC6A4D" }}>
                Solar System
              </span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto mb-10 leading-relaxed">
              Journey through our cosmic neighbourhood — orbit planets, discover
              their mysteries, and feel the scale of the universe.
            </p>

            <Link
              to="/solar-system"
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full font-display text-sm tracking-[0.22em] uppercase transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #BC6A4D, #D9895F)",
                color: "#020B1F",
                fontWeight: 700,
                boxShadow: "0 0 32px rgba(188,106,77,0.35)",
              }}
            >
              <span>Launch Solar System</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </section>

        {/* ── FEATURE SHOWCASE ──────────────────────────────────────── */}
        <FeatureShowcase />

        {/* ── ZODIAC SIGNS CAROUSEL ─────────────────────────────────── */}
        <ZodiacWheelSection />

        {/* ── WHY TRUST OUR ASTROLOGY ───────────────────────────────── */}
        <section ref={trustRef} className="relative z-10 py-20">
          <div style={{ padding: "20px 71px 20px 72px" }}>
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 20,
                background:
                  "linear-gradient(160deg, rgba(13,43,94,0.72) 0%, rgba(7,21,58,0.78) 50%, rgba(5,13,38,0.85) 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                minHeight: 824,
                maxWidth: 1777,
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
              }}
            >
              {/* Logo — absolute, top-left corner, partially clipped */}
              <div
                className="pointer-events-none select-none"
                style={{
                  position: "absolute",
                  top: -30,
                  left: -233,
                  width: 720,
                  height: 480,
                  zIndex: 0,
                }}
              >
                <img
                  src={sunMoonImg}
                  alt="Sun and Moon"
                  style={{
                    width: 720,
                    height: 480,
                    objectFit: "contain",
                    mixBlendMode: "screen",
                    opacity: 1,
                    filter: "brightness(1.22) contrast(1.08) saturate(1.38)",
                  }}
                />
              </div>

              <div
                className="grid lg:grid-cols-2 gap-16 items-start w-full"
                style={{
                  padding: "50px 80px",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {/* LEFT — all content aligned to the right of the logo */}
                <div style={{ paddingLeft: 180, paddingTop: 40 }}>
                  {/* Badge */}
                  <div
                    className="inline-flex items-center gap-2"
                    style={{ color: "#BC6A4D", marginBottom: 14 }}
                  >
                    <Shield className="w-5 h-5" />
                    <span
                      style={{
                        fontSize: 15,
                        letterSpacing: "0.28em",
                        textTransform: "uppercase",
                      }}
                    >
                      Trust & Accuracy
                    </span>
                  </div>

                  {/* Headings — directly below badge */}
                  <h2
                    className="font-display tracking-wider leading-tight"
                    style={{
                      fontSize: 52,
                      fontWeight: 500,
                      color: "#ffffff",
                      marginBottom: 4,
                    }}
                  >
                    WHY TRUST
                  </h2>
                  <h2
                    className="font-display tracking-wider leading-tight"
                    style={{
                      fontSize: 52,
                      fontWeight: 500,
                      color: "#BC6A4D",
                      marginBottom: 20,
                    }}
                  >
                    OUR ASTROLOGY
                  </h2>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: 17,
                      color: "rgba(255,255,255,0.6)",
                      maxWidth: 400,
                      lineHeight: 1.7,
                      marginBottom: 28,
                    }}
                  >
                    Our Readings Combine Ancient Astrological Wisdom With Modern
                    Psychological Insights, Providing You With Accurate,
                    Meaningful Guidance For Your Journey Through Life.
                  </p>

                  {/* CTA */}
                  <Link
                    to="/about"
                    className="inline-flex items-center gap-2 hover:opacity-70 transition-opacity"
                    style={{
                      color: "#ffffff",
                      fontSize: 15,
                      textDecoration: "underline",
                      textUnderlineOffset: 4,
                    }}
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* RIGHT — trust cards */}
                <div className="flex flex-col gap-3">
                  {trustReasons.map((reason, index) => (
                    <div
                      key={index}
                      className="trust-item flex items-center gap-4 transition-all duration-300"
                      style={{
                        border: "1px solid rgba(188,106,77,0.6)",
                        borderRadius: 14,
                        background:
                          "linear-gradient(160deg, rgba(13,43,94,0.95) 0%, rgba(7,21,58,0.97) 50%, rgba(5,13,38,0.98) 100%)",
                        padding: "18px 24px",
                        minHeight: 88,
                      }}
                    >
                      <span
                        className="flex-shrink-0"
                        style={{
                          color: "#BC6A4D",
                          fontSize: 26,
                          lineHeight: 1,
                        }}
                      >
                        ✳
                      </span>
                      <div>
                        <h4
                          className="font-display tracking-wider text-white mb-1.5"
                          style={{ fontSize: 32, fontWeight: 500 }}
                        >
                          {reason.title}
                        </h4>
                        <p
                          style={{
                            fontSize: 17,
                            color: "rgba(255,255,255,0.5)",
                            lineHeight: 1.5,
                          }}
                        >
                          {reason.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── NEWSLETTER CTA ────────────────────────────────────────── */}
        <section className="relative z-10" style={{ padding: "78px 0 79px" }}>
          {/* Outer wrapper — centers the 1282px card */}
          <div style={{ width: 1282, margin: "0 auto", position: "relative" }}>
            {/* Background image — sits BEHIND the glass card, moon overflows bottom */}
            <img
              src={newsletterBg}
              aria-hidden="true"
              style={{
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: 720,
                pointerEvents: "none",
                zIndex: 0,
                opacity: 0.85,
              }}
            />

            {/* Glass card */}
            <div
              className="text-center"
              style={{
                position: "relative",
                zIndex: 1,
                width: 1282,
                height: 579,
                borderRadius: 20,
                background: "rgba(108,108,108,0.15)",
                backdropFilter: "blur(5.65px)",
                WebkitBackdropFilter: "blur(5.65px)",
                padding: 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 0,
              }}
            >
              <h2
                className="font-display text-white"
                style={{
                  fontSize: 56,
                  fontWeight: 700,
                  lineHeight: 1.15,
                  letterSpacing: "0.06em",
                  marginBottom: 28,
                }}
              >
                UNLOCK YOUR
                <br />
                COSMIC PATH
              </h2>

              <p
                style={{
                  fontSize: 18,
                  color: "rgba(255,255,255,0.65)",
                  lineHeight: 1.7,
                  marginBottom: 44,
                  maxWidth: 480,
                }}
              >
                Subscribe To Get Personalized Horoscopes And
                <br />
                Celestial Insights Delivered To Your Inbox.
              </p>

              <NewsletterForm />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
