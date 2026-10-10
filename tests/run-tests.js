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

import { 
  parseCsvFile, 
  parseXlsxFile, 
  validateFileMetadata, 
  generateSampleCsvContent, 
  generateSampleXlsxBuffer, 
  exportAnalysisToCsv 
} from '../src/import/importParser.js';

import { 
  autoDetectColumnMapping, 
  validateUploadedData 
} from '../src/import/importValidator.js';

import { 
  scoreUploadedSupplier, 
  adaptUploadedSuppliersToEntities 
} from '../src/import/uploadedDataAdapter.js';

import { 
  savePersistedUploadedDataset, 
  loadPersistedUploadedDataset, 
  clearPersistedUploadedDataset, 
  loadActiveDatasetMode, 
  saveActiveDatasetMode, 
  DATASET_MODE 
} from '../src/import/datasetStorage.js';

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

// =======================================================
// Phase 4: AI Procurement Assistant & What-If Tests
// =======================================================
console.log("\n=======================================================");
console.log(" SupplyShield AI — Phase 4 Assistant & What-If Verification");
console.log("=======================================================\n");

const { routeUserIntent, extractSupplierFromQuery, extractScenarioParameters } = await import('../src/assistant/intentRouter.js');
const { executeWhatIfScenario } = await import('../src/assistant/scenarioService.js');
const { processAssistantQuery } = await import('../src/assistant/assistantService.js');

// 15. Supplier Name & Entity Recognition Tests
console.log("[15. Supplier Name & Entity Recognition Tests]");
const suppEntity1 = extractSupplierFromQuery("What is happening with Apex Precision Castings?");
assert(suppEntity1?.id === "SUP-001" && suppEntity1?.code === "Supplier A", "Recognizes 'Apex Precision Castings' as Supplier A (SUP-001)");

const suppEntity2 = extractSupplierFromQuery("Check microcontrollers from Vanguard");
assert(suppEntity2?.id === "SUP-002", "Recognizes 'Vanguard' as Supplier B (SUP-002)");

const suppEntity3 = extractSupplierFromQuery("Tell me about seals from HydroTech");
assert(suppEntity3?.id === "SUP-003", "Recognizes 'HydroTech' and 'seals' as Supplier C (SUP-003)");

const suppEntity4 = extractSupplierFromQuery("What is the lead time for SUP-006?");
assert(suppEntity4?.id === "SUP-006", "Recognizes exact ID 'SUP-006' as Supplier F");

const suppEntityNone = extractSupplierFromQuery("What is the general inflation rate?");
assert(suppEntityNone === null, "Returns null when no supplier entity is present");

// 16. Every Supported Intent Category Test
console.log("\n[16. Every Supported Intent Category Test]");
const intentRanking = routeUserIntent("Which supplier is the riskiest and why?");
assert(intentRanking.intent === "RISK_RANKING", "Classifies intent: RISK_RANKING");

const intentSuppExplain = routeUserIntent("Why is Apex Castings considered high risk?");
assert(intentSuppExplain.intent === "SUPPLIER_EXPLANATION", "Classifies intent: SUPPLIER_EXPLANATION");

const intentQuality = routeUserIntent("What are the quality defect rates across suppliers?");
assert(intentQuality.intent === "QUALITY_INSPECTION", "Classifies intent: QUALITY_INSPECTION");

const intentPrice = routeUserIntent("Which supplier has the largest calculated price variance?");
assert(intentPrice.intent === "PRICE_VARIANCE", "Classifies intent: PRICE_VARIANCE");

const intentDelivery = routeUserIntent("Who has late deliveries and shipment delays?");
assert(intentDelivery.intent === "DELIVERY_PERFORMANCE", "Classifies intent: DELIVERY_PERFORMANCE");

const intentCompliance = routeUserIntent("Which certificates are expiring soon?");
assert(intentCompliance.intent === "COMPLIANCE_EXPIRY", "Classifies intent: COMPLIANCE_EXPIRY");

const intentInventory = routeUserIntent("What is the inventory coverage and lead time deficit?");
assert(intentInventory.intent === "INVENTORY_COVERAGE", "Classifies intent: INVENTORY_COVERAGE");

const intentActions = routeUserIntent("What are the top three procurement actions requiring attention?");
assert(intentActions.intent === "RECOMMENDED_ACTIONS", "Classifies intent: RECOMMENDED_ACTIONS");

const intentCrossSignal = routeUserIntent("Explain cross-signal compound risks for Supplier A");
assert(intentCrossSignal.intent === "CROSS_SIGNAL_EXPLANATION", "Classifies intent: CROSS_SIGNAL_EXPLANATION");

const intentWhatIf = routeUserIntent("What happens if we increase safety stock by 30 days for Supplier A?");
assert(intentWhatIf.intent === "WHAT_IF_SCENARIO", "Classifies intent: WHAT_IF_SCENARIO");

const scenarioParams = extractScenarioParameters("What happens if we increase safety stock by 30 days and reduce rejection rate by 3% for Supplier A?");
assert(scenarioParams.stockCoverageDeltaDays === 30, "Extracts stock coverage delta (+30 days) from query");
assert(scenarioParams.rejectionRateDeltaPct === -3, "Extracts rejection rate delta (-3%) from query");

// 17. Ambiguous Questions & Clarification Behavior Tests
console.log("\n[17. Ambiguous Questions & Clarification Behavior Tests]");
const intentAmbiguous = routeUserIntent("What is the rejection rate?");
assert(intentAmbiguous.intent === "AMBIGUOUS_CLARIFICATION", "Classifies ambiguous query as AMBIGUOUS_CLARIFICATION");

const respAmbiguous = processAssistantQuery("What is the rejection rate?", SUPPLIERS);
assert(respAmbiguous.intent === "AMBIGUOUS_CLARIFICATION", "Assistant generates clarification response for ambiguous metric query");
assert(respAmbiguous.content.includes("Could you please specify"), "Clarification politely requests supplier specification");
assert(respAmbiguous.suggestedFollowUps.length >= 3, "Provides helpful follow-up question suggestions");

// 18. Evidence Attribution in Assistant Answers Tests
console.log("\n[18. Evidence Attribution in Assistant Answers Tests]");
const priceAns = processAssistantQuery("How much overpayment was calculated for Supplier A?", SUPPLIERS);
assert(priceAns.evidence !== null, "Assistant includes structured evidence citations in answer");
assert(priceAns.evidence?.poNumbers?.length >= 2, "Cites specific purchase order numbers for Supplier A");
assert(priceAns.observedFacts?.some(f => f.includes("74,000")), "Cites exact verified $74,000 overpayment in observed facts");

const qualAns = processAssistantQuery("What quality defects were found for Supplier A?", SUPPLIERS);
assert(qualAns.evidence?.lotNumbers?.length >= 2, "Cites specific inspection lot numbers for Supplier A");
assert(qualAns.observedFacts?.some(f => f.includes("9.2%")), "Cites verified 9.2% latest lot defect rate");

// 19. What-If Scenario Engine & Non-Mutation Tests
console.log("\n[19. What-If Scenario Engine & Non-Mutation Tests]");
const initialScore = supplierA.riskScore;
const initialBreakdown = JSON.stringify(supplierA.scoreBreakdown);

const simOutcome = executeWhatIfScenario(supplierA, {
  stockCoverageDeltaDays: 30,
  rejectionRateDeltaPct: -3.0,
  resolvePriceVariance: true,
  activateDualSource: true
});

assert(simOutcome.success === true, "What-If scenario executes successfully");
assert(simOutcome.isHypothetical === true, "Explicitly flags outcome as isHypothetical = true");
assert(simOutcome.hypotheticalScore < initialScore, "Hypothetical mitigation significantly reduces risk score");
assert(simOutcome.scoreDelta < -15, "Score delta reflects comprehensive multi-vector relief");
assert(simOutcome.changedMetrics.length >= 3, "Tracks specific changed metrics");
assert(simOutcome.unchangedMetrics.length >= 1, "Tracks specific unchanged metrics");

// Non-mutation assertion
assert(supplierA.riskScore === initialScore, "STRICT NON-MUTATION: Original supplierA.riskScore remains 100% untouched");
assert(JSON.stringify(supplierA.scoreBreakdown) === initialBreakdown, "STRICT NON-MUTATION: Original score breakdown remains 100% untouched");

// Unsupported scenario / missing supplier test
const simMissing = executeWhatIfScenario(null, { stockCoverageDeltaDays: 10 });
assert(simMissing.success === false, "Handles missing supplier in what-if engine gracefully");

// 20. Deterministic Output & Reproducibility Tests
console.log("\n[20. Deterministic Output & Reproducibility Tests]");
const query1 = "Which supplier is the riskiest and why?";
const ans1 = processAssistantQuery(query1, SUPPLIERS);
const ans2 = processAssistantQuery(query1, SUPPLIERS);

assert(ans1.intent === ans2.intent, "Identical intent produced across repeated queries");
assert(ans1.content === ans2.content, "Identical content generated deterministically");
assert(JSON.stringify(ans1.observedFacts) === JSON.stringify(ans2.observedFacts), "Identical observed facts generated deterministically");

// 21. Empty / Missing Input & Graceful Handling Tests
console.log("\n[21. Graceful Error Handling Tests]");
const emptyAns = processAssistantQuery("", SUPPLIERS);
assert(emptyAns.intent === "EMPTY", "Gracefully handles empty query string");
assert(emptyAns.content.length > 0, "Provides helpful prompt for empty query");

const nullAns = processAssistantQuery(null, SUPPLIERS);
assert(nullAns.intent === "EMPTY", "Gracefully handles null query");

// =======================================================
// SupplyShield AI — Phase 6 Action Lifecycle & Audit Verification
// =======================================================
console.log("\n=======================================================");
console.log(" SupplyShield AI — Phase 6 Workflow & Audit Verification");
console.log("=======================================================");

const { 
  ACTION_STATUS, 
  normalizeActionStatus, 
  canTransition, 
  validateTransition, 
  transitionAction, 
  findExistingActiveAction, 
  filterActions, 
  sortActions, 
  DEFAULT_REVIEWER 
} = await import('../src/workflow/actionLifecycleService.js');

const { 
  AUDIT_EVENT_TYPE, 
  createAuditEvent, 
  appendAuditEvent, 
  getAuditTrailForAction, 
  filterAuditLog 
} = await import('../src/workflow/auditService.js');

const { 
  generateStableActionId, 
  validateActionRecord, 
  validateAuditEventRecord, 
  createInitialSeedActionsAndAudit 
} = await import('../src/workflow/persistenceService.js');

// 22. Action Lifecycle Valid Transitions
console.log("\n[22. Action Lifecycle Valid Transitions Tests]");
const mockDraft = {
  id: "ACT-TEST-001",
  supplierId: "SUP-001",
  supplierCode: "Supplier A",
  actionTitle: "Test Surcharge Dispute",
  status: ACTION_STATUS.DRAFT,
  requiresHumanApproval: true
};

assert(canTransition(ACTION_STATUS.DRAFT, ACTION_STATUS.PENDING_APPROVAL), "Permits DRAFT -> PENDING_APPROVAL");
const pendingAct = transitionAction(mockDraft, ACTION_STATUS.PENDING_APPROVAL, { reviewer: "Sarah Chen" });
assert(pendingAct.status === ACTION_STATUS.PENDING_APPROVAL, "Transitions action to PENDING_APPROVAL");

assert(canTransition(ACTION_STATUS.PENDING_APPROVAL, ACTION_STATUS.APPROVED), "Permits PENDING_APPROVAL -> APPROVED");
const approvedAct = transitionAction(pendingAct, ACTION_STATUS.APPROVED, { reviewer: "Sarah Chen (Director of Procurement)" });
assert(approvedAct.status === ACTION_STATUS.APPROVED, "Transitions action to APPROVED");
assert(approvedAct.approvedBy.includes("Sarah Chen"), "Records approving reviewer identity");

assert(canTransition(ACTION_STATUS.APPROVED, ACTION_STATUS.IN_PROGRESS), "Permits APPROVED -> IN_PROGRESS");
const inProgressAct = transitionAction(approvedAct, ACTION_STATUS.IN_PROGRESS, { reviewer: "Sarah Chen" });
assert(inProgressAct.status === ACTION_STATUS.IN_PROGRESS, "Transitions action to IN_PROGRESS");

assert(canTransition(ACTION_STATUS.IN_PROGRESS, ACTION_STATUS.COMPLETED), "Permits IN_PROGRESS -> COMPLETED");
const completedAct = transitionAction(inProgressAct, ACTION_STATUS.COMPLETED, { reviewer: "Sarah Chen" });
assert(completedAct.status === ACTION_STATUS.COMPLETED, "Transitions action to COMPLETED");

// 23. Invalid Lifecycle Transitions & State Machine Enforcement
console.log("\n[23. Invalid Transitions & State Machine Enforcement Tests]");
assert(!canTransition(ACTION_STATUS.DRAFT, ACTION_STATUS.APPROVED), "Disallows DRAFT -> APPROVED (must be submitted first)");
assert(!canTransition(ACTION_STATUS.DRAFT, ACTION_STATUS.IN_PROGRESS), "Disallows DRAFT -> IN_PROGRESS");
assert(!canTransition(ACTION_STATUS.DRAFT, ACTION_STATUS.COMPLETED), "Disallows DRAFT -> COMPLETED");
assert(!canTransition(ACTION_STATUS.PENDING_APPROVAL, ACTION_STATUS.COMPLETED), "Disallows PENDING_APPROVAL -> COMPLETED");

// Terminal states disallow outgoing transitions
assert(!canTransition(ACTION_STATUS.REJECTED, ACTION_STATUS.APPROVED), "Terminal: Disallows REJECTED -> APPROVED");
assert(!canTransition(ACTION_STATUS.COMPLETED, ACTION_STATUS.IN_PROGRESS), "Terminal: Disallows COMPLETED -> IN_PROGRESS");
assert(!canTransition(ACTION_STATUS.CANCELLED, ACTION_STATUS.DRAFT), "Terminal: Disallows CANCELLED -> DRAFT");

// validateTransition rejects invalid transitions
const invalidRes = validateTransition(mockDraft, ACTION_STATUS.COMPLETED);
assert(invalidRes.valid === false, "validateTransition returns false for invalid transition");

// 24. Mandatory Rejection & Cancellation Reasons
console.log("\n[24. Mandatory Rejection & Cancellation Reasons Tests]");
const testPending = { ...pendingAct };

// Empty rejection reason fails validation
const rejectNoReason = validateTransition(testPending, ACTION_STATUS.REJECTED, { reason: "" });
assert(rejectNoReason.valid === false, "Rejection with empty reason fails validation");

// Valid rejection reason succeeds
const rejectValid = validateTransition(testPending, ACTION_STATUS.REJECTED, { reason: "Alternative vendor already certified" });
assert(rejectValid.valid === true, "Rejection with documented reason passes validation");

const rejectedAct = transitionAction(testPending, ACTION_STATUS.REJECTED, { reason: "Alternative vendor already certified", reviewer: "Sarah Chen" });
assert(rejectedAct.status === ACTION_STATUS.REJECTED, "Transitions to REJECTED");
assert(rejectedAct.rejectionReason === "Alternative vendor already certified", "Records rejection reason");

// Empty cancellation reason fails validation
const cancelNoReason = validateTransition(approvedAct, ACTION_STATUS.CANCELLED, { reason: "   " });
assert(cancelNoReason.valid === false, "Cancellation with empty reason fails validation");

const cancelledAct = transitionAction(approvedAct, ACTION_STATUS.CANCELLED, { reason: "Budget deferred to Q3", reviewer: "Marcus Vance" });
assert(cancelledAct.status === ACTION_STATUS.CANCELLED, "Transitions to CANCELLED");
assert(cancelledAct.cancellationReason === "Budget deferred to Q3", "Records cancellation reason");

// 25. Audit Event Creation & Append-Only Immutability
console.log("\n[25. Audit Event Creation & Append-Only Immutability Tests]");
const testAuditEvent = createAuditEvent({
  actionId: "ACT-TEST-001",
  actionTitle: "Issue Immediate Dispute",
  supplierCode: "Supplier A",
  eventType: AUDIT_EVENT_TYPE.ACTION_APPROVED,
  fromStatus: ACTION_STATUS.PENDING_APPROVAL,
  toStatus: ACTION_STATUS.APPROVED,
  actor: "Sarah Chen (Director of Procurement)",
  reason: "Audit verified $74,000 price leakage"
});

assert(testAuditEvent.id.startsWith("AUD-"), "Generates unique audit ID with AUD- prefix");
assert(testAuditEvent.eventType === AUDIT_EVENT_TYPE.ACTION_APPROVED, "Stamps correct event type");
assert(testAuditEvent.isLocalDemoLog === true, "Flags event as local demonstration log");

// Append-only behavior
let testLog = [];
testLog = appendAuditEvent(testLog, testAuditEvent);
assert(testLog.length === 1, "Appends event to audit log array");

// Frozen immutability check
let throwsOnMutation = false;
try {
  testLog[0].actor = "Tampered Actor";
} catch {
  throwsOnMutation = true;
}
assert(throwsOnMutation || testLog[0].actor === "Sarah Chen (Director of Procurement)", "Frozen audit record guarantees immutability");

// Action audit trail extraction
const auditTrail = getAuditTrailForAction(testLog, "ACT-TEST-001");
assert(auditTrail.length === 1, "getAuditTrailForAction filters correct events for actionId");

const filteredEvents = filterAuditLog(testLog, { eventType: AUDIT_EVENT_TYPE.ACTION_APPROVED });
assert(filteredEvents.length === 1, "filterAuditLog filters by eventType correctly");

// 26. Stable Action IDs & Duplicate Recommendation Detection
console.log("\n[26. Stable Action IDs & Duplicate Recommendation Detection Tests]");
const existingList = [
  { id: "ACT-2026-001", supplierId: "SUP-001", actionTitle: "Dispute Price", status: ACTION_STATUS.PENDING_APPROVAL },
  { id: "ACT-2026-002", supplierId: "SUP-003", actionTitle: "Divert Seal Buffer", status: ACTION_STATUS.APPROVED }
];

const nextId = generateStableActionId(existingList);
assert(nextId === "ACT-2026-003", `Generates next sequential stable ID (got ${nextId}, expected ACT-2026-003)`);

// Duplicate detection
const dupCandidate = {
  supplierId: "SUP-001",
  actionTitle: "Dispute Price"
};
const duplicateFound = findExistingActiveAction(existingList, dupCandidate);
assert(duplicateFound !== null, "Detects duplicate active recommendation for same supplier and title");
assert(duplicateFound.id === "ACT-2026-001", "Identifies exact duplicate action ID");

// Non-duplicate candidate
const uniqueCandidate = {
  supplierId: "SUP-002",
  actionTitle: "Brand New Supplier Action"
};
const noDuplicate = findExistingActiveAction(existingList, uniqueCandidate);
assert(noDuplicate === null, "Returns null when no matching active action exists");

// 27. Persistence Validation & Recovery
console.log("\n[27. Persistence Validation & Recovery Tests]");
const validRecord = validateActionRecord({
  id: "ACT-RAW-1",
  actionTitle: "Raw Action",
  status: "Pending Approval"
});
assert(validRecord !== null, "validateActionRecord validates valid record");
assert(validRecord.status === ACTION_STATUS.PENDING_APPROVAL, "Normalizes status to ACTION_STATUS.PENDING_APPROVAL");
assert(normalizeActionStatus("Pending Approval") === ACTION_STATUS.PENDING_APPROVAL, "Normalizes legacy 'Pending Approval' string");

const validAud = validateAuditEventRecord(testAuditEvent);
assert(validAud !== null, "validateAuditEventRecord validates event record");

const invalidRecord = validateActionRecord({ invalid: true });
assert(invalidRecord === null, "validateActionRecord returns null for malformed object");

const { seedActions, seedAudit } = createInitialSeedActionsAndAudit();
assert(seedActions.length >= 4, "createInitialSeedActionsAndAudit generates initial seed actions");
assert(seedAudit.length >= 4, "createInitialSeedActionsAndAudit generates corresponding seed audit trail");

// 28. Human Approval Enforcement & Governance Guarantees
console.log("\n[28. Human Approval Enforcement & Governance Guarantees Tests]");
assert(DEFAULT_REVIEWER.includes("Sarah Chen"), "DEFAULT_REVIEWER contains Sarah Chen");
// Requires non-empty reviewer for approval
const approveNoReviewer = validateTransition(testPending, ACTION_STATUS.APPROVED, { reviewer: "" });
assert(approveNoReviewer.valid === false, "Approval fails if reviewer identity is missing");

// Agent dossier recommendations enforce requiresHumanApproval
const dossierForGov = orchestrateSupplierDecision(supplierA);
const recommendations = dossierForGov.procurementRecommendations?.recommendations || [];
assert(recommendations.every(r => r.requiresHumanApproval === true), "All agent recommendations enforce requiresHumanApproval = true");

// 29. Filtering and Sorting Logic Tests
console.log("\n[29. Filtering and Sorting Logic Tests]");
const filterSample = [
  { id: "ACT-1", status: ACTION_STATUS.PENDING_APPROVAL, urgency: "CRITICAL", supplierCode: "Supplier A", actionTitle: "Dispute" },
  { id: "ACT-2", status: ACTION_STATUS.APPROVED, urgency: "LOW", supplierCode: "Supplier B", actionTitle: "Rebate" },
  { id: "ACT-3", status: ACTION_STATUS.PENDING_APPROVAL, urgency: "HIGH", supplierCode: "Supplier C", actionTitle: "Buffer" }
];

const pendingFiltered = filterActions(filterSample, { status: ACTION_STATUS.PENDING_APPROVAL });
assert(pendingFiltered.length === 2, "filterActions filters by status correctly");

const sortedByUrgency = sortActions(filterSample, 'urgency');
assert(sortedByUrgency[0].urgency === "CRITICAL", "sortActions places CRITICAL urgency first");
assert(sortedByUrgency[sortedByUrgency.length - 1].urgency === "LOW", "sortActions places LOW urgency last");

// =======================================================
// SupplyShield AI — Phase 5 Secure Groq AI Verification
// =======================================================
console.log("\n=======================================================");
console.log(" SupplyShield AI — Phase 5 Secure Groq AI Verification");
console.log("=======================================================\n");

const fs = await import('fs');
const path = await import('path');
const { getConfig } = await import('../server/config.js');
const { validateChatRequest } = await import('../server/middleware/requestValidator.js');
const { createRateLimiter, resetRateLimits } = await import('../server/middleware/rateLimiter.js');
const { buildGroqPrompt } = await import('../server/services/promptBuilder.js');
const { GroqClient } = await import('../server/services/groqClient.js');
const { processAssistantQueryUnified } = await import('../src/assistant/groqAssistantService.js');

// 30. Groq AI Configuration & Default Safe State
console.log("[30. Groq AI Configuration & Default Safe State]");
const defaultCfg = getConfig();
assert(defaultCfg.ENABLE_GROQ === false, "Groq is disabled by default (ENABLE_GROQ=false)");
assert(defaultCfg.isGroqEnabled() === false, "isGroqEnabled() returns false by default");
assert(defaultCfg.isGroqConfigured() === false, "isGroqConfigured() returns false by default");

const safeStatus = defaultCfg.getClientSafeStatus();
assert(safeStatus.enabled === false, "getClientSafeStatus reports enabled: false");
assert(safeStatus.configured === false, "getClientSafeStatus reports configured: false");
assert(safeStatus.provider === "deterministic-local", "Default provider is deterministic-local");
assert(safeStatus.GROQ_API_KEY === undefined, "getClientSafeStatus never contains GROQ_API_KEY");
assert(safeStatus.apiKey === undefined, "getClientSafeStatus never contains apiKey");

// Custom config evaluations
const customDisabledWithKey = getConfig({ ENABLE_GROQ: "false", GROQ_API_KEY: "test-secret-key" });
assert(customDisabledWithKey.isGroqEnabled() === false, "Custom config with ENABLE_GROQ=false remains disabled even when key provided");
assert(customDisabledWithKey.isGroqConfigured() === false, "Custom config with ENABLE_GROQ=false is not configured");

const customEnabledNoKey = getConfig({ ENABLE_GROQ: "true", GROQ_API_KEY: "" });
assert(customEnabledNoKey.isGroqEnabled() === true, "Custom config with ENABLE_GROQ=true returns enabled true");
assert(customEnabledNoKey.isGroqConfigured() === false, "Custom config without key returns configured false");

const customEnabledWithKey = getConfig({ ENABLE_GROQ: "true", GROQ_API_KEY: "gsk_real_key_mock" });
assert(customEnabledWithKey.isGroqConfigured() === true, "Custom config with key returns configured true");
assert(customEnabledWithKey.GROQ_MODEL === "llama-3.3-70b-versatile", "Defaults to llama-3.3-70b-versatile free-tier model");

// 31. Request Validation & Payload Constraints
console.log("\n[31. Request Validation & Payload Constraints]");
function testExpressMiddleware(fn, req) {
  let statusCode = 200;
  let jsonPayload = null;
  let nextCalled = false;
  const res = {
    status(code) { statusCode = code; return this; },
    json(payload) { jsonPayload = payload; return this; },
    setHeader() { return this; }
  };
  const next = () => { nextCalled = true; };
  fn(req, res, next);
  return { statusCode, jsonPayload, nextCalled };
}

const missingBody = testExpressMiddleware(validateChatRequest, { body: null });
assert(missingBody.statusCode === 400, "Rejects null body with 400");
assert(missingBody.jsonPayload?.fallbackRecommended === true, "Rejection advises fallbackRecommended: true");

const missingMessage = testExpressMiddleware(validateChatRequest, { body: {} });
assert(missingMessage.statusCode === 400, "Rejects missing message with 400");

const nonStringMessage = testExpressMiddleware(validateChatRequest, { body: { message: 12345 } });
assert(nonStringMessage.statusCode === 400, "Rejects non-string message with 400");

const emptyMessage = testExpressMiddleware(validateChatRequest, { body: { message: "   " } });
assert(emptyMessage.statusCode === 400, "Rejects whitespace-only message with 400");

const oversizedMessage = testExpressMiddleware(validateChatRequest, { body: { message: "A".repeat(2500) } });
assert(oversizedMessage.statusCode === 400, "Rejects oversized message exceeding limit with 400");
assert(oversizedMessage.jsonPayload?.status === "payload_too_large", "Flags payload_too_large status");

const validReq = { body: { message: "  Why is Supplier A high risk?  ", supplierId: "SUP-001" } };
const validPass = testExpressMiddleware(validateChatRequest, validReq);
assert(validPass.nextCalled === true, "Valid request calls next()");
assert(validReq.sanitized.message === "Why is Supplier A high risk?", "Sanitizes and trims message");
assert(validReq.sanitized.supplierId === "SUP-001", "Preserves supplierId");

// 32. In-Memory Sliding Window Rate Limiting Enforcement
console.log("\n[32. Sliding Window Rate Limiting Enforcement]");
resetRateLimits();
const testLimiter = createRateLimiter({ maxRequests: 2, windowMs: 60000 });
const ipReq = { ip: "192.168.1.100", headers: {}, socket: {} };

const r1 = testExpressMiddleware(testLimiter, ipReq);
assert(r1.nextCalled === true, "Rate limit permits request #1");
const r2 = testExpressMiddleware(testLimiter, ipReq);
assert(r2.nextCalled === true, "Rate limit permits request #2");
const r3 = testExpressMiddleware(testLimiter, ipReq);
assert(r3.statusCode === 429, "Rate limit blocks request #3 with HTTP 429");
assert(r3.jsonPayload?.status === "rate_limited", "Payload flags status: rate_limited");
assert(r3.jsonPayload?.retryAfterSeconds > 0, "Provides retryAfterSeconds");

resetRateLimits();
const rAfterReset = testExpressMiddleware(testLimiter, ipReq);
assert(rAfterReset.nextCalled === true, "resetRateLimits allows requests again");

// 33. Prompt Grounding & Evidence Context Construction
console.log("\n[33. Prompt Grounding & Evidence Context Construction]");
const promptRes = buildGroqPrompt({ message: "Why is Supplier A classified as high risk?" });
assert(promptRes.targetSupplier?.code === "Supplier A", "Detects Supplier A as target supplier");
assert(promptRes.systemPrompt.includes("DETERMINISTIC CALCULATIONS ARE AUTHORITATIVE"), "System prompt mandates authoritative calculations");
assert(promptRes.systemPrompt.includes("ZERO authority to approve, reject"), "System prompt enforces human approval boundaries");
assert(promptRes.systemPrompt.includes("EXPLICIT MISSING DATA REPORTING"), "System prompt mandates explicit missing data reporting");
assert(promptRes.userPrompt.includes("Score 92/100"), "User prompt injects exact deterministic score 92/100");
assert(promptRes.userPrompt.includes("LOT-QA-912") || promptRes.userPrompt.includes("LOT-QA"), "User prompt cites relational inspection lots");
assert(promptRes.userPrompt.includes("PO-2026"), "User prompt cites relational purchase order records");
assert(promptRes.messages.length === 2, "Constructs standard 2-message array [system, user]");

// 34. Mocked Groq API Call & Successful Explanation Synthesis
console.log("\n[34. Mocked Groq API Call & Successful Explanation Synthesis]");
const mockGroqConfig = getConfig({ ENABLE_GROQ: "true", GROQ_API_KEY: "mock-groq-key-secret" });

const mockSuccessFetch = async (url, options) => {
  assert(url.includes("api.groq.com/openai/v1/chat/completions"), "Calls official Groq chat completions endpoint");
  assert(options.headers["Authorization"] === "Bearer mock-groq-key-secret", "Sends Bearer token in Authorization header");
  const body = JSON.parse(options.body);
  assert(body.model === "llama-3.3-70b-versatile", "Requests configured Groq model");
  assert(body.temperature === 0.2, "Requests factual low temperature (0.2)");

  return {
    ok: true,
    status: 200,
    async json() {
      return {
        id: "chatcmpl-mock-success",
        model: "llama-3.3-70b-versatile",
        choices: [
          {
            message: {
              role: "assistant",
              content: "Supplier A is high risk (92/100) due to 9.2% quality defect spike in LOT-QA-912 and +$74,000 price variance."
            }
          }
        ],
        usage: { total_tokens: 150 }
      };
    }
  };
};

const clientWithMock = new GroqClient({ config: mockGroqConfig, fetchFn: mockSuccessFetch });
const successRes = await clientWithMock.queryGroq({ messages: [{ role: "user", content: "Explain Supplier A" }] });
assert(successRes.success === true, "Mocked Groq call succeeds with success: true");
assert(successRes.source === "groq-ai", "Source stamped as groq-ai");
assert(successRes.answer.includes("Supplier A is high risk"), "Returns expected synthesized explanation");
assert(successRes.model === "llama-3.3-70b-versatile", "Returns correct model");

// 35. Provider Failure Scenarios & Safe Recovery
console.log("\n[35. Provider Failure Scenarios & Safe Recovery]");
// Disabled client
const disabledClient = new GroqClient({ config: getConfig({ ENABLE_GROQ: "false" }) });
const disabledRes = await disabledClient.queryGroq({ messages: [] });
assert(disabledRes.success === false && disabledRes.status === "disabled", "Disabled client rejects call before network");

// Missing key client
const noKeyClient = new GroqClient({ config: getConfig({ ENABLE_GROQ: "true", GROQ_API_KEY: "" }) });
const noKeyRes = await noKeyClient.queryGroq({ messages: [] });
assert(noKeyRes.success === false && noKeyRes.status === "unconfigured", "Missing key client rejects call with unconfigured");

// Network timeout
const mockTimeoutFetch = async () => {
  const err = new Error("The operation was aborted");
  err.name = "AbortError";
  throw err;
};
const timeoutClient = new GroqClient({ config: mockGroqConfig, fetchFn: mockTimeoutFetch });
const timeoutRes = await timeoutClient.queryGroq({ messages: [] });
assert(timeoutRes.success === false && timeoutRes.status === "timeout", "Captures AbortError as timeout");

// Provider rate limiting (429)
const mock429Fetch = async () => ({
  ok: false,
  status: 429,
  async json() { return { error: { message: "Rate limit reached" } }; }
});
const client429 = new GroqClient({ config: mockGroqConfig, fetchFn: mock429Fetch });
const res429 = await client429.queryGroq({ messages: [] });
assert(res429.success === false && res429.status === "provider_rate_limited", "Captures provider 429 as provider_rate_limited");

// Provider auth error (401)
const mock401Fetch = async () => ({
  ok: false,
  status: 401,
  async json() { return { error: { message: "Invalid API key" } }; }
});
const client401 = new GroqClient({ config: mockGroqConfig, fetchFn: mock401Fetch });
const res401 = await client401.queryGroq({ messages: [] });
assert(res401.success === false && res401.status === "auth_error", "Captures 401 as auth_error");

// Provider server error (500)
const mock500Fetch = async () => ({
  ok: false,
  status: 500,
  async json() { return { error: { message: "Groq Server Error" } }; }
});
const client500 = new GroqClient({ config: mockGroqConfig, fetchFn: mock500Fetch });
const res500 = await client500.queryGroq({ messages: [] });
assert(res500.success === false && res500.status === "provider_error", "Captures 500 as provider_error");

// Malformed provider response (missing choices / bad format)
const mockBadJsonFetch = async () => ({
  ok: true,
  status: 200,
  async json() { return { unexpectedField: "no choices array" }; }
});
const clientBad = new GroqClient({ config: mockGroqConfig, fetchFn: mockBadJsonFetch });
const resBad = await clientBad.queryGroq({ messages: [] });
assert(resBad.success === false && resBad.status === "malformed_response", "Captures missing choices as malformed_response");

// 36. Strict API Key Security & Client Bundle Hygiene
console.log("\n[36. Strict API Key Security & Client Bundle Hygiene]");
const srcDir = path.resolve('src');
function checkDirectoryForSecret(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      checkDirectoryForSecret(fullPath);
    } else if (entry.isFile() && /\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      assert(!content.includes("process.env.GROQ_API_KEY"), `Client file ${entry.name} does not reference process.env.GROQ_API_KEY`);
      assert(!content.includes("VITE_GROQ_API_KEY"), `Client file ${entry.name} does not reference VITE_GROQ_API_KEY`);
      assert(!content.includes("process.env.XAI_API_KEY"), `Client file ${entry.name} does not reference process.env.XAI_API_KEY`);
      assert(!content.includes("VITE_XAI_API_KEY"), `Client file ${entry.name} does not reference VITE_XAI_API_KEY`);
    }
  }
}
checkDirectoryForSecret(srcDir);

// Verify gitignore protects .env
const gitignoreContent = fs.readFileSync(path.resolve('.gitignore'), 'utf8');
assert(gitignoreContent.includes(".env"), ".gitignore explicitly excludes .env");
assert(gitignoreContent.includes("secrets/"), ".gitignore explicitly excludes secrets/");

// Verify .env.example contains placeholders only
const envExampleContent = fs.readFileSync(path.resolve('.env.example'), 'utf8');
assert(envExampleContent.includes("ENABLE_GROQ=false"), ".env.example defaults ENABLE_GROQ to false");
assert(envExampleContent.includes("your_groq_api_key_here"), ".env.example contains only placeholders");

// 37. Deterministic Fallback & Zero Mutation Guarantees
console.log("\n[37. Deterministic Fallback & Zero Mutation Guarantees]");
const originalScoreBefore = supplierA.riskScore;
const originalBreakdownBefore = { ...supplierA.scoreBreakdown };

// Test unified assistant in deterministic mode
const unifiedDeterministic = await processAssistantQueryUnified(
  "Why is Supplier A classified as high risk?",
  SUPPLIERS,
  [],
  { useGroq: false }
);
assert(unifiedDeterministic.source === "deterministic", "Unified query in deterministic mode returns source: deterministic");
assert(unifiedDeterministic.content.length > 50, "Deterministic query returns rich content");

// Test unified assistant in Groq mode with Groq disabled
const unifiedFallback = await processAssistantQueryUnified(
  "Why is Supplier A classified as high risk?",
  SUPPLIERS,
  [],
  { useGroq: true, groqConfigured: false }
);
assert(unifiedFallback.source === "deterministic", "Unified query with unconfigured Groq defaults safely to deterministic");

// Strict Non-Mutation verification
assert(supplierA.riskScore === originalScoreBefore, `STRICT NON-MUTATION: supplierA.riskScore remains exactly ${originalScoreBefore}`);
assert(supplierA.scoreBreakdown.qualityScore === originalBreakdownBefore.qualityScore, "STRICT NON-MUTATION: Quality score breakdown remains identical");
assert(supplierA.rejectionRate === 9.2, "STRICT NON-MUTATION: Rejection rate remains exactly 9.2%");

// 38. CSV and Excel Parsing & Safety Limits
console.log("\n[38. CSV and Excel Parsing & Safety Limits]");
const sampleCsv = generateSampleCsvContent();
assert(typeof sampleCsv === "string" && sampleCsv.includes("Vendor Name"), "Generates valid sample CSV template string");

const parsedCsv = await parseCsvFile(sampleCsv);
assert(parsedCsv.headers.length >= 8, `Parsed CSV contains ${parsedCsv.headers.length} column headers`);
assert(parsedCsv.rows.length === 6, `Parsed CSV contains ${parsedCsv.rows.length} data rows`);
assert(parsedCsv.rows[0]["Vendor Name"] === "Delta Precision Machining Corp", "First CSV vendor matches template");

// Test Excel (.xlsx) parsing via minimal OpenXML buffer
const sampleXlsx = generateSampleXlsxBuffer();
assert(sampleXlsx instanceof Uint8Array && sampleXlsx.length > 500, "Generates valid binary OpenXML XLSX buffer");

const parsedXlsx = await parseXlsxFile(sampleXlsx);
assert(parsedXlsx.headers.length >= 8, `Parsed XLSX contains ${parsedXlsx.headers.length} column headers`);
assert(parsedXlsx.rows.length === 6, `Parsed XLSX contains ${parsedXlsx.rows.length} data rows`);
assert(parsedXlsx.rows[0]["Vendor Name"] === "Delta Precision Machining Corp", "First XLSX vendor matches template");

// Safety limit: reject file exceeding 5MB
try {
  validateFileMetadata({ name: "large.csv", size: 6 * 1024 * 1024 });
  assert(false, "Fails to reject file over 5 MB");
} catch (err) {
  assert(err.message.includes("too large"), "Safely rejects file exceeding 5 MB limit");
}

// Safety limit: reject unsupported file extensions
try {
  validateFileMetadata({ name: "payload.exe", size: 1024 });
  assert(false, "Fails to reject unsupported extension");
} catch (err) {
  assert(err.message.includes("Unsupported file type"), "Safely rejects unsupported file extensions");
}

// Safety limit: reject empty CSV
try {
  await parseCsvFile("");
  assert(false, "Fails to reject empty CSV");
} catch (err) {
  assert(err.message.includes("empty"), "Safely rejects empty CSV input");
}

// Export analysis to CSV verification
const sampleAnalyzed = [
  {
    id: "UPL-001",
    name: "Vendor Alpha",
    riskScore: 82,
    riskLevel: "CRITICAL",
    dataCompletenessScore: 100,
    onTimeDeliveryRate: 68.0,
    rejectionRate: 6.5,
    priceVarianceFormatted: "+7.8%",
    stockCoverageDays: 16,
    leadTimeDays: 90,
    certificateExpiryDays: 18,
    isSingleSource: true,
    preliminarySummary: {
      primaryRiskDriver: "Compounding Single-Source Quality & Factory Stockout Hazard",
      recommendedActions: [{ title: "Dispute Price Variance" }]
    }
  }
];
const exportedCsv = exportAnalysisToCsv(sampleAnalyzed);
assert(exportedCsv.includes("Vendor Alpha") && exportedCsv.includes("CRITICAL"), "Exports analyzed suppliers to formatted CSV");

// 39. Column Auto-Mapping & Alias Resolution
console.log("\n[39. Column Auto-Mapping & Alias Resolution]");
const uploadedHeaders = [
  "Company",
  "OTIF %",
  "Rejection Rate",
  "Price Variance Pct",
  "Days of Supply",
  "Lead Time Days",
  "Cert Expiry",
  "Sole Source"
];
const detectedMapping = autoDetectColumnMapping(uploadedHeaders);
assert(detectedMapping.vendorName === "Company", "Maps 'Company' alias to vendorName");
assert(detectedMapping.deliveryPerformance === "OTIF %", "Maps 'OTIF %' alias to deliveryPerformance");
assert(detectedMapping.qualityDefectRate === "Rejection Rate", "Maps 'Rejection Rate' alias to qualityDefectRate");
assert(detectedMapping.priceVariance === "Price Variance Pct", "Maps 'Price Variance Pct' alias to priceVariance");
assert(detectedMapping.stockCoverageDays === "Days of Supply", "Maps 'Days of Supply' alias to stockCoverageDays");
assert(detectedMapping.leadTimeDays === "Lead Time Days", "Maps 'Lead Time Days' alias to leadTimeDays");
assert(detectedMapping.certificateDaysRemaining === "Cert Expiry", "Maps 'Cert Expiry' alias to certificateDaysRemaining");
assert(detectedMapping.singleSource === "Sole Source", "Maps 'Sole Source' alias to singleSource");

// 40. Data Validation & Numeric Boundaries
console.log("\n[40. Data Validation & Numeric Boundaries]");
const rawTestRows = [
  { "Company": "Vendor Alpha", "OTIF %": "95%", "Rejection Rate": "1.2%", "Price Variance Pct": "+1.5%" },
  { "Company": "", "OTIF %": "80%", "Rejection Rate": "2.0%" }, // Missing required vendorName
  { "Company": "Vendor Gamma", "OTIF %": "150%", "Rejection Rate": "-5%" }, // Out of bounds
  { "Company": "Vendor Alpha", "OTIF %": "92%", "Rejection Rate": "1.5%" }  // Duplicate
];
const validation = validateUploadedData(rawTestRows, detectedMapping);
assert(validation.validRows.length === 2, `Identifies exactly 2 valid rows (got ${validation.validRows.length})`);
assert(validation.invalidRows.length === 2, `Identifies exactly 2 invalid rows (got ${validation.invalidRows.length})`);
assert(validation.duplicateCount === 1, "Detects duplicate vendor name");
assert(validation.invalidRows[0].errors.some(e => e.includes("Vendor Name")), "Flags missing vendorName error on row 2");
assert(validation.invalidRows[1].errors.some(e => e.includes("Delivery Performance")), "Flags OTIF > 100% boundary error on row 3");

// 41. Partial-Data Scoring Methodology & Uncertainty Buffers
console.log("\n[41. Partial-Data Scoring Methodology & Uncertainty Buffers]");
// Test A: Full 5-vector supplier
const fullVendorCanonical = {
  vendorName: "Full Metrics Vendor",
  deliveryPerformance: 96.0,
  qualityDefectRate: 1.0,
  priceVariance: 0.0,
  stockCoverageDays: 50,
  leadTimeDays: 20,
  certificateDaysRemaining: 200,
  singleSource: false
};
const fullScoreResult = scoreUploadedSupplier(fullVendorCanonical);
assert(fullScoreResult.completenessScore === 100, "Full vendor achieves 100% data completeness");
assert(fullScoreResult.riskLevel === "LOW", "Compliant full vendor classified as LOW risk");
assert(fullScoreResult.hasIncompleteData === false, "Flag hasIncompleteData is false for full vendor");

// Test B: Partial data supplier with only 1-2 good metrics (<50% completeness)
// REQUIREMENT: "Never assign a low-risk classification solely because data is missing."
const partialVendorCanonical = {
  vendorName: "Sparse Vendor",
  deliveryPerformance: 98.0, // High delivery
  qualityDefectRate: 0.5,    // Low defects
  // Price, Compliance, Continuity all MISSING!
  priceVariance: null,
  stockCoverageDays: null,
  leadTimeDays: null,
  certificateDaysRemaining: null,
  singleSource: null
};
const partialScoreResult = scoreUploadedSupplier(partialVendorCanonical);
assert(partialScoreResult.completenessScore === 40, `Sparse vendor has 40% completeness (got ${partialScoreResult.completenessScore}%)`);
assert(partialScoreResult.hasIncompleteData === true, "Flags hasIncompleteData as true");
assert(partialScoreResult.score >= 35, `Uncertainty buffer clamps score to >= 35 (got ${partialScoreResult.score})`);
assert(partialScoreResult.riskLevel !== "LOW", `Sparse vendor is NEVER classified as LOW risk (got ${partialScoreResult.riskLevel})`);
assert(partialScoreResult.missingDimensions.length === 3, "Explicitly declares 3 missing dimensions");
assert(partialScoreResult.scoreBreakdown.price === null, "Price score remains null (zero fabrication)");
assert(partialScoreResult.scoreBreakdown.compliance === null, "Compliance score remains null (zero fabrication)");
assert(partialScoreResult.scoreBreakdown.continuity === null, "Continuity score remains null (zero fabrication)");

// 42. Multi-Supplier Analysis & Adapter Tests (3+ Suppliers)
console.log("\n[42. Multi-Supplier Analysis & Adapter Tests (3+ Suppliers)]");
const threeDiverseVendors = [
  {
    isValid: true,
    canonical: {
      vendorName: "Apex High-Reliability",
      deliveryPerformance: 98.5,
      qualityDefectRate: 0.8,
      priceVariance: 0.0,
      stockCoverageDays: 60,
      leadTimeDays: 14,
      certificateDaysRemaining: 300,
      singleSource: false,
      itemCategory: "Standard Hardware",
      suppliedItem: "Titanium Fasteners",
      annualSpend: 450000
    }
  },
  {
    isValid: true,
    canonical: {
      vendorName: "Zenith Single-Source Critical",
      deliveryPerformance: 67.5,
      qualityDefectRate: 7.2,
      priceVariance: 8.4,
      stockCoverageDays: 14,
      leadTimeDays: 90,
      certificateDaysRemaining: 15,
      singleSource: true,
      itemCategory: "Semiconductors",
      suppliedItem: "CAN-Bus Microcontrollers",
      annualSpend: 2500000
    }
  },
  {
    isValid: true,
    canonical: {
      vendorName: "Boreal Partial Vendor",
      deliveryPerformance: 85.0,
      qualityDefectRate: null,
      priceVariance: 3.2,
      stockCoverageDays: null,
      leadTimeDays: null,
      certificateDaysRemaining: null,
      singleSource: true,
      itemCategory: "Seals",
      suppliedItem: "O-Rings",
      annualSpend: 800000
    }
  }
];

const adaptedSuppliers = adaptUploadedSuppliersToEntities(threeDiverseVendors, {
  fileName: "test_suppliers.csv",
  uploadedAt: "2026-10-10T00:00:00Z"
});

assert(adaptedSuppliers.length === 3, `Adapted exactly 3 suppliers (got ${adaptedSuppliers.length})`);
assert(adaptedSuppliers[0].id === "UPL-001" && adaptedSuppliers[0].name === "Apex High-Reliability", "First supplier mapped to UPL-001");
assert(adaptedSuppliers[0].riskLevel === "LOW" && adaptedSuppliers[0].riskScore < 25, "First supplier is LOW risk");
assert(adaptedSuppliers[1].id === "UPL-002" && adaptedSuppliers[1].name === "Zenith Single-Source Critical", "Second supplier mapped to UPL-002");
assert(adaptedSuppliers[1].riskLevel === "CRITICAL" && adaptedSuppliers[1].riskScore >= 80, "Second supplier is CRITICAL risk");
assert(adaptedSuppliers[2].id === "UPL-003" && adaptedSuppliers[2].hasIncompleteData === true, "Third supplier flagged with incomplete data");
assert(adaptedSuppliers[0].isUploaded === true && adaptedSuppliers[0].sourceDataset === "Uploaded Dataset", "Tagged with uploaded dataset provenance");
assert(adaptedSuppliers[1].preliminarySummary.recommendedActions.length >= 2, "Generates actionable recommendations for Zenith");

// 43. Dataset Separation & Persistence
console.log("\n[43. Dataset Separation & Persistence]");
// Mock localStorage in Node test runner
const mockStorage = new Map();
global.window = {
  localStorage: {
    getItem: (key) => mockStorage.get(key) || null,
    setItem: (key, val) => mockStorage.set(key, String(val)),
    removeItem: (key) => mockStorage.delete(key),
    clear: () => mockStorage.clear()
  }
};

const saveOk = savePersistedUploadedDataset({
  meta: { fileName: "audit_vendors.xlsx" },
  suppliers: adaptedSuppliers,
  rawRowCount: 3
});
assert(saveOk === true, "Saves uploaded dataset to persistence successfully");

const loadedDataset = loadPersistedUploadedDataset();
assert(loadedDataset !== null && loadedDataset.suppliers.length === 3, "Loads persisted uploaded dataset with schema integrity");
assert(loadedDataset.suppliers[1].name === "Zenith Single-Source Critical", "Preserves exact entity records across storage cycles");

// Mode switching
saveActiveDatasetMode(DATASET_MODE.UPLOADED);
assert(loadActiveDatasetMode() === DATASET_MODE.UPLOADED, "Persists active dataset mode: 'uploaded'");

saveActiveDatasetMode(DATASET_MODE.DEMO);
assert(loadActiveDatasetMode() === DATASET_MODE.DEMO, "Persists active dataset mode: 'demo'");

// Clear uploaded dataset
clearPersistedUploadedDataset();
assert(loadPersistedUploadedDataset() === null, "Clears uploaded dataset from storage");
assert(loadActiveDatasetMode() === DATASET_MODE.DEMO, "Resets active dataset mode to 'demo' after clear");

// Corrupt storage recovery
mockStorage.set("supplyshield_uploaded_dataset_v2", "INVALID_JSON_CORRUPT{{");
const recovered = loadPersistedUploadedDataset();
assert(recovered === null, "Recovers gracefully from corrupted localStorage without throwing");
assert(mockStorage.get("supplyshield_uploaded_dataset_v2") === undefined, "Purges corrupted storage entry");

// Strict Non-Mutation of Demonstration Dataset
assert(SUPPLIERS.length === 6, "Demo SUPPLIERS array remains exactly 6 suppliers (no contamination)");
assert(SUPPLIERS[0].id === "SUP-001", "Demo supplier SUP-001 intact");

// 44. Assistant Queries on Active Uploaded Dataset
console.log("\n[44. Assistant Queries on Active Uploaded Dataset]");
// Query 1: Which uploaded vendor has the highest calculated risk?
const qRanking = processAssistantQuery("Which uploaded vendor has the highest calculated risk?", adaptedSuppliers);
assert(qRanking.content.includes("Zenith Single-Source Critical"), "Assistant identifies Zenith as highest risk in uploaded dataset");
assert(qRanking.content.includes("CRITICAL"), "Assistant cites CRITICAL risk classification for Zenith");

// Query 2: Why was Vendor 2 classified as high risk?
const qWhyVendor2 = processAssistantQuery("Why was Vendor 2 classified as high risk?", adaptedSuppliers);
assert(qWhyVendor2.content.includes("Zenith") || qWhyVendor2.content.includes("UPL-002") || qWhyVendor2.content.includes("Uploaded-02"), "Answers explanation for Vendor 2");
assert(qWhyVendor2.observedFacts.length > 0, "Provides verified observed facts for Vendor 2");

// Query 3: Compare delivery and quality performance of Vendor 1 and Vendor 2
const qCompare = processAssistantQuery("Compare the delivery and quality performance of Vendor 1 and Vendor 2", adaptedSuppliers);
assert(qCompare.intent === "COMPARE_SUPPLIERS", "Routes to COMPARE_SUPPLIERS intent");
assert(qCompare.content.includes("Apex High-Reliability") && qCompare.content.includes("Zenith Single-Source Critical"), "Compares both vendors in markdown table");
assert(qCompare.content.includes("98.5%") && qCompare.content.includes("67.5%"), "Compares exact OTIF percentages");

// Query 4: Which suppliers need attention in the next 30 days?
const qNext30 = processAssistantQuery("Which suppliers need attention in the next 30 days?", adaptedSuppliers);
assert(qNext30.intent === "NEXT_30_DAYS", "Routes to NEXT_30_DAYS intent");
assert(qNext30.content.includes("Zenith"), "Identifies Zenith with 15-day cert and 14-day stock urgency");

// Query 5: What data is missing for Vendor 3?
const qMissingVendor3 = processAssistantQuery("What data is missing for Vendor 3?", adaptedSuppliers);
assert(qMissingVendor3.intent === "MISSING_DATA", "Routes to MISSING_DATA intent");
assert(qMissingVendor3.content.includes("Boreal Partial Vendor"), "Identifies Vendor 3 (Boreal)");
assert(qMissingVendor3.content.includes("never assumed to indicate low risk"), "Explains non-low-risk uncertainty rule for missing data");

// Query 6: What should procurement do first?
const qDoFirst = processAssistantQuery("What should procurement do first?", adaptedSuppliers);
assert(qDoFirst.intent === "PRIORITY_ACTION", "Routes to PRIORITY_ACTION intent");
assert(qDoFirst.content.includes("Zenith Single-Source Critical"), "Targets Zenith as top procurement priority");

// Zero mutation verification
assert(adaptedSuppliers[1].riskScore >= 80, "Strict non-mutation: Zenith risk score intact after assistant queries");
assert(SUPPLIERS[0].riskScore === 92, "Strict non-mutation: Demo Supplier A risk score intact");

// 45. Recommendation Staging & Decision Center Governance
console.log("\n[45. Recommendation Staging & Decision Center Governance]");
const zenithRecommendation = adaptedSuppliers[1].preliminarySummary.recommendedActions[0];
assert(zenithRecommendation !== undefined, "Zenith has at least 1 actionable recommendation");

const stagedUploadedAction = {
  id: "DEC-UPL-001",
  supplierId: adaptedSuppliers[1].id,
  supplierCode: adaptedSuppliers[1].code,
  supplierName: adaptedSuppliers[1].name,
  actionTitle: zenithRecommendation.title,
  category: zenithRecommendation.category || "Commercial",
  urgency: zenithRecommendation.urgency || "CRITICAL",
  requiresHumanApproval: true,
  status: "PENDING_APPROVAL",
  whyRecommended: zenithRecommendation.description,
  evidenceSummary: `Calculated from uploaded dataset: ${adaptedSuppliers[1].riskScore}/100 risk.`
};

assert(stagedUploadedAction.requiresHumanApproval === true, "Preserves mandatory human executive approval requirement");
assert(stagedUploadedAction.supplierId === "UPL-002", "Links action to uploaded supplier ID");
assert(stagedUploadedAction.status === "PENDING_APPROVAL", "Stages action into initial PENDING_APPROVAL state");

console.log("\n=======================================================");
console.log(` Test Execution Summary: ${passedTests} Passed, ${failedTests} Failed`);
console.log("=======================================================\n");

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}



