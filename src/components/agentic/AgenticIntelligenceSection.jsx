import React from 'react';
import { 
  Cpu, 
  ShieldAlert, 
  SendHorizontal, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';
import { orchestrateAllSuppliers } from '../../agents/decisionOrchestrator';
import { RiskBadge } from '../common/Badge';

export function AgenticIntelligenceSection({ 
  suppliers = [], 
  onInspectSupplier, 
  onOpenAgentReport,
  onQueueDecision,
  onNavigateTab 
}) {
  // Execute portfolio multi-agent orchestration deterministically
  const portfolioResult = orchestrateAllSuppliers(suppliers);
  const { portfolioRankedDecisions, portfolioRiskRanking } = portfolioResult;

  // Filter top 4 highest risk suppliers requiring attention
  const topRiskySuppliers = portfolioRiskRanking.slice(0, 4);

  // Filter top 4 highest prioritized decisions from Agent D
  const topDecisions = portfolioRankedDecisions.slice(0, 4);

  return (
    <div style={{ marginTop: '24px', marginBottom: '24px' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Cpu size={16} />
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Agentic Decision Intelligence System
            </h2>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: 'var(--teal-primary)',
              backgroundColor: 'rgba(14, 165, 233, 0.12)',
              border: '1px solid rgba(14, 165, 233, 0.25)',
              padding: '2px 8px',
              borderRadius: '9999px',
              letterSpacing: '0.03em'
            }}>
              4 Logical Agents Active
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Deterministic multi-agent workflow: Investigating transactions, correlating cross-signals, drafting interventions, and auditing priorities.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab && onNavigateTab('decisions')}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.78rem' }}
        >
          View Full Decisions Pipeline ({portfolioRankedDecisions.length}) &rarr;
        </button>
      </div>

      {/* 4 Logical Agents Execution Pipeline Status Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        {/* Agent 1 */}
        <div className="card" style={{ padding: '12px 14px', borderLeft: '3px solid #38bdf8' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
              Agent 1 • Audit
            </span>
            <span style={{ fontSize: '0.68rem', color: '#86efac', fontWeight: 600 }}>✓ COMPLETED</span>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Risk Investigation Agent
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Audited {suppliers.length} vendor transaction datasets
          </div>
        </div>

        {/* Agent 2 */}
        <div className="card" style={{ padding: '12px 14px', borderLeft: '3px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
              Agent 2 • Correlate
            </span>
            <span style={{ fontSize: '0.68rem', color: '#86efac', fontWeight: 600 }}>✓ COMPLETED</span>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Cross-Signal Intelligence Agent
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Detected compound systemic hazards
          </div>
        </div>

        {/* Agent 3 */}
        <div className="card" style={{ padding: '12px 14px', borderLeft: '3px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
              Agent 3 • Propose
            </span>
            <span style={{ fontSize: '0.68rem', color: '#86efac', fontWeight: 600 }}>✓ COMPLETED</span>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Procurement Recommendation Agent
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Formulated evidence-grounded action plans
          </div>
        </div>

        {/* Agent 4 */}
        <div className="card" style={{ padding: '12px 14px', borderLeft: '3px solid var(--teal-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal-primary)', textTransform: 'uppercase' }}>
              Agent 4 • Governance
            </span>
            <span style={{ fontSize: '0.68rem', color: '#86efac', fontWeight: 600 }}>✓ COMPLETED</span>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Decision Review Agent
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Ranked {portfolioRankedDecisions.length} actions; mandates human approval
          </div>
        </div>
      </div>

      {/* Main Two-Column Intelligence Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
        gap: '20px'
      }}>
        {/* LEFT COLUMN: Ranked Supplier Risks Requiring Attention */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={18} style={{ color: 'var(--risk-high-solid)' }} />
                Ranked Supplier Risks Requiring Attention
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Prioritized by composite score, component criticality, and buffer deficit
              </span>
            </div>
            <span className="badge badge-high" style={{ fontSize: '0.68rem' }}>
              {topRiskySuppliers.length} Flagged
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            {topRiskySuppliers.map((entry) => {
              const supplierObj = suppliers.find(s => s.id === entry.supplierId);
              const isTop = entry.portfolioRank === 1;

              return (
                <div
                  key={entry.supplierId}
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    border: `1px solid ${isTop ? 'var(--risk-high-border)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: isTop ? 'var(--risk-high-bg)' : 'rgba(14, 165, 233, 0.1)',
                        color: isTop ? 'var(--risk-high-text)' : 'var(--teal-primary)',
                        padding: '1px 6px',
                        borderRadius: '3px'
                      }}>
                        #{entry.portfolioRank}
                      </span>
                      <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>
                        {entry.supplierName} ({entry.supplierCode})
                      </strong>
                    </div>

                    <RiskBadge level={entry.riskLevel} score={entry.riskScore} />
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-main)' }}>Primary Driver: </strong>
                    {entry.topDriver}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '2px' }}>
                    <button
                      onClick={() => onInspectSupplier && supplierObj && onInspectSupplier(supplierObj)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                    >
                      Quick Inspect
                    </button>
                    <button
                      onClick={() => onOpenAgentReport && supplierObj && onOpenAgentReport(supplierObj)}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.72rem', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Cpu size={12} />
                      View Agent Dossier
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Prioritized Agent Recommendations Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} style={{ color: 'var(--teal-primary)' }} />
                Prioritized Action Blueprints (Agent D Audited)
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Evidence-audited interventions ranked by risk reduction and financial exposure
              </span>
            </div>
            <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>
              Requires Human Sign-off
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            {topDecisions.map((decision) => {
              const isCrit = decision.priority === 'CRITICAL';

              return (
                <div
                  key={decision.recommendationId}
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    border: `1px solid ${isCrit ? 'var(--risk-high-border)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--teal-glow)',
                        color: 'var(--teal-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 700
                      }}>
                        #{decision.portfolioRank || decision.rank}
                      </span>
                      <div>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--teal-primary)', textTransform: 'uppercase' }}>
                          {decision.category} • {decision.supplierCode}
                        </div>
                        <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {decision.title}
                        </h4>
                      </div>
                    </div>

                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '3px',
                      backgroundColor: isCrit ? 'var(--risk-high-bg)' : 'var(--risk-med-bg)',
                      color: isCrit ? 'var(--risk-high-text)' : 'var(--risk-med-text)'
                    }}>
                      {decision.urgency.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Impact & Reason snippet */}
                  <div style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.25)',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <strong style={{ color: 'var(--teal-light)' }}>Expected Impact: </strong>
                    {decision.expectedImpact?.summary}
                  </div>

                  {/* Governance Notice & Action Trigger */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '8px',
                    marginTop: '2px'
                  }}>
                    <span style={{ fontSize: '0.7rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} /> Pending Human Approval
                    </span>

                    <button
                      onClick={() => {
                        if (onQueueDecision) {
                          onQueueDecision({
                            id: `DEC-${Date.now()}`,
                            supplierId: decision.supplierId,
                            supplierCode: decision.supplierCode,
                            supplierName: decision.supplierName,
                            actionTitle: decision.title,
                            category: decision.category,
                            urgency: decision.priority === "CRITICAL" ? "CRITICAL" : "HIGH",
                            financialValue: decision.expectedImpact?.numericMetric || "Calculated Risk Reduction",
                            evidenceSummary: decision.evidence?.join(' • ') || "Agent validated evidence",
                            draftDetails: `${decision.reason} Next step: ${decision.suggestedNextStep}`,
                            status: "Pending Approval",
                            approvedAt: null,
                            riskReductionEstimate: decision.priorityRationale || "Mitigates operational exposure"
                          });
                        }
                      }}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.72rem', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <SendHorizontal size={12} />
                      Queue to Decisions Pipeline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
