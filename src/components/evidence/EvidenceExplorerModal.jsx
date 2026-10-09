import React, { useState } from 'react';
import { 
  X, 
  FileSearch, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  Package, 
  ShieldCheck, 
  Sparkles
} from 'lucide-react';
import { RiskBadge, CertificateBadge } from '../common/Badge';

export function EvidenceExplorerModal({ 
  supplier, 
  initialTab = 'pos', 
  onClose,
  onOpenSimulator 
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!supplier) return null;

  const pos = supplier.purchaseOrders || [];
  const lots = supplier.inspectionLots || [];
  const certs = supplier.complianceRecords || [];
  const inv = supplier.inventoryRecord;
  const dep = supplier.dependencyRecord;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '920px', maxHeight: '92vh' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 10px rgba(14, 165, 233, 0.35)'
            }}>
              <FileSearch size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Evidence Explorer: {supplier.code}
                </h3>
                <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>
                  Audited Transaction Records
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {supplier.name} • {supplier.suppliedItem}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <RiskBadge level={supplier.riskLevel} score={supplier.riskScore} />
            <button onClick={onClose} className="btn btn-subtle btn-icon" title="Close Explorer">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-card-elevated)',
          padding: '0 20px',
          overflowX: 'auto'
        }}>
          {[
            { id: 'pos', label: `Purchase Orders (${pos.length})`, icon: Receipt },
            { id: 'inspections', label: `Dock Inspections (${lots.length})`, icon: CheckCircle2 },
            { id: 'logistics', label: `Delivery Logs (${pos.length})`, icon: Clock },
            { id: 'compliance', label: `Accreditations (${certs.length})`, icon: ShieldCheck },
            { id: 'inventory', label: 'Inventory & Lead Time', icon: Package }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  border: 'none',
                  borderBottom: `2px solid ${isActive ? 'var(--teal-primary)' : 'transparent'}`,
                  backgroundColor: 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={15} style={{ color: isActive ? 'var(--teal-primary)' : 'var(--text-muted)' }} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="modal-body" style={{ padding: '20px 24px' }}>
          {/* TAB 1: PURCHASE ORDERS & OVERPAYMENT */}
          {activeTab === 'pos' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Commercial Invoicing & Price Variance Audit
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Detailed line-item reconciliation of agreed contract pricing vs actual billed invoice unit rates
                  </p>
                </div>
                {supplier.quarterlyOverpaymentExposure > 0 && (
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--risk-high-bg)',
                    border: '1px solid var(--risk-high-border)',
                    textAlign: 'right'
                  }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Cumulative Overpayment
                    </div>
                    <div className="mono-num" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--risk-high-text)' }}>
                      ${supplier.quarterlyOverpaymentExposure.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              <div className="table-responsive-container">
                <table className="custom-table" style={{ fontSize: '0.82rem' }}>
                  <thead>
                    <tr>
                      <th>PO Number</th>
                      <th>Order Date</th>
                      <th>Quantity</th>
                      <th>Contract Unit Rate</th>
                      <th>Billed Unit Rate</th>
                      <th>Variance</th>
                      <th>Line Overpayment</th>
                      <th>Invoice Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pos.map(po => {
                      const hasOverpay = (po.overpaymentTotal || 0) > 0;
                      return (
                        <tr key={po.poId}>
                          <td>
                            <span style={{ fontWeight: 600, color: 'var(--teal-primary)' }}>{po.poId}</span>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{po.paymentNote}</div>
                          </td>
                          <td>{po.orderDate}</td>
                          <td className="mono-num">{po.quantityOrdered?.toLocaleString()}</td>
                          <td className="mono-num">${po.contractUnitPrice?.toFixed(2)}</td>
                          <td className="mono-num" style={{ fontWeight: 600, color: hasOverpay ? 'var(--risk-high-text)' : 'var(--text-main)' }}>
                            ${po.actualBilledUnitPrice?.toFixed(2)}
                          </td>
                          <td className="mono-num" style={{ fontWeight: 700, color: po.variancePct > 0 ? 'var(--risk-high-text)' : po.variancePct < 0 ? 'var(--risk-low-text)' : 'var(--text-secondary)' }}>
                            {po.variancePct > 0 ? `+${po.variancePct}%` : `${po.variancePct}%`}
                          </td>
                          <td className="mono-num" style={{ fontWeight: 700, color: hasOverpay ? 'var(--risk-high-text)' : 'var(--text-muted)' }}>
                            {hasOverpay ? `+$${po.overpaymentTotal.toLocaleString()}` : '$0'}
                          </td>
                          <td>
                            <span style={{
                              fontSize: '0.7rem',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              backgroundColor: po.invoiceStatus.includes('DISPUTED') || po.invoiceStatus.includes('HOLD') ? 'var(--risk-high-bg)' : 'rgba(148, 163, 184, 0.12)',
                              color: po.invoiceStatus.includes('DISPUTED') || po.invoiceStatus.includes('HOLD') ? 'var(--risk-high-text)' : 'var(--text-secondary)',
                              fontWeight: 600
                            }}>
                              {po.invoiceStatus.replace(/_/g, ' ')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: DOCK INSPECTIONS */}
          {activeTab === 'inspections' && (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Quality Control & Incoming Dock Inspection Lots
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Non-Destructive Testing (NDT) logs, defect classification, and rejection rate progression
                </p>
              </div>

              <div className="table-responsive-container">
                <table className="custom-table" style={{ fontSize: '0.82rem' }}>
                  <thead>
                    <tr>
                      <th>Lot Number</th>
                      <th>Inspection Date</th>
                      <th>Inspected Units</th>
                      <th>Rejected Units</th>
                      <th>Defect Rate</th>
                      <th>Defect Category</th>
                      <th>NDT Method</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lots.map(lot => {
                      const isHighDefect = lot.rejectionRatePct >= 5.0;
                      return (
                        <tr key={lot.lotId}>
                          <td>
                            <span style={{ fontWeight: 600, color: 'var(--teal-primary)' }}>{lot.lotId}</span>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Linked {lot.poId}</div>
                          </td>
                          <td>{lot.inspectionDate}</td>
                          <td className="mono-num">{lot.inspectedUnits?.toLocaleString()}</td>
                          <td className="mono-num" style={{ fontWeight: 700, color: lot.rejectedUnits > 0 ? 'var(--risk-high-text)' : 'var(--text-main)' }}>
                            {lot.rejectedUnits?.toLocaleString()}
                          </td>
                          <td>
                            <span className="mono-num" style={{
                              fontWeight: 700,
                              color: isHighDefect ? 'var(--risk-high-text)' : lot.rejectionRatePct > 1 ? 'var(--risk-med-text)' : 'var(--risk-low-text)'
                            }}>
                              {lot.rejectionRatePct}%
                            </span>
                          </td>
                          <td>
                            <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{lot.defectCategory}</span>
                          </td>
                          <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {lot.ndtMethod}
                          </td>
                          <td>
                            <span style={{
                              fontSize: '0.7rem',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              backgroundColor: lot.status.includes('REJECTED') ? 'var(--risk-high-bg)' : lot.status.includes('CONDITIONAL') ? 'var(--risk-med-bg)' : 'var(--risk-low-bg)',
                              color: lot.status.includes('REJECTED') ? 'var(--risk-high-text)' : lot.status.includes('CONDITIONAL') ? 'var(--risk-med-text)' : 'var(--risk-low-text)',
                              fontWeight: 600
                            }}>
                              {lot.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: LOGISTICS & OTIF */}
          {activeTab === 'logistics' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Logistics Fulfillment & On-Time In-Full (OTIF) Log
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Shipment dispatch timestamps, contractual promised dates, and latency tracking
                  </p>
                </div>
                <div style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: supplier.onTimeDeliveryRate < 80 ? 'var(--risk-high-bg)' : 'var(--risk-low-bg)',
                  border: `1px solid ${supplier.onTimeDeliveryRate < 80 ? 'var(--risk-high-border)' : 'var(--risk-low-border)'}`,
                  textAlign: 'right'
                }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Calculated OTIF
                  </div>
                  <div className="mono-num" style={{ fontSize: '1.05rem', fontWeight: 700, color: supplier.onTimeDeliveryRate < 80 ? 'var(--risk-high-text)' : 'var(--risk-low-text)' }}>
                    {supplier.onTimeDeliveryRate}%
                  </div>
                </div>
              </div>

              <div className="table-responsive-container">
                <table className="custom-table" style={{ fontSize: '0.82rem' }}>
                  <thead>
                    <tr>
                      <th>PO Reference</th>
                      <th>Ordered Date</th>
                      <th>SLA Target Date</th>
                      <th>Actual Delivery Date</th>
                      <th>Delay (Days)</th>
                      <th>Delivery Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pos.map(po => {
                      const isDelayed = (po.delayDays || 0) > 0;
                      return (
                        <tr key={po.poId}>
                          <td style={{ fontWeight: 600, color: 'var(--teal-primary)' }}>{po.poId}</td>
                          <td>{po.orderDate}</td>
                          <td>{po.expectedDeliveryDate}</td>
                          <td style={{ fontWeight: 500 }}>{po.actualDeliveryDate || 'In Transit'}</td>
                          <td>
                            <span className="mono-num" style={{
                              fontWeight: 700,
                              color: isDelayed ? 'var(--risk-high-text)' : 'var(--risk-low-text)'
                            }}>
                              {isDelayed ? `+${po.delayDays} days late` : 'On schedule'}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              fontSize: '0.7rem',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              backgroundColor: isDelayed ? 'var(--risk-high-bg)' : 'var(--risk-low-bg)',
                              color: isDelayed ? 'var(--risk-high-text)' : 'var(--risk-low-text)',
                              fontWeight: 600
                            }}>
                              {po.deliveryStatus.replace(/_/g, ' ')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: COMPLIANCE ACCREDITATIONS */}
          {activeTab === 'compliance' && (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Quality Management & Industry Accreditations
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  ISO, AS9100, and IATF certification validity periods, audit records, and recertification status
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {certs.map(cert => {
                  const isExpiring = (cert.daysRemaining || 0) <= 30;
                  return (
                    <div 
                      key={cert.certId}
                      style={{
                        padding: '16px 20px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isExpiring ? 'var(--risk-high-bg)' : 'var(--bg-input)',
                        border: `1px solid ${isExpiring ? 'var(--risk-high-border)' : 'var(--border-subtle)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal-primary)' }}>
                            {cert.certId}
                          </span>
                          <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {cert.certType}
                          </h5>
                          <CertificateBadge status={isExpiring ? 'Expiring Soon' : 'Valid'} expiryDays={cert.daysRemaining} />
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Scope: {cert.scope}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Registrar: <strong>{cert.issuingRegistrar}</strong> • Valid: {cert.effectiveDate} to {cert.expiryDate}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          Days to Expiry
                        </div>
                        <div className="mono-num" style={{ fontSize: '1.4rem', fontWeight: 700, color: isExpiring ? 'var(--risk-high-text)' : 'var(--text-main)' }}>
                          {cert.daysRemaining}d
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: INVENTORY & LEAD TIME GAP */}
          {activeTab === 'inventory' && inv && (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Factory Inventory Reserves & Replenishment Lead-Time Gap
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Comparison of available on-hand buffer against replenishment order lead time
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ backgroundColor: 'var(--bg-input)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>On-Hand Stock</span>
                  <div className="mono-num" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {inv.currentOnHandUnits?.toLocaleString()} {inv.unitOfMeasure}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Daily Consumption: {inv.averageDailyDemandUnits} units/day
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-input)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Stock Coverage</span>
                  <div className="mono-num" style={{ fontSize: '1.25rem', fontWeight: 700, color: inv.stockCoverageDays < 30 ? 'var(--risk-high-text)' : 'var(--text-main)' }}>
                    {inv.stockCoverageDays} Days
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Target Buffer: {inv.targetSafetyStockDays} days
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-input)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Replenishment Lead Time</span>
                  <div className="mono-num" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {inv.replenishmentLeadTimeDays} Days
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    ({Math.round(inv.replenishmentLeadTimeDays / 7)} weeks standard cycle)
                  </div>
                </div>

                <div style={{
                  backgroundColor: inv.leadTimeCoverageGapDays < 0 ? 'var(--risk-high-bg)' : 'var(--risk-low-bg)',
                  padding: '14px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${inv.leadTimeCoverageGapDays < 0 ? 'var(--risk-high-border)' : 'var(--risk-low-border)'}`
                }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lead-Time Coverage Gap</span>
                  <div className="mono-num" style={{ fontSize: '1.25rem', fontWeight: 700, color: inv.leadTimeCoverageGapDays < 0 ? 'var(--risk-high-text)' : 'var(--risk-low-text)' }}>
                    {inv.leadTimeCoverageGapDays > 0 ? `+${inv.leadTimeCoverageGapDays} Days` : `${inv.leadTimeCoverageGapDays} Days`}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: inv.leadTimeCoverageGapDays < 0 ? 'var(--risk-high-text)' : 'var(--risk-low-text)' }}>
                    {inv.leadTimeCoverageGapDays < 0 ? 'Potential stockout before delivery' : 'Adequate buffer coverage'}
                  </div>
                </div>
              </div>

              {dep && (
                <div style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-card-elevated)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.82rem'
                }}>
                  <strong style={{ color: 'var(--text-main)' }}>Sourcing Dependency Matrix: </strong>
                  {dep.isSingleSource ? (
                    <span style={{ color: 'var(--risk-high-text)', fontWeight: 600 }}>
                      Sole approved manufacturing source. Standby vendor ({dep.standbySupplierName}) is {dep.standbySupplierStatus.replace(/_/g, ' ')} with switching lead time of {dep.switchingLeadTimeWeeks} weeks.
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Multi-sourced component ({dep.approvedSourcesCount} approved vendors). Standby vendor ({dep.standbySupplierName}) status is {dep.standbySupplierStatus.replace(/_/g, ' ')}.
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button 
            onClick={() => {
              onClose();
              if (onOpenSimulator) onOpenSimulator(supplier);
            }} 
            className="btn btn-secondary"
          >
            <Sparkles size={15} />
            Simulate What-If Scenario
          </button>
          <button onClick={onClose} className="btn btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
