/**
 * SupplyShield AI — Intent Router (Phase 4)
 * 
 * Classifies natural language queries from procurement managers into structured intents,
 * extracts supplier entities, metrics, and what-if simulation parameters.
 * Deterministic and local with zero remote API dependencies.
 */

// Known supplier aliases mapping to supplier IDs
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
 * Extracts supplier entity from query text
 */
export function extractSupplierFromQuery(query = "") {
  const normalized = query.toLowerCase();

  for (const entry of SUPPLIER_ALIASES) {
    for (const alias of entry.names) {
      // Check word boundaries or exact containment
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
 * Extracts number and unit parameters for What-If scenarios
 */
export function extractScenarioParameters(query = "") {
  const normalized = query.toLowerCase();
  
  // Look for percentage changes (e.g., "reduce by 3%", "cut defect rate by 2%")
  const pctMatch = normalized.match(/([+-]?\d+(?:\.\d+)?)\s*%/);
  let pctDelta = pctMatch ? parseFloat(pctMatch[1]) : null;
  if (pctDelta !== null && (normalized.includes("reduce") || normalized.includes("cut") || normalized.includes("lower")) && !pctMatch[0].startsWith("-")) {
    pctDelta = -Math.abs(pctDelta);
  }

  // Look for day changes (e.g., "increase stock by 30 days", "30 days buffer", "add 15 days")
  const dayMatch = normalized.match(/([+-]?\d+)\s*(?:day|days|d\b)/);
  const dayDelta = dayMatch ? parseInt(dayMatch[1], 10) : null;

  // Dual source mention
  const hasDualSource = normalized.includes("dual source") || normalized.includes("secondary source") || normalized.includes("dual-source");

  // Price resolution mention
  const hasPriceResolve = normalized.includes("resolve price") || normalized.includes("eliminate overpayment") || normalized.includes("enforce contract price");

  // Certificate renewal mention
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
export function routeUserIntent(query = "") {
  if (!query || typeof query !== "string") {
    return { intent: "UNKNOWN", supplier: null, confidence: 0 };
  }

  const text = query.trim().toLowerCase();
  const supplier = extractSupplierFromQuery(text);
  const scenarioParams = extractScenarioParameters(text);

  // 1. General Greetings & Help
  if (/^(hi|hello|hey|help|who are you|what can you do|good morning|good afternoon)/.test(text)) {
    return {
      intent: "GENERAL_HELP",
      supplier: null,
      confidence: 0.95
    };
  }

  // 2. What-If Scenarios
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

  // 3. Recommended Actions & Next Steps
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

  // 4. Cross-Signal & Compound Risks
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

  // 5. Price Variance & Overpayment
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

  // 6. Quality Defects & Inspection Lots
  if (
    text.includes("quality") || 
    text.includes("defect") || 
    text.includes("reject") || 
    text.includes("scrap") || 
    text.includes("inspection") || 
    text.includes("dock") || 
    text.includes("lot")
  ) {
    // If user asks "what is the rejection rate" without supplier, flag as ambiguous
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

  // 7. Delivery & OTIF Performance
  if (
    text.includes("delivery") || 
    text.includes("otif") || 
    text.includes("late") || 
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

  // 8. Compliance & Certificate Expiry
  if (
    text.includes("compliance") || 
    text.includes("certificate") || 
    text.includes("expiry") || 
    text.includes("expire") || 
    text.includes("as9100") || 
    text.includes("iso") || 
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

  // 9. Inventory Coverage & Lead Time Deficit
  if (
    text.includes("inventory") || 
    text.includes("stock") || 
    text.includes("coverage") || 
    text.includes("lead time") || 
    text.includes("lead-time") || 
    text.includes("gap") || 
    text.includes("stockout") ||
    text.includes("buffer")
  ) {
    return {
      intent: "INVENTORY_COVERAGE",
      supplier,
      confidence: 0.88
    };
  }

  // 10. Supplier Risk Ranking / "Which supplier is riskiest?"
  if (
    text.includes("riskiest") || 
    text.includes("highest risk") || 
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

  // 11. Evidence for specific supplier or general evidence query
  if (text.includes("evidence") || text.includes("proof") || text.includes("supporting record")) {
    if (supplier) {
      return {
        intent: "SUPPLIER_EXPLANATION",
        supplier,
        focusOnEvidence: true,
        confidence: 0.90
      };
    } else {
      // General question like "What evidence supports the highest-risk supplier's score?"
      return {
        intent: "SUPPLIER_EXPLANATION",
        supplier: { id: "SUP-001", code: "Supplier A" }, // Highest risk default
        focusOnEvidence: true,
        confidence: 0.90
      };
    }
  }

  // 12. Specific Supplier Explanation
  if (supplier) {
    return {
      intent: "SUPPLIER_EXPLANATION",
      supplier,
      confidence: 0.85
    };
  }

  // 13. Ambiguous / Unknown Fallback
  return {
    intent: "AMBIGUOUS_CLARIFICATION",
    ambiguityType: "GENERAL_UNRECOGNIZED",
    supplier: null,
    confidence: 0.40
  };
}
