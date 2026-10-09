import React, { useState } from 'react';
import { 
  CheckSquare, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  DollarSign, 
  Clock, 
  PlayCircle, 
  Archive, 
  SendHorizontal, 
  Search, 
  Filter, 
  ArrowUpDown, 
  RotateCcw, 
  Download, 
  User, 
  ShieldCheck, 
  SlidersHorizontal,
  Eye
} from 'lucide-react';
import { 
  ACTION_STATUS, 
  DEMO_REVIEWERS, 
  DEFAULT_REVIEWER,
  normalizeActionStatus, 
  getStatusLabel, 
  getStatusStyle, 
  canTransition,
  filterActions,
  sortActions
} from '../../workflow/actionLifecycleService';
import { filterAuditLog, getAuditEventStyle } from '../../workflow/auditService';
import { ActionDetailModal } from '../decisions/ActionDetailModal';
import { TransitionReasonModal } from '../decisions/TransitionReasonModal';

export function DecisionsView({ 
  actions = [], 
  auditLog = [],
  currentReviewer = DEFAULT_REVIEWER,
  onChangeReviewer,
  onTransitionAction,
  onApproveAction, 
  onRejectAction,
  onInspectSupplierByCode,
  onResetToDemoData
}) {
  // Navigation & Sub-views
  const [activeSubTab, setActiveSubTab] = useState('pipeline'); // 'pipeline' | 'audit'

  // Pipeline Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [supplierFilter, setSupplierFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('urgency');

  // Audit Log Filter States
  const [auditEventTypeFilter, setAuditEventTypeFilter] = useState('ALL');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');

  // Modals
  const [selectedAction, setSelectedAction] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Transition Reason Modal (for Reject / Cancel)
  const [reasonModalState, setReasonModalState] = useState({
    isOpen: false,
    action: null,
    targetStatus: null
  });

  // Calculate Status Counts derived from actual records
  const counts = {
    all: actions.length,
    draft: actions.filter(a => normalizeActionStatus(a.status) === ACTION_STATUS.DRAFT).length,
    pending: actions.filter(a => normalizeActionStatus(a.status) === ACTION_STATUS.PENDING_APPROVAL).length,
    approved: actions.filter(a => normalizeActionStatus(a.status) === ACTION_STATUS.APPROVED).length,
    inProgress: actions.filter(a => normalizeActionStatus(a.status) === ACTION_STATUS.IN_PROGRESS).length,
    completed: actions.filter(a => normalizeActionStatus(a.status) === ACTION_STATUS.COMPLETED).length,
    rejected: actions.filter(a => normalizeActionStatus(a.status) === ACTION_STATUS.REJECTED).length,
    cancelled: actions.filter(a => normalizeActionStatus(a.status) === ACTION_STATUS.CANCELLED).length
  };

  // Filtered & Sorted Actions
  const filteredActions = sortActions(
    filterActions(actions, {
      status: statusFilter,
      priority: priorityFilter,
      supplier: supplierFilter,
      searchQuery
    }),
    sortBy
  );

  // Filtered Audit Log
  const filteredAuditEvents = filterAuditLog(auditLog, {
    eventType: auditEventTypeFilter,
    searchQuery: auditSearchQuery
  });

  // Unique suppliers present in actions
  const actionSuppliers = Array.from(new Set(actions.map(a => a.supplierCode))).filter(Boolean);

  // Transition Handlers
  const handleDirectTransition = (actionId, targetStatus) => {
    if (onTransitionAction) {
      onTransitionAction(actionId, targetStatus, { reviewer: currentReviewer });
    } else if (targetStatus === ACTION_STATUS.APPROVED && onApproveAction) {
      onApproveAction(actionId);
    }
  };

  const handleOpenReasonModal = (action, targetStatus) => {
    setReasonModalState({
      isOpen: true,
      action,
      targetStatus
    });
  };

  const handleReasonSubmit = (reason) => {
    const { action, targetStatus } = reasonModalState;
    if (onTransitionAction && action && targetStatus) {
      onTransitionAction(action.id, targetStatus, { reason, reviewer: currentReviewer });
    } else if (targetStatus === ACTION_STATUS.REJECTED && onRejectAction && action) {
      onRejectAction(action.id, reason);
    }
    setReasonModalState({ isOpen: false, action: null, targetStatus: null });
  };

  const handleInspectAction = (action) => {
    setSelectedAction(action);
    setIsDetailModalOpen(true);
  };

  // Export audit log as JSON
  const handleExportAuditLog = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLog, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `supplyshield_audit_log_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner & Reviewer Switcher */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        backgroundColor: 'var(--bg-card)',
        padding: '16px 20px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckSquare size={20} style={{ color: 'var(--teal-primary)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Procurement Decision Center
            </h2>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              Phase 6 Governance FSM
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
            Audit, approve, reject, and track procurement interventions across the formal human-in-the-loop lifecycle.
          </p>
        </div>

        {/* Governance Reviewer Identity & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--bg-input)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)'
          }}>
            <User size={14} style={{ color: 'var(--teal-primary)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reviewer Identity:</span>
            <select
              value={currentReviewer}
              onChange={(e) => onChangeReviewer && onChangeReviewer(e.target.value)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '0.78rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {DEMO_REVIEWERS.map(rev => (
                <option key={rev.id} value={`${rev.name} (${rev.role})`} style={{ backgroundColor: '#0f172a', color: '#fff' }}>
                  {rev.name} — {rev.role}
                </option>
              ))}
            </select>
          </div>

          {onResetToDemoData && (
            <button
              onClick={onResetToDemoData}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
              title="Reset actions and audit log to initial demo seeds"
            >
              <RotateCcw size={12} />
              Reset Seeds
            </button>
          )}
        </div>
      </div>

      {/* KPI Status Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px'
      }}>
        {/* All */}
        <div 
          onClick={() => { setActiveSubTab('pipeline'); setStatusFilter('ALL'); }}
          className="card" 
          style={{
            padding: '12px 16px',
            cursor: 'pointer',
            border: statusFilter === 'ALL' && activeSubTab === 'pipeline' ? '1px solid var(--teal-primary)' : '1px solid var(--border-subtle)',
            backgroundColor: statusFilter === 'ALL' && activeSubTab === 'pipeline' ? 'var(--bg-card-hover)' : 'var(--bg-card)'
          }}
        >
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>All Actions</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>{counts.all}</div>
        </div>

        {/* Pending Approval */}
        <div 
          onClick={() => { setActiveSubTab('pipeline'); setStatusFilter(ACTION_STATUS.PENDING_APPROVAL); }}
          className="card" 
          style={{
            padding: '12px 16px',
            cursor: 'pointer',
            border: statusFilter === ACTION_STATUS.PENDING_APPROVAL && activeSubTab === 'pipeline' ? '1px solid #fbbf24' : '1px solid var(--border-subtle)',
            backgroundColor: statusFilter === ACTION_STATUS.PENDING_APPROVAL && activeSubTab === 'pipeline' ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Pending Review</span>
            <Clock size={14} style={{ color: '#fbbf24' }} />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fbbf24', marginTop: '2px' }}>{counts.pending}</div>
        </div>

        {/* Approved */}
        <div 
          onClick={() => { setActiveSubTab('pipeline'); setStatusFilter(ACTION_STATUS.APPROVED); }}
          className="card" 
          style={{
            padding: '12px 16px',
            cursor: 'pointer',
            border: statusFilter === ACTION_STATUS.APPROVED && activeSubTab === 'pipeline' ? '1px solid #34d399' : '1px solid var(--border-subtle)',
            backgroundColor: statusFilter === ACTION_STATUS.APPROVED && activeSubTab === 'pipeline' ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Approved</span>
            <CheckCircle2 size={14} style={{ color: '#34d399' }} />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#34d399', marginTop: '2px' }}>{counts.approved}</div>
        </div>

        {/* In Progress */}
        <div 
          onClick={() => { setActiveSubTab('pipeline'); setStatusFilter(ACTION_STATUS.IN_PROGRESS); }}
          className="card" 
          style={{
            padding: '12px 16px',
            cursor: 'pointer',
            border: statusFilter === ACTION_STATUS.IN_PROGRESS && activeSubTab === 'pipeline' ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
            backgroundColor: statusFilter === ACTION_STATUS.IN_PROGRESS && activeSubTab === 'pipeline' ? 'rgba(14, 165, 233, 0.08)' : 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>In Progress</span>
            <PlayCircle size={14} style={{ color: '#38bdf8' }} />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>{counts.inProgress}</div>
        </div>

        {/* Completed */}
        <div 
          onClick={() => { setActiveSubTab('pipeline'); setStatusFilter(ACTION_STATUS.COMPLETED); }}
          className="card" 
          style={{
            padding: '12px 16px',
            cursor: 'pointer',
            border: statusFilter === ACTION_STATUS.COMPLETED && activeSubTab === 'pipeline' ? '1px solid #c084fc' : '1px solid var(--border-subtle)',
            backgroundColor: statusFilter === ACTION_STATUS.COMPLETED && activeSubTab === 'pipeline' ? 'rgba(168, 85, 247, 0.08)' : 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Completed</span>
            <CheckSquare size={14} style={{ color: '#c084fc' }} />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#c084fc', marginTop: '2px' }}>{counts.completed}</div>
        </div>

        {/* Rejected / Cancelled */}
        <div 
          onClick={() => { setActiveSubTab('pipeline'); setStatusFilter(ACTION_STATUS.REJECTED); }}
          className="card" 
          style={{
            padding: '12px 16px',
            cursor: 'pointer',
            border: (statusFilter === ACTION_STATUS.REJECTED || statusFilter === ACTION_STATUS.CANCELLED) && activeSubTab === 'pipeline' ? '1px solid #f87171' : '1px solid var(--border-subtle)',
            backgroundColor: (statusFilter === ACTION_STATUS.REJECTED || statusFilter === ACTION_STATUS.CANCELLED) && activeSubTab === 'pipeline' ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Rejected/Cancelled</span>
            <XCircle size={14} style={{ color: '#f87171' }} />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f87171', marginTop: '2px' }}>{counts.rejected + counts.cancelled}</div>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-subtle)',
        gap: '8px'
      }}>
        <button
          onClick={() => setActiveSubTab('pipeline')}
          style={{
            padding: '10px 18px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            borderBottom: activeSubTab === 'pipeline' ? '2px solid var(--teal-primary)' : '2px solid transparent',
            color: activeSubTab === 'pipeline' ? 'var(--teal-primary)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <SlidersHorizontal size={15} />
          Procurement Action Pipeline ({actions.length})
        </button>

        <button
          onClick={() => setActiveSubTab('audit')}
          style={{
            padding: '10px 18px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            borderBottom: activeSubTab === 'audit' ? '2px solid var(--teal-primary)' : '2px solid transparent',
            color: activeSubTab === 'audit' ? 'var(--teal-primary)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Clock size={15} />
          Append-Only Audit Log ({auditLog.length})
        </button>
      </div>

      {/* ========================================================= */}
      {/* SUB-VIEW 1: Actions Pipeline                              */}
      {/* ========================================================= */}
      {activeSubTab === 'pipeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filter & Search Bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            backgroundColor: 'var(--bg-card)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)'
          }}>
            {/* Search Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--bg-input)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              minWidth: '260px',
              flex: 1
            }}>
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search action ID, title, supplier, evidence..."
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-main)',
                  fontSize: '0.8125rem',
                  outline: 'none',
                  width: '100%'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                >
                  <XCircle size={13} />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
              {/* Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <Filter size={12} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    padding: '5px 8px',
                    color: 'var(--text-main)',
                    fontSize: '0.75rem',
                    outline: 'none'
                  }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value={ACTION_STATUS.DRAFT}>Draft</option>
                  <option value={ACTION_STATUS.PENDING_APPROVAL}>Pending Approval</option>
                  <option value={ACTION_STATUS.APPROVED}>Approved</option>
                  <option value={ACTION_STATUS.IN_PROGRESS}>In Progress</option>
                  <option value={ACTION_STATUS.COMPLETED}>Completed</option>
                  <option value={ACTION_STATUS.REJECTED}>Rejected</option>
                  <option value={ACTION_STATUS.CANCELLED}>Cancelled</option>
                </select>
              </div>

              {/* Priority */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                style={{
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '5px 8px',
                  color: 'var(--text-main)',
                  fontSize: '0.75rem',
                  outline: 'none'
                }}
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              {/* Supplier */}
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                style={{
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '5px 8px',
                  color: 'var(--text-main)',
                  fontSize: '0.75rem',
                  outline: 'none'
                }}
              >
                <option value="ALL">All Suppliers</option>
                {actionSuppliers.map(code => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>

              {/* Sort */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <ArrowUpDown size={12} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    padding: '5px 8px',
                    color: 'var(--text-main)',
                    fontSize: '0.75rem',
                    outline: 'none'
                  }}
                >
                  <option value="urgency">Urgency First</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Cards List */}
          {filteredActions.length === 0 ? (
            <div style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-subtle)',
              padding: '48px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}>
              <CheckSquare size={36} style={{ color: 'var(--text-muted)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                No actions match your filters
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                Try adjusting your search criteria or resetting the status filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setPriorityFilter('ALL');
                  setSupplierFilter('ALL');
                }}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '8px' }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredActions.map((action) => {
                const normStatus = normalizeActionStatus(action.status);
                const statusStyle = getStatusStyle(normStatus);

                const canSubmit = canTransition(normStatus, ACTION_STATUS.PENDING_APPROVAL);
                const canApprove = canTransition(normStatus, ACTION_STATUS.APPROVED);
                const canReject = canTransition(normStatus, ACTION_STATUS.REJECTED);
                const canStartWork = canTransition(normStatus, ACTION_STATUS.IN_PROGRESS);
                const canComplete = canTransition(normStatus, ACTION_STATUS.COMPLETED);
                const canCancel = canTransition(normStatus, ACTION_STATUS.CANCELLED);

                return (
                  <div
                    key={action.id}
                    className="card"
                    style={{
                      borderLeft: `4px solid ${
                        normStatus === ACTION_STATUS.APPROVED 
                          ? '#10b981' 
                          : normStatus === ACTION_STATUS.PENDING_APPROVAL
                          ? '#f59e0b'
                          : normStatus === ACTION_STATUS.IN_PROGRESS
                          ? '#0ea5e9'
                          : normStatus === ACTION_STATUS.COMPLETED
                          ? '#a855f7'
                          : normStatus === ACTION_STATUS.REJECTED
                          ? '#ef4444'
                          : 'var(--border-subtle)'
                      }`,
                      padding: '18px 22px',
                      backgroundColor: 'var(--bg-card)'
                    }}
                  >
                    {/* Header Row */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      marginBottom: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(14, 165, 233, 0.1)',
                          color: 'var(--teal-primary)'
                        }}>
                          {action.id}
                        </span>

                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg-input)',
                          color: 'var(--text-main)'
                        }}>
                          {action.supplierCode}
                        </span>

                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                          {action.supplierName}
                        </span>

                        <span style={{
                          fontSize: '0.68rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg-input)',
                          color: 'var(--text-secondary)'
                        }}>
                          {action.category}
                        </span>
                      </div>

                      {/* Status & Reviewer Stamp */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: '9999px',
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                          border: `1px solid ${statusStyle.border}`
                        }}>
                          {getStatusLabel(normStatus)}
                        </span>

                        {action.approvedAt && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            Approved: {new Date(action.approvedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Title */}
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                      {action.actionTitle}
                    </h3>

                    {/* Evidence & Blueprint Box */}
                    <div style={{
                      backgroundColor: 'var(--bg-input)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 14px',
                      border: '1px solid var(--border-subtle)',
                      marginBottom: '12px',
                      fontSize: '0.8125rem'
                    }}>
                      <div style={{ color: 'var(--text-main)', marginBottom: '4px' }}>
                        <strong style={{ color: 'var(--teal-light)' }}>Evidence:</strong> {action.evidenceSummary}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                        <strong>Blueprint:</strong> {action.draftDetails}
                      </div>
                    </div>

                    {/* Rejection / Cancellation inline note */}
                    {action.rejectionReason && (
                      <div style={{ fontSize: '0.75rem', color: '#f87171', marginBottom: '10px', fontStyle: 'italic' }}>
                        Rejection reason: "{action.rejectionReason}" ({action.rejectedBy || 'Reviewer'})
                      </div>
                    )}
                    {action.cancellationReason && (
                      <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '10px', fontStyle: 'italic' }}>
                        Cancellation reason: "{action.cancellationReason}" ({action.cancelledBy || 'Reviewer'})
                      </div>
                    )}

                    {/* Impact Bar & Context Controls */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      paddingTop: '8px',
                      borderTop: '1px solid var(--border-subtle)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.78rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#38bdf8' }}>
                          <DollarSign size={14} /> <strong>Impact:</strong> {action.financialValue}
                        </div>
                        <div style={{ color: 'var(--text-muted)' }}>
                          • {action.riskReductionEstimate}
                        </div>
                      </div>

                      {/* Transition Action Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => handleInspectAction(action)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Eye size={12} />
                          Details & Timeline
                        </button>

                        {onInspectSupplierByCode && (
                          <button
                            onClick={() => onInspectSupplierByCode(action.supplierCode)}
                            className="btn btn-subtle btn-sm"
                            style={{ fontSize: '0.75rem' }}
                          >
                            <FileText size={12} />
                            Evidence
                          </button>
                        )}

                        {/* Lifecycle transition buttons */}
                        {canSubmit && (
                          <button
                            onClick={() => handleDirectTransition(action.id, ACTION_STATUS.PENDING_APPROVAL)}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <SendHorizontal size={12} />
                            Submit for Review
                          </button>
                        )}

                        {canApprove && (
                          <button
                            onClick={() => handleDirectTransition(action.id, ACTION_STATUS.APPROVED)}
                            className="btn btn-primary btn-sm"
                            style={{ backgroundColor: '#10b981', borderColor: '#059669', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <CheckCircle2 size={12} />
                            Approve Action
                          </button>
                        )}

                        {canReject && (
                          <button
                            onClick={() => handleOpenReasonModal(action, ACTION_STATUS.REJECTED)}
                            className="btn btn-subtle btn-sm"
                            style={{ color: '#f87171', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <XCircle size={12} />
                            Reject
                          </button>
                        )}

                        {canStartWork && (
                          <button
                            onClick={() => handleDirectTransition(action.id, ACTION_STATUS.IN_PROGRESS)}
                            className="btn btn-primary btn-sm"
                            style={{ backgroundColor: '#0ea5e9', borderColor: '#0284c7', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <PlayCircle size={12} />
                            Start Work
                          </button>
                        )}

                        {canComplete && (
                          <button
                            onClick={() => handleDirectTransition(action.id, ACTION_STATUS.COMPLETED)}
                            className="btn btn-primary btn-sm"
                            style={{ backgroundColor: '#a855f7', borderColor: '#9333ea', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <CheckCircle2 size={12} />
                            Mark Complete
                          </button>
                        )}

                        {canCancel && (
                          <button
                            onClick={() => handleOpenReasonModal(action, ACTION_STATUS.CANCELLED)}
                            className="btn btn-subtle btn-sm"
                            style={{ fontSize: '0.75rem' }}
                          >
                            <Archive size={12} />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-VIEW 2: Append-Only Audit Trail                       */}
      {/* ========================================================= */}
      {activeSubTab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Audit Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            backgroundColor: 'rgba(14, 165, 233, 0.08)',
            border: '1px solid rgba(14, 165, 233, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={20} style={{ color: 'var(--teal-primary)' }} />
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'block' }}>
                  Immutable Demonstration Governance Audit Log
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  All lifecycle transitions and approvals are appended immutably to browser storage with reviewer identities.
                </span>
              </div>
            </div>

            <button
              onClick={handleExportAuditLog}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <Download size={13} />
              Export Audit Trail (JSON)
            </button>
          </div>

          {/* Audit Filter Controls */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            backgroundColor: 'var(--bg-card)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--bg-input)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              minWidth: '240px',
              flex: 1
            }}>
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={auditSearchQuery}
                onChange={(e) => setAuditSearchQuery(e.target.value)}
                placeholder="Search audit events by action ID, actor, reason..."
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-main)',
                  fontSize: '0.78rem',
                  outline: 'none',
                  width: '100%'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Event Type:</span>
              <select
                value={auditEventTypeFilter}
                onChange={(e) => setAuditEventTypeFilter(e.target.value)}
                style={{
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '5px 8px',
                  color: 'var(--text-main)',
                  fontSize: '0.75rem',
                  outline: 'none'
                }}
              >
                <option value="ALL">All Event Types</option>
                <option value="ACTION_CREATED">Action Staged</option>
                <option value="SUBMITTED_FOR_APPROVAL">Submitted for Review</option>
                <option value="ACTION_APPROVED">Executive Approved</option>
                <option value="ACTION_REJECTED">Action Rejected</option>
                <option value="WORK_STARTED">Work Started</option>
                <option value="ACTION_COMPLETED">Action Completed</option>
                <option value="ACTION_CANCELLED">Action Cancelled</option>
              </select>
            </div>
          </div>

          {/* Audit Event Table */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-input)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Event ID & Timestamp</th>
                  <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Event Classification</th>
                  <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Action Reference</th>
                  <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Status Delta</th>
                  <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Actor / Reviewer</th>
                  <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Rationale / Justification</th>
                </tr>
              </thead>
              <tbody>
                {filteredAuditEvents.map((event) => {
                  const eventStyle = getAuditEventStyle(event.eventType);

                  return (
                    <tr 
                      key={event.id}
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block', fontSize: '0.75rem' }}>
                          {event.id}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                          {new Date(event.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                        </span>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: eventStyle.bg,
                          color: eventStyle.text,
                          border: `1px solid ${eventStyle.border}`,
                          whiteSpace: 'nowrap'
                        }}>
                          {eventStyle.label}
                        </span>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ color: 'var(--teal-primary)', fontWeight: 600, display: 'block', fontSize: '0.75rem' }}>
                          {event.actionId} ({event.supplierCode})
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', maxWidth: '220px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {event.actionTitle}
                        </span>
                      </td>

                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {event.fromStatus ? `${getStatusLabel(event.fromStatus)} → ` : '— → '}
                        </span>
                        <strong style={{ color: 'var(--text-main)' }}>
                          {getStatusLabel(event.toStatus)}
                        </strong>
                      </td>

                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={12} style={{ color: 'var(--text-muted)' }} />
                          {event.actor}
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px', fontSize: '0.75rem', color: event.reason ? 'var(--text-main)' : 'var(--text-muted)' }}>
                        {event.reason ? `"${event.reason}"` : <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Standard lifecycle transition</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Detail & Timeline Modal */}
      <ActionDetailModal
        isOpen={isDetailModalOpen}
        action={selectedAction}
        auditLog={auditLog}
        onClose={() => { setIsDetailModalOpen(false); setSelectedAction(null); }}
        onTransitionAction={(actionId, targetStatus) => {
          handleDirectTransition(actionId, targetStatus);
          setIsDetailModalOpen(false);
          setSelectedAction(null);
        }}
        onRequestReasonTransition={(action, targetStatus) => {
          setIsDetailModalOpen(false);
          handleOpenReasonModal(action, targetStatus);
        }}
        onInspectSupplierByCode={onInspectSupplierByCode}
      />

      {/* Mandatory Reason Modal for Rejection / Cancellation */}
      <TransitionReasonModal
        isOpen={reasonModalState.isOpen}
        action={reasonModalState.action}
        targetStatus={reasonModalState.targetStatus}
        onClose={() => setReasonModalState({ isOpen: false, action: null, targetStatus: null })}
        onSubmit={handleReasonSubmit}
      />
    </div>
  );
}
