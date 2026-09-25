import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientSession, ActionTypes } from '../../context/PatientSessionContext.jsx';
import SummarySection from '../../components/SummarySection.jsx';
import DocumentCard from '../../components/DocumentCard.jsx';
import RedFlagBanner from '../../components/RedFlagBanner.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import TeleconsultModal from '../../components/TeleconsultModal.jsx';
import {
  User,
  Clock,
  CheckCircle,
  FileCheck,
  Stethoscope,
  RotateCcw,
  ArrowLeft,
  Video,
} from 'lucide-react';
import './Step5.css';

export default function PhysicianConsult() {
  const navigate = useNavigate();
  const { state, dispatch } = usePatientSession();

  // Find active patient from queue or fall back to current session
  const selectedPatient = (state.patientQueue || []).find(
    (p) => p.id === state.selectedDoctorPatientId
  );

  const activePatientName = selectedPatient?.name || state.patientName || 'Ramesh Kumar';
  const activePatientId = selectedPatient?.abhaNumber || state.patientId || '91-4521-8890-1234';
  const activeToken = selectedPatient?.token || `MK-${state.patientId ? state.patientId.slice(-4) : '1042'}`;
  const activeConsultationType = selectedPatient?.consultationType || state.consultationType || 'general';
  const activeRedFlag = selectedPatient?.redFlag || state.redFlag;
  const isTeleconsultReferred = selectedPatient?.source === 'ASHA Referral' || selectedPatient?.isTeleconsult;
  const referringWorker = selectedPatient?.referringWorker || 'Sunita Devi (CHO / ASHA — Sub-Centre Rampur)';

  const consultCompleted = selectedPatient
    ? selectedPatient.status === 'Completed'
    : (state.reviewedByDoctor || false);
  const [isTeleconsultOpen, setIsTeleconsultOpen] = useState(false);

  // Structured history from selected patient or active session with fallback defaults
  const history = selectedPatient?.structuredHistory || state.structuredHistory || {
    chiefComplaint: state.answers.find((a) => a.category === 'chiefComplaint')?.answer || 'Chest pain for 2 days',
    hpiNarrative: state.answers.filter((a) => a.category?.startsWith('hpi')).map((a) => `${a.questionText}: ${a.answer}`).join('. ') || 'Sharp, retrosternal pain radiating to left arm with accompanying shortness of breath on exertion.',
    pastMedical: ['Type 2 Diabetes Mellitus (diagnosed 2018)'],
    pastSurgical: [],
    drugHistory: ['Tab Metformin 500mg BD'],
    allergies: ['No known drug allergies (NKDA)'],
    familyHistory: ['Father had myocardial infarction at age 55'],
    personalHistory: { phx1: 'Non-smoker, non-drinker', phx2: 'Vegetarian diet, irregular sleep' },
    reviewOfSystems: { ros1: 'Fatigue, mild exertion dyspnea' },
    ayush: {},
  };

  const handleEditSection = (sectionKey, newContent) => {
    if (selectedPatient) {
      dispatch({
        type: ActionTypes.EDIT_PATIENT_HISTORY,
        payload: {
          patientId: selectedPatient.id,
          section: sectionKey,
          value: newContent,
        },
      });
    }
    dispatch({
      type: ActionTypes.EDIT_SECTION,
      payload: { section: sectionKey, value: newContent },
    });
  };

  const handleAcknowledgeRedFlag = () => {
    dispatch({ type: ActionTypes.ACKNOWLEDGE_RED_FLAG });
  };

  const handleConfirmReview = () => {
    dispatch({ type: ActionTypes.CONFIRM_REVIEW });
    setConsultCompleted(true);
  };

  const handleBackToQueue = () => {
    navigate('/doctor');
  };

  const handleStartNewSession = () => {
    dispatch({ type: ActionTypes.RESET });
    navigate('/identify');
  };

  // Sort documents chronologically by date
  const rawDocs = selectedPatient?.documents || state.documents || [];
  const sortedDocuments = [...rawDocs].sort(
    (a, b) => new Date(a.date || '2025-01-01') - new Date(b.date || '2025-01-01')
  );

  return (
    <div className="physician-screen" role="main">
      {/* Top Header / Context Bar */}
      <header className="physician-header">
        <div className="physician-header-left">
          <button
            type="button"
            className="back-to-queue-btn"
            onClick={handleBackToQueue}
            aria-label="Return to Doctor Patient Queue"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            <span>Patient Queue</span>
          </button>

          <span className="divider-slash" aria-hidden="true">/</span>

          <div className="doctor-badge">
            <Stethoscope size={20} aria-hidden="true" />
            <span className="doctor-name">Dr. Ananya Sharma, MD</span>
          </div>

          <span className="divider-slash" aria-hidden="true">/</span>
          <span className="opd-room-text">OPD Room #4 — Cardiology / Internal Medicine</span>
        </div>

        <div className="physician-header-right">
          {/* Initiate Teleconsultation Button for ASHA referrals */}
          {isTeleconsultReferred && (
            <button
              type="button"
              className="teleconsult-trigger-btn"
              onClick={() => setIsTeleconsultOpen(true)}
              aria-label="Initiate Teleconsultation with referring ASHA worker"
            >
              <Video size={16} aria-hidden="true" />
              <span>Initiate Teleconsultation</span>
            </button>
          )}

          <StatusBadge
            status={activeRedFlag?.triggered && !activeRedFlag?.acknowledgedByDoctor ? 'critical' : 'success'}
            label={activeRedFlag?.triggered && !activeRedFlag?.acknowledgedByDoctor ? 'RED-FLAG TRIAGE' : 'PATIENT QUEUE: ACTIVE'}
          />
        </div>
      </header>

      {/* Red-Flag Priority Banner (Persistent until acknowledged) */}
      {activeRedFlag?.triggered && !activeRedFlag?.acknowledgedByDoctor && (
        <RedFlagBanner
          message={activeRedFlag.message}
          isDoctorView
          onAcknowledge={handleAcknowledgeRedFlag}
        />
      )}

      {/* Main Desktop Layout Grid */}
      <div className="physician-grid">
        {/* Left Sidebar: Patient Demographics & Intake Meta */}
        <aside className="physician-sidebar">
          <div className="sidebar-card">
            <div className="patient-avatar-row">
              <div className="avatar-circle">
                <User size={28} aria-hidden="true" />
              </div>
              <div>
                <h2 className="patient-display-name">{activePatientName}</h2>
                <span className="patient-token-badge">
                  TOKEN: {activeToken}
                </span>
              </div>
            </div>

            <dl className="demographics-list">
              <div className="demo-item">
                <dt>ABHA Number</dt>
                <dd>{activePatientId}</dd>
              </div>
              <div className="demo-item">
                <dt>Consultation Stream</dt>
                <dd>{activeConsultationType === 'ayush' ? 'AYUSH & Ayurveda' : 'General Medicine'}</dd>
              </div>
              <div className="demo-item">
                <dt>Source</dt>
                <dd>{selectedPatient?.source || 'Self-Intake Kiosk'}</dd>
              </div>
              {selectedPatient?.referringWorker && (
                <div className="demo-item">
                  <dt>Referring ASHA</dt>
                  <dd>{selectedPatient.referringWorker}</dd>
                </div>
              )}
              <div className="demo-item">
                <dt>ABDM Consent</dt>
                <dd>{state.consents?.abdm ? 'Granted' : 'Local Hospital Only'}</dd>
              </div>
              <div className="demo-item">
                <dt>Intake Completed</dt>
                <dd>{selectedPatient?.intakeTime || 'Today at 10:42 AM'}</dd>
              </div>
            </dl>
          </div>

          <div className="sidebar-card">
            <h3 className="sidebar-heading">
              <Clock size={16} aria-hidden="true" />
              <span>Prior Hospital Visits</span>
            </h3>
            <ul className="visit-timeline">
              <li className="visit-item">
                <span className="visit-date">15 Aug 2025</span>
                <span className="visit-desc">OPD General — Blood Sugar check</span>
              </li>
              <li className="visit-item">
                <span className="visit-date">20 Jul 2025</span>
                <span className="visit-desc">Emergency — Acute gastritis</span>
              </li>
            </ul>
          </div>
        </aside>

        {/* Main Content: 8 Structured History Sections in Exact Order */}
        <div className="physician-main">
          {consultCompleted ? (
            <div className="consult-completed-card" role="status" aria-live="polite">
              <CheckCircle size={48} className="success-icon" aria-hidden="true" />
              <h2 className="completed-title">History Verified &amp; Signed into EHR</h2>
              <p className="completed-desc">
                The physician-reviewed clinical history and digitized records for {activePatientName} have been countersigned and saved to the hospital EHR and linked ABHA profile.
              </p>
              <div className="completed-actions-row">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleBackToQueue}
                >
                  <ArrowLeft size={18} aria-hidden="true" />
                  <span>Return to Patient Queue</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleStartNewSession}
                >
                  <RotateCcw size={18} aria-hidden="true" />
                  <span>Start New Patient Intake Demo</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="workspace-header-bar">
                <div>
                  <h1 className="workspace-title">Clinical Intake History &amp; Diagnostics</h1>
                  <span className="workspace-subtitle">
                    Exact 8-section clinical order with physician verification affordances
                  </span>
                </div>

                <button
                  type="button"
                  className="confirm-review-btn"
                  onClick={handleConfirmReview}
                >
                  <FileCheck size={18} aria-hidden="true" />
                  <span>Confirm Reviewed History</span>
                </button>
              </div>

              <div className="history-sections-stack">
                {/* 1. Chief Complaint */}
                <SummarySection
                  title="1. Chief Complaint"
                  content={history.chiefComplaint}
                  sectionKey="chiefComplaint"
                  onSave={handleEditSection}
                  isDoctorView
                />

                {/* 2. History of Present Illness (HPI) */}
                <SummarySection
                  title="2. History of Present Illness (HPI)"
                  content={history.hpiNarrative}
                  sectionKey="hpiNarrative"
                  onSave={handleEditSection}
                  isDoctorView
                />

                {/* AYUSH Dashavidha Pariksha if present */}
                {activeConsultationType === 'ayush' && (
                  <SummarySection
                    title="2a. Ayurvedic Dashavidha Pariksha &amp; Ahara/Vihara"
                    content={history.ayush}
                    sectionKey="ayush"
                    onSave={handleEditSection}
                    isDoctorView
                  />
                )}

                {/* 3. Past Medical/Surgical History */}
                <SummarySection
                  title="3. Past Medical &amp; Surgical History"
                  content={[
                    ...(history.pastMedical || []),
                    ...(history.pastSurgical ? history.pastSurgical.map((s) => `Surgical: ${s}`) : []),
                  ]}
                  sectionKey="pastMedical"
                  onSave={handleEditSection}
                  isDoctorView
                />

                {/* 4. Drug & Allergy History */}
                <SummarySection
                  title="4. Drug &amp; Allergy History"
                  content={[
                    ...(history.drugHistory ? history.drugHistory.map((d) => `Medication: ${d}`) : []),
                    ...(history.allergies ? history.allergies.map((a) => `Allergy: ${a}`) : []),
                  ]}
                  sectionKey="drugHistory"
                  onSave={handleEditSection}
                  isDoctorView
                />

                {/* 5. Family History */}
                <SummarySection
                  title="5. Family History"
                  content={history.familyHistory}
                  sectionKey="familyHistory"
                  onSave={handleEditSection}
                  isDoctorView
                />

                {/* 6. Personal History */}
                <SummarySection
                  title="6. Personal History"
                  content={history.personalHistory}
                  sectionKey="personalHistory"
                  onSave={handleEditSection}
                  isDoctorView
                />

                {/* 7. Review of Systems */}
                <SummarySection
                  title="7. Review of Systems"
                  content={history.reviewOfSystems}
                  sectionKey="reviewOfSystems"
                  onSave={handleEditSection}
                  isDoctorView
                />

                {/* 8. Prior Investigations Summary (Chronological + Lab Outliers Flagged) */}
                <section className="summary-section investigations-section" aria-labelledby="sec-investigations">
                  <div className="summary-section-header">
                    <h3 id="sec-investigations" className="summary-section-title">
                      8. Prior Investigations Summary ({sortedDocuments.length} Digitized Records)
                    </h3>
                  </div>

                  <div className="summary-section-body">
                    {sortedDocuments.length === 0 ? (
                      <p className="section-empty-text">
                        No previous prescriptions or lab investigations uploaded during this session.
                      </p>
                    ) : (
                      <div className="chronological-docs-list">
                        {sortedDocuments.map((doc) => (
                          <DocumentCard key={doc.id} doc={doc} isDoctorView />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="summary-section-footer">
                    <span className="ai-verification-badge">
                      AI-generated draft — physician verification required
                    </span>
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </div>

      {/* WebRTC Mock Teleconsultation Modal */}
      <TeleconsultModal
        isOpen={isTeleconsultOpen}
        onClose={() => setIsTeleconsultOpen(false)}
        currentRole="doctor"
        patientName={activePatientName}
        partnerName={referringWorker}
      />
    </div>
  );
}
