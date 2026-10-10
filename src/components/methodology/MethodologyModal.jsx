import React from 'react';
import { X, BookOpen } from 'lucide-react';
import { FORMULA_EXPLANATIONS } from '../../engine/riskEngine';

export function MethodologyModal({ isOpen = true, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '800px', maxHeight: '90vh' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <BookOpen size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Risk Scoring Methodology & Calculation Equations
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Deterministic, audited 5-vector composite scoring architecture
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-subtle btn-icon">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Weight Matrix */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
              Vector Weight Allocations (100% Total)
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '10px'
            }}>
              {[
                { name: 'Quality Rejection', weight: '25%', desc: 'Inspection defect rates & NDT failures' },
                { name: 'Price Variance', weight: '20%', desc: 'Contract ceiling deviation & overpayment' },
                { name: 'Delivery OTIF', weight: '20%', desc: 'On-time fulfillment & shipment latency' },
                { name: 'Continuity / Buffer', weight: '20%', desc: 'Stock coverage vs lead time & sole source' },
                { name: 'Compliance Cliff', weight: '15%', desc: 'AS9100/ISO audit expiry countdown' },
              ].map(w => (
                <div key={w.name} style={{
                  backgroundColor: 'var(--bg-input)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center'
                }}>
                  <div className="mono-num" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--teal-primary)' }}>
                    {w.weight}
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)' }}>{w.name}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>{w.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mathematical Equations */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
              Audited Deterministic Formulas
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(FORMULA_EXPLANATIONS).map(([key, formula]) => (
                <div key={key} style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-card-elevated)',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  color: '#7dd3fc'
                }}>
                  {formula}
                </div>
              ))}
            </div>
          </div>

          {/* Classification Bands */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
              Severity Classification Bands
            </h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, padding: '10px', borderRadius: '4px', backgroundColor: 'var(--risk-high-bg)', border: '1px solid var(--risk-high-border)' }}>
                <strong style={{ color: 'var(--risk-high-text)', fontSize: '0.8rem' }}>CRITICAL (80 - 100)</strong>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Immediate factory line stoppage or legal audit risk</p>
              </div>
              <div style={{ flex: 1, padding: '10px', borderRadius: '4px', backgroundColor: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                <strong style={{ color: 'var(--risk-high-text)', fontSize: '0.8rem' }}>HIGH (60 - 79)</strong>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Significant financial leakage or schedule slippage</p>
              </div>
              <div style={{ flex: 1, padding: '10px', borderRadius: '4px', backgroundColor: 'var(--risk-med-bg)', border: '1px solid var(--risk-med-border)' }}>
                <strong style={{ color: 'var(--risk-med-text)', fontSize: '0.8rem' }}>MEDIUM (30 - 59)</strong>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Early warning trend; audit review recommended</p>
              </div>
              <div style={{ flex: 1, padding: '10px', borderRadius: '4px', backgroundColor: 'var(--risk-low-bg)', border: '1px solid var(--risk-low-border)' }}>
                <strong style={{ color: 'var(--risk-low-text)', fontSize: '0.8rem' }}>LOW (0 - 29)</strong>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Operating normally within contractual SLA limits</p>
              </div>
            </div>
          </div>

          {/* Partial-Data Scoring & Missing Data Safeguards */}
          <div style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(14, 165, 233, 0.08)',
            border: '1px solid rgba(14, 165, 233, 0.25)'
          }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--teal-primary)', marginBottom: '6px' }}>
              Partial-Data Scoring Policy & Uncertainty Buffer (Imported Records)
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '8px' }}>
              When a user uploads a dataset with missing optional columns, SupplyShield AI applies a deterministic partial-data scoring methodology:
            </p>
            <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li><strong>Dynamic Weight Re-Normalization:</strong> Available vector scores are proportional to their standard relative weights, divided by the sum of measured weights.</li>
              <li><strong>Zero Synthetic Fabrication:</strong> Missing dimensions (e.g. unrecorded price variance or defect rate) are never filled with fabricated demo constants.</li>
              <li><strong>Uncertainty Floor:</strong> A vendor cannot be classified as LOW risk solely because data is absent. When data completeness is under 50%, a conservative uncertainty floor clamps the score to at least 35 (MEDIUM).</li>
              <li><strong>Completeness Transparency:</strong> Every uploaded supplier displays a completeness score (e.g., 60% or 100%) and explicit disclosures of unmeasured risk dimensions.</li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-primary">
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
