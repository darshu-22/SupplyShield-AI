/**
 * SupplyShield AI — Append-Only Audit Trail Service (Phase 6)
 *
 * Implements an immutable, append-only audit history for all procurement
 * action lifecycle transitions and governance decisions.
 */

import { normalizeActionStatus } from './actionLifecycleService.js';

export const AUDIT_EVENT_TYPE = {
  ACTION_CREATED: 'ACTION_CREATED',
  SUBMITTED_FOR_APPROVAL: 'SUBMITTED_FOR_APPROVAL',
  ACTION_APPROVED: 'ACTION_APPROVED',
  ACTION_REJECTED: 'ACTION_REJECTED',
  WORK_STARTED: 'WORK_STARTED',
  ACTION_COMPLETED: 'ACTION_COMPLETED',
  ACTION_CANCELLED: 'ACTION_CANCELLED'
};

/**
 * Maps target lifecycle status to corresponding audit event type
 */
export function getEventTypeForStatus(toStatus) {
  const norm = normalizeActionStatus(toStatus);
  switch (norm) {
    case 'PENDING_APPROVAL': return AUDIT_EVENT_TYPE.SUBMITTED_FOR_APPROVAL;
    case 'APPROVED': return AUDIT_EVENT_TYPE.ACTION_APPROVED;
    case 'REJECTED': return AUDIT_EVENT_TYPE.ACTION_REJECTED;
    case 'IN_PROGRESS': return AUDIT_EVENT_TYPE.WORK_STARTED;
    case 'COMPLETED': return AUDIT_EVENT_TYPE.ACTION_COMPLETED;
    case 'CANCELLED': return AUDIT_EVENT_TYPE.ACTION_CANCELLED;
    default: return AUDIT_EVENT_TYPE.ACTION_CREATED;
  }
}

let auditSequence = 0;

/**
 * Creates a structured audit event record
 */
export function createAuditEvent({
  actionId,
  actionTitle,
  supplierCode,
  eventType,
  fromStatus = null,
  toStatus,
  actor,
  reason = null,
  timestamp = null,
  evidenceReferences = null
}) {
  if (!actionId) throw new Error('Cannot create audit event without actionId');
  if (!toStatus) throw new Error('Cannot create audit event without toStatus');

  const now = new Date();
  const dateStr = timestamp || now.toISOString();

  return {
    id: `AUD-${Date.now()}-${++auditSequence}`,
    actionId: String(actionId),
    actionTitle: actionTitle || 'Procurement Action',
    supplierCode: supplierCode || 'SUP',
    eventType: eventType || getEventTypeForStatus(toStatus),
    fromStatus: fromStatus ? normalizeActionStatus(fromStatus) : null,
    toStatus: normalizeActionStatus(toStatus),
    actor: actor || 'Sarah Chen (Director of Procurement)',
    timestamp: dateStr,
    reason: reason ? String(reason).trim() : null,
    evidenceReferences: evidenceReferences || null,
    isLocalDemoLog: true
  };
}

/**
 * Appends an audit event to the audit trail log.
 * Pure append-only: freezes new record to guarantee immutability.
 */
export function appendAuditEvent(auditLog = [], newEvent) {
  if (!newEvent || !newEvent.id) {
    throw new Error('Invalid audit event record: missing required event attributes');
  }

  // Freeze the new event to guarantee tamper-proof behavior in memory
  const frozenEvent = Object.freeze({ ...newEvent });

  // Return new array with event appended (append-only)
  return [...auditLog, frozenEvent];
}

/**
 * Retrieves the complete chronological audit trail for a specific action
 */
export function getAuditTrailForAction(auditLog = [], actionId) {
  if (!actionId) return [];
  const targetId = String(actionId);

  return auditLog
    .filter(event => event.actionId === targetId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

/**
 * Filters the portfolio-wide audit log
 */
export function filterAuditLog(auditLog = [], filters = {}) {
  const {
    eventType = 'ALL',
    actionId = '',
    supplierCode = 'ALL',
    searchQuery = ''
  } = filters;

  const query = searchQuery.trim().toLowerCase();

  return auditLog.filter(event => {
    // Event type filter
    if (eventType !== 'ALL' && event.eventType !== eventType) {
      return false;
    }

    // Action ID filter
    if (actionId && !event.actionId.toLowerCase().includes(actionId.toLowerCase())) {
      return false;
    }

    // Supplier code filter
    if (supplierCode !== 'ALL' && event.supplierCode !== supplierCode) {
      return false;
    }

    // Generic search query
    if (query) {
      const matchId = event.id.toLowerCase().includes(query);
      const matchAction = event.actionId.toLowerCase().includes(query);
      const matchTitle = (event.actionTitle || '').toLowerCase().includes(query);
      const matchActor = (event.actor || '').toLowerCase().includes(query);
      const matchReason = (event.reason || '').toLowerCase().includes(query);
      const matchSupplier = (event.supplierCode || '').toLowerCase().includes(query);

      if (!matchId && !matchAction && !matchTitle && !matchActor && !matchReason && !matchSupplier) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Formats event type for display with badge colors
 */
export function getAuditEventStyle(eventType) {
  switch (eventType) {
    case AUDIT_EVENT_TYPE.ACTION_CREATED:
      return { label: 'Action Staged', bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' };
    case AUDIT_EVENT_TYPE.SUBMITTED_FOR_APPROVAL:
      return { label: 'Submitted for Review', bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.4)' };
    case AUDIT_EVENT_TYPE.ACTION_APPROVED:
      return { label: 'Executive Approved', bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.4)' };
    case AUDIT_EVENT_TYPE.ACTION_REJECTED:
      return { label: 'Action Rejected', bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.4)' };
    case AUDIT_EVENT_TYPE.WORK_STARTED:
      return { label: 'Execution Started', bg: 'rgba(14, 165, 233, 0.15)', text: '#38bdf8', border: 'rgba(14, 165, 233, 0.4)' };
    case AUDIT_EVENT_TYPE.ACTION_COMPLETED:
      return { label: 'Action Completed', bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.4)' };
    case AUDIT_EVENT_TYPE.ACTION_CANCELLED:
      return { label: 'Action Cancelled', bg: 'rgba(100, 116, 139, 0.15)', text: '#cbd5e1', border: 'rgba(100, 116, 139, 0.3)' };
    default:
      return { label: eventType, bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' };
  }
}
