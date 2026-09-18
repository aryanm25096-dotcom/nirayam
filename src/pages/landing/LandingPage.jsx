import { useNavigate } from 'react-router-dom';
import kioskHero from '../../assets/kiosk_hero_scene.jpg';
import skylineBanner from '../../assets/india_skyline_banner.jpg';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // Prime browser SpeechSynthesis on first user interaction to bypass autoplay restrictions
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.resume();
        const silent = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(silent);
      }
    } catch (e) {
      // ignore
    }
    navigate('/identify');
  };

  return (
    <div className="lp-shell">

      {/* ── HEADER ── */}
      <header className="lp-header">
        <div className="lp-header-inner">

          {/* Brand */}
          <a className="lp-brand" href="#home" onClick={(e) => e.preventDefault()}>
            <div className="lp-brand-icon">
              <svg className="lp-brand-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M3 12h3.5l2.5-7 4 14 3-10 2 5.5H21" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" />
              </svg>
            </div>
            <div className="lp-brand-text">
              <span className="lp-brand-name">MediKiosk</span>
              <span className="lp-brand-tagline">AI Clinical Intake &amp; OPD Digitization</span>
            </div>
          </a>

          {/* Nav */}
          <nav className="lp-nav" aria-label="Primary navigation">
            <a className="lp-nav-link lp-nav-link--active" href="#home">Home</a>
            <a className="lp-nav-link" href="#how-it-works">How It Works</a>
            <a className="lp-nav-link" href="#patients">For Patients</a>
            <a className="lp-nav-link" href="#hospitals">For Hospitals</a>
            <a className="lp-nav-link" href="#about">About</a>
          </nav>

          {/* Actions */}
          <div className="lp-header-actions">
            <button className="lp-lang-btn" type="button" onClick={() => navigate('/identify')} title="Select Language">
              <svg className="lp-lang-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
              </svg>
              <span>English</span>
              <svg className="lp-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>
            <button className="lp-cta-btn" type="button" onClick={handleGetStarted}>
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <main className="lp-hero" id="home">
        {/* Decorative background wave */}
        <div className="lp-wave-bg" aria-hidden="true">
          <svg className="lp-wave-svg" fill="none" preserveAspectRatio="none" viewBox="0 0 1440 800">
            <path d="M-100 550 C 300 450, 600 700, 1000 350 C 1250 150, 1400 280, 1600 200 L 1600 900 L -100 900 Z" fill="url(#wave-gradient)" />
            <defs>
              <linearGradient gradientUnits="userSpaceOnUse" id="wave-gradient" x1="0" x2="1440" y1="300" y2="800">
                <stop stopColor="#f0fdf4" stopOpacity="0.8" />
                <stop offset="0.6" stopColor="#e2f7eb" stopOpacity="0.5" />
                <stop offset="1" stopColor="#d3f3e1" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="lp-hero-inner">

          {/* LEFT: Text content */}
          <div className="lp-hero-content">
            {/* Badge */}
            <div className="lp-badge">
              <svg className="lp-badge-icon" fill="currentColor" viewBox="0 0 20 20">
                <path clipRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" fillRule="evenodd" />
              </svg>
              <span>Digital Health for a Stronger India</span>
            </div>

            {/* Headline */}
            <h1 className="lp-headline">
              Healthcare<br />for Every Indian
            </h1>
            <h2 className="lp-subheadline">Smart. Simple. Inclusive.</h2>
            <p className="lp-desc">
              MediKiosk helps you share your health information in your own language,
              making your hospital visit faster, easier, and more personalised.
            </p>

            {/* CTAs */}
            <div className="lp-ctas">
              <button className="lp-primary-cta" type="button" onClick={handleGetStarted}>
                <span>Start Your Health Journey</span>
                <svg className="lp-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
                </svg>
              </button>
              <button className="lp-secondary-cta" type="button">
                <span className="lp-play-circle">
                  <svg className="lp-play-icon" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                <span>Watch How It Works</span>
              </button>
            </div>

            {/* Feature badges */}
            <div className="lp-features">
              {[
                {
                  label: 'Easy\nSelf Check-in',
                  icon: (
                    <svg className="lp-feat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  ),
                },
                {
                  label: 'Share Health\nInformation',
                  icon: (
                    <svg className="lp-feat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  ),
                },
                {
                  label: 'Faster\nConsultations',
                  icon: (
                    <svg className="lp-feat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  ),
                },
                {
                  label: 'Safe &\nSecure',
                  icon: (
                    <svg className="lp-feat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  ),
                },
              ].map((f) => (
                <div className="lp-feat-item" key={f.label}>
                  <div className="lp-feat-circle">{f.icon}</div>
                  <span className="lp-feat-label">
                    {f.label.split('\n').map((line, i) => (
                      <span key={i}>
                        {line}
                        {i === 0 && <br />}
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Hero kiosk illustration */}
          <div className="lp-hero-visual">
            <div className="lp-visual-card">
              <img
                src={kioskHero}
                alt="Woman using MediKiosk smart healthcare terminal in hospital OPD"
                className="lp-visual-img"
              />
            </div>
          </div>
        </div>
      </main>

      {/* ── FOOTER SKYLINE ── */}
      <footer className="lp-footer">
        <img
          src={skylineBanner}
          alt="Digital Health for a Stronger India — Indian monuments skyline with tricolor"
          className="lp-footer-img"
        />
      </footer>

    </div>
  );
}
