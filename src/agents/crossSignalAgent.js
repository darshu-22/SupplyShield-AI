/**
 * SupplyShield AI — Agent B: Cross-Signal Intelligence Agent (Phase 3)
 * 
 * Identifies systemic multi-vector risk convergence where multiple isolated signals
 * compound into critical operational hazards.
 * Avoids duplicate alerts and provides transparent reasoning based on actual findings.
 */

export function runCrossSignalAgent(investigationResult, supplier) {
  const startTime = Date.now();

  if (!investigationResult || investigationResult.status === "FAILED") {
    return {
      agentName: "Cross-Signal Intelligence Agent",
      status: "FAILED",
      error: "Missing or invalid investigation input",
      scenariosDetected: [],
      executionTimeMs: 0
    };
  }

  const findings = investigationResult.findings || [];
  const scenariosDetected = [];

  // Helper to retrieve specific vector finding
  const getFinding = (vector) => findings.find(f => f.vector === vector);

  const qualFinding = getFinding("QUALITY");
  const priceFinding = getFinding("PRICE");
  const delivFinding = getFinding("DELIVERY");
  const complFinding = getFinding("COMPLIANCE");
  const invFinding = getFinding("INVENTORY");
  const depFinding = getFinding("DEPENDENCY");

  // SCENARIO 1: High Defect Rate + Critical Part + Insufficient Stock Coverage
  // Threat: Defective parts cannot be rejected without shutting down factory lines
  const hasHighDefects = qualFinding && (qualFinding.metrics?.latestLotRejectionRatePct >= 4.0 || qualFinding.metrics?.seriesAverageRejectionRatePct >= 3.0);
  const isCriticalPart = depFinding && (depFinding.metrics?.criticalityTier === "CRITICAL" || depFinding.metrics?.criticalityTier === "HIGH");
  const hasInsufficientStock = invFinding && (invFinding.metrics?.leadTimeCoverageGapDays < 0 || invFinding.metrics?.stockCoverageDays < (invFinding.metrics?.targetSafetyStockDays || 30));

  if (hasHighDefects && isCriticalPart && hasInsufficientStock) {
    const defectRate = qualFinding.metrics?.latestLotRejectionRatePct || qualFinding.metrics?.seriesAverageRejectionRatePct;
    const stockDays = invFinding.metrics?.stockCoverageDays;
    const targetDays = invFinding.metrics?.targetSafetyStockDays;

    scenariosDetected.push({
      scenarioId: `CS-SCENARIO-A-${supplier.id}`,
      scenarioType: "QUALITY_BUFFER_CRITICALITY_CONVERGENCE",
      title: "Quality Rejection Spike on Critical Part with Depleted Buffer",
      severity: "CRITICAL",
      convergingFactors: [
        `Incoming defect rejection at ${defectRate}% (exceeds 2.0% SLA)`,
        `Component classified as ${depFinding.metrics?.criticalityTier} manufacturing criticality tier`,
        `Factory stock buffer at ${stockDays} days (below ${targetDays}-day safety baseline)`
      ],
      detectedPattern: `Incoming inspection lots exhibit an escalating rejection rate of ${defectRate}%. Because factory on-hand inventory is depleted to ${stockDays} days, rejecting non-conforming lots will immediately induce an unmitigated line-stop.`,
      whyItMatters: "Quality Assurance cannot quarantine or reject sub-par batches without triggering a factory assembly halt. This forces an unacceptable trade-off between product safety/scrap risk and immediate line stoppage.",
      supportingEvidence: {
        latestLotRejection: `${defectRate}%`,
        inspectionLotsReferenced: qualFinding.supportingRecords?.lotNumbers || [],
        stockCoverageDays: stockDays,
        leadTimeCoverageGap: `${invFinding.metrics?.leadTimeCoverageGapDays} days`,
        criticalityTier: depFinding.metrics?.criticalityTier
      },
      recommendedInterventionType: "QUALITY_SAFETY_INTERVENTION"
    });
  }

  // SCENARIO 2: Unauthorized Price Variance + Repeated Purchase Orders
  // Threat: Systematic commercial budget leakage across ERP cycles
  const hasPriceVariance = priceFinding && priceFinding.metrics?.priceVariancePct > 0;
  const hasRepeatedPOs = priceFinding && (priceFinding.supportingRecords?.discrepantPOs?.length || 0) >= 2;

  if (hasPriceVariance && hasRepeatedPOs) {
    const variancePct = priceFinding.metrics?.priceVariancePct;
    const overpaymentTotal = priceFinding.metrics?.totalOverpaymentBilledDollars;
    const poCount = priceFinding.supportingRecords?.discrepantPOs?.length || 0;

    scenariosDetected.push({
      scenarioId: `CS-SCENARIO-B-${supplier.id}`,
      scenarioType: "COMMERCIAL_LEAKAGE_REPEATED_POS",
      title: "Systematic Contract Overbilling Across Multiple Invoices",
      severity: variancePct >= 5.0 ? "CRITICAL" : "HIGH",
      convergingFactors: [
        `Actual invoice unit rate exceeds contract ceiling by +${variancePct}%`,
        `Repeated discrepancies verified across ${poCount} separate purchase orders`,
        `Audited cumulative spend exposure: $${overpaymentTotal?.toLocaleString()}`
      ],
      detectedPattern: `ERP reconciliation identified that invoice billing prices consistently exceed the master purchase contract price ceiling by +${variancePct}% across ${poCount} consecutive purchase orders, yielding $${overpaymentTotal?.toLocaleString()} in unapproved spend leakage.`,
      whyItMatters: "Unilateral vendor surcharges are bypassing standard procurement price-variance controls. Continued automated invoice clearing without dispute will permanently erode operating margins.",
      supportingEvidence: {
        variancePercentage: `+${variancePct}%`,
        totalFinancialLeakage: `$${overpaymentTotal?.toLocaleString()}`,
        discrepantPONumbers: (priceFinding.supportingRecords?.discrepantPOs || []).map(p => p.poNumber),
        billedVsContractRate: `$${priceFinding.metrics?.actualBilledUnitPriceDollars} billed vs $${priceFinding.metrics?.contractUnitPriceDollars} agreed ceiling`
      },
      recommendedInterventionType: "COMMERCIAL_DISPUTE_INTERVENTION"
    });
  }

  // SCENARIO 3: Expiring Compliance Certificate + Sole-Source Dependency
  // Threat: Regulatory shipping stoppage with zero qualified backup sources
  const isComplianceExpiring = complFinding && complFinding.metrics?.isExpiringSoon;
  const isSoleSource = depFinding && depFinding.metrics?.isSingleSource;

  if (isComplianceExpiring && isSoleSource) {
    const daysLeft = complFinding.metrics?.daysRemaining;
    const certType = complFinding.metrics?.primaryCertType;
    const auditScheduled = complFinding.metrics?.auditScheduled;

    scenariosDetected.push({
      scenarioId: `CS-SCENARIO-C-${supplier.id}`,
      scenarioType: "COMPLIANCE_SOLE_SOURCE_CONVERGENCE",
      title: "Accreditation Expiry Cliff with Zero Secondary Qualified Source",
      severity: daysLeft <= 10 ? "CRITICAL" : "HIGH",
      convergingFactors: [
        `Mandatory ${certType} certification lapses in ${daysLeft} calendar days`,
        `100% component volume concentrated with a sole-source vendor`,
        auditScheduled ? "Recertification audit in progress" : "No verified registrar audit extension on file"
      ],
      detectedPattern: `Mandatory quality standard (${certType}) expires in ${daysLeft} days while the vendor holds sole-source manufacturing exclusivity. If the accreditation lapses, corporate quality assurance legally prohibits dock receiving.`,
      whyItMatters: "Regulatory compliance mandates that uncertified vendor lots cannot be accepted into production inventory. Because zero secondary suppliers are currently qualified, an accreditation lapse results in an immediate supply chain shutdown.",
      supportingEvidence: {
        daysRemainingToExpiry: daysLeft,
        certificateStandard: certType,
        certNumber: complFinding.supportingRecords?.certNumber,
        soleSourceStatus: "Sole Source (100% Allocation)",
        standbySupplier: depFinding.supportingRecords?.standbySupplierName || "None qualified"
      },
      recommendedInterventionType: "COMPLIANCE_WAIVER_AUDIT_INTERVENTION"
    });
  }

  // SCENARIO 4: Delivery Fulfillment Slippage + Lead-Time Deficit
  // Threat: Consumption outpaces incoming shipments, creating replenishment vacuum
  const hasDeliverySlippage = delivFinding && (delivFinding.metrics?.otifRatePct <= 75.0 || delivFinding.metrics?.lateShipmentCount >= 2);
  const hasLeadTimeGap = invFinding && invFinding.metrics?.leadTimeCoverageGapDays < 0;

  if (hasDeliverySlippage && hasLeadTimeGap) {
    const otif = delivFinding.metrics?.otifRatePct;
    const gapDays = Math.abs(invFinding.metrics?.leadTimeCoverageGapDays);

    scenariosDetected.push({
      scenarioId: `CS-SCENARIO-D-${supplier.id}`,
      scenarioType: "LOGISTICS_SLIPPAGE_LEADTIME_GAP",
      title: "Logistics Fulfillment Breakdown Compounding Lead-Time Gap",
      severity: "HIGH",
      convergingFactors: [
        `On-time delivery (OTIF) degraded to ${otif}%`,
        `Negative lead-time coverage gap of -${gapDays} days`,
        `${delivFinding.metrics?.lateShipmentCount} late shipments recorded with avg ${delivFinding.metrics?.averageDelayDays}d delay`
      ],
      detectedPattern: `Logistics fulfillment reliability has declined to ${otif}% OTIF, expanding the warehouse lead-time coverage deficit to -${gapDays} days. Incoming replenishment will arrive after factory buffers are exhausted.`,
      whyItMatters: "Factory daily burn rate outpaces the actual arrival rate of replacement stock. Without immediate logistics escalation or split shipment expedited freight, stockout is mathematically inevitable.",
      supportingEvidence: {
        otifRate: `${otif}%`,
        leadTimeGapDays: `-${gapDays} days`,
        lateShipmentsCount: delivFinding.metrics?.lateShipmentCount,
        averageDelayDays: delivFinding.metrics?.averageDelayDays
      },
      recommendedInterventionType: "EXPEDITED_LOGISTICS_INTERVENTION"
    });
  }

  // Determine highest severity across detected scenarios
  let highestSeverity = "LOW";
  if (scenariosDetected.some(s => s.severity === "CRITICAL")) highestSeverity = "CRITICAL";
  else if (scenariosDetected.some(s => s.severity === "HIGH")) highestSeverity = "HIGH";
  else if (scenariosDetected.some(s => s.severity === "MEDIUM")) highestSeverity = "MEDIUM";

  return {
    agentName: "Cross-Signal Intelligence Agent",
    status: "COMPLETED",
    supplierId: supplier.id,
    supplierCode: supplier.code,
    scenariosDetected,
    totalScenarios: scenariosDetected.length,
    highestSeverity,
    executionTimeMs: Date.now() - startTime
  };
}
