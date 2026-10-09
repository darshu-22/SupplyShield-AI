/**
 * SupplyShield AI — Fictional Demonstration Dataset
 * 
 * DISCLAIMER & NOTICE:
 * All supplier records, vendor names, part numbers, metrics, and financial figures 
 * in this file are simulated, synthetic demonstration data created solely for 
 * evaluation and testing of the SupplyShield AI prototype.
 * They do NOT represent real commercial entities, actual corporate contracts, or live telemetry.
 */

export const DEMO_METADATA = {
  isDemonstrationData: true,
  datasetVersion: "1.0.4-simulated",
  lastSimulatedSync: "2026-10-09T18:30:00Z",
  simulationNotice: "Simulated demonstration data — Non-production prototype",
};

export const SUPPLIERS = [
  {
    id: "SUP-001",
    code: "Supplier A",
    name: "Apex Precision Castings & Alloys Ltd.",
    shortName: "Apex Castings",
    suppliedItem: "Critical Turbine & Structural Metal Castings (Grade 4140/Ti)",
    itemCategory: "Critical Metallurgy",
    criticality: "Critical Single-Source",
    isSingleSource: true,
    approvedSuppliersCount: 1,
    facilityLocation: "Dresden, Germany",
    annualSpend: 2400000,
    contractValue: "$2.40M / yr",

    // Risk Classification
    riskLevel: "HIGH",
    riskScore: 92, // 0 - 100
    riskTrend: "worsening",

    // Quality Trend
    qualityTrend: "Deteriorating (6% → 9.2%)",
    rejectionRate: 9.2, // increased from 6% to 9%
    baselineRejectionRate: 6.0,
    qualityAuditScore: 71,

    // Price Variance
    priceVariance: 7.4, // contract price exceeded by 7%
    priceVarianceFormatted: "+7.4%",
    contractUnitCost: 1250,
    billedUnitCost: 1342.50,
    quarterlyOverpaymentExposure: 74000, // Potential quarterly overpayment

    // Certificate Status
    certificateStatus: "Expiring Soon",
    certificateType: "AS9100 Rev D & ISO 9001",
    certificateExpiryDays: 10, // expires in 10 days
    certificateExpiryDate: "2026-10-19",
    auditScheduled: false,

    // Stock Coverage
    stockCoverageDays: 25, // stock coverage is 25 days
    targetSafetyStockDays: 45,
    leadTimeWeeks: 16,
    stockStatus: "Critical Deficit (25d vs 45d target)",

    // Delivery Performance
    onTimeDeliveryRate: 78.5,
    deliveryTrend: "degrading",

    // Detected Evidence & Warning Signals
    warningSigns: [
      {
        id: "WS-A1",
        severity: "CRITICAL",
        category: "Quality",
        title: "Rejection Rate Spike",
        detail: "Defect rate surged from baseline 6.0% to 9.2% across the last 3 incoming shipment batches. Porosity defects flagged in ultrasonic NDT tests.",
        detectedDate: "3 days ago"
      },
      {
        id: "WS-A2",
        severity: "CRITICAL",
        category: "Pricing",
        title: "Contract Price Ceiling Exceeded",
        detail: "Current unit billing exceeds master contract cap by +7.4% ($1,342.50 vs $1,250.00 agreed ceiling). Energy surcharge applied without contractual basis.",
        detectedDate: "5 days ago"
      },
      {
        id: "WS-A3",
        severity: "CRITICAL",
        category: "Compliance",
        title: "AS9100 Quality Certificate Imminent Expiry",
        detail: "Mandatory AS9100 aerospace/industrial quality certification expires in 10 days. No recertification auditor audit report on file.",
        detectedDate: "1 day ago"
      },
      {
        id: "WS-A4",
        severity: "HIGH",
        category: "Supply Chain",
        title: "Low Inventory Buffer & Sole Source Bottleneck",
        detail: "Buffer stock down to 25 days against a 16-week reorder lead time. Apex is currently the ONLY approved casting foundry in active qualification.",
        detectedDate: "2 days ago"
      }
    ],

    // Preliminary Diagnostic Summary
    preliminarySummary: {
      urgency: "Immediate Action Required (<48 Hours)",
      primaryRiskDriver: "Single-source vulnerability compounded by simultaneous quality degradation (+3.2% defect delta) and imminent ISO/AS cert expiration in 10 days.",
      financialImpactDescription: "Estimated $74,000 quarterly unapproved invoice variance + potential $1.8M factory downtime exposure if castings fail incoming NDT.",
      recommendedActions: [
        {
          id: "ACT-01",
          title: "Formal Price Surcharge Dispute & Payment Hold",
          type: "Commercial",
          description: "Hold invoice surcharge line-item of +7.4% pending contractual audit review.",
          status: "Draft Ready"
        },
        {
          id: "ACT-02",
          title: "Emergency AS9100 Audit Attestation Mandate",
          type: "Compliance",
          description: "Issue 48-hour formal cure notice requiring certified auditor schedule or interim compliance waiver.",
          status: "Draft Ready"
        },
        {
          id: "ACT-03",
          title: "Fast-Track Secondary Foundry Qualification",
          type: "Sourcing",
          description: "Initiate rapid tooling transfer and validation for Tier-2 standby foundry (Bavaria Alloy Tech).",
          status: "Under Review"
        }
      ]
    }
  },

  {
    id: "SUP-002",
    code: "Supplier B",
    name: "Vanguard Microelectronics Ltd.",
    shortName: "Vanguard Semi",
    suppliedItem: "Industrial Microcontrollers & CAN-Bus ICs",
    itemCategory: "Semiconductors & Electronics",
    criticality: "High (Multi-Sourced)",
    isSingleSource: false,
    approvedSuppliersCount: 3,
    facilityLocation: "Hsinchu Science Park, Taiwan",
    annualSpend: 1850000,
    contractValue: "$1.85M / yr",

    // Risk Classification
    riskLevel: "LOW",
    riskScore: 18,
    riskTrend: "stable",

    // Quality Trend
    qualityTrend: "Stable (0.4% rejection rate)",
    rejectionRate: 0.4,
    baselineRejectionRate: 0.5,
    qualityAuditScore: 96,

    // Price Variance
    priceVariance: 0.0, // price matches contract
    priceVarianceFormatted: "0.0%",
    contractUnitCost: 38.20,
    billedUnitCost: 38.20,
    quarterlyOverpaymentExposure: 0,

    // Certificate Status
    certificateStatus: "Valid", // certificate valid
    certificateType: "IATF 16949 & ISO 9001:2015",
    certificateExpiryDays: 480,
    certificateExpiryDate: "2028-02-15",
    auditScheduled: true,

    // Stock Coverage
    stockCoverageDays: 62,
    targetSafetyStockDays: 45,
    leadTimeWeeks: 6,
    stockStatus: "Healthy Buffer (62d coverage)",

    // Delivery Performance
    onTimeDeliveryRate: 98.9,
    deliveryTrend: "stable",

    // Detected Evidence & Warning Signals
    warningSigns: [
      {
        id: "WS-B1",
        severity: "LOW",
        category: "Market Watch",
        title: "Sub-Tier Silicon Wafer Price Index Fluctuation",
        detail: "Global upstream wafer feedstock price index rose 1.8%; fixed pricing agreement fully shields current contract through Q4 2027.",
        detectedDate: "12 days ago"
      }
    ],

    // Preliminary Diagnostic Summary
    preliminarySummary: {
      urgency: "Routine Monitoring",
      primaryRiskDriver: "Low operational risk. All SLA parameters, quality metrics, and price baselines tracking within optimal parameters.",
      financialImpactDescription: "$0 contractual discrepancy. Predictable spend profile.",
      recommendedActions: [
        {
          id: "ACT-B1",
          title: "Multi-Year Volume Tier Rebate Lock",
          type: "Commercial",
          description: "Initiate dialogue to lock in 3% volume rebate for next fiscal cycle.",
          status: "Optional"
        }
      ]
    }
  },

  {
    id: "SUP-003",
    code: "Supplier C",
    name: "HydroTech Fluid Systems Inc.",
    shortName: "HydroTech Seals",
    suppliedItem: "High-Pressure Hydraulic Fluorocarbon Seals & O-Rings",
    itemCategory: "Hydraulics & Fluid Power",
    criticality: "High",
    isSingleSource: false,
    approvedSuppliersCount: 2,
    facilityLocation: "Turin, Italy",
    annualSpend: 980000,
    contractValue: "$980K / yr",

    // Risk Classification
    riskLevel: "HIGH",
    riskScore: 84,
    riskTrend: "worsening",

    // Quality Trend
    qualityTrend: "Stable (1.8% rejection)",
    rejectionRate: 1.8,
    baselineRejectionRate: 1.5,
    qualityAuditScore: 84,

    // Price Variance
    priceVariance: 1.2,
    priceVarianceFormatted: "+1.2%",
    contractUnitCost: 44.00,
    billedUnitCost: 44.53,
    quarterlyOverpaymentExposure: 6360,

    // Certificate Status
    certificateStatus: "Valid",
    certificateType: "ISO 9001:2015 & DIN EN 681-1",
    certificateExpiryDays: 320,
    certificateExpiryDate: "2027-08-25",
    auditScheduled: true,

    // Stock Coverage
    stockCoverageDays: 14, // stock coverage is low
    targetSafetyStockDays: 35,
    leadTimeWeeks: 10, // delivery delays increasing
    stockStatus: "Severe Deficit (14d vs 35d target)",

    // Delivery Performance
    onTimeDeliveryRate: 64.2, // delivery delays are increasing
    deliveryTrend: "deteriorating",

    // Detected Evidence & Warning Signals
    warningSigns: [
      {
        id: "WS-C1",
        severity: "CRITICAL",
        category: "Supply Chain",
        title: "Critical Stock Depletion (14 Days Remaining)",
        detail: "Current on-hand factory reserve covers only 14 operating days against an extended reorder cycle of 10 weeks.",
        detectedDate: "1 day ago"
      },
      {
        id: "WS-C2",
        severity: "HIGH",
        category: "Logistics",
        title: "Escalating Dispatch Lateness (OTIF dropped to 64.2%)",
        detail: "Last four consecutive seal consignments experienced median arrival delays of 19 business days due to packaging line backlogs.",
        detectedDate: "4 days ago"
      },
      {
        id: "WS-C3",
        severity: "MEDIUM",
        category: "Pricing",
        title: "Minor Freight Surcharge Discrepancy (+1.2%)",
        detail: "Invoiced freight allocation exceeds indexed matrix cap by 1.2% ($6,360 unapproved quarterly excess).",
        detectedDate: "9 days ago"
      }
    ],

    // Preliminary Diagnostic Summary
    preliminarySummary: {
      urgency: "High Priority (<72 Hours)",
      primaryRiskDriver: "Severe delivery delay trajectory and critically depressed buffer inventory (14 days) threatens assembly stoppage.",
      financialImpactDescription: "Direct overpayment of $6,360/qtr; risk of hydraulic cylinder manufacturing stoppage estimated at $85,000/day.",
      recommendedActions: [
        {
          id: "ACT-C1",
          title: "Trigger 40% Volume Re-Allocation to Dual Source",
          type: "Sourcing",
          description: "Shift next open Purchase Order release to secondary supplier (SealsCorp Global) to rebuild safety buffer.",
          status: "Draft Ready"
        },
        {
          id: "ACT-C2",
          title: "Expedited Express Airfreight Transit Demand",
          type: "Logistics",
          description: "Mandate HydroTech fund express dedicated freight on delayed PO #PO-8819 at vendor cost.",
          status: "Draft Ready"
        }
      ]
    }
  },

  {
    id: "SUP-004",
    code: "Supplier D",
    name: "BioPac Sustainable Packaging Corp.",
    shortName: "BioPac",
    suppliedItem: "Heavy-Duty Recyclable Corrugated Packaging & Foam Inserts",
    itemCategory: "Packaging & Logistics",
    criticality: "Low (Commodity)",
    isSingleSource: false,
    approvedSuppliersCount: 5,
    facilityLocation: "Ohio, United States",
    annualSpend: 320000,
    contractValue: "$320K / yr",

    // Risk Classification
    riskLevel: "LOW",
    riskScore: 14,
    riskTrend: "stable",

    // Quality Trend
    qualityTrend: "Stable (0.2% rejection rate)",
    rejectionRate: 0.2,
    baselineRejectionRate: 0.3,
    qualityAuditScore: 98,

    // Price Variance
    priceVariance: -1.5, // below or matching contract
    priceVarianceFormatted: "-1.5%",
    contractUnitCost: 18.50,
    billedUnitCost: 18.22,
    quarterlyOverpaymentExposure: 0,

    // Certificate Status
    certificateStatus: "Valid",
    certificateType: "FSC Chain-of-Custody & ISO 14001",
    certificateExpiryDays: 520,
    certificateExpiryDate: "2028-04-10",
    auditScheduled: true,

    // Stock Coverage
    stockCoverageDays: 48,
    targetSafetyStockDays: 20,
    leadTimeWeeks: 1, // stable deliveries
    stockStatus: "Optimal Buffer (48d coverage)",

    // Delivery Performance
    onTimeDeliveryRate: 99.2, // stable deliveries and quality
    deliveryTrend: "stable",

    // Detected Evidence & Warning Signals
    warningSigns: [
      {
        id: "WS-D1",
        severity: "INFO",
        category: "Sustainability",
        title: "Annual Carbon Offset Verification Complete",
        detail: "Supplier submitted verified FSC carbon offset documentation; no risk indicators identified.",
        detectedDate: "14 days ago"
      }
    ],

    // Preliminary Diagnostic Summary
    preliminarySummary: {
      urgency: "Routine Review",
      primaryRiskDriver: "No active risk factors. Robust performance across quality, delivery schedules, and contract terms.",
      financialImpactDescription: "Operating at -1.5% favorable discount against budget.",
      recommendedActions: [
        {
          id: "ACT-D1",
          title: "Quarterly Quality Scorecard Archival",
          type: "Governance",
          description: "Archive automated A+ supplier rating for fiscal records.",
          status: "Completed"
        }
      ]
    }
  },

  {
    id: "SUP-005",
    code: "Supplier E",
    name: "Rotary Precision Bearings AG",
    shortName: "Rotary Bearings",
    suppliedItem: "High-Speed Ceramic Hybrid Precision Bearings",
    itemCategory: "Precision Mechanical Components",
    criticality: "High",
    isSingleSource: false,
    approvedSuppliersCount: 2,
    facilityLocation: "Winterthur, Switzerland",
    annualSpend: 1450000,
    contractValue: "$1.45M / yr",

    // Risk Classification
    riskLevel: "MEDIUM",
    riskScore: 68,
    riskTrend: "worsening",

    // Quality Trend
    qualityTrend: "Increasing Rejections (2.1% → 4.6%)",
    rejectionRate: 4.6, // rejection rate is increasing
    baselineRejectionRate: 2.1,
    qualityAuditScore: 76,

    // Price Variance
    priceVariance: 0.5,
    priceVarianceFormatted: "+0.5%",
    contractUnitCost: 310.00,
    billedUnitCost: 311.55,
    quarterlyOverpaymentExposure: 1812,

    // Certificate Status
    certificateStatus: "Expiring Soon",
    certificateType: "ISO 9001:2015 & IATF 16949",
    certificateExpiryDays: 20, // certificate expires in 20 days
    certificateExpiryDate: "2026-10-29",
    auditScheduled: false,

    // Stock Coverage
    stockCoverageDays: 34,
    targetSafetyStockDays: 30,
    leadTimeWeeks: 8,
    stockStatus: "Marginal Buffer (34d vs 30d target)",

    // Delivery Performance
    onTimeDeliveryRate: 88.0,
    deliveryTrend: "mild degradation",

    // Detected Evidence & Warning Signals
    warningSigns: [
      {
        id: "WS-E1",
        severity: "HIGH",
        category: "Quality",
        title: "Incoming Rejection Rate Escalation (4.6%)",
        detail: "Spindle runout tolerance variances caused incoming batch rejections to double from 2.1% baseline to 4.6%.",
        detectedDate: "2 days ago"
      },
      {
        id: "WS-E2",
        severity: "HIGH",
        category: "Compliance",
        title: "Quality Certificate Expiration in 20 Days",
        detail: "IATF 16949 recertification audit report pending. Recertification window closes in 20 days with no verified renewal confirmation.",
        detectedDate: "3 days ago"
      },
      {
        id: "WS-E3",
        severity: "MEDIUM",
        category: "Operations",
        title: "Grinding Tooling Calibration Drift Flagged",
        detail: "Engineering change notification revealed CNC grinding rig re-tooling caused recent batch micrometer discrepancies.",
        detectedDate: "6 days ago"
      }
    ],

    // Preliminary Diagnostic Summary
    preliminarySummary: {
      urgency: "Medium Priority (<5 Business Days)",
      primaryRiskDriver: "Concurrence of rising defect rates (+2.5% increase) and an unrenewed quality certificate expiring in 20 days.",
      financialImpactDescription: "Defect scrap costs totaling $19,400 across past two quarters; potential line slowdown.",
      recommendedActions: [
        {
          id: "ACT-E1",
          title: "Corrective Action Preventive Action (CAPA) Demand",
          type: "Quality",
          description: "Formal CAPA issuance requiring Root Cause Analysis (8D report) on CNC spindle bearing runout.",
          status: "Draft Ready"
        },
        {
          id: "ACT-E2",
          title: "IATF Recertification Evidence Ultimatum",
          type: "Compliance",
          description: "Request official auditor certificate extension letter within 7 calendar days.",
          status: "Draft Ready"
        }
      ]
    }
  },

  {
    id: "SUP-006",
    code: "Supplier F",
    name: "Kinetic Dynamics Motor Works GmbH",
    shortName: "Kinetic Dynamics",
    suppliedItem: "High-Torque Brushless DC Stator & Motor Assemblies",
    itemCategory: "Electro-Mechanical Power",
    criticality: "Critical Dual-Source",
    isSingleSource: false,
    approvedSuppliersCount: 2,
    facilityLocation: "Stuttgart, Germany",
    annualSpend: 2100000,
    contractValue: "$2.10M / yr",

    // Risk Classification
    riskLevel: "HIGH",
    riskScore: 79,
    riskTrend: "worsening",

    // Quality Trend
    qualityTrend: "Minor Increase (1.9% → 2.4%)",
    rejectionRate: 2.4,
    baselineRejectionRate: 1.9,
    qualityAuditScore: 79,

    // Price Variance
    priceVariance: 5.5, // price is above contract (+5.5%)
    priceVarianceFormatted: "+5.5%",
    contractUnitCost: 820.00,
    billedUnitCost: 865.10,
    quarterlyOverpaymentExposure: 45100, // Significant quarterly overpayment

    // Certificate Status
    certificateStatus: "Valid",
    certificateType: "ISO 9001:2015 & CE / UL 1004",
    certificateExpiryDays: 240,
    certificateExpiryDate: "2027-06-05",
    auditScheduled: true,

    // Stock Coverage
    stockCoverageDays: 28,
    targetSafetyStockDays: 40,
    leadTimeWeeks: 12,
    stockStatus: "Deficit Buffer (28d vs 40d target)",

    // Delivery Performance
    onTimeDeliveryRate: 74.1, // delivery performance is deteriorating
    deliveryTrend: "deteriorating (91% → 74.1%)",

    // Detected Evidence & Warning Signals
    warningSigns: [
      {
        id: "WS-F1",
        severity: "CRITICAL",
        category: "Pricing",
        title: "Unauthorized +5.5% Raw Copper Surcharge",
        detail: "Invoices since last cycle include unilateral copper raw material escalation not ratified in contract schedule B ($45,100 quarterly excess).",
        detectedDate: "2 days ago"
      },
      {
        id: "WS-F2",
        severity: "HIGH",
        category: "Logistics",
        title: "Delivery Fulfillment Degraded from 91% to 74.1%",
        detail: "Stator sub-assembly line has slipped from 91% on-time fulfillment down to 74.1% over past 180 days with lead times extending from 8 to 12 weeks.",
        detectedDate: "4 days ago"
      },
      {
        id: "WS-F3",
        severity: "MEDIUM",
        category: "Inventory",
        title: "Factory Buffer Depletion to 28 Days",
        detail: "Inventory buffer dropped below safety policy of 40 days, exposing motor integration cell to potential production stops.",
        detectedDate: "7 days ago"
      }
    ],

    // Preliminary Diagnostic Summary
    preliminarySummary: {
      urgency: "High Priority (<72 Hours)",
      primaryRiskDriver: "Sustained delivery degradation (OTIF 74.1%) paired with unauthorized price markup (+5.5%) generating $45K+ quarterly leakage.",
      financialImpactDescription: "$45,100 quarterly unapproved invoice variance; delayed finished product deliveries risk customer penalties.",
      recommendedActions: [
        {
          id: "ACT-F1",
          title: "Surcharge Billing Disallowance & Audit Notice",
          type: "Commercial",
          description: "Reject unratified copper premium lines on pending invoices and enforce master contractual rate of $820/unit.",
          status: "Draft Ready"
        },
        {
          id: "ACT-F2",
          title: "Executive SLA Recovery Summit Demand",
          type: "Governance",
          description: "Convene mandatory operational review with Kinetic VP of Operations to commit to a 30-day OTIF recovery plan.",
          status: "Draft Ready"
        }
      ]
    }
  }
];

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
    evidenceSummary: "Billed at $1,342.50 vs agreed cap $1,250.00; AS9100 expires in 10 days; single approved source.",
    draftDetails: "Formal legal and procurement notice referencing Master Agreement Section 9.2 (Price Caps) and Section 14 (Mandatory Quality Certification). Mandates retention of surcharge amounts.",
    status: "Pending Approval", // 'Pending Approval' | 'Approved' | 'Rejected'
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
    evidenceSummary: "Inventory down to 14 days; OTIF degraded to 64.2%; dispatch lateness averages 19 days.",
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
    evidenceSummary: "Rejections doubled to 4.6%; IATF cert expires in 20 days; spindle runout tolerance issues.",
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
    evidenceSummary: "Price variance +5.5% ($865.10 vs $820.00); OTIF declined to 74.1%; lead times lengthened.",
    draftDetails: "Enforce contract rate of $820/unit; require written recovery schedule within 5 business days restoring OTIF to >90%.",
    status: "Pending Approval",
    approvedAt: null,
    riskReductionEstimate: "Eliminates $45K unwarranted billing; arrests delivery slippage"
  }
];

export const INITIAL_ACTIVITY_LOG = [
  {
    id: "LOG-001",
    timestamp: "10 minutes ago",
    supplierCode: "Supplier A",
    supplierName: "Apex Precision Castings",
    severity: "CRITICAL",
    eventType: "Invoice Variance Flagged",
    message: "ERP sync detected invoice #INV-9921 with unit rate $1,342.50 (+7.4% over approved contract price $1,250.00). Overpayment impact: $74,000/qtr.",
    source: "Automated Commercial Audit"
  },
  {
    id: "LOG-002",
    timestamp: "2 hours ago",
    supplierCode: "Supplier A",
    supplierName: "Apex Precision Castings",
    severity: "CRITICAL",
    eventType: "Certificate Expiration Alert",
    message: "Quality credential AS9100 Rev D audit window reached T-10 calendar days without certified renewal paperwork on file.",
    source: "Compliance Telemetry"
  },
  {
    id: "LOG-003",
    timestamp: "4 hours ago",
    supplierCode: "Supplier C",
    supplierName: "HydroTech Fluid Systems",
    severity: "HIGH",
    eventType: "Inventory Buffer Breach",
    message: "Plant stock coverage fell to 14 days (safety buffer requirement: 35 days). Critical stockout hazard flagged.",
    source: "Warehouse Inventory Feed"
  },
  {
    id: "LOG-004",
    timestamp: "6 hours ago",
    supplierCode: "Supplier F",
    supplierName: "Kinetic Dynamics",
    severity: "HIGH",
    eventType: "OTIF Degradation Trigger",
    message: "Quarterly On-Time In-Full delivery rate confirmed at 74.1% (down from 91.0% historical benchmark).",
    source: "Logistics Performance Feed"
  },
  {
    id: "LOG-005",
    timestamp: "1 day ago",
    supplierCode: "Supplier E",
    supplierName: "Rotary Precision Bearings",
    severity: "MEDIUM",
    eventType: "Inspection Defect Spike",
    message: "Incoming quality inspection lot #BR-892 recorded 4.6% rejection rate (dimensional runout tolerance breach).",
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
