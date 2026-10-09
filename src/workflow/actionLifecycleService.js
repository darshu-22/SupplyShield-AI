/**
 * SupplyShield AI — Action Lifecycle Service (Phase 6)
 *
 * Defines the strict, explainable finite-state machine (FSM) for procurement
 * actions, human-in-the-loop review governance, transition rules, and validation.
 */

export const ACTION_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export const ACTION_PRIORITY = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
};

export const DEMO_REVIEWERS = [
  { id: 'REV-001', name: 'Sarah Chen', role: 'Director of Procurement', email: 's.chen@supplyshield.internal' },
  { id: 'REV-002', name: 'Marcus Vance', role: 'VP Supply Chain & Operations', email: 'm.vance@supplyshield.internal' },
  { id: 'REV-003', name: 'Elena Rostova', role: 'Lead Quality Compliance Auditor', email: 'e.rostova@supplyshield.internal' }
];

export const DEFAULT_REVIEWER = `${DEMO_REVIEWERS[0].name} (${DEMO_REVIEWERS[0].role})`;

/**
 * Valid transitions graph:
 * - DRAFT -> PENDING_APPROVAL, CANCELLED
 * - PENDING_APPROVAL -> APPROVED, REJECTED, CANCELLED
 * - APPROVED -> IN_PROGRESS, CANCELLED
 * - IN_PROGRESS -> COMPLETED, CANCELLED
 * - REJECTED -> Terminal (no outgoing transitions)
 * - COMPLETED -> Terminal (no outgoing transitions)
 * - CANCELLED -> Terminal (no outgoing transitions)
 */
export const VALID_TRANSITIONS = {
  [ACTION_STATUS.DRAFT]: [ACTION_STATUS.PENDING_APPROVAL, ACTION_STATUS.CANCELLED],
  [ACTION_STATUS.PENDING_APPROVAL]: [ACTION_STATUS.APPROVED, ACTION_STATUS.REJECTED, ACTION_STATUS.CANCELLED],
  [ACTION_STATUS.APPROVED]: [ACTION_STATUS.IN_PROGRESS, ACTION_STATUS.CANCELLED],
  [ACTION_STATUS.IN_PROGRESS]: [ACTION_STATUS.COMPLETED, ACTION_STATUS.CANCELLED],
  [ACTION_STATUS.REJECTED]: [],
  [ACTION_STATUS.COMPLETED]: [],
  [ACTION_STATUS.CANCELLED]: []
};

/**
 * Normalizes any legacy or variant status string to standard ACTION_STATUS enum
 */
export function normalizeActionStatus(status) {
  if (!status) return ACTION_STATUS.DRAFT;
  const s = String(status).trim().toUpperCase().replace(/[\s-]+/g, '_');
  
  if (s === 'PENDING' || s === 'PENDING_APPROVAL' || s === 'PENDINGAPPROVAL') {
    return ACTION_STATUS.PENDING_APPROVAL;
  }
  if (s === 'APPROVED') return ACTION_STATUS.APPROVED;
  if (s === 'REJECTED') return ACTION_STATUS.REJECTED;
  if (s === 'IN_PROGRESS' || s === 'INPROGRESS' || s === 'IN_WORK') return ACTION_STATUS.IN_PROGRESS;
  if (s === 'COMPLETED' || s === 'COMPLETE' || s === 'RESOLVED') return ACTION_STATUS.COMPLETED;
  if (s === 'CANCELLED' || s === 'CANCELED' || s === 'ARCHIVED') return ACTION_STATUS.CANCELLED;
  if (s === 'DRAFT' || s === 'DRAFTED') return ACTION_STATUS.DRAFT;

  // Fallback to DRAFT if unknown
  return Object.values(ACTION_STATUS).includes(s) ? s : ACTION_STATUS.DRAFT;
}

/**
 * Returns human-readable label for status
 */
export function getStatusLabel(status) {
  const norm = normalizeActionStatus(status);
  switch (norm) {
    case ACTION_STATUS.DRAFT: return 'Draft';
    case ACTION_STATUS.PENDING_APPROVAL: return 'Pending Approval';
    case ACTION_STATUS.APPROVED: return 'Approved';
    case ACTION_STATUS.REJECTED: return 'Rejected';
    case ACTION_STATUS.IN_PROGRESS: return 'In Progress';
    case ACTION_STATUS.COMPLETED: return 'Completed';
    case ACTION_STATUS.CANCELLED: return 'Cancelled';
    default: return norm;
  }
}

/**
 * Returns UI color tokens for status badges
 */
export function getStatusStyle(status) {
  const norm = normalizeActionStatus(status);
  switch (norm) {
    case ACTION_STATUS.DRAFT:
      return { bg: 'rgba(148, 163, 184, 0.12)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' };
    case ACTION_STATUS.PENDING_APPROVAL:
      return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.4)' };
    case ACTION_STATUS.APPROVED:
      return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.4)' };
    case ACTION_STATUS.IN_PROGRESS:
      return { bg: 'rgba(14, 165, 233, 0.15)', text: '#38bdf8', border: 'rgba(14, 165, 233, 0.4)' };
    case ACTION_STATUS.COMPLETED:
      return { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.4)' };
    case ACTION_STATUS.REJECTED:
      return { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.4)' };
    case ACTION_STATUS.CANCELLED:
      return { bg: 'rgba(100, 116, 139, 0.15)', text: '#cbd5e1', border: 'rgba(100, 116, 139, 0.3)' };
    default:
      return { bg: 'rgba(148, 163, 184, 0.12)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' };
  }
}

/**
 * Verifies if a transition between two statuses is permitted
 */
export function canTransition(fromStatus, toStatus) {
  const normFrom = normalizeActionStatus(fromStatus);
  const normTo = normalizeActionStatus(toStatus);
  const allowed = VALID_TRANSITIONS[normFrom] || [];
  return allowed.includes(normTo);
}

/**
 * Validates transition preconditions, requiring comments for rejections/cancellations
 */
export function validateTransition(action, toStatus, { reason = '', reviewer = '' } = {}) {
  if (!action) {
    return { valid: false, error: 'Target action record not found' };
  }

  const fromStatus = normalizeActionStatus(action.status);
  const targetStatus = normalizeActionStatus(toStatus);

  if (!canTransition(fromStatus, targetStatus)) {
    return {
      valid: false,
      error: `Invalid lifecycle transition from ${getStatusLabel(fromStatus)} to ${getStatusLabel(targetStatus)}.`
    };
  }

  // Mandatory rejection reason
  if (targetStatus === ACTION_STATUS.REJECTED) {
    if (!reason || !reason.trim()) {
      return {
        valid: false,
        error: 'Rejection requires a documented reason.'
      };
    }
  }

  // Mandatory cancellation reason
  if (targetStatus === ACTION_STATUS.CANCELLED) {
    if (!reason || !reason.trim()) {
      return {
        valid: false,
        error: 'Cancellation requires a documented reason.'
      };
    }
  }

  // Human approval requires reviewer identity
  if (targetStatus === ACTION_STATUS.APPROVED) {
    if (!reviewer || !reviewer.trim()) {
      return {
        valid: false,
        error: 'Human approval requires an identified reviewer.'
      };
    }
  }

  return { valid: true };
}

/**
 * Executes a lifecycle state transition on an action record.
 * Throws Error if validation fails.
 */
export function transitionAction(action, toStatus, { reason = '', reviewer = DEFAULT_REVIEWER, timestamp = null } = {}) {
  const validation = validateTransition(action, toStatus, { reason, reviewer });
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const fromStatus = normalizeActionStatus(action.status);
  const targetStatus = normalizeActionStatus(toStatus);
  const effectiveTime = timestamp || new Date().toISOString();

  const updatedAction = {
    ...action,
    status: targetStatus,
    previousStatus: fromStatus,
    lastModifiedAt: effectiveTime
  };

  if (targetStatus === ACTION_STATUS.APPROVED) {
    updatedAction.approvedAt = effectiveTime;
    updatedAction.approvedBy = reviewer;
    updatedAction.rejectionReason = null;
  } else if (targetStatus === ACTION_STATUS.REJECTED) {
    updatedAction.rejectedAt = effectiveTime;
    updatedAction.rejectedBy = reviewer;
    updatedAction.rejectionReason = reason.trim();
  } else if (targetStatus === ACTION_STATUS.IN_PROGRESS) {
    updatedAction.workStartedAt = effectiveTime;
    updatedAction.workStartedBy = reviewer;
  } else if (targetStatus === ACTION_STATUS.COMPLETED) {
    updatedAction.completedAt = effectiveTime;
    updatedAction.completedBy = reviewer;
  } else if (targetStatus === ACTION_STATUS.CANCELLED) {
    updatedAction.cancelledAt = effectiveTime;
    updatedAction.cancelledBy = reviewer;
    updatedAction.cancellationReason = reason.trim();
  }

  return updatedAction;
}

/**
 * Checks for existing active actions matching a recommendation candidate
 * to prevent duplicate staging.
 */
export function findExistingActiveAction(actions = [], candidate = {}) {
  if (!candidate) return null;

  const candidateSupplier = candidate.supplierId || candidate.supplierCode;
  const candidateTitle = (candidate.actionTitle || candidate.title || '').trim().toLowerCase();
  const candidateRecId = candidate.recommendationId || candidate.recId;

  const ACTIVE_STATUSES = [
    ACTION_STATUS.DRAFT,
    ACTION_STATUS.PENDING_APPROVAL,
    ACTION_STATUS.APPROVED,
    ACTION_STATUS.IN_PROGRESS
  ];

  return actions.find(act => {
    const actStatus = normalizeActionStatus(act.status);
    if (!ACTIVE_STATUSES.includes(actStatus)) return false;

    // Direct recommendation ID match
    if (candidateRecId && act.recommendationId && candidateRecId === act.recommendationId) {
      return true;
    }

    // Direct title & supplier match
    const sameSupplier = 
      (act.supplierId && candidate.supplierId && act.supplierId === candidate.supplierId) ||
      (act.supplierCode && candidate.supplierCode && act.supplierCode === candidate.supplierCode) ||
      (candidateSupplier && (act.supplierId === candidateSupplier || act.supplierCode === candidateSupplier));

    if (sameSupplier && candidateTitle) {
      const actTitle = (act.actionTitle || act.title || '').trim().toLowerCase();
      if (actTitle === candidateTitle) return true;
      if (actTitle.includes(candidateTitle) || candidateTitle.includes(actTitle)) return true;
    }

    return false;
  }) || null;
}

/**
 * Multi-criteria filter for actions
 */
export function filterActions(actions = [], filters = {}) {
  const {
    status = 'ALL',
    priority = 'ALL',
    supplier = 'ALL',
    category = 'ALL',
    searchQuery = ''
  } = filters;

  const query = searchQuery.trim().toLowerCase();

  return actions.filter(action => {
    const actStatus = normalizeActionStatus(action.status);

    // Status filter
    if (status !== 'ALL') {
      const normTargetStatus = normalizeActionStatus(status);
      if (actStatus !== normTargetStatus) return false;
    }

    // Priority filter
    if (priority !== 'ALL') {
      const actPriority = (action.urgency || action.priority || 'MEDIUM').toUpperCase();
      if (actPriority !== priority.toUpperCase()) return false;
    }

    // Supplier filter
    if (supplier !== 'ALL') {
      const matchesSupplier = 
        action.supplierCode === supplier || 
        action.supplierId === supplier ||
        (action.supplierName && action.supplierName.toLowerCase().includes(supplier.toLowerCase()));
      if (!matchesSupplier) return false;
    }

    // Category filter
    if (category !== 'ALL') {
      const actCat = (action.category || '').toLowerCase();
      if (!actCat.includes(category.toLowerCase())) return false;
    }

    // Search query
    if (query) {
      const matchId = (action.id || '').toLowerCase().includes(query);
      const matchTitle = (action.actionTitle || action.title || '').toLowerCase().includes(query);
      const matchSupplier = (action.supplierName || '').toLowerCase().includes(query) || (action.supplierCode || '').toLowerCase().includes(query);
      const matchEvidence = (action.evidenceSummary || '').toLowerCase().includes(query);
      const matchCategory = (action.category || '').toLowerCase().includes(query);

      if (!matchId && !matchTitle && !matchSupplier && !matchEvidence && !matchCategory) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sorts actions according to priority, date, or impact
 */
export function sortActions(actions = [], sortBy = 'urgency') {
  const urgencyWeight = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1
  };

  return [...actions].sort((a, b) => {
    if (sortBy === 'urgency' || sortBy === 'priority') {
      const weightA = urgencyWeight[a.urgency || a.priority] || 2;
      const weightB = urgencyWeight[b.urgency || b.priority] || 2;
      if (weightB !== weightA) return weightB - weightA;
      // Secondary sort: id descending
      return String(b.id).localeCompare(String(a.id));
    }

    if (sortBy === 'date' || sortBy === 'newest') {
      const dateA = new Date(a.createdAt || a.lastModifiedAt || 0).getTime();
      const dateB = new Date(b.createdAt || b.lastModifiedAt || 0).getTime();
      return dateB - dateA;
    }

    if (sortBy === 'oldest') {
      const dateA = new Date(a.createdAt || a.lastModifiedAt || 0).getTime();
      const dateB = new Date(b.createdAt || b.lastModifiedAt || 0).getTime();
      return dateA - dateB;
    }

    return 0;
  });
}
