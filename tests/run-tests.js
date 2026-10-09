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

console.log("\n=======================================================");
console.log(` Test Execution Summary: ${passedTests} Passed, ${failedTests} Failed`);
console.log("=======================================================\n");

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
