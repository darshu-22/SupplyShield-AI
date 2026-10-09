/**
 * SupplyShield AI — Master Supplier Dataset & Derived Intelligence (Phase 2)
 * 
 * Computes all metrics dynamically from the underlying structured transaction records:
 * - Purchase Orders (unit costs, variances, actual quantities)
 * - Dock Inspection Lots (inspected vs rejected units, NDT results)
 * - Factory Inventory Reserves (daily demand, replenishment lead times)
 * - Certification Audits (compliance validity, expiration countdowns)
 * 
 * DISCLAIMER & NOTICE:
 * All records are simulated, synthetic demonstration data for evaluation.
 */

import {
  PURCHASE_ORDER_RECORDS,
  INSPECTION_LOT_RECORDS,
  INVENTORY_RECORDS,
  COMPLIANCE_RECORDS,
  DEPENDENCY_RECORDS
} from './transactionRecords';

import {
  calculateQualityMetrics,
  calculatePriceMetrics,
  calculateDeliveryMetrics,
  calculateComplianceMetrics,
  calculateInventoryMetrics,
  calculateCompositeRiskScore,
  evaluateCrossSignalIntelligence
} from '../engine/riskEngine';

export const DEMO_METADATA = {
  isDemonstrationData: true,
  datasetVersion: "2.1.0-evidence-backed",
  lastSimulatedSync: "2026-10-10T00:00:00Z",
  simulationNotice: "Deterministic demonstration database — Audited transaction records",
};

// Base entity metadata for the 6 canonical demonstration suppliers
const SUPPLIER_DEFINITIONS = [
  {
    id: "SUP-001",
    code: "Supplier A",
    name: "Apex Precision Castings & Alloys Ltd.",
    shortName: "Apex Castings",
    suppliedItem: "Critical Turbine & Structural Metal Castings (Grade 4140/Ti)",
    itemCategory: "Critical Metallurgy",
    criticality: "Critical Single-Source",
    facilityLocation: "Dresden, Germany",
    annualSpend: 2400000,
    contractValue: "$2.40M / yr",
    qualityAuditScore: 71,
    leadTimeWeeks: 16
  },
  {
    id: "SUP-002",
    code: "Supplier B",
    name: "Vanguard Microelectronics Ltd.",
    shortName: "Vanguard Semi",
    suppliedItem: "Industrial Microcontrollers & CAN-Bus ICs",
    itemCategory: "Semiconductors & Electronics",
    criticality: "High (Multi-Sourced)",
    facilityLocation: "Hsinchu Science Park, Taiwan",
    annualSpend: 1850000,
    contractValue: "$1.85M / yr",
    qualityAuditScore: 96,
    leadTimeWeeks: 6
  },
  {
    id: "SUP-003",
    code: "Supplier C",
    name: "HydroTech Fluid Systems Inc.",
    shortName: "HydroTech Seals",
    suppliedItem: "High-Pressure Hydraulic Fluorocarbon Seals & O-Rings",
    itemCategory: "Hydraulics & Fluid Power",
    criticality: "High",
    facilityLocation: "Turin, Italy",
    annualSpend: 980000,
    contractValue: "$980K / yr",
    qualityAuditScore: 84,
    leadTimeWeeks: 10
  },
  {
    id: "SUP-004",
    code: "Supplier D",
    name: "BioPac Sustainable Packaging Corp.",
    shortName: "BioPac",
    suppliedItem: "Heavy-Duty Recyclable Corrugated Packaging & Foam Inserts",
    itemCategory: "Packaging & Logistics",
    criticality: "Low (Commodity)",
    facilityLocation: "Ohio, United States",
    annualSpend: 320000,
    contractValue: "$320K / yr",
    qualityAuditScore: 98,
    leadTimeWeeks: 1
  },
  {
    id: "SUP-005",
    code: "Supplier E",
    name: "Rotary Precision Bearings AG",
    shortName: "Rotary Bearings",
    suppliedItem: "High-Speed Ceramic Hybrid Precision Bearings",
    itemCategory: "Precision Mechanical Components",
    criticality: "High",
    facilityLocation: "Winterthur, Switzerland",
    annualSpend: 1450000,
    contractValue: "$1.45M / yr",
    qualityAuditScore: 76,
    leadTimeWeeks: 8
  },
  {
    id: "SUP-006",
    code: "Supplier F",
    name: "Kinetic Dynamics Motor Works GmbH",
    shortName: "Kinetic Dynamics",
    suppliedItem: "High-Torque Brushless DC Stator & Motor Assemblies",
    itemCategory: "Electro-Mechanical Power",
    criticality: "Critical Dual-Source",
    facilityLocation: "Stuttgart, Germany",
    annualSpend: 2100000,
    contractValue: "$2.10M / yr",
    qualityAuditScore: 79,
    leadTimeWeeks: 12
  }
];

// Dynamically compile rich, evidence-backed supplier profiles
export const SUPPLIERS = SUPPLIER_DEFINITIONS.map(def => {
  // 1. Fetch matching transaction slices
  const pos = PURCHASE_ORDER_RECORDS.filter(p => p.supplierId === def.id);
  const inspections = INSPECTION_LOT_RECORDS.filter(i => i.supplierId === def.id);
  const inv = INVENTORY_RECORDS.find(i => i.supplierId === def.id);
  const certs = COMPLIANCE_RECORDS.filter(c => c.supplierId === def.id);
  const dep = DEPENDENCY_RECORDS.find(d => d.supplierId === def.id);

  // 2. Compute 5-vector deterministic metrics
  const quality = calculateQualityMetrics(inspections);
  const price = calculatePriceMetrics(pos);
  const delivery = calculateDeliveryMetrics(pos);
  const compliance = calculateComplianceMetrics(certs);
  const inventory = calculateInventoryMetrics(inv, dep);

  // 3. Composite score calculation
  const composite = calculateCompositeRiskScore({
    qualityScore: quality.qualityScore,
    priceScore: price.priceScore,
    deliveryScore: delivery.deliveryScore,
    complianceScore: compliance.complianceScore,
    continuityScore: inventory.continuityScore
  });

  // 4. Derive contract costs from POs
  const samplePO = pos[0] || {};
  const contractUnitCost = samplePO.contractUnitPrice || 0;
  const billedUnitCost = samplePO.actualBilledUnitPrice || 0;

  // 5. Build preliminary summary & warnings
  const profileForWarnings = {
    code: def.code,
    name: def.name,
    rejectionRate: quality.rejectionRate,
    priceVariance: price.priceVariancePct,
    minDaysToExpiry: compliance.minDaysRemaining,
    stockCoverageDays: inventory.stockCoverageDays,
    leadTimeCoverageGapDays: inventory.leadTimeCoverageGapDays,
    isSingleSource: inventory.isSoleSource,
    criticalityTier: dep ? dep.criticalityTier : "HIGH",
    otifRate: delivery.otifRate,
    overpaymentTotal: price.totalOverpayment
  };

  const crossSignalWarnings = evaluateCrossSignalIntelligence(profileForWarnings);

  // Warning signs formatted for evidence inspection
  const warningSigns = [];

  if (quality.latestBatchRate >= 4.0) {
    warningSigns.push({
      id: `WS-${def.id}-1`,
      severity: quality.latestBatchRate >= 8.0 ? "CRITICAL" : "HIGH",
      category: "Quality",
      title: `Rejection Rate at ${quality.latestBatchRate}%`,
      detail: `Defect rate across recent lots is ${quality.latestBatchRate}% (series baseline ${quality.rejectionRate}%). Inspection flagged ${inspections[inspections.length - 1]?.defectCategory || 'defect variances'}.`,
      detectedDate: "Recent dock inspection",
      evidenceSource: "Inspection Lots Log",
      recordsCount: inspections.length
    });
  }

  if (price.priceVariancePct > 0) {
    warningSigns.push({
      id: `WS-${def.id}-2`,
      severity: price.priceVariancePct >= 5.0 ? "CRITICAL" : "MEDIUM",
      category: "Pricing",
      title: `Contract Ceiling Exceeded (+${price.priceVariancePct}%)`,
      detail: `Actual invoice unit pricing exceeds master contract ceiling by +${price.priceVariancePct}%, creating $${price.totalOverpayment.toLocaleString()} in calculated unapproved overpayment.`,
      detectedDate: "ERP Invoice reconciliation",
      evidenceSource: "Purchase Orders Matrix",
      recordsCount: pos.length
    });
  }

  if (compliance.isExpiringSoon) {
    warningSigns.push({
      id: `WS-${def.id}-3`,
      severity: compliance.minDaysRemaining <= 10 ? "CRITICAL" : "HIGH",
      category: "Compliance",
      title: `Credential Expiration in ${compliance.minDaysRemaining} Days`,
      detail: `${compliance.primaryCertType} accreditation expires in ${compliance.minDaysRemaining} calendar days. Recertification audit certificate pending.`,
      detectedDate: "Compliance monitor sync",
      evidenceSource: "Registrar Cert Records",
      recordsCount: certs.length
    });
  }

  if (inventory.leadTimeCoverageGapDays < 0) {
    warningSigns.push({
      id: `WS-${def.id}-4`,
      severity: inventory.stockCoverageDays <= 15 ? "CRITICAL" : "HIGH",
      category: "Supply Chain",
      title: `Lead-Time Coverage Deficit (${inventory.stockCoverageDays}d coverage)`,
      detail: `Factory stock buffer covers ${inventory.stockCoverageDays} operating days vs replenishment lead time of ${inv?.replenishmentLeadTimeDays || 30} days, leaving a ${Math.abs(inventory.leadTimeCoverageGapDays)}-day stockout exposure gap.`,
      detectedDate: "Factory warehouse buffer feed",
      evidenceSource: "Inventory Balance Sheet",
      recordsCount: 1
    });
  }

  // Fallback for clean low-risk suppliers
  if (warningSigns.length === 0) {
    warningSigns.push({
      id: `WS-${def.id}-SAFE`,
      severity: "LOW",
      category: "Operational Nominal",
      title: "All Operating Signals Nominal",
      detail: `Quality, pricing, and fulfillment tracking within SLA boundaries. OTIF confirmed at ${delivery.otifRate}%.`,
      detectedDate: "Routine telemetry audit",
      evidenceSource: "Vendor Scorecard Engine",
      recordsCount: pos.length
    });
  }

  return {
    ...def,
    isSingleSource: inventory.isSoleSource,
    approvedSuppliersCount: dep ? dep.approvedSourcesCount : 1,

    // Risk Classification (Calculated)
    riskLevel: composite.riskCategory,
    riskScore: composite.score,
    riskTrend: quality.defectTrend === "DETERIORATING" || delivery.otifRate < 80 ? "worsening" : "stable",
    scoreBreakdown: {
      quality: quality.qualityScore,
      price: price.priceScore,
      delivery: delivery.deliveryScore,
      compliance: compliance.complianceScore,
      continuity: inventory.continuityScore
    },

    // Quality Trend (Calculated)
    qualityTrend: `${quality.defectTrend} (${quality.rejectionRate}% avg, ${quality.latestBatchRate}% latest)`,
    rejectionRate: quality.latestBatchRate,
    baselineRejectionRate: quality.rejectionRate,

    // Price Variance (Calculated)
    priceVariance: price.priceVariancePct,
    priceVarianceFormatted: price.priceVariancePct > 0 ? `+${price.priceVariancePct}%` : `${price.priceVariancePct}%`,
    contractUnitCost,
    billedUnitCost,
    quarterlyOverpaymentExposure: price.totalOverpayment,

    // Certificate Status (Calculated)
    certificateStatus: compliance.isExpiringSoon ? "Expiring Soon" : "Valid",
    certificateType: compliance.primaryCertType,
    certificateExpiryDays: compliance.minDaysRemaining,
    auditScheduled: certs[0]?.recertAuditScheduled || false,

    // Stock Coverage & Lead Time Gap (Calculated)
    stockCoverageDays: inventory.stockCoverageDays,
    leadTimeCoverageGapDays: inventory.leadTimeCoverageGapDays,
    targetSafetyStockDays: inv?.targetSafetyStockDays || 30,
    currentOnHandUnits: inv?.currentOnHandUnits || 0,
    stockStatus: inventory.stockCoverageDays < 20 
      ? `Severe Deficit (${inventory.stockCoverageDays}d vs ${inv?.targetSafetyStockDays || 30}d target)`
      : inventory.stockCoverageDays < 35 
      ? `Deficit Buffer (${inventory.stockCoverageDays}d vs ${inv?.targetSafetyStockDays || 30}d target)`
      : `Optimal Buffer (${inventory.stockCoverageDays}d coverage)`,

    // Delivery Performance (Calculated)
    onTimeDeliveryRate: delivery.otifRate,
    avgDelayDays: delivery.avgDelayDays,
    lateShipmentCount: delivery.lateShipmentCount,

    // Relational Records Linked
    purchaseOrders: pos,
    inspectionLots: inspections,
    inventoryRecord: inv,
    complianceRecords: certs,
    dependencyRecord: dep,

    // Evidence & Warning Signals
    warningSigns,
    crossSignalWarnings,

    // Preliminary Diagnostic Summary
    preliminarySummary: {
      urgency: composite.score >= 80 ? "Immediate Action Required (<48 Hours)" : composite.score >= 60 ? "High Priority (<72 Hours)" : "Routine Monitoring",
      primaryRiskDriver: crossSignalWarnings[0]?.detectedPattern || "Deterministic monitoring shows parameters within contractual control limits.",
      financialImpactDescription: price.totalOverpayment > 0 
        ? `Calculated $${price.totalOverpayment.toLocaleString()} unratified invoice overpayment across active purchase orders.`
        : `$0 contract pricing deviation. Predictable spend profile.`,
      recommendedActions: [
        {
          id: `ACT-${def.id}-1`,
          title: price.priceVariancePct > 0 
            ? `Dispute Contract Variance (+${price.priceVariancePct}%) & Withhold Surcharges`
            : "Review Next-Cycle Volume Tier Rebates",
          type: "Commercial",
          description: price.priceVariancePct > 0 
            ? `Issue formal price cap notice for $${price.totalOverpayment.toLocaleString()} in billed overages.`
            : "Engage supplier for multi-year contract rebate lock.",
          status: "Draft Ready"
        },
        {
          id: `ACT-${def.id}-2`,
          title: compliance.isExpiringSoon 
            ? `Emergency Audit Attestation Demand (${compliance.minDaysRemaining}d remaining)`
            : "Archive Annual Scorecard Accreditation",
          type: "Compliance",
          description: compliance.isExpiringSoon 
            ? "Mandate certified registrar extension attestation within 5 business days."
            : "Archive current ISO/IATF accreditation audit.",
          status: "Draft Ready"
        },
        {
          id: `ACT-${def.id}-3`,
          title: inventory.isSoleSource && inventory.stockCoverageDays < 30
            ? "Accelerate Secondary Standby Vendor Allocation"
            : "Maintain Standard Operational Delivery Schedule",
          type: "Supply Continuity",
          description: inventory.isSoleSource 
            ? `Transfer initial tooling validation to standby vendor (${dep?.standbySupplierName || 'Standby Source'}).`
            : "Standard inventory replenishment cycle.",
          status: "Under Review"
        }
      ]
    }
  };
});

// Human-in-the-loop initial decisions
export const INITIAL_ACTIONS = [
  {
    id: "DEC-001",
    supplierId: "SUP-001",
    supplierCode: "Supplier A",
    supplierName: "Apex Precision Castings",
    actionTitle: "Issue Immediate Contract Price Dispute (+7.4%) & Hold Surcharges",
    category: "Commercial & Compliance",
    urgency: "CRITICAL",
    financialValue: "$74,000 / qtr",
    evidenceSummary: "PO-2026-0810, 0922, 1004 billed at $1,342.50 vs agreed cap $1,250.00; AS9100 expires in 10 days; sole source.",
    draftDetails: "Formal legal and procurement notice referencing Master Agreement Section 9.2 (Price Caps) and Section 14 (Mandatory Quality Certification). Mandates retention of surcharge amounts.",
    status: "Pending Approval",
    approvedAt: null,
    riskReductionEstimate: "Prevents $74K leakage; triggers mandatory recertification proof"
  },
  {
    id: "DEC-002",
    supplierId: "SUP-003",
    supplierCode: "Supplier C",
    supplierName: "HydroTech Fluid Systems",
    actionTitle: "Divert 40% Seal Purchase Allocation to Standby Vendor",
    category: "Supply Chain Continuity",
    urgency: "HIGH",
    financialValue: "Protects $85K/day line risk",
    evidenceSummary: "Inventory down to 14 days; OTIF degraded to 64.2%; 3 consecutive POs arrived with median 19-day delay.",
    draftDetails: "Issue PO split to dual-source supplier (SealsCorp Global) for next 2 purchase cycles to lift plant buffer back to 35-day safety standard.",
    status: "Pending Approval",
    approvedAt: null,
    riskReductionEstimate: "Restores buffer inventory to 35 days within 3 weeks"
  },
  {
    id: "DEC-003",
    supplierId: "SUP-005",
    supplierCode: "Supplier E",
    supplierName: "Rotary Precision Bearings",
    actionTitle: "Mandate Urgent 8D CAPA & 7-Day Certificate Extension Proof",
    category: "Quality Assurance",
    urgency: "MEDIUM",
    financialValue: "Avoids $19.4K scrap rate",
    evidenceSummary: "Rejections doubled to 4.6% in Lot #QA-912; IATF cert expires in 20 days; spindle runout tolerance issues.",
    draftDetails: "Dispatch Supplier Quality Engineer (SQE) for on-site inspection of CNC grinding calibration and demand formal auditor extension attestation.",
    status: "Pending Approval",
    approvedAt: null,
    riskReductionEstimate: "Targets drop in defect rate back below 2.0% baseline"
  },
  {
    id: "DEC-004",
    supplierId: "SUP-006",
    supplierCode: "Supplier F",
    supplierName: "Kinetic Dynamics Motor Works",
    actionTitle: "Freeze Unapproved Copper Surcharges (+5.5%) & Demand OTIF Recovery Plan",
    category: "Commercial & Logistics",
    urgency: "HIGH",
    financialValue: "$45,100 / qtr",
    evidenceSummary: "Price variance +5.5% ($865.10 vs $820.00 across PO-0808 and PO-0925); OTIF declined to 74.1%; lead times lengthened.",
    draftDetails: "Enforce contract rate of $820/unit; require written recovery schedule within 5 business days restoring OTIF to >90%.",
    status: "Pending Approval",
    approvedAt: null,
    riskReductionEstimate: "Eliminates $45K unwarranted billing; arrests delivery slippage"
  }
];

// Audit logs stream initialized from transactional anomalies
export const INITIAL_ACTIVITY_LOG = [
  {
    id: "LOG-001",
    timestamp: "10 minutes ago",
    supplierCode: "Supplier A",
    supplierName: "Apex Precision Castings",
    severity: "CRITICAL",
    eventType: "Invoice Variance Flagged",
    message: "PO #PO-2026-1004 billed at $1,342.50 (+7.4% over contract cap $1,250.00). Total quarterly exposure confirmed at $74,000.",
    source: "Automated Commercial Audit"
  },
  {
    id: "LOG-002",
    timestamp: "2 hours ago",
    supplierCode: "Supplier A",
    supplierName: "Apex Precision Castings",
    severity: "CRITICAL",
    eventType: "Certificate Expiration Alert",
    message: "AS9100 Rev D audit window reached T-10 calendar days without certified renewal paperwork on file.",
    source: "Compliance Telemetry"
  },
  {
    id: "LOG-003",
    timestamp: "4 hours ago",
    supplierCode: "Supplier C",
    supplierName: "HydroTech Fluid Systems",
    severity: "HIGH",
    eventType: "Inventory Buffer Breach",
    message: "Plant stock coverage fell to 14 days (safety buffer requirement: 35 days). Lead-time gap is -56 days.",
    source: "Warehouse Inventory Feed"
  },
  {
    id: "LOG-004",
    timestamp: "6 hours ago",
    supplierCode: "Supplier F",
    supplierName: "Kinetic Dynamics",
    severity: "HIGH",
    eventType: "OTIF Degradation Trigger",
    message: "Quarterly On-Time In-Full delivery rate confirmed at 74.1% across completed motor shipments.",
    source: "Logistics Performance Feed"
  },
  {
    id: "LOG-005",
    timestamp: "1 day ago",
    supplierCode: "Supplier E",
    supplierName: "Rotary Precision Bearings",
    severity: "MEDIUM",
    eventType: "Inspection Defect Spike",
    message: "Incoming lot #LOT-QA-912 recorded 4.6% rejection rate (dimensional runout tolerance breach).",
    source: "QA Dock Inspection"
  },
  {
    id: "LOG-006",
    timestamp: "2 days ago",
    supplierCode: "Supplier B",
    supplierName: "Vanguard Microelectronics",
    severity: "LOW",
    eventType: "Telemetry Verification",
    message: "Quarterly SLA benchmark check completed with 98.9% OTIF and 0.4% rejection rate. All parameters nominal.",
    source: "Vendor Scorecard Engine"
  }
];
