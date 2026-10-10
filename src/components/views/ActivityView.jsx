import React, { useState } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Search 
} from 'lucide-react';

export function ActivityView({ logs = [], onInspectSupplierByCode }) {
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [query, setQuery] = useState('');

  const filteredLogs = logs.filter(log => {
    if (severityFilter !== 'ALL' && log.severity !== severityFilter) {
      return false;
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      const matchMsg = log.message.toLowerCase().includes(q);
      const matchType = log.eventType.toLowerCase().includes(q);
      const matchSupp = log.supplierName.toLowerCase().includes(q);
      if (!matchMsg && !matchType && !matchSupp) return false;
    }
    return true;
  });

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
            <Activity size={20} style={{ color: 'var(--teal-primary)' }} />
            Telemetry & Governance Audit Stream
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Audited event stream tracking automated ERP invoice comparisons, dock inspection records, and governance actions
          </p>
        </div>

        {/* Search & Severity filter pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search event logs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-text"
              style={{ width: '100%', paddingLeft: '32px', height: '32px', fontSize: '0.78rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              style={{
                padding: '5px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid',
                borderColor: severityFilter === sev ? 'var(--teal-primary)' : 'var(--border-subtle)',
                backgroundColor: severityFilter === sev ? 'var(--bg-card-elevated)' : 'transparent',
                color: severityFilter === sev ? 'var(--teal-primary)' : 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {sev}
            </button>
          ))}
          </div>
        </div>
      </div>

      {/* Timeline Stream Container */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {filteredLogs.map((log) => {
            const isCrit = log.severity === 'CRITICAL';
            const isHigh = log.severity === 'HIGH';
            const isMed = log.severity === 'MEDIUM';

            return (
              <div 
                key={log.id}
                style={{
                  display: 'flex',
                  gap: '14px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid var(--border-subtle)'
                }}
              >
                {/* Status Dot / Icon */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: isCrit 
                    ? 'var(--risk-high-bg)' 
                    : isHigh 
                    ? 'rgba(244, 63, 94, 0.1)' 
                    : isMed 
                    ? 'var(--risk-med-bg)' 
                    : 'var(--risk-low-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isCrit || isHigh 
                    ? 'var(--risk-high-solid)' 
                    : isMed 
                    ? 'var(--risk-med-solid)' 
                    : 'var(--risk-low-solid)',
                  flexShrink: 0
                }}>
                  {isCrit || isHigh ? (
                    <AlertTriangle size={16} />
                  ) : isMed ? (
                    <Clock size={16} />
                  ) : (
                    <ShieldCheck size={16} />
                  )}
                </div>

                {/* Event Details */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {log.eventType}
                      </span>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '3px',
                        backgroundColor: 'rgba(14, 165, 233, 0.1)',
                        color: 'var(--teal-primary)'
                      }}>
                        {log.supplierCode}: {log.supplierName}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {log.timestamp}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '6px' }}>
                    {log.message}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Source: {log.source}
                    </span>

                    <button
                      onClick={() => onInspectSupplierByCode && onInspectSupplierByCode(log.supplierCode)}
                      className="btn btn-subtle btn-sm"
                      style={{ fontSize: '0.72rem', padding: '2px 6px', color: 'var(--teal-primary)' }}
                    >
                      Inspect Evidence &rarr;
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
