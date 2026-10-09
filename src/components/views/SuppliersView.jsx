import React, { useState } from 'react';
import { Download, Building2, CheckCircle2 } from 'lucide-react';
import { SupplierTable } from '../suppliers/SupplierTable';

export function SuppliersView({ 
  suppliers = [], 
  onInspectSupplier, 
  onAnalyseSupplier,
  onOpenEvidence,
  onOpenSimulator,
  currentRiskFilter,
  onSelectRiskFilter 
}) {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Real CSV Export Function
  const handleExportCSV = () => {
    const headers = [
      "Supplier Code",
      "Supplier Name",
      "Supplied Item",
      "Category",
      "Risk Level",
      "Risk Score",
      "Rejection Rate (%)",
      "Price Variance (%)",
      "Certificate Status",
      "Expiry Days",
      "Stock Coverage (Days)",
      "Single Source",
      "Annual Spend"
    ];

    const rows = suppliers.map(s => [
      `"${s.code}"`,
      `"${s.name}"`,
      `"${s.suppliedItem}"`,
      `"${s.itemCategory}"`,
      `"${s.riskLevel}"`,
      s.riskScore,
      s.rejectionRate,
      s.priceVariance,
      `"${s.certificateStatus}"`,
      s.certificateExpiryDays,
      s.stockCoverageDays,
      s.isSingleSource ? "YES" : "NO",
      `"${s.contractValue}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SupplyShield_Suppliers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div>
      {/* View Header with Export Action */}
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
            <Building2 size={20} style={{ color: 'var(--teal-primary)' }} />
            Supplier Master Catalog & Audits
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Complete procurement inventory of {suppliers.length} monitored supplier contracts, SLAs, and performance signals
          </p>
        </div>

        {/* Real CSV Export Button */}
        <button 
          onClick={handleExportCSV}
          className="btn btn-secondary btn-sm"
          title="Download filtered supplier database as CSV"
        >
          {downloadSuccess ? (
            <>
              <CheckCircle2 size={14} style={{ color: '#10b981' }} />
              <span>Exported CSV!</span>
            </>
          ) : (
            <>
              <Download size={14} />
              <span>Export Supplier CSV</span>
            </>
          )}
        </button>
      </div>

      {/* Directory Metrics Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px'
        }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Contract Spend
          </span>
          <div className="mono-num" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
            $9.10M / yr
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px'
        }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Sole-Source Suppliers
          </span>
          <div className="mono-num" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--risk-high-text)' }}>
            {suppliers.filter(s => s.isSingleSource).length} (Supplier A)
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px'
        }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Average OTIF Fulfillment
          </span>
          <div className="mono-num" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
            83.8%
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px'
        }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Audits Due &lt;30 Days
          </span>
          <div className="mono-num" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--risk-med-text)' }}>
            2 Suppliers (A, E)
          </div>
        </div>
      </div>

      {/* Main Supplier Table */}
      <SupplierTable 
        suppliers={suppliers}
        onInspectSupplier={onInspectSupplier}
        onAnalyseSupplier={onAnalyseSupplier}
        onOpenEvidence={onOpenEvidence}
        onOpenSimulator={onOpenSimulator}
        externalRiskFilter={currentRiskFilter}
        setExternalRiskFilter={onSelectRiskFilter}
      />
    </div>
  );
}
