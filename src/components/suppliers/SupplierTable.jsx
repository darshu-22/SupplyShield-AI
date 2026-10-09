import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  FileText,
  X
} from 'lucide-react';
import { RiskBadge, CertificateBadge } from '../common/Badge';
import { EmptyState } from '../common/StateViews';

export function SupplierTable({ 
  suppliers = [], 
  onInspectSupplier, 
  onAnalyseSupplier,
  externalRiskFilter,
  setExternalRiskFilter 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [certFilter, setCertFilter] = useState('ALL');
  const [sortField, setSortField] = useState('riskScore');
  const [sortAsc, setSortAsc] = useState(false); // Default descending for highest risk first

  // Filter & Search Logic
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(item => {
      // Risk filter
      if (externalRiskFilter && externalRiskFilter !== 'ALL') {
        if (item.riskLevel !== externalRiskFilter) return false;
      }

      // Certificate filter
      if (certFilter === 'EXPIRING') {
        if (item.certificateStatus !== 'Expiring Soon' && item.certificateExpiryDays > 30) return false;
      } else if (certFilter === 'VALID') {
        if (item.certificateStatus !== 'Valid' || item.certificateExpiryDays <= 30) return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesCode = item.code.toLowerCase().includes(query);
        const matchesItem = item.suppliedItem.toLowerCase().includes(query);
        const matchesCategory = item.itemCategory.toLowerCase().includes(query);
        const matchesLocation = item.facilityLocation.toLowerCase().includes(query);
        if (!matchesName && !matchesCode && !matchesItem && !matchesCategory && !matchesLocation) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [suppliers, externalRiskFilter, certFilter, searchTerm, sortField, sortAsc]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // Default to desc when switching to a metric
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCertFilter('ALL');
    if (setExternalRiskFilter) setExternalRiskFilter('ALL');
  };

  const hasActiveFilters = searchTerm !== '' || (externalRiskFilter && externalRiskFilter !== 'ALL') || certFilter !== 'ALL';

  return (
    <div className="card" style={{ padding: '20px' }}>
      {/* Controls Bar: Search & Quick Filters */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '18px'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '420px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by supplier name, item, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-text"
            style={{ width: '100%', paddingLeft: '36px' }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="btn btn-subtle btn-icon"
              style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', padding: '4px' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Risk Level Filter Buttons */}
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-input)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setExternalRiskFilter && setExternalRiskFilter(lvl)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: (externalRiskFilter || 'ALL') === lvl ? 'var(--bg-card-elevated)' : 'transparent',
                  color: (externalRiskFilter || 'ALL') === lvl ? 'var(--teal-primary)' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease'
                }}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Certificate Filter Dropdown */}
          <select
            value={certFilter}
            onChange={(e) => setCertFilter(e.target.value)}
            className="select-custom"
            style={{ fontSize: '0.8125rem', padding: '6px 10px' }}
          >
            <option value="ALL">All Certificates</option>
            <option value="EXPIRING">Expiring &lt;30d</option>
            <option value="VALID">Valid / Verified</option>
          </select>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="btn btn-subtle btn-sm"
              style={{ fontSize: '0.78rem' }}
              title="Reset all search filters"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Filter summary status line */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        fontSize: '0.78rem', 
        color: 'var(--text-muted)', 
        marginBottom: '12px',
        padding: '0 4px'
      }}>
        <div>
          Showing <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{filteredSuppliers.length}</span> of {suppliers.length} demonstration suppliers
          {externalRiskFilter && externalRiskFilter !== 'ALL' && ` • Filtered by Risk: ${externalRiskFilter}`}
          {certFilter !== 'ALL' && ` • Cert: ${certFilter}`}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>Sorted by:</span>
          <span style={{ color: 'var(--teal-primary)', fontWeight: 600 }}>
            {sortField === 'riskScore' ? 'Risk Severity' : sortField === 'priceVariance' ? 'Price Variance' : sortField === 'stockCoverageDays' ? 'Stock Days' : sortField}
          </span>
          <span>({sortAsc ? 'Asc' : 'Desc'})</span>
        </div>
      </div>

      {/* Main Table or Empty State */}
      {filteredSuppliers.length === 0 ? (
        <EmptyState 
          title="No suppliers match filter criteria" 
          message="No active demonstration suppliers matched your search query or risk filters. Try clearing your search parameters."
          onReset={handleResetFilters}
        />
      ) : (
        <div className="table-responsive-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('code')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Supplier <ArrowUpDown size={12} />
                  </div>
                </th>
                <th>Supplied Item</th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('riskScore')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Risk Level <ArrowUpDown size={12} />
                  </div>
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('rejectionRate')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Quality Trend <ArrowUpDown size={12} />
                  </div>
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('priceVariance')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Price Variance <ArrowUpDown size={12} />
                  </div>
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('certificateExpiryDays')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Certificate <ArrowUpDown size={12} />
                  </div>
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('stockCoverageDays')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Stock Coverage <ArrowUpDown size={12} />
                  </div>
                </th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier) => {
                const hasPriceSurge = supplier.priceVariance > 2.0;

                return (
                  <tr key={supplier.id}>
                    {/* Supplier Name & Code */}
                    <td>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ 
                            fontSize: '0.72rem', 
                            fontWeight: 700, 
                            color: 'var(--teal-primary)', 
                            backgroundColor: 'rgba(14, 165, 233, 0.1)',
                            padding: '1px 6px',
                            borderRadius: '3px'
                          }}>
                            {supplier.code}
                          </span>
                          <span 
                            onClick={() => onInspectSupplier && onInspectSupplier(supplier)}
                            style={{ 
                              fontWeight: 600, 
                              color: 'var(--text-main)', 
                              cursor: 'pointer',
                              textDecoration: 'none'
                            }}
                            onMouseEnter={(e) => e.target.style.color = 'var(--teal-primary)'}
                            onMouseLeave={(e) => e.target.style.color = 'var(--text-main)'}
                            title="Click to view full supplier evidence"
                          >
                            {supplier.shortName}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{supplier.facilityLocation}</span>
                          {supplier.isSingleSource && (
                            <span style={{ color: 'var(--risk-high-text)', fontWeight: 600 }}>
                              • Sole Source
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Supplied Item */}
                    <td style={{ maxWidth: '240px' }}>
                      <div style={{ 
                        fontSize: '0.8125rem', 
                        color: 'var(--text-main)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }} title={supplier.suppliedItem}>
                        {supplier.suppliedItem}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {supplier.itemCategory}
                      </div>
                    </td>

                    {/* Risk Level Badge */}
                    <td>
                      <RiskBadge level={supplier.riskLevel} score={supplier.riskScore} />
                    </td>

                    {/* Quality Trend */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {supplier.rejectionRate > supplier.baselineRejectionRate ? (
                          <TrendingUp size={14} style={{ color: 'var(--risk-high-solid)', flexShrink: 0 }} />
                        ) : (
                          <ShieldCheck size={14} style={{ color: 'var(--risk-low-solid)', flexShrink: 0 }} />
                        )}
                        <span className="mono-num" style={{ 
                          fontWeight: 600, 
                          color: supplier.rejectionRate > 4 ? 'var(--risk-high-text)' : 'var(--text-main)' 
                        }}>
                          {supplier.rejectionRate}%
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {supplier.qualityTrend}
                      </div>
                    </td>

                    {/* Price Variance */}
                    <td>
                      <div className="mono-num" style={{ 
                        fontWeight: 700,
                        color: hasPriceSurge ? 'var(--risk-high-text)' : supplier.priceVariance < 0 ? 'var(--risk-low-text)' : 'var(--text-secondary)'
                      }}>
                        {supplier.priceVarianceFormatted}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {supplier.quarterlyOverpaymentExposure > 0 
                          ? `+$${(supplier.quarterlyOverpaymentExposure / 1000).toFixed(0)}k/qtr` 
                          : 'On Contract'}
                      </div>
                    </td>

                    {/* Certificate Status */}
                    <td>
                      <CertificateBadge status={supplier.certificateStatus} expiryDays={supplier.certificateExpiryDays} />
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {supplier.certificateType.split('&')[0]}
                      </div>
                    </td>

                    {/* Stock Coverage */}
                    <td>
                      <div className="mono-num" style={{ 
                        fontWeight: 700,
                        color: supplier.stockCoverageDays < 20 ? 'var(--risk-high-text)' : supplier.stockCoverageDays < 30 ? 'var(--risk-med-text)' : 'var(--text-main)'
                      }}>
                        {supplier.stockCoverageDays} Days
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {supplier.stockStatus.split('(')[0]}
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {/* Inspect Details button */}
                        <button
                          onClick={() => onInspectSupplier && onInspectSupplier(supplier)}
                          className="btn btn-secondary btn-sm"
                          title="View supplier evidence & warnings"
                        >
                          <FileText size={13} />
                          <span>Inspect</span>
                        </button>

                        {/* Analyse Supplier button */}
                        <button
                          onClick={() => onAnalyseSupplier && onAnalyseSupplier(supplier)}
                          className="btn btn-primary btn-sm"
                          title="Open preliminary rule-based diagnostic analysis"
                        >
                          <Sparkles size={13} />
                          <span>Analyse</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
