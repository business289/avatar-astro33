import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Linkedin, Instagram, Twitter, ArrowRight } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail('');
  };

  const socialIcons = [
    { Icon: Facebook, href: '#' },
    { Icon: Linkedin, href: '#' },
    { Icon: Instagram, href: '#' },
    { Icon: Twitter, href: '#' },
  ];

  const exploreLinks = [
    { label: 'Daily Horoscopes', path: '/horoscopes' },
    { label: 'Zodiac Signs', path: '/zodiac' },
    { label: 'Compatibility', path: '/compatibility' },
    { label: 'Birth Chart', path: '/birth-chart' },
  ];

  const resourceLinks = [
    { label: 'Blog', path: '/blog' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'FAQ', path: '/faq' },
  ];

  return (
    <footer style={{ background: 'rgba(5, 11, 24, 0.96)', width: '100%' }}>
      <div style={{ width: '100%', padding: '60px 72px 40px 72px' }}>

        {/* ── 4-column top area ── */}
        <div style={{ display: 'flex', gap: 60, alignItems: 'flex-start', marginBottom: 60 }}>

          {/* COL 1 — Intro */}
          <div style={{ flex: '1 1 0' }}>
            <p style={{
              color: '#FFFFFF',
              fontSize: 22,
              fontStyle: 'italic',
              lineHeight: 1.65,
              maxWidth: 340,
            }}>
              Unlock the secrets of the cosmos and discover what the stars have written for you.
            </p>
          </div>

          {/* COL 2 — EXPLORE */}
          <div style={{ flex: '1 1 0' }}>
            <p style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: 20,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 28,
            }}>
              EXPLORE
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {exploreLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 500, textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#BC6A4D')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#FFFFFF')}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* COL 3 — RESOURCES */}
          <div style={{ flex: '1 1 0' }}>
            <p style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: 20,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 28,
            }}>
              RESOURCES
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {resourceLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 500, textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#BC6A4D')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#FFFFFF')}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* COL 4 — SOCIAL + NEWSLETTER */}
          <div style={{ flex: '1.2 1 0' }}>
            <p style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: 20,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 16,
            }}>
              SOCIAL
            </p>

            {/* Social icons card */}
            <div style={{
              borderRadius: 20,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
              padding: 20,
              display: 'flex',
              gap: 16,
              marginBottom: 32,
              width: 'fit-content',
            }}>
              {socialIcons.map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#BC6A4D')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 20, marginBottom: 14 }}>
              Subscribe to our newsletter
            </p>
            <form onSubmit={handleNewsletter} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                style={{
                  width: 260,
                  height: 44,
                  borderRadius: 999,
                  border: 'none',
                  background: '#FFFFFF',
                  padding: '0 18px',
                  fontSize: 15,
                  color: '#111',
                  outline: 'none',
                }}
                className="placeholder:text-[#A9A9A9]"
              />
              <button
                type="submit"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: '#BC6A4D',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#fff',
                }}
              >
                <ArrowRight size={18} />
              </button>
            </form>
          </div>

        </div>

        {/* ── Bottom — SPIRITUAL logo + copyright ── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 32 }}>
          <p style={{
            fontFamily: "'ASTRA', 'Iceland', 'Orbitron', sans-serif",
            fontSize: 90,
            fontWeight: 400,
            letterSpacing: 10.4,
            textTransform: 'uppercase',
            color: '#BC6A4D',
            lineHeight: 1,
            marginBottom: 14,
          }}>
            SPIRITUAL
          </p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)' }}>
            2024 Celestial. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
