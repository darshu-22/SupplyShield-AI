import React from 'react';
import { 
  Menu, 
  RotateCw, 
  AlertTriangle, 
  Sparkles, 
  Search 
} from 'lucide-react';

export function Header({ 
  activeTab, 
  setIsMobileOpen, 
  onRefresh, 
  isLoading, 
  hasError, 
  onToggleError,
  searchQuery,
  setSearchQuery 
}) {
  const getTabMeta = () => {
    switch (activeTab) {
      case 'overview':
        return { title: 'Procurement Risk Intelligence', subtitle: 'Executive overview of multi-tier supplier vulnerabilities and price exposure' };
      case 'suppliers':
        return { title: 'Supplier Master Directory', subtitle: 'Comprehensive vendor catalog with compliance, quality, and contract metrics' };
      case 'risk':
        return { title: 'Deep Risk Analysis', subtitle: 'Root-cause telemetry across quality, pricing, lead time, and single-source dependencies' };
      case 'decisions':
        return { title: 'Decision Pipeline & Actions', subtitle: 'Human-in-the-loop procurement intervention drafts ready for executive review' };
      case 'activity':
        return { title: 'Live Telemetry & Audit Logs', subtitle: 'Immutable chronological event stream of supplier variances and compliance warnings' };
      default:
        return { title: 'SupplyShield AI', subtitle: 'Supplier Risk Intelligence' };
    }
  };

  const { title, subtitle } = getTabMeta();

  return (
    <header style={{
      height: 'var(--header-height)',
      backgroundColor: 'var(--bg-header)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 90,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px'
    }}>
      {/* Left: Mobile hamburger & Titles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="btn btn-secondary btn-icon mobile-toggle-btn"
          title="Open Navigation"
          style={{ display: 'none' }}
        >
          <Menu size={18} />
        </button>

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ 
              fontSize: '1.15rem', 
              fontWeight: 700, 
              color: 'var(--text-main)', 
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {title}
            </h1>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '0.68rem',
              fontWeight: 600,
              backgroundColor: 'rgba(14, 165, 233, 0.12)',
              color: 'var(--teal-primary)',
              border: '1px solid rgba(14, 165, 233, 0.25)',
              letterSpacing: '0.03em'
            }}>
              <Sparkles size={11} /> Phase 1 Local
            </span>
          </div>
          <p style={{ 
            fontSize: '0.78rem', 
            color: 'var(--text-muted)',
            display: 'none',
            whiteSpace: 'nowrap'
          }} className="header-subtitle">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: Controls & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Global Quick Search */}
        <div style={{ position: 'relative', width: '220px' }} className="header-search">
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-text"
            style={{ width: '100%', paddingLeft: '32px', height: '34px', fontSize: '0.8125rem' }}
          />
        </div>

        {/* Simulate Refresh Button */}
        <button 
          onClick={onRefresh}
          className="btn btn-secondary btn-sm"
          disabled={isLoading}
          title="Simulate refreshing telemetry stream and recalculating scores"
        >
          <RotateCw size={13} className={isLoading ? 'spin' : ''} style={{ color: 'var(--teal-primary)' }} />
          <span className="header-btn-label">{isLoading ? 'Refreshing...' : 'Sync Telemetry'}</span>
        </button>

        {/* Test Error State Toggle Button */}
        <button 
          onClick={onToggleError}
          className={`btn btn-sm ${hasError ? 'btn-danger' : 'btn-subtle'}`}
          title="Toggle simulated error state to verify error handling"
          style={{ fontSize: '0.75rem' }}
        >
          <AlertTriangle size={13} style={{ color: hasError ? 'var(--risk-high-solid)' : 'var(--text-muted)' }} />
          <span className="header-btn-label">{hasError ? 'Clear Error' : 'Simulate Error'}</span>
        </button>
      </div>
    </header>
  );
}
