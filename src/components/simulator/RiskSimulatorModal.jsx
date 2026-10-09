import React, { useState, useMemo } from 'react';
import { 
  X, 
  Sliders, 
  RotateCcw, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle2, 
  SendHorizontal
} from 'lucide-react';
import { simulateSupplierRisk } from '../../engine/riskEngine';
import { RiskBadge } from '../common/Badge';

export function RiskSimulatorModal({ supplier, onClose, onStagePlan, onQueueSimulatedAction }) {
  // Simulator parameter state - always called unconditionally at top of component
  const [deliveryDelayDelta, setDeliveryDelayDelta] = useState(0);
  const [rejectionRateDelta, setRejectionRateDelta] = useState(0);
  const [stockCoverageDelta, setStockCoverageDelta] = useState(0);
  const [activateDualSource, setActivateDualSource] = useState(false);
  const [isStaged, setIsStaged] = useState(false);

  // Compute simulated results in real-time
  const simulation = useMemo(() => {
    if (!supplier) return null;
    return simulateSupplierRisk(
      {
        riskScore: supplier.riskScore,
        riskLevel: supplier.riskLevel,
        rejectionRate: supplier.rejectionRate,
        qualityScore: supplier.scoreBreakdown?.quality || 70,
        avgDelayDays: supplier.avgDelayDays || 5,
        deliveryScore: supplier.scoreBreakdown?.delivery || 60,
        stockCoverageDays: supplier.stockCoverageDays || 25,
        priceScore: supplier.scoreBreakdown?.price || 60,
        complianceScore: supplier.scoreBreakdown?.compliance || 70,
        isSingleSource: supplier.isSingleSource
      },
      {
        deliveryDelayDeltaDays: Number(deliveryDelayDelta),
        rejectionRateDeltaPct: Number(rejectionRateDelta),
        stockCoverageDeltaDays: Number(stockCoverageDelta),
        activateDualSource
      }
    );
  }, [supplier, deliveryDelayDelta, rejectionRateDelta, stockCoverageDelta, activateDualSource]);

  if (!supplier || !simulation) return null;

  const handleReset = () => {
    setDeliveryDelayDelta(0);
    setRejectionRateDelta(0);
    setStockCoverageDelta(0);
    setActivateDualSource(false);
    setIsStaged(false);
  };

  const handleStageMitigation = () => {
    const stageFn = onStagePlan || onQueueSimulatedAction;
    if (stageFn) {
      stageFn({
        id: `DEC-SIM-${Date.now()}`,
        supplierId: supplier.id,
        supplierCode: supplier.code,
        supplierName: supplier.shortName,
        actionTitle: `Simulated Intervention: Target -${Math.abs(simulation.scoreDelta)} Risk Points Reduction`,
        category: "Simulated Scenario Plan",
        urgency: simulation.simulatedScore >= 60 ? "HIGH" : "MEDIUM",
        financialValue: "Simulated Risk Optimization",
        evidenceSummary: `Hypothetical adjustment: Rejection ${rejectionRateDelta > 0 ? '+' : ''}${rejectionRateDelta}%, Buffer ${stockCoverageDelta > 0 ? '+' : ''}${stockCoverageDelta}d, Dual-source ${activateDualSource ? 'ON' : 'OFF'}.`,
        draftDetails: `Simulated scenario moves risk score from ${simulation.originalScore} to ${simulation.simulatedScore} (${simulation.originalCategory} -> ${simulation.simulatedCategory}).`,
        status: "Pending Approval",
        approvedAt: null,
        riskReductionEstimate: `${simulation.scoreDelta} points (${simulation.narrative})`
      });
      setIsStaged(true);
    }
  };

  const isScoreLower = simulation.scoreDelta < 0;
  const isScoreHigher = simulation.scoreDelta > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '840px' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(14, 165, 233, 0.35)'
            }}>
              <Sliders size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Interactive What-If Risk Simulator
                </h3>
                <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>
                  Hypothetical Sandbox
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Target: <strong>{supplier.code} ({supplier.shortName})</strong> • Testing supply chain intervention sensitivity
              </div>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-subtle btn-icon">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Simulation disclaimer banner */}
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(14, 165, 233, 0.08)',
            border: '1px solid rgba(14, 165, 233, 0.25)',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div>
              <strong style={{ color: 'var(--teal-primary)' }}>Deterministic Sandbox: </strong>
              Simulated changes are non-destructive and recalculate risk immediately using the core 5-vector engine.
            </div>
            <button 
              onClick={handleReset}
              className="btn btn-subtle btn-sm"
              style={{ fontSize: '0.72rem', color: 'var(--teal-primary)' }}
            >
              <RotateCcw size={12} /> Reset Sliders
            </button>
          </div>

          {/* Comparison Scoreboard */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            backgroundColor: 'var(--bg-card-elevated)',
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Baseline Score
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <span className="mono-num" style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {simulation.originalScore}
                </span>
                <RiskBadge level={simulation.originalCategory} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Simulated Score
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <span className="mono-num" style={{ 
                  fontSize: '1.6rem', 
                  fontWeight: 700, 
                  color: isScoreLower ? '#86efac' : isScoreHigher ? 'var(--risk-high-text)' : 'var(--text-main)' 
                }}>
                  {simulation.simulatedScore}
                </span>
                <RiskBadge level={simulation.simulatedCategory} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Risk Impact Delta
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                {isScoreLower ? (
                  <TrendingDown size={20} style={{ color: '#10b981' }} />
                ) : isScoreHigher ? (
                  <TrendingUp size={20} style={{ color: 'var(--risk-high-solid)' }} />
                ) : null}
                <span className="mono-num" style={{ 
                  fontSize: '1.4rem', 
                  fontWeight: 700, 
                  color: isScoreLower ? '#86efac' : isScoreHigher ? 'var(--risk-high-text)' : 'var(--text-muted)' 
                }}>
                  {simulation.scoreDelta > 0 ? `+${simulation.scoreDelta}` : simulation.scoreDelta} pts
                </span>
              </div>
            </div>
          </div>

          {/* Narrative Explanation */}
          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.82rem',
            lineHeight: 1.45,
            color: 'var(--text-secondary)'
          }}>
            <strong style={{ color: 'var(--text-main)' }}>Diagnostic Impact: </strong>
            {simulation.narrative}
          </div>

          {/* Interactive Sliders Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Slider 1: Rejection Rate Delta */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Quality Rejection Rate Shift
                </label>
                <span className="mono-num" style={{ fontSize: '0.82rem', fontWeight: 700, color: rejectionRateDelta > 0 ? 'var(--risk-high-text)' : rejectionRateDelta < 0 ? '#86efac' : 'var(--text-secondary)' }}>
                  {rejectionRateDelta > 0 ? `+${rejectionRateDelta}%` : `${rejectionRateDelta}%`} (Effective: {Math.max(0, supplier.rejectionRate + Number(rejectionRateDelta)).toFixed(1)}%)
                </span>
              </div>
              <input
                type="range"
                min="-5"
                max="8"
                step="0.5"
                value={rejectionRateDelta}
                onChange={(e) => setRejectionRateDelta(e.target.value)}
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--teal-primary)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span>-5% (Improved CAPA)</span>
                <span>Baseline ({supplier.rejectionRate}%)</span>
                <span>+8% (Severe Tooling Fatigue)</span>
              </div>
            </div>

            {/* Slider 2: Delivery Latency Delta */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Delivery Delay Delta
                </label>
                <span className="mono-num" style={{ fontSize: '0.82rem', fontWeight: 700, color: deliveryDelayDelta > 0 ? 'var(--risk-high-text)' : deliveryDelayDelta < 0 ? '#86efac' : 'var(--text-secondary)' }}>
                  {deliveryDelayDelta > 0 ? `+${deliveryDelayDelta}d delay` : `${deliveryDelayDelta}d faster`}
                </span>
              </div>
              <input
                type="range"
                min="-10"
                max="25"
                step="1"
                value={deliveryDelayDelta}
                onChange={(e) => setDeliveryDelayDelta(e.target.value)}
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--teal-primary)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span>-10d (Dedicated Airfreight)</span>
                <span>Baseline (Current SLA)</span>
                <span>+25d (Severe Port Congestion)</span>
              </div>
            </div>

            {/* Slider 3: Safety Stock Buffer Delta */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Factory Stock Buffer Adjustment
                </label>
                <span className="mono-num" style={{ fontSize: '0.82rem', fontWeight: 700, color: stockCoverageDelta > 0 ? '#86efac' : stockCoverageDelta < 0 ? 'var(--risk-high-text)' : 'var(--text-secondary)' }}>
                  {stockCoverageDelta > 0 ? `+${stockCoverageDelta} days` : `${stockCoverageDelta} days`} (New Buffer: {Math.max(1, supplier.stockCoverageDays + Number(stockCoverageDelta))}d)
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="35"
                step="5"
                value={stockCoverageDelta}
                onChange={(e) => setStockCoverageDelta(e.target.value)}
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--teal-primary)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span>-20d (Buffer Drawdown)</span>
                <span>Baseline ({supplier.stockCoverageDays}d)</span>
                <span>+35d (Strategic Injection)</span>
              </div>
            </div>

            {/* Toggle: Dual Source Activation */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: 'var(--bg-input)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Activate Pre-Qualified Secondary Dual-Source Vendor
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Diversifies 40% PO allocation, eliminating sole-source vulnerability
                </div>
              </div>

              <input
                type="checkbox"
                checked={activateDualSource}
                onChange={(e) => setActivateDualSource(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--teal-primary)' }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          {isStaged && (
            <span style={{ fontSize: '0.78rem', color: '#86efac', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} /> Simulated scenario plan queued to Decisions!
            </span>
          )}
          <button 
            onClick={handleStageMitigation} 
            className="btn btn-secondary"
            disabled={isStaged}
          >
            <SendHorizontal size={14} /> Stage as Decision Plan
          </button>
          <button onClick={onClose} className="btn btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
