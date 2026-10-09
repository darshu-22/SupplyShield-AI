/**
 * SupplyShield AI — Decision Orchestrator (Phase 3)
 * 
 * Central multi-agent coordinator that deterministically executes the 4 logical agents:
 * 1. Risk Investigation Agent
 * 2. Cross-Signal Intelligence Agent
 * 3. Procurement Recommendation Agent
 * 4. Decision Review Agent
 * 
 * Produces structured, explainable decision dossiers with audit trails and human governance.
 */

import { runRiskInvestigationAgent } from './riskInvestigationAgent.js';
import { runCrossSignalAgent } from './crossSignalAgent.js';
import { runProcurementRecommendationAgent } from './procurementRecommendationAgent.js';
import { runDecisionReviewAgent } from './decisionReviewAgent.js';

/**
 * Orchestrate a complete decision workflow for a single supplier.
 * Pure, deterministic execution based on transactional records.
 */
export function orchestrateSupplierDecision(supplier) {
  const orchestrateStart = Date.now();

  if (!supplier) {
    return {
      orchestrationId: `ORCH-ERR-${Date.now()}`,
      status: "FAILED",
      error: "No supplier record provided to orchestrator",
      agentExecutionSummary: [],
      timestamp: new Date().toISOString()
    };
  }

  // Step 1: Execute Risk Investigation Agent
  const investigationResult = runRiskInvestigationAgent(supplier);

  // Step 2: Execute Cross-Signal Intelligence Agent
  const crossSignalResult = runCrossSignalAgent(investigationResult, supplier);

  // Step 3: Execute Procurement Recommendation Agent
  const recommendationResult = runProcurementRecommendationAgent(investigationResult, crossSignalResult, supplier);

  // Step 4: Execute Decision Review Agent
  const decisionReviewResult = runDecisionReviewAgent(recommendationResult, investigationResult, crossSignalResult);

  // Step 5: Synthesize Execution Summary
  const agentExecutionSummary = [
    {
      agentName: "Risk Investigation Agent",
      status: investigationResult.status,
      executionTimeMs: investigationResult.executionTimeMs || 0,
      metricKey: "Findings",
      count: investigationResult.findings?.length || 0,
      primaryDriversCount: investigationResult.primaryRiskDrivers?.length || 0
    },
    {
      agentName: "Cross-Signal Intelligence Agent",
      status: crossSignalResult.status,
      executionTimeMs: crossSignalResult.executionTimeMs || 0,
      metricKey: "Cross-Signals",
      count: crossSignalResult.scenariosDetected?.length || 0,
      highestSeverity: crossSignalResult.highestSeverity || "LOW"
    },
    {
      agentName: "Procurement Recommendation Agent",
      status: recommendationResult.status,
      executionTimeMs: recommendationResult.executionTimeMs || 0,
      metricKey: "Recommendations",
      count: recommendationResult.recommendations?.length || 0
    },
    {
      agentName: "Decision Review Agent",
      status: decisionReviewResult.status,
      executionTimeMs: decisionReviewResult.executionTimeMs || 0,
      metricKey: "Ranked Decisions",
      count: decisionReviewResult.reviewedDecisions?.length || 0,
      topPriorityRanked: decisionReviewResult.highestUrgencyDecision?.title || "None"
    }
  ];

  const topPriorityAction = decisionReviewResult.highestUrgencyDecision || null;

  return {
    orchestrationId: `ORCH-${supplier.id}-${Date.now()}`,
    status: "COMPLETED",
    timestamp: new Date().toISOString(),
    totalExecutionTimeMs: Date.now() - orchestrateStart,
    supplierId: supplier.id,
    supplierCode: supplier.code,
    supplierName: supplier.name,
    overallRiskScore: supplier.riskScore,
    overallRiskLevel: supplier.riskLevel,
    agentExecutionSummary,
    investigation: investigationResult,
    crossSignals: crossSignalResult,
    recommendations: recommendationResult,
    decisionReview: decisionReviewResult,
    topPriorityAction,
    safetyNotice: "Deterministic decision-support model. Consequential procurement actions require mandatory human sign-off."
  };
}

/**
 * Orchestrates multi-agent analysis across the entire supplier portfolio.
 * Generates portfolio-level rankings, consolidated decision queues, and agent telemetry.
 */
export function orchestrateAllSuppliers(suppliers = []) {
  const portfolioStart = Date.now();

  const reports = suppliers.map(supplier => orchestrateSupplierDecision(supplier));

  // Collect all reviewed decisions across suppliers and rank portfolio-wide
  const allDecisions = reports.flatMap(r => r.decisionReview?.reviewedDecisions || []);
  allDecisions.sort((a, b) => (b.auditScore || 0) - (a.auditScore || 0));

  const portfolioRankedDecisions = allDecisions.map((dec, idx) => ({
    ...dec,
    portfolioRank: idx + 1
  }));

  // Rank suppliers by composite score and critical drivers
  const rankedSuppliers = [...suppliers].sort((a, b) => b.riskScore - a.riskScore);

  return {
    portfolioOrchestrationId: `PORTFOLIO-ORCH-${Date.now()}`,
    timestamp: new Date().toISOString(),
    totalSuppliersAnalyzed: suppliers.length,
    totalExecutionTimeMs: Date.now() - portfolioStart,
    supplierReports: reports,
    portfolioRankedDecisions,
    portfolioRiskRanking: rankedSuppliers.map((s, idx) => ({
      portfolioRank: idx + 1,
      supplierId: s.id,
      supplierCode: s.code,
      supplierName: s.name,
      riskScore: s.riskScore,
      riskLevel: s.riskLevel,
      topDriver: reports.find(r => r.supplierId === s.id)?.investigation?.primaryRiskDrivers?.[0]?.findingTitle || "Nominal"
    }))
  };
}
