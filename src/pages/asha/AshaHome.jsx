import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePatientSession, ActionTypes } from '../../context/PatientSessionContext.jsx';
import ashaBanner from '../../assets/asha_hero_banner.png';
import './Asha.css';

/* ── static task data ─────────────────────────────────── */
const TASKS = [
  {
    id: 1,
    name: 'Kavita Patel',
    schedule: 'Weekly BP check — Day 5 of 7',
    risk: 'high',
    condition: 'Post-Referral Severe Hypertension',
    action: 'Measure resting blood pressure with digital cuff and record in e-Kavach register.',
    protocol: 'NHM Protocol: Weekly domiciliary BP surveillance post-tertiary referral for pregnancy-induced HTN.',
    due: 'Due: Today',
    completed: false,
  },
  {
    id: 2,
    name: 'Pooja Verma',
    schedule: 'Scheduled 3rd Trimester ANC Visit — Day 3 of 5',
    risk: 'urgent',
    condition: 'Flagged High-Risk Pregnancy (Severe Anemia)',
    action: 'Verify compliance with iron syrup, check for pedal edema, escort to PHC if pallor worsens.',
    protocol: 'PMSMA Protocol: High-risk pregnant mother bi-weekly tracking and verification of parenteral iron sucrose therapy.',
    due: 'Due: Today',
    completed: false,
  },
  {
    id: 3,
    name: 'Harish Chandra',
    schedule: 'Fasting blood glucose log review — Day 7 of 14',
    risk: 'routine',
    condition: 'Post-Discharge Type 2 Diabetes',
    action: 'Review glucometer log, inspect interdigital spaces for cracks or fungal lesions.',
    protocol: 'NPCDCS Protocol: Fortnightly glycemic log verification and diabetic foot inspection.',
    due: 'Due: Tomorrow',
    completed: false,
  },
  {
    id: 4,
    name: 'Geeta Kumari (Child: Aarav)',
    schedule: 'MUAC tape measurement & therapeutic feed check — Day 10 of 14',
    risk: 'high',
    condition: 'Pediatric SAM (Severe Acute Malnutrition)',
    action: 'Record mid-upper arm circumference and assess feeding appetite test.',
    protocol: 'RBSK / Poshan Abhiyan: Bi-weekly growth assessment and ready-to-use therapeutic food (RUTF) monitoring.',
    due: 'Completed',
    completed: true,
  },
];

const QUICK_ACTIONS = [
  {
    label: 'Register New Patient',
    desc: 'Add patient details and start clinical intake.',
    color: 'green',
    route: '/asha/intake',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Book Referral',
    desc: 'Refer to PHC, CHC or District Hospital.',
    color: 'orange',
    route: '/asha/referral',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5M12 12.75v4.5m2.25-2.25h-4.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Check Medicine Stock',
    desc: 'View availability of essential medicines.',
    color: 'blue',
    route: '/asha/stock',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Start Teleconsultation',
    desc: 'Connect with OPD doctor for case review.',
    color: 'amber',
    route: '/asha/teleconsult',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const NAV_LINKS = [
  { label: 'Dashboard', route: '/asha', active: true, icon: <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  { label: 'Patients', route: '/asha/intake', icon: <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  { label: 'Follow-ups', route: '/asha', icon: <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  { label: 'Referrals', route: '/asha/referral', icon: <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  { label: 'Teleconsultation', route: '/asha/teleconsult', icon: <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  { label: 'Resources', route: '/asha', icon: <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  { label: 'Reports', route: '/asha', icon: <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" strokeLinecap="round" strokeLinejoin="round" /></svg> },
];

function RiskBadge({ risk }) {
  if (risk === 'high') return (
    <span className="asha-risk-badge asha-risk-badge--high">
      <svg fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" fillRule="evenodd" /></svg>
      High Risk
    </span>
  );
  if (risk === 'urgent') return (
    <span className="asha-risk-badge asha-risk-badge--urgent">
      <svg fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" fillRule="evenodd" /></svg>
      Urgent
    </span>
  );
  return (
    <span className="asha-risk-badge asha-risk-badge--routine">
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
      Routine
    </span>
  );
}

export default function AshaHome() {
  const navigate = useNavigate();
  const { dispatch } = usePatientSession();
  const [activeTab, setActiveTab] = useState('tasks');
  const [checked, setChecked] = useState({});

  const pendingCount = TASKS.filter(t => !t.completed).length;

  const handleLogout = () => {
    dispatch({ type: ActionTypes.SET_ROLE, payload: null });
    navigate('/role-select');
  };

  return (
    <div className="asha-shell">

      {/* ── TOP HEADER ── */}
      <header className="asha-topbar">
        <div className="asha-topbar-brand">
          <div className="asha-topbar-icon" aria-hidden="true">
            <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div>
            <div className="asha-topbar-name">Niramay</div>
            <div className="asha-topbar-tagline">AI Clinical Intake &amp; OPD Digitization</div>
          </div>
        </div>

        <div className="asha-topbar-actions">
          <button className="asha-lang-btn" type="button">
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="2" x2="22" y1="12" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
            <span>English</span>
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m19.5 8.25-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button className="asha-notif-btn" type="button" aria-label="Notifications">
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span className="asha-notif-dot" aria-hidden="true" />
          </button>
          <div className="asha-avatar" aria-label="Sunita Devi">SD</div>
        </div>
      </header>

      {/* ── APP BODY ── */}
      <div className="asha-body">

        {/* ── SIDEBAR ── */}
        <aside className="asha-sidebar">
          <div className="asha-sidebar-top">

            {/* Profile card */}
            <div className="asha-profile-card">
              <div className="asha-profile-avatar" aria-hidden="true">
                <svg fill="currentColor" viewBox="0 0 36 36">
                  <circle cx="18" cy="13" fill="#f6c89f" r="7" />
                  <path d="M12 9c0-4 12-4 12 0v4c0 3-4 6-6 6s-6-3-6-6V9z" fill="#2d3748" />
                  <path d="M6 34c0-6.6 5.4-12 12-12s12 5.4 12 12H6z" fill="#047857" />
                  <path d="M10 24c3 3 8 9 14 10H8c-1.3 0-2 .2-2-1v-2c0-3 2-6 4-7z" fill="#fef08a" />
                </svg>
              </div>
              <div className="asha-profile-info">
                <div className="asha-profile-name">Sunita Devi</div>
                <div className="asha-profile-role">ASHA Worker</div>
                <div className="asha-profile-loc">
                  <svg fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.588a13.06 13.06 0 002.273 1.765 11.758 11.758 0 001.038.573l.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" fillRule="evenodd" /></svg>
                  Rampur Sub-Centre
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="asha-nav" aria-label="ASHA Worker navigation">
              {NAV_LINKS.map(({ label, route, active, icon }) => (
                <Link
                  key={label}
                  to={route}
                  className={`asha-nav-link ${active ? 'asha-nav-link--active' : ''}`}
                >
                  <span className="asha-nav-icon" aria-hidden="true">{icon}</span>
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Sidebar bottom */}
          <div className="asha-sidebar-bottom">
            <div className="asha-help-card">
              <div className="asha-help-text">
                <div className="asha-help-title">Need Help?</div>
                <div className="asha-help-desc">Watch quick guides or contact support.</div>
                <a className="asha-help-link" href="#">View Help Center →</a>
              </div>
            </div>
            <button className="asha-logout-btn" type="button" onClick={handleLogout}>
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Log Out
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="asha-main">

          {/* Hero banner */}
          <section className="asha-hero-banner" aria-label="Welcome banner">
            <img src={ashaBanner} alt="ASHA worker walking towards rural Primary Health Centre" className="asha-hero-img" />
            <div className="asha-hero-overlay" aria-hidden="true" />
            <div className="asha-hero-content">
              <span className="asha-hero-greeting">Good morning,</span>
              <h2 className="asha-hero-name">Sunita Devi <span aria-label="Waving hand" role="img">👋</span></h2>
              <p className="asha-hero-subtitle">Here's your field dashboard. Keep communities healthier, one visit at a time.</p>
            </div>
            <div className="asha-hero-offline-badge">
              <div className="asha-offline-icon" aria-hidden="true">
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div>
                <div className="asha-offline-title">Offline-Ready</div>
                <div className="asha-offline-desc">Data will sync automatically when you're online.</div>
              </div>
            </div>
          </section>

          {/* Quick actions */}
          <section className="asha-quick-grid" aria-label="Quick actions">
            {QUICK_ACTIONS.map(({ label, desc, color, route, icon }) => (
              <button
                key={label}
                type="button"
                className={`asha-quick-card asha-quick-card--${color}`}
                onClick={() => navigate(route)}
              >
                <div className="asha-quick-left">
                  <div className={`asha-quick-icon asha-quick-icon--${color}`} aria-hidden="true">{icon}</div>
                  <div className="asha-quick-text">
                    <div className="asha-quick-label">{label}</div>
                    <div className="asha-quick-desc">{desc}</div>
                  </div>
                </div>
                <div className="asha-quick-arrow" aria-hidden="true">→</div>
              </button>
            ))}
          </section>

          {/* Tabs */}
          <section className="asha-tabs-bar" aria-label="Task tabs">
            <div className="asha-tabs">
              <button
                type="button"
                className={`asha-tab ${activeTab === 'tasks' ? 'asha-tab--active' : ''}`}
                onClick={() => setActiveTab('tasks')}
              >
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Today's Follow-up Tasks
                <span className="asha-tab-badge asha-tab-badge--green">{pendingCount} Pending</span>
              </button>
              <button
                type="button"
                className={`asha-tab ${activeTab === 'referrals' ? 'asha-tab--active' : ''}`}
                onClick={() => setActiveTab('referrals')}
              >
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Tracked Referrals
                <span className="asha-tab-badge asha-tab-badge--gray">2 Active</span>
              </button>
              <button
                type="button"
                className={`asha-tab ${activeTab === 'completed' ? 'asha-tab--active' : ''}`}
                onClick={() => setActiveTab('completed')}
              >
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m4.5 12.75 6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Completed Tasks
                <span className="asha-tab-badge asha-tab-badge--gray">12 This Week</span>
              </button>
            </div>
            <button className="asha-date-btn" type="button">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Tue, 16 Sep 2025
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m19.5 8.25-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </section>

          {/* Task list */}
          <section className="asha-task-section" aria-label="High-Risk Follow-Up List">
            <div className="asha-task-header">
              <h3 className="asha-task-title">High-Risk Follow-Up List</h3>
              <p className="asha-task-subtitle">Rule-based National Health Mission (NHM) schedule. Complete these tasks during your field visits.</p>
            </div>

            <div className="asha-task-list">
              {TASKS.map(task => (
                <div key={task.id} className={`asha-task-card ${task.completed ? 'asha-task-card--done' : ''}`}>
                  <div className="asha-task-inner">
                    <div className="asha-task-left">
                      {/* Checkbox / check */}
                      {task.completed ? (
                        <div className="asha-check-done" aria-label="Completed" role="img">
                          <svg fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                      ) : (
                        <input
                          type="checkbox"
                          className="asha-checkbox"
                          checked={!!checked[task.id]}
                          onChange={() => setChecked(prev => ({ ...prev, [task.id]: !prev[task.id] }))}
                          aria-label={`Mark ${task.name} as complete`}
                        />
                      )}

                      <div className="asha-task-details">
                        {/* Name + badges */}
                        <div className="asha-task-badges">
                          <span className="asha-task-name">{task.name}</span>
                          <span className="asha-schedule-badge">{task.schedule}</span>
                          <RiskBadge risk={task.risk} />
                        </div>

                        {/* Condition & Action */}
                        <div className="asha-task-meta">
                          <p>
                            <span className="asha-meta-label">
                              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
                              Condition:
                            </span>
                            {task.condition}
                          </p>
                          <p>
                            <span className="asha-meta-label">
                              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>
                              Action:
                            </span>
                            {task.action}
                          </p>
                        </div>

                        {/* Protocol */}
                        <div className="asha-protocol-tag">{task.protocol}</div>
                      </div>
                    </div>

                    {/* Right: due + view details */}
                    <div className="asha-task-right">
                      {task.completed ? (
                        <span className="asha-due-badge asha-due-badge--done">
                          <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                          Completed
                        </span>
                      ) : (
                        <span className={`asha-due-badge ${task.due.includes('Tomorrow') ? 'asha-due-badge--tomorrow' : 'asha-due-badge--today'}`}>
                          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          {task.due}
                        </span>
                      )}
                      <button className="asha-view-btn" type="button">View Details →</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
