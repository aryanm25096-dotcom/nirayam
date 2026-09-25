import { createContext, useContext, useReducer, useEffect } from 'react';
import { initialPatientQueue, initialFollowUpTasks, initialReferrals } from '../data/mockData.js';

const STORAGE_KEY = 'niramay_session_state';

// ── Initial State ──
const initialState = {
  // Role selection
  role: null, // 'patient' | 'doctor' | 'asha' | 'district'

  // Patient Intake Flow State
  language: 'en',
  idMethod: null,
  patientId: null,
  patientName: '',
  consents: {
    history: false,
    documents: false,
    hospital: false,
    abdm: false,
  },
  consultationType: null, // 'general' | 'ayush'
  answers: [],            // [{ questionId, questionText, category, answer, term?, timestamp }]
  structuredHistory: null, // populated by mockAISummary
  redFlag: null,           // { triggered: true, ruleId, message, acknowledgedByDoctor: false }
  documents: [],           // [{ id, type, date, extractedFields, confirmed }]
  summaryConfirmed: false,
  reviewedByDoctor: false,

  // Shared Cross-Role State
  patientQueue: initialPatientQueue,
  selectedDoctorPatientId: 'pt-1041',
  referrals: initialReferrals,
  followUpTasks: initialFollowUpTasks,
};

// ── Action Types ──
const ActionTypes = {
  SET_ROLE: 'SET_ROLE',
  SET_LANGUAGE: 'SET_LANGUAGE',
  SET_ID_METHOD: 'SET_ID_METHOD',
  SET_PATIENT_ID: 'SET_PATIENT_ID',
  SET_CONSENTS: 'SET_CONSENTS',
  SET_CONSULTATION_TYPE: 'SET_CONSULTATION_TYPE',
  ADD_ANSWER: 'ADD_ANSWER',
  SET_STRUCTURED_HISTORY: 'SET_STRUCTURED_HISTORY',
  SET_RED_FLAG: 'SET_RED_FLAG',
  ADD_DOCUMENT: 'ADD_DOCUMENT',
  CONFIRM_DOCUMENT: 'CONFIRM_DOCUMENT',
  REMOVE_DOCUMENT: 'REMOVE_DOCUMENT',
  CONFIRM_SUMMARY: 'CONFIRM_SUMMARY',
  EDIT_SECTION: 'EDIT_SECTION',
  ACKNOWLEDGE_RED_FLAG: 'ACKNOWLEDGE_RED_FLAG',
  CONFIRM_REVIEW: 'CONFIRM_REVIEW',
  RESET: 'RESET',

  // Cross-Role Multi-User Actions
  SET_SELECTED_DOCTOR_PATIENT: 'SET_SELECTED_DOCTOR_PATIENT',
  UPDATE_PATIENT_QUEUE_STATUS: 'UPDATE_PATIENT_QUEUE_STATUS',
  ADD_REFERRAL: 'ADD_REFERRAL',
  COMPLETE_REFERRAL: 'COMPLETE_REFERRAL',
  TOGGLE_FOLLOWUP_TASK: 'TOGGLE_FOLLOWUP_TASK',
  EDIT_PATIENT_HISTORY: 'EDIT_PATIENT_HISTORY',
};

// ── Reducer ──
function sessionReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_ROLE:
      return { ...state, role: action.payload };

    case ActionTypes.SET_LANGUAGE:
      return { ...state, language: action.payload };

    case ActionTypes.SET_ID_METHOD:
      return { ...state, idMethod: action.payload };

    case ActionTypes.SET_PATIENT_ID:
      return {
        ...state,
        patientId: action.payload.id,
        patientName: action.payload.name || state.patientName,
      };

    case ActionTypes.SET_CONSENTS:
      return { ...state, consents: { ...state.consents, ...action.payload } };

    case ActionTypes.SET_CONSULTATION_TYPE:
      return { ...state, consultationType: action.payload };

    case ActionTypes.ADD_ANSWER:
      return {
        ...state,
        answers: [
          ...state.answers,
          { ...action.payload, timestamp: Date.now() },
        ],
      };

    case ActionTypes.SET_STRUCTURED_HISTORY:
      return { ...state, structuredHistory: action.payload };

    case ActionTypes.SET_RED_FLAG:
      return {
        ...state,
        redFlag: {
          triggered: true,
          ruleId: action.payload.id,
          message: action.payload.message,
          acknowledgedByDoctor: false,
        },
      };

    case ActionTypes.ADD_DOCUMENT:
      return { ...state, documents: [...state.documents, action.payload] };

    case ActionTypes.CONFIRM_DOCUMENT:
      return {
        ...state,
        documents: state.documents.map((d) =>
          d.id === action.payload ? { ...d, confirmed: true } : d
        ),
      };

    case ActionTypes.REMOVE_DOCUMENT:
      return {
        ...state,
        documents: state.documents.filter((d) => d.id !== action.payload),
      };

    case ActionTypes.CONFIRM_SUMMARY: {
      const activePatientToken = `MK-${state.patientId ? state.patientId.slice(-4) : '1042'}`;
      const chiefComplaint = state.structuredHistory?.chiefComplaint || state.answers.find((a) => a.category === 'chiefComplaint')?.answer || 'General Clinical Review';
      
      // Upsert into patientQueue so doctor sees this patient immediately
      const existingIdx = state.patientQueue.findIndex((p) => p.token === activePatientToken);
      let updatedQueue;
      const patientRecord = {
        id: state.patientId || 'pt-active',
        token: activePatientToken,
        name: state.patientName || 'Verified Citizen',
        age: 45,
        gender: 'Male',
        abhaNumber: state.patientId || '91-3829-1092-7741',
        chiefComplaint,
        priority: state.redFlag?.triggered ? 'critical' : 'routine',
        status: 'Awaiting Review',
        source: 'Self-Intake Kiosk',
        facility: 'District Hospital Sonipat',
        consultationType: state.consultationType || 'general',
        isTeleconsult: false,
        intakeTime: 'Just now',
        redFlag: state.redFlag,
        structuredHistory: state.structuredHistory,
        documents: state.documents,
      };

      if (existingIdx >= 0) {
        updatedQueue = [...state.patientQueue];
        updatedQueue[existingIdx] = { ...updatedQueue[existingIdx], ...patientRecord };
      } else {
        updatedQueue = [patientRecord, ...state.patientQueue];
      }

      return {
        ...state,
        summaryConfirmed: true,
        patientQueue: updatedQueue,
      };
    }

    case ActionTypes.EDIT_SECTION:
      return {
        ...state,
        structuredHistory: {
          ...state.structuredHistory,
          [action.payload.section]: action.payload.value,
        },
      };

    case ActionTypes.ACKNOWLEDGE_RED_FLAG:
      return {
        ...state,
        redFlag: state.redFlag
          ? { ...state.redFlag, acknowledgedByDoctor: true }
          : null,
      };

    case ActionTypes.CONFIRM_REVIEW: {
      const currentPatientId = state.selectedDoctorPatientId;
      // Mark current patient completed in patientQueue
      const updatedQueue = state.patientQueue.map((p) =>
        p.id === currentPatientId ? { ...p, status: 'Completed' } : p
      );
      // Also update any matching referral to Completed
      const updatedReferrals = state.referrals.map((r) =>
        r.patientId === currentPatientId ? { ...r, status: 'Completed' } : r
      );
      return {
        ...state,
        reviewedByDoctor: true,
        patientQueue: updatedQueue,
        referrals: updatedReferrals,
      };
    }

    case ActionTypes.SET_SELECTED_DOCTOR_PATIENT:
      return { ...state, selectedDoctorPatientId: action.payload };

    case ActionTypes.UPDATE_PATIENT_QUEUE_STATUS:
      return {
        ...state,
        patientQueue: state.patientQueue.map((p) =>
          p.id === action.payload.id ? { ...p, status: action.payload.status } : p
        ),
      };

    case ActionTypes.ADD_REFERRAL: {
      const newRef = action.payload;
      const refToken = `MK-${newRef.patientId ? newRef.patientId.slice(-4) : Math.floor(1050 + Math.random() * 50)}`;
      
      // Also create a patient record for the Doctor's Queue so it is instantly visible to Doctor
      const doctorQueueEntry = {
        id: newRef.id || `pt-ref-${Date.now()}`,
        token: refToken,
        name: newRef.patientName,
        age: newRef.age || 35,
        gender: newRef.gender || 'Unknown',
        abhaNumber: newRef.patientId || '91-0000-0000-0000',
        chiefComplaint: newRef.reason || 'Referral from ASHA',
        priority: newRef.priority || 'warning',
        status: 'Awaiting Review',
        source: 'ASHA Referral',
        referringWorker: newRef.referringWorker || 'Sunita Devi (CHO / ASHA — Sub-Centre Rampur)',
        facility: newRef.facility,
        consultationType: 'general',
        isTeleconsult: newRef.isTeleconsult !== false,
        intakeTime: newRef.slot || 'Today (Referred)',
        redFlag: newRef.priority === 'critical' ? {
          triggered: true,
          message: `CRITICAL REFERRAL: ${newRef.reason}`,
          acknowledgedByDoctor: false,
        } : null,
        structuredHistory: {
          chiefComplaint: newRef.reason,
          hpiNarrative: `Referred by ASHA worker for specialist consultation at ${newRef.facility}. Scheduled slot: ${newRef.slot}.`,
          pastMedical: [],
          pastSurgical: [],
          drugHistory: [],
          allergies: [],
          familyHistory: [],
          personalHistory: {},
          reviewOfSystems: {},
          ayush: {},
        },
        documents: [],
      };

      return {
        ...state,
        referrals: [newRef, ...state.referrals],
        patientQueue: [doctorQueueEntry, ...state.patientQueue],
      };
    }

    case ActionTypes.COMPLETE_REFERRAL:
      return {
        ...state,
        referrals: state.referrals.map((r) =>
          r.id === action.payload ? { ...r, status: 'Completed' } : r
        ),
      };

    case ActionTypes.TOGGLE_FOLLOWUP_TASK:
      return {
        ...state,
        followUpTasks: state.followUpTasks.map((t) =>
          t.id === action.payload ? { ...t, completed: !t.completed } : t
        ),
      };

    case ActionTypes.EDIT_PATIENT_HISTORY: {
      const { patientId, section, value } = action.payload;
      return {
        ...state,
        patientQueue: state.patientQueue.map((p) => {
          if (p.id !== patientId) return p;
          return {
            ...p,
            structuredHistory: {
              ...p.structuredHistory,
              [section]: value,
            },
          };
        }),
      };
    }

    case ActionTypes.RESET:
      return {
        ...initialState,
        // Preserve queue and cross-role state across reset so demo remains continuous
        patientQueue: state.patientQueue,
        referrals: state.referrals,
        followUpTasks: state.followUpTasks,
      };

    default:
      return state;
  }
}

// ── Context ──
const PatientSessionContext = createContext(null);

// ── Provider ──
export function PatientSessionProvider({ children }) {
  const savedState = (() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...initialState, ...parsed };
      }
    } catch {
      // Ignore
    }
    return initialState;
  })();

  const [state, dispatch] = useReducer(sessionReducer, savedState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage error
    }
  }, [state]);

  return (
    <PatientSessionContext.Provider value={{ state, dispatch, ActionTypes }}>
      {children}
    </PatientSessionContext.Provider>
  );
}

// ── Hook ──
export function usePatientSession() {
  const ctx = useContext(PatientSessionContext);
  if (!ctx) {
    throw new Error('usePatientSession must be used within PatientSessionProvider');
  }
  return ctx;
}

export { ActionTypes };
export default PatientSessionContext;
