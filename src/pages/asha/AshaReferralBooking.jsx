import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientSession, ActionTypes } from '../../context/PatientSessionContext.jsx';
import { nearbyFacilities } from '../../data/mockData.js';
import {
  Calendar,
  Building,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Stethoscope,
  AlertTriangle,
} from 'lucide-react';
import './Asha.css';

export default function AshaReferralBooking() {
  const navigate = useNavigate();
  const { state, dispatch } = usePatientSession();

  const [patientName, setPatientName] = useState(state.patientName || 'Kavita Patel');
  const [selectedFacilityId, setSelectedFacilityId] = useState(nearbyFacilities[0].id);
  const [selectedSpecialty, setSelectedSpecialty] = useState(nearbyFacilities[0].specialties[0]);
  const [selectedSlot, setSelectedSlot] = useState(nearbyFacilities[0].availableSlots[0]);
  const [reason, setReason] = useState('Severe hypertension follow-up & specialist review');
  const [priority, setPriority] = useState('critical'); // 'critical' | 'warning' | 'routine'
  const [isBooked, setIsBooked] = useState(false);
  const [bookedRecord, setBookedRecord] = useState(null);

  const currentFacility = nearbyFacilities.find((f) => f.id === selectedFacilityId) || nearbyFacilities[0];

  const handleFacilityChange = (facId) => {
    setSelectedFacilityId(facId);
    const fac = nearbyFacilities.find((f) => f.id === facId);
    if (fac) {
      setSelectedSpecialty(fac.specialties[0]);
      setSelectedSlot(fac.availableSlots[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const referralRecord = {
      id: `ref-${Date.now()}`,
      patientId: `pt-${Date.now()}`,
      patientName,
      age: 38,
      gender: 'Female',
      referringWorker: 'Sunita Devi (CHO / ASHA — Sub-Centre Rampur)',
      facility: currentFacility.name,
      specialty: selectedSpecialty,
      reason,
      slot: selectedSlot,
      status: 'Confirmed', // Requested -> Confirmed -> Completed
      priority,
      isTeleconsult: true,
      bookedAt: 'Just now',
    };

    dispatch({
      type: ActionTypes.ADD_REFERRAL,
      payload: referralRecord,
    });

    setBookedRecord(referralRecord);
    setIsBooked(true);
  };

  return (
    <div className="asha-referral-page" role="main">
      {/* Top Bar */}
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
              <h1 className="asha-title">Referral Booking &amp; Facility Scheduling</h1>
              <p className="asha-subtitle">
                Book structured tier-2 or tier-3 referrals for patients requiring specialist evaluation
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="asha-container">
        {isBooked ? (
          <div className="booking-success-card" role="status">
            <div className="complete-icon-circle">
              <CheckCircle2 size={48} aria-hidden="true" />
            </div>
            <h2 className="success-heading">Referral Confirmed &amp; Scheduled</h2>
            <p className="success-subtext">
              Referral record created with status <strong>Confirmed</strong>. This patient has been synchronized with the Doctor&apos;s outpatient queue.
            </p>

            <div className="referral-summary-box">
              <div className="summary-item">
                <span className="summary-label">Patient:</span>
                <span className="summary-val">{bookedRecord.patientName}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Facility:</span>
                <span className="summary-val">{bookedRecord.facility}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Specialty:</span>
                <span className="summary-val">{bookedRecord.specialty}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Appointment Slot:</span>
                <span className="summary-val">{bookedRecord.slot}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Referral Status:</span>
                <span className="summary-val status-confirmed">Confirmed</span>
              </div>
            </div>

            <div className="booking-next-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate('/asha')}
              >
                <span>Return to ASHA Dashboard</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/doctor')}
              >
                <Stethoscope size={18} aria-hidden="true" />
                <span>View in Doctor&apos;s Queue</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="referral-form-card">
            <form onSubmit={handleSubmit} className="referral-form">
              <div className="form-group">
                <label htmlFor="ref-patient-name">Patient Name *</label>
                <input
                  id="ref-patient-name"
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="form-input"
                  placeholder="Enter patient name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="ref-reason">Clinical Reason for Referral *</label>
                <textarea
                  id="ref-reason"
                  required
                  rows="3"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="form-textarea"
                  placeholder="Describe chief complaint, clinical findings, and triage urgency"
                />
              </div>

              <div className="form-group">
                <label>Priority Level</label>
                <div className="priority-options-row">
                  <label className={`priority-radio-label ${priority === 'critical' ? 'priority-radio-label--critical' : ''}`}>
                    <input
                      type="radio"
                      name="priority"
                      value="critical"
                      checked={priority === 'critical'}
                      onChange={() => setPriority('critical')}
                    />
                    <AlertTriangle size={16} aria-hidden="true" />
                    <span>Critical Red-Flag</span>
                  </label>

                  <label className={`priority-radio-label ${priority === 'warning' ? 'priority-radio-label--warning' : ''}`}>
                    <input
                      type="radio"
                      name="priority"
                      value="warning"
                      checked={priority === 'warning'}
                      onChange={() => setPriority('warning')}
                    />
                    <span>Urgent</span>
                  </label>

                  <label className={`priority-radio-label ${priority === 'routine' ? 'priority-radio-label--routine' : ''}`}>
                    <input
                      type="radio"
                      name="priority"
                      value="routine"
                      checked={priority === 'routine'}
                      onChange={() => setPriority('routine')}
                    />
                    <span>Routine</span>
                  </label>
                </div>
              </div>

              {/* Facility Selection */}
              <div className="form-group">
                <label>Select Target Facility (Nearby Tiers)</label>
                <div className="facilities-selection-grid">
                  {nearbyFacilities.map((fac) => (
                    <button
                      key={fac.id}
                      type="button"
                      className={`facility-card-btn ${selectedFacilityId === fac.id ? 'facility-card-btn--active' : ''}`}
                      onClick={() => handleFacilityChange(fac.id)}
                    >
                      <div className="fac-card-header">
                        <Building size={20} aria-hidden="true" />
                        <span className="fac-dist-badge">{fac.distance}</span>
                      </div>
                      <span className="fac-name">{fac.name}</span>
                      <span className="fac-type">{fac.type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Specialty Selection */}
              <div className="form-group">
                <label htmlFor="ref-specialty">Specialty Service</label>
                <select
                  id="ref-specialty"
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="form-input"
                >
                  {currentFacility.specialties.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              {/* Available Slots */}
              <div className="form-group">
                <label>Available Appointment Slots</label>
                <div className="slots-grid">
                  {currentFacility.availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={`slot-choice-btn ${selectedSlot === slot ? 'slot-choice-btn--active' : ''}`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <Clock size={16} aria-hidden="true" />
                      <span>{slot}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="intake-submit-btn">
                <Calendar size={18} aria-hidden="true" />
                <span>Confirm &amp; Book Referral</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
