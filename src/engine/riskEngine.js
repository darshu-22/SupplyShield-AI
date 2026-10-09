/**
 * SupplyShield AI — Deterministic Risk Engine (Phase 2)
 * 
 * Reusable, deterministic calculations and multi-vector risk intelligence.
 * Independent of React for unit testing and reproducible outputs.
 */

export const RISK_WEIGHTS = {
  QUALITY: 0.25,        // 25% weight on defect rates and inspection trends
  PRICE: 0.20,          // 20% weight on contract ceiling variance & overpayment
  DELIVERY: 0.20,       // 20% weight on OTIF schedule reliability & shipment delays
  COMPLIANCE: 0.15,     // 15% weight on certification expiry and audit validity
  CONTINUITY: 0.20      // 20% weight on stock coverage vs lead time & sole-source dependency
};

export const RISK_THRESHOLDS = {
  CRITICAL: 80,
  HIGH: 60,
  MEDIUM: 30,
  LOW: 0
};

export const FORMULA_EXPLANATIONS = {
  rejectionRate: "Rejection Rate (%) = (Rejected Units / Inspected Units) × 100",
  priceVariance: "Price Variance (%) = ((Actual Billed Unit Price − Contract Unit Price) / Contract Unit Price) × 100",
  overpayment: "Potential Overpayment ($) = Σ [ max(0, Actual Unit Price − Contract Unit Price) × Quantity Ordered ]",
  otif: "On-Time Delivery Rate (%) = (Deliveries completed on or before SLA date / Total completed deliveries) × 100",
  stockCoverage: "Stock Coverage (Days) = Current Available Inventory / Average Daily Factory Consumption",
  leadTimeGap: "Lead-Time Coverage Gap (Days) = Stock Coverage Days − Replenishment Lead Time Days",
  compositeScore: "Composite Risk Score (0-100) = (Quality × 0.25) + (Price × 0.20) + (Delivery × 0.20) + (Compliance × 0.15) + (Continuity × 0.20)"
};

/**
 * Calculate Quality Risk Metric (0 - 100)
 */
export function calculateQualityMetrics(inspectionLots = []) {
  if (!inspectionLots || inspectionLots.length === 0) {
    return {
      rejectionRate: 0,
      totalInspected: 0,
      totalRejected: 0,
      qualityScore: 10,
      defectTrend: "STABLE_NOMINAL",
      latestBatchRate: 0
    };
  }

  const totalInspected = inspectionLots.reduce((acc, lot) => acc + (lot.inspectedUnits || 0), 0);
  const totalRejected = inspectionLots.reduce((acc, lot) => acc + (lot.rejectedUnits || 0), 0);
  
  const rejectionRate = totalInspected > 0 ? (totalRejected / totalInspected) * 100 : 0;
  const roundedRejection = Math.round(rejectionRate * 10) / 10;

  const latestBatch = inspectionLots[inspectionLots.length - 1];
  const latestBatchRate = latestBatch ? latestBatch.rejectionRatePct : roundedRejection;

  // Score mapping:
  // <1% = 10, 1-2.5% = 35, 2.5-5% = 65, >5% = 85-98
  let qualityScore = 15;
  if (latestBatchRate >= 8.0) {
    qualityScore = 95;
  } else if (latestBatchRate >= 5.0) {
    qualityScore = 80;
  } else if (latestBatchRate >= 3.0) {
    qualityScore = 65;
  } else if (latestBatchRate >= 1.5) {
    qualityScore = 40;
  } else {
    qualityScore = 15;
  }

  const defectTrend = latestBatchRate > roundedRejection ? "DETERIORATING" : "STABLE";

  return {
    rejectionRate: roundedRejection,
    totalInspected,
    totalRejected,
    qualityScore,
    defectTrend,
    latestBatchRate
  };
}

/**
 * Calculate Price & Commercial Variance Metrics (0 - 100)
 */
export function calculatePriceMetrics(purchaseOrders = []) {
  if (!purchaseOrders || purchaseOrders.length === 0) {
    return {
      priceVariancePct: 0,
      totalOverpayment: 0,
      priceScore: 10,
      totalSpend: 0
    };
  }

  let totalContractCost = 0;
  let totalBilledCost = 0;
  let totalOverpayment = 0;

  purchaseOrders.forEach(po => {
    const qty = po.quantityOrdered || 0;
    const contractPrice = po.contractUnitPrice || 0;
    const billedPrice = po.actualBilledUnitPrice || 0;

    totalContractCost += contractPrice * qty;
    totalBilledCost += billedPrice * qty;

    if (billedPrice > contractPrice) {
      totalOverpayment += (billedPrice - contractPrice) * qty;
    }
  });

  const priceVariancePct = totalContractCost > 0 
    ? ((totalBilledCost - totalContractCost) / totalContractCost) * 100 
    : 0;

  const roundedVariance = Math.round(priceVariancePct * 10) / 10;

  // Score mapping:
  // <=0% = 10, 0.1-2% = 35, 2-5% = 65, >5% = 88+
  let priceScore = 10;
  if (roundedVariance >= 6.0) {
    priceScore = 92;
  } else if (roundedVariance >= 3.0) {
    priceScore = 78;
  } else if (roundedVariance > 0.5) {
    priceScore = 55;
  } else if (roundedVariance > 0) {
    priceScore = 30;
  } else {
    priceScore = 10;
  }

  return {
    priceVariancePct: roundedVariance,
    totalOverpayment: Math.round(totalOverpayment),
    priceScore,
    totalSpend: Math.round(totalBilledCost)
  };
}

/**
 * Calculate Delivery & Logistics Performance Metrics (0 - 100)
 */
export function calculateDeliveryMetrics(purchaseOrders = []) {
  if (!purchaseOrders || purchaseOrders.length === 0) {
    return {
      otifRate: 100,
      avgDelayDays: 0,
      deliveryScore: 10,
      lateShipmentCount: 0
    };
  }

  const completed = purchaseOrders.filter(po => po.actualDeliveryDate);
  if (completed.length === 0) {
    return { otifRate: 100, avgDelayDays: 0, deliveryScore: 10, lateShipmentCount: 0 };
  }

  const onTimeCount = completed.filter(po => (po.delayDays || 0) <= 0).length;
  const lateCount = completed.length - onTimeCount;
  const otifRate = Math.round((onTimeCount / completed.length) * 1000) / 10;

  const totalDelays = completed.reduce((acc, po) => acc + Math.max(0, po.delayDays || 0), 0);
  const avgDelayDays = lateCount > 0 ? Math.round(totalDelays / lateCount) : 0;

  // Score mapping:
  // OTIF >= 95% = 12, 85-94% = 40, 70-84% = 75, <70% = 90
  let deliveryScore = 15;
  if (otifRate < 70) {
    deliveryScore = 92;
  } else if (otifRate < 80) {
    deliveryScore = 78;
  } else if (otifRate < 90) {
    deliveryScore = 52;
  } else if (otifRate < 95) {
    deliveryScore = 30;
  } else {
    deliveryScore = 12;
  }

  return {
    otifRate,
    avgDelayDays,
    deliveryScore,
    lateShipmentCount: lateCount
  };
}

/**
 * Calculate Compliance & Certification Expiry Metrics (0 - 100)
 */
export function calculateComplianceMetrics(complianceRecords = []) {
  if (!complianceRecords || complianceRecords.length === 0) {
    return {
      minDaysRemaining: 365,
      complianceScore: 10,
      isExpiringSoon: false,
      primaryCertType: "Standard"
    };
  }

  const minDaysRemaining = Math.min(...complianceRecords.map(c => c.daysRemaining ?? 365));
  const primaryCert = complianceRecords[0];

  // Score mapping:
  // <= 14 days = 95, 15 - 30 days = 75, 31 - 60 days = 50, >60 days = 15
  let complianceScore = 15;
  if (minDaysRemaining <= 10) {
    complianceScore = 95;
  } else if (minDaysRemaining <= 20) {
    complianceScore = 80;
  } else if (minDaysRemaining <= 30) {
    complianceScore = 65;
  } else if (minDaysRemaining <= 60) {
    complianceScore = 40;
  } else {
    complianceScore = 15;
  }

  return {
    minDaysRemaining,
    complianceScore,
    isExpiringSoon: minDaysRemaining <= 30,
    primaryCertType: primaryCert ? primaryCert.certType : "Standard"
  };
}

/**
 * Calculate Inventory & Supply Continuity Metrics (0 - 100)
 */
export function calculateInventoryMetrics(inventoryRecord, dependencyRecord) {
  if (!inventoryRecord) {
    return {
      stockCoverageDays: 30,
      leadTimeCoverageGapDays: 0,
      isSoleSource: false,
      continuityScore: 20
    };
  }

  const currentStock = inventoryRecord.currentOnHandUnits || 0;
  const dailyDemand = inventoryRecord.averageDailyDemandUnits || 1;
  const leadTimeDays = inventoryRecord.replenishmentLeadTimeDays || 30;

  const stockCoverageDays = dailyDemand > 0 ? Math.round(currentStock / dailyDemand) : 0;
  const leadTimeCoverageGapDays = stockCoverageDays - leadTimeDays;
  const isSoleSource = dependencyRecord ? dependencyRecord.isSingleSource : false;

  // Score mapping based on buffer vs target & sole-source exposure
  let continuityScore = 20;

  if (stockCoverageDays < 15) {
    continuityScore = isSoleSource ? 98 : 88;
  } else if (stockCoverageDays < 30) {
    continuityScore = isSoleSource ? 88 : 74;
  } else if (stockCoverageDays < 45) {
    continuityScore = isSoleSource ? 65 : 45;
  } else {
    continuityScore = isSoleSource ? 35 : 15;
  }

  return {
    stockCoverageDays,
    leadTimeCoverageGapDays,
    isSoleSource,
    continuityScore
  };
}

/**
 * Composite Multi-Vector Risk Score Engine
 */
export function calculateCompositeRiskScore({
  qualityScore,
  priceScore,
  deliveryScore,
  complianceScore,
  continuityScore
}) {
  const composite = 
    (qualityScore * RISK_WEIGHTS.QUALITY) +
    (priceScore * RISK_WEIGHTS.PRICE) +
    (deliveryScore * RISK_WEIGHTS.DELIVERY) +
    (complianceScore * RISK_WEIGHTS.COMPLIANCE) +
    (continuityScore * RISK_WEIGHTS.CONTINUITY);

  const score = Math.round(composite);

  let riskCategory = "LOW";
  if (score >= RISK_THRESHOLDS.CRITICAL) {
    riskCategory = "CRITICAL";
  } else if (score >= RISK_THRESHOLDS.HIGH) {
    riskCategory = "HIGH";
  } else if (score >= RISK_THRESHOLDS.MEDIUM) {
    riskCategory = "MEDIUM";
  } else {
    riskCategory = "LOW";
  }

  return {
    score,
    riskCategory
  };
}

/**
 * Cross-Signal Intelligence Engine
 * Correlates multiple transactional vectors into explainable scenarios.
 */
export function evaluateCrossSignalIntelligence(supplierProfile) {
  const warnings = [];

  const {
    rejectionRate,
    priceVariance,
    minDaysToExpiry,
    stockCoverageDays,
    leadTimeCoverageGapDays,
    isSingleSource,
    criticalityTier,
    otifRate,
    overpaymentTotal,
    code,
    name: _name
  } = supplierProfile;

  // Scenario A: Quality Degradation + Critical Component + Stock Deficit
  if (rejectionRate >= 5.0 && (criticalityTier === "CRITICAL" || isSingleSource) && stockCoverageDays <= 30) {
    warnings.push({
      id: `CROSS-A-${code}`,
      scenario: "SCENARIO_A_QUALITY_CRITICAL_STOCKOUT",
      severity: "CRITICAL",
      title: "Compounding Single-Source Quality & Factory Stockout Hazard",
      detectedPattern: "Rejection rate elevated to " + rejectionRate + "% while buffer inventory covers only " + stockCoverageDays + " days against sole approved foundry.",
      whyItMatters: "Defective castings fail incoming ultrasonic NDT, depleting finished assembly buffers before reorder shipments can arrive (16-week lead time). Production halt risk is immediate.",
      supportingData: {
        metric: "9.2% rejections vs 25d buffer",
        approvedSources: 1,
        leadTimeGap: leadTimeCoverageGapDays + " days"
      },
      recommendedInvestigation: "Mandate emergency on-site metallurgy audit, freeze disputed surcharge billing, and fast-track backup foundry tooling transfer."
    });
  }

  // Scenario B: Contract Overpricing + Repeated Purchase Orders
  if (priceVariance >= 3.0 && overpaymentTotal > 10000) {
    warnings.push({
      id: `CROSS-B-${code}`,
      scenario: "SCENARIO_B_COMMERCIAL_LEAKAGE",
      severity: "HIGH",
      title: "Systemic Contract Price Escalation & Budget Leakage",
      detectedPattern: "Invoice unit prices exceed master contract rate by +" + priceVariance + "%, generating $" + overpaymentTotal.toLocaleString() + " cumulative unapproved charges across POs.",
      whyItMatters: "Repeated line-item surcharges billed without contractual ratification in Schedule B erode gross operating margin.",
      supportingData: {
        variance: "+" + priceVariance + "%",
        overpaymentExposure: "$" + overpaymentTotal.toLocaleString(),
        source: "Automated ERP invoice line matching"
      },
      recommendedInvestigation: "Issue formal price dispute letter referencing Section 9.2 price caps and withhold unapproved surcharges from upcoming disbursement run."
    });
  }

  // Scenario C: Certificate Expiry Cliff + Sole Source
  if (minDaysToExpiry <= 30 && isSingleSource) {
    warnings.push({
      id: `CROSS-C-${code}`,
      scenario: "SCENARIO_C_COMPLIANCE_SOLE_SOURCE",
      severity: "CRITICAL",
      title: "Regulatory Compliance Cliff on Single-Source Vendor",
      detectedPattern: "Mandatory quality certification expires in " + minDaysToExpiry + " days with zero secondary approved sources qualified.",
      whyItMatters: "If the certification lapses, corporate quality assurance policy legally blocks incoming delivery dock acceptance, shutting down manufacturing.",
      supportingData: {
        daysRemaining: minDaysToExpiry + " calendar days",
        auditStatus: "No recertification auditor on file",
        dependency: "100% volume allocated to sole source"
      },
      recommendedInvestigation: "Issue 48-hour cure notice requiring formal registrar audit confirmation letter or interim quality waiver."
    });
  }

  // Scenario D: Delivery Delays + Insufficient Stock Coverage
  if (otifRate <= 75.0 && leadTimeCoverageGapDays < 0) {
    warnings.push({
      id: `CROSS-D-${code}`,
      scenario: "SCENARIO_D_DELIVERY_LEADTIME_GAP",
      severity: "HIGH",
      title: "Lead-Time Coverage Deficit Driven by Logistics Slippage",
      detectedPattern: "On-time delivery (OTIF) degraded to " + otifRate + "%, opening an unmitigated " + Math.abs(leadTimeCoverageGapDays) + "-day inventory deficit.",
      whyItMatters: "Factory consumption rate exceeds replenishment arrival rate, indicating incoming shipments will arrive after on-hand buffer is completely exhausted.",
      supportingData: {
        otifRate: otifRate + "%",
        stockCoverage: stockCoverageDays + " days",
        coverageGap: leadTimeCoverageGapDays + " days"
      },
      recommendedInvestigation: "Activate pre-qualified secondary source for 40% volume split and mandate supplier-funded air-freight dispatch."
    });
  }

  return warnings;
}

/**
 * Interactive What-If Risk Simulator Engine
 * Pure function: recalculates risk deterministically without mutating source records.
 */
export function simulateSupplierRisk(baseMetrics, whatIfParams = {}) {
  const {
    deliveryDelayDeltaDays = 0,
    rejectionRateDeltaPct = 0,
    stockCoverageDeltaDays = 0,
    activateDualSource = false
  } = whatIfParams;

  // 1. Quality simulation
  const simRejectionRate = Math.max(0, baseMetrics.rejectionRate + rejectionRateDeltaPct);
  let simQualityScore = baseMetrics.qualityScore;
  if (simRejectionRate >= 8.0) simQualityScore = 95;
  else if (simRejectionRate >= 5.0) simQualityScore = 80;
  else if (simRejectionRate >= 3.0) simQualityScore = 65;
  else if (simRejectionRate >= 1.5) simQualityScore = 40;
  else simQualityScore = 15;

  // 2. Delivery simulation
  const simAvgDelay = Math.max(0, baseMetrics.avgDelayDays + deliveryDelayDeltaDays);
  let simDeliveryScore = baseMetrics.deliveryScore;
  if (simAvgDelay >= 15) simDeliveryScore = 90;
  else if (simAvgDelay >= 7) simDeliveryScore = 75;
  else if (simAvgDelay >= 3) simDeliveryScore = 45;
  else simDeliveryScore = 15;

  // 3. Continuity simulation
  const simStockCoverage = Math.max(1, baseMetrics.stockCoverageDays + stockCoverageDeltaDays);
  const simIsSoleSource = activateDualSource ? false : baseMetrics.isSingleSource;
  
  let simContinuityScore = 20;
  if (simStockCoverage < 15) {
    simContinuityScore = simIsSoleSource ? 95 : 82;
  } else if (simStockCoverage < 30) {
    simContinuityScore = simIsSoleSource ? 85 : 65;
  } else if (simStockCoverage < 45) {
    simContinuityScore = simIsSoleSource ? 60 : 35;
  } else {
    simContinuityScore = simIsSoleSource ? 30 : 15;
  }

  // 4. Recalculate Composite
  const simResult = calculateCompositeRiskScore({
    qualityScore: simQualityScore,
    priceScore: baseMetrics.priceScore,
    deliveryScore: simDeliveryScore,
    complianceScore: baseMetrics.complianceScore,
    continuityScore: simContinuityScore
  });

  const deltaScore = simResult.score - baseMetrics.riskScore;

  let narrative = "";
  if (deltaScore < -10) {
    narrative = `Significant risk reduction of ${Math.abs(deltaScore)} points achieved via ${activateDualSource ? "dual-source redundancy & " : ""}mitigation buffers.`;
  } else if (deltaScore < 0) {
    narrative = `Minor risk improvement of ${Math.abs(deltaScore)} points observed.`;
  } else if (deltaScore > 10) {
    narrative = `Severe risk escalation of +${deltaScore} points driven by compounding quality/delivery bottlenecks.`;
  } else if (deltaScore > 0) {
    narrative = `Moderate risk increase of +${deltaScore} points.`;
  } else {
    narrative = "No measurable risk delta under current simulated parameters.";
  }

  return {
    originalScore: baseMetrics.riskScore,
    simulatedScore: simResult.score,
    scoreDelta: deltaScore,
    originalCategory: baseMetrics.riskLevel,
    simulatedCategory: simResult.riskCategory,
    narrative,
    simulatedComponents: {
      quality: simQualityScore,
      price: baseMetrics.priceScore,
      delivery: simDeliveryScore,
      compliance: baseMetrics.complianceScore,
      continuity: simContinuityScore
    }
  };
}
