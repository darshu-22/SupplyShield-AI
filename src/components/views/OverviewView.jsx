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
  onNavigateTab 
}) {
  return (
    <div>
      {/* Simulation Notice Banner */}
      <div className="banner-notice">
        <div className="banner-content">
          <Info size={18} style={{ color: 'var(--teal-primary)', flexShrink: 0 }} />
          <div>
            <strong style={{ color: 'var(--text-main)' }}>Fictional Demonstration Prototype:</strong> All supplier names, contracts, metrics, and price variances are simulated demonstration test data.
          </div>
        </div>
        <button 
          onClick={() => onNavigateTab && onNavigateTab('decisions')}
          className="btn btn-subtle btn-sm"
          style={{ fontSize: '0.78rem', color: 'var(--teal-primary)' }}
        >
          View Action Pipeline &rarr;
        </button>
      </div>

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
    </div>
  );
}
