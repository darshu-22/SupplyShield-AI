import React from 'react';
import { Bell, AlertTriangle, ArrowRight, X } from 'lucide-react';

export function NotificationDropdown({ 
  warnings = [], 
  isOpen, 
  onToggle, 
  onInspectSupplier 
}) {
  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={onToggle}
        className="btn btn-secondary btn-icon"
        style={{ position: 'relative' }}
        title="View urgent cross-signal alerts"
      >
        <Bell size={16} style={{ color: warnings.length > 0 ? 'var(--teal-primary)' : 'var(--text-muted)' }} />
        {warnings.length > 0 && (
          <span style={{
            position: 'absolute',
            top: '-3px',
            right: '-3px',
            backgroundColor: 'var(--risk-high-solid)',
            color: '#ffffff',
            fontSize: '0.65rem',
            fontWeight: 700,
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 8px rgba(244, 63, 94, 0.6)'
          }}>
            {warnings.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '42px',
          width: '380px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg), var(--shadow-teal)',
          zIndex: 1000,
          overflow: 'hidden',
          animation: 'fadeIn 0.15s ease'
        }}>
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'var(--bg-card-elevated)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={15} style={{ color: 'var(--risk-high-solid)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Urgent Supplier Warnings ({warnings.length})
              </span>
            </div>
            <button onClick={onToggle} className="btn btn-subtle btn-icon" style={{ padding: '2px' }}>
              <X size={15} />
            </button>
          </div>

          <div style={{ maxHeight: '340px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {warnings.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                All supplier telemetry streams nominal.
              </div>
            ) : (
              warnings.map(item => (
                <div 
                  key={item.id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '3px',
                      backgroundColor: item.severity === 'CRITICAL' ? 'var(--risk-high-bg)' : 'var(--risk-med-bg)',
                      color: item.severity === 'CRITICAL' ? 'var(--risk-high-text)' : 'var(--risk-med-text)'
                    }}>
                      {item.severity}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--teal-primary)', fontWeight: 600 }}>
                      {item.supplierCode}
                    </span>
                  </div>

                  <h5 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '3px' }}>
                    {item.title}
                  </h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '6px' }}>
                    {item.whyItMatters || item.detectedPattern}
                  </p>

                  <button
                    onClick={() => {
                      onToggle();
                      if (onInspectSupplier) onInspectSupplier(item.supplier);
                    }}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'var(--teal-primary)',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0
                    }}
                  >
                    Inspect Supporting Records <ArrowRight size={11} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
