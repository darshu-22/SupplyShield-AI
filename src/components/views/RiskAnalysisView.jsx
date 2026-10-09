import React from 'react';
import { 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Package, 
  Sparkles
} from 'lucide-react';
import { RiskBadge, CertificateBadge } from '../common/Badge';

export function RiskAnalysisView({ 
  suppliers = [], 
  onInspectSupplier, 
  onAnalyseSupplier 
}) {
  const highAndMedSuppliers = suppliers.filter(s => s.riskLevel === 'HIGH' || s.riskLevel === 'MEDIUM');

  return (
    <div>
      {/* View Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={20} style={{ color: 'var(--risk-high-solid)' }} />
          Multi-Vector Supplier Risk Intelligence
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Detailed root-cause analysis across quality failure trends, unauthorized invoice markups, compliance expirations, and stockout hazards
        </p>
      </div>

      {/* 4 Risk Pillars Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {/* Pillar 1: Quality Defects */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: 'var(--risk-high-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--risk-high-solid)'
            }}>
              <TrendingUp size={16} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Quality & Defect Surge
              </h4>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Incoming inspection rejections</span>
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.45 }}>
            <strong style={{ color: 'var(--risk-high-text)' }}>Supplier A (+3.2% delta)</strong> and <strong style={{ color: 'var(--risk-med-text)' }}>Supplier E (+2.5% delta)</strong> exhibit steep defect escalation caused by tooling wear and porosity.
          </p>
          <div style={{ fontSize: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Apex Castings (A):</span>
              <span className="mono-num" style={{ fontWeight: 700, color: 'var(--risk-high-text)' }}>9.2% (was 6.0%)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Rotary Bearings (E):</span>
              <span className="mono-num" style={{ fontWeight: 700, color: 'var(--risk-med-text)' }}>4.6% (was 2.1%)</span>
            </div>
          </div>
        </div>

        {/* Pillar 2: Price Variance Leakage */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8'
            }}>
              <DollarSign size={16} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Contract Price Variance
              </h4>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Unapproved invoice markups</span>
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.45 }}>
            Total quarterly unapproved spend deviation: <strong style={{ color: '#38bdf8' }}>$127,272</strong>. Driven by unilateral raw material and energy surcharge invoicing.
          </p>
          <div style={{ fontSize: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Supplier A (+7.4%):</span>
              <span className="mono-num" style={{ fontWeight: 700, color: 'var(--risk-high-text)' }}>+$74,000 / qtr</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Supplier F (+5.5%):</span>
              <span className="mono-num" style={{ fontWeight: 700, color: 'var(--risk-high-text)' }}>+$45,100 / qtr</span>
            </div>
          </div>
        </div>

        {/* Pillar 3: Compliance & Expiry */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: 'var(--risk-med-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--risk-med-solid)'
            }}>
              <Clock size={16} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Certificate Expiration
              </h4>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Mandatory AS/ISO audit windows</span>
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.45 }}>
            Two active suppliers are within the 30-day compliance cliff without verified auditor recertification reports submitted.
          </p>
          <div style={{ fontSize: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Supplier A (AS9100):</span>
              <span className="mono-num" style={{ fontWeight: 700, color: 'var(--risk-high-text)' }}>10 Days Remaining</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Supplier E (IATF 16949):</span>
              <span className="mono-num" style={{ fontWeight: 700, color: 'var(--risk-med-text)' }}>20 Days Remaining</span>
            </div>
          </div>
        </div>

        {/* Pillar 4: Continuity & Stockout */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--risk-high-solid)'
            }}>
              <Package size={16} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Stock Depletion & Delays
              </h4>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Days of factory inventory coverage</span>
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.45 }}>
            <strong style={{ color: 'var(--risk-high-text)' }}>Supplier C (14 days)</strong> is below minimum safe threshold. Lead time stretched to 10 weeks; OTIF down to 64.2%.
          </p>
          <div style={{ fontSize: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Supplier C Seals:</span>
              <span className="mono-num" style={{ fontWeight: 700, color: 'var(--risk-high-text)' }}>14 Days (Target 35d)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Supplier A Castings:</span>
              <span className="mono-num" style={{ fontWeight: 700, color: 'var(--risk-high-text)' }}>25 Days (Target 45d)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flagged Supplier Deep-Dive Comparison Section */}
      <div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '14px' }}>
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
                      {supplier.suppliedItem} • {supplier.facilityLocation}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <RiskBadge level={supplier.riskLevel} score={supplier.riskScore} />
                  <CertificateBadge status={supplier.certificateStatus} expiryDays={supplier.certificateExpiryDays} />
                </div>
              </div>

              {/* Warning signals snippet */}
              <div style={{
                backgroundColor: 'var(--bg-input)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                marginBottom: '12px'
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Primary Warning Drivers:
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  onClick={() => onInspectSupplier && onInspectSupplier(supplier)}
                  className="btn btn-secondary btn-sm"
                >
                  Inspect Evidence
                </button>
                <button
                  onClick={() => onAnalyseSupplier && onAnalyseSupplier(supplier)}
                  className="btn btn-primary btn-sm"
                >
                  <Sparkles size={13} />
                  Analyse Supplier
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
