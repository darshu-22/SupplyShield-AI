import React from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  HelpCircle, 
  ShieldAlert, 
  DollarSign, 
  Truck, 
  FileCheck, 
  Layers, 
  PlusCircle 
} from 'lucide-react';

export function SupplierAnalysisReportModal({ 
  supplier, 
  onClose, 
  onQueueDecision,
  _onNavigateDecisions 
}) {
  if (!supplier) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--risk-critical)';
    if (score >= 60) return 'var(--risk-high)';
    if (score >= 30) return 'var(--risk-medium)';
    return 'var(--risk-low)';
  };

  const getRiskBadgeClass = (level) => {
    switch (level) {
      case 'CRITICAL': return 'badge-risk-critical';
      case 'HIGH': return 'badge-risk-high';
      case 'MEDIUM': return 'badge-risk-med';
      default: return 'badge-risk-low';
    }
  };

  const scoreBreakdown = supplier.scoreBreakdown || {};

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '880px', 
          width: '95%', 
          maxHeight: '90vh', 
          overflowY: 'auto',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span className={`badge ${getRiskBadgeClass(supplier.riskLevel)}`}>
                {supplier.riskLevel} RISK ({supplier.riskScore}/100)
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 600,
                backgroundColor: supplier.hasIncompleteData ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                color: supplier.hasIncompleteData ? '#f59e0b' : '#10b981',
                border: `1px solid ${supplier.hasIncompleteData ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
              }}>
                Completeness: {supplier.dataCompletenessScore || 0}%
              </span>
              {supplier.isUploaded && (
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  color: 'var(--teal-primary)',
                  border: '1px solid rgba(56, 189, 248, 0.25)'
                }}>
                  Uploaded Vendor
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              {supplier.name}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Vendor Code: {supplier.code} • Category: {supplier.itemCategory || 'General Supply'} • Item: {supplier.suppliedItem || 'Uploaded Component'}
            </p>
          </div>

          <button 
            onClick={onClose} 
            className="btn btn-secondary btn-icon" 
            style={{ borderRadius: '50%', padding: '6px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Incomplete Data Uncertainty Banner */}
          {supplier.riskUncertaintyNotice && (
            <div style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <AlertTriangle size={18} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b', margin: 0 }}>
                  Partial Data Assessment Notice
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                  {supplier.riskUncertaintyNotice}
                </p>
              </div>
            </div>
          )}

          {/* 5-Vector Score Breakdown Cards */}
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '12px' }}>
              Multi-Vector Risk Diagnostics
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '12px'
            }}>
              {/* Quality */}
              <div style={{
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-card-elevated)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldAlert size={13} style={{ color: '#818cf8' }} /> Quality (25%)
                  </span>
                  <span style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: 700, 
                    color: scoreBreakdown.quality != null ? getScoreColor(scoreBreakdown.quality) : 'var(--text-muted)' 
                  }}>
                    {scoreBreakdown.quality != null ? `${scoreBreakdown.quality}/100` : 'Missing'}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {supplier.rejectionRate != null ? `${supplier.rejectionRate}% Rejections` : 'Data Not Provided'}
                </div>
              </div>

              {/* Price */}
              <div style={{
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-card-elevated)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <DollarSign size={13} style={{ color: '#38bdf8' }} /> Price (20%)
                  </span>
                  <span style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: 700, 
                    color: scoreBreakdown.price != null ? getScoreColor(scoreBreakdown.price) : 'var(--text-muted)' 
                  }}>
                    {scoreBreakdown.price != null ? `${scoreBreakdown.price}/100` : 'Missing'}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {supplier.priceVarianceFormatted}
                </div>
              </div>

              {/* Delivery */}
              <div style={{
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-card-elevated)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Truck size={13} style={{ color: '#f59e0b' }} /> Delivery (20%)
                  </span>
                  <span style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: 700, 
                    color: scoreBreakdown.delivery != null ? getScoreColor(scoreBreakdown.delivery) : 'var(--text-muted)' 
                  }}>
                    {scoreBreakdown.delivery != null ? `${scoreBreakdown.delivery}/100` : 'Missing'}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {supplier.onTimeDeliveryRate != null ? `${supplier.onTimeDeliveryRate}% OTIF` : 'Data Not Provided'}
                </div>
              </div>

              {/* Compliance */}
              <div style={{
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-card-elevated)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FileCheck size={13} style={{ color: '#ec4899' }} /> Compliance (15%)
                  </span>
                  <span style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: 700, 
                    color: scoreBreakdown.compliance != null ? getScoreColor(scoreBreakdown.compliance) : 'var(--text-muted)' 
                  }}>
                    {scoreBreakdown.compliance != null ? `${scoreBreakdown.compliance}/100` : 'Missing'}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {supplier.certificateExpiryDays != null ? `${supplier.certificateExpiryDays}d Remaining` : 'Data Not Provided'}
                </div>
              </div>

              {/* Continuity */}
              <div style={{
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-card-elevated)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Layers size={13} style={{ color: '#10b981' }} /> Continuity (20%)
                  </span>
                  <span style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: 700, 
                    color: scoreBreakdown.continuity != null ? getScoreColor(scoreBreakdown.continuity) : 'var(--text-muted)' 
                  }}>
                    {scoreBreakdown.continuity != null ? `${scoreBreakdown.continuity}/100` : 'Missing'}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {supplier.stockCoverageDays != null ? `${supplier.stockCoverageDays}d Coverage` : (supplier.isSingleSource ? 'Sole Source' : 'Multi-Sourced')}
                </div>
              </div>
            </div>
          </div>

          {/* Observed Facts vs Rule Findings */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Observed Facts */}
            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-card-elevated)',
              border: '1px solid var(--border-subtle)'
            }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <CheckCircle size={15} style={{ color: '#10b981' }} /> Observed Input Facts
              </h4>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(supplier.observedFacts || []).map((fact, idx) => (
                  <li key={idx} style={{ lineHeight: 1.4 }}>{fact}</li>
                ))}
                {(!supplier.observedFacts || supplier.observedFacts.length === 0) && (
                  <li>No input facts recorded.</li>
                )}
              </ul>
            </div>

            {/* Rule-Based Findings */}
            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-card-elevated)',
              border: '1px solid var(--border-subtle)'
            }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Info size={15} style={{ color: 'var(--teal-primary)' }} /> Deterministic Rule Findings
              </h4>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(supplier.ruleFindings || []).map((finding, idx) => (
                  <li key={idx} style={{ lineHeight: 1.4 }}>{finding}</li>
                ))}
                {(!supplier.ruleFindings || supplier.ruleFindings.length === 0) && (
                  <li>All monitored rules within contractual control limits.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Missing Data Disclosures */}
          {supplier.missingDataNotes && supplier.missingDataNotes.length > 0 && (
            <div style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(148, 163, 184, 0.08)',
              border: '1px solid rgba(148, 163, 184, 0.2)'
            }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <HelpCircle size={14} /> Unmeasured Operational Dimensions
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {supplier.missingDataNotes.map((note, idx) => (
                  <span key={idx} style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    backgroundColor: 'var(--bg-card)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Actions Center */}
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '12px' }}>
              Actionable Procurement Recommendations
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(supplier.preliminarySummary?.recommendedActions || []).map((action, idx) => (
                <div key={idx} style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-card-elevated)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '14px'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className={`badge ${action.urgency === 'CRITICAL' ? 'badge-risk-critical' : action.urgency === 'HIGH' ? 'badge-risk-high' : 'badge-risk-med'}`}>
                        {action.urgency || 'HIGH'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {action.category || action.type}
                      </span>
                    </div>
                    <h5 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                      {action.title}
                    </h5>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                      {action.description}
                    </p>
                  </div>

                  <button 
                    onClick={() => {
                      if (onQueueDecision) {
                        onQueueDecision({
                          ...action,
                          supplierId: supplier.id,
                          supplierCode: supplier.code,
                          supplierName: supplier.name,
                          actionTitle: action.title,
                          category: action.category || action.type || 'Operational',
                          urgency: action.urgency || 'HIGH',
                          whyRecommended: action.whyRecommended || action.description,
                          evidenceSummary: `Derived from ${supplier.sourceDataset || 'uploaded data'}: ${supplier.riskScore}/100 risk score.`
                        });
                      }
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ whiteSpace: 'nowrap' }}
                    title="Stage recommendation into human-in-the-loop Decision Center"
                  >
                    <PlusCircle size={14} style={{ color: 'var(--teal-primary)' }} />
                    <span>Stage Action</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Dataset: {supplier.sourceDataset || 'Uploaded'} • Analyzed: {supplier.analyzedAt ? new Date(supplier.analyzedAt).toLocaleString() : 'Recent'}
          </span>
          <button onClick={onClose} className="btn btn-secondary">
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
