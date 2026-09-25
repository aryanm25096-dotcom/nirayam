import { useNavigate } from 'react-router-dom';
import { usePatientSession, ActionTypes } from '../../context/PatientSessionContext.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import {
  Stethoscope,
  Users,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Video,
  FileText,
} from 'lucide-react';
import './DoctorQueue.css';

export default function DoctorQueue() {
  const navigate = useNavigate();
  const { state, dispatch } = usePatientSession();

  const patientQueue = state.patientQueue || [];

  const handleOpenPatient = (patient) => {
    dispatch({
      type: ActionTypes.SET_SELECTED_DOCTOR_PATIENT,
      payload: patient.id,
    });
    navigate('/consult');
  };

  const criticalCount = patientQueue.filter(
    (p) => p.priority === 'critical' && p.status !== 'Completed'
  ).length;
  const awaitingCount = patientQueue.filter((p) => p.status !== 'Completed').length;
  const completedCount = patientQueue.filter((p) => p.status === 'Completed').length;

  return (
    <div className="doctor-queue-page" role="main">
      {/* Top Context Header */}
      <header className="doctor-queue-header">
        <div className="doctor-queue-header-inner">
          <div className="doctor-info-block">
            <div className="doctor-icon-avatar" aria-hidden="true">
              <Stethoscope size={24} />
            </div>
            <div>
              <h1 className="doctor-queue-title">Outpatient Clinical Queue</h1>
              <p className="doctor-queue-subtitle">
                Dr. Ananya Sharma, MD • OPD Room #4 (Cardiology / Internal Medicine)
              </p>
            </div>
          </div>

          <div className="queue-metric-chips" role="region" aria-label="Queue metrics summary">
            <div className="metric-chip">
              <Users size={16} aria-hidden="true" />
              <span>Awaiting: <strong>{awaitingCount}</strong></span>
            </div>
            {criticalCount > 0 && (
              <div className="metric-chip metric-chip--critical">
                <AlertTriangle size={16} aria-hidden="true" />
                <span>Red-Flag: <strong>{criticalCount}</strong></span>
              </div>
            )}
            <div className="metric-chip metric-chip--success">
              <UserCheck size={16} aria-hidden="true" />
              <span>Completed: <strong>{completedCount}</strong></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Queue Table */}
      <div className="queue-content-wrapper">
        <div className="queue-table-card">
          <div className="queue-table-header-row">
            <h2 className="queue-section-heading">Patients Awaiting Consultation</h2>
            <span className="queue-hint-text">
              Select a patient record to review AI-generated draft history and digitized documents.
            </span>
          </div>

          <div className="queue-table-container">
            <table className="queue-table">
              <thead>
                <tr>
                  <th scope="col">Token</th>
                  <th scope="col">Patient Name &amp; Age</th>
                  <th scope="col">Chief Complaint</th>
                  <th scope="col">Source / Facility</th>
                  <th scope="col">Priority Status</th>
                  <th scope="col">Consult Status</th>
                  <th scope="col" className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {patientQueue.map((patient) => {
                  const isCritical = patient.priority === 'critical';
                  const isWarning = patient.priority === 'warning';
                  const isCompleted = patient.status === 'Completed';

                  const priorityStatus = isCritical
                    ? 'critical'
                    : isWarning
                    ? 'warning'
                    : 'info';
                  const priorityLabel = isCritical
                    ? 'RED-FLAG TRIAGE'
                    : isWarning
                    ? 'URGENT'
                    : 'ROUTINE';

                  const consultStatus = isCompleted ? 'success' : 'warning';
                  const consultLabel = isCompleted ? 'Completed' : 'Awaiting Review';

                  return (
                    <tr
                      key={patient.id}
                      className={`queue-row ${isCritical && !isCompleted ? 'queue-row--critical' : ''}`}
                    >
                      <td className="token-cell">
                        <span className="token-tag">{patient.token}</span>
                      </td>

                      <td className="patient-cell">
                        <div className="patient-name-block">
                          <span className="patient-name-text">{patient.name}</span>
                          <span className="patient-meta-text">
                            {patient.age ? `${patient.age} yrs` : ''} • {patient.gender}
                          </span>
                        </div>
                      </td>

                      <td className="complaint-cell">
                        <span className="complaint-text">{patient.chiefComplaint}</span>
                      </td>

                      <td className="source-cell">
                        <div className="source-block">
                          <span className="source-title">{patient.source}</span>
                          {patient.referringWorker && (
                            <span className="source-subtitle">{patient.referringWorker}</span>
                          )}
                          {patient.isTeleconsult && (
                            <span className="teleconsult-tag">
                              <Video size={12} aria-hidden="true" />
                              <span>Teleconsult</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="priority-cell">
                        <StatusBadge
                          status={priorityStatus}
                          label={priorityLabel}
                        />
                      </td>

                      <td className="status-cell">
                        <StatusBadge
                          status={consultStatus}
                          label={consultLabel}
                        />
                      </td>

                      <td className="action-cell text-right">
                        <button
                          type="button"
                          className="open-record-btn"
                          onClick={() => handleOpenPatient(patient)}
                          aria-label={`Open record for patient ${patient.name}`}
                        >
                          <FileText size={16} aria-hidden="true" />
                          <span>Open Record</span>
                          <ArrowRight size={14} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
