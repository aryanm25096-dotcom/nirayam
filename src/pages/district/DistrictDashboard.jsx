import { usePatientSession } from '../../context/PatientSessionContext.jsx';
import { districtAnalytics } from '../../data/mockData.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import {
  Building2,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Activity,
  HeartPulse,
  MapPin,
  Calendar,
} from 'lucide-react';
import './DistrictDashboard.css';

export default function DistrictDashboard() {
  const { state } = usePatientSession();

  // Calculate live dynamic counts merged with district baseline
  const activeReferrals = state.referrals || [];
  const completedReferralsCount =
    districtAnalytics.summary.referralsCompleted +
    activeReferrals.filter((r) => r.status === 'Completed').length;
  const pendingReferralsCount =
    districtAnalytics.summary.referralsPending +
    activeReferrals.filter((r) => r.status !== 'Completed').length;
  const redFlagsCount =
    districtAnalytics.summary.activeRedFlags +
    (state.patientQueue || []).filter((p) => p.priority === 'critical' && p.status !== 'Completed').length;

  const continuityData = districtAnalytics.patientContinuity;

  return (
    <div className="district-dashboard-screen" role="main">
      {/* Top Header */}
      <header className="district-header">
        <div className="district-header-inner">
          <div className="district-title-block">
            <div className="district-emblem-badge" aria-hidden="true">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="district-title">District Health Command &amp; Aggregate Analytics</h1>
              <p className="district-subtitle">
                Chief Medical Officer (CMO) Portal • Sonipat District, Haryana • ABDM Synchronized
              </p>
            </div>
          </div>

          <div className="registry-sync-chip" role="status">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>State EHR Gateway: Active</span>
          </div>
        </div>
      </header>

      <div className="district-content-container">
        {/* 1. Summary Numbers (Icon + Label style, NOT decorative cards) */}
        <section className="summary-numbers-section" aria-labelledby="summary-stats-heading">
          <h2 id="summary-stats-heading" className="sr-only">District Operational Summary</h2>

          <div className="summary-stats-strip">
            {/* Stat 1: Patients Seen Today */}
            <div className="stat-unit">
              <div className="stat-icon-wrap" aria-hidden="true">
                <Users size={22} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{districtAnalytics.summary.patientsSeenToday}</span>
                <span className="stat-label">Patients Seen Today across 18 Facilities</span>
              </div>
            </div>

            <div className="stat-divider" aria-hidden="true" />

            {/* Stat 2: Referrals Completed */}
            <div className="stat-unit">
              <div className="stat-icon-wrap stat-icon--success" aria-hidden="true">
                <CheckCircle2 size={22} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{completedReferralsCount}</span>
                <span className="stat-label">Referrals Completed &amp; Documented</span>
              </div>
            </div>

            <div className="stat-divider" aria-hidden="true" />

            {/* Stat 3: Referrals Pending */}
            <div className="stat-unit">
              <div className="stat-icon-wrap stat-icon--amber" aria-hidden="true">
                <Clock size={22} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{pendingReferralsCount}</span>
                <span className="stat-label">Referrals Awaiting Higher Tier Consult</span>
              </div>
            </div>

            <div className="stat-divider" aria-hidden="true" />

            {/* Stat 4: Active Red-Flag Alerts */}
            <div className="stat-unit">
              <div className="stat-icon-wrap stat-icon--critical" aria-hidden="true">
                <AlertTriangle size={22} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{redFlagsCount}</span>
                <span className="stat-label">Active Red-Flag Emergency Alerts</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Referral Completion View */}
        <section className="dashboard-card referral-completion-section" aria-labelledby="referral-rates-heading">
          <div className="card-header-bar">
            <div>
              <h2 id="referral-rates-heading" className="card-heading">
                Facility Referral Completion Performance
              </h2>
              <p className="card-subheading">
                Tracking patient transition rates from Sub-Centres and PHCs to Community and District apex facilities
              </p>
            </div>
          </div>

          <div className="referral-table-scroll">
            <table className="district-table">
              <thead>
                <tr>
                  <th scope="col">Facility Name</th>
                  <th scope="col">Health Tier</th>
                  <th scope="col">Referred Out</th>
                  <th scope="col">Completed In OPD</th>
                  <th scope="col" style={{ width: '240px' }}>Completion Rate</th>
                  <th scope="col">Performance Status</th>
                </tr>
              </thead>
              <tbody>
                {districtAnalytics.facilitiesReferralRates.map((fac, idx) => {
                  const isOptimal = fac.rate >= 85;
                  const isGood = fac.rate >= 80 && fac.rate < 85;
                  const statusCategory = isOptimal ? 'success' : isGood ? 'info' : 'warning';

                  return (
                    <tr key={idx}>
                      <td>
                        <strong>{fac.facility}</strong>
                      </td>
                      <td className="tier-cell">{fac.tier}</td>
                      <td>{fac.referred}</td>
                      <td>{fac.completed}</td>
                      <td>
                        <div className="completion-bar-wrapper">
                          <div className="completion-bar-track">
                            <div
                              className="completion-bar-fill"
                              style={{ width: `${fac.rate}%` }}
                              aria-hidden="true"
                            />
                          </div>
                          <span className="completion-pct-text">{fac.rate.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td>
                        <StatusBadge
                          status={statusCategory}
                          label={fac.status}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. Patient Continuity Horizontal Timeline (Single Most Important Visual) */}
        <section className="dashboard-card patient-continuity-section" aria-labelledby="continuity-heading">
          <div className="card-header-bar">
            <div>
              <div className="continuity-title-badge">
                <HeartPulse size={18} aria-hidden="true" />
                <span>CROSS-TIER CONTINUITY VISUALIZER</span>
              </div>
              <h2 id="continuity-heading" className="card-heading">
                Patient Continuity Across Three Health Tiers
              </h2>
              <p className="card-subheading">
                Demonstrating end-to-end clinical journey from rural domiciliary screening to specialist hospital care and home follow-up
              </p>
            </div>

            <div className="patient-meta-pill">
              <span className="patient-pill-name">{continuityData.patientName}</span>
              <span className="patient-pill-sub">
                {continuityData.age} yrs • {continuityData.gender} • ABHA: {continuityData.abhaNumber}
              </span>
            </div>
          </div>

          <div className="continuity-diagnosis-strip">
            <span className="diagnosis-tag">Primary Diagnosis: {continuityData.primaryDiagnosis}</span>
            <span className="outcome-tag">
              <CheckCircle2 size={16} aria-hidden="true" />
              Outcome: {continuityData.outcome}
            </span>
          </div>

          {/* Horizontal Journey Timeline */}
          <div className="horizontal-timeline-container" role="region" aria-label="Patient horizontal care journey across facilities">
            <div className="horizontal-timeline-track">
              {continuityData.journeySteps.map((step, idx) => {
                const isCritical = step.status === 'critical';
                const isWarning = step.status === 'warning';
                const nodeBadgeStatus = isCritical ? 'critical' : isWarning ? 'warning' : 'success';

                return (
                  <div key={step.stepNumber} className="timeline-node-card">
                    {/* Node Header */}
                    <div className="timeline-node-header">
                      <div className="step-circle" aria-hidden="true">
                        <span>{step.stepNumber}</span>
                      </div>
                      <div className="step-meta">
                        <span className="step-date">
                          <Calendar size={12} aria-hidden="true" />
                          {step.date}
                        </span>
                        <span className="step-tier">{step.tier}</span>
                      </div>
                    </div>

                    {/* Facility & Worker */}
                    <div className="timeline-facility-block">
                      <div className="facility-row">
                        <MapPin size={16} className="pin-icon" aria-hidden="true" />
                        <h3 className="facility-heading">{step.facility}</h3>
                      </div>
                      <span className="worker-name">{step.worker}</span>
                    </div>

                    {/* Clinical Action */}
                    <div className="timeline-action-block">
                      <span className="action-title">{step.action}</span>
                      <p className="action-details">{step.details}</p>
                    </div>

                    {/* Status Badge */}
                    <div className="timeline-node-footer">
                      <StatusBadge
                        status={nodeBadgeStatus}
                        label={step.badge}
                      />
                    </div>

                    {/* Arrow to Next Step (except last) */}
                    {idx < continuityData.journeySteps.length - 1 && (
                      <div className="timeline-connector-arrow" aria-hidden="true">
                        <ArrowRight size={20} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
