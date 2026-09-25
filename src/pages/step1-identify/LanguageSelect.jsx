import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientSession, ActionTypes } from '../../context/PatientSessionContext.jsx';
import { useNarration } from '../../context/NarrationContext.jsx';
import { useAutoNarration } from '../../hooks/useAutoNarration.js';
import { 
  Activity, 
  Languages, 
  ChevronDown, 
  Sun, 
  Moon, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import './Step1.css';

const ALL_LANGUAGES = [
  // Page 1 (Primary 6 languages)
  { 
    code: 'en', 
    label: 'English', 
    native: 'English', 
    greeting: 'Welcome to Niramay. Please click continue to proceed.' 
  },
  { 
    code: 'hi', 
    label: 'Hindi', 
    native: 'हिन्दी', 
    greeting: 'नमस्ते! Niramay में आपका स्वागत है। जारी रखने के लिए आगे बढ़ें।' 
  },
  { 
    code: 'mr', 
    label: 'Marathi', 
    native: 'मराठी', 
    greeting: 'नमस्कार! Niramay मध्ये आपले स्वागत आहे. पुढे जाण्यासाठी पुढे जा दाबा.' 
  },
  { 
    code: 'bn', 
    label: 'Bengali', 
    native: 'বাংলা', 
    greeting: 'নমস্কার! Niramay-এ স্বাগতম। চালিয়ে যেতে এগিয়ে যান চাপুন।' 
  },
  { 
    code: 'ta', 
    label: 'Tamil', 
    native: 'தமிழ்', 
    greeting: 'வணக்கம்! Niramay-க்கு வரவேற்கிறோம். தொடர தொடரவும் அழுத்தவும்.' 
  },
  { 
    code: 'te', 
    label: 'Telugu', 
    native: 'తెలుగు', 
    greeting: 'నమస్కారం! Niramay కి స్వాగతం. కొనసాగడానికి ముందుకు సాగండి నొక్కండి.' 
  },
  // Page 2 (Remaining 6 Indian languages)
  { 
    code: 'gu', 
    label: 'Gujarati', 
    native: 'ગુજરાતી', 
    greeting: 'નમસ્તે! Niramay માં આપનું સ્વાગત છે. આગળ વધવા માટે આગળ વધો દબાવો.' 
  },
  { 
    code: 'kn', 
    label: 'Kannada', 
    native: 'ಕನ್ನಡ', 
    greeting: 'ನಮಸ್ಕಾರ! Niramay ಗೆ ಸುಸ್ವಾಗತ. ಮುಂದುವರಿಯಲು ಮುಂದುವರಿಯಿರಿ ಒತ್ತಿ.' 
  },
  { 
    code: 'ml', 
    label: 'Malayalam', 
    native: 'മലയാളം', 
    greeting: 'നമസ്കാരം! Niramay ലേക്ക് സ്വാഗതം. തുടരുന്നതിന് മുന്നോട്ട് പോകുക.' 
  },
  { 
    code: 'pa', 
    label: 'Punjabi', 
    native: 'ਪੰਜਾਬੀ', 
    greeting: 'ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ! Niramay ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ।' 
  },
  { 
    code: 'or', 
    label: 'Odia', 
    native: 'ଓଡ଼ିଆ', 
    greeting: 'ନମସ୍କାର! Niramay କୁ ସ୍ୱାଗତ।' 
  },
  { 
    code: 'as', 
    label: 'Assamese', 
    native: 'অসমীয়া', 
    greeting: 'নমস্কাৰ! Niramay লৈ স্বাগতম।' 
  }
];

export default function LanguageSelect() {
  const navigate = useNavigate();
  const { state, dispatch } = usePatientSession();
  const { narrate, stop } = useNarration();

  // Active selected language (respects existing session language or defaults to English)
  const [selectedLang, setSelectedLang] = useState(() => {
    return state.language || 'en';
  });
  const [currentPage, setCurrentPage] = useState(() => {
    const idx = ALL_LANGUAGES.findIndex((l) => l.code === (state.language || 'en'));
    return idx >= 6 ? 1 : 0;
  });
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(() => {
    return document.documentElement.getAttribute('data-theme') === 'high-contrast';
  });

  // Welcome prompt narration on initial load
  useAutoNarration('Welcome to Niramay. Please choose your language to begin clinical intake.', 400);

  // Sync session state when selected
  useEffect(() => {
    if (selectedLang) {
      dispatch({ type: ActionTypes.SET_LANGUAGE, payload: selectedLang });
    }
  }, [selectedLang, dispatch]);

  // Handle clicking a language card
  const handleSelectLang = (code) => {
    setSelectedLang(code);
    dispatch({ type: ActionTypes.SET_LANGUAGE, payload: code });

    // Audio context gesture unlock
    try {
      const unlockAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
      unlockAudio.play().catch(() => {});
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.resume();
      }
    } catch {
      // Ignore
    }

    // Speak welcome greeting in that language
    const langObj = ALL_LANGUAGES.find((l) => l.code === code);
    if (langObj) {
      stop();
      narrate(langObj.greeting, code);
    }
  };

  // Handle Continue button: Navigates to Screen 2 (Role Selection)
  const handleContinue = () => {
    navigate('/role-select');
  };

  // Toggle Theme between Default and High-Contrast
  const toggleTheme = () => {
    const nextTheme = !isHighContrast;
    setIsHighContrast(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme ? 'high-contrast' : 'default');
  };

  // Languages for current page (6 cards per page)
  const visibleLanguages = ALL_LANGUAGES.slice(currentPage * 6, (currentPage + 1) * 6);
  const currentLangObj = ALL_LANGUAGES.find((l) => l.code === selectedLang) || ALL_LANGUAGES[0];

  return (
    <div className="kiosk-screen-wrapper">
      <div className="kiosk-card-frame" role="main" aria-label="Step 1: Choose Your Language">
        
        {/* Top Header Bar */}
        <header className="kiosk-top-bar">
          <div className="kiosk-brand">
            <div className="kiosk-brand-icon" aria-hidden="true">
              <Activity size={24} />
            </div>
            <div className="kiosk-brand-info">
              <div className="kiosk-brand-title">Niramay</div>
              <div className="kiosk-brand-subtitle">AI Clinical Intake &amp; OPD Digitization</div>
            </div>
          </div>

          <div className="kiosk-top-actions">
            {/* Language Quick Dropdown */}
            <div className="kiosk-lang-dropdown-wrapper">
              <button
                type="button"
                className="kiosk-lang-dropdown-btn"
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                aria-expanded={showLangDropdown}
                aria-label="Quick language switch"
              >
                <span>{currentLangObj.label}</span>
                <ChevronDown size={15} aria-hidden="true" />
              </button>

              {showLangDropdown && (
                <div className="kiosk-lang-dropdown-menu" role="menu">
                  {ALL_LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      className={`kiosk-lang-dropdown-item ${selectedLang === l.code ? 'active' : ''}`}
                      onClick={() => {
                        handleSelectLang(l.code);
                        setShowLangDropdown(false);
                      }}
                      role="menuitem"
                    >
                      <span className="dropdown-native">{l.native}</span>
                      <span className="dropdown-label">{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              type="button"
              className="kiosk-theme-btn"
              onClick={toggleTheme}
              aria-label={isHighContrast ? 'Switch to light mode' : 'Switch to high-contrast theme'}
              title="Toggle High Contrast / Theme"
            >
              {isHighContrast ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </header>

        <div className="kiosk-divider" />

        {/* Main 2-Column Content Body */}
        <div className="kiosk-body-layout">
          
          {/* Left Column: Language Selection */}
          <div className="kiosk-left-column">
            
            {/* Step Counter & 5-Segment Progress Bar */}
            <div className="kiosk-step-indicator-row">
              <span className="kiosk-step-text">Step 1 of 5</span>
              <div className="kiosk-segmented-progress" role="progressbar" aria-valuenow="1" aria-valuemin="1" aria-valuemax="5">
                <div className="progress-segment active" />
                <div className="progress-segment" />
                <div className="progress-segment" />
                <div className="progress-segment" />
                <div className="progress-segment" />
              </div>
            </div>

            {/* Title & Subtitle */}
            <h1 className="kiosk-main-heading">Choose Your Language</h1>
            <p className="kiosk-main-subheading">
              Select your preferred language for voice and touch clinical intake.
            </p>

            {/* 2 Rows x 3 Columns Language Cards Grid */}
            <div className="kiosk-lang-grid" role="group" aria-label="Available languages">
              {visibleLanguages.map((lang) => {
                const isSelected = selectedLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    className={`kiosk-lang-card ${isSelected ? 'kiosk-lang-card--selected' : ''}`}
                    onClick={() => handleSelectLang(lang.code)}
                    onDoubleClick={handleContinue}
                    aria-pressed={isSelected}
                  >
                    <div className="card-top-row">
                      <div className="lang-icon-badge" aria-hidden="true">
                        <Languages size={18} />
                      </div>
                    </div>

                    <div className="card-native-text">{lang.native}</div>
                    <div className="card-english-text">{lang.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Hero Artwork Card */}
          <div className="kiosk-right-column">
            <div className="kiosk-hero-card">
              <div className="hero-text-block">
                <h2 className="hero-title">Healthcare<br />for Every Voice</h2>
                <p className="hero-tagline">Same care. In your language.</p>
              </div>

              <div className="hero-illustration-container">
                <img
                  src="/assets/healthcare_people.png"
                  alt="Healthcare for Every Voice - Diverse Indian patients"
                  className="hero-illustration-img"
                  loading="eager"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Footer Bar */}
        <footer className="kiosk-footer-bar">
          
          {/* Left: Smart India Emblem */}
          <div className="kiosk-footer-left">
            <div className="smart-india-badge">
              <span className="smart-india-icon-wrap" aria-hidden="true">
                <ShieldCheck size={18} />
              </span>
              <span className="smart-india-text">Smart India. Healthier India.</span>
            </div>
          </div>

          {/* Center: Pagination Dots */}
          <div className="kiosk-footer-center" aria-label="Language pages pagination">
            <button
              type="button"
              className={`pagination-dot ${currentPage === 0 ? 'pagination-dot--active' : ''}`}
              onClick={() => setCurrentPage(0)}
              aria-label="View Languages Page 1"
            />
            <button
              type="button"
              className={`pagination-dot ${currentPage === 1 ? 'pagination-dot--active' : ''}`}
              onClick={() => setCurrentPage(1)}
              aria-label="View Languages Page 2"
            />
            <button
              type="button"
              className="pagination-dot"
              onClick={() => setCurrentPage(0)}
              aria-label="Languages set 1"
            />
            <button
              type="button"
              className="pagination-dot"
              onClick={() => setCurrentPage(1)}
              aria-label="Languages set 2"
            />
          </div>

          {/* Right: Continue Button */}
          <div className="kiosk-footer-right">
            <button
              type="button"
              className="kiosk-continue-btn"
              onClick={handleContinue}
              aria-label="Continue to patient identification"
            >
              <span>Continue</span>
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>

        </footer>

      </div>
    </div>
  );
}
