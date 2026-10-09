import React, { useState } from 'react';
import { 
  CheckSquare, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  DollarSign 
} from 'lucide-react';

export function DecisionsView({ 
  actions = [], 
  onApproveAction, 
  onRejectAction,
  onInspectSupplierByCode 
}) {
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredActions = actions.filter(action => {
    if (filterStatus === 'PENDING') return action.status === 'Pending Approval';
    if (filterStatus === 'APPROVED') return action.status === 'Approved';
    if (filterStatus === 'REJECTED') return action.status === 'Rejected';
    return true;
  });

  const pendingCount = actions.filter(a => a.status === 'Pending Approval').length;
  const approvedCount = actions.filter(a => a.status === 'Approved').length;

  return (
    <div>
      {/* View Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckSquare size={20} style={{ color: 'var(--teal-primary)' }} />
            Human-in-the-Loop Decision & Action Pipeline
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Review, validate, and execute proposed commercial and operational interventions prepared for executive sign-off
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', backgroundColor: 'var(--bg-input)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setFilterStatus('ALL')}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: filterStatus === 'ALL' ? 'var(--bg-card-elevated)' : 'transparent',
              color: filterStatus === 'ALL' ? 'var(--teal-primary)' : 'var(--text-secondary)'
            }}
          >
            All Actions ({actions.length})
          </button>
          <button
            onClick={() => setFilterStatus('PENDING')}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: filterStatus === 'PENDING' ? 'var(--bg-card-elevated)' : 'transparent',
              color: filterStatus === 'PENDING' ? 'var(--risk-med-text)' : 'var(--text-secondary)'
            }}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('APPROVED')}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: filterStatus === 'APPROVED' ? 'var(--bg-card-elevated)' : 'transparent',
              color: filterStatus === 'APPROVED' ? '#86efac' : 'var(--text-secondary)'
            }}
          >
            Approved ({approvedCount})
          </button>
        </div>
      </div>

      {/* Decision Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredActions.map((action) => {
          const isPending = action.status === 'Pending Approval';
          const isApproved = action.status === 'Approved';
          const isRejected = action.status === 'Rejected';

          return (
            <div
              key={action.id}
              className="card"
              style={{
                borderLeft: `4px solid ${
                  isApproved 
                    ? '#10b981' 
                    : isRejected 
                    ? 'var(--text-muted)' 
                    : action.urgency === 'CRITICAL' 
                    ? 'var(--risk-high-solid)' 
                    : 'var(--risk-med-solid)'
                }`,
                padding: '20px 24px',
                backgroundColor: 'var(--bg-card)'
              }}
            >
              {/* Header row */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(14, 165, 233, 0.1)',
                    color: 'var(--teal-primary)'
                  }}>
                    {action.supplierCode}
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {action.supplierName}
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '2px 7px',
                    borderRadius: '9999px',
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    {action.category}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: '9999px',
                    backgroundColor: isApproved 
                      ? 'var(--risk-low-bg)' 
                      : isRejected 
                      ? 'rgba(148, 163, 184, 0.15)' 
                      : 'var(--risk-med-bg)',
                    color: isApproved 
                      ? 'var(--risk-low-text)' 
                      : isRejected 
                      ? 'var(--text-secondary)' 
                      : 'var(--risk-med-text)',
                    border: `1px solid ${
                      isApproved 
                        ? 'var(--risk-low-border)' 
                        : isRejected 
                        ? 'var(--border-subtle)' 
                        : 'var(--risk-med-border)'
                    }`
                  }}>
                    {action.status}
                  </span>

                  {action.approvedAt && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Approved: {action.approvedAt}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Title */}
              <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                {action.actionTitle}
              </h3>

              {/* Evidence Summary Box */}
              <div style={{
                backgroundColor: 'var(--bg-input)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                border: '1px solid var(--border-subtle)',
                marginBottom: '14px',
                fontSize: '0.8125rem'
              }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Evidence Rationale:
                </div>
                <div style={{ color: 'var(--text-main)', marginBottom: '6px' }}>
                  {action.evidenceSummary}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                  <strong>Intervention Blueprint:</strong> {action.draftDetails}
                </div>
              </div>

              {/* Impact & Action Controls */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                paddingTop: '10px',
                borderTop: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#38bdf8' }}>
                    <DollarSign size={14} /> <strong>Financial Impact:</strong> {action.financialValue}
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    • {action.riskReductionEstimate}
                  </div>
                </div>

                {/* Interactive Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => onInspectSupplierByCode && onInspectSupplierByCode(action.supplierCode)}
                    className="btn btn-subtle btn-sm"
                    style={{ fontSize: '0.78rem' }}
                  >
                    <FileText size={13} />
                    View Supplier Evidence
                  </button>

                  {isPending && (
                    <>
                      <button
                        onClick={() => onRejectAction && onRejectAction(action.id)}
                        className="btn btn-subtle btn-sm"
                        style={{ fontSize: '0.78rem', color: 'var(--risk-high-text)' }}
                      >
                        <XCircle size={13} />
                        Reject Draft
                      </button>
                      <button
                        onClick={() => onApproveAction && onApproveAction(action.id)}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.78rem' }}
                      >
                        <CheckCircle2 size={13} />
                        Approve Action Draft
                      </button>
                    </>
                  )}

                  {isApproved && (
                    <span style={{ fontSize: '0.78rem', color: '#86efac', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={14} /> Action queued for ERP dispatch
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
