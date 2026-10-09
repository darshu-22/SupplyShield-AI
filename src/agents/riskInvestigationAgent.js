/**
 * SupplyShield AI — Agent A: Risk Investigation Agent (Phase 3)
 * 
 * Inspects all underlying transactions, inventory balances, inspection lots, 
 * delivery tracking, and accreditation records for a supplier.
 * Identifies primary risk drivers with exact evidence attribution.
 * NEVER invents numbers or decorative facts.
 */

import {
  calculateQualityMetrics,
  calculatePriceMetrics,
  calculateDeliveryMetrics,
  calculateComplianceMetrics,
  calculateInventoryMetrics
} from '../engine/riskEngine.js';

export function runRiskInvestigationAgent(supplier) {
  const startTime = Date.now();

  if (!supplier) {
    return {
      agentName: "Risk Investigation Agent",
      status: "FAILED",
      error: "No supplier record provided for investigation",
      findings: [],
      executionTimeMs: 0
    };
  }

  // 1. Gather transactional datasets
  const pos = supplier.purchaseOrders || [];
  const lots = supplier.inspectionLots || [];
  const inv = supplier.inventoryRecord || null;
  const certs = supplier.complianceRecords || [];
  const dep = supplier.dependencyRecord || null;

  // 2. Perform exact calculations via deterministic risk engine
  const quality = calculateQualityMetrics(lots);
  const price = calculatePriceMetrics(pos);
  const delivery = calculateDeliveryMetrics(pos);
  const compliance = calculateComplianceMetrics(certs);
  const inventory = calculateInventoryMetrics(inv, dep);

  const findings = [];

  // Finding 1: Quality Defects
  if (lots.length > 0) {
    const isQualityElevated = quality.rejectionRate >= 2.5 || quality.latestBatchRate >= 4.0;
    const defectLots = lots.filter(l => (l.rejectedUnits || 0) > 0);
    const defectCategories = [...new Set(lots.map(l => l.defectCategory).filter(Boolean))];

    findings.push({
      id: `FIND-QUAL-${supplier.id}`,
      vector: "QUALITY",
      findingTitle: isQualityElevated 
        ? `Elevated Defect Rate (${quality.latestBatchRate}% Latest Lot)`
        : `Quality Nominal (${quality.rejectionRate}% Series Average)`,
      severity: quality.latestBatchRate >= 8.0 ? "CRITICAL" : quality.latestBatchRate >= 4.0 ? "HIGH" : quality.rejectionRate >= 2.5 ? "MEDIUM" : "LOW",
      isPrimaryDriver: isQualityElevated,
      evidenceStrength: lots.length >= 3 ? "ROBUST" : "MODERATE",
      metrics: {
        seriesAverageRejectionRatePct: quality.rejectionRate,
        latestLotRejectionRatePct: quality.latestBatchRate,
        totalInspectedUnits: quality.totalInspected,
        totalRejectedUnits: quality.totalRejected,
        defectTrend: quality.defectTrend
      },
      observedFacts: [
        `Analyzed ${lots.length} incoming dock inspection lots (${quality.totalInspected} total inspected parts).`,
        `Cumulative series rejection rate is ${quality.rejectionRate}% with ${quality.totalRejected} total rejected units.`,
        `Latest inspected lot (#${lots[lots.length - 1]?.lotNumber || 'N/A'}) recorded ${quality.latestBatchRate}% rejections.`,
        defectCategories.length > 0 ? `Identified defect failure modes: ${defectCategories.join(', ')}.` : 'No critical defect failure modes flagged.'
      ],
      supportingRecords: {
        lotsAnalyzedCount: lots.length,
        defectLotsCount: defectLots.length,
        lotNumbers: lots.map(l => l.lotNumber),
        defectLots: defectLots.map(l => ({
          lotNumber: l.lotNumber,
          rejectionRate: l.rejectionRatePct,
          defectCategory: l.defectCategory
        }))
      }
    });
  } else {
    findings.push({
      id: `FIND-QUAL-${supplier.id}`,
      vector: "QUALITY",
      findingTitle: "No Quality Inspection Lots on Record",
      severity: "LOW",
      isPrimaryDriver: false,
      evidenceStrength: "INSUFFICIENT",
      metrics: { seriesAverageRejectionRatePct: 0, latestLotRejectionRatePct: 0 },
      observedFacts: ["No incoming dock inspection records available for this supplier in the current cycle."],
      supportingRecords: { lotsAnalyzedCount: 0 }
    });
  }

  // Finding 2: Commercial Price Variance & Overpayment
  if (pos.length > 0) {
    const isPriceElevated = price.priceVariancePct > 0;
    const overpaymentPOs = pos.filter(p => (p.actualBilledUnitPrice || 0) > (p.contractUnitPrice || 0));

    findings.push({
      id: `FIND-PRICE-${supplier.id}`,
      vector: "PRICE",
      findingTitle: isPriceElevated 
        ? `Contract Price Variance (+${price.priceVariancePct}% Billed Over Ceiling)`
        : "Contract Price Pricing Compliant (0% Variance)",
      severity: price.priceVariancePct >= 5.0 ? "CRITICAL" : price.priceVariancePct > 0 ? "HIGH" : "LOW",
      isPrimaryDriver: isPriceElevated,
      evidenceStrength: pos.length >= 2 ? "ROBUST" : "MODERATE",
      metrics: {
        priceVariancePct: price.priceVariancePct,
        totalOverpaymentBilledDollars: price.totalOverpayment,
        contractUnitPriceDollars: pos[0]?.contractUnitPrice || 0,
        actualBilledUnitPriceDollars: pos[0]?.actualBilledUnitPrice || 0
      },
      observedFacts: [
        `Reconciled ${pos.length} purchase orders against master supply contract terms.`,
        isPriceElevated 
          ? `Billed unit price ($${pos[0]?.actualBilledUnitPrice}) exceeds contract agreed rate ($${pos[0]?.contractUnitPrice}) by +${price.priceVariancePct}%.`
          : `All purchase orders strictly match master contract rate ($${pos[0]?.contractUnitPrice}).`,
        isPriceElevated 
          ? `Calculated total unapproved financial exposure: $${price.totalOverpayment.toLocaleString()} across ${overpaymentPOs.length} purchase order lines.`
          : `Total unratified overpayment exposure: $0.00.`
      ],
      supportingRecords: {
        posAnalyzedCount: pos.length,
        overpaymentPOsCount: overpaymentPOs.length,
        poNumbers: pos.map(p => p.poNumber),
        discrepantPOs: overpaymentPOs.map(p => ({
          poNumber: p.poNumber,
          billed: p.actualBilledUnitPrice,
          contract: p.contractUnitPrice,
          quantity: p.quantityOrdered,
          lineOverpayment: Math.max(0, (p.actualBilledUnitPrice - p.contractUnitPrice) * p.quantityOrdered)
        }))
      }
    });
  } else {
    findings.push({
      id: `FIND-PRICE-${supplier.id}`,
      vector: "PRICE",
      findingTitle: "No Purchase Order Invoices on Record",
      severity: "LOW",
      isPrimaryDriver: false,
      evidenceStrength: "INSUFFICIENT",
      metrics: { priceVariancePct: 0, totalOverpaymentBilledDollars: 0 },
      observedFacts: ["No purchase orders found for this vendor in the current financial reconciliation period."],
      supportingRecords: { posAnalyzedCount: 0 }
    });
  }

  // Finding 3: Delivery Fulfillment & OTIF
  if (pos.length > 0) {
    const isDeliveryDegraded = delivery.otifRate < 85.0 || delivery.lateShipmentCount > 0;
    const latePOs = pos.filter(p => (p.delayDays || 0) > 0);

    findings.push({
      id: `FIND-DELIV-${supplier.id}`,
      vector: "DELIVERY",
      findingTitle: isDeliveryDegraded 
        ? `Delivery Performance Degraded (${delivery.otifRate}% OTIF)`
        : `Delivery Performance Nominal (${delivery.otifRate}% OTIF)`,
      severity: delivery.otifRate <= 70.0 ? "CRITICAL" : delivery.otifRate < 85.0 ? "HIGH" : "LOW",
      isPrimaryDriver: isDeliveryDegraded,
      evidenceStrength: pos.length >= 3 ? "ROBUST" : "MODERATE",
      metrics: {
        otifRatePct: delivery.otifRate,
        lateShipmentCount: delivery.lateShipmentCount,
        averageDelayDays: delivery.avgDelayDays
      },
      observedFacts: [
        `Evaluated ${pos.length} order fulfillment shipment milestones.`,
        `On-Time In-Full (OTIF) rate measured at ${delivery.otifRate}%.`,
        delivery.lateShipmentCount > 0 
          ? `Detected ${delivery.lateShipmentCount} late shipment(s) with an average arrival delay of ${delivery.avgDelayDays} days.`
          : 'Zero late shipments recorded; 100% schedule adherence.'
      ],
      supportingRecords: {
        latePOsCount: latePOs.length,
        lateDeliveries: latePOs.map(p => ({
          poNumber: p.poNumber,
          expectedDate: p.expectedDeliveryDate,
          actualDate: p.actualDeliveryDate,
          delayDays: p.delayDays
        }))
      }
    });
  }

  // Finding 4: Compliance Accreditation
  if (certs.length > 0) {
    const primaryCert = certs[0];
    const isExpiringSoon = compliance.isExpiringSoon;

    findings.push({
      id: `FIND-COMPL-${supplier.id}`,
      vector: "COMPLIANCE",
      findingTitle: isExpiringSoon 
        ? `Accreditation Expiration Approaching (${compliance.minDaysRemaining} Days Left)`
        : `Accreditation Current (${compliance.minDaysRemaining} Days Validity)`,
      severity: compliance.minDaysRemaining <= 10 ? "CRITICAL" : compliance.minDaysRemaining <= 30 ? "HIGH" : "LOW",
      isPrimaryDriver: isExpiringSoon,
      evidenceStrength: "ROBUST",
      metrics: {
        daysRemaining: compliance.minDaysRemaining,
        primaryCertType: compliance.primaryCertType,
        isExpiringSoon: compliance.isExpiringSoon,
        auditScheduled: primaryCert?.recertAuditScheduled || false
      },
      observedFacts: [
        `Tracked ${certs.length} active quality credential(s). Primary standard: ${compliance.primaryCertType}.`,
        `Accreditation certificate #${primaryCert?.certNumber || 'N/A'} (Registrar: ${primaryCert?.registrar || 'N/A'}) expires in ${compliance.minDaysRemaining} calendar days.`,
        primaryCert?.recertAuditScheduled 
          ? "Recertification audit formally scheduled with accredited registrar."
          : "WARNING: No recertification audit confirmation recorded on file."
      ],
      supportingRecords: {
        certNumber: primaryCert?.certNumber,
        registrar: primaryCert?.registrar,
        expiryDate: primaryCert?.expiryDate,
        recertAuditScheduled: primaryCert?.recertAuditScheduled
      }
    });
  }

  // Finding 5: Inventory Continuity & Lead Time Gap
  if (inv) {
    const isDeficit = inventory.leadTimeCoverageGapDays < 0;
    const isBufferLow = inventory.stockCoverageDays < (inv.targetSafetyStockDays || 30);

    findings.push({
      id: `FIND-INVENT-${supplier.id}`,
      vector: "INVENTORY",
      findingTitle: isDeficit 
        ? `Lead-Time Coverage Deficit (${inventory.stockCoverageDays}d On-Hand vs ${inv.replenishmentLeadTimeDays}d Lead Time)`
        : `Inventory Buffer Optimal (${inventory.stockCoverageDays}d On-Hand)`,
      severity: inventory.stockCoverageDays <= 15 ? "CRITICAL" : isDeficit ? "HIGH" : isBufferLow ? "MEDIUM" : "LOW",
      isPrimaryDriver: isDeficit || isBufferLow,
      evidenceStrength: "ROBUST",
      metrics: {
        currentOnHandUnits: inv.currentOnHandUnits,
        averageDailyDemandUnits: inv.averageDailyDemandUnits,
        stockCoverageDays: inventory.stockCoverageDays,
        replenishmentLeadTimeDays: inv.replenishmentLeadTimeDays,
        targetSafetyStockDays: inv.targetSafetyStockDays,
        leadTimeCoverageGapDays: inventory.leadTimeCoverageGapDays,
        isSoleSource: inventory.isSoleSource
      },
      observedFacts: [
        `Factory warehouse balance: ${inv.currentOnHandUnits} units of ${inv.itemName}.`,
        `Average daily consumption rate: ${inv.averageDailyDemandUnits} units/day yields ${inventory.stockCoverageDays} days of production stock coverage.`,
        `Factory replenishment lead time is ${inv.replenishmentLeadTimeDays} days (target safety buffer: ${inv.targetSafetyStockDays} days).`,
        isDeficit 
          ? `Negative lead-time coverage gap of ${inventory.leadTimeCoverageGapDays} days creates an unmitigated stockout exposure window.`
          : `Positive lead-time buffer of +${inventory.leadTimeCoverageGapDays} days provides adequate operational safety margin.`
      ],
      supportingRecords: {
        itemId: inv.itemId,
        facilityLocation: inv.facilityLocation,
        reorderTriggerPointUnits: inv.reorderTriggerPointUnits
      }
    });
  }

  // Finding 6: Supplier Dependency & Criticality
  if (dep) {
    findings.push({
      id: `FIND-DEP-${supplier.id}`,
      vector: "DEPENDENCY",
      findingTitle: dep.isSingleSource 
        ? `Sole-Source Dependency (${dep.criticalityTier} Criticality Tier)`
        : `Dual-Sourced Supply (${dep.approvedSourcesCount} Approved Sources)`,
      severity: dep.isSingleSource && dep.criticalityTier === "CRITICAL" ? "HIGH" : "LOW",
      isPrimaryDriver: dep.isSingleSource && dep.criticalityTier === "CRITICAL",
      evidenceStrength: "ROBUST",
      metrics: {
        criticalityTier: dep.criticalityTier,
        isSingleSource: dep.isSingleSource,
        approvedSourcesCount: dep.approvedSourcesCount,
        switchingLeadTimeWeeks: dep.switchingLeadTimeWeeks
      },
      observedFacts: [
        `Part categorized as ${dep.criticalityTier} manufacturing criticality tier.`,
        dep.isSingleSource 
          ? `Supplier is sole source (100% factory volume allocated). Zero active redundant lines.`
          : `Supply is diversified across ${dep.approvedSourcesCount} qualified approved sources.`,
        dep.standbySupplierName 
          ? `Pre-qualified secondary source exists: ${dep.standbySupplierName} (switching lead time: ${dep.switchingLeadTimeWeeks} weeks).`
          : 'No pre-qualified secondary source available.'
      ],
      supportingRecords: {
        standbySupplierName: dep.standbySupplierName,
        switchingLeadTimeWeeks: dep.switchingLeadTimeWeeks
      }
    });
  }

  const primaryRiskDrivers = findings.filter(f => f.isPrimaryDriver);

  return {
    agentName: "Risk Investigation Agent",
    status: "COMPLETED",
    supplierId: supplier.id,
    supplierCode: supplier.code,
    supplierName: supplier.name,
    compositeRiskScore: supplier.riskScore,
    riskCategory: supplier.riskLevel,
    findings,
    primaryRiskDrivers,
    evidenceSummary: {
      totalInspectionsAnalyzed: lots.length,
      totalPurchaseOrdersAnalyzed: pos.length,
      certificatesAnalyzed: certs.length,
      hasInventoryRecord: !!inv,
      hasDependencyRecord: !!dep
    },
    executionTimeMs: Date.now() - startTime
  };
}
