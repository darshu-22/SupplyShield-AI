import React from 'react';
import { 
  X, 
  Building2, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Sparkles, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Package,
  FileSearch,
  Sliders,
  Cpu
} from 'lucide-react';
import { RiskBadge, CriticalityBadge } from '../common/Badge';

export function SupplierDetailModal({ 
  supplier, 
  onClose, 
  onOpenAnalysis,
  onOpenEvidence,
  onOpenSimulator,
  onOpenAgentReport 
}) {
  if (!supplier) return null;

  const lots = supplier.inspectionLots || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '860px', maxHeight: '92vh' }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--teal-primary)'
            }}>
              <Building2 size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--teal-primary)',
                  backgroundColor: 'rgba(14, 165, 233, 0.1)',
                  padding: '2px 6px',
                  borderRadius: '3px'
                }}>
                  {supplier.code}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {supplier.name}
                </h3>
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} /> {supplier.facilityLocation}
                </span>
                <span>•</span>
                <span>Annual Spend: {supplier.contractValue}</span>
                <span>•</span>
                <span>{supplier.approvedSuppliersCount} Approved Source{supplier.approvedSuppliersCount > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RiskBadge level={supplier.riskLevel} score={supplier.riskScore} />
            <button 
              onClick={onClose}
              className="btn btn-subtle btn-icon"
              title="Close panel"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Key Metrics 5-Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '10px'
          }}>
            {/* Quality Rejection */}
            <div style={{
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rejection Rate</span>
                <TrendingUp size={14} style={{ color: supplier.rejectionRate > 4 ? 'var(--risk-high-solid)' : 'var(--teal-primary)' }} />
              </div>
              <div className="mono-num" style={{ fontSize: '1.25rem', fontWeight: 700, color: supplier.rejectionRate > 4 ? 'var(--risk-high-text)' : 'var(--text-main)' }}>
                {supplier.rejectionRate}%
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Baseline: {supplier.baselineRejectionRate}% ({supplier.qualityTrend.split(' ')[0]})
              </div>
            </div>

            {/* Price Variance */}
            <div style={{
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Price Variance</span>
                <DollarSign size={14} style={{ color: supplier.priceVariance > 0 ? 'var(--risk-high-solid)' : 'var(--teal-primary)' }} />
              </div>
              <div className="mono-num" style={{ fontSize: '1.25rem', fontWeight: 700, color: supplier.priceVariance > 2 ? 'var(--risk-high-text)' : 'var(--text-main)' }}>
                {supplier.priceVarianceFormatted}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Billed ${supplier.billedUnitCost} vs Cap ${supplier.contractUnitCost}
              </div>
            </div>

            {/* Quality Certificate */}
            <div style={{
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Certificate Expiry</span>
                <Clock size={14} style={{ color: supplier.certificateExpiryDays <= 30 ? 'var(--risk-high-solid)' : 'var(--risk-low-solid)' }} />
              </div>
              <div className="mono-num" style={{ fontSize: '1.25rem', fontWeight: 700, color: supplier.certificateExpiryDays <= 30 ? 'var(--risk-high-text)' : 'var(--text-main)' }}>
                {supplier.certificateExpiryDays} Days
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {supplier.certificateType.split('&')[0]}
              </div>
            </div>

            {/* Stock Coverage */}
            <div style={{
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stock Coverage</span>
                <Package size={14} style={{ color: supplier.stockCoverageDays < 30 ? 'var(--risk-high-solid)' : 'var(--teal-primary)' }} />
              </div>
              <div className="mono-num" style={{ fontSize: '1.25rem', fontWeight: 700, color: supplier.stockCoverageDays < 30 ? 'var(--risk-high-text)' : 'var(--text-main)' }}>
                {supplier.stockCoverageDays} Days
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Target: {supplier.targetSafetyStockDays} days
              </div>
            </div>

            {/* Lead-Time Gap */}
            <div style={{
              backgroundColor: (supplier.leadTimeCoverageGapDays || 0) < 0 ? 'var(--risk-high-bg)' : 'var(--bg-input)',
              border: `1px solid ${(supplier.leadTimeCoverageGapDays || 0) < 0 ? 'var(--risk-high-border)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lead-Time Gap</span>
                <span className="mono-num" style={{ fontSize: '0.75rem', fontWeight: 700, color: (supplier.leadTimeCoverageGapDays || 0) < 0 ? 'var(--risk-high-text)' : 'var(--risk-low-text)' }}>
                  {supplier.leadTimeWeeks}w lead
                </span>
              </div>
              <div className="mono-num" style={{ fontSize: '1.25rem', fontWeight: 700, color: (supplier.leadTimeCoverageGapDays || 0) < 0 ? 'var(--risk-high-text)' : 'var(--risk-low-text)' }}>
                {(supplier.leadTimeCoverageGapDays || 0) > 0 ? `+${supplier.leadTimeCoverageGapDays}d` : `${supplier.leadTimeCoverageGapDays}d`}
              </div>
              <div style={{ fontSize: '0.7rem', color: (supplier.leadTimeCoverageGapDays || 0) < 0 ? 'var(--risk-high-text)' : 'var(--text-secondary)', marginTop: '2px' }}>
                {(supplier.leadTimeCoverageGapDays || 0) < 0 ? 'Stockout deficit' : 'Safe buffer surplus'}
              </div>
            </div>
          </div>

          {/* SVG Quality Inspection Trend Sparkline */}
          {lots.length > 0 && (
            <div style={{
              backgroundColor: 'var(--bg-card-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px 18px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Quality Inspection Trend Across Historical Lots ({lots.length} Batches)
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Visual progression of lot rejection percentages
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: supplier.rejectionRate > 4 ? 'var(--risk-high-text)' : '#86efac', fontWeight: 600 }}>
                  Latest: {supplier.rejectionRate}%
                </div>
              </div>

              {/* Sparkline Visual */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '60px', paddingTop: '10px' }}>
                {lots.map((lot, idx) => {
                  const heightPct = Math.min(100, Math.max(15, (lot.rejectionRatePct / 10) * 100));
                  const isRed = lot.rejectionRatePct >= 5;
                  return (
                    <div key={lot.lotId} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <span className="mono-num" style={{ fontSize: '0.68rem', fontWeight: 700, color: isRed ? 'var(--risk-high-text)' : 'var(--text-secondary)' }}>
                        {lot.rejectionRatePct}%
                      </span>
                      <div 
                        style={{
                          width: '100%',
                          height: `${heightPct}%`,
                          backgroundColor: isRed ? 'var(--risk-high-solid)' : lot.rejectionRatePct > 1 ? 'var(--risk-med-solid)' : 'var(--teal-primary)',
                          borderRadius: '3px 3px 0 0',
                          transition: 'height 0.3s ease'
                        }}
                        title={`Lot ${lot.lotId}: ${lot.rejectionRatePct}% rejections (${lot.rejectedUnits}/${lot.inspectedUnits})`}
                      />
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        B{idx + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Supplied Item Banner */}
          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-card-elevated)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Supplied Component / Assembly
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {supplier.suppliedItem}
              </div>
            </div>
            <CriticalityBadge criticality={supplier.criticality} isSingleSource={supplier.isSingleSource} />
          </div>

          {/* Evidence and Warning Signs */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} style={{ color: 'var(--risk-high-solid)' }} />
                Detected Evidence & Warning Signs ({supplier.warningSigns.length})
              </h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Audited against ERP, QA logs & contract schedules
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {supplier.warningSigns.map((sign) => {
                const isCrit = sign.severity === 'CRITICAL';
                const isHigh = sign.severity === 'HIGH';
                const isMed = sign.severity === 'MEDIUM';

                return (
                  <div 
                    key={sign.id}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isCrit 
                        ? 'var(--risk-high-bg)' 
                        : isHigh 
                        ? 'rgba(244, 63, 94, 0.08)' 
                        : isMed 
                        ? 'var(--risk-med-bg)' 
                        : 'var(--bg-input)',
                      border: `1px solid ${
                        isCrit || isHigh 
                          ? 'var(--risk-high-border)' 
                          : isMed 
                          ? 'var(--risk-med-border)' 
                          : 'var(--border-subtle)'
                      }`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '3px',
                          backgroundColor: isCrit || isHigh ? 'var(--risk-high-solid)' : isMed ? 'var(--risk-med-solid)' : 'var(--teal-primary)',
                          color: '#ffffff'
                        }}>
                          {sign.severity}
                        </span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {sign.title}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={11} /> {sign.detectedDate}
                      </div>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      {sign.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          {onOpenEvidence && (
            <button 
              onClick={() => {
                onClose();
                onOpenEvidence(supplier);
              }} 
              className="btn btn-secondary"
            >
              <FileSearch size={14} style={{ color: 'var(--teal-primary)' }} />
              Evidence Explorer
            </button>
          )}

          {onOpenSimulator && (
            <button 
              onClick={() => {
                onClose();
                onOpenSimulator(supplier);
              }} 
              className="btn btn-secondary"
            >
              <Sliders size={14} style={{ color: 'var(--teal-primary)' }} />
              What-If Simulator
            </button>
          )}

          {onOpenAgentReport && (
            <button 
              onClick={() => {
                onClose();
                onOpenAgentReport(supplier);
              }} 
              className="btn btn-secondary"
            >
              <Cpu size={14} style={{ color: 'var(--teal-primary)' }} />
              Agent Decision Dossier
            </button>
          )}

          <button onClick={onClose} className="btn btn-subtle">
            Close
          </button>
          
          <button 
            onClick={() => {
              onClose();
              if (onOpenAnalysis) onOpenAnalysis(supplier);
            }} 
            className="btn btn-primary"
          >
            <Sparkles size={15} />
            Run Preliminary Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
