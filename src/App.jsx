import React, { useState } from 'react';
import './App.css';
import { SUPPLIERS, INITIAL_ACTIVITY_LOG } from './data/suppliers';
import { 
  ACTION_STATUS, 
  DEFAULT_REVIEWER, 
  normalizeActionStatus, 
  getStatusLabel,
  transitionAction,
  findExistingActiveAction 
} from './workflow/actionLifecycleService';
import { 
  createAuditEvent, 
  appendAuditEvent, 
  AUDIT_EVENT_TYPE,
  getEventTypeForStatus 
} from './workflow/auditService';
import { 
  loadPersistedActions, 
  savePersistedActions, 
  loadPersistedAuditLog, 
  savePersistedAuditLog, 
  generateStableActionId,
  resetToInitialSeeds 
} from './workflow/persistenceService';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewView } from './components/views/OverviewView';
import { SuppliersView } from './components/views/SuppliersView';
import { RiskAnalysisView } from './components/views/RiskAnalysisView';
import { DecisionsView } from './components/views/DecisionsView';
import { ActivityView } from './components/views/ActivityView';
import { SupplierDetailModal } from './components/suppliers/SupplierDetailModal';
import { SupplierAnalysisModal } from './components/suppliers/SupplierAnalysisModal';
import { EvidenceExplorerModal } from './components/evidence/EvidenceExplorerModal';
import { RiskSimulatorModal } from './components/simulator/RiskSimulatorModal';
import { MethodologyModal } from './components/methodology/MethodologyModal';
import { AgentInvestigationReportModal } from './components/agentic/AgentInvestigationReportModal';
import { AssistantView } from './components/assistant/AssistantView';
import { ImportAnalyzeView } from './components/views/ImportAnalyzeView';
import { 
  loadPersistedUploadedDataset, 
  savePersistedUploadedDataset, 
  clearPersistedUploadedDataset, 
  loadActiveDatasetMode, 
  saveActiveDatasetMode, 
  DATASET_MODE 
} from './import/datasetStorage';
import { LoadingState, ErrorBanner } from './components/common/StateViews';

export function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeDatasetMode, setActiveDatasetMode] = useState(() => loadActiveDatasetMode());
  const [uploadedDataset, setUploadedDataset] = useState(() => loadPersistedUploadedDataset());

  // Active dataset suppliers: strictly separates demo data from uploaded data
  const activeSuppliers = (activeDatasetMode === DATASET_MODE.UPLOADED && uploadedDataset?.suppliers?.length > 0)
    ? uploadedDataset.suppliers
    : SUPPLIERS;

  const [decisions, setDecisions] = useState(() => loadPersistedActions());
  const [auditLog, setAuditLog] = useState(() => loadPersistedAuditLog());
  const [currentReviewer, setCurrentReviewer] = useState(DEFAULT_REVIEWER);
  const [activityLogs, setActivityLogs] = useState(INITIAL_ACTIVITY_LOG);

  // Filters & Search
  const [currentRiskFilter, setCurrentRiskFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Panels
  const [inspectingSupplier, setInspectingSupplier] = useState(null);
  const [analysingSupplier, setAnalysingSupplier] = useState(null);
  const [evidenceSupplier, setEvidenceSupplier] = useState(null);
  const [simulatorSupplier, setSimulatorSupplier] = useState(null);
  const [agentReportSupplier, setAgentReportSupplier] = useState(null);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);

  // Layout & UI States
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Show quick toast notification
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Simulate Refresh Telemetry
  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    setTimeout(() => {
      setIsLoading(false);
      triggerToast('Telemetry synchronized successfully. Risk scores recalculated from source records.');
    }, 650);
  };

  // Toggle Error State (To satisfy error state testing & inspection requirement)
  const handleToggleError = () => {
    setHasError(!hasError);
  };

  // Transition an action across permitted lifecycle states
  const handleTransitionAction = (actionId, targetStatus, { reason = '', reviewer = currentReviewer } = {}) => {
    const targetAction = decisions.find(d => d.id === actionId);
    if (!targetAction) return;

    try {
      const updatedAction = transitionAction(targetAction, targetStatus, {
        reason,
        reviewer,
        timestamp: new Date().toISOString()
      });

      const updatedDecisions = decisions.map(d => d.id === actionId ? updatedAction : d);
      setDecisions(updatedDecisions);
      savePersistedActions(updatedDecisions);

      // Append immutable audit event
      const eventType = getEventTypeForStatus(targetStatus);
      const newAuditEvent = createAuditEvent({
        actionId: targetAction.id,
        actionTitle: targetAction.actionTitle,
        supplierCode: targetAction.supplierCode,
        eventType,
        fromStatus: targetAction.status,
        toStatus: targetStatus,
        actor: reviewer,
        reason: reason || null,
        evidenceReferences: targetAction.evidenceSummary
      });

      const updatedAudit = appendAuditEvent(auditLog, newAuditEvent);
      setAuditLog(updatedAudit);
      savePersistedAuditLog(updatedAudit);

      // Also append to activity logs stream
      const newLog = {
        id: `LOG-${Date.now()}`,
        timestamp: 'Just now',
        supplierCode: targetAction.supplierCode,
        supplierName: targetAction.supplierName,
        severity: targetStatus === ACTION_STATUS.REJECTED ? 'MEDIUM' : 'LOW',
        eventType: `Action ${getStatusLabel(targetStatus)}`,
        message: `${reviewer}: "${targetAction.actionTitle}" transitioned to ${getStatusLabel(targetStatus)}${reason ? ` (${reason})` : ''}.`,
        source: 'Decision Center Governance'
      };
      setActivityLogs(prev => [newLog, ...prev]);

      triggerToast(`Action ${targetAction.id} transitioned to "${getStatusLabel(targetStatus)}".`);
    } catch (err) {
      triggerToast(`Transition Error: ${err.message}`);
    }
  };

  const handleApproveAction = (actionId) => {
    handleTransitionAction(actionId, ACTION_STATUS.APPROVED, { reviewer: currentReviewer });
  };

  const handleRejectAction = (actionId, reason = 'Rejected by executive reviewer') => {
    handleTransitionAction(actionId, ACTION_STATUS.REJECTED, { reason, reviewer: currentReviewer });
  };

  // Queue a new decision from Analysis Modal, Assistant, or Agent Recommendations with duplicate check
  const handleQueueDecision = (newAction) => {
    // Check if an active matching action already exists
    const existing = findExistingActiveAction(decisions, newAction);
    if (existing) {
      triggerToast(`Active action already exists: "${existing.actionTitle}" (${existing.id}, ${getStatusLabel(existing.status)}). Opening Decision Center.`);
      setActiveTab('decisions');
      return existing;
    }

    const assignedId = newAction.id && !decisions.some(d => d.id === newAction.id)
      ? newAction.id
      : generateStableActionId(decisions);

    const targetStatus = newAction.status 
      ? normalizeActionStatus(newAction.status) 
      : ACTION_STATUS.PENDING_APPROVAL;

    const stagedAction = {
      ...newAction,
      id: assignedId,
      status: targetStatus,
      requiresHumanApproval: true,
      createdAt: new Date().toISOString(),
      lastModifiedAt: new Date().toISOString(),
      isDemoSeed: false
    };

    const updatedDecisions = [stagedAction, ...decisions];
    setDecisions(updatedDecisions);
    savePersistedActions(updatedDecisions);

    // Staging audit event
    const auditEvent = createAuditEvent({
      actionId: assignedId,
      actionTitle: stagedAction.actionTitle,
      supplierCode: stagedAction.supplierCode,
      eventType: targetStatus === ACTION_STATUS.PENDING_APPROVAL 
        ? AUDIT_EVENT_TYPE.SUBMITTED_FOR_APPROVAL 
        : AUDIT_EVENT_TYPE.ACTION_CREATED,
      fromStatus: null,
      toStatus: targetStatus,
      actor: currentReviewer,
      reason: stagedAction.whyRecommended || 'Staged from agent decision intelligence',
      evidenceReferences: stagedAction.evidenceSummary
    });

    const updatedAudit = appendAuditEvent(auditLog, auditEvent);
    setAuditLog(updatedAudit);
    savePersistedAuditLog(updatedAudit);

    triggerToast(`Intervention staged for ${stagedAction.supplierCode} (${assignedId}) as ${getStatusLabel(targetStatus)}.`);
    return stagedAction;
  };

  const handleResetActions = () => {
    const { actions: seedA, auditLog: seedAud } = resetToInitialSeeds();
    setDecisions(seedA);
    setAuditLog(seedAud);
    triggerToast('Decision Center reset to initial demo seeds and audit log.');
  };

  // Uploaded Dataset Handlers
  const handleSaveUploadedDataset = (dataset) => {
    setUploadedDataset(dataset);
    savePersistedUploadedDataset(dataset);
    setActiveDatasetMode(DATASET_MODE.UPLOADED);
    saveActiveDatasetMode(DATASET_MODE.UPLOADED);
    triggerToast(`Uploaded dataset saved and activated (${dataset.suppliers?.length || 0} vendors analyzed).`);
  };

  const handleClearUploadedDataset = () => {
    clearPersistedUploadedDataset();
    setUploadedDataset(null);
    setActiveDatasetMode(DATASET_MODE.DEMO);
    saveActiveDatasetMode(DATASET_MODE.DEMO);
    triggerToast('Uploaded dataset removed. Switched back to Demo Dataset.');
  };

  const handleSetActiveDatasetMode = (mode) => {
    setActiveDatasetMode(mode);
    saveActiveDatasetMode(mode);
    triggerToast(`Active context switched to ${mode === 'uploaded' ? 'Uploaded' : 'Demo'} Dataset.`);
  };

  const handleToggleDatasetMode = () => {
    if (activeDatasetMode === DATASET_MODE.DEMO) {
      if (uploadedDataset?.suppliers?.length > 0) {
        handleSetActiveDatasetMode(DATASET_MODE.UPLOADED);
      } else {
        setActiveTab('import');
        triggerToast('No uploaded dataset found. Please import vendor data first.');
      }
    } else {
      handleSetActiveDatasetMode(DATASET_MODE.DEMO);
    }
  };

  // Inspect Supplier by Code helper (used by Activity or Decisions view)
  const handleInspectSupplierByCode = (code) => {
    const found = activeSuppliers.find(s => s.code === code || s.id === code || s.shortName.toLowerCase().includes(code.toLowerCase()));
    if (found) {
      setInspectingSupplier(found);
    }
  };

  // Filter suppliers by header search query if present
  const displayedSuppliers = searchQuery.trim()
    ? activeSuppliers.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.suppliedItem && s.suppliedItem.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : activeSuppliers;

  const pendingDecisionsCount = decisions.filter(d => normalizeActionStatus(d.status) === ACTION_STATUS.PENDING_APPROVAL).length;
  const highRiskCount = activeSuppliers.filter(s => s.riskLevel === 'HIGH' || s.riskLevel === 'CRITICAL').length;

  return (
    <div className="app-layout">
      {/* Toast Notification Bar */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'var(--bg-card-elevated)',
          color: '#ffffff',
          border: '1px solid var(--teal-primary)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 20px',
          boxShadow: 'var(--shadow-lg), var(--shadow-teal)',
          zIndex: 2000,
          fontSize: '0.875rem',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeIn 0.2s ease'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          {toastMessage}
        </div>
      )}

      {/* Persistent Left Sidebar */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        supplierCount={activeSuppliers.length}
        highRiskCount={highRiskCount}
        pendingDecisionsCount={pendingDecisionsCount}
        activeDatasetMode={activeDatasetMode}
        uploadedCount={uploadedDataset?.suppliers?.length || 0}
      />

      {/* Main Workspace Area */}
      <div className="main-wrapper">
        <Header 
          activeTab={activeTab}
          setIsMobileOpen={setIsMobileOpen}
          onRefresh={handleRefresh}
          isLoading={isLoading}
          hasError={hasError}
          onToggleError={handleToggleError}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenMethodology={() => setIsMethodologyOpen(true)}
          suppliers={activeSuppliers}
          onInspectSupplier={setInspectingSupplier}
          activeDatasetMode={activeDatasetMode}
          onToggleDatasetMode={handleToggleDatasetMode}
          hasUploadedDataset={Boolean(uploadedDataset?.suppliers?.length)}
          onNavigateTab={setActiveTab}
        />

        <main className="content-container">
          {/* Simulated Error State Inspection Banner */}
          {hasError && (
            <ErrorBanner 
              title="Telemetry Feed Exception (Simulated)"
              error="Supplier metrics telemetry stream encountered a synthetic timeout while querying ERP pricing schedules. All displayed metrics reflect cached local state."
              onRetry={() => {
                setHasError(false);
                handleRefresh();
              }}
            />
          )}

          {/* Loading State or Tab Content */}
          {isLoading ? (
            <LoadingState message="Recalculating supplier risk matrices, invoice variances, and stock coverage buffers..." />
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewView 
                  suppliers={displayedSuppliers}
                  onInspectSupplier={setInspectingSupplier}
                  onAnalyseSupplier={setAnalysingSupplier}
                  onOpenEvidence={setEvidenceSupplier}
                  onOpenSimulator={setSimulatorSupplier}
                  onOpenAgentReport={setAgentReportSupplier}
                  onQueueDecision={handleQueueDecision}
                  currentRiskFilter={currentRiskFilter}
                  onSelectRiskFilter={setCurrentRiskFilter}
                  pendingActionsCount={pendingDecisionsCount}
                  onNavigateTab={setActiveTab}
                  activeDatasetMode={activeDatasetMode}
                />
              )}

              {activeTab === 'import' && (
                <ImportAnalyzeView 
                  uploadedDataset={uploadedDataset}
                  activeDatasetMode={activeDatasetMode}
                  onSaveUploadedDataset={handleSaveUploadedDataset}
                  onClearUploadedDataset={handleClearUploadedDataset}
                  onSetActiveDatasetMode={handleSetActiveDatasetMode}
                  onQueueDecision={handleQueueDecision}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === 'assistant' && (
                <AssistantView 
                  suppliers={displayedSuppliers}
                  onInspectSupplier={setInspectingSupplier}
                  onQueueDecision={handleQueueDecision}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === 'suppliers' && (
                <SuppliersView 
                  suppliers={displayedSuppliers}
                  onInspectSupplier={setInspectingSupplier}
                  onAnalyseSupplier={setAnalysingSupplier}
                  onOpenEvidence={setEvidenceSupplier}
                  onOpenSimulator={setSimulatorSupplier}
                  currentRiskFilter={currentRiskFilter}
                  onSelectRiskFilter={setCurrentRiskFilter}
                />
              )}

              {activeTab === 'risk' && (
                <RiskAnalysisView 
                  suppliers={displayedSuppliers}
                  onInspectSupplier={setInspectingSupplier}
                  onAnalyseSupplier={setAnalysingSupplier}
                  onOpenEvidence={setEvidenceSupplier}
                  onOpenSimulator={setSimulatorSupplier}
                />
              )}

              {activeTab === 'decisions' && (
                <DecisionsView 
                  actions={decisions}
                  auditLog={auditLog}
                  currentReviewer={currentReviewer}
                  onChangeReviewer={setCurrentReviewer}
                  onTransitionAction={handleTransitionAction}
                  onApproveAction={handleApproveAction}
                  onRejectAction={handleRejectAction}
                  onInspectSupplierByCode={handleInspectSupplierByCode}
                  onResetToDemoData={handleResetActions}
                />
              )}

              {activeTab === 'activity' && (
                <ActivityView 
                  logs={activityLogs}
                  onInspectSupplierByCode={handleInspectSupplierByCode}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Supplier Detail Panel Modal */}
      {inspectingSupplier && (
        <SupplierDetailModal 
          supplier={inspectingSupplier}
          onClose={() => setInspectingSupplier(null)}
          onOpenAnalysis={(supp) => setAnalysingSupplier(supp)}
          onOpenEvidence={(supp) => setEvidenceSupplier(supp)}
          onOpenSimulator={(supp) => setSimulatorSupplier(supp)}
          onOpenAgentReport={(supp) => setAgentReportSupplier(supp)}
        />
      )}

      {/* Preliminary Supplier Analysis Modal */}
      {analysingSupplier && (
        <SupplierAnalysisModal 
          supplier={analysingSupplier}
          onClose={() => setAnalysingSupplier(null)}
          onQueueDecision={handleQueueDecision}
          onOpenSimulator={(supp) => setSimulatorSupplier(supp)}
        />
      )}

      {/* Evidence Explorer Modal */}
      {evidenceSupplier && (
        <EvidenceExplorerModal 
          supplier={evidenceSupplier}
          onClose={() => setEvidenceSupplier(null)}
          onOpenSimulator={(supp) => {
            setEvidenceSupplier(null);
            setSimulatorSupplier(supp);
          }}
        />
      )}

      {/* Interactive What-If Risk Simulator Modal */}
      {simulatorSupplier && (
        <RiskSimulatorModal 
          supplier={simulatorSupplier}
          onClose={() => setSimulatorSupplier(null)}
          onStagePlan={(plan) => {
            setDecisions(prev => [plan, ...prev]);
            triggerToast(`Hypothetical simulation staged: "${plan.actionTitle}"`);
            setActiveTab('decisions');
          }}
        />
      )}

      {/* Agent Investigation Report Dossier Modal */}
      {agentReportSupplier && (
        <AgentInvestigationReportModal 
          supplier={agentReportSupplier}
          onClose={() => setAgentReportSupplier(null)}
          onOpenEvidence={(supp) => {
            setAgentReportSupplier(null);
            setEvidenceSupplier(supp);
          }}
          onOpenSimulator={(supp) => {
            setAgentReportSupplier(null);
            setSimulatorSupplier(supp);
          }}
          onQueueDecision={handleQueueDecision}
        />
      )}

      {/* Risk Scoring Methodology Modal */}
      <MethodologyModal 
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />
    </div>
  );
}

export default App;
