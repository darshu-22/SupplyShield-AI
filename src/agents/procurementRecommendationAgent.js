/**
 * SupplyShield AI — Agent C: Procurement Recommendation Agent (Phase 3)
 * 
 * Synthesizes investigation findings and cross-signal convergence into 
 * concrete, actionable procurement recommendations.
 * 
 * Strict Safety Guarantee:
 * - NEVER automatically executes or communicates with suppliers.
 * - Every recommendation has requiresHumanApproval = true.
 * - Numeric impacts are provided ONLY when deterministically calculable.
 */

export function runProcurementRecommendationAgent(investigationResult, crossSignalResult, supplier) {
  const startTime = Date.now();

  if (!investigationResult || !supplier) {
    return {
      agentName: "Procurement Recommendation Agent",
      status: "FAILED",
      error: "Missing investigation or supplier data",
      recommendations: [],
      executionTimeMs: 0
    };
  }

  const findings = investigationResult.findings || [];
  const crossScenarios = crossSignalResult?.scenariosDetected || [];
  const recommendations = [];

  const getFinding = (vector) => findings.find(f => f.vector === vector);
  const qualFinding = getFinding("QUALITY");
  const priceFinding = getFinding("PRICE");
  const delivFinding = getFinding("DELIVERY");
  const complFinding = getFinding("COMPLIANCE");
  const invFinding = getFinding("INVENTORY");
  const depFinding = getFinding("DEPENDENCY");

  // 1. RECOMMENDATION: Quality Assurance 8D CAPA & Dock Inspection
  if (qualFinding && qualFinding.metrics?.latestLotRejectionRatePct >= 3.0) {
    const latestRate = qualFinding.metrics.latestLotRejectionRatePct;
    const seriesRate = qualFinding.metrics.seriesAverageRejectionRatePct;
    const isCritical = latestRate >= 8.0;

    recommendations.push({
      recommendationId: `REC-${supplier.id}-QA-8D`,
      title: isCritical 
        ? "Issue Mandatory 8D Root-Cause CAPA & Enforce Level-II CMM/NDT Dock Inspection"
        : "Request Supplier Quality Engineering (SQE) Process Audit & Calibrate AQL Threshold",
      category: "Quality Assurance",
      supplierId: supplier.id,
      supplierCode: supplier.code,
      supplierName: supplier.name,
      priority: isCritical ? "CRITICAL" : "HIGH",
      urgency: isCritical ? "IMMEDIATE_48H" : "HIGH_72H",
      requiresHumanApproval: true,
      reason: `Incoming inspection rejections escalated to ${latestRate}% on lot #${qualFinding.supportingRecords?.lotNumbers?.[qualFinding.supportingRecords.lotNumbers.length - 1] || 'recent'}, well above the agreed quality baseline of ${seriesRate}%. Tooling wear, porosity, or dimensional calibration drift must be corrected.`,
      evidence: [
        `Latest batch rejection rate: ${latestRate}% (${qualFinding.metrics.totalRejectedUnits} rejected parts across series).`,
        `Defect categories identified: ${qualFinding.supportingRecords?.defectLots?.map(d => `${d.lotNumber} (${d.defectCategory})`).join(', ') || 'Dimensional non-conformance'}.`,
        `Series defect trend classified as: ${qualFinding.metrics.defectTrend}.`
      ],
      expectedImpact: {
        calculable: true,
        numericMetric: `Defect rate reduction from ${latestRate}% back below 2.0% SLA ceiling`,
        summary: `Arrests projected internal manufacturing scrap rate and restores lot yield to contractual SLA standard (<2.0% rejection).`
      },
      suggestedNextStep: "Transmit formal Quality Non-Conformance Notice (Form QA-8D) to vendor Quality Director with a mandatory 5-business-day response requirement."
    });
  }

  // 2. RECOMMENDATION: Contract Pricing Variance Dispute & Surcharge Freeze
  if (priceFinding && priceFinding.metrics?.priceVariancePct > 0) {
    const variancePct = priceFinding.metrics.priceVariancePct;
    const overpaymentTotal = priceFinding.metrics.totalOverpaymentBilledDollars;
    const poList = priceFinding.supportingRecords?.discrepantPOs || [];
    const isCritical = variancePct >= 5.0;

    recommendations.push({
      recommendationId: `REC-${supplier.id}-COMM-DISPUTE`,
      title: `Formally Dispute +${variancePct}% Invoice Price Variance & Freeze Surcharge Clearing`,
      category: "Commercial & Finance",
      supplierId: supplier.id,
      supplierCode: supplier.code,
      supplierName: supplier.name,
      priority: isCritical ? "CRITICAL" : "HIGH",
      urgency: isCritical ? "IMMEDIATE_48H" : "HIGH_72H",
      requiresHumanApproval: true,
      reason: `Vendor billed purchase orders at $${priceFinding.metrics.actualBilledUnitPriceDollars}/unit against a contractual price ceiling of $${priceFinding.metrics.contractUnitPriceDollars}/unit (+${variancePct}% variance). Continued unapproved payment creates unrecoverable spend leakage.`,
      evidence: [
        `Reconciled variance of +${variancePct}% across ${poList.length} active purchase order lines.`,
        `Identified purchase order invoices: ${poList.map(p => `${p.poNumber} ($${p.lineOverpayment.toLocaleString()} overage)`).join(', ')}.`,
        `Total cumulative unapproved spend leakage confirmed at $${overpaymentTotal.toLocaleString()}.`
      ],
      expectedImpact: {
        calculable: true,
        numericMetric: `$${overpaymentTotal.toLocaleString()} direct cash recovery/credit`,
        summary: `Protects $${overpaymentTotal.toLocaleString()} in working capital by withholding unapproved invoice premiums and enforcing contract ceiling rate.`
      },
      suggestedNextStep: "Issue formal Commercial Dispute Notice referencing Master Supply Agreement Section 9.2 (Pricing Caps) and instruct Accounts Payable to place disputed surcharge balance on hold."
    });
  }

  // 3. RECOMMENDATION: Compliance Accreditation Renewal & Registrar Extension Attestation
  if (complFinding && complFinding.metrics?.isExpiringSoon) {
    const daysLeft = complFinding.metrics.daysRemaining;
    const certType = complFinding.metrics.primaryCertType;
    const isCritical = daysLeft <= 10;

    recommendations.push({
      recommendationId: `REC-${supplier.id}-COMPL-CURE`,
      title: `Issue Urgent Accreditation Cure Notice (${daysLeft} Days to ${certType} Expiry)`,
      category: "Compliance & Governance",
      supplierId: supplier.id,
      supplierCode: supplier.code,
      supplierName: supplier.name,
      priority: isCritical ? "CRITICAL" : "HIGH",
      urgency: isCritical ? "IMMEDIATE_48H" : "HIGH_72H",
      requiresHumanApproval: true,
      reason: `Mandatory ${certType} certification lapses in ${daysLeft} calendar days. Corporate Quality and Regulatory policies legally require mandatory receiving dock quarantine if accreditation lapses without an official registrar extension letter.`,
      evidence: [
        `Certificate #${complFinding.supportingRecords?.certNumber} (Registrar: ${complFinding.supportingRecords?.registrar}) expires on ${complFinding.supportingRecords?.expiryDate} (${daysLeft} days remaining).`,
        complFinding.metrics.auditScheduled ? "Audit flagged as scheduled, but final attestation certificate has not been transmitted." : "Zero registrar extension or recertification confirmation on file."
      ],
      expectedImpact: {
        calculable: false,
        numericMetric: "Prevents 100% regulatory receiving dock quarantine",
        summary: "Secures regulatory compliance continuity and prevents automatic quarantine of incoming production shipments."
      },
      suggestedNextStep: "Require vendor to provide official registrar recertification audit certificate or interim compliance extension waiver within 48 business hours."
    });
  }

  // 4. RECOMMENDATION: Supply Continuity — Expedited Replenishment & Dual-Source Split
  if (invFinding && (invFinding.metrics?.leadTimeCoverageGapDays < 0 || invFinding.metrics?.stockCoverageDays < (invFinding.metrics?.targetSafetyStockDays || 30))) {
    const stockDays = invFinding.metrics.stockCoverageDays;
    const targetDays = invFinding.metrics.targetSafetyStockDays;
    const leadTimeDays = invFinding.metrics.replenishmentLeadTimeDays;
    const gapDays = Math.abs(invFinding.metrics.leadTimeCoverageGapDays);
    const isSole = depFinding?.metrics?.isSingleSource;
    const standbyName = depFinding?.supportingRecords?.standbySupplierName;

    recommendations.push({
      recommendationId: `REC-${supplier.id}-SUPPLY-BUFFER`,
      title: isSole 
        ? `Expedite Buffer Replenishment & Qualify Standby Secondary Source (${standbyName || 'Alternate'})`
        : `Issue Expedited Replenishment Order to Close -${gapDays}d Lead-Time Coverage Gap`,
      category: "Supply Chain Continuity",
      supplierId: supplier.id,
      supplierCode: supplier.code,
      supplierName: supplier.name,
      priority: stockDays <= 15 ? "CRITICAL" : "HIGH",
      urgency: stockDays <= 15 ? "IMMEDIATE_48H" : "HIGH_72H",
      requiresHumanApproval: true,
      reason: `Current factory stock covers only ${stockDays} operating days against a replenishment lead time of ${leadTimeDays} days (target safety stock: ${targetDays} days). Without expedited shipment, inventory will deplete before regular orders arrive.`,
      evidence: [
        `Current on-hand warehouse inventory: ${invFinding.metrics.currentOnHandUnits} units (${stockDays} days burn rate coverage).`,
        `Replenishment lead time: ${leadTimeDays} days, producing a negative coverage gap of -${gapDays} days.`,
        isSole ? `Sole-source risk: 100% dependency on single facility. Standby source: ${standbyName || 'None'}.` : 'Multiple approved suppliers qualified.'
      ],
      expectedImpact: {
        calculable: true,
        numericMetric: `Restores stock coverage from ${stockDays}d to ${targetDays}d safety target`,
        summary: `Eliminates a ${gapDays}-day stockout exposure gap and restores factory safety inventory to minimum compliance standard.`
      },
      suggestedNextStep: isSole && standbyName 
        ? `Request immediate 40% volume qualification allocation to ${standbyName} and mandate vendor-expedited air shipment for urgent buffer lots.`
        : `Issue priority replenishment purchase order for buffer stock with expedited logistics transit.`
    });
  }

  // 5. RECOMMENDATION: Logistics Delivery Remediation
  if (delivFinding && delivFinding.metrics?.otifRatePct < 80.0 && !recommendations.some(r => r.category === "Supply Chain Continuity")) {
    const otif = delivFinding.metrics.otifRatePct;
    const delayDays = delivFinding.metrics.averageDelayDays;

    recommendations.push({
      recommendationId: `REC-${supplier.id}-LOGIST-REMED`,
      title: `Mandate Logistics Corrective Action Plan (OTIF at ${otif}%)`,
      category: "Logistics Fulfillment",
      supplierId: supplier.id,
      supplierCode: supplier.code,
      supplierName: supplier.name,
      priority: "HIGH",
      urgency: "HIGH_72H",
      requiresHumanApproval: true,
      reason: `On-time delivery fulfillment degraded to ${otif}% with median arrival delay of ${delayDays} days across active purchase orders.`,
      evidence: [
        `OTIF performance confirmed at ${otif}% across completed shipments.`,
        `${delivFinding.metrics.lateShipmentCount} shipments arrived behind schedule with an average delay of ${delayDays} days.`
      ],
      expectedImpact: {
        calculable: true,
        numericMetric: `Restores OTIF delivery performance from ${otif}% to >90.0% contractual SLA`,
        summary: "Stabilizes factory inbound delivery schedule and eliminates dock receiving delays."
      },
      suggestedNextStep: "Require vendor logistics management to submit an expedited recovery transit plan and assign dedicated freight tracking."
    });
  }

  // Default nominal maintenance action if no elevated risks exist
  if (recommendations.length === 0) {
    recommendations.push({
      recommendationId: `REC-${supplier.id}-NOMINAL`,
      title: "Maintain Standard Operational Monitoring & Long-Term Contract Rebate Review",
      category: "Routine Procurement",
      supplierId: supplier.id,
      supplierCode: supplier.code,
      supplierName: supplier.name,
      priority: "LOW",
      urgency: "WEEKLY_CYCLE",
      requiresHumanApproval: true,
      reason: "All operational vectors (Quality, Pricing, Delivery, Compliance, Inventory) are performing within contractual control limits.",
      evidence: [
        `Quality rejection rate nominal at ${qualFinding?.metrics?.seriesAverageRejectionRatePct || 0}%.`,
        `0% contract price variance across all purchase orders.`,
        `OTIF delivery rate tracking at ${delivFinding?.metrics?.otifRatePct || 100}%.`
      ],
      expectedImpact: {
        calculable: false,
        numericMetric: "Maintains nominal SLA performance",
        summary: "Preserves stable supply relationship while exploring potential multi-year volume rebate opportunities."
      },
      suggestedNextStep: "Continue automated weekly telemetry surveillance and review contract renewal terms."
    });
  }

  return {
    agentName: "Procurement Recommendation Agent",
    status: "COMPLETED",
    supplierId: supplier.id,
    supplierCode: supplier.code,
    recommendations,
    totalRecommendations: recommendations.length,
    crossSignalInformedCount: crossScenarios.length,
    executionTimeMs: Date.now() - startTime
  };
}
