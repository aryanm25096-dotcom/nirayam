import { FileText, CheckCircle2, RotateCcw, AlertCircle, Calendar } from 'lucide-react';
import { checkLabValue } from '../utils/labRanges.js';
import './DocumentCard.css';

/**
 * Renders scanned/uploaded document preview with OCR extracted fields.
 */
export default function DocumentCard({ doc, onConfirm, onRescan, isDoctorView = false }) {
  return (
    <div className={`doc-card ${doc.confirmed ? 'doc-card--confirmed' : ''}`} role="article" aria-label={`Document: ${doc.type}`}>
      <div className="doc-card-header">
        <div className="doc-type-badge">
          <FileText size={18} aria-hidden="true" />
          <span className="doc-type-text">{doc.type}</span>
        </div>
        <div className="doc-date-badge">
          <Calendar size={16} aria-hidden="true" />
          <span>{doc.date}</span>
        </div>
        {doc.confirmed && (
          <span className="doc-status-tag">
            <CheckCircle2 size={16} aria-hidden="true" />
            <span>Verified</span>
          </span>
        )}
      </div>

      <div className="doc-fields-table-wrapper">
        <table className="doc-fields-table">
          <caption className="sr-only">Extracted document fields</caption>
          <thead>
            <tr>
              <th scope="col">Field</th>
              <th scope="col">Extracted Value</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(doc.extractedFields)
              ? doc.extractedFields
              : Object.entries(doc.extractedFields || {}).map(([k, v]) => ({
                  label: k,
                  value: typeof v === 'object' ? JSON.stringify(v) : String(v),
                }))
            ).map((field, idx) => {
              const labStatus = field.numericValue ? checkLabValue(field.label, field.numericValue) : 'normal';
              const isAbnormal = labStatus === 'high' || labStatus === 'low';

              return (
                <tr key={idx} className={isAbnormal ? 'row-abnormal' : ''}>
                  <td className="field-label">{field.label}</td>
                  <td className="field-val">{field.value}</td>
                  <td className="field-status">
                    {isAbnormal ? (
                      <span className="lab-alert-badge">
                        <AlertCircle size={14} aria-hidden="true" />
                        <span>{labStatus === 'high' ? 'High' : 'Low'}</span>
                      </span>
                    ) : (
                      <span className="lab-normal-badge">Normal</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!isDoctorView && !doc.confirmed && (
        <div className="doc-actions">
          <button
            type="button"
            className="doc-btn doc-btn--rescan"
            onClick={() => onRescan?.(doc.id)}
          >
            <RotateCcw size={16} aria-hidden="true" />
            <span>Rescan</span>
          </button>
          <button
            type="button"
            className="doc-btn doc-btn--confirm"
            onClick={() => onConfirm?.(doc.id)}
          >
            <CheckCircle2 size={16} aria-hidden="true" />
            <span>Confirm Extracted Data</span>
          </button>
        </div>
      )}
    </div>
  );
}
