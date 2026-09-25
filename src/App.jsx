import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import AccessibilityControls from './components/AccessibilityControls.jsx';
import LandingPage from './pages/landing/LandingPage.jsx';
import RoleSelection from './pages/role-select/RoleSelection.jsx';
import LanguageSelect from './pages/step1-identify/LanguageSelect.jsx';
import IdentifyMethod from './pages/step1-identify/IdentifyMethod.jsx';
import IdEntryForm from './pages/step1-identify/IdEntryForm.jsx';
import Consent from './pages/step1-identify/Consent.jsx';
import ConsultationType from './pages/step2-converse/ConsultationType.jsx';
import Interview from './pages/step2-converse/Interview.jsx';
import DocumentScan from './pages/step3-scan/DocumentScan.jsx';
import SummaryReview from './pages/step4-summary/SummaryReview.jsx';
import PhysicianConsult from './pages/step5-consult/PhysicianConsult.jsx';
import DoctorQueue from './pages/doctor/DoctorQueue.jsx';
import AshaHome from './pages/asha/AshaHome.jsx';
import AshaAssistedIntake from './pages/asha/AshaAssistedIntake.jsx';
import AshaReferralBooking from './pages/asha/AshaReferralBooking.jsx';
import AshaStockLookup from './pages/asha/AshaStockLookup.jsx';
import AshaTeleconsult from './pages/asha/AshaTeleconsult.jsx';
import DistrictDashboard from './pages/district/DistrictDashboard.jsx';
import NarrationBanner from './components/NarrationBanner.jsx';
import { usePatientSession } from './context/PatientSessionContext.jsx';
import { Stethoscope, Activity, Users, Building2, User } from 'lucide-react';
import './App.css';

export default function App() {
  const location = useLocation();
  const { state } = usePatientSession();

  const isDoctorView = location.pathname.startsWith('/doctor') || location.pathname.startsWith('/consult');
  const isAshaView = location.pathname.startsWith('/asha');
  const isDistrictView = location.pathname.startsWith('/district');

  // Hide global header on landing page, role selection, and language select
  const isLanding = location.pathname === '/';
  const isRoleSelect =
    location.pathname === '/role-select' ||
    location.pathname === '/roles';
  const isLanguageSelect = location.pathname === '/identify';
  const hideGlobalHeader = isLanding || isRoleSelect || isLanguageSelect || isAshaView;

  return (
    <div className="app-shell">
      {/* Top Header / Demo Ribbon: Only shown on non-kiosk screens */}
      {!hideGlobalHeader && (
        <>
          <header className="global-header">
            <div className="header-inner">
              <Link to="/role-select" className="brand-logo" aria-label="Niramay Home Role Selection">
                <div className="brand-icon">
                  <Activity size={24} aria-hidden="true" />
                </div>
                <div className="brand-text-block">
                  <span className="brand-name">Niramay</span>
                  <span className="brand-tagline">AI Clinical Intake &amp; OPD Digitization</span>
                </div>
              </Link>

              <nav className="header-nav" aria-label="Main multi-role navigation">
                <span className="prototype-demo-badge">Smart India Hackathon Prototype</span>

                <div className="role-nav-group" role="group" aria-label="Role quick switcher">
                  <Link
                    to="/identify"
                    className="role-switch-link"
                    title="Patient Intake Kiosk"
                  >
                    <User size={16} aria-hidden="true" />
                    <span>Patient</span>
                  </Link>

                  <Link
                    to="/doctor"
                    className={`doctor-switch-link ${isDoctorView ? 'active' : ''}`}
                    title="Doctor Outpatient Workspace"
                  >
                    <Stethoscope size={16} aria-hidden="true" />
                    <span>Doctor</span>
                  </Link>

                  <Link
                    to="/asha"
                    className={`role-switch-link ${isAshaView ? 'active' : ''}`}
                    title="ASHA / Frontline Worker Dashboard"
                  >
                    <Users size={16} aria-hidden="true" />
                    <span>ASHA</span>
                  </Link>

                  <Link
                    to="/district"
                    className={`role-switch-link ${isDistrictView ? 'active' : ''}`}
                    title="District Health Command Portal"
                  >
                    <Building2 size={16} aria-hidden="true" />
                    <span>District</span>
                  </Link>

                  <Link
                    to="/role-select"
                    className="role-switch-link"
                    title="Switch Operational Role"
                  >
                    <span>Switch Role</span>
                  </Link>
                </div>
              </nav>
            </div>
          </header>

          {/* Screen Entry Auto-Narration Bar with Waveform & Controls */}
          <NarrationBanner />
        </>
      )}

      {/* Main Flow Content */}
      <main className="main-content">
        <Routes>
          {/* Screen 1: Welcome (Untouched) */}
          <Route path="/" element={<LandingPage />} />

          {/* Screen 2: Role Selection */}
          <Route path="/role-select" element={<RoleSelection />} />
          <Route path="/roles" element={<RoleSelection />} />

          {/* Step 1: Identify / Language Select */}
          <Route path="/identify" element={<LanguageSelect />} />
          <Route path="/identify/method" element={<IdentifyMethod />} />
          <Route path="/identify/form" element={<IdEntryForm />} />
          <Route path="/identify/consent" element={<Consent />} />

          {/* Step 2: Converse */}
          <Route path="/converse/type" element={<ConsultationType />} />
          <Route path="/converse/interview" element={<Interview />} />

          {/* Step 3: Scan */}
          <Route path="/scan" element={<DocumentScan />} />

          {/* Step 4: Summarize & Route */}
          <Route path="/summary" element={<SummaryReview />} />

          {/* Step 5: Consult (Physician Workspace) */}
          <Route path="/consult" element={<PhysicianConsult />} />

          {/* Doctor Role Screens */}
          <Route path="/doctor" element={<DoctorQueue />} />
          <Route path="/doctor/queue" element={<DoctorQueue />} />
          <Route path="/doctor/consult/:id" element={<PhysicianConsult />} />

          {/* ASHA / Frontline Worker Role Screens */}
          <Route path="/asha" element={<AshaHome />} />
          <Route path="/asha/intake" element={<AshaAssistedIntake />} />
          <Route path="/asha/referral" element={<AshaReferralBooking />} />
          <Route path="/asha/stock" element={<AshaStockLookup />} />
          <Route path="/asha/teleconsult" element={<AshaTeleconsult />} />

          {/* District Portal Role Screen */}
          <Route path="/district" element={<DistrictDashboard />} />
          <Route path="/district/dashboard" element={<DistrictDashboard />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Persistent Accessibility Suite */}
      <AccessibilityControls />
    </div>
  );
}
