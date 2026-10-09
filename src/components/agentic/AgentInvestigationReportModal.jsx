import React, { useState, useRef } from 'react';
import { 
  X, 
  Cpu, 
  CheckCircle2, 
  FileText, 
  Layers, 
  ListOrdered, 
  Sliders, 
  FileSearch, 
  SendHorizontal,
  ShieldCheck
} from 'lucide-react';
import { orchestrateSupplierDecision } from '../../agents/decisionOrchestrator';
import { RiskBadge, CriticalityBadge } from '../common/Badge';

export function AgentInvestigationReportModal({ 
  supplier, 
  onClose, 
  onOpenEvidence, 
  onOpenSimulator,
  onQueueDecision 
}) {
  const [activeTab, setActiveTab] = useState('decisions');
  const [stagedActionIds, setStagedActionIds] = useState([]);
  const actionCounter = useRef(1);

  if (!supplier) return null;

  // Run the 4-agent orchestration deterministically
  const report = orchestrateSupplierDecision(supplier);
  const { investigation, crossSignals, decisionReview, agentExecutionSummary } = report;

  const handleStageAction = (decision) => {
    if (onQueueDecision) {
      const nextId = `DEC-AGT-${supplier.id}-${actionCounter.current++}`;
      onQueueDecision({
        id: nextId,
        supplierId: supplier.id,
        supplierCode: supplier.code,
        supplierName: supplier.name,
        actionTitle: decision.title,
        category: decision.category,
        urgency: decision.priority === "CRITICAL" ? "CRITICAL" : "HIGH",
        financialValue: decision.expectedImpact?.numericMetric || "Risk Reduction Action",
        evidenceSummary: decision.evidence?.join(' • ') || "Agent validated evidence",
        draftDetails: `${decision.reason} Next step: ${decision.suggestedNextStep}`,
        status: "Pending Approval",
        approvedAt: null,
        riskReductionEstimate: decision.priorityRationale || "Mitigates operational exposure"
      });
      setStagedActionIds(prev => [...prev, decision.recommendationId]);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '980px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ padding: '18px 24px' }}>
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
              boxShadow: '0 0 12px rgba(14, 165, 233, 0.3)'
            }}>
              <Cpu size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: 'var(--teal-primary)',
                  backgroundColor: 'rgba(14, 165, 233, 0.12)',
                  padding: '2px 7px',
                  borderRadius: '4px'
                }}>
                  {supplier.code}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {supplier.name} — Agentic Decision Dossier
                </h3>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Orchestration ID: <span className="mono-num">{report.orchestrationId}</span> • 4 Logical Agents Executed in {report.totalExecutionTimeMs}ms
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <RiskBadge level={supplier.riskLevel} score={supplier.riskScore} />
            <CriticalityBadge tier={supplier.dependencyRecord?.criticalityTier || 'HIGH'} />
            <button onClick={onClose} className="btn btn-subtle btn-icon" title="Close dossier">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Agent Pipeline Telemetry Bar */}
        <div style={{
          backgroundColor: 'var(--bg-input)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '12px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '12px'
        }}>
          {agentExecutionSummary.map((agent, idx) => (
            <div 
              key={agent.agentName}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {idx + 1}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {agent.agentName}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{agent.count} {agent.metricKey}</span>
                  <span style={{ color: '#86efac' }}>✓ {agent.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0 24px',
          backgroundColor: 'var(--bg-card-elevated)',
          gap: '8px'
        }}>
          <button
            onClick={() => setActiveTab('decisions')}
            className={`btn btn-subtle ${activeTab === 'decisions' ? 'tab-active' : ''}`}
            style={{
              padding: '12px 16px',
              borderRadius: 0,
              fontSize: '0.85rem',
              fontWeight: 600,
              borderBottom: activeTab === 'decisions' ? '2px solid var(--teal-primary)' : '2px solid transparent',
              color: activeTab === 'decisions' ? 'var(--text-main)' : 'var(--text-muted)'
            }}
          >
            <ListOrdered size={15} style={{ color: activeTab === 'decisions' ? 'var(--teal-primary)' : 'currentColor' }} />
            Reviewed Decisions & Actions ({decisionReview?.reviewedDecisions?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('crossSignals')}
            className={`btn btn-subtle ${activeTab === 'crossSignals' ? 'tab-active' : ''}`}
            style={{
              padding: '12px 16px',
              borderRadius: 0,
              fontSize: '0.85rem',
              fontWeight: 600,
              borderBottom: activeTab === 'crossSignals' ? '2px solid var(--teal-primary)' : '2px solid transparent',
              color: activeTab === 'crossSignals' ? 'var(--text-main)' : 'var(--text-muted)'
            }}
          >
            <Layers size={15} style={{ color: activeTab === 'crossSignals' ? 'var(--teal-primary)' : 'currentColor' }} />
            Cross-Signal Convergence ({crossSignals?.scenariosDetected?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('investigation')}
            className={`btn btn-subtle ${activeTab === 'investigation' ? 'tab-active' : ''}`}
            style={{
              padding: '12px 16px',
              borderRadius: 0,
              fontSize: '0.85rem',
              fontWeight: 600,
              borderBottom: activeTab === 'investigation' ? '2px solid var(--teal-primary)' : '2px solid transparent',
              color: activeTab === 'investigation' ? 'var(--text-main)' : 'var(--text-muted)'
            }}
          >
            <FileText size={15} style={{ color: activeTab === 'investigation' ? 'var(--teal-primary)' : 'currentColor' }} />
            Investigation Findings ({investigation?.findings?.length || 0})
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {/* TAB 1: REVIEWED DECISIONS & ACTIONS */}
          {activeTab === 'decisions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                backgroundColor: 'rgba(14, 165, 233, 0.08)',
                border: '1px solid rgba(14, 165, 233, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} style={{ color: 'var(--teal-primary)', flexShrink: 0 }} />
                  <span>
                    <strong>Decision Review Agent Audit:</strong> Actions ranked by urgency, evidence robustness, and business exposure. Human sign-off is strictly required prior to execution.
                  </span>
                </div>
              </div>

              {decisionReview?.reviewedDecisions?.map((dec) => {
                const isStaged = stagedActionIds.includes(dec.recommendationId);
                const isCrit = dec.priority === 'CRITICAL';

                return (
                  <div
                    key={dec.recommendationId}
                    className="card"
                    style={{
                      borderLeft: `4px solid ${isCrit ? 'var(--risk-high-solid)' : 'var(--teal-primary)'}`,
                      padding: '18px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          backgroundColor: 'var(--teal-glow)',
                          color: 'var(--teal-primary)',
                          border: '1px solid var(--border-medium)',
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem'
                        }}>
                          #{dec.rank}
                        </span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              color: 'var(--teal-primary)',
                              backgroundColor: 'rgba(14, 165, 233, 0.1)',
                              padding: '1px 6px',
                              borderRadius: '3px'
                            }}>
                              {dec.category}
                            </span>
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              color: dec.evidenceIntegrity.includes('ROBUST') ? '#86efac' : 'var(--text-muted)'
                            }}>
                              • {dec.evidenceIntegrity.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {dec.title}
                          </h4>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: isCrit ? 'var(--risk-high-bg)' : 'var(--risk-med-bg)',
                          color: isCrit ? 'var(--risk-high-text)' : 'var(--risk-med-text)',
                          border: `1px solid ${isCrit ? 'var(--risk-high-border)' : 'var(--risk-med-border)'}`
                        }}>
                          {dec.priority} • {dec.urgency.replace('_', ' ')}
                        </span>
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                          Audit Score: {dec.auditScore}/100
                        </span>
                      </div>
                    </div>

                    {/* Reason */}
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      <strong style={{ color: 'var(--text-main)' }}>Analytical Reason: </strong>
                      {dec.reason}
                    </div>

                    {/* Evidence Points */}
                    <div style={{
                      backgroundColor: 'var(--bg-input)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 14px',
                      fontSize: '0.78rem'
                    }}>
                      <div style={{ color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Supporting Transaction Evidence:
                      </div>
                      <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '3px', color: 'var(--text-secondary)' }}>
                        {dec.evidence?.map((ev, i) => (
                          <li key={i}>{ev}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Expected Impact & Next Step */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px', fontSize: '0.78rem' }}>
                      <div style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.25)',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        <span style={{ color: 'var(--teal-primary)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
                          Expected Business Impact:
                        </span>
                        <span style={{ color: 'var(--text-main)' }}>
                          {dec.expectedImpact?.summary}
                        </span>
                      </div>

                      <div style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.25)',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        <span style={{ color: '#f59e0b', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
                          Suggested Operational Next Step:
                        </span>
                        <span style={{ color: 'var(--text-main)' }}>
                          {dec.suggestedNextStep}
                        </span>
                      </div>
                    </div>

                    {/* Priority Rationale & Action Bar */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '10px',
                      marginTop: '4px',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <span style={{ color: 'var(--teal-light)', fontWeight: 600 }}>Rank Rationale: </span>
                        {dec.priorityRationale}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          color: '#f59e0b',
                          backgroundColor: 'rgba(245, 158, 11, 0.1)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          border: '1px solid rgba(245, 158, 11, 0.25)'
                        }}>
                          Requires Executive Sign-Off
                        </span>

                        <button
                          onClick={() => handleStageAction(dec)}
                          className={`btn btn-sm ${isStaged ? 'btn-secondary' : 'btn-primary'}`}
                          disabled={isStaged}
                          style={{ fontSize: '0.75rem' }}
                        >
                          {isStaged ? (
                            <>
                              <CheckCircle2 size={13} style={{ color: '#10b981' }} /> Staged in Decisions
                            </>
                          ) : (
                            <>
                              <SendHorizontal size={13} /> Stage to Decisions Pipeline
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: CROSS-SIGNAL CONVERGENCE */}
          {activeTab === 'crossSignals' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Cross-Signal Intelligence Agent correlates multi-dimensional telemetry streams into systemic compound risks.
              </p>

              {crossSignals?.scenariosDetected?.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No compound cross-signal hazards detected. Operating parameters nominal.
                </div>
              ) : (
                crossSignals?.scenariosDetected?.map((scenario) => (
                  <div
                    key={scenario.scenarioId}
                    className="card"
                    style={{
                      borderLeft: `4px solid ${scenario.severity === 'CRITICAL' ? 'var(--risk-high-solid)' : 'var(--risk-med-solid)'}`,
                      padding: '18px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--teal-primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                          {scenario.scenarioType.replace(/_/g, ' ')}
                        </span>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                          {scenario.title}
                        </h4>
                      </div>
                      <RiskBadge level={scenario.severity} />
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      <strong style={{ color: 'var(--text-main)' }}>Pattern Detected: </strong>
                      {scenario.detectedPattern}
                    </div>

                    {/* Converging Factors */}
                    <div style={{
                      backgroundColor: 'var(--bg-input)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 14px',
                      fontSize: '0.78rem'
                    }}>
                      <div style={{ color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase' }}>
                        Converging Operational Signals:
                      </div>
                      <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '3px', color: 'var(--text-secondary)' }}>
                        {scenario.convergingFactors?.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#fca5a5', lineHeight: 1.4 }}>
                      <strong>Manufacturing & Business Impact: </strong>
                      {scenario.whyItMatters}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: INVESTIGATION FINDINGS */}
          {activeTab === 'investigation' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Risk Investigation Agent audited {investigation?.findings?.length} operational vectors against source transactions.
              </p>

              {investigation?.findings?.map((finding) => (
                <div
                  key={finding.id}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--teal-primary)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-medium)'
                      }}>
                        {finding.vector}
                      </span>
                      <h5 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {finding.findingTitle}
                      </h5>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <RiskBadge level={finding.severity} />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {finding.evidenceStrength} EVIDENCE
                      </span>
                    </div>
                  </div>

                  <ul style={{ paddingLeft: '18px', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {finding.observedFacts?.map((fact, idx) => (
                      <li key={idx}>{fact}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {onOpenEvidence && (
              <button 
                onClick={() => {
                  onClose();
                  onOpenEvidence(supplier);
                }}
                className="btn btn-secondary btn-sm"
              >
                <FileSearch size={14} style={{ color: 'var(--teal-primary)' }} />
                Explore Evidence Logs
              </button>
            )}

            {onOpenSimulator && (
              <button 
                onClick={() => {
                  onClose();
                  onOpenSimulator(supplier);
                }}
                className="btn btn-secondary btn-sm"
              >
                <Sliders size={14} style={{ color: 'var(--teal-primary)' }} />
                Simulate What-If Mitigation
              </button>
            )}
          </div>

          <button onClick={onClose} className="btn btn-primary btn-sm">
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
