import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sparkles, ChevronDown } from "lucide-react";
import gsap from "gsap";

// ── Nav config — add items here, nothing else needs changing ──────────────────
const astrologyTools = [
  { name: "Zodiac Signs",     path: "/zodiac" },
  { name: "Daily Horoscopes", path: "/horoscopes" },
  { name: "Birth Chart",      path: "/birth-chart" },
  { name: "Compatibility",    path: "/compatibility" },
  { name: "Palm Reading",     path: "/palm-reading" },
];

const innerVoiceLinks = [
  { name: "Karma Diagnosis",  path: "/inner-voice" },
  { name: "AI Guru",          path: "/inner-voice/chat" },
  { name: "Karma Score",      path: "/inner-voice/dashboard" },
  { name: "Karma Journal",    path: "/inner-voice/journal" },
  { name: "Shloka Wisdom",    path: "/inner-voice/wisdom" },
];

const topLinks = [
  { name: "Blog",    path: "/blog" },
  { name: "About",   path: "/about" },
  { name: "Contact", path: "/contact" },
];

// ── Reusable desktop dropdown ─────────────────────────────────────────────────
interface DropdownProps {
  label: string;
  menuId: string;
  items: { name: string; path: string }[];
  currentPath: string;
}

const NavDropdown = ({ label, menuId, items, currentPath }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref        = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isActive   = items.some((i) => i.path === currentPath);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const onTriggerKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((v) => !v); }
    if (e.key === "Escape") setOpen(false);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) { setOpen(true); return; }
      (ref.current?.querySelectorAll("a")[0] as HTMLElement)?.focus();
    }
  };

  const onItemKey = (e: React.KeyboardEvent, idx: number) => {
    const nodes = Array.from(ref.current?.querySelectorAll("a") ?? []) as HTMLElement[];
    if (e.key === "ArrowDown") { e.preventDefault(); nodes[Math.min(idx + 1, nodes.length - 1)]?.focus(); }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (idx === 0) { triggerRef.current?.focus(); setOpen(false); }
      else nodes[idx - 1]?.focus();
    }
    if (e.key === "Escape") { setOpen(false); triggerRef.current?.focus(); }
    if (e.key === "Tab" && idx === nodes.length - 1) setOpen(false);
  };

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        ref={triggerRef}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onKeyDown={onTriggerKey}
        onClick={() => setOpen((v) => !v)}
        className={`relative flex items-center gap-1 font-body text-sm tracking-wide transition-colors duration-300
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
          focus-visible:ring-offset-background rounded-sm
          ${isActive ? "text-primary" : "text-foreground/70 hover:text-primary"}`}
      >
        {label}
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
        {isActive && (
          <span className="absolute -bottom-1 left-0 right-0 h-px bg-primary opacity-60" />
        )}
      </button>

      {/* pt-3 transparent bridge prevents mouseleave gap between button and panel */}
      <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 w-52 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          className={`glass-card rounded-xl border border-border/30 shadow-xl overflow-hidden
            transition-all duration-200 origin-top
            ${open ? "opacity-100 scale-y-100" : "opacity-0 scale-y-95"}`}
        >
          <div className="py-2">
            {items.map((item, i) => (
              <Link
                key={item.path}
                to={item.path}
                role="menuitem"
                tabIndex={open ? 0 : -1}
                onKeyDown={(e) => onItemKey(e, i)}
                className={`block px-4 py-2.5 font-body text-sm tracking-wide transition-colors duration-200
                  focus:outline-none focus-visible:bg-primary/10
                  ${currentPath === item.path
                    ? "text-primary bg-primary/10"
                    : "text-foreground/70 hover:text-primary hover:bg-primary/10"
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Mobile accordion item ─────────────────────────────────────────────────────
interface MobileAccordionProps {
  label: string;
  items: { name: string; path: string }[];
  currentPath: string;
  onNavigate: () => void;
}

const MobileAccordion = ({ label, items, currentPath, onNavigate }: MobileAccordionProps) => {
  const [open, setOpen] = useState(false);
  const isActive = items.some((i) => i.path === currentPath);

  return (
    <div className="mobile-nav-link">
      <button
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between font-body text-lg px-2 py-2 rounded-lg
          transition-colors duration-300 focus:outline-none
          ${isActive ? "text-primary" : "text-foreground/70 hover:text-primary"}`}
      >
        {label}
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="mt-1 ml-4 flex flex-col gap-1 border-l border-border/30 pl-4">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`font-body text-base py-1.5 transition-colors duration-300 ${
                currentPath === item.path ? "text-primary" : "text-foreground/70 hover:text-primary"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Navbar ───────────────────────────────────────────────────────────────
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(
        ".mobile-nav-link",
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, stagger: 0.08, duration: 0.3, ease: "power2.out" },
      );
    }
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const desktopLinkCls = (active: boolean) =>
    `relative font-body text-sm tracking-wide transition-colors duration-300 ${
      active ? "text-primary" : "text-foreground/70 hover:text-primary"
    }`;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-card py-3" : "py-5 bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Sparkles className="w-8 h-8 text-primary transition-transform duration-300 group-hover:rotate-12" />
            <span className="font-display text-xl md:text-2xl text-glow text-primary">
              S P I R I T U A L
            </span>
          </Link>

          {/* ── Desktop ──────────────────────────────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-8">

            <Link to="/" className={desktopLinkCls(location.pathname === "/")}>
              Home
              {location.pathname === "/" && (
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-primary opacity-60" />
              )}
            </Link>

            <NavDropdown
              label="Astrology Tools"
              menuId="astrology-tools-menu"
              items={astrologyTools}
              currentPath={location.pathname}
            />

            <NavDropdown
              label="Inner Voice"
              menuId="inner-voice-menu"
              items={innerVoiceLinks}
              currentPath={location.pathname}
            />

            {topLinks.map((link) => (
              <Link key={link.path} to={link.path} className={desktopLinkCls(location.pathname === link.path)}>
                {link.name}
                {location.pathname === link.path && (
                  <span className="absolute -bottom-1 left-0 right-0 h-px bg-primary opacity-60" />
                )}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="lg:hidden p-2 text-foreground/70 hover:text-primary transition-colors"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>

        {/* ── Mobile ───────────────────────────────────────────────────────────── */}
        {isOpen && (
          <div id="mobile-menu" className="lg:hidden mt-4 pb-4 border-t border-border/30">
            <div className="flex flex-col gap-1 mt-4">

              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className={`mobile-nav-link font-body text-lg px-2 py-2 rounded-lg transition-colors duration-300 ${
                  location.pathname === "/" ? "text-primary" : "text-foreground/70 hover:text-primary"
                }`}
              >
                Home
              </Link>

              <MobileAccordion
                label="Astrology Tools"
                items={astrologyTools}
                currentPath={location.pathname}
                onNavigate={() => setIsOpen(false)}
              />

              <MobileAccordion
                label="Inner Voice"
                items={innerVoiceLinks}
                currentPath={location.pathname}
                onNavigate={() => setIsOpen(false)}
              />

              {topLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`mobile-nav-link font-body text-lg px-2 py-2 rounded-lg transition-colors duration-300 ${
                    location.pathname === link.path ? "text-primary" : "text-foreground/70 hover:text-primary"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
