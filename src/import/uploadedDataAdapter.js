/**
 * SupplyShield AI — Uploaded Supplier Risk Adapter & Partial-Data Scoring Engine
 * 
 * Adapts validated canonical user records into full SupplyShield Supplier entities
 * with deterministic multi-vector scoring, partial-data uncertainty buffers,
 * observed facts, rule-based findings, and procurement action recommendations.
 */

import { RISK_WEIGHTS, RISK_THRESHOLDS } from '../engine/riskEngine.js';

/**
 * Partial-Data Multi-Vector Scoring Method
 * 
 * Computes deterministic scores for available vectors, normalizes weights,
 * and enforces the requirement that missing data NEVER artificially yields
 * a "LOW" risk score.
 */
export function scoreUploadedSupplier(canonical) {
  const breakdown = {
    quality: null,
    price: null,
    delivery: null,
    compliance: null,
    continuity: null
  };

  const availableWeights = {};
  const missingDimensions = [];
  const observedFacts = [];
  const ruleFindings = [];
  const missingDataNotes = [];
  const warningSigns = [];

  // 1. Quality Vector (Weight: 0.25)
  if (canonical.qualityDefectRate !== null && canonical.qualityDefectRate !== undefined) {
    const rate = canonical.qualityDefectRate;
    observedFacts.push(`Dock inspection rejection rate observed at ${rate}%.`);

    let qScore = 15;
    if (rate >= 8.0) {
      qScore = 95;
      ruleFindings.push(`Critical defect rate (${rate}% >= 8.0%): severely exceeds incoming dock acceptance thresholds.`);
      warningSigns.push(`Extreme dock defect rate (${rate}%) indicates unmitigated manufacturing instability.`);
    } else if (rate >= 5.0) {
      qScore = 80;
      ruleFindings.push(`High defect rate (${rate}% >= 5.0%): quality trend indicates process slippage.`);
      warningSigns.push(`Elevated rejection rate (${rate}%) exceeds contractual 3.0% threshold.`);
    } else if (rate >= 3.0) {
      qScore = 65;
      ruleFindings.push(`Moderate defect rate (${rate}% >= 3.0%): above baseline tolerance.`);
    } else if (rate >= 1.5) {
      qScore = 40;
      ruleFindings.push(`Acceptable defect rate (${rate}%): within normal operating range.`);
    } else {
      qScore = 15;
      ruleFindings.push(`Exemplary defect rate (${rate}% < 1.5%): top-tier quality compliance.`);
    }

    breakdown.quality = qScore;
    availableWeights.quality = RISK_WEIGHTS.QUALITY;
  } else {
    missingDimensions.push('Quality / Rejection Rate');
    missingDataNotes.push('Quality defect and dock inspection data not provided in dataset.');
  }

  // 2. Price Vector (Weight: 0.20)
  if (canonical.priceVariance !== null && canonical.priceVariance !== undefined) {
    const variance = canonical.priceVariance;
    observedFacts.push(`Contract price variance observed at ${variance > 0 ? `+${variance}%` : `${variance}%`}.`);

    let pScore = 10;
    if (variance >= 6.0) {
      pScore = 92;
      ruleFindings.push(`Severe contract price escalation (+${variance}% >= +6.0%): unapproved invoice surcharges detected.`);
      warningSigns.push(`Invoice prices exceed contract ceiling by +${variance}%, producing commercial budget leakage.`);
    } else if (variance >= 3.0) {
      pScore = 78;
      ruleFindings.push(`Significant price variance (+${variance}% >= +3.0%): exceeds agreed indexing caps.`);
      warningSigns.push(`Billed invoice rates exceed master contract pricing by +${variance}%.`);
    } else if (variance > 0.5) {
      pScore = 55;
      ruleFindings.push(`Mild price creep (+${variance}%): slightly above contracted unit baseline.`);
    } else if (variance > 0.0) {
      pScore = 30;
      ruleFindings.push(`Minor rounding variance (+${variance}%).`);
    } else {
      pScore = 10;
      ruleFindings.push(`Zero or favorable contract pricing variance (${variance}%): 100% contract compliance.`);
    }

    breakdown.price = pScore;
    availableWeights.price = RISK_WEIGHTS.PRICE;
  } else {
    missingDimensions.push('Contract Price Variance');
    missingDataNotes.push('Purchase order billing and contract unit prices not provided in dataset.');
  }

  // 3. Delivery Vector (Weight: 0.20)
  if (canonical.deliveryPerformance !== null && canonical.deliveryPerformance !== undefined) {
    const otif = canonical.deliveryPerformance;
    observedFacts.push(`On-Time In-Full (OTIF) fulfillment rate observed at ${otif}%.`);

    let dScore = 12;
    if (otif < 70) {
      dScore = 92;
      ruleFindings.push(`Severe delivery failure (${otif}% < 70%): critical chronic shipment slippage.`);
      warningSigns.push(`OTIF schedule reliability degraded to ${otif}%, threatening plant assembly schedules.`);
    } else if (otif < 80) {
      dScore = 78;
      ruleFindings.push(`High delivery unreliability (${otif}% < 80%): fails tier-1 SLA benchmark.`);
      warningSigns.push(`Delivery reliability (${otif}%) falls below required 85% SLA minimum.`);
    } else if (otif < 90) {
      dScore = 52;
      ruleFindings.push(`Moderate delivery delays (${otif}% < 90%): periodic logistical bottlenecks.`);
    } else if (otif < 95) {
      dScore = 30;
      ruleFindings.push(`Acceptable delivery fulfillment (${otif}%): minor logistical friction.`);
    } else {
      dScore = 12;
      ruleFindings.push(`Excellent delivery reliability (${otif}% >= 95%): dependable schedule performance.`);
    }

    breakdown.delivery = dScore;
    availableWeights.delivery = RISK_WEIGHTS.DELIVERY;
  } else {
    missingDimensions.push('Delivery Performance');
    missingDataNotes.push('Shipment delivery SLA and OTIF performance not provided in dataset.');
  }

  // 4. Compliance Vector (Weight: 0.15)
  if (canonical.certificateDaysRemaining !== null && canonical.certificateDaysRemaining !== undefined) {
    const days = canonical.certificateDaysRemaining;
    observedFacts.push(`Compliance certificate validity countdown: ${days} days remaining.`);

    let cScore = 15;
    if (days <= 10) {
      cScore = 95;
      ruleFindings.push(`Critical certification expiry cliff (${days}d <= 10d): regulatory dock shutdown imminent.`);
      warningSigns.push(`Mandatory quality accreditation expires in ${days} days with immediate operational stoppage risk.`);
    } else if (days <= 20) {
      cScore = 80;
      ruleFindings.push(`Emergency certification countdown (${days}d <= 20d): audit attestation urgently required.`);
      warningSigns.push(`Certification expires in ${days} days; recertification confirmation not yet attested.`);
    } else if (days <= 30) {
      cScore = 65;
      ruleFindings.push(`Expiring soon certificate status (${days}d <= 30d): within 30-day renewal window.`);
      warningSigns.push(`Accreditation certificate expires in ${days} days.`);
    } else if (days <= 60) {
      cScore = 40;
      ruleFindings.push(`Approaching recertification milestone (${days}d remaining).`);
    } else {
      cScore = 15;
      ruleFindings.push(`Active certified status (${days}d remaining): audit validity secured.`);
    }

    breakdown.compliance = cScore;
    availableWeights.compliance = RISK_WEIGHTS.COMPLIANCE;
  } else {
    missingDimensions.push('Compliance Certificate Status');
    missingDataNotes.push('Quality accreditation / ISO certificate expiry countdown not provided in dataset.');
  }

  // 5. Continuity Vector (Weight: 0.20)
  const hasStock = canonical.stockCoverageDays !== null && canonical.stockCoverageDays !== undefined;
  const hasLeadTime = canonical.leadTimeDays !== null && canonical.leadTimeDays !== undefined;
  const isSole = canonical.singleSource === true;

  if (hasStock || canonical.singleSource !== null) {
    const stockDays = hasStock ? canonical.stockCoverageDays : null;
    const leadTime = hasLeadTime ? canonical.leadTimeDays : null;
    const gap = (stockDays !== null && leadTime !== null) ? (stockDays - leadTime) : null;

    if (stockDays !== null) {
      observedFacts.push(`Factory stock coverage reserves observed at ${stockDays} days.`);
    }
    if (leadTime !== null) {
      observedFacts.push(`Replenishment turnaround lead time observed at ${leadTime} days.`);
    }
    if (canonical.singleSource !== null) {
      observedFacts.push(`Sourcing dependency: ${isSole ? 'Single-source dependency (sole supplier)' : 'Multi-sourced (alternative suppliers exist)'}.`);
    }

    let contScore = 20;
    if (stockDays !== null) {
      if (stockDays < 15) {
        contScore = isSole ? 98 : 88;
        ruleFindings.push(`Severe stockout hazard (${stockDays}d < 15d): buffer depleted${isSole ? ' on sole-source component' : ''}.`);
        warningSigns.push(`Critically low stock reserves (${stockDays}d) expose factory to assembly starvation.`);
      } else if (stockDays < 30) {
        contScore = isSole ? 88 : 74;
        ruleFindings.push(`Deficit buffer inventory (${stockDays}d < 30d)${isSole ? ' on sole source' : ''}.`);
        warningSigns.push(`Stock coverage (${stockDays}d) below target 30-day safety buffer.`);
      } else if (stockDays < 45) {
        contScore = isSole ? 65 : 45;
        ruleFindings.push(`Moderate stock coverage buffer (${stockDays}d).`);
      } else {
        contScore = isSole ? 35 : 15;
        ruleFindings.push(`Comfortable inventory buffer (${stockDays}d coverage).`);
      }
    } else {
      // Stock missing, but singleSource known
      contScore = isSole ? 65 : 25;
      ruleFindings.push(`Continuity evaluated from sole-source status only: ${isSole ? 'Single source exposure' : 'Multi-sourced'}.`);
    }

    if (gap !== null && gap < 0) {
      warningSigns.push(`Lead-time deficit gap of ${Math.abs(gap)} days: replenishment lead time (${leadTime}d) exceeds stock coverage (${stockDays}d).`);
    }

    breakdown.continuity = contScore;
    availableWeights.continuity = RISK_WEIGHTS.CONTINUITY;
  } else {
    missingDimensions.push('Inventory & Supply Continuity');
    missingDataNotes.push('Stock coverage days, lead time, and single-source dependency not provided in dataset.');
  }

  // Completeness Calculation
  const availableVectorCount = Object.keys(availableWeights).length;
  const completenessScore = Math.round((availableVectorCount / 5) * 100);
  const totalAvailableWeight = Object.values(availableWeights).reduce((a, b) => a + b, 0);

  let rawCalculatedScore = 20;
  if (totalAvailableWeight > 0) {
    let weightedSum = 0;
    Object.keys(availableWeights).forEach(key => {
      weightedSum += breakdown[key] * (availableWeights[key] / totalAvailableWeight);
    });
    rawCalculatedScore = Math.round(weightedSum);
  }

  // INCOMPLETE-DATA UNCERTAINTY RULE:
  // "Never assign a low-risk classification solely because data is missing."
  // If completeness is below 50% (< 3 vectors), we enforce a minimum score of 35 (MEDIUM risk),
  // ensuring that lack of data is never misinterpreted as "safe/low risk".
  let finalScore = rawCalculatedScore;
  let riskUncertaintyNotice = null;

  if (completenessScore < 50) {
    if (finalScore < 35) {
      finalScore = 35; // Clamp to Medium risk boundary
      riskUncertaintyNotice = `Risk score buffered to 35 (MEDIUM) due to high data incompleteness (${completenessScore}%). Missing data cannot be classified as LOW risk.`;
    } else {
      riskUncertaintyNotice = `High data incompleteness (${completenessScore}%). Observed risk elevated from available indicators.`;
    }
  }

  // Explicit Category Thresholds
  let riskLevel = "LOW";
  if (finalScore >= RISK_THRESHOLDS.CRITICAL) {
    riskLevel = "CRITICAL";
  } else if (finalScore >= RISK_THRESHOLDS.HIGH) {
    riskLevel = "HIGH";
  } else if (finalScore >= RISK_THRESHOLDS.MEDIUM) {
    riskLevel = "MEDIUM";
  } else {
    riskLevel = "LOW";
  }

  // Compound Cross-Signal Warnings
  const crossSignalWarnings = [];
  const rejection = canonical.qualityDefectRate;
  const stock = canonical.stockCoverageDays;
  const otif = canonical.deliveryPerformance;
  const variance = canonical.priceVariance;
  const certDays = canonical.certificateDaysRemaining;

  if (rejection >= 5.0 && isSole && stock !== null && stock <= 30) {
    crossSignalWarnings.push({
      scenario: 'COMPOUND_QUALITY_SOLE_SOURCE_STOCKOUT',
      severity: 'CRITICAL',
      title: 'Compounding Single-Source Quality & Factory Stockout Hazard',
      detectedPattern: `Rejection rate elevated to ${rejection}% while buffer inventory covers only ${stock} days against sole approved vendor.`,
      whyItMatters: 'Incoming defective parts deplete finished assembly buffers before reorders arrive. Immediate production stoppage hazard.'
    });
  }

  if (variance >= 3.0) {
    crossSignalWarnings.push({
      scenario: 'CONTRACT_PRICE_ESCALATION',
      severity: 'HIGH',
      title: 'Contract Price Escalation & Commercial Overbilling',
      detectedPattern: `Invoice unit prices exceed contract agreement rate by +${variance}%.`,
      whyItMatters: 'Unratified price surcharges erode gross operating margins across purchase orders.'
    });
  }

  if (certDays !== null && certDays <= 30 && isSole) {
    crossSignalWarnings.push({
      scenario: 'REGULATORY_COMPLIANCE_CLIFF',
      severity: 'CRITICAL',
      title: 'Regulatory Compliance Cliff on Single-Source Vendor',
      detectedPattern: `Mandatory quality certification expires in ${certDays} days with zero secondary approved sources.`,
      whyItMatters: 'Dock receiving policies mandate immediate delivery quarantine if certification lapses.'
    });
  }

  if (otif !== null && otif <= 75.0 && stock !== null && stock <= 25) {
    crossSignalWarnings.push({
      scenario: 'DELIVERY_LEADTIME_BUFFER_DEFICIT',
      severity: 'HIGH',
      title: 'Lead-Time Coverage Deficit Driven by Logistics Slippage',
      detectedPattern: `On-time delivery (OTIF) degraded to ${otif}%, opening inventory replenishment deficit.`,
      whyItMatters: 'Replenishment delays exhaust factory safety stock before next delivery arrives.'
    });
  }

  return {
    score: finalScore,
    rawScore: rawCalculatedScore,
    riskLevel,
    completenessScore,
    hasIncompleteData: missingDimensions.length > 0 || completenessScore < 100,
    missingDimensions,
    scoreBreakdown: breakdown,
    observedFacts,
    ruleFindings,
    missingDataNotes,
    warningSigns,
    crossSignalWarnings,
    riskUncertaintyNotice
  };
}

/**
 * Generate actionable procurement recommendations based on actual observed data
 */
export function generateUploadedRecommendations(supplierId, _supplierName, canonical, _scoreResult) {
  const actions = [];
  let actCounter = 1;

  // 1. Price Variance Action
  if (canonical.priceVariance !== null && canonical.priceVariance > 0) {
    actions.push({
      id: `ACT-${supplierId}-${actCounter++}`,
      title: `Dispute Contract Price Variance (+${canonical.priceVariance}%) & Withhold Surcharges`,
      type: 'Commercial',
      category: 'Commercial & Compliance',
      description: `Issue formal contract price dispute for unratified +${canonical.priceVariance}% invoice variance over master agreement rate.`,
      urgency: canonical.priceVariance >= 5.0 ? 'CRITICAL' : 'HIGH',
      status: 'Draft Ready',
      whyRecommended: `Observed invoice unit price variance of +${canonical.priceVariance}% exceeds agreed contract price ceilings.`
    });
  }

  // 2. Quality Defect Action
  if (canonical.qualityDefectRate !== null && canonical.qualityDefectRate >= 3.0) {
    actions.push({
      id: `ACT-${supplierId}-${actCounter++}`,
      title: `Mandate Dock Quality Containment & 8D Corrective Action (${canonical.qualityDefectRate}% Defects)`,
      type: 'Quality Assurance',
      category: 'Quality & Technical',
      description: `Impose mandatory 100% incoming dock inspection lot sorting and issue 8D Root Cause Corrective Action demand.`,
      urgency: canonical.qualityDefectRate >= 5.0 ? 'CRITICAL' : 'HIGH',
      status: 'Draft Ready',
      whyRecommended: `Observed incoming defect rate of ${canonical.qualityDefectRate}% exceeds the contractual 3.0% quality tolerance threshold.`
    });
  }

  // 3. Compliance Expiry Action
  if (canonical.certificateDaysRemaining !== null && canonical.certificateDaysRemaining <= 60) {
    actions.push({
      id: `ACT-${supplierId}-${actCounter++}`,
      title: `Demand Recertification Audit Attestation (${canonical.certificateDaysRemaining}d Remaining)`,
      type: 'Compliance',
      category: 'Regulatory & Audit',
      description: `Issue 48-hour cure notice requiring certified registrar audit confirmation letter before validity expires.`,
      urgency: canonical.certificateDaysRemaining <= 20 ? 'CRITICAL' : 'HIGH',
      status: 'Draft Ready',
      whyRecommended: `Mandatory quality accreditation expires in ${canonical.certificateDaysRemaining} days.`
    });
  }

  // 4. Logistics & Supply Continuity Action
  if (canonical.singleSource === true && (canonical.stockCoverageDays !== null && canonical.stockCoverageDays < 35)) {
    actions.push({
      id: `ACT-${supplierId}-${actCounter++}`,
      title: `Accelerate Secondary Dual-Source Standby Vendor Qualification`,
      type: 'Supply Continuity',
      category: 'Supply Chain Resiliency',
      description: `Fast-track secondary supplier tooling validation to mitigate single-source vulnerability (${canonical.stockCoverageDays}d stock).`,
      urgency: canonical.stockCoverageDays < 20 ? 'CRITICAL' : 'HIGH',
      status: 'Draft Ready',
      whyRecommended: `Component has sole-source exposure while inventory buffer is reduced to ${canonical.stockCoverageDays} days.`
    });
  } else if (canonical.deliveryPerformance !== null && canonical.deliveryPerformance < 80.0) {
    actions.push({
      id: `ACT-${supplierId}-${actCounter++}`,
      title: `Enforce Delivery SLA Recovery Plan (${canonical.deliveryPerformance}% OTIF)`,
      type: 'Logistics',
      category: 'Operations',
      description: `Mandate supplier-funded expedited freight and daily shipment dispatch tracking.`,
      urgency: 'HIGH',
      status: 'Draft Ready',
      whyRecommended: `Delivery fulfillment rate has slipped to ${canonical.deliveryPerformance}%, breaching SLA minimums.`
    });
  }

  // Fallback nominal action if performance is healthy
  if (actions.length === 0) {
    actions.push({
      id: `ACT-${supplierId}-${actCounter++}`,
      title: `Maintain Routine Performance Monitoring & Quarterly Review`,
      type: 'Governance',
      category: 'Operational Monitoring',
      description: `Operational metrics reflect contractual adherence. Maintain regular quarterly supplier review cycle.`,
      urgency: 'LOW',
      status: 'Routine',
      whyRecommended: `Observed metrics fall within acceptable contractual control limits.`
    });
  }

  return actions;
}

/**
 * Adapt an array of validated canonical records into complete Supplier entities
 */
export function adaptUploadedSuppliersToEntities(validatedRows = [], meta = {}) {
  const datasetTimestamp = meta.uploadedAt || new Date().toISOString();
  const sourceFileName = meta.fileName || 'Uploaded Dataset';

  return validatedRows.map((item, index) => {
    const canonical = item.canonical;
    const supplierId = `UPL-${String(index + 1).padStart(3, '0')}`;
    const vendorName = canonical.vendorName || `Vendor ${index + 1}`;
    
    // Score using partial-data deterministic engine
    const scoreResult = scoreUploadedSupplier(canonical);
    const recommendations = generateUploadedRecommendations(supplierId, vendorName, canonical, scoreResult);

    const isSole = canonical.singleSource === true;
    const stockDays = canonical.stockCoverageDays;
    const leadTime = canonical.leadTimeDays;
    const leadTimeGap = (stockDays !== null && leadTime !== null) ? (stockDays - leadTime) : null;

    // Build entity structure 100% compatible with existing UI & workflow
    return {
      id: supplierId,
      code: `Uploaded-${String(index + 1).padStart(2, '0')}`,
      name: vendorName,
      shortName: vendorName.length > 25 ? `${vendorName.substring(0, 22)}...` : vendorName,
      suppliedItem: canonical.suppliedItem || 'Uploaded Component',
      itemCategory: canonical.itemCategory || 'General Supply',
      criticality: isSole ? 'Critical Single-Source' : (canonical.singleSource === false ? 'Multi-Sourced' : 'Standard'),
      facilityLocation: canonical.facilityLocation || 'Vendor Facility',
      annualSpend: canonical.annualSpend || null,
      contractValue: canonical.annualSpend ? `$${(canonical.annualSpend / 1000).toFixed(0)}K / yr` : 'Not specified',
      qualityAuditScore: canonical.qualityDefectRate !== null ? Math.max(0, Math.round(100 - (canonical.qualityDefectRate * 5))) : null,
      leadTimeWeeks: leadTime ? Math.round(leadTime / 7) : null,
      leadTimeDays: leadTime,

      // Calculated Risk Matrices
      riskScore: scoreResult.score,
      riskLevel: scoreResult.riskLevel,
      riskTrend: scoreResult.score >= 60 ? 'worsening' : 'stable',
      scoreBreakdown: scoreResult.scoreBreakdown,
      dataCompletenessScore: scoreResult.completenessScore,
      hasIncompleteData: scoreResult.hasIncompleteData,
      missingDimensions: scoreResult.missingDimensions,
      riskUncertaintyNotice: scoreResult.riskUncertaintyNotice,

      // Metric Fields
      qualityTrend: canonical.qualityDefectRate !== null ? `${canonical.qualityDefectRate}% Defect Rate` : 'Data Not Provided',
      rejectionRate: canonical.qualityDefectRate,
      baselineRejectionRate: canonical.qualityDefectRate,

      priceVariance: canonical.priceVariance,
      priceVarianceFormatted: canonical.priceVariance != null 
        ? (canonical.priceVariance > 0 ? `+${canonical.priceVariance}%` : `${canonical.priceVariance}%`)
        : 'Not Provided',
      quarterlyOverpaymentExposure: (canonical.priceVariance && canonical.annualSpend && canonical.priceVariance > 0)
        ? Math.round((canonical.annualSpend / 4) * (canonical.priceVariance / 100))
        : 0,

      certificateStatus: canonical.certificateDaysRemaining != null
        ? (canonical.certificateDaysRemaining <= 30 ? 'Expiring Soon' : 'Valid')
        : 'Not Provided',
      certificateType: 'Standard Quality Accreditation',
      certificateExpiryDays: canonical.certificateDaysRemaining,
      auditScheduled: false,

      stockCoverageDays: stockDays,
      leadTimeCoverageGapDays: leadTimeGap,
      stockStatus: stockDays != null 
        ? (stockDays < 20 ? `Severe Deficit (${stockDays}d coverage)` : stockDays < 35 ? `Deficit Buffer (${stockDays}d coverage)` : `Optimal Buffer (${stockDays}d coverage)`)
        : 'Not Provided',

      onTimeDeliveryRate: canonical.deliveryPerformance,
      avgDelayDays: (canonical.deliveryPerformance != null && canonical.deliveryPerformance < 90) ? Math.round((100 - canonical.deliveryPerformance) / 5) : 0,
      lateShipmentCount: (canonical.deliveryPerformance != null && canonical.deliveryPerformance < 100) ? Math.round((100 - canonical.deliveryPerformance) / 10) : 0,

      isSingleSource: isSole,
      warningSigns: scoreResult.warningSigns,
      crossSignalWarnings: scoreResult.crossSignalWarnings,

      // Source Provenance
      isUploaded: true,
      sourceDataset: 'Uploaded Dataset',
      sourceFileName,
      analyzedAt: datasetTimestamp,

      // Explanations & Evidence
      observedFacts: scoreResult.observedFacts,
      ruleFindings: scoreResult.ruleFindings,
      missingDataNotes: scoreResult.missingDataNotes,

      // Preliminary Diagnostic Summary
      preliminarySummary: {
        urgency: scoreResult.score >= 80 ? 'Immediate Action Required (<48 Hours)' : scoreResult.score >= 60 ? 'High Priority (<72 Hours)' : 'Routine Monitoring',
        primaryRiskDriver: scoreResult.warningSigns[0] || (scoreResult.hasIncompleteData ? 'Incomplete operational data provided; risk evaluated under uncertainty buffer.' : 'Deterministic monitoring shows parameters within control limits.'),
        financialImpactDescription: canonical.priceVariance != null && canonical.priceVariance > 0
          ? `Observed +${canonical.priceVariance}% contract unit pricing variance across invoice schedules.`
          : 'Zero unauthorized contract price deviations detected.',
        recommendedActions: recommendations
      }
    };
  });
}
