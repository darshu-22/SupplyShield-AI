/**
 * SupplyShield AI — What-If Scenario Engine (Phase 4)
 * 
 * Reusable simulation service that applies hypothetical changes to a cloned copy
 * of supplier operational metrics and deterministically recalculates multi-vector risk scores.
 * 
 * Strict Guarantees:
 * - NEVER mutates original supplier records or base risk metrics.
 * - Explains which metrics changed and which remained constant.
 * - Labels all results as strictly hypothetical demonstration models.
 */

import { calculateCompositeRiskScore } from '../engine/riskEngine.js';

/**
 * Execute a what-if risk mitigation scenario on a supplier
 */
export function executeWhatIfScenario(supplier, scenarioOptions = {}) {
  if (!supplier) {
    return {
      success: false,
      error: "No supplier specified for what-if simulation",
      isHypothetical: true
    };
  }

  const {
    stockCoverageDeltaDays = 0,
    rejectionRateDeltaPct = 0,
    deliveryDelayDeltaDays = 0,
    activateDualSource = false,
    resolvePriceVariance = false,
    renewCertificate = false
  } = scenarioOptions;

  // Base metrics (defensive shallow copy, zero mutation)
  const originalScore = supplier.riskScore;
  const originalCategory = supplier.riskLevel;
  const breakdown = { ...(supplier.scoreBreakdown || {}) };

  const changedMetrics = [];
  const unchangedMetrics = [];

  // 1. Quality simulation
  let simQualityScore = breakdown.quality || 50;
  const baseRejection = supplier.rejectionRate || 2.0;
  if (rejectionRateDeltaPct !== 0) {
    const simRejection = Math.max(0, baseRejection + rejectionRateDeltaPct);
    if (simRejection >= 8.0) simQualityScore = 95;
    else if (simRejection >= 5.0) simQualityScore = 80;
    else if (simRejection >= 3.0) simQualityScore = 65;
    else if (simRejection >= 1.5) simQualityScore = 40;
    else simQualityScore = 15;

    changedMetrics.push({
      metric: "Quality Rejection Rate",
      original: `${baseRejection}%`,
      hypothetical: `${Math.round(simRejection * 10) / 10}%`,
      delta: `${rejectionRateDeltaPct > 0 ? '+' : ''}${rejectionRateDeltaPct}%`
    });
  } else {
    unchangedMetrics.push("Quality Rejection Rate");
  }

  // 2. Price simulation
  let simPriceScore = breakdown.price || 40;
  const baseVariance = supplier.priceVariance || 0;
  if (resolvePriceVariance) {
    simPriceScore = 10; // Nominal 0% variance
    changedMetrics.push({
      metric: "Contract Price Variance",
      original: `+${baseVariance}% ($${(supplier.quarterlyOverpaymentExposure || 0).toLocaleString()} overpayment)`,
      hypothetical: "0.0% ($0 overpayment)",
      delta: `-${baseVariance}% (Overpayment Eliminated)`
    });
  } else {
    unchangedMetrics.push("Contract Price Variance");
  }

  // 3. Delivery simulation
  let simDeliveryScore = breakdown.delivery || 50;
  const baseDelay = supplier.avgDelayDays || 5;
  if (deliveryDelayDeltaDays !== 0) {
    const simDelay = Math.max(0, baseDelay + deliveryDelayDeltaDays);
    if (simDelay >= 15) simDeliveryScore = 90;
    else if (simDelay >= 7) simDeliveryScore = 75;
    else if (simDelay >= 3) simDeliveryScore = 45;
    else simDeliveryScore = 15;

    changedMetrics.push({
      metric: "Average Delivery Delay",
      original: `${baseDelay} days`,
      hypothetical: `${simDelay} days`,
      delta: `${deliveryDelayDeltaDays > 0 ? '+' : ''}${deliveryDelayDeltaDays} days`
    });
  } else {
    unchangedMetrics.push("Delivery Performance");
  }

  // 4. Compliance simulation
  let simComplianceScore = breakdown.compliance || 40;
  const baseDaysRemaining = supplier.certificateExpiryDays || 90;
  if (renewCertificate) {
    simComplianceScore = 15; // Fully renewed
    changedMetrics.push({
      metric: "Accreditation Expiry Countdown",
      original: `${baseDaysRemaining} days remaining`,
      hypothetical: "365 days (Audited Certificate Renewed)",
      delta: `+${365 - baseDaysRemaining} days`
    });
  } else {
    unchangedMetrics.push("Accreditation Validity");
  }

  // 5. Inventory Continuity simulation
  let simContinuityScore = breakdown.continuity || 50;
  const baseStockCoverage = supplier.stockCoverageDays || 25;
  const isSoleSource = activateDualSource ? false : (supplier.isSingleSource || false);

  if (stockCoverageDeltaDays !== 0 || activateDualSource) {
    const simStock = Math.max(1, baseStockCoverage + stockCoverageDeltaDays);

    if (simStock < 15) {
      simContinuityScore = isSoleSource ? 95 : 82;
    } else if (simStock < 30) {
      simContinuityScore = isSoleSource ? 85 : 65;
    } else if (simStock < 45) {
      simContinuityScore = isSoleSource ? 60 : 35;
    } else {
      simContinuityScore = isSoleSource ? 30 : 15;
    }

    if (stockCoverageDeltaDays !== 0) {
      changedMetrics.push({
        metric: "Factory Stock Buffer",
        original: `${baseStockCoverage} days`,
        hypothetical: `${simStock} days`,
        delta: `${stockCoverageDeltaDays > 0 ? '+' : ''}${stockCoverageDeltaDays} days`
      });
    }

    if (activateDualSource) {
      changedMetrics.push({
        metric: "Supplier Dependency Structure",
        original: "Sole Source (100% Volume)",
        hypothetical: "Dual-Sourced (Redundant Line Qualified)",
        delta: "Secondary Vendor Split"
      });
    }
  } else {
    unchangedMetrics.push("Inventory & Supply Continuity");
  }

  // Recalculate deterministic composite score
  const newComposite = calculateCompositeRiskScore({
    qualityScore: simQualityScore,
    priceScore: simPriceScore,
    deliveryScore: simDeliveryScore,
    complianceScore: simComplianceScore,
    continuityScore: simContinuityScore
  });

  const hypotheticalScore = newComposite.score;
  const hypotheticalCategory = newComposite.riskCategory;
  const scoreDelta = hypotheticalScore - originalScore;

  // Formulate explainable analytical narrative
  let narrative = "";
  if (scoreDelta < -15) {
    narrative = `Significant risk mitigation: Hypothetical adjustments reduce risk by ${Math.abs(scoreDelta)} points, shifting ${supplier.code} from ${originalCategory} (${originalScore}) down to ${hypotheticalCategory} (${hypotheticalScore}).`;
  } else if (scoreDelta < 0) {
    narrative = `Moderate risk mitigation: Hypothetical adjustments yield an improvement of ${Math.abs(scoreDelta)} points (moving from ${originalCategory} ${originalScore} to ${hypotheticalCategory} ${hypotheticalScore}).`;
  } else if (scoreDelta > 10) {
    narrative = `Substantial risk escalation: Deteriorating parameters add +${scoreDelta} risk points, elevating ${supplier.code} to ${hypotheticalCategory} (${hypotheticalScore}).`;
  } else if (scoreDelta > 0) {
    narrative = `Moderate risk increase of +${scoreDelta} points observed under simulated conditions.`;
  } else {
    narrative = `No measurable net risk score change observed under the tested parameter combination.`;
  }

  return {
    success: true,
    isHypothetical: true,
    supplierId: supplier.id,
    supplierCode: supplier.code,
    supplierName: supplier.name,
    originalScore,
    hypotheticalScore,
    scoreDelta,
    originalCategory,
    hypotheticalCategory,
    changedMetrics,
    unchangedMetrics,
    narrative,
    simulatedBreakdown: {
      quality: simQualityScore,
      price: simPriceScore,
      delivery: simDeliveryScore,
      compliance: simComplianceScore,
      continuity: simContinuityScore
    },
    safetyNotice: "Hypothetical demonstration simulation. Base vendor records and transactional ERP logs remain completely unmodified."
  };
}
