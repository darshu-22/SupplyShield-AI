import React, { useState, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  AlertTriangle, 
  FileCheck2, 
  CheckCircle2, 
  Info, 
  DollarSign, 
  SendHorizontal,
  Sliders,
  ShieldAlert
} from 'lucide-react';

export function SupplierAnalysisModal({ supplier, onClose, onQueueDecision, onOpenSimulator }) {
  const [stagedActionId, setStagedActionId] = useState(null);
  const [isSent, setIsSent] = useState(false);
  const counterRef = useRef(500);

  if (!supplier) return null;

  const summary = supplier.preliminarySummary;
  const crossWarnings = supplier.crossSignalWarnings || [];

  const handleStageAction = (action) => {
    setStagedActionId(action.id);
    if (onQueueDecision) {
      counterRef.current += 1;
      onQueueDecision({
        id: `DEC-STAGE-${counterRef.current}`,
        supplierId: supplier.id,
        supplierCode: supplier.code,
        supplierName: supplier.shortName,
        actionTitle: action.title,
        category: action.type,
        urgency: supplier.riskLevel === 'HIGH' || supplier.riskLevel === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
        financialValue: supplier.quarterlyOverpaymentExposure > 0 ? `$${(supplier.quarterlyOverpaymentExposure).toLocaleString()} / qtr` : 'Operational Risk Mitigation',
        evidenceSummary: `${action.description} Triggered by ${supplier.code} audited metrics.`,
        draftDetails: `Action drafted during preliminary diagnostic: ${action.description}`,
        status: 'Pending Approval',
        approvedAt: null,
        riskReductionEstimate: 'High impact on mitigating active exposure'
      });
      setIsSent(true);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '880px', maxHeight: '92vh' }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(14, 165, 233, 0.3)'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Preliminary Supplier Analysis: {supplier.code}
                </h3>
                <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>
                  Rule-Based Diagnostic
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {supplier.name} • {supplier.suppliedItem}
              </div>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-subtle btn-icon">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Phase 2 Explicit Prototype Notice Banner */}
          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(14, 165, 233, 0.08)',
            border: '1px solid rgba(14, 165, 233, 0.25)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <Info size={18} style={{ color: 'var(--teal-primary)', marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--teal-primary)', marginBottom: '2px' }}>
                Simulated Intelligence Review — Rules-Based Diagnostic (Phase 2)
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                Demonstration mode: Preliminary rule-based diagnostic derived from audited local demonstration transactions. Full autonomous agentic negotiation models will be integrated in future phases.
              </p>
            </div>
          </div>

          {/* Cross-Signal Connected Warnings */}
          {crossWarnings.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ShieldAlert size={16} style={{ color: 'var(--risk-high-solid)' }} />
                Cross-Signal Intelligence Correlations ({crossWarnings.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {crossWarnings.map(cw => (
                  <div key={cw.id} style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--risk-high-bg)',
                    border: '1px solid var(--risk-high-border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--risk-high-text)' }}>
                        {cw.title}
                      </span>
                      <span className="badge badge-high" style={{ fontSize: '0.68rem' }}>
                        {cw.severity}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '6px' }}>
                      {cw.whyItMatters}
                    </p>
                    <div style={{ fontSize: '0.74rem', color: '#7dd3fc', borderTop: '1px solid rgba(244, 63, 94, 0.2)', paddingTop: '6px' }}>
                      <strong>Suggested Action:</strong> {cw.recommendedInvestigation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Diagnostic Core Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '12px'
          }}>
            {/* Primary Risk Driver */}
            <div style={{
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <AlertTriangle size={15} style={{ color: 'var(--risk-high-solid)' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Primary Risk Driver
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                {summary.primaryRiskDriver}
              </p>
            </div>

            {/* Financial Exposure Assessment */}
            <div style={{
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <DollarSign size={15} style={{ color: 'var(--teal-primary)' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Financial & Exposure Impact
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                {summary.financialImpactDescription}
              </p>
            </div>
          </div>

          {/* Diagnostic Evidence Summary Table */}
          <div style={{
            backgroundColor: 'var(--bg-card-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px'
          }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '12px' }}>
              Synthesized Operational Indicators
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '12px',
              fontSize: '0.8125rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Rejection Defect Rate</span>
                <span className="mono-num" style={{ fontWeight: 600, color: supplier.rejectionRate > 4 ? 'var(--risk-high-text)' : 'var(--text-main)' }}>
                  {supplier.rejectionRate}% (baseline: {supplier.baselineRejectionRate}%)
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Invoice Price Variance</span>
                <span className="mono-num" style={{ fontWeight: 600, color: supplier.priceVariance > 2 ? 'var(--risk-high-text)' : 'var(--text-main)' }}>
                  {supplier.priceVarianceFormatted} (${supplier.billedUnitCost} vs ${supplier.contractUnitCost})
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Compliance Accreditation</span>
                <span style={{ fontWeight: 600, color: supplier.certificateExpiryDays <= 30 ? 'var(--risk-high-text)' : 'var(--text-main)' }}>
                  {supplier.certificateExpiryDays} days remaining
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Factory Stock Reserve</span>
                <span style={{ fontWeight: 600, color: supplier.stockCoverageDays < 30 ? 'var(--risk-high-text)' : 'var(--text-main)' }}>
                  {supplier.stockCoverageDays} days (target: {supplier.targetSafetyStockDays}d)
                </span>
              </div>
            </div>
          </div>

          {/* Recommended Procurement Decision Actions */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCheck2 size={16} style={{ color: 'var(--teal-primary)' }} />
                Recommended Interventions for Human Approval ({summary.recommendedActions.length})
              </h4>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Select an intervention to draft into Decision pipeline
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {summary.recommendedActions.map((action) => {
                const isSelected = stagedActionId === action.id;

                return (
                  <div
                    key={action.id}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isSelected ? 'rgba(14, 165, 233, 0.12)' : 'var(--bg-input)',
                      border: `1px solid ${isSelected ? 'var(--teal-primary)' : 'var(--border-subtle)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '14px'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '3px',
                          backgroundColor: 'var(--bg-card-elevated)',
                          color: 'var(--teal-primary)',
                          border: '1px solid var(--border-medium)'
                        }}>
                          {action.type}
                        </span>
                        <h5 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {action.title}
                        </h5>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {action.description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleStageAction(action)}
                      className={`btn btn-sm ${isSelected ? 'btn-secondary' : 'btn-primary'}`}
                      disabled={isSelected}
                      style={{ fontSize: '0.78rem' }}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 size={13} style={{ color: '#10b981' }} /> Staged in Decisions
                        </>
                      ) : (
                        <>
                          <SendHorizontal size={13} /> Draft Action
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          {onOpenSimulator && (
            <button 
              onClick={() => {
                onClose();
                onOpenSimulator(supplier);
              }}
              className="btn btn-secondary"
            >
              <Sliders size={14} style={{ color: 'var(--teal-primary)' }} />
              Simulate What-If Scenario
            </button>
          )}

          {isSent && (
            <span style={{ fontSize: '0.78rem', color: '#86efac', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} /> Action draft queued to Decisions Console
            </span>
          )}
          <button onClick={onClose} className="btn btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
