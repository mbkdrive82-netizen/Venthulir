'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle2, 
  Leaf, 
  ShieldCheck, 
  Sparkles, 
  Truck, 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  Instagram, 
  Facebook,
  Heart,
  Droplets,
  Moon,
  Sun,
  Palette
} from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();

  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Interactive Scenery Themes: 'minimal-ivory' | 'midnight-stars' | 'pollachi-express' | 'golden-sunset'
  const [sceneryTheme, setSceneryTheme] = useState('minimal-ivory');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 6000);
    }, 600);
  };

  const handleLink = (path, hash) => {
    if (path.includes('#') && (pathname === '/home' || pathname === '/')) {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push(path);
    }
  };

  return (
    <footer className="footer-luxury">
      {/* ── TOP TRUST PILLARS STRIP ── */}
      <div className="footer-trust-strip">
        <div className="footer-container">
          <div className="trust-pillars-grid">
            <div className="trust-pillar-item">
              <div className="trust-pillar-icon">
                <Droplets size={22} />
              </div>
              <div className="trust-pillar-content">
                <h4>Wood Cold-Pressed</h4>
                <p>Extracted in Vaagai wood churns below 40°C</p>
              </div>
            </div>

            <div className="trust-pillar-item">
              <div className="trust-pillar-icon">
                <ShieldCheck size={22} />
              </div>
              <div className="trust-pillar-content">
                <h4>100% Pure & Unrefined</h4>
                <p>Zero chemicals, solvents, or artificial aromas</p>
              </div>
            </div>

            <div className="trust-pillar-item">
              <div className="trust-pillar-icon">
                <Leaf size={22} />
              </div>
              <div className="trust-pillar-content">
                <h4>Single-Origin Harvest</h4>
                <p>Direct from native Tamil Nadu organic farms</p>
              </div>
            </div>

            <div className="trust-pillar-item">
              <div className="trust-pillar-icon">
                <Truck size={22} />
              </div>
              <div className="trust-pillar-content">
                <h4>Farm to Doorstep</h4>
                <p>Fresh batch dispatched in UV-safe containers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN FOOTER CONTENT ── */}
      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-grid">
            {/* Column 1: Brand & Heritage */}
            <div className="footer-brand-col">
              <Link href="/home" className="footer-brand-logo">
                <span className="brand-crest">
                  <Leaf size={20} />
                </span>
                <span className="brand-name">VENTHULIR</span>
              </Link>
              <div className="footer-tamil-sub">தூய மரச்செக்கு எண்ணெய் & இயற்கை விளைச்சல்</div>
              <p className="footer-about-text">
                Honoring ancient South Indian cold-pressing traditions. Handcrafted in traditional wooden chekkus to preserve living nutrients, wholesome aroma, and natural vitality.
              </p>

              <div className="footer-social-row">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="social-pill-btn"
                  aria-label="Instagram"
                >
                  <Instagram size={17} />
                </a>
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="social-pill-btn"
                  aria-label="Facebook"
                >
                  <Facebook size={17} />
                </a>
                <a 
                  href="https://wa.me/918778476414" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="social-pill-btn whatsapp"
                  aria-label="WhatsApp"
                >
                  <MessageCircle size={17} />
                </a>
              </div>
            </div>

            {/* Column 2: Pure Harvests (Shop) */}
            <div className="footer-nav-col">
              <h3 className="footer-col-title">Pure Harvests</h3>
              <ul className="footer-links-list">
                <li>
                  <button onClick={() => router.push('/products?category=Cold-Pressed Oils')}>
                    Cold-Pressed Oils (Marachekku)
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/products?category=Spices & Powders')}>
                    Traditional Spices & Podis
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/products?category=Masala Blends')}>
                    Heritage Masala Blends
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/products')}>
                    View All Products
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/profile?tab=cart')}>
                    My Harvest Basket
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Heritage & Trust */}
            <div className="footer-nav-col">
              <h3 className="footer-col-title">Heritage & Trust</h3>
              <ul className="footer-links-list">
                <li>
                  <button onClick={() => handleLink('/home#why-choose', '#why-choose')}>
                    Our Story & Farmers
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLink('/home#reviews', '#reviews')}>
                    Customer Reviews
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLink('/home#faq', '#faq')}>
                    Frequently Asked Questions
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/profile?tab=custom')}>
                    Custom & Bulk Tin Orders
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/profile')}>
                    My Account Dashboard
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Direct Contact & Harvest Club */}
            <div className="footer-contact-col">
              <h3 className="footer-col-title">Farm Direct</h3>
              <div className="footer-contact-details">
                <a href="tel:+918778476414" className="contact-item">
                  <Phone size={16} className="contact-icon" />
                  <span>+91 87784 76414</span>
                </a>
                <a href="mailto:theventhulir@gmail.com" className="contact-item">
                  <Mail size={16} className="contact-icon" />
                  <span>theventhulir@gmail.com</span>
                </a>
                <div className="contact-item">
                  <MapPin size={16} className="contact-icon" />
                  <span>Tamil Nadu, India</span>
                </div>
              </div>

              {/* Newsletter Box */}
              <div className="footer-newsletter-card">
                <h4>Join the Venthulir Circle</h4>
                <p>Receive 10% off your first harvest order and seasonal recipe guides.</p>
                {subscribed ? (
                  <div className="newsletter-success-state">
                    <CheckCircle2 size={18} />
                    <span>Welcome! Check your inbox for your 10% code.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="newsletter-luxury-form">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <button type="submit" disabled={submitting} aria-label="Subscribe">
                      <ArrowRight size={16} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE LUXURY DELIVERY HIGHWAY STAGE ── */}
      <div className={`footer-animation-stage theme-${sceneryTheme}`}>
        
        {/* 🌟 Interactive Scenery Switcher Bar */}
        <div className="scenery-theme-switcher" aria-label="Choose scenery theme">
          <span className="switcher-title">
            <Palette size={13} />
            <span>Theme Options:</span>
          </span>
          <div className="switcher-buttons">
            <button 
              className={`switcher-btn ${sceneryTheme === 'minimal-ivory' ? 'active' : ''}`}
              onClick={() => setSceneryTheme('minimal-ivory')}
            >
              ✨ Minimal Ivory
            </button>
            <button 
              className={`switcher-btn ${sceneryTheme === 'midnight-stars' ? 'active' : ''}`}
              onClick={() => setSceneryTheme('midnight-stars')}
            >
              🌙 Midnight Stars
            </button>
            <button 
              className={`switcher-btn ${sceneryTheme === 'pollachi-express' ? 'active' : ''}`}
              onClick={() => setSceneryTheme('pollachi-express')}
            >
              🌴 Pollachi Palms
            </button>
            <button 
              className={`switcher-btn ${sceneryTheme === 'golden-sunset' ? 'active' : ''}`}
              onClick={() => setSceneryTheme('golden-sunset')}
            >
              🌅 Amber Sunset
            </button>
          </div>
        </div>

        {/* ── VECTOR SCENERY BACKDROPS ── */}
        <div className="anim-scenery-backdrop" aria-hidden="true">
          
          {/* ═════════════════════════════════════════════════════════════
              THEME 1: MINIMAL ROYAL IVORY (Zen & Extraordinary)
          ═════════════════════════════════════════════════════════════ */}
          {sceneryTheme === 'minimal-ivory' && (
            <svg className="scenery-svg" viewBox="0 0 1440 160" preserveAspectRatio="none" fill="none">
              <defs>
                <linearGradient id="ivorySky" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FAF7F0" />
                  <stop offset="60%" stopColor="#F5EFE4" />
                  <stop offset="100%" stopColor="#EFE8D8" />
                </linearGradient>
                <linearGradient id="ivoryHills1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#E6DFD0" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#DDD4C2" stopOpacity="0.95" />
                </linearGradient>
                <linearGradient id="ivoryHills2" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#D5CBB5" />
                  <stop offset="100%" stopColor="#C8BC9F" />
                </linearGradient>
              </defs>

              <rect width="1440" height="160" fill="url(#ivorySky)" />

              {/* Minimal Gold Sun Halo */}
              <circle cx="720" cy="46" r="28" stroke="#D4AF37" strokeWidth="1.2" fill="#FAF5EB" opacity="0.8" />
              <circle cx="720" cy="46" r="24" fill="#F4E8CB" opacity="0.5" />

              {/* Hills */}
              <path d="M 0 72 Q 220 38 480 62 T 980 44 Q 1220 28 1440 56 L 1440 160 L 0 160 Z" fill="url(#ivoryHills1)" />
              <path d="M 0 94 Q 280 66 620 88 T 1180 72 Q 1330 84 1440 88 L 1440 160 L 0 160 Z" fill="url(#ivoryHills2)" />

              {/* Minimal Palm Silhouettes */}
              <g transform="translate(160, 48) scale(0.68)" opacity="0.85">
                <path d="M 28 95 Q 24 45 36 0 Q 40 45 35 95 Z" fill="#4B3D2A" />
                <path d="M 36 0 C 10 -24 -20 -14 -42 6 C -18 -2 16 -12 36 0 Z" fill="#2E3B32" />
                <path d="M 36 0 C 48 -28 85 -28 108 -8 C 84 -15 50 -15 36 0 Z" fill="#2E3B32" />
                <path d="M 36 0 C 24 -34 50 -52 58 -68 C 45 -45 32 -28 36 0 Z" fill="#1C2820" />
              </g>

              <g transform="translate(880, 40) scale(0.75)" opacity="0.85">
                <path d="M 28 95 Q 24 45 36 0 Q 40 45 35 95 Z" fill="#4B3D2A" />
                <path d="M 36 0 C 10 -24 -20 -14 -42 6 C -18 -2 16 -12 36 0 Z" fill="#2E3B32" />
                <path d="M 36 0 C 48 -28 85 -28 108 -8 C 84 -15 50 -15 36 0 Z" fill="#2E3B32" />
                <path d="M 36 0 C 24 -34 50 -52 58 -68 C 45 -45 32 -28 36 0 Z" fill="#1C2820" />
              </g>

              <g transform="translate(1300, 44) scale(0.65)" opacity="0.85">
                <path d="M 28 95 Q 24 45 36 0 Q 40 45 35 95 Z" fill="#4B3D2A" />
                <path d="M 36 0 C 10 -24 -20 -14 -42 6 C -18 -2 16 -12 36 0 Z" fill="#2E3B32" />
                <path d="M 36 0 C 48 -28 85 -28 108 -8 C 84 -15 50 -15 36 0 Z" fill="#2E3B32" />
                <path d="M 36 0 C 24 -34 50 -52 58 -68 C 45 -45 32 -28 36 0 Z" fill="#1C2820" />
              </g>

              {/* Minimal Windmill */}
              <g transform="translate(380, 44) scale(0.65)" opacity="0.65">
                <line x1="0" y1="0" x2="0" y2="46" stroke="#8C7A5E" strokeWidth="1.8" />
                <circle cx="0" cy="0" r="2.5" fill="#8C7A5E" />
                <g>
                  <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="5s" repeatCount="indefinite" />
                  <line x1="0" y1="0" x2="0" y2="-22" stroke="#8C7A5E" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="0" y1="0" x2="19" y2="11" stroke="#8C7A5E" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="0" y1="0" x2="-19" y2="11" stroke="#8C7A5E" strokeWidth="1.5" strokeLinecap="round" />
                </g>
              </g>
            </svg>
          )}

          {/* ═════════════════════════════════════════════════════════════
              THEME 2: ROYAL MIDNIGHT STARLIGHT (Ultra-Luxury Dark Gold)
          ═════════════════════════════════════════════════════════════ */}
          {sceneryTheme === 'midnight-stars' && (
            <svg className="scenery-svg" viewBox="0 0 1440 160" preserveAspectRatio="none" fill="none">
              <defs>
                <linearGradient id="nightSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#04130C" />
                  <stop offset="60%" stopColor="#082317" />
                  <stop offset="100%" stopColor="#0E3322" />
                </linearGradient>

                <linearGradient id="nightHills1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0F3826" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#071E14" />
                </linearGradient>

                <linearGradient id="nightHills2" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#174A33" />
                  <stop offset="100%" stopColor="#0B261A" />
                </linearGradient>

                {/* Moon Radial Glow */}
                <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FEF08A" stopOpacity="1" />
                  <stop offset="40%" stopColor="#FACC15" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#EAB308" stopOpacity="0" />
                </radialGradient>
              </defs>

              <rect width="1440" height="160" fill="url(#nightSkyGrad)" />

              {/* Glowing Golden Crescent Moon */}
              <circle cx="280" cy="45" r="32" fill="url(#moonGlow)" />
              <circle cx="280" cy="45" r="14" fill="#FEF08A" />
              <circle cx="285" cy="42" r="12" fill="#061B11" />

              {/* Twinkling Stars */}
              {[
                { x: 120, y: 25, r: 1.5, dur: '1.8s' },
                { x: 210, y: 50, r: 1.2, dur: '2.4s' },
                { x: 420, y: 28, r: 2, dur: '2s' },
                { x: 580, y: 40, r: 1.5, dur: '3.1s' },
                { x: 740, y: 20, r: 1.8, dur: '2.2s' },
                { x: 890, y: 35, r: 1.2, dur: '2.7s' },
                { x: 1060, y: 22, r: 2, dur: '1.9s' },
                { x: 1240, y: 45, r: 1.5, dur: '2.5s' },
                { x: 1360, y: 28, r: 1.8, dur: '3s' },
              ].map((s, idx) => (
                <circle key={idx} cx={s.x} cy={s.y} r={s.r} fill="#FDE047">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur={s.dur} repeatCount="indefinite" />
                </circle>
              ))}

              {/* Distant Midnight Hills */}
              <path d="M 0 72 Q 220 38 480 62 T 980 44 Q 1220 28 1440 56 L 1440 160 L 0 160 Z" fill="url(#nightHills1)" />
              <path d="M 0 94 Q 280 66 620 88 T 1180 72 Q 1330 84 1440 88 L 1440 160 L 0 160 Z" fill="url(#nightHills2)" />

              {/* Silhouetted Night Palms */}
              <g transform="translate(140, 44) scale(0.68)">
                <path d="M 28 95 Q 24 45 36 0 Q 40 45 35 95 Z" fill="#04120B" />
                <path d="M 36 0 C 10 -24 -20 -14 -42 6 C -18 -2 16 -12 36 0 Z" fill="#061B11" />
                <path d="M 36 0 C 48 -28 85 -28 108 -8 C 84 -15 50 -15 36 0 Z" fill="#061B11" />
                <path d="M 36 0 C 24 -34 50 -52 58 -68 C 45 -45 32 -28 36 0 Z" fill="#04120B" />
              </g>

              <g transform="translate(920, 38) scale(0.75)">
                <path d="M 28 95 Q 24 45 36 0 Q 40 45 35 95 Z" fill="#04120B" />
                <path d="M 36 0 C 10 -24 -20 -14 -42 6 C -18 -2 16 -12 36 0 Z" fill="#061B11" />
                <path d="M 36 0 C 48 -28 85 -28 108 -8 C 84 -15 50 -15 36 0 Z" fill="#061B11" />
                <path d="M 36 0 C 24 -34 50 -52 58 -68 C 45 -45 32 -28 36 0 Z" fill="#04120B" />
              </g>

              {/* Glowing Highway Lampposts */}
              {[220, 600, 980, 1340].map((lx, i) => (
                <g key={i} transform={`translate(${lx}, 68)`}>
                  <line x1="0" y1="0" x2="0" y2="40" stroke="#475569" strokeWidth="1.8" />
                  <path d="M 0 0 C 4 -6 12 -6 14 -2" stroke="#475569" strokeWidth="1.8" fill="none" />
                  <circle cx="14" cy="-1" r="3" fill="#FEF08A" />
                  <polygon points="14,0 4,45 24,45" fill="#FEF08A" opacity="0.12" />
                </g>
              ))}
            </svg>
          )}

          {/* ═════════════════════════════════════════════════════════════
              THEME 3: POLLACHI COCONUT HIGHWAY (Fresh Daylight Farm)
          ═════════════════════════════════════════════════════════════ */}
          {sceneryTheme === 'pollachi-express' && (
            <svg className="scenery-svg" viewBox="0 0 1440 160" preserveAspectRatio="none" fill="none">
              <defs>
                <linearGradient id="pollachiSky" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#E0F2FE" />
                  <stop offset="60%" stopColor="#F0F9FF" />
                  <stop offset="100%" stopColor="#DCFCE7" />
                </linearGradient>

                <linearGradient id="pollachiGhats" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#64748B" />
                </linearGradient>

                <linearGradient id="pollachiGroves" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4ADE80" />
                  <stop offset="100%" stopColor="#15803D" />
                </linearGradient>
              </defs>

              <rect width="1440" height="160" fill="url(#pollachiSky)" />

              {/* Distant Ghats Peaks */}
              <path d="M 0 68 Q 200 32 460 56 T 940 38 Q 1200 22 1440 50 L 1440 160 L 0 160 Z" fill="url(#pollachiGhats)" />

              {/* Midground Tea & Coconut Valley */}
              <path d="M 0 90 Q 260 62 580 84 T 1140 68 Q 1310 80 1440 84 L 1440 160 L 0 160 Z" fill="url(#pollachiGroves)" />

              {/* Realistic Pollachi Coconut Palms */}
              {[120, 360, 680, 960, 1260].map((px, i) => (
                <g key={i} transform={`translate(${px}, ${42 + (i % 2) * 6}) scale(${0.7 + (i % 3) * 0.05})`}>
                  <path d="M 28 95 Q 24 45 36 0 Q 40 45 35 95 Z" fill="#5B4029" />
                  <path d="M 36 0 C 10 -24 -20 -14 -42 6 C -18 -2 16 -12 36 0 Z" fill="#2D7A46" />
                  <path d="M 36 0 C 48 -28 85 -28 108 -8 C 84 -15 50 -15 36 0 Z" fill="#2D7A46" />
                  <path d="M 36 0 C 24 -34 50 -52 58 -68 C 45 -45 32 -28 36 0 Z" fill="#1B5E2F" />
                  <path d="M 36 0 C 8 -38 -10 -50 -22 -68 C -4 -45 14 -28 36 0 Z" fill="#1B5E2F" />
                </g>
              ))}
            </svg>
          )}

          {/* ═════════════════════════════════════════════════════════════
              THEME 4: WARM AMBER SUNSET (Golden Hour Horizon)
          ═════════════════════════════════════════════════════════════ */}
          {sceneryTheme === 'golden-sunset' && (
            <svg className="scenery-svg" viewBox="0 0 1440 160" preserveAspectRatio="none" fill="none">
              <defs>
                <linearGradient id="sunsetSky" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFF7ED" />
                  <stop offset="40%" stopColor="#FED7AA" />
                  <stop offset="80%" stopColor="#FDE68A" />
                  <stop offset="100%" stopColor="#FDBA74" />
                </linearGradient>

                <linearGradient id="sunsetMountains" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#94A3B8" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>

                <linearGradient id="sunsetHarvest" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#9A3412" />
                </linearGradient>
              </defs>

              <rect width="1440" height="160" fill="url(#sunsetSky)" />

              {/* Amber Sun */}
              <circle cx="720" cy="50" r="30" fill="#FEF08A" opacity="0.9" />
              <circle cx="720" cy="50" r="14" fill="#FFFBEB" />

              {/* Mountains & Harvest Slopes */}
              <path d="M 0 72 Q 220 36 480 58 T 980 40 Q 1220 24 1440 52 L 1440 160 L 0 160 Z" fill="url(#sunsetMountains)" opacity="0.8" />
              <path d="M 0 94 Q 280 66 620 88 T 1180 72 Q 1330 84 1440 88 L 1440 160 L 0 160 Z" fill="url(#sunsetHarvest)" />

              {/* Silhouette Date Palms */}
              <g transform="translate(180, 48) scale(0.68)">
                <path d="M 28 95 Q 24 45 36 0 Q 40 45 35 95 Z" fill="#334155" />
                <path d="M 36 0 C 10 -24 -20 -14 -42 6 C -18 -2 16 -12 36 0 Z" fill="#1E293B" />
                <path d="M 36 0 C 48 -28 85 -28 108 -8 C 84 -15 50 -15 36 0 Z" fill="#1E293B" />
                <path d="M 36 0 C 24 -34 50 -52 58 -68 C 45 -45 32 -28 36 0 Z" fill="#0F172A" />
              </g>

              <g transform="translate(860, 42) scale(0.72)">
                <path d="M 28 95 Q 24 45 36 0 Q 40 45 35 95 Z" fill="#334155" />
                <path d="M 36 0 C 10 -24 -20 -14 -42 6 C -18 -2 16 -12 36 0 Z" fill="#1E293B" />
                <path d="M 36 0 C 48 -28 85 -28 108 -8 C 84 -15 50 -15 36 0 Z" fill="#1E293B" />
                <path d="M 36 0 C 24 -34 50 -52 58 -68 C 45 -45 32 -28 36 0 Z" fill="#0F172A" />
              </g>
            </svg>
          )}

        </div>

        {/* ── SMOOTH HIGHWAY ROADWAY ── */}
        <div className="anim-road-track">
          <div className="road-surface">
            <div className="road-dashed-lines" />
          </div>

          {/* ─────────────────────────────────────────────────────────────
              PREMIUM LUXURY WHITE & GOLD VENTHULIR EXPRESS TEMPO
              (Clean, Minimal, High-Contrast & Smooth Glide)
          ───────────────────────────────────────────────────────────── */}
          <div className="anim-moving-vehicle van-vehicle">
            {/* Minimal Floating Badge */}
            <div className="vehicle-speech-bubble">
              <span className="bubble-live-dot" />
              <span className="bubble-text">Farm Fresh Direct Delivery</span>
            </div>

            {/* Clean Vector Delivery Van */}
            <svg className="vehicle-svg van-svg" viewBox="0 0 230 85" fill="none">
              <defs>
                {/* Crisp White Body */}
                <linearGradient id="cleanWhiteBody" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="70%" stopColor="#FAF8F5" />
                  <stop offset="100%" stopColor="#ECE5D8" />
                </linearGradient>

                {/* Royal Emerald Beltline */}
                <linearGradient id="cleanEmeraldStripe" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0F3D2A" />
                  <stop offset="60%" stopColor="#15803D" />
                  <stop offset="100%" stopColor="#0F3D2A" />
                </linearGradient>

                {/* Champagne Gold Ribbon */}
                <linearGradient id="cleanGoldTrim" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#C59B27" />
                  <stop offset="50%" stopColor="#F3DC87" />
                  <stop offset="100%" stopColor="#C59B27" />
                </linearGradient>

                {/* Soft Tinted Cabin Glass */}
                <linearGradient id="cleanGlass" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EBF4F0" />
                  <stop offset="100%" stopColor="#BDDCD0" />
                </linearGradient>
              </defs>

              {/* Aerodynamic Roof Deflector */}
              <path
                d="M 145 14 L 176 17 C 183 18 189 23 191 29 L 145 29 Z"
                fill="#0F3D2A"
              />

              {/* Main Cargo Body */}
              <rect x="15" y="14" width="135" height="49" rx="7" fill="url(#cleanWhiteBody)" stroke="#DDD4C2" strokeWidth="1.2" />
              
              {/* Subtle Door Seams */}
              <line x1="58" y1="17" x2="58" y2="60" stroke="#DDD4C2" strokeWidth="1.2" />
              <line x1="102" y1="17" x2="102" y2="60" stroke="#DDD4C2" strokeWidth="1.2" />
              <rect x="14" y="24" width="2.5" height="7" fill="#C59B27" rx="1" />
              <rect x="14" y="47" width="2.5" height="7" fill="#C59B27" rx="1" />

              {/* Front Cabin Section */}
              <path
                d="M 148 21 L 181 21 C 191 21 199 27 203 36 L 209 49 C 211 53 208 63 200 63 L 148 63 Z"
                fill="url(#cleanWhiteBody)"
                stroke="#DDD4C2"
                strokeWidth="1.2"
              />

              {/* Front Windshield with Driver Silhouette */}
              <path
                d="M 152 25 L 177 25 C 183 25 188 29 191 35 L 197 46 L 152 46 Z"
                fill="url(#cleanGlass)"
                stroke="#0F3D2A"
                strokeWidth="0.8"
              />
              <circle cx="167" cy="34" r="4.5" fill="#0F3D2A" opacity="0.75" />
              <path d="M 163 32 Q 170 30 174 34" stroke="#C59B27" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 160 46 C 160 40 174 40 174 46 Z" fill="#0F3D2A" opacity="0.75" />

              {/* Side Mirror */}
              <rect x="179" y="33" width="4.5" height="8.5" rx="2" fill="#0F172A" />
              <line x1="175" y1="37" x2="179" y2="37" stroke="#0F172A" strokeWidth="1.5" />

              {/* Royal Emerald & Gold Belt Stripe */}
              <rect x="15" y="48" width="193" height="6" fill="url(#cleanEmeraldStripe)" />
              <rect x="15" y="45" width="193" height="2.5" fill="url(#cleanGoldTrim)" />

              {/* 🌟 VENTHULIR Clean Luxury Branding (Strictly inside Cargo Box) */}
              <g transform="translate(18, 18)">
                {/* Brand Emblem */}
                <circle cx="14" cy="13" r="10" fill="#0F3D2A" stroke="#C59B27" strokeWidth="1.2" />
                <path d="M 14 7 C 10 11 10 16 14 19 C 18 16 18 11 14 7 Z" fill="#F4DA90" />
                
                {/* Brand Name */}
                <text x="30" y="12" fill="#0F3D2A" fontSize="11" fontWeight="900" fontFamily="'Cinzel', Georgia, serif" letterSpacing="0.8">
                  VENTHULIR
                </text>
                {/* Tagline */}
                <text x="30" y="21" fill="#8C5815" fontSize="5.2" fontWeight="800" fontFamily="sans-serif" letterSpacing="0.4">
                  100% PURE WOOD COLD-PRESSED
                </text>
              </g>

              {/* Front Grille & Headlight */}
              <rect x="199" y="52" width="10.5" height="10" rx="2" fill="#1E2A24" stroke="#8C7A5E" strokeWidth="1" />
              <line x1="201" y1="55" x2="208" y2="55" stroke="#F4DA90" strokeWidth="1.2" />
              <line x1="201" y1="58" x2="208" y2="58" stroke="#F4DA90" strokeWidth="1.2" />

              <path d="M 207 47 L 214 47 C 215 47 216 48 216 49 L 216 52 C 216 53 215 54 214 54 L 207 54 Z" fill="#FEF08A" />
              <polygon points="216,48 244,42 244,64 216,53" fill="#FEF08A" opacity="0.3" />

              {/* Rear Tail Light */}
              <rect x="12" y="26" width="3.5" height="15" rx="1.5" fill="#DC2626" />

              {/* Mudguards */}
              <path d="M 38 63 A 18 18 0 0 1 72 63 Z" fill="#1E2A24" />
              <path d="M 160 63 A 18 18 0 0 1 194 63 Z" fill="#1E2A24" />

              {/* Rear Wheel (Smooth Native Rotation) */}
              <g>
                <animateTransform attributeName="transform" type="rotate" from="0 55 63" to="360 55 63" dur="0.55s" repeatCount="indefinite" />
                <circle cx="55" cy="63" r="15" fill="#1E2A24" stroke="#4B584E" strokeWidth="1.2" />
                <circle cx="55" cy="63" r="9.5" fill="#FFFFFF" stroke="#8C7A5E" strokeWidth="1.2" />
                <circle cx="55" cy="63" r="4.5" fill="#1E2A24" />
                <circle cx="55" cy="63" r="2.5" fill="#C59B27" />
                <line x1="47" y1="63" x2="63" y2="63" stroke="#4B584E" strokeWidth="1.8" />
                <line x1="55" y1="55" x2="55" y2="71" stroke="#4B584E" strokeWidth="1.8" />
                <line x1="49.5" y1="57.5" x2="60.5" y2="68.5" stroke="#4B584E" strokeWidth="1.8" />
                <line x1="49.5" y1="68.5" x2="60.5" y2="57.5" stroke="#4B584E" strokeWidth="1.8" />
              </g>

              {/* Front Wheel (Smooth Native Rotation) */}
              <g>
                <animateTransform attributeName="transform" type="rotate" from="0 177 63" to="360 177 63" dur="0.55s" repeatCount="indefinite" />
                <circle cx="177" cy="63" r="15" fill="#1E2A24" stroke="#4B584E" strokeWidth="1.2" />
                <circle cx="177" cy="63" r="9.5" fill="#FFFFFF" stroke="#8C7A5E" strokeWidth="1.2" />
                <circle cx="177" cy="63" r="4.5" fill="#1E2A24" />
                <circle cx="177" cy="63" r="2.5" fill="#C59B27" />
                <line x1="169" y1="63" x2="185" y2="63" stroke="#4B584E" strokeWidth="1.8" />
                <line x1="177" y1="55" x2="177" y2="71" stroke="#4B584E" strokeWidth="1.8" />
                <line x1="171.5" y1="57.5" x2="182.5" y2="68.5" stroke="#4B584E" strokeWidth="1.8" />
                <line x1="171.5" y1="68.5" x2="182.5" y2="57.5" stroke="#4B584E" strokeWidth="1.8" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* ── 3. BOTTOM BAR ── */}
      <div className="footer-bottom-bar">
        <div className="footer-container">
          <div className="footer-bottom-flex">
            <div className="footer-copyright-wrap">
              <p>&copy; {new Date().getFullYear()} Venthulir Natural Harvests. All rights reserved.</p>
              <span className="fssai-pill">
                <ShieldCheck size={13} />
                <span>FSSAI Lic. No. 12423002001892</span>
              </span>
            </div>

            <div className="footer-bottom-links">
              <Link href="/privacy">Privacy Policy</Link>
              <span className="dot-sep">•</span>
              <Link href="/terms">Terms of Service</Link>
              <span className="dot-sep">•</span>
              <button onClick={() => router.push('/profile?tab=help')} className="inline-help-link">
                Help & Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
