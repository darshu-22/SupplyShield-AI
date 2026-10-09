import React from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  PlayCircle, 
  Archive, 
  SendHorizontal, 
  DollarSign, 
  ShieldAlert, 
  FileText, 
  Clock, 
  User, 
  CheckSquare
} from 'lucide-react';
import { 
  ACTION_STATUS, 
  getStatusLabel, 
  getStatusStyle, 
  canTransition 
} from '../../workflow/actionLifecycleService';
import { getAuditTrailForAction, getAuditEventStyle } from '../../workflow/auditService';

export function ActionDetailModal({
  isOpen,
  action,
  auditLog = [],
  onClose,
  onTransitionAction,
  onRequestReasonTransition,
  onInspectSupplierByCode
}) {
  if (!isOpen || !action) return null;

  const statusStyle = getStatusStyle(action.status);
  const actionAuditTrail = getAuditTrailForAction(auditLog, action.id);

  const canSubmit = canTransition(action.status, ACTION_STATUS.PENDING_APPROVAL);
  const canApprove = canTransition(action.status, ACTION_STATUS.APPROVED);
  const canReject = canTransition(action.status, ACTION_STATUS.REJECTED);
  const canStartWork = canTransition(action.status, ACTION_STATUS.IN_PROGRESS);
  const canComplete = canTransition(action.status, ACTION_STATUS.COMPLETED);
  const canCancel = canTransition(action.status, ACTION_STATUS.CANCELLED);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1050,
      padding: '16px'
    }}>
      <div 
        className="card"
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-card-elevated)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                color: 'var(--teal-primary)'
              }}>
                {action.id}
              </span>

              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: statusStyle.bg,
                color: statusStyle.text,
                border: `1px solid ${statusStyle.border}`
              }}>
                {getStatusLabel(action.status)}
              </span>

              <span style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-secondary)'
              }}>
                {action.category}
              </span>
            </div>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              {action.actionTitle}
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Supplier & Value Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            backgroundColor: 'var(--bg-input)',
            padding: '14px 16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                Supplier Entity
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <strong style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
                  {action.supplierName} ({action.supplierCode})
                </strong>
                {onInspectSupplierByCode && (
                  <button
                    onClick={() => onInspectSupplierByCode(action.supplierCode)}
                    className="btn btn-subtle btn-sm"
                    style={{ fontSize: '0.7rem', padding: '1px 6px' }}
                  >
                    View Supplier &rarr;
                  </button>
                )}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                Financial Exposure
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#38bdf8', marginTop: '2px', fontWeight: 700 }}>
                <DollarSign size={14} />
                <span>{action.financialValue}</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                Urgency Rating
              </span>
              <span style={{
                display: 'inline-block',
                marginTop: '2px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: action.urgency === 'CRITICAL' ? 'var(--risk-high-text)' : 'var(--risk-med-text)'
              }}>
                {action.urgency || action.priority} URGENCY
              </span>
            </div>
          </div>

          {/* Intervention Blueprint */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckSquare size={14} style={{ color: 'var(--teal-primary)' }} />
              Intervention Action Blueprint
            </h4>
            <div style={{
              backgroundColor: 'var(--bg-input)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5
            }}>
              {action.draftDetails}
            </div>
          </div>

          {/* Evidence Rationale Box */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} style={{ color: 'var(--teal-primary)' }} />
              Underlying Transaction Evidence & Root Cause
            </h4>
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8125rem',
              color: 'var(--text-main)'
            }}>
              {action.evidenceSummary}
              <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <strong>Expected Impact:</strong> {action.riskReductionEstimate}
              </div>
            </div>
          </div>

          {/* Rejection / Cancellation Notice if applicable */}
          {action.rejectionReason && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
              fontSize: '0.8rem',
              color: '#f87171'
            }}>
              <strong style={{ display: 'block', marginBottom: '2px' }}>
                Rejection Rationale ({action.rejectedBy || 'Reviewer'}):
              </strong>
              {action.rejectionReason}
            </div>
          )}

          {action.cancellationReason && (
            <div style={{
              backgroundColor: 'rgba(100, 116, 139, 0.1)',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
              fontSize: '0.8rem',
              color: '#cbd5e1'
            }}>
              <strong style={{ display: 'block', marginBottom: '2px' }}>
                Cancellation Rationale ({action.cancelledBy || 'Operator'}):
              </strong>
              {action.cancellationReason}
            </div>
          )}

          {/* Embedded Audit History Timeline */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} style={{ color: 'var(--teal-primary)' }} />
                Append-Only Action Audit History ({actionAuditTrail.length} Events)
              </h4>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Immutable Local Log
              </span>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-input)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {actionAuditTrail.map((event, idx) => {
                const eventStyle = getAuditEventStyle(event.eventType);
                return (
                  <div 
                    key={event.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      position: 'relative',
                      paddingBottom: idx === actionAuditTrail.length - 1 ? '0' : '10px',
                      borderBottom: idx === actionAuditTrail.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <div style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: eventStyle.bg,
                      color: eventStyle.text,
                      border: `1px solid ${eventStyle.border}`,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      minWidth: '110px',
                      textAlign: 'center'
                    }}>
                      {eventStyle.label}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {event.fromStatus ? `${getStatusLabel(event.fromStatus)} → ` : ''}{getStatusLabel(event.toStatus)}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {new Date(event.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={11} style={{ color: 'var(--text-muted)' }} />
                        {event.actor}
                      </div>

                      {event.reason && (
                        <div style={{ fontSize: '0.72rem', color: '#fde047', marginTop: '3px', fontStyle: 'italic' }}>
                          Note: "{event.reason}"
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer with Permitted Transitions */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-card-elevated)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldAlert size={13} style={{ color: '#f59e0b' }} />
            Approval grants operational permission; real-world ERP modification requires authorized human execution.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {canSubmit && (
              <button
                onClick={() => onTransitionAction(action.id, ACTION_STATUS.PENDING_APPROVAL)}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <SendHorizontal size={13} />
                Submit for Approval
              </button>
            )}

            {canApprove && (
              <button
                onClick={() => onTransitionAction(action.id, ACTION_STATUS.APPROVED)}
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: '#10b981', borderColor: '#059669', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <CheckCircle2 size={13} />
                Approve Action
              </button>
            )}

            {canReject && (
              <button
                onClick={() => onRequestReasonTransition(action, ACTION_STATUS.REJECTED)}
                className="btn btn-subtle btn-sm"
                style={{ color: '#f87171', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <XCircle size={13} />
                Reject Action
              </button>
            )}

            {canStartWork && (
              <button
                onClick={() => onTransitionAction(action.id, ACTION_STATUS.IN_PROGRESS)}
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: '#0ea5e9', borderColor: '#0284c7', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <PlayCircle size={13} />
                Start Work (In Progress)
              </button>
            )}

            {canComplete && (
              <button
                onClick={() => onTransitionAction(action.id, ACTION_STATUS.COMPLETED)}
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: '#a855f7', borderColor: '#9333ea', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <CheckCircle2 size={13} />
                Mark Completed
              </button>
            )}

            {canCancel && (
              <button
                onClick={() => onRequestReasonTransition(action, ACTION_STATUS.CANCELLED)}
                className="btn btn-subtle btn-sm"
                style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <Archive size={13} />
                Cancel Action
              </button>
            )}

            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
