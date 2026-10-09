/**
 * SupplyShield AI — Persistence Service (Phase 6)
 *
 * Manages reliable browser-local storage for procurement action records
 * and append-only audit events with strict validation, schema normalization,
 * and recovery from missing or corrupted states.
 */

import { ACTION_STATUS, normalizeActionStatus, DEFAULT_REVIEWER } from './actionLifecycleService.js';
import { AUDIT_EVENT_TYPE } from './auditService.js';

export const STORAGE_KEYS = {
  ACTIONS: 'supplyshield_actions_v1',
  AUDIT_LOG: 'supplyshield_audit_v1',
  REVIEWER: 'supplyshield_reviewer_v1'
};

/**
 * Checks if window.localStorage is available
 */
function isStorageAvailable() {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

/**
 * Generates initial demo seeds covering multiple lifecycle states
 */
export function createInitialSeedActionsAndAudit() {
  const baseTime = new Date('2026-10-09T08:00:00Z').getTime();

  const seedActions = [
    {
      id: 'ACT-2026-001',
      supplierId: 'SUP-001',
      supplierCode: 'Supplier A',
      supplierName: 'Apex Precision Castings',
      actionTitle: 'Issue Immediate Contract Price Dispute (+7.4%) & Hold Surcharges',
      category: 'Commercial & Compliance',
      urgency: 'CRITICAL',
      priority: 'CRITICAL',
      financialValue: '$74,000 / qtr',
      evidenceSummary: 'PO-2026-0810, 0922, 1004 billed at $1,342.50 vs agreed cap $1,250.00; AS9100 expires in 10 days; sole source.',
      draftDetails: 'Formal legal and procurement notice referencing Master Agreement Section 9.2 (Price Caps) and Section 14 (Mandatory Quality Certification). Mandates retention of surcharge amounts.',
      status: ACTION_STATUS.PENDING_APPROVAL,
      requiresHumanApproval: true,
      createdAt: new Date(baseTime).toISOString(),
      lastModifiedAt: new Date(baseTime + 300000).toISOString(),
      isDemoSeed: true,
      riskReductionEstimate: 'Prevents $74K leakage; triggers mandatory recertification proof'
    },
    {
      id: 'ACT-2026-002',
      supplierId: 'SUP-003',
      supplierCode: 'Supplier C',
      supplierName: 'HydroTech Fluid Systems',
      actionTitle: 'Divert 40% Seal Purchase Allocation to Standby Vendor',
      category: 'Supply Chain Continuity',
      urgency: 'HIGH',
      priority: 'HIGH',
      financialValue: 'Protects $85K/day line risk',
      evidenceSummary: 'Inventory down to 14 days; OTIF degraded to 64.2%; 3 consecutive POs arrived with median 19-day delay.',
      draftDetails: 'Issue PO split to dual-source supplier (SealsCorp Global) for next 2 purchase cycles to lift plant buffer back to 35-day safety standard.',
      status: ACTION_STATUS.PENDING_APPROVAL,
      requiresHumanApproval: true,
      createdAt: new Date(baseTime + 3600000).toISOString(),
      lastModifiedAt: new Date(baseTime + 3900000).toISOString(),
      isDemoSeed: true,
      riskReductionEstimate: 'Restores buffer inventory to 35 days within 3 weeks'
    },
    {
      id: 'ACT-2026-003',
      supplierId: 'SUP-005',
      supplierCode: 'Supplier E',
      supplierName: 'Rotary Precision Bearings',
      actionTitle: 'Mandate Urgent 8D CAPA & 7-Day Certificate Extension Proof',
      category: 'Quality Assurance',
      urgency: 'MEDIUM',
      priority: 'MEDIUM',
      financialValue: 'Avoids $19.4K scrap rate',
      evidenceSummary: 'Rejections doubled to 4.6% in Lot #QA-912; IATF cert expires in 20 days; spindle runout tolerance issues.',
      draftDetails: 'Dispatch Supplier Quality Engineer (SQE) for on-site inspection of CNC grinding calibration and demand formal auditor extension attestation.',
      status: ACTION_STATUS.APPROVED,
      approvedAt: new Date(baseTime + 18000000).toISOString(),
      approvedBy: DEFAULT_REVIEWER,
      requiresHumanApproval: true,
      createdAt: new Date(baseTime + 7200000).toISOString(),
      lastModifiedAt: new Date(baseTime + 18000000).toISOString(),
      isDemoSeed: true,
      riskReductionEstimate: 'Targets drop in defect rate back below 2.0% baseline'
    },
    {
      id: 'ACT-2026-004',
      supplierId: 'SUP-006',
      supplierCode: 'Supplier F',
      supplierName: 'Kinetic Dynamics Motor Works',
      actionTitle: 'Freeze Unapproved Copper Surcharges (+5.5%) & Demand OTIF Recovery Plan',
      category: 'Commercial & Logistics',
      urgency: 'HIGH',
      priority: 'HIGH',
      financialValue: '$45,100 / qtr',
      evidenceSummary: 'Price variance +5.5% ($865.10 vs $820.00 across PO-0808 and PO-0925); OTIF declined to 74.1%; lead times lengthened.',
      draftDetails: 'Enforce contract rate of $820/unit; require written recovery schedule within 5 business days restoring OTIF to >90%.',
      status: ACTION_STATUS.IN_PROGRESS,
      approvedAt: new Date(baseTime + 28800000).toISOString(),
      approvedBy: DEFAULT_REVIEWER,
      workStartedAt: new Date(baseTime + 36000000).toISOString(),
      workStartedBy: DEFAULT_REVIEWER,
      requiresHumanApproval: true,
      createdAt: new Date(baseTime + 10800000).toISOString(),
      lastModifiedAt: new Date(baseTime + 36000000).toISOString(),
      isDemoSeed: true,
      riskReductionEstimate: 'Eliminates $45K unwarranted billing; arrests delivery slippage'
    },
    {
      id: 'ACT-2026-005',
      supplierId: 'SUP-002',
      supplierCode: 'Supplier B',
      supplierName: 'Vanguard Industrial Fasteners',
      actionTitle: 'Quarterly Preferred Partner Rebate & Volume Allocation Review',
      category: 'Supplier Relationship',
      urgency: 'LOW',
      priority: 'LOW',
      financialValue: 'Tier-1 Supplier Incentive',
      evidenceSummary: 'Consistently 98.4% OTIF; zero scrap rejections; ISO 9001 valid through 2028.',
      draftDetails: 'Evaluate 2% annual volume rebate and initiate 24-month contract renewal negotiations.',
      status: ACTION_STATUS.DRAFT,
      requiresHumanApproval: true,
      createdAt: new Date(baseTime + 43200000).toISOString(),
      lastModifiedAt: new Date(baseTime + 43200000).toISOString(),
      isDemoSeed: true,
      riskReductionEstimate: 'Strengthens benchmark Tier-1 vendor stability'
    },
    {
      id: 'ACT-2026-006',
      supplierId: 'SUP-004',
      supplierCode: 'Supplier D',
      supplierName: 'BioPac Medical Packaging',
      actionTitle: 'Expedite Cleanroom Level-IV Batch Sterilization Validation',
      category: 'Quality Compliance',
      urgency: 'MEDIUM',
      priority: 'MEDIUM',
      financialValue: 'Protects FDA Batch Clearing',
      evidenceSummary: 'Annual ISO 13485 recertification audit completed successfully; protocol closed.',
      draftDetails: 'Archived regulatory audit verification. All bio-compatibility certificates signed off.',
      status: ACTION_STATUS.COMPLETED,
      approvedAt: new Date(baseTime + 14400000).toISOString(),
      approvedBy: 'Elena Rostova (Lead Quality Compliance Auditor)',
      workStartedAt: new Date(baseTime + 21600000).toISOString(),
      completedAt: new Date(baseTime + 50400000).toISOString(),
      completedBy: 'Elena Rostova (Lead Quality Compliance Auditor)',
      requiresHumanApproval: true,
      createdAt: new Date(baseTime + 10000000).toISOString(),
      lastModifiedAt: new Date(baseTime + 50400000).toISOString(),
      isDemoSeed: true,
      riskReductionEstimate: '100% verified compliance closure'
    }
  ];

  // Build corresponding initial audit events
  const seedAudit = [
    {
      id: 'AUD-SEED-001',
      actionId: 'ACT-2026-001',
      actionTitle: seedActions[0].actionTitle,
      supplierCode: 'Supplier A',
      eventType: AUDIT_EVENT_TYPE.ACTION_CREATED,
      fromStatus: null,
      toStatus: ACTION_STATUS.DRAFT,
      actor: 'System / Agent Orchestrator',
      timestamp: new Date(baseTime).toISOString(),
      reason: 'Drafted via Risk Investigation & Commercial Audit Agent',
      isLocalDemoLog: true
    },
    {
      id: 'AUD-SEED-002',
      actionId: 'ACT-2026-001',
      actionTitle: seedActions[0].actionTitle,
      supplierCode: 'Supplier A',
      eventType: AUDIT_EVENT_TYPE.SUBMITTED_FOR_APPROVAL,
      fromStatus: ACTION_STATUS.DRAFT,
      toStatus: ACTION_STATUS.PENDING_APPROVAL,
      actor: 'System / Decision Review Agent',
      timestamp: new Date(baseTime + 300000).toISOString(),
      reason: 'Prioritized as Rank #1 executive intervention',
      isLocalDemoLog: true
    },
    {
      id: 'AUD-SEED-003',
      actionId: 'ACT-2026-002',
      actionTitle: seedActions[1].actionTitle,
      supplierCode: 'Supplier C',
      eventType: AUDIT_EVENT_TYPE.ACTION_CREATED,
      fromStatus: null,
      toStatus: ACTION_STATUS.PENDING_APPROVAL,
      actor: 'System / Continuity Planner',
      timestamp: new Date(baseTime + 3600000).toISOString(),
      reason: 'Staged due to critical 14-day plant buffer depletion',
      isLocalDemoLog: true
    },
    {
      id: 'AUD-SEED-004',
      actionId: 'ACT-2026-003',
      actionTitle: seedActions[2].actionTitle,
      supplierCode: 'Supplier E',
      eventType: AUDIT_EVENT_TYPE.ACTION_APPROVED,
      fromStatus: ACTION_STATUS.PENDING_APPROVAL,
      toStatus: ACTION_STATUS.APPROVED,
      actor: DEFAULT_REVIEWER,
      timestamp: new Date(baseTime + 18000000).toISOString(),
      reason: 'Approved for SQE dispatch following bearing runout surge',
      isLocalDemoLog: true
    },
    {
      id: 'AUD-SEED-005',
      actionId: 'ACT-2026-004',
      actionTitle: seedActions[3].actionTitle,
      supplierCode: 'Supplier F',
      eventType: AUDIT_EVENT_TYPE.WORK_STARTED,
      fromStatus: ACTION_STATUS.APPROVED,
      toStatus: ACTION_STATUS.IN_PROGRESS,
      actor: DEFAULT_REVIEWER,
      timestamp: new Date(baseTime + 36000000).toISOString(),
      reason: 'Finance and legal commercial dispute notices transmitted to supplier',
      isLocalDemoLog: true
    },
    {
      id: 'AUD-SEED-006',
      actionId: 'ACT-2026-006',
      actionTitle: seedActions[5].actionTitle,
      supplierCode: 'Supplier D',
      eventType: AUDIT_EVENT_TYPE.ACTION_COMPLETED,
      fromStatus: ACTION_STATUS.IN_PROGRESS,
      toStatus: ACTION_STATUS.COMPLETED,
      actor: 'Elena Rostova (Lead Quality Compliance Auditor)',
      timestamp: new Date(baseTime + 50400000).toISOString(),
      reason: 'Sterilization certificates fully received, audited, and archived',
      isLocalDemoLog: true
    }
  ];

  return { seedActions, seedAudit };
}

/**
 * Validates a loaded action record, normalizing fields
 */
export function validateActionRecord(record) {
  if (!record || typeof record !== 'object') return null;
  if (!record.id || !record.actionTitle) return null;

  return {
    ...record,
    id: String(record.id),
    status: normalizeActionStatus(record.status),
    actionTitle: String(record.actionTitle),
    supplierCode: record.supplierCode || 'SUP',
    supplierName: record.supplierName || 'Portfolio Supplier',
    category: record.category || 'General Procurement',
    urgency: (record.urgency || record.priority || 'MEDIUM').toUpperCase(),
    financialValue: record.financialValue || 'Operational Value',
    evidenceSummary: record.evidenceSummary || 'Transaction records verified',
    draftDetails: record.draftDetails || 'Proposed intervention blueprint',
    requiresHumanApproval: true,
    createdAt: record.createdAt || new Date().toISOString(),
    lastModifiedAt: record.lastModifiedAt || new Date().toISOString()
  };
}

/**
 * Validates an audit event record
 */
export function validateAuditEventRecord(record) {
  if (!record || typeof record !== 'object') return null;
  if (!record.id || !record.actionId || !record.toStatus) return null;

  return {
    ...record,
    id: String(record.id),
    actionId: String(record.actionId),
    actionTitle: record.actionTitle || 'Procurement Action',
    supplierCode: record.supplierCode || 'SUP',
    eventType: record.eventType || AUDIT_EVENT_TYPE.ACTION_CREATED,
    fromStatus: record.fromStatus ? normalizeActionStatus(record.fromStatus) : null,
    toStatus: normalizeActionStatus(record.toStatus),
    actor: record.actor || DEFAULT_REVIEWER,
    timestamp: record.timestamp || new Date().toISOString(),
    reason: record.reason || null,
    isLocalDemoLog: true
  };
}

/**
 * Loads persisted action records with graceful fallback
 */
export function loadPersistedActions() {
  if (!isStorageAvailable()) {
    return createInitialSeedActionsAndAudit().seedActions;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.ACTIONS);
    if (!raw) {
      const { seedActions } = createInitialSeedActionsAndAudit();
      savePersistedActions(seedActions);
      return seedActions;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const { seedActions } = createInitialSeedActionsAndAudit();
      savePersistedActions(seedActions);
      return seedActions;
    }

    const validated = parsed.map(validateActionRecord).filter(Boolean);
    if (validated.length === 0) {
      const { seedActions } = createInitialSeedActionsAndAudit();
      savePersistedActions(seedActions);
      return seedActions;
    }

    return validated;
  } catch (err) {
    console.warn('Failed to parse persisted actions, reverting to seeds:', err);
    const { seedActions } = createInitialSeedActionsAndAudit();
    savePersistedActions(seedActions);
    return seedActions;
  }
}

/**
 * Saves action records to localStorage
 */
export function savePersistedActions(actions = []) {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(actions));
  } catch (err) {
    console.error('Failed to save actions to localStorage:', err);
  }
}

/**
 * Loads persisted audit log with graceful fallback
 */
export function loadPersistedAuditLog() {
  if (!isStorageAvailable()) {
    return createInitialSeedActionsAndAudit().seedAudit;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.AUDIT_LOG);
    if (!raw) {
      const { seedAudit } = createInitialSeedActionsAndAudit();
      savePersistedAuditLog(seedAudit);
      return seedAudit;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const { seedAudit } = createInitialSeedActionsAndAudit();
      savePersistedAuditLog(seedAudit);
      return seedAudit;
    }

    const validated = parsed.map(validateAuditEventRecord).filter(Boolean);
    if (validated.length === 0) {
      const { seedAudit } = createInitialSeedActionsAndAudit();
      savePersistedAuditLog(seedAudit);
      return seedAudit;
    }

    return validated;
  } catch (err) {
    console.warn('Failed to parse persisted audit log, reverting to seeds:', err);
    const { seedAudit } = createInitialSeedActionsAndAudit();
    savePersistedAuditLog(seedAudit);
    return seedAudit;
  }
}

/**
 * Saves audit log to localStorage
 */
export function savePersistedAuditLog(auditLog = []) {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(auditLog));
  } catch (err) {
    console.error('Failed to save audit log to localStorage:', err);
  }
}

/**
 * Generates stable unique Action ID: e.g. ACT-2026-007
 */
export function generateStableActionId(existingActions = []) {
  const currentYear = new Date().getFullYear();
  const basePrefix = `ACT-${currentYear}`;

  let maxNum = 0;
  for (const act of existingActions) {
    const id = String(act.id || '');
    const match = id.match(/ACT-\d{4}-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  }

  const nextNum = maxNum + 1;
  const padded = String(nextNum).padStart(3, '0');
  return `${basePrefix}-${padded}`;
}

/**
 * Resets storage to initial demo seeds
 */
export function resetToInitialSeeds() {
  const { seedActions, seedAudit } = createInitialSeedActionsAndAudit();
  if (isStorageAvailable()) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(seedActions));
      window.localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(seedAudit));
      window.localStorage.removeItem(STORAGE_KEYS.REVIEWER);
    } catch (err) {
      console.error('Failed to reset localStorage:', err);
    }
  }
  return { actions: seedActions, auditLog: seedAudit };
}
