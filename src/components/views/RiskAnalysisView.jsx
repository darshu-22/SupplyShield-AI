import React, { useState } from 'react';
import { 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Package, 
  Sparkles,
  Sliders,
  FileSearch,
  ShieldAlert,
  Layers
} from 'lucide-react';
import { RiskBadge, CertificateBadge } from '../common/Badge';

export function RiskAnalysisView({ 
  suppliers = [], 
  onInspectSupplier, 
  onAnalyseSupplier,
  onOpenEvidence,
  onOpenSimulator 
}) {
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  // Collect all cross-signal warnings across suppliers
  const allCrossSignals = suppliers.flatMap(s => 
    (s.crossSignalWarnings || []).map(w => ({
      ...w,
      supplier: s
    }))
  );

  const filteredCrossSignals = filterSeverity === 'ALL'
    ? allCrossSignals
    : allCrossSignals.filter(w => w.severity === filterSeverity);

  const highAndMedSuppliers = suppliers.filter(s => s.riskLevel === 'HIGH' || s.riskLevel === 'MEDIUM');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* View Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={22} style={{ color: 'var(--risk-high-solid)' }} />
            Multi-Vector Risk Intelligence & Cross-Signal Engine
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Deterministic 5-vector evaluation combined with multi-signal hazard correlation across quality, pricing, delivery, compliance, and stock continuity.
          </p>
        </div>
      </div>

      {/* 4 Risk Pillars Grid with Calculated Totals */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '16px'
      }}>
        {/* Pillar 1: Quality Defects */}
        <div className="card" style={{ borderTop: '3px solid var(--risk-high-solid)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--risk-high-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--risk-high-solid)'
            }}>
              <TrendingUp size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Quality & Defect Surge
              </h4>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Incoming inspection rejection rate</span>
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.45 }}>
            <strong style={{ color: 'var(--risk-high-text)' }}>Apex Castings (9.2%)</strong> and <strong style={{ color: 'var(--risk-med-text)' }}>Rotary Bearings (4.6%)</strong> exhibit acute defect escalation above contract thresholds.
          </p>
          <div style={{ fontSize: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Apex Castings:</span>
              <span className="mono-num" style={{ fontWeight: 700, color: 'var(--risk-high-text)' }}>9.2% defect rate</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Rotary Bearings:</span>
              <span className="mono-num" style={{ fontWeight: 700, color: 'var(--risk-med-text)' }}>4.6% defect rate</span>
            </div>
          </div>
        </div>

        {/* Pillar 2: Price Variance Leakage */}
        <div className="card" style={{ borderTop: '3px solid #38bdf8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8'
            }}>
              <DollarSign size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Contract Price Variance
              </h4>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Unapproved invoice billing overages</span>
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.45 }}>
            Audited financial exposure: <strong style={{ color: '#38bdf8' }}>$127,272</strong> across unapproved raw material surcharges on repeated PO lines.
          </p>
          <div style={{ fontSize: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Apex Castings (+7.4%):</span>
              <span className="mono-num" style={{ fontWeight: 700, color: 'var(--risk-high-text)' }}>+$74,000 billed</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Kinetic Dynamics (+5.5%):</span>
              <span className="mono-num" style={{ fontWeight: 700, color: 'var(--risk-high-text)' }}>+$45,100 billed</span>
            </div>
          </div>
        </div>

        {/* Pillar 3: Compliance & Expiry */}
        <div className="card" style={{ borderTop: '3px solid var(--risk-med-solid)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--risk-med-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--risk-med-solid)'
            }}>
              <Clock size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Compliance & Expiry Cliff
              </h4>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Mandatory aerospace & auto certifications</span>
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.45 }}>
            Two key suppliers inside the 30-day compliance expiry cliff without registrar recertification documents confirmed.
          </p>
          <div style={{ fontSize: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Apex (AS9100 Rev D):</span>
              <span className="mono-num" style={{ fontWeight: 700, color: 'var(--risk-high-text)' }}>10 Days Left</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Rotary (IATF 16949):</span>
              <span className="mono-num" style={{ fontWeight: 700, color: 'var(--risk-med-text)' }}>20 Days Left</span>
            </div>
          </div>
        </div>

        {/* Pillar 4: Continuity & Stockout */}
        <div className="card" style={{ borderTop: '3px solid #f87171' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--risk-high-solid)'
            }}>
              <Package size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Stock Depletion & Delays
              </h4>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Factory stock coverage vs replenishment lead time</span>
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.45 }}>
            <strong style={{ color: 'var(--risk-high-text)' }}>HydroTech (14d coverage)</strong> and <strong style={{ color: 'var(--risk-high-text)' }}>Apex (25d coverage)</strong> are operating under severe negative lead-time gaps.
          </p>
          <div style={{ fontSize: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>HydroTech Seals:</span>
              <span className="mono-num" style={{ fontWeight: 700, color: 'var(--risk-high-text)' }}>-56d Gap (14d on-hand)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Apex Castings:</span>
              <span className="mono-num" style={{ fontWeight: 700, color: 'var(--risk-high-text)' }}>-87d Gap (25d on-hand)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Signal Intelligence Section */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} style={{ color: 'var(--teal-primary)' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Cross-Signal Intelligence Correlations
              </h3>
              <span style={{
                fontSize: '0.75rem',
                backgroundColor: 'rgba(14, 165, 233, 0.15)',
                color: 'var(--teal-primary)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: 600
              }}>
                {filteredCrossSignals.length} Active Correlated Scenarios
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Multi-signal triggers connecting isolated telemetry streams into compound systemic operational risks.
            </p>
          </div>

          {/* Severity Filter */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(sev => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`btn btn-sm ${filterSeverity === sev ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.72rem', padding: '4px 10px' }}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Cross Signal Warning Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
          {filteredCrossSignals.map((warning) => {
            const isCrit = warning.severity === 'CRITICAL';
            return (
              <div
                key={warning.id}
                style={{
                  backgroundColor: 'var(--bg-input)',
                  border: `1px solid ${isCrit ? 'var(--risk-high-border)' : 'var(--risk-med-border)'}`,
                  borderLeft: `4px solid ${isCrit ? 'var(--risk-high-solid)' : 'var(--risk-med-solid)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: 'var(--teal-primary)',
                        backgroundColor: 'rgba(14, 165, 233, 0.1)',
                        padding: '1px 6px',
                        borderRadius: '4px'
                      }}>
                        {warning.supplier?.code}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {warning.supplier?.name}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {warning.title}
                    </h4>
                  </div>
                  <RiskBadge level={warning.severity} />
                </div>

                {/* What Was Detected */}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  <strong style={{ color: 'var(--text-main)' }}>What Was Detected: </strong>
                  {warning.detectedPattern}
                </div>

                {/* Supporting Data Pill Box */}
                {warning.supportingData && (
                  <div style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.25)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '6px'
                  }}>
                    {Object.entries(warning.supportingData).map(([key, val]) => (
                      <div key={key}>
                        <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:{' '}
                        </span>
                        <strong className="mono-num" style={{ color: 'var(--teal-light)' }}>
                          {val}
                        </strong>
                      </div>
                    ))}
                  </div>
                )}

                {/* Why It Matters */}
                <div style={{ fontSize: '0.78rem', color: '#fca5a5', lineHeight: 1.4 }}>
                  <strong>Operational Impact: </strong>
                  {warning.whyItMatters}
                </div>

                {/* Suggested Investigation */}
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  <strong style={{ color: 'var(--text-main)' }}>Investigation Plan: </strong>
                  {warning.recommendedInvestigation}
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: '8px',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '10px',
                  marginTop: 'auto'
                }}>
                  <button
                    onClick={() => onOpenEvidence && onOpenEvidence(warning.supplier)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <FileSearch size={13} />
                    Evidence Explorer
                  </button>
                  <button
                    onClick={() => onOpenSimulator && onOpenSimulator(warning.supplier)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--teal-primary)' }}
                  >
                    <Sliders size={13} />
                    What-If
                  </button>
                  <button
                    onClick={() => onAnalyseSupplier && onAnalyseSupplier(warning.supplier)}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Sparkles size={13} />
                    Analyse
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Flagged Supplier Deep-Dive Comparison Section */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} style={{ color: 'var(--risk-high-solid)' }} />
          Elevated Risk Supplier Diagnostics ({highAndMedSuppliers.length})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {highAndMedSuppliers.map((supplier) => (
            <div 
              key={supplier.id}
              className="card"
              style={{
                borderColor: supplier.riskLevel === 'HIGH' ? 'var(--risk-high-border)' : 'var(--risk-med-border)',
                padding: '18px 20px'
              }}
            >
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--teal-primary)',
                    backgroundColor: 'rgba(14, 165, 233, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    {supplier.code}
                  </span>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {supplier.name}
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {supplier.suppliedItem} • {supplier.facilityLocation} • {supplier.isSingleSource ? 'Sole Source' : `${supplier.approvedSuppliersCount} Approved Sources`}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <RiskBadge level={supplier.riskLevel} score={supplier.riskScore} />
                  <CertificateBadge status={supplier.certificateStatus} expiryDays={supplier.certificateExpiryDays} />
                </div>
              </div>

              {/* Vector Score Breakdown Bar */}
              <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '6px',
                padding: '10px 14px',
                marginBottom: '14px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '10px'
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Quality (25%)</div>
                  <div className="mono-num" style={{ fontWeight: 700, fontSize: '0.88rem', color: supplier.scoreBreakdown?.quality > 60 ? 'var(--risk-high-text)' : 'var(--text-main)' }}>
                    {supplier.scoreBreakdown?.quality || 0}/100 ({supplier.rejectionRate}% def)
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Price (20%)</div>
                  <div className="mono-num" style={{ fontWeight: 700, fontSize: '0.88rem', color: supplier.scoreBreakdown?.price > 60 ? 'var(--risk-high-text)' : 'var(--text-main)' }}>
                    {supplier.scoreBreakdown?.price || 0}/100 (+{supplier.priceVariance}%)
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Delivery (20%)</div>
                  <div className="mono-num" style={{ fontWeight: 700, fontSize: '0.88rem', color: supplier.scoreBreakdown?.delivery > 60 ? 'var(--risk-high-text)' : 'var(--text-main)' }}>
                    {supplier.scoreBreakdown?.delivery || 0}/100 ({supplier.onTimeDeliveryRate}% OTIF)
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Compliance (15%)</div>
                  <div className="mono-num" style={{ fontWeight: 700, fontSize: '0.88rem', color: supplier.scoreBreakdown?.compliance > 60 ? 'var(--risk-high-text)' : 'var(--text-main)' }}>
                    {supplier.scoreBreakdown?.compliance || 0}/100 ({supplier.certificateExpiryDays}d left)
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Continuity (20%)</div>
                  <div className="mono-num" style={{ fontWeight: 700, fontSize: '0.88rem', color: supplier.scoreBreakdown?.continuity > 60 ? 'var(--risk-high-text)' : 'var(--text-main)' }}>
                    {supplier.scoreBreakdown?.continuity || 0}/100 ({supplier.stockCoverageDays}d stock)
                  </div>
                </div>
              </div>

              {/* Warning signals snippet */}
              <div style={{
                backgroundColor: 'var(--bg-input)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                marginBottom: '14px'
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Audited Signal Evidence:
                </div>
                <ul style={{ paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {supplier.warningSigns.slice(0, 2).map((sign) => (
                    <li key={sign.id}>
                      <strong style={{ color: 'var(--text-main)' }}>{sign.title}:</strong> {sign.detail}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => onInspectSupplier && onInspectSupplier(supplier)}
                  className="btn btn-secondary btn-sm"
                >
                  Quick Inspect
                </button>
                <button
                  onClick={() => onOpenEvidence && onOpenEvidence(supplier)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <FileSearch size={14} />
                  Evidence Explorer
                </button>
                <button
                  onClick={() => onOpenSimulator && onOpenSimulator(supplier)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--teal-primary)' }}
                >
                  <Sliders size={14} />
                  What-If Simulator
                </button>
                <button
                  onClick={() => onAnalyseSupplier && onAnalyseSupplier(supplier)}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <Sparkles size={14} />
                  Analyse Deep-Dive
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
