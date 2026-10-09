/**
 * SupplyShield AI — Deterministic Risk Engine Test Suite (Phase 2)
 * Run via: node tests/run-tests.js
 */

import { 
  calculateQualityMetrics, 
  calculatePriceMetrics, 
  calculateDeliveryMetrics, 
  calculateComplianceMetrics, 
  calculateInventoryMetrics, 
  calculateCompositeRiskScore,
  evaluateCrossSignalIntelligence,
  simulateSupplierRisk,
  RISK_WEIGHTS,
  RISK_THRESHOLDS
} from '../src/engine/riskEngine.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failedTests++;
  }
}

function assertCloseTo(val, expected, testName, delta = 0.2) {
  const isClose = Math.abs(val - expected) <= delta;
  if (isClose) {
    console.log(`  ✓ PASS: ${testName} (Got ${val}, expected ${expected})`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName} (Got ${val}, expected ${expected})`);
    failedTests++;
  }
}

console.log("\n=======================================================");
console.log(" SupplyShield AI — Phase 2 Risk Engine Verification");
console.log("=======================================================\n");

// 0. Risk Scoring Methodology Configuration Tests
console.log("[0. Risk Methodology Configuration & Calibration]");
const totalWeight = RISK_WEIGHTS.QUALITY + RISK_WEIGHTS.PRICE + RISK_WEIGHTS.DELIVERY + RISK_WEIGHTS.COMPLIANCE + RISK_WEIGHTS.CONTINUITY;
assertCloseTo(totalWeight, 1.0, "Multi-vector weights sum to exactly 1.0 (100%)", 0.001);
assert(RISK_THRESHOLDS.CRITICAL === 80, "Critical risk threshold calibrated at 80");
assert(RISK_THRESHOLDS.HIGH === 60, "High risk threshold calibrated at 60");
assert(RISK_THRESHOLDS.MEDIUM === 30, "Medium risk threshold calibrated at 30");

// 1. Quality Rejection Rate Tests
console.log("\n[1. Quality Rejection Rate Calculations]");
const sampleInspections = [
  { inspectedUnits: 250, rejectedUnits: 15, rejectionRatePct: 6.0 },
  { inspectedUnits: 300, rejectedUnits: 25, rejectionRatePct: 8.3 },
  { inspectedUnits: 250, rejectedUnits: 23, rejectionRatePct: 9.2 }
];
const qualityRes = calculateQualityMetrics(sampleInspections);
// Total inspected = 800, total rejected = 63 -> 63 / 800 = 7.875% ~ 7.9%
assertCloseTo(qualityRes.rejectionRate, 7.9, "Rejection rate over batch series is correct");
assert(qualityRes.latestBatchRate === 9.2, "Identifies latest batch rate of 9.2%");
assert(qualityRes.defectTrend === "DETERIORATING", "Correctly identifies deteriorating defect trend");
assert(qualityRes.qualityScore >= 80, "Assigns elevated quality risk score for high defects");

// Edge case: Empty or zero inspections
const emptyQuality = calculateQualityMetrics([]);
assert(emptyQuality.rejectionRate === 0, "Handles empty inspection list safely with 0% rejection");
assert(emptyQuality.qualityScore === 10, "Assigns baseline nominal quality score for empty inspections");

// 2. Price Variance & Potential Overpayment Tests
console.log("\n[2. Price Variance & Potential Overpayment Calculations]");
const samplePOs = [
  { quantityOrdered: 250, contractUnitPrice: 1250, actualBilledUnitPrice: 1342.50 }, // diff = 92.50 * 250 = 23,125
  { quantityOrdered: 300, contractUnitPrice: 1250, actualBilledUnitPrice: 1342.50 }, // diff = 92.50 * 300 = 27,750
  { quantityOrdered: 250, contractUnitPrice: 1250, actualBilledUnitPrice: 1342.50 }  // diff = 92.50 * 250 = 23,125
];
const priceRes = calculatePriceMetrics(samplePOs);
// Total overpayment = 23,125 + 27,750 + 23,125 = $74,000
assert(priceRes.totalOverpayment === 74000, "Calculates exact $74,000 overpayment on Supplier A POs");
assertCloseTo(priceRes.priceVariancePct, 7.4, "Calculates +7.4% price variance");
assert(priceRes.priceScore >= 90, "Assigns critical price risk score for >6% unauthorized variance");

// Compliant PO test (0% variance)
const compliantPOs = [
  { quantityOrdered: 5000, contractUnitPrice: 38.20, actualBilledUnitPrice: 38.20 }
];
const compliantPriceRes = calculatePriceMetrics(compliantPOs);
assert(compliantPriceRes.totalOverpayment === 0, "Compliant PO produces zero overpayment");
assert(compliantPriceRes.priceVariancePct === 0, "Compliant PO produces 0.0% variance");
assert(compliantPriceRes.priceScore <= 15, "Assigns low risk score to compliant vendor");

// 3. Delivery Performance (OTIF) Tests
console.log("\n[3. Delivery Performance (OTIF) & Delay Calculations]");
const deliveryPOs = [
  { delayDays: 0, actualDeliveryDate: "2026-08-01" },
  { delayDays: 0, actualDeliveryDate: "2026-08-10" },
  { delayDays: 7, actualDeliveryDate: "2026-08-20" }
];
const deliveryRes = calculateDeliveryMetrics(deliveryPOs);
// 2 on-time out of 3 = 66.7%
assertCloseTo(deliveryRes.otifRate, 66.7, "Calculates 66.7% OTIF rate");
assert(deliveryRes.lateShipmentCount === 1, "Detects 1 late shipment");
assert(deliveryRes.avgDelayDays === 7, "Calculates average late shipment delay days");

// 4. Compliance & Certificate Expiry Tests
console.log("\n[4. Compliance & Certificate Expiry Countdown Tests]");
const certRecords = [
  { certType: "AS9100 Rev D", daysRemaining: 10 },
  { certType: "ISO 9001", daysRemaining: 120 }
];
const complianceRes = calculateComplianceMetrics(certRecords);
assert(complianceRes.minDaysRemaining === 10, "Detects minimum countdown of 10 days remaining");
assert(complianceRes.isExpiringSoon === true, "Flags certificate as expiring soon (<30 days)");
assert(complianceRes.complianceScore >= 90, "Assigns critical compliance risk for T-10 day window");

// 5. Stock Coverage & Lead-Time Gap Tests
console.log("\n[5. Stock Coverage & Lead-Time Coverage Gap Tests]");
const inventoryRecord = {
  currentOnHandUnits: 500,
  averageDailyDemandUnits: 20,
  replenishmentLeadTimeDays: 112 // 16 weeks
};
const dependencyRecord = { isSingleSource: true };
const invRes = calculateInventoryMetrics(inventoryRecord, dependencyRecord);
// 500 / 20 = 25 days coverage
assert(invRes.stockCoverageDays === 25, "Calculates exact 25 days of stock coverage");
// 25 - 112 = -87 days deficit
assert(invRes.leadTimeCoverageGapDays === -87, "Calculates -87 days lead-time coverage gap");
assert(invRes.isSoleSource === true, "Accurately passes sole-source flag");
assert(invRes.continuityScore >= 85, "Assigns high continuity risk for sole-source buffer deficit");

// 6. Composite 5-Vector Risk Score Tests
console.log("\n[6. Composite Multi-Vector Risk Score Engine]");
const compositeHigh = calculateCompositeRiskScore({
  qualityScore: 95,
  priceScore: 92,
  deliveryScore: 78,
  complianceScore: 95,
  continuityScore: 88
});
assert(compositeHigh.score >= 80, "Composite score for Supplier A is in CRITICAL/HIGH band (90+)");
assert(compositeHigh.riskCategory === "CRITICAL", "Categorized as CRITICAL risk");

const compositeLow = calculateCompositeRiskScore({
  qualityScore: 15,
  priceScore: 10,
  deliveryScore: 12,
  complianceScore: 15,
  continuityScore: 15
});
assert(compositeLow.score <= 25, "Composite score for compliant vendor is in LOW band (<30)");
assert(compositeLow.riskCategory === "LOW", "Categorized as LOW risk");

// 7. Cross-Signal Intelligence Scenario Tests
console.log("\n[7. Cross-Signal Scenario Intelligence Engine]");
const profileA = {
  code: "Supplier A",
  name: "Apex Castings",
  rejectionRate: 9.2,
  priceVariance: 7.4,
  minDaysToExpiry: 10,
  stockCoverageDays: 25,
  leadTimeCoverageGapDays: -87,
  isSingleSource: true,
  criticalityTier: "CRITICAL",
  otifRate: 78.5,
  overpaymentTotal: 74000
};
const crossWarnings = evaluateCrossSignalIntelligence(profileA);
assert(crossWarnings.length >= 3, "Detects compound multi-vector cross warnings for Supplier A");
const scenarioA = crossWarnings.find(w => w.scenario === "SCENARIO_A_QUALITY_CRITICAL_STOCKOUT");
assert(scenarioA !== undefined, "Triggers Scenario A (Quality spike + Critical part + Buffer deficit)");
const scenarioB = crossWarnings.find(w => w.scenario === "SCENARIO_B_COMMERCIAL_LEAKAGE");
assert(scenarioB !== undefined, "Triggers Scenario B (Contract overpricing + Repeated POs)");
const scenarioC = crossWarnings.find(w => w.scenario === "SCENARIO_C_COMPLIANCE_SOLE_SOURCE");
assert(scenarioC !== undefined, "Triggers Scenario C (Certificate expiry cliff + Sole source)");

// 8. Interactive What-If Simulation Tests
console.log("\n[8. Interactive What-If Simulator Tests]");
const baseMetrics = {
  riskScore: 90,
  riskLevel: "CRITICAL",
  rejectionRate: 9.2,
  qualityScore: 95,
  avgDelayDays: 8,
  deliveryScore: 78,
  stockCoverageDays: 25,
  priceScore: 92,
  complianceScore: 95,
  isSingleSource: true
};
const simResult = simulateSupplierRisk(baseMetrics, {
  rejectionRateDeltaPct: -5.0, // Drop rejections by 5%
  stockCoverageDeltaDays: +30,  // Add 30 days of safety stock
  activateDualSource: true      // Dual-source redundancy activated
});
assert(simResult.simulatedScore < baseMetrics.riskScore, "What-If mitigation reduces simulated risk score");
assert(simResult.scoreDelta < -15, "Measurable risk drop of >15 points achieved");
assert(simResult.originalScore === 90, "Preserves original score without mutating base metrics");
assert(simResult.narrative.includes("risk reduction"), "Generates meaningful narrative explanation");

// =======================================================
// Phase 3: Agentic Decision-Making Engine Tests
// =======================================================
console.log("\n=======================================================");
console.log(" SupplyShield AI — Phase 3 Agentic Engine Verification");
console.log("=======================================================\n");

// Dynamic import of Phase 3 agents and dataset
const { runRiskInvestigationAgent } = await import('../src/agents/riskInvestigationAgent.js');
const { runCrossSignalAgent } = await import('../src/agents/crossSignalAgent.js');
const { runProcurementRecommendationAgent } = await import('../src/agents/procurementRecommendationAgent.js');
const { runDecisionReviewAgent } = await import('../src/agents/decisionReviewAgent.js');
const { orchestrateSupplierDecision, orchestrateAllSuppliers } = await import('../src/agents/decisionOrchestrator.js');
const { SUPPLIERS } = await import('../src/data/suppliers.js');

const supplierA = SUPPLIERS.find(s => s.code === "Supplier A");
assert(supplierA !== undefined, "Loaded Supplier A from compiled master registry");

// 9. Agent A: Risk Investigation Agent Tests
console.log("[9. Agent A: Risk Investigation Agent Tests]");
const investA = runRiskInvestigationAgent(supplierA);
assert(investA.status === "COMPLETED", "Agent A completes investigation with status COMPLETED");
assert(investA.findings.length >= 5, "Agent A produces comprehensive findings across operational vectors");
assert(investA.primaryRiskDrivers.length >= 2, "Agent A identifies elevated primary risk drivers");

// Evidence attribution test
const priceFinding = investA.findings.find(f => f.vector === "PRICE");
assert(priceFinding !== undefined, "Agent A investigates commercial price vector");
assert(priceFinding.supportingRecords?.discrepantPOs?.length >= 2, "Agent A attributes exact discrepant PO records");
assert(priceFinding.metrics?.totalOverpaymentBilledDollars === 74000, "Agent A verifies exact $74,000 overpayment from POs");

// Missing/incomplete evidence test
const sparseSupplier = { id: "SPARSE-01", code: "Sparse S", name: "Sparse Test Vendor", riskScore: 20, riskLevel: "LOW" };
const investSparse = runRiskInvestigationAgent(sparseSupplier);
assert(investSparse.status === "COMPLETED", "Agent A handles sparse/missing records gracefully");
const qualSparse = investSparse.findings.find(f => f.vector === "QUALITY");
assert(qualSparse.evidenceStrength === "INSUFFICIENT", "Agent A explicitly flags missing lots as INSUFFICIENT evidence");

// 10. Agent B: Cross-Signal Intelligence Agent Tests
console.log("\n[10. Agent B: Cross-Signal Intelligence Agent Tests]");
const crossA = runCrossSignalAgent(investA, supplierA);
assert(crossA.status === "COMPLETED", "Agent B completes cross-signal analysis with status COMPLETED");
assert(crossA.scenariosDetected.length >= 3, "Agent B detects at least 3 compound cross-signal scenarios on Supplier A");

// Check the three primary scenarios specifically
const csScenario1 = crossA.scenariosDetected.find(s => s.scenarioType === "QUALITY_BUFFER_CRITICALITY_CONVERGENCE");
assert(csScenario1 !== undefined, "Agent B detects Scenario 1: High defect rate + critical part + low stock buffer");
const csScenario2 = crossA.scenariosDetected.find(s => s.scenarioType === "COMMERCIAL_LEAKAGE_REPEATED_POS");
assert(csScenario2 !== undefined, "Agent B detects Scenario 2: Unauthorized price variance + repeated POs");
const csScenario3 = crossA.scenariosDetected.find(s => s.scenarioType === "COMPLIANCE_SOLE_SOURCE_CONVERGENCE");
assert(csScenario3 !== undefined, "Agent B detects Scenario 3: Expiring compliance certificate + sole-source dependency");

// Deduplication check
const uniqueScenarioIds = new Set(crossA.scenariosDetected.map(s => s.scenarioId));
assert(uniqueScenarioIds.size === crossA.scenariosDetected.length, "Agent B enforces deduplication with zero duplicate alert IDs");

// 11. Agent C: Procurement Recommendation Agent Tests
console.log("\n[11. Agent C: Procurement Recommendation Agent Tests]");
const recsA = runProcurementRecommendationAgent(investA, crossA, supplierA);
assert(recsA.status === "COMPLETED", "Agent C completes recommendations with status COMPLETED");
assert(recsA.recommendations.length >= 3, "Agent C generates multiple actionable interventions");

// Strict Human Approval Requirement check
const allRequireHumanApproval = recsA.recommendations.every(r => r.requiresHumanApproval === true);
assert(allRequireHumanApproval, "Agent C strictly enforces requiresHumanApproval = true on ALL recommendations");

// Calculated impact metrics check
const commRec = recsA.recommendations.find(r => r.category.includes("Commercial"));
assert(commRec !== undefined, "Agent C generates commercial dispute recommendation");
assert(commRec.expectedImpact?.calculable === true, "Commercial recommendation has calculable numeric impact");
assert(commRec.expectedImpact?.numericMetric?.includes("74,000"), "Commercial impact explicitly references $74,000 cash recovery");

// 12. Agent D: Decision Review Agent Tests
console.log("\n[12. Agent D: Decision Review Agent Tests]");
const reviewA = runDecisionReviewAgent(recsA, investA, crossA);
assert(reviewA.status === "COMPLETED", "Agent D completes review with status COMPLETED");
assert(reviewA.reviewedDecisions.length === recsA.recommendations.length, "Agent D reviews and audits all proposed recommendations");

// Prioritization ranking check
assert(reviewA.reviewedDecisions[0]?.rank === 1, "Agent D assigns Rank 1 to top priority action");
const isSortedDescending = reviewA.reviewedDecisions.every((dec, i, arr) => i === 0 || arr[i - 1].auditScore >= dec.auditScore);
assert(isSortedDescending, "Agent D strictly sorts decisions in descending order of audit score");
assert(reviewA.highestUrgencyDecision !== null, "Agent D identifies highest urgency decision");
assert(reviewA.reviewedDecisions[0]?.priorityRationale?.length > 10, "Agent D provides explainable priority rationale");
assert(reviewA.reviewedDecisions[0]?.approvalStatus === "PENDING_EXECUTIVE_APPROVAL", "Agent D mandates PENDING_EXECUTIVE_APPROVAL");

// 13. Deterministic Output for Identical Input Test
console.log("\n[13. Deterministic Output & Reproducibility Tests]");
const run1 = orchestrateSupplierDecision(supplierA);
const run2 = orchestrateSupplierDecision(supplierA);
// Compare the deterministic core structure (ignoring ephemeral timestamps and IDs)
assert(run1.status === "COMPLETED" && run2.status === "COMPLETED", "Both orchestrations complete successfully");
assert(run1.decisionReview.reviewedDecisions.length === run2.decisionReview.reviewedDecisions.length, "Identical number of decisions generated across runs");
assert(run1.decisionReview.reviewedDecisions[0].title === run2.decisionReview.reviewedDecisions[0].title, "Identical Rank #1 decision selected across independent runs");
assert(run1.decisionReview.reviewedDecisions[0].auditScore === run2.decisionReview.reviewedDecisions[0].auditScore, "Identical audit scores computed deterministically");

// 14. End-to-End Decision Orchestrator Tests
console.log("\n[14. End-to-End Decision Orchestrator Tests]");
const singleOrch = orchestrateSupplierDecision(supplierA);
assert(singleOrch.agentExecutionSummary.length === 4, "Orchestrator tracks execution across all 4 logical agents");
assert(singleOrch.agentExecutionSummary.every(a => a.status === "COMPLETED"), "All 4 logical agents succeed in sequence");
assert(singleOrch.topPriorityAction !== null, "Orchestrator exposes topPriorityAction in dossier");

// Portfolio batch orchestration test
const portfolioOrch = orchestrateAllSuppliers(SUPPLIERS);
assert(portfolioOrch.totalSuppliersAnalyzed === SUPPLIERS.length, `Portfolio orchestrator processes all ${SUPPLIERS.length} suppliers`);
assert(portfolioOrch.portfolioRankedDecisions.length >= SUPPLIERS.length, "Portfolio orchestrator builds consolidated ranked decision queue");
assert(portfolioOrch.portfolioRankedDecisions[0]?.portfolioRank === 1, "Portfolio ranked decisions start at Rank 1");

console.log("\n=======================================================");
console.log(` Test Execution Summary: ${passedTests} Passed, ${failedTests} Failed`);
console.log("=======================================================\n");

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
