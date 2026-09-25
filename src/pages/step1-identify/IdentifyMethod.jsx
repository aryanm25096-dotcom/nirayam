import { useNavigate } from 'react-router-dom';
import { usePatientSession, ActionTypes } from '../../context/PatientSessionContext.jsx';
import { useAutoNarration } from '../../hooks/useAutoNarration.js';
import { getLocalizedPrompt } from '../../utils/narrationPrompts.js';
import { useTranslation } from '../../hooks/useTranslation.js';
import heroPoster from '../../assets/abha_hero_poster.png';
import './IdentifyMethod.css';

const ArrowRight = () => (
  <svg className="im-arrow-svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
    <line x1="5" x2="19" y1="12" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export default function IdentifyMethod() {
  const navigate = useNavigate();
  const { state, dispatch } = usePatientSession();
  const { t } = useTranslation();

  const narrationText = getLocalizedPrompt('identifyMethod', state.language);
  useAutoNarration(narrationText);

  // Build methods array using translated strings (reactive to language change)
  const IDENTIFY_METHODS = [
    {
      id: 'scan_abha',
      title: t('scanAbhaTitle'),
      desc: t('scanAbhaDesc'),
      primary: true,
      icon: (
        <svg className="im-icon-svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
          <rect height="7" width="7" x="3" y="3" />
          <rect height="7" width="7" x="14" y="3" />
          <rect height="7" width="7" x="14" y="14" />
          <rect height="7" width="7" x="3" y="14" />
          <line strokeWidth="3" x1="7" x2="7.01" y1="7" y2="7" />
          <line strokeWidth="3" x1="17" x2="17.01" y1="7" y2="7" />
          <line strokeWidth="3" x1="17" x2="17.01" y1="17" y2="17" />
          <line strokeWidth="3" x1="7" x2="7.01" y1="17" y2="17" />
        </svg>
      ),
    },
    {
      id: 'enter_abha',
      title: t('enterAbhaTitle'),
      desc: t('enterAbhaDesc'),
      primary: false,
      icon: (
        <svg className="im-icon-svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
          <rect height="14" rx="2" width="20" x="2" y="5" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      ),
    },
    {
      id: 'aadhaar_hospital',
      title: t('aadhaarTitle'),
      desc: t('aadhaarDesc'),
      primary: false,
      icon: (
        <svg className="im-icon-svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M3 21h18" />
          <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
          <path d="M9 10h6" />
          <path d="M12 7v6" />
        </svg>
      ),
    },
    {
      id: 'new_patient',
      title: t('newPatientTitle'),
      desc: t('newPatientDesc'),
      primary: false,
      icon: (
        <svg className="im-icon-svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" x2="20" y1="8" y2="14" />
          <line x1="23" x2="17" y1="11" y2="11" />
        </svg>
      ),
    },
  ];

  const handleSelectMethod = (methodId) => {
    dispatch({ type: ActionTypes.SET_ID_METHOD, payload: methodId });
    navigate('/identify/form');
  };

  return (
    <div className="im-page" role="main">
      <div className="im-grid">

        {/* ── Left: Portrait Hero Poster ── */}
        <section className="im-poster-col" aria-hidden="true">
          <div className="im-poster-card">
            <img
              src={heroPoster}
              alt="Healthcare for Every Indian — ABHA patient card illustration"
              className="im-poster-img"
            />
          </div>
        </section>

        {/* ── Right: Options ── */}
        <section className="im-options-col" aria-labelledby="im-heading">

          {/* Back / Step label */}
          <button
            type="button"
            className="im-back-btn"
            onClick={() => navigate('/role-select')}
          >
            <svg className="im-back-arrow" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="19" x2="5" y1="12" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Change Role
          </button>

          <p className="im-step-label">{t('step1of5')}</p>
          <h1 id="im-heading" className="im-heading">
            {t('identifyHeading')}
          </h1>
          <p className="im-subheading">
            {t('identifySubheading')}
          </p>

          {/* Option cards */}
          <div className="im-methods" role="group" aria-label={t('identifyHeading')}>
            {IDENTIFY_METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`im-method-card ${m.primary ? 'im-method-card--primary' : ''}`}
                onClick={() => handleSelectMethod(m.id)}
              >
                <div className="im-method-left">
                  <div className={`im-icon-box ${m.primary ? 'im-icon-box--primary' : ''}`}>
                    {m.icon}
                  </div>
                  <div className="im-method-text">
                    <h2 className="im-method-title">{m.title}</h2>
                    <p className="im-method-desc">{m.desc}</p>
                  </div>
                </div>
                <div className={`im-arrow-circle ${m.primary ? 'im-arrow-circle--primary' : ''}`}>
                  <ArrowRight />
                </div>
              </button>
            ))}
          </div>

          {/* Security footer */}
          <footer className="im-security-footer">
            <div className="im-security-inner">
              <div className="im-security-left">
                <svg className="im-security-icon" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="16" y2="12" />
                  <line x1="12" x2="12.01" y1="8" y2="8" />
                </svg>
                <span>{t('safeSecure')}</span>
                <svg className="im-lock-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1.5a4.5 4.5 0 0 0-4.5 4.5v3H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V11a2 2 0 0 0-2-2h-1.5V6A4.5 4.5 0 0 0 12 1.5zm-3 4.5a3 3 0 0 1 6 0v3H9V6z" />
                </svg>
              </div>
              <div className="im-security-right">
                <svg className="im-abdm-icon" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                  <rect height="16" rx="2" width="18" x="3" y="4" />
                  <path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01" />
                </svg>
                <span>{t('poweredByAbdm')}</span>
              </div>
            </div>
          </footer>
        </section>

      </div>
    </div>
  );
}
