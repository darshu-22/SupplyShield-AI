/**
 * SupplyShield AI — Intent Router (Phase 4 & Import Upgrade)
 * 
 * Classifies natural language queries from procurement managers into structured intents,
 * extracts supplier entities (demo or uploaded), metrics, and what-if simulation parameters.
 * Deterministic and local with zero remote API dependencies.
 */

// Known supplier aliases mapping to demo supplier IDs
export const SUPPLIER_ALIASES = [
  {
    id: "SUP-001",
    code: "Supplier A",
    names: ["supplier a", "apex", "apex precision", "apex castings", "castings", "sup-001", "sup 001", "item-cast-4140"]
  },
  {
    id: "SUP-002",
    code: "Supplier B",
    names: ["supplier b", "vanguard", "vanguard microelectronics", "microcontrollers", "chips", "sup-002", "sup 002", "item-mcu-canbus"]
  },
  {
    id: "SUP-003",
    code: "Supplier C",
    names: ["supplier c", "hydrotech", "hydrotech fluid", "fluid systems", "seals", "o-rings", "sup-003", "sup 003", "item-seal-fkm"]
  },
  {
    id: "SUP-004",
    code: "Supplier D",
    names: ["supplier d", "biopac", "biopac packaging", "packaging", "cartons", "sup-004", "sup 004", "item-pack-corr"]
  },
  {
    id: "SUP-005",
    code: "Supplier E",
    names: ["supplier e", "rotary", "rotary bearings", "precision bearings", "bearings", "sup-005", "sup 005", "item-brg-6000"]
  },
  {
    id: "SUP-006",
    code: "Supplier F",
    names: ["supplier f", "kinetic", "kinetic dynamics", "motor works", "motors", "sup-006", "sup 006", "item-mtr-bldc"]
  }
];

/**
 * Extracts supplier entity from query text, supporting both demo aliases
 * and dynamically provided active suppliers (including uploaded dataset).
 */
export function extractSupplierFromQuery(query = "", suppliers = []) {
  if (!query) return null;
  const normalized = query.toLowerCase();

  // 1. Check dynamically passed active suppliers first
  if (Array.isArray(suppliers) && suppliers.length > 0) {
    // Check ordinal phrases e.g. "vendor 1", "vendor 2", "vendor 3"
    const vendorIndexMatch = normalized.match(/(?:vendor|supplier|uploaded)\s*#?\s*(\d+)/i);
    if (vendorIndexMatch) {
      const idx = parseInt(vendorIndexMatch[1], 10) - 1;
      if (idx >= 0 && idx < suppliers.length) {
        return {
          id: suppliers[idx].id,
          code: suppliers[idx].code,
          name: suppliers[idx].name
        };
      }
    }

    // Check letter phrases e.g. "vendor a", "supplier b"
    const vendorLetterMatch = normalized.match(/(?:vendor|supplier)\s+([a-f])\b/i);
    if (vendorLetterMatch) {
      const charCode = vendorLetterMatch[1].toUpperCase().charCodeAt(0) - 65; // A=0, B=1...
      if (charCode >= 0 && charCode < suppliers.length) {
        return {
          id: suppliers[charCode].id,
          code: suppliers[charCode].code,
          name: suppliers[charCode].name
        };
      }
    }

    // Check supplier name, code, ID direct matches
    for (const s of suppliers) {
      const sId = (s.id || '').toLowerCase();
      const sCode = (s.code || '').toLowerCase();
      const sName = (s.name || '').toLowerCase();
      const sShort = (s.shortName || '').toLowerCase();

      if (
        (sId && normalized.includes(sId)) ||
        (sCode && normalized.includes(sCode)) ||
        (sName && normalized.includes(sName)) ||
        (sShort && normalized.includes(sShort))
      ) {
        return {
          id: s.id,
          code: s.code,
          name: s.name
        };
      }

      // Check key distinctive word tokens from supplier name (>= 5 chars)
      const GENERIC_STOP_WORDS = new Set([
        'vendor', 'supplier', 'uploaded', 'company', 'corp', 'corporation',
        'limited', 'ltd', 'inc', 'incorporated', 'llc', 'systems', 'group', 'services'
      ]);
      const words = sName.split(/[\s,.-]+/).filter(w => w.length >= 5 && !GENERIC_STOP_WORDS.has(w));
      for (const w of words) {
        const wordRegex = new RegExp(`\\b${w}\\b`, 'i');
        if (wordRegex.test(normalized)) {
          return {
            id: s.id,
            code: s.code,
            name: s.name
          };
        }
      }
    }
  }

  // 2. Check canonical demo aliases
  for (const entry of SUPPLIER_ALIASES) {
    for (const alias of entry.names) {
      const regex = new RegExp(`\\b${alias}\\b`, 'i');
      if (regex.test(normalized) || normalized.includes(alias)) {
        return {
          id: entry.id,
          code: entry.code
        };
      }
    }
  }

  return null;
}

/**
 * Extracts multiple suppliers for comparison queries
 */
export function extractSuppliersForComparison(query = "", suppliers = []) {
  if (!query || !Array.isArray(suppliers) || suppliers.length === 0) {
    return { supplierA: null, supplierB: null };
  }
  const normalized = query.toLowerCase();

  // Look for patterns like "vendor 1 and vendor 3" or "vendor 1 vs vendor 2"
  const matches = [...normalized.matchAll(/(?:vendor|supplier|uploaded)\s*#?\s*(\d+|[a-f])/gi)];
  if (matches.length >= 2) {
    const parseIndex = (token) => {
      if (/^\d+$/.test(token)) {
        return parseInt(token, 10) - 1;
      }
      return token.toUpperCase().charCodeAt(0) - 65;
    };

    const idxA = parseIndex(matches[0][1]);
    const idxB = parseIndex(matches[1][1]);

    const suppA = (idxA >= 0 && idxA < suppliers.length) ? suppliers[idxA] : null;
    const suppB = (idxB >= 0 && idxB < suppliers.length) ? suppliers[idxB] : null;

    if (suppA && suppB) {
      return { supplierA: suppA, supplierB: suppB };
    }
  }

  // Fallback: take first two suppliers in the active list
  return {
    supplierA: suppliers[0] || null,
    supplierB: suppliers[1] || null
  };
}

/**
 * Extracts number and unit parameters for What-If scenarios
 */
export function extractScenarioParameters(query = "") {
  const normalized = query.toLowerCase();
  
  const pctMatch = normalized.match(/([+-]?\d+(?:\.\d+)?)\s*%/);
  let pctDelta = pctMatch ? parseFloat(pctMatch[1]) : null;
  if (pctDelta !== null && (normalized.includes("reduce") || normalized.includes("cut") || normalized.includes("lower")) && !pctMatch[0].startsWith("-")) {
    pctDelta = -Math.abs(pctDelta);
  }

  const dayMatch = normalized.match(/([+-]?\d+)\s*(?:day|days|d\b)/);
  const dayDelta = dayMatch ? parseInt(dayMatch[1], 10) : null;

  const hasDualSource = normalized.includes("dual source") || normalized.includes("secondary source") || normalized.includes("dual-source");
  const hasPriceResolve = normalized.includes("resolve price") || normalized.includes("eliminate overpayment") || normalized.includes("enforce contract price");
  const hasCertRenew = normalized.includes("renew") || normalized.includes("recertif") || normalized.includes("extend certificate");

  return {
    pctDelta,
    dayDelta,
    rejectionRateDeltaPct: pctDelta,
    stockCoverageDeltaDays: dayDelta,
    hasDualSource,
    hasPriceResolve,
    hasCertRenew
  };
}

/**
 * Classifies query intent
 */
export function routeUserIntent(query = "", suppliers = []) {
  if (!query || typeof query !== "string") {
    return { intent: "UNKNOWN", supplier: null, confidence: 0 };
  }

  const text = query.trim().toLowerCase();
  const supplier = extractSupplierFromQuery(text, suppliers);
  const scenarioParams = extractScenarioParameters(text);

  // 1. General Greetings & Help
  if (/^(hi|hello|hey|help|who are you|what can you do|good morning|good afternoon)/.test(text)) {
    return {
      intent: "GENERAL_HELP",
      supplier: null,
      confidence: 0.95
    };
  }

  // 2. What-If Scenarios (e.g., "What happens if we increase safety stock by 30 days?")
  if (
    text.includes("what if") || 
    text.includes("what happens if") || 
    text.includes("simulate") || 
    text.includes("hypothetical") ||
    text.includes("if we increase") ||
    text.includes("if we reduce") ||
    text.includes("if we add")
  ) {
    return {
      intent: "WHAT_IF_SCENARIO",
      supplier,
      scenarioParams,
      confidence: 0.95
    };
  }

  // 3. Comparison Queries (e.g., "Compare the delivery and quality performance of Vendor 1 and Vendor 3")
  if (text.includes("compare") || text.includes("versus") || text.includes(" vs ") || text.includes(" vs. ")) {
    const { supplierA, supplierB } = extractSuppliersForComparison(text, suppliers);
    return {
      intent: "COMPARE_SUPPLIERS",
      supplier,
      supplierA,
      supplierB,
      confidence: 0.95
    };
  }

  // 4. Missing Data Queries (e.g., "What data is missing for Vendor 2?")
  if (
    text.includes("missing") || 
    text.includes("what data is missing") || 
    text.includes("incomplete") || 
    text.includes("unrecorded") ||
    text.includes("missing fields")
  ) {
    return {
      intent: "MISSING_DATA",
      supplier,
      confidence: 0.95
    };
  }

  // 5. Next 30 Days / Urgent Timeframe (e.g., "Which suppliers need attention in the next 30 days?")
  if (
    text.includes("next 30 days") || 
    text.includes("in the next 30 days") || 
    text.includes("within 30 days") || 
    text.includes("in 30 days") || 
    text.includes("next month")
  ) {
    return {
      intent: "NEXT_30_DAYS",
      supplier: null,
      confidence: 0.95
    };
  }

  // 6. First Priority Action (e.g., "What should procurement do first?")
  if (
    text.includes("do first") || 
    text.includes("procurement do first") || 
    text.includes("first action") || 
    text.includes("priority action") ||
    text.includes("what to do first") ||
    text.includes("start with")
  ) {
    return {
      intent: "PRIORITY_ACTION",
      supplier,
      confidence: 0.95
    };
  }

  // 7. Recommended Actions & Next Steps
  if (
    text.includes("action") || 
    text.includes("recommend") || 
    text.includes("what should we do") || 
    text.includes("what should procurement") ||
    text.includes("investigate first") ||
    text.includes("interven") ||
    text.includes("top actions")
  ) {
    return {
      intent: "RECOMMENDED_ACTIONS",
      supplier,
      confidence: 0.90
    };
  }

  // 8. Cross-Signal & Compound Risks
  if (
    text.includes("cross signal") || 
    text.includes("cross-signal") || 
    text.includes("compound") || 
    text.includes("multiple risk") ||
    text.includes("converging") ||
    text.includes("scenario a") ||
    text.includes("scenario b") ||
    text.includes("scenario c") ||
    text.includes("scenario d")
  ) {
    return {
      intent: "CROSS_SIGNAL_EXPLANATION",
      supplier,
      confidence: 0.90
    };
  }

  // 9. Supplier Risk Ranking / "Which supplier is riskiest?" (Prioritized before metric-specific keywords)
  if (
    text.includes("riskiest") || 
    text.includes("highest risk") || 
    text.includes("highest calculated risk") ||
    text.includes("rank") || 
    text.includes("worst") || 
    text.includes("most dangerous") ||
    text.includes("all suppliers") ||
    text.includes("watchlist")
  ) {
    return {
      intent: "RISK_RANKING",
      supplier: null,
      confidence: 0.92
    };
  }

  // 10. Price Variance & Overpayment
  if (
    text.includes("price") || 
    text.includes("variance") || 
    text.includes("overpay") || 
    text.includes("markup") || 
    text.includes("cost") || 
    text.includes("invoice") || 
    text.includes("surcharge") ||
    text.includes("spend leakage")
  ) {
    return {
      intent: "PRICE_VARIANCE",
      supplier,
      confidence: 0.88
    };
  }

  // 10. Quality Defects & Inspection Lots
  if (
    text.includes("quality") || 
    text.includes("defect") || 
    text.includes("reject") || 
    text.includes("scrap") || 
    text.includes("inspection") || 
    text.includes("dock") || 
    text.includes("lot")
  ) {
    if (!supplier && text.includes("rejection rate")) {
      return {
        intent: "AMBIGUOUS_CLARIFICATION",
        ambiguityType: "MISSING_SUPPLIER_FOR_METRIC",
        metricRequested: "Quality Rejection Rate",
        supplier: null,
        confidence: 0.85
      };
    }

    return {
      intent: "QUALITY_INSPECTION",
      supplier,
      confidence: 0.88
    };
  }

  // 12. Delivery & OTIF Performance
  if (
    text.includes("delivery") || 
    text.includes("otif") || 
    /\blate\b/i.test(text) || 
    text.includes("delay") || 
    text.includes("transit") || 
    text.includes("shipment") ||
    text.includes("on-time")
  ) {
    return {
      intent: "DELIVERY_PERFORMANCE",
      supplier,
      confidence: 0.88
    };
  }

  // 13. Compliance & Certificate Expiry
  if (
    text.includes("compliance") || 
    text.includes("certificate") || 
    text.includes("expiry") || 
    text.includes("expire") || 
    text.includes("as9100") || 
    /\biso\b/i.test(text) || 
    text.includes("iatf") || 
    text.includes("audit") ||
    text.includes("accredit")
  ) {
    return {
      intent: "COMPLIANCE_EXPIRY",
      supplier,
      confidence: 0.88
    };
  }

  // 14. Inventory Coverage & Lead Time Deficit
  if (
    text.includes("inventory") || 
    text.includes("stock") || 
    text.includes("coverage") || 
    text.includes("lead time") || 
    text.includes("lead-time") || 
    /\bgap\b/i.test(text) || 
    text.includes("stockout") ||
    text.includes("buffer")
  ) {
    return {
      intent: "INVENTORY_COVERAGE",
      supplier,
      confidence: 0.88
    };
  }

  // 15. Evidence for specific supplier or general evidence query
  if (text.includes("evidence") || text.includes("proof") || text.includes("supporting record")) {
    return {
      intent: "SUPPLIER_EXPLANATION",
      supplier: supplier || (suppliers[0] ? { id: suppliers[0].id, code: suppliers[0].code } : { id: "SUP-001", code: "Supplier A" }),
      focusOnEvidence: true,
      confidence: 0.90
    };
  }

  // 16. Specific Supplier Explanation
  if (supplier) {
    return {
      intent: "SUPPLIER_EXPLANATION",
      supplier,
      confidence: 0.85
    };
  }

  // 17. Ambiguous / Unknown Fallback
  return {
    intent: "AMBIGUOUS_CLARIFICATION",
    ambiguityType: "GENERAL_UNRECOGNIZED",
    supplier: null,
    confidence: 0.40
  };
}
