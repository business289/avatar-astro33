import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, MapPin, Clock, Send, Heart, Globe, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DevotionLayout from '@/components/DevotionLayout';
import { liveTemples, samplePrayers, formatViewers, type PrayerMessage } from '@/data/liveStreams';

// ── Prayer wall ────────────────────────────────────────────────────────────────
const PrayerWall = ({ templeId }: { templeId: string }) => {
  const [prayers, setPrayers]   = useState<PrayerMessage[]>(samplePrayers);
  const [text, setText]         = useState('');
  const [name, setName]         = useState('');
  const listRef                 = useRef<HTMLDivElement>(null);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const msg: PrayerMessage = {
      id: Date.now().toString(),
      emoji: ['🙏', '🕉️', '✨', '🪔', '🌸'][Math.floor(Math.random() * 5)],
      message: trimmed,
      from: name.trim() || 'Anonymous Devotee',
      city: 'Your City',
      time: 'Just now',
    };
    setPrayers(p => [msg, ...p]);
    setText('');
    setTimeout(() => { listRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }, 50);
  };

  // suppress unused templeId warning cleanly
  void templeId;

  return (
    <div style={{
      background: '#FFF', borderRadius: 20,
      border: '1.5px solid rgba(188,106,77,0.13)',
      boxShadow: '0 4px 20px rgba(120,60,20,0.07)',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '20px 24px 0', borderBottom: '1px solid rgba(188,106,77,0.12)' }}>
        <h3 className="font-display uppercase tracking-wide" style={{ fontSize: 18, color: '#2C1810', marginBottom: 16 }}>
          Prayer Wall
        </h3>

        {/* Input */}
        <div style={{ marginBottom: 16 }}>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name (optional)"
            style={{
              width: '100%', marginBottom: 10, height: 40, padding: '0 14px',
              fontSize: 13, color: '#2C1810', background: 'rgba(248,242,232,0.6)',
              border: '1px solid rgba(188,106,77,0.18)', borderRadius: 10, outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="Send a prayer or blessing..."
              style={{
                flex: 1, height: 44, padding: '0 14px',
                fontSize: 13, color: '#2C1810', background: 'rgba(248,242,232,0.6)',
                border: '1px solid rgba(188,106,77,0.18)', borderRadius: 10, outline: 'none',
              }}
            />
            <button
              onClick={submit}
              style={{
                width: 44, height: 44, borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #BC6A4D 0%, #D4854A 100%)',
                color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <Send style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>
      </div>

      {/* Prayer list */}
      <div ref={listRef} style={{ height: 280, overflowY: 'auto', padding: '12px 0' }}>
        <AnimatePresence initial={false}>
          {prayers.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ padding: '10px 24px', display: 'flex', gap: 10, alignItems: 'flex-start', borderBottom: '1px solid rgba(188,106,77,0.07)' }}
            >
              <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1 }}>{p.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, color: '#2C1810', lineHeight: 1.45, wordBreak: 'break-word', marginBottom: 4 }}>
                  {p.message}
                </p>
                <p style={{ fontSize: 11, color: '#9C7B62' }}>
                  <span style={{ fontWeight: 600 }}>{p.from}</span>{p.city ? ` · ${p.city}` : ''} · {p.time}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ── Donation card ──────────────────────────────────────────────────────────────
const DonationCard = ({ templeName }: { templeName: string }) => {
  const [amount, setAmount] = useState<number | ''>('');
  const presets = [51, 101, 251, 501, 1001, 2100];

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(188,106,77,0.08) 0%, rgba(212,133,74,0.05) 100%)',
      borderRadius: 20, border: '1.5px solid rgba(188,106,77,0.20)',
      boxShadow: '0 4px 20px rgba(120,60,20,0.06)',
      overflow: 'hidden',
    }}>
      <div style={{ background: 'linear-gradient(135deg, #BC6A4D 0%, #D4854A 100%)', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🪔</span>
          <div>
            <h3 className="font-display uppercase tracking-wide" style={{ fontSize: 16, color: '#FFF', fontWeight: 700 }}>
              Make a Donation
            </h3>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>Contribute to {templeName}</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 24px' }}>
        {/* Presets */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
          {presets.map(p => (
            <button
              key={p}
              onClick={() => setAmount(p)}
              style={{
                padding: '9px 4px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                border: amount === p ? '1.5px solid #BC6A4D' : '1.5px solid rgba(188,106,77,0.22)',
                background: amount === p ? 'rgba(188,106,77,0.1)' : 'transparent',
                color: amount === p ? '#BC6A4D' : '#7A5C42',
              }}
            >
              ₹{p}
            </button>
          ))}
        </div>

        {/* Custom */}
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value ? Number(e.target.value) : '')}
          placeholder="Enter custom amount (₹)"
          style={{
            width: '100%', height: 44, padding: '0 16px', marginBottom: 16,
            fontSize: 14, color: '#2C1810', background: '#FFF',
            border: '1.5px solid rgba(188,106,77,0.22)', borderRadius: 12, outline: 'none',
          }}
        />

        <button
          onClick={() => {}}
          style={{
            width: '100%', padding: '14px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: amount ? 'linear-gradient(135deg, #BC6A4D 0%, #D4854A 100%)' : 'rgba(188,106,77,0.15)',
            color: amount ? '#FFF' : 'rgba(188,106,77,0.5)',
            fontSize: 14, fontWeight: 700, letterSpacing: '0.08em',
            fontFamily: 'Iceland, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.25s',
          }}
        >
          <Heart style={{ width: 16, height: 16 }} />
          {amount ? `Donate ₹${amount.toLocaleString()}` : 'Select Amount'}
        </button>

        <p style={{ fontSize: 11, color: '#9C7B62', textAlign: 'center', marginTop: 12 }}>
          🔒 Secure UPI / Card / Net Banking
        </p>
      </div>
    </div>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────────
const DarshanDetail = () => {
  const { slug }  = useParams<{ slug: string }>();
  const temple    = liveTemples.find(t => t.slug === slug);
  const [liked, setLiked] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  if (!temple) {
    return (
      <DevotionLayout>
        <div style={{ paddingTop: 80, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <p className="font-display" style={{ fontSize: 28, color: '#9C7B62', letterSpacing: '0.1em' }}>Temple not found</p>
            <Link to="/avatar-live/darshan" style={{ color: '#BC6A4D', textDecoration: 'none', fontWeight: 600, fontSize: 14, marginTop: 16, display: 'block' }}>
              ← Back to Darshan
            </Link>
          </div>
        </div>
      </DevotionLayout>
    );
  }

  return (
    <DevotionLayout>
      <div style={{ paddingTop: 80 }}>

        {/* ── BREADCRUMB ──────────────────────────────────────────────── */}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 48px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#9C7B62' }}>
            <Link to="/avatar-live" style={{ color: '#BC6A4D', textDecoration: 'none' }}>Avatar Live</Link>
            <span>/</span>
            <Link to="/avatar-live/darshan" style={{ color: '#BC6A4D', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ArrowLeft style={{ width: 12, height: 12 }} /> Live Darshan
            </Link>
            <span>/</span>
            <span style={{ color: '#2C1810' }}>{temple.name}</span>
          </div>
        </div>

        {/* ── YOUTUBE EMBED ───────────────────────────────────────────── */}
        <section style={{ padding: '20px 48px 0' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{
              position: 'relative', paddingBottom: '56.25%', height: 0,
              background: temple.gradient, borderRadius: 20, overflow: 'hidden',
              boxShadow: '0 16px 56px rgba(120,60,20,0.14)',
            }}>
              <iframe
                src={`https://www.youtube.com/embed/${temple.youtubeVideoId}?autoplay=1&mute=1&rel=0&modestbranding=1`}
                title={`${temple.name} Live Darshan`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              />
            </div>

            {/* Stream meta bar */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
              gap: 16, padding: '18px 0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  background: temple.isLive ? '#E53935' : 'rgba(60,60,60,0.6)',
                  color: '#FFF', fontSize: 11, fontWeight: 700,
                  padding: '5px 12px', borderRadius: 99, letterSpacing: '0.12em',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {temple.isLive && <span style={{ width: 6, height: 6, background: '#FFF', borderRadius: '50%' }} />}
                  {temple.isLive ? 'LIVE' : 'OFFLINE'}
                </div>
                {temple.isLive && (
                  <span style={{ fontSize: 13, color: '#7A5C42', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Users style={{ width: 14, height: 14 }} /> {formatViewers(temple.viewers)} watching
                  </span>
                )}
                <span style={{ fontSize: 12, color: '#9C7B62' }}>{temple.category}</span>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setLiked(l => !l)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px',
                    borderRadius: 10, border: '1.5px solid rgba(188,106,77,0.22)',
                    background: liked ? 'rgba(188,106,77,0.1)' : 'transparent',
                    color: liked ? '#BC6A4D' : '#7A5C42',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  <Heart style={{ width: 14, height: 14, fill: liked ? '#BC6A4D' : 'none' }} />
                  {liked ? 'Saved' : 'Save'}
                </button>
                {temple.website && (
                  <a href={temple.website} target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px',
                    borderRadius: 10, border: '1.5px solid rgba(188,106,77,0.22)',
                    background: 'transparent', color: '#BC6A4D', fontSize: 12, fontWeight: 600,
                    textDecoration: 'none',
                  }}>
                    <ExternalLink style={{ width: 13, height: 13 }} /> Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
        <section style={{ padding: '16px 48px 64px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>

            {/* Left — temple info + prayer wall */}
            <div>
              {/* Header */}
              <div style={{ marginBottom: 24 }}>
                <h1 className="font-display uppercase tracking-wide leading-tight"
                  style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, color: '#2C1810', marginBottom: 8 }}>
                  {temple.name}
                </h1>
                <p style={{ fontSize: 16, color: '#BC6A4D', fontWeight: 600, marginBottom: 8 }}>{temple.deity}</p>
                <p style={{ fontSize: 14, color: '#6B4E3D', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin style={{ width: 15, height: 15, color: '#BC6A4D' }} />
                  {temple.city}, {temple.state}
                </p>
              </div>

              {/* Description */}
              <div style={{
                background: '#FFF', borderRadius: 16,
                border: '1.5px solid rgba(188,106,77,0.10)',
                padding: '20px 24px', marginBottom: 20,
              }}>
                <p style={{ fontSize: 14, color: 'rgba(44,24,16,0.65)', lineHeight: 1.8 }}>
                  {temple.description}
                </p>
              </div>

              {/* Timings grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14,
                marginBottom: 24,
              }}>
                <div style={{ background: '#FFF', borderRadius: 14, border: '1.5px solid rgba(188,106,77,0.10)', padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Clock style={{ width: 14, height: 14, color: '#BC6A4D' }} />
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#BC6A4D', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Darshan</p>
                  </div>
                  <p style={{ fontSize: 14, color: '#2C1810', fontWeight: 600 }}>{temple.darshanTimings}</p>
                </div>
                <div style={{ background: '#FFF', borderRadius: 14, border: '1.5px solid rgba(188,106,77,0.10)', padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 14 }}>🪔</span>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#BC6A4D', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Aarti Times</p>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {temple.aartTimings.map(t => (
                      <span key={t} style={{ fontSize: 12, color: '#2C1810', background: 'rgba(188,106,77,0.08)', padding: '3px 8px', borderRadius: 6 }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* YouTube channel link */}
              {temple.youtubeChannelName && (
                <div style={{
                  background: '#FFF', borderRadius: 14, border: '1.5px solid rgba(188,106,77,0.10)',
                  padding: '14px 18px', marginBottom: 24,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FF0000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Globe style={{ width: 18, height: 18, color: '#FFF' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: '#9C7B62', marginBottom: 2 }}>YouTube Channel</p>
                    <p style={{ fontSize: 13, color: '#2C1810', fontWeight: 600 }}>{temple.youtubeChannelName}</p>
                  </div>
                </div>
              )}

              {/* Prayer wall */}
              <PrayerWall templeId={temple.id} />
            </div>

            {/* Right — donation + nearby */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 88 }}>
              <DonationCard templeName={temple.name} />

              {/* Quick info */}
              <div style={{
                background: '#FFF', borderRadius: 20,
                border: '1.5px solid rgba(188,106,77,0.13)',
                boxShadow: '0 4px 20px rgba(120,60,20,0.07)',
                padding: '20px 24px',
              }}>
                <h3 className="font-display uppercase tracking-wide" style={{ fontSize: 16, color: '#2C1810', marginBottom: 14 }}>Quick Info</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Category', value: temple.category },
                    { label: 'Location', value: `${temple.city}, ${temple.state}` },
                    { label: 'Stream Status', value: temple.isLive ? '🔴 Live' : '⚫ Offline' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#9C7B62' }}>{label}</span>
                      <span style={{ fontSize: 13, color: '#2C1810', fontWeight: 600 }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Back link */}
              <Link to="/avatar-live/darshan" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px', borderRadius: 12, textDecoration: 'none',
                border: '1.5px solid rgba(188,106,77,0.22)', color: '#BC6A4D',
                fontSize: 13, fontWeight: 600, background: 'transparent',
                transition: 'background 0.2s',
              }}>
                <ArrowLeft style={{ width: 14, height: 14 }} /> All Darshan Streams
              </Link>
            </div>
          </div>
        </section>

        {/* ── OTHER LIVE NOW ───────────────────────────────────────────── */}
        {(() => {
          const others = liveTemples.filter(t => t.isLive && t.id !== temple.id).slice(0, 3);
          if (others.length === 0) return null;
          return (
            <section style={{ padding: '0 48px 64px' }}>
              <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                <h2 className="font-display font-bold tracking-wide uppercase" style={{ fontSize: 22, color: '#2C1810', marginBottom: 20 }}>
                  Also Live Now
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                  {others.map(t => (
                    <Link key={t.id} to={`/avatar-live/darshan/${t.slug}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        background: '#FFF', borderRadius: 16,
                        border: '1.5px solid rgba(188,106,77,0.13)',
                        overflow: 'hidden', display: 'flex', gap: 14, padding: 16, alignItems: 'center',
                        transition: 'box-shadow 0.2s',
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(120,60,20,0.12)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                      >
                        <div style={{ width: 56, height: 56, borderRadius: 12, background: t.gradient, flexShrink: 0, overflow: 'hidden' }}>
                          {t.image && <img src={`/images/temples/${t.image}`} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#2C1810', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</p>
                          <p style={{ fontSize: 11, color: '#9C7B62', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 6, height: 6, background: '#E53935', borderRadius: '50%', flexShrink: 0 }} />
                            {formatViewers(t.viewers)} watching
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          );
        })()}
      </div>
    </DevotionLayout>
  );
};

export default DarshanDetail;
