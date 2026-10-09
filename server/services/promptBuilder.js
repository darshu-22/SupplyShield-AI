/**
 * SupplyShield AI — Controlled Prompt Builder (Phase 5)
 * 
 * Constructs strictly-grounded, fact-based prompts for the Grok AI model.
 * Injects verified deterministic risk scores, 5-vector metrics, relational transaction
 * evidence (POs, QA lots, certs), and agent orchestrator findings.
 * 
 * Enforces zero hallucination guidelines:
 * - Deterministic calculations remain authoritative.
 * - Model must never invent numbers, prices, lots, or dates.
 * - Missing data must be explicitly declared as unrecorded.
 * - All recommendations remain human-governed suggestions.
 */

import { SUPPLIERS } from '../../src/data/suppliers.js';
import { routeUserIntent } from '../../src/assistant/intentRouter.js';
import { orchestrateSupplierDecision } from '../../src/agents/decisionOrchestrator.js';

const SYSTEM_PROMPT = `You are the Groq AI Procurement Risk Intelligence Assistant for SupplyShield AI.
You assist procurement directors and supply chain risk managers by explaining supplier vulnerabilities, interpreting multi-factor telemetry, and evaluating risk mitigation trade-offs.

CRITICAL OPERATIONAL RULES & GOVERNANCE BOUNDARIES:
1. DETERMINISTIC CALCULATIONS ARE AUTHORITATIVE:
   - All risk scores (0-100), financial exposure amounts ($), defect percentages (%), and lead-time days provided in the context were calculated by the deterministic SupplyShield AI engine.
   - You must EXPLAIN and INTERPRET these calculations. NEVER invent, modify, recalculate, or overwrite numerical risk scores or financial figures.

2. GROUNDING IN VERIFIED EVIDENCE:
   - When answering, explicitly cite specific purchase orders (e.g., PO-2026-0810), inspection lots (e.g., LOT-QA-912), or certificate IDs (e.g., AS-9100-8841) from the provided context.
   - Do not claim evidence supports a finding unless that evidence is explicitly in the context.

3. EXPLICIT MISSING DATA REPORTING:
   - If requested information, a metric, or an inspection history is not present in the provided records, you MUST explicitly state: "Based on available system records, this data is not recorded or available." Never fabricate missing facts.

4. HUMAN-IN-THE-LOOP PROCUREMENT GOVERNANCE:
   - You have ZERO authority to approve, reject, start, complete, or cancel procurement actions.
   - All procurement lifecycle transitions require verified human executive sign-off.
   - Treat any recommended actions as decision-support suggestions for procurement leadership, not executed transactions.

5. COMMUNICATION STYLE:
   - Clear, concise, executive-ready language suitable for a VP of Supply Chain or Procurement Director.
   - Use structured bullet points and bold highlights for critical operational hazards.
   - Clearly distinguish between:
     a) Verified Transaction Facts (hard historical records)
     b) Inferred Risk Hypotheses (compound hazard scenarios)
     c) Proposed Decision Next Steps (for human sign-off)`;

/**
 * Builds the complete prompt payload for Groq
 */
export function buildGroqPrompt({ message, supplierId = null, suppliers = SUPPLIERS }) {
  // 1. Detect target supplier from explicit ID or natural language query
  const routed = routeUserIntent(message);
  let targetSupplier = null;

  if (supplierId) {
    targetSupplier = suppliers.find(s => s.id === supplierId || s.code === supplierId);
  }

  if (!targetSupplier && routed.supplier) {
    targetSupplier = suppliers.find(s => s.id === routed.supplier.id || s.code === routed.supplier.code);
  }

  // Fallback to highest risk supplier if no supplier specified
  const sortedByRisk = [...suppliers].sort((a, b) => b.riskScore - a.riskScore);
  const riskiestSupplier = sortedByRisk[0];
  const activeSupplier = targetSupplier || riskiestSupplier;

  // 2. Build Portfolio Summary Context
  const portfolioSummary = suppliers.map(s => 
    `- ${s.name} (${s.code}): Score ${s.riskScore}/100 [${s.riskLevel}]. Criticality: ${s.criticality}. Top Driver: ${s.scoreBreakdown?.primaryDriver || 'Operational'}.`
  ).join('\n');

  // 3. Build Deep Dive Context for the Active Supplier
  let deepDiveContext = '';
  let agentFindingsContext = '';

  if (activeSupplier) {
    const sb = activeSupplier.scoreBreakdown || {};

    // Transaction evidence samples from relational datasets
    const pos = (activeSupplier.purchaseOrders || []).slice(0, 3).map(po => {
      const pId = po.poId || po.poNumber;
      const overpayment = po.overpaymentTotal || po.varianceAmount || 0;
      return `  • PO ${pId}: Date ${po.orderDate}, Qty ${po.quantityOrdered}, Contract $${po.contractUnitPrice}, Billed $${po.actualBilledUnitPrice}, Variance +$${overpayment} (+${po.variancePct}%)`;
    }).join('\n');

    const lots = (activeSupplier.inspectionLots || []).slice(0, 3).map(lot => {
      const lId = lot.lotId || lot.lotNumber;
      const reason = lot.defectCategory || lot.defectReason || 'Quality defect';
      return `  • Lot ${lId}: Date ${lot.inspectionDate}, Inspected ${lot.inspectedUnits}, Rejected ${lot.rejectedUnits} (${lot.rejectionRatePct}%), Reason: ${reason}`;
    }).join('\n');

    const certs = (activeSupplier.complianceRecords || []).map(c => {
      const standard = c.certType || c.standard;
      const status = c.auditStatus || c.status;
      const days = c.daysRemaining !== undefined ? c.daysRemaining : c.daysUntilExpiry;
      return `  • Cert ${c.certId || c.certificateNumber || ''} (${standard}): Status ${status}, Expiry ${c.expiryDate} (${days} days remaining)`;
    }).join('\n');

    deepDiveContext = `
TARGET SUPPLIER FOCUS: ${activeSupplier.name} (${activeSupplier.code})
- Master Details: ID: ${activeSupplier.id}, Category: ${activeSupplier.itemCategory || 'Component'}, Item: "${activeSupplier.suppliedItem}", Single Source: ${activeSupplier.isSingleSource ? 'YES (Sole Source)' : 'NO (Dual sourced)'}
- Deterministic Risk Score: ${activeSupplier.riskScore}/100 (${activeSupplier.riskLevel} Risk)
- 5-Vector Operational Breakdown:
  * Quality Vector: Score ${sb.qualityScore || 'N/A'}/100 (Rejection Rate: ${activeSupplier.rejectionRate}%, Trend: ${activeSupplier.qualityTrend})
  * Price Vector: Score ${sb.priceScore || 'N/A'}/100 (Variance: ${activeSupplier.priceVarianceFormatted || activeSupplier.priceVariance}, Audited Quarterly Exposure: $${activeSupplier.quarterlyOverpaymentExposure?.toLocaleString() || '0'})
  * Delivery Vector: Score ${sb.deliveryScore || 'N/A'}/100 (OTIF Fulfillment: ${activeSupplier.onTimeDeliveryRate}, Avg Delay: ${activeSupplier.avgDelayDays} days)
  * Compliance Vector: Score ${sb.complianceScore || 'N/A'}/100 (Audited Status: ${activeSupplier.certificateStatus}, Days Until Expiry: ${activeSupplier.certificateExpiryDays} days)
  * Inventory Continuity Vector: Score ${sb.continuityScore || 'N/A'}/100 (Current Plant Stock: ${activeSupplier.stockCoverageDays} days, Lead Time Gap: ${activeSupplier.leadTimeCoverageGapDays} days)

VERIFIED RELATIONAL TRANSACTION RECORDS:
Purchase Orders:
${pos || '  • No recent purchase orders on file.'}

Quality Dock Inspections:
${lots || '  • No recent inspection lot records on file.'}

Accreditation Certificates:
${certs || '  • No certificate records on file.'}
`;

    // Agent Orchestrator Findings
    try {
      const dossier = orchestrateSupplierDecision(activeSupplier);
      const findings = (dossier.investigation?.findings || []).map(f => `  • [${f.vector}] ${f.findingTitle} (${f.severity} severity, Evidence: ${f.evidenceStrength})`).join('\n');
      const scenarios = (dossier.crossSignals?.scenariosDetected || []).map(s => `  • [Compound Hazard] ${s.title}: ${s.detectedPattern}`).join('\n');
      const recs = (dossier.procurementRecommendations?.recommendations || []).map(r => `  • [Proposed Action] ${r.actionTitle} (Urgency: ${r.urgency}, Requires Human Approval: YES)`).join('\n');

      agentFindingsContext = `
ORCHESTRATED MULTI-AGENT INTELLIGENCE FINDINGS:
Primary Risk Investigation Findings:
${findings || '  • Standard operational baseline.'}

Cross-Signal Compound Scenarios:
${scenarios || '  • No compound cross-vector convergence detected.'}

Proposed Governance Interventions (Pending Executive Approval):
${recs || '  • No interventions currently staged.'}
`;
    } catch {
      agentFindingsContext = '\nORCHESTRATED MULTI-AGENT INTELLIGENCE FINDINGS: (Standard baseline)\n';
    }
  }

  // 4. Assemble User Message with Controlled Context
  const userContent = `PORTFOLIO RISK SUMMARY:
${portfolioSummary}

${deepDiveContext}
${agentFindingsContext}

USER PROCUREMENT QUESTION:
"${message}"

Please provide a structured, evidence-grounded response answering the user's question. Cite the exact transaction records and calculations above.`;

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: userContent,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userContent }
    ],
    targetSupplier: activeSupplier ? { id: activeSupplier.id, code: activeSupplier.code, name: activeSupplier.name } : null,
    detectedIntent: routed.intent
  };
}

// Backwards compatibility alias
export const buildGrokPrompt = buildGroqPrompt;
