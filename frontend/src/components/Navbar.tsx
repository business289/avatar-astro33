import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, Radio, LogIn, LogOut, User } from "lucide-react";
import gsap from "gsap";
import BrandLogo from "@/components/BrandLogo";
import { useAuthStore } from "@/store/authStore";
import { useLogoutMutation } from "@/features/auth/hooks/useAuthMutations";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ── Nav config ────────────────────────────────────────────────────────────────
const astrologyTools = [
  { name: "Tarot Experience", path: "/tarot" },
  { name: "Zodiac Signs",     path: "/zodiac" },
  // { name: "Daily Horoscopes", path: "/horoscopes" },
  { name: "Birth Chart",      path: "/birth-chart" },
  { name: "Compatibility",    path: "/compatibility" },
  { name: "Palm Reading",     path: "/palm-reading" },
  { name: "AI Destiny Report", path: "/name-destiny-report" },
];

const innerVoiceLinks = [
  { name: "Karma Diagnosis", path: "/inner-voice" },
  { name: "AI Guru",         path: "/inner-voice/chat" },
  { name: "Karma Score",     path: "/inner-voice/dashboard" },
  { name: "Karma Journal",   path: "/inner-voice/journal" },
  { name: "Shloka Wisdom",   path: "/inner-voice/wisdom" },
];

const devotionLinks = [
  { name: "Puja",     path: "/puja" },
  { name: "Chadhawa", path: "/chadhawa" },
  { name: "Shop",     path: "/shop" },
];

// Avatar Live sub-pages — used by mobile accordion + isActive check
const avatarLiveLinks = [
  { name: "Live Darshan",     path: "/avatar-live/darshan" },
  { name: "Family Functions", path: "/avatar-live/family"  },
];

const topLinks = [
  { name: "Blog",    path: "/blog" },
  { name: "About",   path: "/about" },
  { name: "Contact", path: "/contact" },
];

// ── Generic desktop dropdown ──────────────────────────────────────────────────
interface DropdownProps {
  label: string;
  menuId: string;
  items: { name: string; path: string }[];
  currentPath: string;
  lightNav?: boolean;
}

const NavDropdown = ({ label, menuId, items, currentPath, lightNav }: DropdownProps) => {
  const [open, setOpen]     = useState(false);
  const ref                 = useRef<HTMLDivElement>(null);
  const triggerRef          = useRef<HTMLButtonElement>(null);
  const closeTimer          = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isActive            = items.some((i) => i.path === currentPath);

  const openMenu      = () => { if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; } setOpen(true); };
  const scheduleClose = () => { closeTimer.current = setTimeout(() => setOpen(false), 180); };

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const onTriggerKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((v) => !v); }
    if (e.key === "Escape") setOpen(false);
    if (e.key === "ArrowDown") { e.preventDefault(); if (!open) { setOpen(true); return; } (ref.current?.querySelectorAll("a")[0] as HTMLElement)?.focus(); }
  };

  const onItemKey = (e: React.KeyboardEvent, idx: number) => {
    const nodes = Array.from(ref.current?.querySelectorAll("a") ?? []) as HTMLElement[];
    if (e.key === "ArrowDown") { e.preventDefault(); nodes[Math.min(idx + 1, nodes.length - 1)]?.focus(); }
    if (e.key === "ArrowUp") { e.preventDefault(); if (idx === 0) { triggerRef.current?.focus(); setOpen(false); } else nodes[idx - 1]?.focus(); }
    if (e.key === "Escape") { setOpen(false); triggerRef.current?.focus(); }
    if (e.key === "Tab" && idx === nodes.length - 1) setOpen(false);
  };

  return (
    <div ref={ref} className="relative" onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
      <button
        ref={triggerRef}
        aria-haspopup="true" aria-expanded={open} aria-controls={menuId}
        onKeyDown={onTriggerKey} onClick={() => setOpen((v) => !v)}
        className={`relative flex items-center gap-1.5 font-ui text-sm font-semibold tracking-wide transition-colors duration-300
          focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2
          focus-visible:ring-offset-background rounded-sm
          ${isActive ? "text-brand-accent" : lightNav ? "text-[#2C1810]/60 hover:text-brand-accent" : "text-foreground/70 hover:text-brand-accent"}`}
      >
        {label}
        <ChevronDown size={14} aria-hidden="true" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        {isActive && <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-brand-accent rounded-full" />}
      </button>

      <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 w-52 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div
          id={menuId} role="menu" aria-label={label}
          className={`glass-card rounded-xl border border-border/30 shadow-xl overflow-hidden transition-all duration-200 origin-top
            ${open ? "opacity-100 scale-y-100" : "opacity-0 scale-y-95"}`}
        >
          <div className="py-2">
            {items.map((item, i) => (
              <Link
                key={item.path} to={item.path} role="menuitem"
                tabIndex={open ? 0 : -1} onKeyDown={(e) => onItemKey(e, i)}
                className={`block px-4 py-2.5 font-ui text-sm tracking-wide transition-colors duration-200
                  focus:outline-none focus-visible:bg-brand-accent/10
                  ${currentPath === item.path ? "text-brand-accent bg-brand-accent/10" : "text-foreground/70 hover:text-brand-accent hover:bg-brand-accent/10"}`}
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

// ── Avatar Live premium dropdown ───────────────────────────────────────────────
interface AvatarLiveDropdownProps { currentPath: string; lightNav?: boolean; }

const AvatarLiveDropdown = ({ currentPath, lightNav }: AvatarLiveDropdownProps) => {
  const [open, setOpen]  = useState(false);
  const ref              = useRef<HTMLDivElement>(null);
  const triggerRef       = useRef<HTMLButtonElement>(null);
  const closeTimer       = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isActive         = currentPath.startsWith("/avatar-live");

  const openMenu      = () => { if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; } setOpen(true); };
  const scheduleClose = () => { closeTimer.current = setTimeout(() => setOpen(false), 200); };

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const onTriggerKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((v) => !v); }
    if (e.key === "Escape") setOpen(false);
    if (e.key === "ArrowDown") { e.preventDefault(); if (!open) { setOpen(true); return; } (ref.current?.querySelectorAll("a")[0] as HTMLElement)?.focus(); }
  };

  return (
    <div ref={ref} className="relative" onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        aria-haspopup="true" aria-expanded={open} aria-controls="avatar-live-menu"
        onKeyDown={onTriggerKey} onClick={() => setOpen((v) => !v)}
        className={`relative flex items-center gap-1.5 font-ui text-sm font-semibold tracking-wide transition-colors duration-300
          focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2
          focus-visible:ring-offset-background rounded-sm
          ${isActive ? "text-brand-accent" : lightNav ? "text-[#2C1810]/60 hover:text-brand-accent" : "text-foreground/70 hover:text-brand-accent"}`}
      >
        Live
        <ChevronDown size={14} aria-hidden="true" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        {isActive && <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-brand-accent rounded-full" />}
      </button>

      {/* Panel — positioned left-aligned so it doesn't clip */}
      <div className={`absolute top-full left-0 pt-3 ${open ? "pointer-events-auto" : "pointer-events-none"}`} style={{ width: 340 }}>
        <div
          id="avatar-live-menu" role="menu" aria-label="Live"
          className={`rounded-2xl overflow-hidden transition-all duration-200 origin-top-left
            ${open ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
          style={{
            background: '#FFFAF6',
            border: '1.5px solid rgba(138,109,53,0.18)',
            boxShadow: '0 24px 64px rgba(120,60,20,0.16), 0 4px 16px rgba(0,0,0,0.04)',
          }}
        >
          {/* Hub row */}
          <Link
            to="/avatar-live"
            role="menuitem"
            onClick={() => setOpen(false)}
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '13px 20px 11px', borderBottom: '1px solid rgba(138,109,53,0.10)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(138,109,53,0.05)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <Radio style={{ width: 13, height: 13, color: '#8A6D35', flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: '#8A6D35', textTransform: 'uppercase', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
              Live Hub
            </span>
            {/* Live pulse dot */}
            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#E53935', fontWeight: 700, letterSpacing: '0.08em' }}>
              <span style={{ width: 6, height: 6, background: '#E53935', borderRadius: '50%', flexShrink: 0 }} />
              LIVE
            </span>
          </Link>

          {/* Live Darshan item */}
          <Link
            to="/avatar-live/darshan"
            role="menuitem"
            onClick={() => setOpen(false)}
            style={{ textDecoration: 'none', display: 'flex', gap: 16, padding: '18px 20px 16px', borderBottom: '1px solid rgba(138,109,53,0.08)', transition: 'background 0.18s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(138,109,53,0.05)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <div style={{
              width: 46, height: 46, borderRadius: 13, flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(138,109,53,0.15) 0%, rgba(138,109,53,0.10) 100%)',
              border: '1.5px solid rgba(138,109,53,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>
              🛕
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 800, color: '#2C1810', marginBottom: 5, fontFamily: "'DM Sans', system-ui, sans-serif", letterSpacing: '0.04em', lineHeight: 1 }}>
                Live Darshan
              </p>
              <p style={{ fontSize: 12, color: 'rgba(44,24,16,0.55)', lineHeight: 1.55, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                Watch live temple darshans, aartis, and spiritual broadcasts from famous temples across India.
              </p>
            </div>
          </Link>

          {/* Family Functions item */}
          <Link
            to="/avatar-live/family"
            role="menuitem"
            onClick={() => setOpen(false)}
            style={{ textDecoration: 'none', display: 'flex', gap: 16, padding: '16px 20px 18px', transition: 'background 0.18s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(138,109,53,0.05)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <div style={{
              width: 46, height: 46, borderRadius: 13, flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(138,109,53,0.15) 0%, rgba(138,109,53,0.10) 100%)',
              border: '1.5px solid rgba(138,109,53,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>
              💒
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 800, color: '#2C1810', marginBottom: 5, fontFamily: "'DM Sans', system-ui, sans-serif", letterSpacing: '0.04em', lineHeight: 1 }}>
                Family Functions
              </p>
              <p style={{ fontSize: 12, color: 'rgba(44,24,16,0.55)', lineHeight: 1.55, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                Attend weddings, pujas, naming ceremonies, birthdays, memorials, and family celebrations online.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

// ── Mobile accordion ──────────────────────────────────────────────────────────
interface MobileAccordionProps {
  label: string;
  items: { name: string; path: string }[];
  currentPath: string;
  onNavigate: () => void;
}

const MobileAccordion = ({ label, items, currentPath, onNavigate }: MobileAccordionProps) => {
  const [open, setOpen] = useState(false);
  const isActive        = items.some((i) => i.path === currentPath);

  return (
    <div className="mobile-nav-link">
      <button
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between font-ui text-base font-medium px-2 py-2 rounded-lg
          transition-colors duration-300 focus:outline-none
          ${isActive ? "text-brand-accent" : "text-foreground/70 hover:text-brand-accent"}`}
      >
        {label}
        <ChevronDown size={18} aria-hidden="true" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-1 ml-4 flex flex-col gap-1 border-l border-border/30 pl-4">
          {items.map((item) => (
            <Link
              key={item.path} to={item.path} onClick={onNavigate}
              className={`font-ui text-sm py-1.5 transition-colors duration-300 ${
                currentPath === item.path ? "text-brand-accent" : "text-foreground/70 hover:text-brand-accent"
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
  const [isOpen, setIsOpen]   = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location              = useLocation();
  const navigate              = useNavigate();
  const isAuthenticated       = useAuthStore((s) => s.isAuthenticated);
  const user                  = useAuthStore((s) => s.user);
  const logoutMutation        = useLogoutMutation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email?.split("@")[0] ||
    "Account";

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/login");
  };

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

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  const isDevotionPage = ['/puja', '/chadhawa', '/shop', '/avatar-live'].some(p => location.pathname.startsWith(p));
  const lightNav       = isDevotionPage;

  const desktopLinkCls = (active: boolean) =>
    `relative font-ui text-sm font-semibold tracking-wide transition-colors duration-300 ${
      active
        ? "text-brand-accent"
        : lightNav
          ? "text-[#2C1810]/60 hover:text-brand-accent"
          : "text-foreground/70 hover:text-brand-accent"
    }`;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isDevotionPage
          ? 'py-4 border-b border-[#E8DED0]'
          : scrolled
            ? 'glass-card py-3'
            : 'py-5 bg-transparent'
      }`}
      style={isDevotionPage ? ({ background: '#F8F4EC', '--brand-accent-rgb': '138 109 53' } as React.CSSProperties) : undefined}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <BrandLogo />

          {/* ── Desktop nav ─────────────────────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-8">

            <Link to="/" className={desktopLinkCls(location.pathname === "/")}>
              Home
              {location.pathname === "/" && <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-brand-accent rounded-full" />}
            </Link>

            <NavDropdown label="Astrology Tools" menuId="astrology-tools-menu" items={astrologyTools} currentPath={location.pathname} lightNav={lightNav} />
            <NavDropdown label="Inner Voice"      menuId="inner-voice-menu"     items={innerVoiceLinks} currentPath={location.pathname} lightNav={lightNav} />
            <NavDropdown label="Devotion"         menuId="devotion-menu"        items={devotionLinks}   currentPath={location.pathname} lightNav={lightNav} />

            {/* Avatar Live — dedicated premium dropdown */}
            <AvatarLiveDropdown currentPath={location.pathname} lightNav={lightNav} />

            {topLinks.map((link) => (
              <Link key={link.path} to={link.path} className={desktopLinkCls(location.pathname === link.path)}>
                {link.name}
                {location.pathname === link.path && <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-brand-accent rounded-full" />}
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-2 border-l border-border/30">
                <span className={`flex items-center gap-1.5 font-ui text-xs tracking-wider ${lightNav ? "text-[#2C1810]/70" : "text-foreground/70"}`}>
                  <User size={14} className="text-brand-accent" />
                  {displayName}
                </span>
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  disabled={logoutMutation.isPending}
                  className="inline-flex items-center gap-1.5 font-ui text-xs font-semibold tracking-wider text-brand-accent transition-opacity hover:opacity-80 disabled:opacity-50"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-full border border-brand-accent/40 bg-brand-accent/10 px-4 py-2 font-ui text-xs font-semibold tracking-wider text-brand-accent transition-colors hover:bg-brand-accent/20"
              >
                <LogIn size={14} />
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen((v) => !v)}
            className={`lg:hidden p-2 ${lightNav ? "text-[#2C1810]/70" : "text-foreground/70"} hover:text-primary transition-colors`}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>

        {/* ── Mobile menu ─────────────────────────────────────────────────── */}
        {isOpen && (
          <div id="mobile-menu" className="lg:hidden mt-4 pb-4 border-t border-border/30">
            <div className="flex flex-col gap-1 mt-4">

              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className={`mobile-nav-link font-ui text-base font-medium px-2 py-2 rounded-lg transition-colors duration-300 ${
                  location.pathname === "/" ? "text-brand-accent" : "text-foreground/70 hover:text-brand-accent"
                }`}
              >
                Home
              </Link>

              <MobileAccordion label="Astrology Tools" items={astrologyTools}  currentPath={location.pathname} onNavigate={() => setIsOpen(false)} />
              <MobileAccordion label="Inner Voice"     items={innerVoiceLinks} currentPath={location.pathname} onNavigate={() => setIsOpen(false)} />
              <MobileAccordion label="Devotion"        items={devotionLinks}   currentPath={location.pathname} onNavigate={() => setIsOpen(false)} />

              {/* Avatar Live accordion — links to hub + sub-pages */}
              <MobileAccordion
                label="Live"
                items={[{ name: "Live Hub", path: "/avatar-live" }, ...avatarLiveLinks]}
                currentPath={location.pathname}
                onNavigate={() => setIsOpen(false)}
              />

              {topLinks.map((link) => (
                <Link
                  key={link.path} to={link.path} onClick={() => setIsOpen(false)}
                  className={`mobile-nav-link font-ui text-base font-medium px-2 py-2 rounded-lg transition-colors duration-300 ${
                    location.pathname === link.path ? "text-brand-accent" : "text-foreground/70 hover:text-brand-accent"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="mobile-nav-link font-ui text-base font-medium px-2 py-2 rounded-lg text-brand-accent text-left"
                >
                  Sign out ({displayName})
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="mobile-nav-link font-ui text-base font-medium px-2 py-2 rounded-lg text-brand-accent"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        )}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent className="border-border/30 bg-[#081426] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-ui text-lg tracking-wide text-brand-accent">Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription className="text-foreground/70">
              Are you sure you want to sign out of your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/30 bg-transparent text-white hover:bg-white/5 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowLogoutConfirm(false);
                void handleLogout();
              }}
              className="bg-brand-accent text-[#081426] hover:bg-brand-accent/80"
            >
              Sign out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </nav>
  );
};

export default Navbar;
