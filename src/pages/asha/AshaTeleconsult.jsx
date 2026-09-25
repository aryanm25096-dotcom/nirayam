import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TeleconsultModal from '../../components/TeleconsultModal.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import {
  Video,
  ArrowLeft,
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import './Asha.css';

export default function AshaTeleconsult() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState('Sunita Sharma (High-Risk Pregnancy, Gestational HTN)');

  return (
    <div className="asha-teleconsult-page" role="main">
      <header className="asha-header">
        <div className="asha-header-inner">
          <div className="asha-profile-block">
            <button
              type="button"
              className="back-icon-btn"
              onClick={() => navigate('/asha')}
              aria-label="Back to ASHA Dashboard"
            >
              <ArrowLeft size={20} aria-hidden="true" />
            </button>
            <div>
              <h1 className="asha-title">Initiate Teleconsultation</h1>
              <p className="asha-subtitle">
                Direct audio/video consultation with District Hospital Outpatient Physician
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="asha-container">
        <div className="teleconsult-prep-card">
          <div className="prep-header">
            <div className="doctor-status-badge">
              <Stethoscope size={24} aria-hidden="true" />
              <div>
                <h2 className="doctor-status-name">Dr. Ananya Sharma, MD</h2>
                <span className="doctor-status-sub">
                  OPD Room #4 • Cardiology / Internal Medicine (Duty Consultant)
                </span>
              </div>
            </div>
            <StatusBadge status="success" label="Doctor Available Online" icon={CheckCircle2} />
          </div>

          <div className="teleconsult-instructions">
            <h3 className="instructions-title">Teleconsultation Protocol Instructions:</h3>
            <ul className="instructions-list">
              <li>Keep patient vitals record (BP, Pulse, Spot Glucose) ready.</li>
              <li>Ensure patient is seated beside you for camera examination if required.</li>
              <li>WebRTC connection is encrypted point-to-point and logged in ABDM register.</li>
            </ul>
          </div>

          <div className="case-selection-box">
            <label htmlFor="case-select" className="case-select-label">
              Select Patient Case for this Teleconsultation:
            </label>
            <select
              id="case-select"
              className="form-input"
              value={selectedCase}
              onChange={(e) => setSelectedCase(e.target.value)}
            >
              <option value="Sunita Sharma (High-Risk Pregnancy, Gestational HTN)">
                Sunita Sharma (42F) — High-Risk Pregnancy: Gestational HTN (BP 168/104)
              </option>
              <option value="Anita Devi (Acute Fever with Chills)">
                Anita Devi (28F) — Acute febrile illness with chills for 4 days
              </option>
              <option value="Kavita Patel (Post-Referral Hypertension)">
                Kavita Patel (38F) — Severe hypertension domiciliary follow-up
              </option>
            </select>
          </div>

          <div className="call-action-box">
            <button
              type="button"
              className="start-call-btn"
              onClick={() => setIsModalOpen(true)}
            >
              <Video size={22} aria-hidden="true" />
              <span>Start Encrypted Teleconsultation Call</span>
            </button>
            <span className="call-action-note">
              <ShieldCheck size={14} aria-hidden="true" />
              Simulated WebRTC peer-to-peer session with OPD physician
            </span>
          </div>
        </div>
      </div>

      <TeleconsultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentRole="asha"
        patientName={selectedCase.split('(')[0].trim()}
        partnerName="Dr. Ananya Sharma, MD (OPD Room #4)"
      />
    </div>
  );
}
