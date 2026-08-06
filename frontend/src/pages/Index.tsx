import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Star, Eye, Heart, Sparkles, Shield } from "lucide-react";
import NewsletterForm from "@/components/NewsletterForm";
import ZodiacWheelSection from "@/components/ZodiacWheelSection";
// import { ScrollytellingHero } from "@/components/three/ScrollytellingHero";
import zodiacAnalysisImg from "@/assets/zodiacanalysis.png";
import howItWorksWheel from "@/assets/how-it-works-wheel.png";
import sunMoonImg from "@/assets/sun-moon.png";
import newsletterBg from "@/assets/newsletter-bg.png";
import loveImg from "@/assets/love.png";
import careerImg from "@/assets/career.png";
import birthChartImg from "@/assets/birthchart.png";
import weeklyImg from "@/assets/weekly.png";
import dailyImg from "@/assets/daily.png";
import { lazy, Suspense } from "react";

const ScrollytellingHero = lazy(
  () => import("@/components/three/ScrollytellingHero"),
);

gsap.registerPlugin(ScrollTrigger);

/* ── Data ──────────────────────────────────────────────────────────────── */

const howItWorks = [
  {
    step: "01",
    title: "Select Your Sign",
    description:
      "Choose your zodiac sign from our mystical wheel and begin your journey of self-discovery.",
    icon: Star,
  },
  {
    step: "02",
    title: "Explore Traits",
    description:
      "Discover your personality, strengths, hidden qualities, and the deeper traits that define you.",
    icon: Eye,
  },
  {
    step: "03",
    title: "Check Compatibility",
    description:
      "Explore your cosmic connections and gain deeper insights into relationships and compatibility.",
    icon: Heart,
  },
  {
    step: "04",
    title: "Daily Insights",
    description:
      "Receive personalized cosmic guidance and meaningful astrological insights every day.",
    icon: Sparkles,
  },
];

const offerRows = [
  [
    {
      title: "",
      description: "",
      image: zodiacAnalysisImg,
      flex: 722,
      height: 486,
      path: "/zodiac",
    },
    {
      title: "",
      description: "",
      image: loveImg,
      flex: 498,
      height: 486,
      path: "/compatibility",
    },
    {
      title: "",
      description: "",
      image: careerImg,
      flex: 498,
      height: 486,
      path: "/horoscopes",
    },
  ],
  [
    {
      title: "",
      description: "",
      image: birthChartImg,
      flex: 498,
      height: 486,
      path: "/birth-chart",
    },
    {
      title: "",
      description: "",
      image: weeklyImg,
      flex: 498,
      height: 486,
      path: "/horoscopes",
    },
    {
      title: "",
      description: "",
      image: dailyImg,
      flex: 722,
      height: 486,
      path: "/horoscopes",
    },
  ],
];

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
  const featuresRef = useRef<HTMLDivElement>(null);
  const offerRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".step-item",
        { opacity: 0, x: 40 },
        {
          opacity: 1,
          x: 0,
          stagger: 0.2,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: featuresRef.current, start: "top 80%" },
        },
      );
      gsap.fromTo(
        ".offer-card",
        { opacity: 0, scale: 0.93 },
        {
          opacity: 1,
          scale: 1,
          stagger: 0.08,
          duration: 0.55,
          ease: "power3.out",
          scrollTrigger: { trigger: offerRef.current, start: "top 80%" },
        },
      );
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
        {/* ── HERO — Interactive 3D Solar System ───────────────────── */}
        {/* <ScrollytellingHero /> */}

        <Suspense
          fallback={
            <div className="h-screen flex items-center justify-center">
              Loading cosmos...
            </div>
          }
        >
          <ScrollytellingHero />
        </Suspense>

        {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
        <section ref={featuresRef} className="relative z-10 py-24">
          <div className="container mx-auto px-6 lg:px-16">
            {/* Heading */}
            <div className="text-center mb-16">
              <h2 className="font-display text-5xl md:text-6xl font-bold tracking-widest uppercase mb-4 leading-none">
                <span className="text-foreground">How It </span>
                <span className="text-primary">Works</span>
              </h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-xs mx-auto leading-snug">
                Your journey to cosmic enlightenment in four simple steps
              </p>
            </div>

            {/* Two-column body */}
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
              {/* LEFT — zodiac wheel image */}
              <div className="flex items-start justify-center order-2 lg:order-1 select-none -mt-16">
                <img
                  src={howItWorksWheel}
                  alt="Zodiac wheel"
                  className="w-[300px] md:w-[440px] object-contain"
                />
              </div>

              {/* RIGHT — numbered steps */}
              <div className="space-y-0 order-1 lg:order-2 divide-y divide-white/5">
                {howItWorks.map((item, index) => (
                  <div key={index} className="step-item py-8 first:pt-0">
                    {/* Step number row + icon */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="font-display text-sm tracking-[0.28em] uppercase"
                        style={{ color: "#BC6A4D", opacity: 0.85 }}
                      >
                        [{item.step}]
                      </span>

                      {/* Circular step icon */}
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          border: "1px solid rgba(188,106,77,0.35)",
                          background: "rgba(188,106,77,0.06)",
                        }}
                      >
                        {index === 0 && (
                          <svg
                            viewBox="0 0 36 36"
                            className="w-6 h-6"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle
                              cx="18"
                              cy="18"
                              r="10"
                              stroke="#BC6A4D"
                              strokeWidth="1"
                              strokeOpacity="0.9"
                            />
                            <circle
                              cx="18"
                              cy="18"
                              r="2"
                              fill="#BC6A4D"
                              fillOpacity="0.9"
                            />
                            {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => {
                              const a = (d * Math.PI) / 180;
                              return (
                                <line
                                  key={d}
                                  x1={18 + Math.cos(a) * 4}
                                  y1={18 + Math.sin(a) * 4}
                                  x2={18 + Math.cos(a) * 8}
                                  y2={18 + Math.sin(a) * 8}
                                  stroke="#BC6A4D"
                                  strokeWidth="1"
                                  strokeOpacity="0.8"
                                />
                              );
                            })}
                          </svg>
                        )}
                        {index === 1 && (
                          <svg
                            viewBox="0 0 36 36"
                            className="w-6 h-6"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle
                              cx="18"
                              cy="13"
                              r="5"
                              stroke="#BC6A4D"
                              strokeWidth="1"
                              strokeOpacity="0.9"
                            />
                            <path
                              d="M8,30 Q8,22 18,22 Q28,22 28,30"
                              stroke="#BC6A4D"
                              strokeWidth="1"
                              strokeOpacity="0.9"
                              strokeLinecap="round"
                            />
                          </svg>
                        )}
                        {index === 2 && (
                          <svg
                            viewBox="0 0 36 36"
                            className="w-6 h-6"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle
                              cx="18"
                              cy="18"
                              r="7"
                              stroke="#BC6A4D"
                              strokeWidth="1"
                              strokeOpacity="0.9"
                            />
                            <ellipse
                              cx="18"
                              cy="18"
                              rx="16"
                              ry="6"
                              stroke="#BC6A4D"
                              strokeWidth="1"
                              strokeOpacity="0.7"
                              transform="rotate(-20 18 18)"
                            />
                          </svg>
                        )}
                        {index === 3 && (
                          <svg
                            viewBox="0 0 36 36"
                            className="w-6 h-6"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M22,8 A12,12 0 1,0 22,28 A8,8 0 1,1 22,8 Z"
                              fill="#BC6A4D"
                              fillOpacity="0.25"
                              stroke="#BC6A4D"
                              strokeWidth="1"
                              strokeOpacity="0.9"
                            />
                            <circle
                              cx="26"
                              cy="10"
                              r="2"
                              fill="#BC6A4D"
                              fillOpacity="0.8"
                            />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-xl md:text-2xl font-bold tracking-wide text-foreground mb-2">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-sm">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

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

        {/* ── WHAT WE OFFER ─────────────────────────────────────────── */}
        <section
          ref={offerRef}
          className="relative z-10 w-full flex flex-col items-center"
          style={{
            padding: "94px 53px 144px 53px",
            gap: 109,
            maxWidth: 1690,
            margin: "0 auto",
          }}
        >
          {/* Heading */}
          <div className="text-center w-full">
            <h2 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-wider mb-5 leading-none">
              <span className="text-foreground">What We </span>
              <span className="text-primary text-glow">Offer</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-md mx-auto tracking-wide">
              Comprehensive cosmic guidance for every aspect of your life
            </p>
          </div>

          {/* Offer rows — CSS Grid with proportional columns via --cols custom property */}
          <div className="flex flex-col w-full" style={{ gap: 12 }}>
            {offerRows.map((row, rowIdx) => (
              <div
                key={rowIdx}
                className="offer-row"
                style={
                  {
                    "--cols": row.map((item) => `${item.flex}fr`).join(" "),
                  } as React.CSSProperties
                }
              >
                {row.map((item, cardIdx) => (
                  <Link
                    key={cardIdx}
                    to={item.path}
                    className="offer-card"
                    style={{
                      height: item.height,
                      display: "block",
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: 12,
                      alignSelf: "start",
                    }}
                  >
                    {/* LAYER 1 — image only. transform: scale applies here */}
                    <div className="offer-card-img-wrap">
                      <img
                        src={item.image}
                        alt={item.title.replace("\n", " ")}
                      />
                    </div>

                    {/* LAYER 2 — subtle vignette only, no darkening */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 1,
                        background:
                          "linear-gradient(135deg, rgba(0,0,0,0.12) 0%, transparent 50%)",
                      }}
                    />

                    {/* LAYER 3 — text content. never transforms, always visible */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        padding: "20px 22px",
                        zIndex: 2,
                      }}
                    >
                      <h3
                        style={{
                          fontFamily: "'Iceland','Cinzel',sans-serif",
                          fontSize: 22,
                          fontWeight: 400,
                          color: "#fff",
                          letterSpacing: "0.08em",
                          lineHeight: 1.2,
                          whiteSpace: "pre-line",
                          marginBottom: 8,
                          textTransform: "uppercase",
                        }}
                      >
                        {item.title}
                      </h3>
                      <p
                        style={{
                          fontSize: 14,
                          color: "rgba(255,255,255,0.75)",
                          lineHeight: 1.5,
                        }}
                      >
                        {item.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </section>

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
