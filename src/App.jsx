import React, { useState } from 'react';
import './App.css';
import { SUPPLIERS, INITIAL_ACTIONS, INITIAL_ACTIVITY_LOG } from './data/suppliers';
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
import { LoadingState, ErrorBanner } from './components/common/StateViews';

export function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [suppliers] = useState(SUPPLIERS);
  const [decisions, setDecisions] = useState(INITIAL_ACTIONS);
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

  // Approve a Decision
  const handleApproveAction = (actionId) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setDecisions(prev => prev.map(item => {
      if (item.id === actionId) {
        return {
          ...item,
          status: 'Approved',
          approvedAt: `Today at ${timestamp}`
        };
      }
      return item;
    }));

    // Add entry to activity logs
    const action = decisions.find(d => d.id === actionId);
    if (action) {
      const newLog = {
        id: `LOG-${Date.now()}`,
        timestamp: 'Just now',
        supplierCode: action.supplierCode,
        supplierName: action.supplierName,
        severity: 'LOW',
        eventType: 'Procurement Action Approved',
        message: `Executive approval signed for: "${action.actionTitle}". Financial protection: ${action.financialValue}.`,
        source: 'Procurement Console'
      };
      setActivityLogs(prev => [newLog, ...prev]);
      triggerToast(`Approved: "${action.actionTitle}"`);
    }
  };

  // Reject a Decision
  const handleRejectAction = (actionId) => {
    setDecisions(prev => prev.map(item => {
      if (item.id === actionId) {
        return {
          ...item,
          status: 'Rejected'
        };
      }
      return item;
    }));
    triggerToast('Action draft archived as rejected.');
  };

  // Queue a new decision from Analysis Modal or Agent Recommendations
  const handleQueueDecision = (newAction) => {
    setDecisions(prev => [newAction, ...prev]);
    triggerToast(`Intervention queued for ${newAction.supplierCode} into Decisions pipeline.`);
  };

  // Inspect Supplier by Code helper (used by Activity or Decisions view)
  const handleInspectSupplierByCode = (code) => {
    const found = suppliers.find(s => s.code === code || s.shortName.toLowerCase().includes(code.toLowerCase()));
    if (found) {
      setInspectingSupplier(found);
    }
  };

  // Filter suppliers by header search query if present
  const displayedSuppliers = searchQuery.trim()
    ? suppliers.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.suppliedItem.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : suppliers;

  const pendingDecisionsCount = decisions.filter(d => d.status === 'Pending Approval').length;
  const highRiskCount = suppliers.filter(s => s.riskLevel === 'HIGH').length;

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
        supplierCount={suppliers.length}
        highRiskCount={highRiskCount}
        pendingDecisionsCount={pendingDecisionsCount}
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
          suppliers={suppliers}
          onInspectSupplier={setInspectingSupplier}
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
                  onApproveAction={handleApproveAction}
                  onRejectAction={handleRejectAction}
                  onInspectSupplierByCode={handleInspectSupplierByCode}
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
