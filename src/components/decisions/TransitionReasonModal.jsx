import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { ACTION_STATUS, getStatusLabel } from '../../workflow/actionLifecycleService';

const REJECTION_PRESETS = [
  "Alternative supplier qualified with identical specification",
  "Price variance resolved via formal credit memo from vendor",
  "Commercial dispute settled in contract addendum",
  "Scrap variance within accepted seasonal baseline tolerance",
  "Superseded by comprehensive enterprise vendor renegotiation"
];

const CANCELLATION_PRESETS = [
  "Replaced by newer strategic sourcing initiative",
  "Operational timeline shifted due to program rescheduling",
  "Supplier contract expired without renewal",
  "Duplicate procurement draft identified",
  "Risk mitigated through internal buffer rebalancing"
];

export function TransitionReasonModal({
  isOpen,
  action,
  targetStatus,
  onClose,
  onSubmit
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !action) return null;

  const isReject = targetStatus === ACTION_STATUS.REJECTED;
  const presets = isReject ? REJECTION_PRESETS : CANCELLATION_PRESETS;
  const title = isReject ? 'Reject Action Recommendation' : 'Cancel Procurement Action';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A documented reason is mandatory for governance compliance.');
      return;
    }
    onSubmit(reason.trim());
    setReason('');
    setError('');
  };

  const handleSelectPreset = (presetText) => {
    setReason(presetText);
    setError('');
  };

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
      zIndex: 1100,
      padding: '16px'
    }}>
      <div 
        className="card"
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: isReject ? 'rgba(239, 68, 68, 0.08)' : 'rgba(100, 116, 139, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: isReject ? 'rgba(239, 68, 68, 0.2)' : 'rgba(100, 116, 139, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isReject ? '#f87171' : '#cbd5e1'
            }}>
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                {title}
              </h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {action.id} • {action.supplierCode} ({action.supplierName})
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            marginBottom: '16px',
            backgroundColor: 'var(--bg-input)',
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)'
          }}>
            <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
              Action Title:
            </strong>
            {action.actionTitle}
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Governance mandates a verified justification for transitioning this action to{' '}
            <strong style={{ color: isReject ? '#f87171' : '#cbd5e1' }}>
              {getStatusLabel(targetStatus)}
            </strong>
            . This rationale will be permanently recorded in the append-only audit trail.
          </p>

          {/* Preset Suggestions */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
              Standard Rationale Presets:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {presets.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectPreset(p)}
                  style={{
                    backgroundColor: reason === p ? 'rgba(14, 165, 233, 0.15)' : 'var(--bg-input)',
                    border: `1px solid ${reason === p ? 'var(--teal-primary)' : 'var(--border-subtle)'}`,
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '0.72rem',
                    color: reason === p ? 'var(--teal-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
              Detailed Justification <span style={{ color: '#f87171' }}>*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder={`Enter the operational justification for ${isReject ? 'rejection' : 'cancellation'}...`}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-input)',
                border: `1px solid ${error ? '#ef4444' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                color: 'var(--text-main)',
                fontSize: '0.8125rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none'
              }}
            />
            {error && (
              <div style={{ color: '#f87171', fontSize: '0.72rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={12} />
                {error}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary btn-sm"
            >
              Back / Cancel
            </button>
            <button
              type="submit"
              className={isReject ? "btn btn-danger btn-sm" : "btn btn-primary btn-sm"}
              style={{
                backgroundColor: isReject ? '#dc2626' : '#475569',
                borderColor: isReject ? '#b91c1c' : '#334155',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <CheckCircle2 size={13} />
              Confirm {isReject ? 'Rejection' : 'Cancellation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
