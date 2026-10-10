import React from 'react';
import { Info } from 'lucide-react';
import { SummaryCards } from '../dashboard/SummaryCards';
import { RiskDistribution } from '../dashboard/RiskDistribution';
import { SupplierTable } from '../suppliers/SupplierTable';
import { AgenticIntelligenceSection } from '../agentic/AgenticIntelligenceSection';

export function OverviewView({ 
  suppliers = [], 
  onInspectSupplier, 
  onAnalyseSupplier,
  onOpenEvidence,
  onOpenSimulator,
  onOpenAgentReport,
  onQueueDecision,
  currentRiskFilter,
  onSelectRiskFilter,
  pendingActionsCount,
  onNavigateTab,
  activeDatasetMode = 'demo'
}) {
  const isUploaded = activeDatasetMode === 'uploaded' || (suppliers.length > 0 && suppliers[0]?.isUploaded);

  return (
    <div>
      {/* Dataset Context Banner */}
      <div className="banner-notice" style={{
        borderColor: isUploaded ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)',
        backgroundColor: isUploaded ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card)'
      }}>
        <div className="banner-content">
          <Info size={18} style={{ color: isUploaded ? '#10b981' : 'var(--teal-primary)', flexShrink: 0 }} />
          <div>
            {isUploaded ? (
              <>
                <strong style={{ color: '#10b981' }}>Uploaded Dataset Active:</strong> Analyzing {suppliers.length} imported vendor records. Scores, risk levels, and recommendations are deterministically computed from your source file.
              </>
            ) : (
              <>
                <strong style={{ color: 'var(--text-main)' }}>Demonstration Dataset Active:</strong> Evaluating 5 simulated tier-1 aerospace and automotive suppliers. Upload your own supplier file anytime to analyze your vendors.
              </>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => onNavigateTab && onNavigateTab('import')}
            className="btn btn-subtle btn-sm"
            style={{ fontSize: '0.78rem', color: isUploaded ? '#10b981' : 'var(--teal-primary)' }}
          >
            {isUploaded ? 'Import & Diagnostics →' : 'Import Vendor Data →'}
          </button>
          <button 
            onClick={() => onNavigateTab && onNavigateTab('decisions')}
            className="btn btn-subtle btn-sm"
            style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}
          >
            Action Pipeline →
          </button>
        </div>
      </div>

      {suppliers.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center', marginTop: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
            No Uploaded Suppliers Found
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
            You are currently in Uploaded Dataset mode, but no vendor spreadsheet has been imported yet.
          </p>
          <button 
            onClick={() => onNavigateTab && onNavigateTab('import')}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
          >
            Go to Import & Analyze
          </button>
        </div>
      ) : (
        <>

      {/* Summary KPI Cards */}
      <SummaryCards 
        suppliers={suppliers} 
        pendingActionsCount={pendingActionsCount}
        onSelectRiskFilter={onSelectRiskFilter}
        onNavigateTab={onNavigateTab}
      />

      {/* Risk Distribution & Priority Threat Spotlight */}
      <RiskDistribution 
        suppliers={suppliers} 
        currentRiskFilter={currentRiskFilter}
        onSelectRiskFilter={onSelectRiskFilter}
        onInspectSupplier={onInspectSupplier}
        onOpenSimulator={onOpenSimulator}
      />

      {/* Agentic Intelligence Section */}
      <AgenticIntelligenceSection 
        suppliers={suppliers}
        onInspectSupplier={onInspectSupplier}
        onOpenAgentReport={onOpenAgentReport}
        onQueueDecision={onQueueDecision}
        onNavigateTab={onNavigateTab}
      />

      {/* Main Supplier Registry Table */}
      <div style={{ marginTop: '28px' }}>
        <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Active Supplier Watchlist
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Continuous telemetry monitoring quality variances, price deviations, and compliance expirations
            </p>
          </div>
        </div>

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
    </>
  )}
</div>
);
}
