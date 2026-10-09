import React from 'react';
import { ShieldAlert, AlertTriangle, Clock, ArrowRight } from 'lucide-react';

export function RiskDistribution({ 
  suppliers = [], 
  currentRiskFilter, 
  onSelectRiskFilter,
  onInspectSupplier 
}) {
  const highCount = suppliers.filter(s => s.riskLevel === 'HIGH').length;
  const medCount = suppliers.filter(s => s.riskLevel === 'MEDIUM').length;
  const lowCount = suppliers.filter(s => s.riskLevel === 'LOW').length;
  const total = suppliers.length || 1;

  const highPct = Math.round((highCount / total) * 100);
  const medPct = Math.round((medCount / total) * 100);
  const lowPct = Math.round((lowCount / total) * 100);

  const criticalSupplier = suppliers.find(s => s.code === 'Supplier A');

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    }}>
      {/* Risk Distribution Breakdown Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="card-header" style={{ marginBottom: '12px' }}>
            <div>
              <h3 className="card-title">
                <ShieldAlert size={18} style={{ color: 'var(--teal-primary)' }} />
                Supplier Risk Exposure Index
              </h3>
              <p className="card-subtitle">
                Real-time risk scoring across quality, price variance, and certificate status
              </p>
            </div>
            {currentRiskFilter !== 'ALL' && (
              <button 
                onClick={() => onSelectRiskFilter('ALL')}
                className="btn btn-subtle btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                Clear Filter
              </button>
            )}
          </div>

          {/* Segmented Progress Bar */}
          <div style={{
            height: '10px',
            borderRadius: '9999px',
            display: 'flex',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-card-elevated)',
            margin: '16px 0 14px 0'
          }}>
            <div 
              style={{ width: `${highPct}%`, backgroundColor: 'var(--risk-high-solid)', transition: 'width 0.3s ease' }} 
              title={`High Risk: ${highCount} (${highPct}%)`}
            />
            <div 
              style={{ width: `${medPct}%`, backgroundColor: 'var(--risk-med-solid)', transition: 'width 0.3s ease' }} 
              title={`Medium Risk: ${medCount} (${medPct}%)`}
            />
            <div 
              style={{ width: `${lowPct}%`, backgroundColor: 'var(--risk-low-solid)', transition: 'width 0.3s ease' }} 
              title={`Low Risk: ${lowCount} (${lowPct}%)`}
            />
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => onSelectRiskFilter(currentRiskFilter === 'HIGH' ? 'ALL' : 'HIGH')}
              style={{
                flex: 1,
                minWidth: '95px',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid',
                borderColor: currentRiskFilter === 'HIGH' ? 'var(--risk-high-solid)' : 'var(--risk-high-border)',
                backgroundColor: currentRiskFilter === 'HIGH' ? 'rgba(244, 63, 94, 0.25)' : 'var(--risk-high-bg)',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--risk-high-text)', fontWeight: 600 }}>HIGH</span>
                <span className="mono-num" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>{highCount}</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{highPct}% of total</div>
            </button>

            <button
              onClick={() => onSelectRiskFilter(currentRiskFilter === 'MEDIUM' ? 'ALL' : 'MEDIUM')}
              style={{
                flex: 1,
                minWidth: '95px',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid',
                borderColor: currentRiskFilter === 'MEDIUM' ? 'var(--risk-med-solid)' : 'var(--risk-med-border)',
                backgroundColor: currentRiskFilter === 'MEDIUM' ? 'rgba(245, 158, 11, 0.25)' : 'var(--risk-med-bg)',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--risk-med-text)', fontWeight: 600 }}>MEDIUM</span>
                <span className="mono-num" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>{medCount}</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{medPct}% of total</div>
            </button>

            <button
              onClick={() => onSelectRiskFilter(currentRiskFilter === 'LOW' ? 'ALL' : 'LOW')}
              style={{
                flex: 1,
                minWidth: '95px',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid',
                borderColor: currentRiskFilter === 'LOW' ? 'var(--risk-low-solid)' : 'var(--risk-low-border)',
                backgroundColor: currentRiskFilter === 'LOW' ? 'rgba(16, 185, 129, 0.25)' : 'var(--risk-low-bg)',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--risk-low-text)', fontWeight: 600 }}>LOW</span>
                <span className="mono-num" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>{lowCount}</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{lowPct}% of total</div>
            </button>
          </div>
        </div>

        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '12px' }}>
          *Click any category badge above to isolate suppliers in the registry table below.
        </div>
      </div>

      {/* Critical Immediate Risk Spotlight Card */}
      {criticalSupplier && (
        <div 
          className="card" 
          style={{ 
            borderColor: 'var(--risk-high-border)',
            background: 'linear-gradient(145deg, #121c35 0%, #1a1528 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="badge badge-high" style={{ fontSize: '0.72rem' }}>
                <AlertTriangle size={12} /> Imminent Hazard Spotlight
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> T-10d Certificate Expiry
              </span>
            </div>

            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
              {criticalSupplier.code}: {criticalSupplier.shortName}
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              {criticalSupplier.suppliedItem}
            </p>

            {/* Micro-metrics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              backgroundColor: 'rgba(7, 12, 26, 0.65)',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Rejection Rate</div>
                <div className="mono-num" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--risk-high-text)' }}>
                  6% → 9.2%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Price Variance</div>
                <div className="mono-num" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--risk-high-text)' }}>
                  +7.4%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Sole Source</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fca5a5' }}>
                  1 Approved
                </div>
              </div>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginTop: '14px',
            paddingTop: '10px',
            borderTop: '1px solid rgba(244, 63, 94, 0.2)'
          }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Stock: 25d buffer (Gap: -87d)
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {onOpenSimulator && (
                <button 
                  onClick={() => onOpenSimulator(criticalSupplier)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                  title="Simulate What-If intervention"
                >
                  What-If
                </button>
              )}
              <button 
                onClick={() => onInspectSupplier && onInspectSupplier(criticalSupplier)}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '0.78rem' }}
              >
                Inspect Evidence <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
