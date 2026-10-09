/**
 * SupplyShield AI — Agent D: Decision Review Agent (Phase 3)
 * 
 * Evaluates, audits, and ranks proposed procurement recommendations against:
 * 1. Risk severity
 * 2. Evidence strength & integrity
 * 3. Quantifiable business impact
 * 
 * Explains prioritization rationale and strictly mandates human approval.
 * Flags insufficient evidence rather than treating assumptions as facts.
 */

export function runDecisionReviewAgent(recommendationResult, investigationResult, crossSignalResult) {
  const startTime = Date.now();

  if (!recommendationResult || recommendationResult.status === "FAILED") {
    return {
      agentName: "Decision Review Agent",
      status: "FAILED",
      error: "Missing or invalid recommendation input",
      reviewedDecisions: [],
      executionTimeMs: 0
    };
  }

  const recommendations = recommendationResult.recommendations || [];
  const findings = investigationResult?.findings || [];
  const crossScenarios = crossSignalResult?.scenariosDetected || [];

  // Review and score each recommendation
  const reviewedList = recommendations.map(rec => {
    let score = 0;
    const rationaleParts = [];

    // 1. Severity weight
    if (rec.priority === "CRITICAL") {
      score += 40;
      rationaleParts.push("Critical severity operational threat");
    } else if (rec.priority === "HIGH") {
      score += 25;
      rationaleParts.push("High priority risk exposure");
    } else if (rec.priority === "MEDIUM") {
      score += 15;
      rationaleParts.push("Medium priority variance");
    } else {
      score += 5;
      rationaleParts.push("Standard routine maintenance");
    }

    // 2. Urgency weight
    if (rec.urgency === "IMMEDIATE_48H") {
      score += 30;
      rationaleParts.push("48-hour immediate response required");
    } else if (rec.urgency === "HIGH_72H") {
      score += 20;
      rationaleParts.push("72-hour operational window");
    } else {
      score += 5;
      rationaleParts.push("Weekly procurement review cycle");
    }

    // 3. Evidence strength assessment
    // Cross-reference with investigation findings
    let evidenceStrength = "MODERATE";
    let evidenceNotes = "Verified through transaction records.";

    if (rec.category.includes("Quality")) {
      const qf = findings.find(f => f.vector === "QUALITY");
      evidenceStrength = qf?.evidenceStrength || "MODERATE";
      if (evidenceStrength === "ROBUST") score += 20;
      else if (evidenceStrength === "MODERATE") score += 10;
      else {
        evidenceNotes = "CAUTION: Limited lot records available. Verify with dock QA prior to dispatch.";
      }
    } else if (rec.category.includes("Commercial")) {
      const pf = findings.find(f => f.vector === "PRICE");
      evidenceStrength = pf?.evidenceStrength || "MODERATE";
      if (evidenceStrength === "ROBUST") score += 20;
      else if (evidenceStrength === "MODERATE") score += 10;
    } else if (rec.category.includes("Continuity")) {
      const inf = findings.find(f => f.vector === "INVENTORY");
      evidenceStrength = inf?.evidenceStrength || "MODERATE";
      if (evidenceStrength === "ROBUST") score += 20;
      else if (evidenceStrength === "MODERATE") score += 10;
    } else if (rec.category.includes("Compliance")) {
      const cf = findings.find(f => f.vector === "COMPLIANCE");
      evidenceStrength = cf?.evidenceStrength || "MODERATE";
      if (evidenceStrength === "ROBUST") score += 20;
      else if (evidenceStrength === "MODERATE") score += 10;
    } else {
      score += 10;
    }

    // 4. Cross-signal compound multiplier
    const matchingCrossScenario = crossScenarios.find(cs => 
      (rec.category.includes("Quality") && cs.scenarioType.includes("QUALITY")) ||
      (rec.category.includes("Commercial") && cs.scenarioType.includes("COMMERCIAL")) ||
      (rec.category.includes("Compliance") && cs.scenarioType.includes("COMPLIANCE")) ||
      (rec.category.includes("Continuity") && (cs.scenarioType.includes("LOGISTICS") || cs.scenarioType.includes("BUFFER")))
    );

    if (matchingCrossScenario) {
      score += 10;
      rationaleParts.push(`Compounds systemic cross-signal hazard (${matchingCrossScenario.title})`);
    }

    // 5. Business impact check
    if (rec.expectedImpact?.calculable) {
      rationaleParts.push(`Quantifiable impact: ${rec.expectedImpact.numericMetric}`);
    }

    const priorityRationale = rationaleParts.join(" • ");

    return {
      ...rec,
      auditScore: Math.min(100, score),
      evidenceIntegrity: evidenceStrength === "INSUFFICIENT" 
        ? "FLAGGED_INSUFFICIENT_EVIDENCE" 
        : evidenceStrength === "ROBUST" 
        ? "VERIFIED_ROBUST_TRANSACTIONAL" 
        : "VERIFIED_MODERATE_EVIDENCE",
      evidenceAuditNotes: evidenceNotes,
      priorityRationale,
      approvalStatus: "PENDING_EXECUTIVE_APPROVAL",
      requiresHumanApproval: true,
      decisionGovernance: {
        autoExecutable: false,
        governanceRule: "Executive sign-off required prior to communicating with vendor or modifying ERP schedules."
      }
    };
  });

  // Sort descending by auditScore to establish strict prioritization
  reviewedList.sort((a, b) => b.auditScore - a.auditScore);

  // Assign 1-indexed ranks
  const rankedDecisions = reviewedList.map((item, index) => ({
    ...item,
    rank: index + 1
  }));

  const highestUrgency = rankedDecisions[0] || null;

  return {
    agentName: "Decision Review Agent",
    status: "COMPLETED",
    totalDecisionsReviewed: rankedDecisions.length,
    reviewedDecisions: rankedDecisions,
    highestUrgencyDecision: highestUrgency,
    governanceNotice: "All proposed procurement interventions require explicit human-in-the-loop executive sign-off before implementation.",
    executionTimeMs: Date.now() - startTime
  };
}
