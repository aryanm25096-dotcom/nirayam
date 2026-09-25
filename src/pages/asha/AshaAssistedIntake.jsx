import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientSession, ActionTypes } from '../../context/PatientSessionContext.jsx';
import { generalQuestions, getNextQuestion } from '../../data/questionBank.js';
import { ayushQuestions } from '../../data/ayushQuestions.js';
import { checkRedFlags } from '../../data/redFlagRules.js';
import { mockAISummary, mockOCR } from '../../mocks/mockServices.js';
import QuestionCard from '../../components/QuestionCard.jsx';
import ProgressBar from '../../components/ProgressBar.jsx';
import RedFlagBanner from '../../components/RedFlagBanner.jsx';
import DocumentCard from '../../components/DocumentCard.jsx';
import {
  Users,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Camera,
  Upload,
  Loader2,
  Calendar,
  Video,
  FileCheck,
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import './Asha.css';

export default function AshaAssistedIntake() {
  const navigate = useNavigate();
  const { dispatch } = usePatientSession();

  // Steps: 'demographics' | 'interview' | 'scan' | 'complete'
  const [step, setStep] = useState('demographics');

  // Patient Demographics State
  const [patientData, setPatientData] = useState({
    name: '',
    age: '',
    gender: 'Female',
    abhaNumber: '',
    stream: 'general', // 'general' | 'ayush'
  });

  // Interview State
  const questionBank = patientData.stream === 'ayush' ? ayushQuestions : generalQuestions;
  const [currentQuestion, setCurrentQuestion] = useState(() => questionBank[0]);
  const [answers, setAnswers] = useState([]);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [isProcessingSummary, setIsProcessingSummary] = useState(false);
  const [structuredHistory, setStructuredHistory] = useState(null);
  const [redFlag, setRedFlag] = useState(null);
  const [showRedFlagModal, setShowRedFlagModal] = useState(false);

  // Document Scan State
  const [documents, setDocuments] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  const estimatedTotal = patientData.stream === 'ayush' ? 12 : 10;

  // Frame the question for the worker: "Ask the patient: ..."
  const framedQuestion = useMemo(() => {
    if (!currentQuestion) return null;
    return {
      ...currentQuestion,
      text: `Ask the patient: "${currentQuestion.text}"`,
    };
  }, [currentQuestion]);

  const handleDemographicsSubmit = (e) => {
    e.preventDefault();
    if (!patientData.name) return;
    setStep('interview');
  };

  const handleAnswer = async (answerText) => {
    const newAnswerObj = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.text,
      category: currentQuestion.category,
      term: currentQuestion.term,
      answer: answerText,
    };

    const updatedAnswers = [...answers, newAnswerObj];
    setAnswers(updatedAnswers);
    setAnsweredCount((prev) => prev + 1);

    // Evaluate red flags
    const categoryMap = {};
    for (const a of updatedAnswers) {
      categoryMap[a.category] = (categoryMap[a.category] ? categoryMap[a.category] + ' ' : '') + a.answer;
    }
    const flaggedRule = checkRedFlags(categoryMap);
    if (flaggedRule && (!redFlag || !redFlag.triggered)) {
      const rf = {
        triggered: true,
        message: flaggedRule.message,
        acknowledgedByDoctor: false,
      };
      setRedFlag(rf);
      setShowRedFlagModal(true);
    }

    // Branching question
    const nextQ = getNextQuestion(currentQuestion, answerText, questionBank);
    if (nextQ) {
      setCurrentQuestion(nextQ);
    } else {
      // Finished interview questions -> synthesize AI summary
      setIsProcessingSummary(true);
      try {
        const summary = await mockAISummary(updatedAnswers);
        setStructuredHistory(summary);
      } catch {
        // fallback
      } finally {
        setIsProcessingSummary(false);
        setStep('scan');
      }
    }
  };

  // Mock OCR Scan in worker mode
  const handleSimulateScan = async () => {
    setIsScanning(true);
    try {
      const fakeFile = new File(['worker_doc'], 'asha_captured_prescription.jpg', { type: 'image/jpeg' });
      const doc = await mockOCR(fakeFile);
      setDocuments((prev) => [...prev, doc]);
    } finally {
      setIsScanning(false);
    }
  };

  // Complete Worker Assisted Intake
  const handleCompleteIntake = () => {
    const chiefComplaint = structuredHistory?.chiefComplaint || answers[0]?.answer || 'Field Clinical Intake';
    const patientToken = `MK-${Math.floor(1060 + Math.random() * 30)}`;

    const newPatientRecord = {
      id: `pt-asha-${Date.now()}`,
      token: patientToken,
      name: patientData.name,
      age: parseInt(patientData.age, 10) || 35,
      gender: patientData.gender,
      abhaNumber: patientData.abhaNumber || `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      chiefComplaint,
      priority: redFlag ? 'critical' : 'warning',
      status: 'Awaiting Review',
      source: 'ASHA Referral',
      referringWorker: 'Sunita Devi (CHO / ASHA — Sub-Centre Rampur)',
      facility: 'District Hospital Sonipat',
      consultationType: patientData.stream,
      isTeleconsult: true,
      intakeTime: 'Today (ASHA Assisted)',
      redFlag,
      structuredHistory: structuredHistory || {
        chiefComplaint,
        hpiNarrative: answers.map((a) => `${a.questionText}: ${a.answer}`).join('. '),
        pastMedical: [],
        pastSurgical: [],
        drugHistory: [],
        allergies: [],
        familyHistory: [],
        personalHistory: {},
        reviewOfSystems: {},
        ayush: {},
      },
      documents,
    };

    // Dispatch to global queue so Doctor role sees it immediately!
    dispatch({
      type: ActionTypes.ADD_REFERRAL,
      payload: {
        id: newPatientRecord.id,
        patientId: newPatientRecord.id,
        patientName: newPatientRecord.name,
        age: newPatientRecord.age,
        gender: newPatientRecord.gender,
        facility: 'District Hospital Sonipat',
        specialty: patientData.stream === 'ayush' ? 'AYUSH & Ayurveda' : 'General Medicine',
        reason: chiefComplaint,
        slot: 'Today, 02:30 PM (Priority)',
        status: 'Confirmed',
        priority: redFlag ? 'critical' : 'warning',
        isTeleconsult: true,
        referringWorker: 'Sunita Devi (CHO / ASHA — Sub-Centre Rampur)',
      },
    });

    setStep('complete');
  };

  return (
    <div className="asha-intake-page" role="main">
      {/* Worker-Assisted Mode Persistent Banner */}
      <div className="worker-mode-banner" role="status">
        <div className="worker-mode-left">
          <Users size={18} aria-hidden="true" />
          <span className="worker-mode-title">WORKER-ASSISTED INTAKE MODE</span>
          <span className="worker-mode-subtitle">Operating device on patient&apos;s behalf</span>
        </div>
        <button
          type="button"
          className="exit-intake-link"
          onClick={() => navigate('/asha')}
          aria-label="Exit worker intake and return to dashboard"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Exit to Dashboard</span>
        </button>
      </div>

      <div className="asha-intake-container">
        {/* Step 1: Patient Demographics Setup */}
        {step === 'demographics' && (
          <div className="intake-card">
            <h1 className="intake-card-title">Patient Identification &amp; Stream</h1>
            <p className="intake-card-desc">
              Enter patient basic details before starting the structured clinical interview.
            </p>

            <form onSubmit={handleDemographicsSubmit} className="intake-form">
              <div className="form-group">
                <label htmlFor="patient-name">Patient Full Name *</label>
                <input
                  id="patient-name"
                  type="text"
                  required
                  placeholder="e.g. Shakuntala Devi"
                  value={patientData.name}
                  onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="patient-age">Age (Years) *</label>
                  <input
                    id="patient-age"
                    type="number"
                    required
                    min="1"
                    max="115"
                    placeholder="e.g. 45"
                    value={patientData.age}
                    onChange={(e) => setPatientData({ ...patientData, age: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="patient-gender">Gender</label>
                  <select
                    id="patient-gender"
                    value={patientData.gender}
                    onChange={(e) => setPatientData({ ...patientData, gender: e.target.value })}
                    className="form-input"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="patient-abha">ABHA / Mobile Number (Optional)</label>
                <input
                  id="patient-abha"
                  type="text"
                  placeholder="e.g. 91-8842-1920-5512 or 10-digit mobile"
                  value={patientData.abhaNumber}
                  onChange={(e) => setPatientData({ ...patientData, abhaNumber: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Consultation Stream</label>
                <div className="stream-toggle-group">
                  <button
                    type="button"
                    className={`stream-choice-btn ${patientData.stream === 'general' ? 'stream-choice-btn--active' : ''}`}
                    onClick={() => setPatientData({ ...patientData, stream: 'general' })}
                  >
                    <Stethoscope size={18} aria-hidden="true" />
                    <span>General Medicine</span>
                  </button>
                  <button
                    type="button"
                    className={`stream-choice-btn ${patientData.stream === 'ayush' ? 'stream-choice-btn--active' : ''}`}
                    onClick={() => setPatientData({ ...patientData, stream: 'ayush' })}
                  >
                    <Sparkles size={18} aria-hidden="true" />
                    <span>AYUSH &amp; Ayurveda</span>
                  </button>
                </div>
              </div>

              <button type="submit" className="intake-submit-btn">
                <span>Begin Patient Interview</span>
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Worker-Framed Adaptive Interview */}
        {step === 'interview' && (
          <div className="intake-interview-view">
            <div className="interview-top-bar">
              <span className="step-indicator">
                Worker Assisted • Patient: {patientData.name} ({patientData.age} yrs, {patientData.gender})
              </span>
              <ProgressBar
                current={Math.min(answeredCount, estimatedTotal)}
                total={estimatedTotal}
                label="Clinical Assessment Progress"
              />
            </div>

            {isProcessingSummary ? (
              <div className="processing-summary-view" role="status" aria-live="polite">
                <Loader2 size={40} className="spin-icon" aria-hidden="true" />
                <h2 className="processing-title">Synthesizing AI Clinical Intake...</h2>
                <p className="processing-desc">Generating structured clinical draft for physician verification.</p>
              </div>
            ) : (
              framedQuestion && (
                <div className="worker-question-card-wrap">
                  <div className="worker-framing-badge" aria-hidden="true">
                    <span>Read this question aloud to the patient:</span>
                  </div>
                  <QuestionCard
                    question={framedQuestion}
                    lang="en-IN"
                    onAnswer={handleAnswer}
                  />
                </div>
              )
            )}

            {/* Red Flag alert modal if triggered */}
            {showRedFlagModal && redFlag && (
              <RedFlagBanner
                message={redFlag.message}
                onAcknowledge={() => setShowRedFlagModal(false)}
              />
            )}
          </div>
        )}

        {/* Step 3: Document Scan (Worker Mode) */}
        {step === 'scan' && (
          <div className="intake-card">
            <h1 className="intake-card-title">Document Digitization &amp; Prescriptions</h1>
            <p className="intake-card-desc">
              Scan previous prescriptions, lab reports, or discharge slips for {patientData.name}.
            </p>

            <div className="scan-actions-row">
              <button
                type="button"
                className="scan-btn"
                onClick={handleSimulateScan}
                disabled={isScanning}
              >
                {isScanning ? <Loader2 size={18} className="spin-icon" /> : <Camera size={18} />}
                <span>{isScanning ? 'Extracting via OCR...' : 'Capture via Tablet Camera'}</span>
              </button>

              <button
                type="button"
                className="scan-btn scan-btn--secondary"
                onClick={handleSimulateScan}
                disabled={isScanning}
              >
                <Upload size={18} />
                <span>Upload Document File</span>
              </button>
            </div>

            {documents.length > 0 && (
              <div className="scanned-docs-list">
                <h3 className="scanned-docs-title">Digitized Documents ({documents.length})</h3>
                {documents.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </div>
            )}

            <div className="scan-footer-actions">
              <button
                type="button"
                className="intake-submit-btn"
                onClick={handleCompleteIntake}
              >
                <FileCheck size={18} aria-hidden="true" />
                <span>Complete Intake &amp; Transmit to OPD Queue</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Complete State */}
        {step === 'complete' && (
          <div className="intake-complete-card" role="status">
            <div className="complete-icon-circle">
              <CheckCircle2 size={48} aria-hidden="true" />
            </div>
            <h1 className="complete-title">Intake Verified &amp; Added to OPD Queue</h1>
            <p className="complete-desc">
              Clinical draft and records for <strong>{patientData.name}</strong> are now active in the Doctor&apos;s outpatient queue.
            </p>

            <div className="complete-next-actions">
              <button
                type="button"
                className="next-action-btn primary"
                onClick={() => navigate('/asha/referral')}
              >
                <Calendar size={18} aria-hidden="true" />
                <span>Book Facility Referral</span>
              </button>

              <button
                type="button"
                className="next-action-btn secondary"
                onClick={() => navigate('/asha/teleconsult')}
              >
                <Video size={18} aria-hidden="true" />
                <span>Initiate Teleconsultation</span>
              </button>

              <button
                type="button"
                className="next-action-btn tertiary"
                onClick={() => navigate('/asha')}
              >
                <ArrowLeft size={18} aria-hidden="true" />
                <span>Return to Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
