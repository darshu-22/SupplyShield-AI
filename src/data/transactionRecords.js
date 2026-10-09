/**
 * SupplyShield AI — Structured Transactional Database (Phase 2)
 * 
 * NOTICE & DISCLAIMER:
 * All transaction records, purchase orders, inspection lots, and inventory levels
 * in this module are simulated demonstration records created solely for evaluation.
 * They represent realistic multi-tier industrial procurement data.
 */

// Master component demand and lead time baselines
export const INVENTORY_RECORDS = [
  {
    supplierId: "SUP-001",
    supplierCode: "Supplier A",
    itemId: "ITEM-CAST-4140",
    itemName: "Critical Turbine & Structural Metal Castings (Grade 4140/Ti)",
    currentOnHandUnits: 500,
    averageDailyDemandUnits: 20, // 500 / 20 = 25 days coverage
    targetSafetyStockDays: 45,
    replenishmentLeadTimeDays: 112, // 16 weeks * 7 = 112 days
    stockCoverageDays: 25,
    leadTimeCoverageGapDays: -87, // 25 - 112 = -87 days deficit
    unitOfMeasure: "units",
    facilityLocation: "Dresden, Germany",
    reorderTriggerPointUnits: 2240
  },
  {
    supplierId: "SUP-002",
    supplierCode: "Supplier B",
    itemId: "ITEM-MCU-CANBUS",
    itemName: "Industrial Microcontrollers & CAN-Bus ICs",
    currentOnHandUnits: 6200,
    averageDailyDemandUnits: 100, // 6200 / 100 = 62 days coverage
    targetSafetyStockDays: 45,
    replenishmentLeadTimeDays: 42, // 6 weeks = 42 days
    stockCoverageDays: 62,
    leadTimeCoverageGapDays: 20, // 62 - 42 = +20 days surplus
    unitOfMeasure: "chips",
    facilityLocation: "Hsinchu, Taiwan",
    reorderTriggerPointUnits: 4200
  },
  {
    supplierId: "SUP-003",
    supplierCode: "Supplier C",
    itemId: "ITEM-SEAL-FKM",
    itemName: "High-Pressure Hydraulic Fluorocarbon Seals & O-Rings",
    currentOnHandUnits: 700,
    averageDailyDemandUnits: 50, // 700 / 50 = 14 days coverage
    targetSafetyStockDays: 35,
    replenishmentLeadTimeDays: 70, // 10 weeks = 70 days (delayed)
    stockCoverageDays: 14,
    leadTimeCoverageGapDays: -56, // 14 - 70 = -56 days deficit
    unitOfMeasure: "seal-sets",
    facilityLocation: "Turin, Italy",
    reorderTriggerPointUnits: 3500
  },
  {
    supplierId: "SUP-004",
    supplierCode: "Supplier D",
    itemId: "ITEM-PACK-CORR",
    itemName: "Heavy-Duty Recyclable Corrugated Packaging & Foam Inserts",
    currentOnHandUnits: 2400,
    averageDailyDemandUnits: 50, // 2400 / 50 = 48 days coverage
    targetSafetyStockDays: 20,
    replenishmentLeadTimeDays: 7, // 1 week = 7 days
    stockCoverageDays: 48,
    leadTimeCoverageGapDays: 41, // 48 - 7 = +41 days surplus
    unitOfMeasure: "cartons",
    facilityLocation: "Ohio, United States",
    reorderTriggerPointUnits: 350
  },
  {
    supplierId: "SUP-005",
    supplierCode: "Supplier E",
    itemId: "ITEM-BRG-CERAMIC",
    itemName: "High-Speed Ceramic Hybrid Precision Bearings",
    currentOnHandUnits: 340,
    averageDailyDemandUnits: 10, // 340 / 10 = 34 days coverage
    targetSafetyStockDays: 30,
    replenishmentLeadTimeDays: 56, // 8 weeks = 56 days
    stockCoverageDays: 34,
    leadTimeCoverageGapDays: -22, // 34 - 56 = -22 days deficit
    unitOfMeasure: "bearing-assemblies",
    facilityLocation: "Winterthur, Switzerland",
    reorderTriggerPointUnits: 560
  },
  {
    supplierId: "SUP-006",
    supplierCode: "Supplier F",
    itemId: "ITEM-MTR-BLDC",
    itemName: "High-Torque Brushless DC Stator & Motor Assemblies",
    currentOnHandUnits: 280,
    averageDailyDemandUnits: 10, // 280 / 10 = 28 days coverage
    targetSafetyStockDays: 40,
    replenishmentLeadTimeDays: 84, // 12 weeks = 84 days
    stockCoverageDays: 28,
    leadTimeCoverageGapDays: -56, // 28 - 84 = -56 days deficit
    unitOfMeasure: "motor-units",
    facilityLocation: "Stuttgart, Germany",
    reorderTriggerPointUnits: 840
  }
];

// Historical and active Purchase Orders with unit prices and actuals
export const PURCHASE_ORDER_RECORDS = [
  // Supplier A (Apex Precision Castings) — Unapproved +7.4% price variance
  {
    poId: "PO-2026-0810",
    supplierId: "SUP-001",
    itemId: "ITEM-CAST-4140",
    orderDate: "2026-07-15",
    expectedDeliveryDate: "2026-08-15",
    actualDeliveryDate: "2026-08-22",
    delayDays: 7,
    quantityOrdered: 250,
    contractUnitPrice: 1250.00,
    actualBilledUnitPrice: 1342.50, // +$92.50 (+7.4%)
    variancePct: 7.4,
    overpaymentTotal: 23125.00, // 250 * 92.50
    deliveryStatus: "COMPLETED_LATE",
    invoiceStatus: "FLAGGED_DISPUTED",
    paymentNote: "Energy surcharge unapproved line item"
  },
  {
    poId: "PO-2026-0922",
    supplierId: "SUP-001",
    itemId: "ITEM-CAST-4140",
    orderDate: "2026-08-10",
    expectedDeliveryDate: "2026-09-12",
    actualDeliveryDate: "2026-09-24",
    delayDays: 12,
    quantityOrdered: 300,
    contractUnitPrice: 1250.00,
    actualBilledUnitPrice: 1342.50,
    variancePct: 7.4,
    overpaymentTotal: 27750.00, // 300 * 92.50
    deliveryStatus: "COMPLETED_LATE",
    invoiceStatus: "FLAGGED_DISPUTED",
    paymentNote: "Energy surcharge unapproved line item"
  },
  {
    poId: "PO-2026-1004",
    supplierId: "SUP-001",
    itemId: "ITEM-CAST-4140",
    orderDate: "2026-09-05",
    expectedDeliveryDate: "2026-10-02",
    actualDeliveryDate: "2026-10-09",
    delayDays: 7,
    quantityOrdered: 250,
    contractUnitPrice: 1250.00,
    actualBilledUnitPrice: 1342.50,
    variancePct: 7.4,
    overpaymentTotal: 23125.00, // 250 * 92.50
    deliveryStatus: "COMPLETED_LATE",
    invoiceStatus: "PENDING_AUDIT_HOLD",
    paymentNote: "Invoice blocked by automated contract rule"
  },

  // Supplier B (Vanguard Microelectronics) — Contract compliant, on-time
  {
    poId: "PO-2026-0701",
    supplierId: "SUP-002",
    itemId: "ITEM-MCU-CANBUS",
    orderDate: "2026-06-20",
    expectedDeliveryDate: "2026-07-28",
    actualDeliveryDate: "2026-07-26",
    delayDays: 0,
    quantityOrdered: 5000,
    contractUnitPrice: 38.20,
    actualBilledUnitPrice: 38.20,
    variancePct: 0.0,
    overpaymentTotal: 0.00,
    deliveryStatus: "COMPLETED_ON_TIME",
    invoiceStatus: "PAID",
    paymentNote: "Contract rate applied"
  },
  {
    poId: "PO-2026-0902",
    supplierId: "SUP-002",
    itemId: "ITEM-MCU-CANBUS",
    orderDate: "2026-08-01",
    expectedDeliveryDate: "2026-09-10",
    actualDeliveryDate: "2026-09-09",
    delayDays: 0,
    quantityOrdered: 7000,
    contractUnitPrice: 38.20,
    actualBilledUnitPrice: 38.20,
    variancePct: 0.0,
    overpaymentTotal: 0.00,
    deliveryStatus: "COMPLETED_ON_TIME",
    invoiceStatus: "PAID",
    paymentNote: "Contract rate applied"
  },

  // Supplier C (HydroTech Fluid Systems) — Late deliveries + minor freight markup
  {
    poId: "PO-2026-0818",
    supplierId: "SUP-003",
    itemId: "ITEM-SEAL-FKM",
    orderDate: "2026-06-15",
    expectedDeliveryDate: "2026-08-01",
    actualDeliveryDate: "2026-08-21",
    delayDays: 20,
    quantityOrdered: 4000,
    contractUnitPrice: 44.00,
    actualBilledUnitPrice: 44.53, // +$0.53 (+1.2%)
    variancePct: 1.2,
    overpaymentTotal: 2120.00,
    deliveryStatus: "COMPLETED_LATE",
    invoiceStatus: "PAID_UNDER_PROTEST",
    paymentNote: "Logistics fuel surcharge added"
  },
  {
    poId: "PO-2026-0919",
    supplierId: "SUP-003",
    itemId: "ITEM-SEAL-FKM",
    orderDate: "2026-07-20",
    expectedDeliveryDate: "2026-09-01",
    actualDeliveryDate: "2026-09-20",
    delayDays: 19,
    quantityOrdered: 4000,
    contractUnitPrice: 44.00,
    actualBilledUnitPrice: 44.53,
    variancePct: 1.2,
    overpaymentTotal: 2120.00,
    deliveryStatus: "COMPLETED_LATE",
    invoiceStatus: "PAID_UNDER_PROTEST",
    paymentNote: "Logistics fuel surcharge added"
  },
  {
    poId: "PO-2026-1001",
    supplierId: "SUP-003",
    itemId: "ITEM-SEAL-FKM",
    orderDate: "2026-08-15",
    expectedDeliveryDate: "2026-09-25",
    actualDeliveryDate: "2026-10-14",
    delayDays: 19,
    quantityOrdered: 4000,
    contractUnitPrice: 44.00,
    actualBilledUnitPrice: 44.53,
    variancePct: 1.2,
    overpaymentTotal: 2120.00,
    deliveryStatus: "COMPLETED_LATE",
    invoiceStatus: "PENDING_REVIEW",
    paymentNote: "Port dispatch backlog"
  },

  // Supplier D (BioPac Sustainable Packaging) — Discount applied
  {
    poId: "PO-2026-0805",
    supplierId: "SUP-004",
    itemId: "ITEM-PACK-CORR",
    orderDate: "2026-07-28",
    expectedDeliveryDate: "2026-08-04",
    actualDeliveryDate: "2026-08-04",
    delayDays: 0,
    quantityOrdered: 4500,
    contractUnitPrice: 18.50,
    actualBilledUnitPrice: 18.22, // -1.5%
    variancePct: -1.5,
    overpaymentTotal: 0.00,
    deliveryStatus: "COMPLETED_ON_TIME",
    invoiceStatus: "PAID",
    paymentNote: "Quarterly volume rebate applied"
  },

  // Supplier E (Rotary Precision Bearings) — Minor price deviation
  {
    poId: "PO-2026-0814",
    supplierId: "SUP-005",
    itemId: "ITEM-BRG-CERAMIC",
    orderDate: "2026-07-01",
    expectedDeliveryDate: "2026-08-15",
    actualDeliveryDate: "2026-08-20",
    delayDays: 5,
    quantityOrdered: 600,
    contractUnitPrice: 310.00,
    actualBilledUnitPrice: 311.55, // +$1.55 (+0.5%)
    variancePct: 0.5,
    overpaymentTotal: 930.00,
    deliveryStatus: "COMPLETED_LATE",
    invoiceStatus: "PAID",
    paymentNote: "Tooling re-calibration surcharge"
  },
  {
    poId: "PO-2026-0920",
    supplierId: "SUP-005",
    itemId: "ITEM-BRG-CERAMIC",
    orderDate: "2026-08-05",
    expectedDeliveryDate: "2026-09-22",
    actualDeliveryDate: "2026-09-26",
    delayDays: 4,
    quantityOrdered: 569,
    contractUnitPrice: 310.00,
    actualBilledUnitPrice: 311.55,
    variancePct: 0.5,
    overpaymentTotal: 882.00,
    deliveryStatus: "COMPLETED_LATE",
    invoiceStatus: "PENDING_AUDIT",
    paymentNote: "Tooling re-calibration surcharge"
  },

  // Supplier F (Kinetic Dynamics Motor Works) — Unapproved Copper Surcharge (+5.5%)
  {
    poId: "PO-2026-0808",
    supplierId: "SUP-006",
    itemId: "ITEM-MTR-BLDC",
    orderDate: "2026-06-25",
    expectedDeliveryDate: "2026-08-10",
    actualDeliveryDate: "2026-08-29",
    delayDays: 19,
    quantityOrdered: 500,
    contractUnitPrice: 820.00,
    actualBilledUnitPrice: 865.10, // +$45.10 (+5.5%)
    variancePct: 5.5,
    overpaymentTotal: 22550.00, // 500 * 45.10
    deliveryStatus: "COMPLETED_LATE",
    invoiceStatus: "FLAGGED_DISPUTED",
    paymentNote: "Unapproved raw copper index premium"
  },
  {
    poId: "PO-2026-0925",
    supplierId: "SUP-006",
    itemId: "ITEM-MTR-BLDC",
    orderDate: "2026-08-01",
    expectedDeliveryDate: "2026-09-15",
    actualDeliveryDate: "2026-10-06",
    delayDays: 21,
    quantityOrdered: 500,
    contractUnitPrice: 820.00,
    actualBilledUnitPrice: 865.10,
    variancePct: 5.5,
    overpaymentTotal: 22550.00, // 500 * 45.10
    deliveryStatus: "COMPLETED_LATE",
    invoiceStatus: "FLAGGED_DISPUTED",
    paymentNote: "Unapproved raw copper index premium"
  }
];

// Inspection Lots and Quality Test Logs
export const INSPECTION_LOT_RECORDS = [
  // Supplier A: Recent defect surge from 6% to 9.2%
  {
    lotId: "LOT-QA-881",
    poId: "PO-2026-0810",
    supplierId: "SUP-001",
    inspectionDate: "2026-08-23",
    inspectedUnits: 250,
    rejectedUnits: 15, // 6.0% baseline
    rejectionRatePct: 6.0,
    defectCategory: "Subsurface Micro-Porosity",
    ndtMethod: "Ultrasonic Immersion Inspection",
    status: "CONDITIONAL_ACCEPT",
    reworkRequired: true
  },
  {
    lotId: "LOT-QA-904",
    poId: "PO-2026-0922",
    supplierId: "SUP-001",
    inspectionDate: "2026-09-25",
    inspectedUnits: 300,
    rejectedUnits: 25, // 8.3%
    rejectionRatePct: 8.3,
    defectCategory: "Gas Porosity & Sand Inclusion",
    ndtMethod: "Radiographic X-Ray NDT",
    status: "REJECTED_QUARANTINED",
    reworkRequired: true
  },
  {
    lotId: "LOT-QA-932",
    poId: "PO-2026-1004",
    supplierId: "SUP-001",
    inspectionDate: "2026-10-09",
    inspectedUnits: 250,
    rejectedUnits: 23, // 9.2% current
    rejectionRatePct: 9.2,
    defectCategory: "Wall Thickness Variance & Cracking",
    ndtMethod: "Laser Profile & Ultrasonic",
    status: "REJECTED_QUARANTINED",
    reworkRequired: true
  },

  // Supplier B: 0.4% rejection rate
  {
    lotId: "LOT-QA-840",
    poId: "PO-2026-0701",
    supplierId: "SUP-002",
    inspectionDate: "2026-07-27",
    inspectedUnits: 5000,
    rejectedUnits: 20, // 0.4%
    rejectionRatePct: 0.4,
    defectCategory: "Pin Solderability Oxidation",
    ndtMethod: "Automated Optical Inspection (AOI)",
    status: "ACCEPTED",
    reworkRequired: false
  },
  {
    lotId: "LOT-QA-895",
    poId: "PO-2026-0902",
    supplierId: "SUP-002",
    inspectionDate: "2026-09-10",
    inspectedUnits: 7000,
    rejectedUnits: 28, // 0.4%
    rejectionRatePct: 0.4,
    defectCategory: "Lead Coplanarity Tolerance",
    ndtMethod: "AOI & Functional Bus Test",
    status: "ACCEPTED",
    reworkRequired: false
  },

  // Supplier C: 1.8% rejection rate
  {
    lotId: "LOT-QA-872",
    poId: "PO-2026-0818",
    supplierId: "SUP-003",
    inspectionDate: "2026-08-22",
    inspectedUnits: 4000,
    rejectedUnits: 72, // 1.8%
    rejectionRatePct: 1.8,
    defectCategory: "Flash Parting Line Excess",
    ndtMethod: "Micrometer & Tensile Durometer",
    status: "ACCEPTED_WITH_TRIM",
    reworkRequired: false
  },

  // Supplier D: 0.2% rejection rate
  {
    lotId: "LOT-QA-862",
    poId: "PO-2026-0805",
    supplierId: "SUP-004",
    inspectionDate: "2026-08-05",
    inspectedUnits: 4500,
    rejectedUnits: 9, // 0.2%
    rejectionRatePct: 0.2,
    defectCategory: "Surface Scuff on Secondary Liner",
    ndtMethod: "Visual & Burst Strength Test",
    status: "ACCEPTED",
    reworkRequired: false
  },

  // Supplier E: Doubling rejections 2.1% -> 4.6%
  {
    lotId: "LOT-QA-868",
    poId: "PO-2026-0814",
    supplierId: "SUP-005",
    inspectionDate: "2026-08-21",
    inspectedUnits: 600,
    rejectedUnits: 13, // 2.1% baseline
    rejectionRatePct: 2.1,
    defectCategory: "Inner Raceway Runout Deviation",
    ndtMethod: "Formscan Roundness Gage",
    status: "ACCEPTED",
    reworkRequired: false
  },
  {
    lotId: "LOT-QA-912",
    poId: "PO-2026-0920",
    supplierId: "SUP-005",
    inspectionDate: "2026-09-27",
    inspectedUnits: 569,
    rejectedUnits: 26, // 4.6% spike
    rejectionRatePct: 4.6,
    defectCategory: "Ceramic Ball Surface Micro-Pit",
    ndtMethod: "Interferometry & Noise Analysis",
    status: "REJECTED_QUARANTINED",
    reworkRequired: true
  },

  // Supplier F: 2.4% rejection rate
  {
    lotId: "LOT-QA-880",
    poId: "PO-2026-0808",
    supplierId: "SUP-006",
    inspectionDate: "2026-08-30",
    inspectedUnits: 500,
    rejectedUnits: 12, // 2.4%
    rejectionRatePct: 2.4,
    defectCategory: "Stator Winding Insulation Breakdown",
    ndtMethod: "Hi-Pot Surge Voltage Test",
    status: "CONDITIONAL_ACCEPT",
    reworkRequired: true
  }
];

// Compliance and ISO / Industry Certifications
export const COMPLIANCE_RECORDS = [
  {
    certId: "CERT-AS-9100",
    supplierId: "SUP-001",
    certType: "AS9100 Rev D & ISO 9001:2015",
    scope: "Aviation & Industrial Precision Casting",
    issuingRegistrar: "TUV SUD Aviation Cert Corp",
    effectiveDate: "2023-10-19",
    expiryDate: "2026-10-19",
    daysRemaining: 10, // Expires in 10 days
    auditStatus: "RECERTIFICATION_OVERDUE",
    isCritical: true,
    recertAuditScheduled: false
  },
  {
    certId: "CERT-IATF-16949-V",
    supplierId: "SUP-002",
    certType: "IATF 16949 & ISO 9001:2015",
    scope: "Automotive Microcontroller Packaging",
    issuingRegistrar: "BSI Group Taiwan",
    effectiveDate: "2024-02-15",
    expiryDate: "2028-02-15",
    daysRemaining: 480,
    auditStatus: "CURRENT_VALID",
    isCritical: false,
    recertAuditScheduled: true
  },
  {
    certId: "CERT-ISO-9001-H",
    supplierId: "SUP-003",
    certType: "ISO 9001:2015 & DIN EN 681-1",
    scope: "Elastomeric Seals for Hydraulic Systems",
    issuingRegistrar: "DNV GL Italy",
    effectiveDate: "2024-08-25",
    expiryDate: "2027-08-25",
    daysRemaining: 320,
    auditStatus: "CURRENT_VALID",
    isCritical: false,
    recertAuditScheduled: true
  },
  {
    certId: "CERT-FSC-14001",
    supplierId: "SUP-004",
    certType: "FSC Chain-of-Custody & ISO 14001",
    scope: "Sustainable Corrugated Packaging",
    issuingRegistrar: "SCS Global Services",
    effectiveDate: "2024-04-10",
    expiryDate: "2028-04-10",
    daysRemaining: 520,
    auditStatus: "CURRENT_VALID",
    isCritical: false,
    recertAuditScheduled: true
  },
  {
    certId: "CERT-IATF-16949-R",
    supplierId: "SUP-005",
    certType: "ISO 9001:2015 & IATF 16949",
    scope: "High-Speed Bearing Manufacturing",
    issuingRegistrar: "Bureau Veritas Switzerland",
    effectiveDate: "2023-10-29",
    expiryDate: "2026-10-29",
    daysRemaining: 20, // Expires in 20 days
    auditStatus: "AUDIT_WINDOW_CLOSING",
    isCritical: true,
    recertAuditScheduled: false
  },
  {
    certId: "CERT-ISO-9001-K",
    supplierId: "SUP-006",
    certType: "ISO 9001:2015 & UL 1004",
    scope: "Electric Motor Stator & Rotor Core",
    issuingRegistrar: "DEKRA Certification Germany",
    effectiveDate: "2024-06-05",
    expiryDate: "2027-06-05",
    daysRemaining: 240,
    auditStatus: "CURRENT_VALID",
    isCritical: false,
    recertAuditScheduled: true
  }
];

// Dual-sourcing and Supplier Dependency Architecture
export const DEPENDENCY_RECORDS = [
  {
    supplierId: "SUP-001",
    approvedSourcesCount: 1,
    isSingleSource: true,
    criticalityTier: "CRITICAL",
    switchingLeadTimeWeeks: 24,
    standbySupplierName: "Bavaria Alloy Tech GmbH",
    standbySupplierStatus: "UNQUALIFIED_STANDBY",
    riskImplication: "Zero redundancy; single foundry failure shuts down entire turbine assembly line."
  },
  {
    supplierId: "SUP-002",
    approvedSourcesCount: 3,
    isSingleSource: false,
    criticalityTier: "HIGH",
    switchingLeadTimeWeeks: 4,
    standbySupplierName: "GlobalSemi Fab Corp & Nippon Micro",
    standbySupplierStatus: "FULLY_QUALIFIED_ACTIVE",
    riskImplication: "Robust tri-source allocation; seamless order diversion."
  },
  {
    supplierId: "SUP-003",
    approvedSourcesCount: 2,
    isSingleSource: false,
    criticalityTier: "HIGH",
    switchingLeadTimeWeeks: 3,
    standbySupplierName: "SealsCorp Global Ltd.",
    standbySupplierStatus: "PRE_QUALIFIED_STANDBY",
    riskImplication: "Dual source exists; 40% volume can be diverted immediately to rebuild factory buffer."
  },
  {
    supplierId: "SUP-004",
    approvedSourcesCount: 5,
    isSingleSource: false,
    criticalityTier: "COMMODITY",
    switchingLeadTimeWeeks: 1,
    standbySupplierName: "Midwest Corrugated & EcoPack USA",
    standbySupplierStatus: "COMMODITY_OPEN_MARKET",
    riskImplication: "Highly liquid market with minimal switching friction."
  },
  {
    supplierId: "SUP-005",
    approvedSourcesCount: 2,
    isSingleSource: false,
    criticalityTier: "HIGH",
    switchingLeadTimeWeeks: 12,
    standbySupplierName: "Alpine Precision Spindles",
    standbySupplierStatus: "AUDIT_PENDING",
    riskImplication: "Secondary source uncertified; tooling transfer requires 12 weeks."
  },
  {
    supplierId: "SUP-006",
    approvedSourcesCount: 2,
    isSingleSource: false,
    criticalityTier: "CRITICAL",
    switchingLeadTimeWeeks: 8,
    standbySupplierName: "TorqueMotion Drives Inc.",
    standbySupplierStatus: "DUAL_SOURCE_ACTIVE",
    riskImplication: "Secondary supplier active with 30% baseline volume allocation."
  }
];
