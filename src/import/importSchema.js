/**
 * SupplyShield AI — Canonical Import Schema & Metadata Definitions
 * 
 * Defines canonical schema fields, automatic alias detection, numeric bounds,
 * and sample template datasets for user-provided supplier data.
 */

export const CANONICAL_FIELDS = [
  {
    key: 'vendorName',
    label: 'Vendor Name / Supplier Code',
    required: true,
    type: 'string',
    description: 'Unique supplier legal entity name, operating title, or vendor ID code.',
    aliases: [
      'vendor', 'vendor_name', 'vendor name', 'supplier', 'supplier_name', 'supplier name',
      'supplier_id', 'vendor_id', 'company', 'company_name', 'name', 'code', 'supplier code'
    ],
    example: 'Apex Precision Castings'
  },
  {
    key: 'deliveryPerformance',
    label: 'On-Time Delivery Rate (%)',
    required: false,
    type: 'number',
    min: 0,
    max: 100,
    unit: '%',
    description: 'Percentage of purchase orders fulfilled on or before agreed SLA delivery date (OTIF).',
    aliases: [
      'delivery', 'delivery_performance', 'delivery performance', 'otif', 'otif_rate', 'otif %',
      'on_time_delivery', 'on-time delivery', 'on time delivery', 'delivery_rate', 'delivery %', 'sla_compliance'
    ],
    example: '92.5'
  },
  {
    key: 'qualityDefectRate',
    label: 'Quality Defect / Rejection Rate (%)',
    required: false,
    type: 'number',
    min: 0,
    max: 100,
    unit: '%',
    description: 'Percentage of inspected incoming batch units rejected at quality receiving dock.',
    aliases: [
      'quality', 'defect_rate', 'defect rate', 'rejection_rate', 'rejection rate', 'quality_defect_rate',
      'defects', 'rejections', 'quality_score', 'defect %', 'rejection %', 'scrap_rate'
    ],
    example: '2.4'
  },
  {
    key: 'priceVariance',
    label: 'Contract Price Variance (%)',
    required: false,
    type: 'number',
    min: -100,
    max: 500,
    unit: '%',
    description: 'Percentage difference between actual invoice unit billed price and agreed master contract price (+% = overbilling).',
    aliases: [
      'price_variance', 'price variance', 'cost_variance', 'cost variance', 'price_delta', 'price_variance_pct',
      'variance', 'contract_variance', 'invoice_variance', 'price_deviation', 'cost_delta'
    ],
    example: '+4.5'
  },
  {
    key: 'stockCoverageDays',
    label: 'Stock Coverage (Days)',
    required: false,
    type: 'number',
    min: 0,
    max: 1000,
    unit: 'days',
    description: 'Current factory available on-hand inventory buffer divided by average daily consumption.',
    aliases: [
      'stock_coverage', 'stock coverage', 'stock_coverage_days', 'stock coverage days', 'inventory_days',
      'days_of_supply', 'coverage_days', 'stock_days', 'on_hand_days', 'inventory_coverage'
    ],
    example: '35'
  },
  {
    key: 'leadTimeDays',
    label: 'Replenishment Lead Time (Days)',
    required: false,
    type: 'number',
    min: 0,
    max: 1000,
    unit: 'days',
    description: 'Lead time in calendar days from purchase order transmission to factory dock receipt.',
    aliases: [
      'lead_time', 'lead time', 'lead_time_days', 'lead time days', 'replenishment_lead_time',
      'lead_time_weeks', 'lt_days', 'turnaround_days', 'reorder_lead_time'
    ],
    example: '42'
  },
  {
    key: 'certificateDaysRemaining',
    label: 'Cert Days Remaining / Expiry',
    required: false,
    type: 'number_or_date',
    unit: 'days',
    description: 'Calendar days until primary quality/ISO accreditation expires (or ISO date string YYYY-MM-DD).',
    aliases: [
      'certificate_days', 'certificate days', 'cert_days_remaining', 'cert days remaining', 'days_to_expiry',
      'cert_expiry', 'cert expiry', 'expiry_days', 'compliance_days', 'cert_days', 'certificate_expiry'
    ],
    example: '45'
  },
  {
    key: 'singleSource',
    label: 'Single-Source Dependency',
    required: false,
    type: 'boolean',
    description: 'Whether company has sole-source exposure with no secondary approved standby vendor (Yes/No, true/false).',
    aliases: [
      'single_source', 'single source', 'sole_source', 'sole source', 'is_single_source',
      'single_source_dependency', 'critical_single_source', 'sole_supplier', 'single_sourced'
    ],
    example: 'Yes'
  },
  // Optional Enrichment Fields
  {
    key: 'itemCategory',
    label: 'Commodity / Category',
    required: false,
    type: 'string',
    description: 'Procurement commodity group or component category.',
    aliases: ['category', 'item_category', 'commodity', 'commodity_group', 'material_group', 'segment'],
    example: 'Precision Metallurgy'
  },
  {
    key: 'suppliedItem',
    label: 'Supplied Part / Item',
    required: false,
    type: 'string',
    description: 'Primary part description or component family supplied.',
    aliases: ['supplied_item', 'part_name', 'item_name', 'product', 'component', 'material'],
    example: 'Turbine Castings'
  },
  {
    key: 'annualSpend',
    label: 'Annual Spend ($)',
    required: false,
    type: 'number',
    min: 0,
    unit: '$',
    description: 'Estimated annual procurement spend volume in USD.',
    aliases: ['annual_spend', 'spend', 'contract_value', 'spend_usd', 'annual_cost', 'po_volume'],
    example: '1500000'
  },
  {
    key: 'facilityLocation',
    label: 'Facility Location',
    required: false,
    type: 'string',
    description: 'Primary manufacturing plant location (City, Country).',
    aliases: ['location', 'facility_location', 'facility', 'country', 'city', 'region', 'plant_location'],
    example: 'Stuttgart, Germany'
  }
];

/**
 * Match a raw uploaded column header against canonical fields using aliases
 */
export function matchHeaderToCanonical(rawHeader) {
  if (!rawHeader || typeof rawHeader !== 'string') return null;
  const normalized = rawHeader.trim().toLowerCase().replace(/[\s\-_.]+/g, '_');

  for (const field of CANONICAL_FIELDS) {
    if (field.key.toLowerCase() === normalized) return field.key;
    const directNormalized = field.key.toLowerCase().replace(/[\s\-_.]+/g, '_');
    if (directNormalized === normalized) return field.key;

    for (const alias of field.aliases) {
      const normAlias = alias.toLowerCase().replace(/[\s\-_.]+/g, '_');
      if (normAlias === normalized) return field.key;
    }
  }

  // Substring or fuzzy check fallback
  for (const field of CANONICAL_FIELDS) {
    for (const alias of field.aliases) {
      const normAlias = alias.toLowerCase().replace(/[\s\-_.]+/g, '_');
      if (normalized.includes(normAlias) || normAlias.includes(normalized)) {
        return field.key;
      }
    }
  }

  return null;
}

/**
 * Sample dataset rows for testing and download templates
 */
export const SAMPLE_TEMPLATE_ROWS = [
  {
    vendorName: "Delta Precision Machining Corp",
    deliveryPerformance: 94.5,
    qualityDefectRate: 1.8,
    priceVariance: 1.2,
    stockCoverageDays: 45,
    leadTimeDays: 28,
    certificateDaysRemaining: 180,
    singleSource: "No",
    itemCategory: "Mechanical Machining",
    suppliedItem: "High-Tolerance Aluminum Flanges",
    annualSpend: 1450000,
    facilityLocation: "Ohio, United States"
  },
  {
    vendorName: "Zenith Microelectronics Ltd",
    deliveryPerformance: 68.2,
    qualityDefectRate: 6.4,
    priceVariance: 7.8,
    stockCoverageDays: 16,
    leadTimeDays: 90,
    certificateDaysRemaining: 18,
    singleSource: "Yes",
    itemCategory: "Semiconductors",
    suppliedItem: "CAN-Bus Microcontrollers & Transceivers",
    annualSpend: 2800000,
    facilityLocation: "Hsinchu, Taiwan"
  },
  {
    vendorName: "Boreal Polymer & Sealings AB",
    deliveryPerformance: 88.0,
    qualityDefectRate: 3.2,
    priceVariance: 3.5,
    stockCoverageDays: 26,
    leadTimeDays: 42,
    certificateDaysRemaining: 48,
    singleSource: "Yes",
    itemCategory: "Hydraulics & Seals",
    suppliedItem: "High-Pressure Fluoroelastomer O-Rings",
    annualSpend: 820000,
    facilityLocation: "Gothenburg, Sweden"
  },
  {
    vendorName: "Solaria Solar Logistics & Cable",
    deliveryPerformance: 98.4,
    qualityDefectRate: 0.6,
    priceVariance: 0.0,
    stockCoverageDays: 65,
    leadTimeDays: 14,
    certificateDaysRemaining: 340,
    singleSource: "No",
    itemCategory: "Electrical & Cabling",
    suppliedItem: "UV-Resistant DC Wiring Harnesses",
    annualSpend: 540000,
    facilityLocation: "Valencia, Spain"
  },
  {
    vendorName: "Kyoto Advanced Ceramics K.K.",
    deliveryPerformance: 76.5,
    qualityDefectRate: 8.9,
    priceVariance: 5.1,
    stockCoverageDays: 20,
    leadTimeDays: 70,
    certificateDaysRemaining: 12,
    singleSource: "Yes",
    itemCategory: "Advanced Ceramics",
    suppliedItem: "Thermal Barrier Ceramic Substrates",
    annualSpend: 1950000,
    facilityLocation: "Kyoto, Japan"
  },
  {
    vendorName: "Atlas Fasteners & Hardware LLC",
    deliveryPerformance: 91.0,
    qualityDefectRate: 2.1,
    priceVariance: -1.0,
    stockCoverageDays: 52,
    leadTimeDays: 21,
    certificateDaysRemaining: 210,
    singleSource: "No",
    itemCategory: "Standard Hardware",
    suppliedItem: "Grade 8 Zinc-Coated Hex Bolts",
    annualSpend: 310000,
    facilityLocation: "Toronto, Canada"
  }
];
