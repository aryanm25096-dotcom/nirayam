import { useNavigate } from 'react-router-dom';
import { usePatientSession, ActionTypes } from '../../context/PatientSessionContext.jsx';
import imgHero    from '../../assets/role_hero_scene.jpg';
import imgPatient from '../../assets/role_patient.jpg';
import imgAsha    from '../../assets/role_asha.jpg';
import imgDoctor  from '../../assets/role_doctor.jpg';
import imgDistrict from '../../assets/role_district.jpg';
import './RoleSelection.css';

const ROLES = [
  {
    key: 'patient',
    label: 'Patient',
    desc: 'Check symptoms, find nearby services, book appointments and view your health records.',
    route: '/identify/method',
    img: imgPatient,
    imgAlt: 'Elderly female patient in orange saree',
    thumbBg: '#FCE5D2',
    arrowBg: '#FCE6D7',
    arrowHover: '#F9D6BF',
    labelHover: '#E85B24',
  },
  {
    key: 'asha',
    label: 'ASHA Worker',
    desc: 'Register patients, track follow-ups, conduct screenings and manage village health data.',
    route: '/asha',
    img: imgAsha,
    imgAlt: 'ASHA worker in green saree carrying a tablet',
    thumbBg: '#CEEEDB',
    arrowBg: '#D6F0E0',
    arrowHover: '#C2E8D0',
    labelHover: '#0C6D47',
  },
  {
    key: 'doctor',
    label: 'Doctor',
    desc: 'View patient history, conduct consultations, manage treatments and follow-ups.',
    route: '/doctor',
    img: imgDoctor,
    imgAlt: 'Doctor in white coat with stethoscope',
    thumbBg: '#D3E8FB',
    arrowBg: '#DFEEFC',
    arrowHover: '#CDE3F9',
    labelHover: '#0e5c43',
  },
  {
    key: 'district',
    label: 'District Incharge',
    desc: 'Monitor village health data, track services, view reports and manage operations.',
    route: '/district',
    img: imgDistrict,
    imgAlt: 'District health official with glasses and tablet',
    thumbBg: '#E2DEF8',
    arrowBg: '#E8E4FB',
    arrowHover: '#DDD6F8',
    labelHover: '#5340A8',
  },
];

export default function RoleSelection() {
  const navigate   = useNavigate();
  const { dispatch } = usePatientSession();

  const handleSelectRole = (roleKey, route) => {
    dispatch({ type: ActionTypes.SET_ROLE, payload: roleKey });
    navigate(route);
  };

  const handleKeyDown = (e, roleKey, route) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelectRole(roleKey, route);
    }
  };

  return (
    <div className="rs-screen" role="main">
      {/* Atmospheric corner glows */}
      <div className="rs-glow rs-glow--tr" aria-hidden="true" />
      <div className="rs-glow rs-glow--br" aria-hidden="true" />

      <main className="rs-container">
        <div className="rs-grid">

          {/* ── LEFT: Hero ── */}
          <section className="rs-hero" aria-label="Niramay role selection introduction">
            <div className="rs-hero-text">
              <button
                type="button"
                className="rs-back-btn"
                onClick={() => navigate('/identify')}
                aria-label="Back to language selection"
              >
                <svg fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" width="18" height="18">
                  <path d="M19 12H5m7 7l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Change Language</span>
              </button>

              <h1 className="rs-headline">
                Select your{' '}
                <span className="rs-accent">
                  role
                  <svg aria-hidden="true" className="rs-spark" fill="none" viewBox="0 0 36 36">
                    <path d="M7 23L1 28"  stroke="currentColor" strokeLinecap="round" strokeWidth="3.5" />
                    <path d="M16 11L13 2" stroke="currentColor" strokeLinecap="round" strokeWidth="3.5" />
                    <path d="M26 21L33 16" stroke="currentColor" strokeLinecap="round" strokeWidth="3.5" />
                  </svg>
                </span>{' '}
                to continue
              </h1>
              <p className="rs-subtext">
                Choose how you are using{' '}
                <span className="rs-devanagari">निरामय</span>{' '}
                to get a personalised experience.
              </p>
            </div>

            <div className="rs-hero-img-wrap">
              <img
                src={imgHero}
                alt="Healthcare professionals, community workers, and patients at a rural clinic"
                className="rs-hero-img"
                loading="eager"
              />
            </div>
          </section>

          {/* ── RIGHT: Role cards ── */}
          <section className="rs-cards" aria-label="Select your operational role">
            {ROLES.map(({ key, label, desc, route, img, imgAlt, thumbBg, arrowBg, arrowHover, labelHover }) => (
              <button
                key={key}
                type="button"
                className="rs-card"
                onClick={() => handleSelectRole(key, route)}
                onKeyDown={(e) => handleKeyDown(e, key, route)}
                aria-label={`Continue as ${label}`}
                style={{
                  '--thumb-bg':    thumbBg,
                  '--arrow-bg':    arrowBg,
                  '--arrow-hover': arrowHover,
                  '--label-hover': labelHover,
                }}
              >
                {/* Thumbnail */}
                <div className="rs-thumb">
                  <img src={img} alt={imgAlt} className="rs-thumb-img" loading="lazy" />
                </div>

                {/* Text */}
                <div className="rs-card-body">
                  <span className="rs-card-label">{label}</span>
                  <span className="rs-card-desc">{desc}</span>
                </div>

                {/* Arrow */}
                <div className="rs-arrow" aria-hidden="true">
                  <svg fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" width="20" height="20">
                    <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>
            ))}
          </section>

        </div>
      </main>
    </div>
  );
}
