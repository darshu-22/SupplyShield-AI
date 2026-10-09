# SupplyShield AI — Agentic Supplier Risk Intelligence

> **Phase 3: Explainable Multi-Agent Decision-Support System**

SupplyShield AI is an enterprise supplier intelligence platform designed for procurement directors and supply chain leaders. It monitors supply chain vulnerabilities across quality inspection trends, unauthorized price variance leakage, compliance accreditation cliffs, and factory stockout hazards.

In **Phase 3**, the application introduces an **explainable, multi-agent supplier decision-support system**. It coordinates four specialized logical agents through a central orchestrator to investigate supplier risks, connect cross-signal evidence, formulate actionable interventions, and audit decision priorities under strict human governance.

---

## 1. Multi-Agent Architecture (Phase 3)

The Phase 3 decision engine runs **100% locally and deterministically** without paid APIs, API keys, external servers, or non-deterministic hallucinations. It is organized into four modular logical agents coordinated by a central orchestrator:

```
                          ┌────────────────────────────────┐
                          │     Supplier Master Record     │
                          │   & Relational Transactions    │
                          └───────────────┬────────────────┘
                                          │
                                          ▼
     ┌────────────────────────────────────────────────────────────────────────┐
     │ 1. Risk Investigation Agent (src/agents/riskInvestigationAgent.js)     │
     │    • Audits PO invoices, inspection lots, certificates, and buffers   │
     │    • Identifies primary risk drivers with exact evidence attribution   │
     │    • Assesses evidence strength (ROBUST, MODERATE, INSUFFICIENT)       │
     └────────────────────────────────────┬───────────────────────────────────┘
                                          │
                                          ▼
     ┌────────────────────────────────────────────────────────────────────────┐
     │ 2. Cross-Signal Intelligence Agent (src/agents/crossSignalAgent.js)   │
     │    • Correlates multi-factor convergence without duplicate alerts      │
     │    • Scenarios: Defect + Buffer, Price + POs, Expiry + Sole Source     │
     │    • Determines compound severity and operational impact narrative     │
     └────────────────────────────────────┬───────────────────────────────────┘
                                          │
                                          ▼
     ┌────────────────────────────────────────────────────────────────────────┐
     │ 3. Procurement Recommendation Agent (src/agents/procurementRecAgent.js)│
     │    • Formulates actionable interventions (8D CAPA, price dispute, etc.)│
     │    • Calculates numeric impact metrics only when deterministically safe│
     │    • Mandates requiresHumanApproval = true on ALL recommendations      │
     └────────────────────────────────────┬───────────────────────────────────┘
                                          │
                                          ▼
     ┌────────────────────────────────────────────────────────────────────────┐
     │ 4. Decision Review Agent (src/agents/decisionReviewAgent.js)           │
     │    • Evaluates urgency, evidence integrity, and business impact        │
     │    • Ranks decisions in strict priority order (Rank #1, #2, #3...)     │
     │    • Provides transparent priority rationale and flags missing data    │
     └────────────────────────────────────┬───────────────────────────────────┘
                                          │
                                          ▼
     ┌────────────────────────────────────────────────────────────────────────┐
     │ Decision Orchestrator (src/agents/decisionOrchestrator.js)             │
     │    • Coordinates 4-agent execution sequence                            │
     │    • Returns structured, explainable decision dossiers & telemetry     │
     │    • Builds portfolio-wide ranked intervention queues for human signoff│
     └────────────────────────────────────────────────────────────────────────┘
```

---

## 2. The Four Logical Agents in Detail

### A. Risk Investigation Agent (`src/agents/riskInvestigationAgent.js`)
- **Scope**: Evaluates all 5 operational vectors (Quality, Pricing, Delivery, Compliance, Inventory Continuity) plus supplier dependency.
- **Evidence Verification**: Attributes exact lot numbers (`LOT-QA-908`, `910`, `912`), purchase order numbers (`PO-2026-0810`, `0922`, `1004`), and registrar certificate identifiers (`AS-9100-8841`).
- **Integrity Classification**: Categorizes evidence as `ROBUST` (multiple transaction records), `MODERATE` (limited baseline data), or `INSUFFICIENT` (missing inspection lots).
- **Zero Hallucination Guarantee**: Strictly extracts verified facts from relational transaction tables; never invents metrics.

### B. Cross-Signal Intelligence Agent (`src/agents/crossSignalAgent.js`)
- **Scope**: Scans for systemic multi-factor convergence where isolated telemetry signals compound into critical hazards.
- **Key Scenarios Detected**:
  1. **Quality Spike + Buffer Deficit**: Rejection rate spike ($>4\%$) on a critical component with stock coverage below safety target. Identifies imminent assembly line-stop threat.
  2. **Commercial Leakage Across Repeated Invoices**: Unauthorized price variance ($+7.4\%$) verified across repeated purchase orders, quantifying exact unapproved dollar leakage ($\$74,000$).
  3. **Accreditation Expiry Cliff + Sole Source**: Mandatory certificate lapsing within $\le 30$ days with 0 secondary sources qualified, highlighting regulatory receiving dock-hold barriers.
  4. **Logistics Fulfillment Slippage + Lead-Time Gap**: Delivery fulfillment $<75\%$ opening an unmitigated replenishment gap where consumption outpaces delivery.
- **Deduplication**: Enforces strict scenario deduplication, preventing contradictory or repetitive alerts.

### C. Procurement Recommendation Agent (`src/agents/procurementRecommendationAgent.js`)
- **Scope**: Converts diagnostic findings into concrete, structured intervention blueprints.
- **Action Types**:
  - Issue 8D CAPA & mandate Level-II dock inspections.
  - Dispute contract price variance & freeze unapproved surcharges.
  - Issue 48-hour accreditation cure notice with registrar attestation demands.
  - Expedite buffer replenishment & qualify pre-screened standby sources.
  - Mandate logistics transit recovery plans for degraded delivery schedules.
- **Structure of Every Recommendation**:
  - `recommendationId`, `title`, `category`, `supplierId`, `supplierCode`, `supplierName`
  - `priority` (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) and `urgency` (`IMMEDIATE_48H`, `HIGH_72H`, `WEEKLY_CYCLE`)
  - `evidence` (array of specific supporting transactional facts)
  - `reason` (detailed operational justification)
  - `expectedImpact` (with numeric impact metrics only when deterministically calculable, e.g., "$\\\$74,000$ direct cash recovery", "Restores stock coverage from 14d to 35d safety target")
  - `suggestedNextStep` (concrete tactical procurement action)
  - `requiresHumanApproval: true` (mandatory safety guardrail).

### D. Decision Review Agent (`src/agents/decisionReviewAgent.js`)
- **Scope**: Audits and scores proposed recommendations against multi-criteria governance rules.
- **Scoring & Ranking**:
  - Evaluates severity weight ($40$ pts), urgency window ($30$ pts), evidence integrity ($20$ pts), and business exposure.
  - Ranks actions into a prioritized execution queue (Rank #1, #2, #3...).
  - Generates transparent, human-readable `priorityRationale` explaining why Rank #1 was assigned over other actions.
- **Evidence Integrity Safeguard**: Flags any action with incomplete data (`FLAGGED_INSUFFICIENT_EVIDENCE`) rather than presenting assumptions as facts.
- **Governance Mandate**: Enforces `approvalStatus: "PENDING_EXECUTIVE_APPROVAL"` on every proposed action.

---

## 3. Decision Orchestrator (`src/agents/decisionOrchestrator.js`)

The orchestrator executes the 4-agent pipeline sequentially:
1. `orchestrateSupplierDecision(supplier)`: Generates an immutable, explainable decision dossier containing agent execution telemetry, findings, compound hazards, and ranked decisions.
2. `orchestrateAllSuppliers(suppliers)`: Executes batch analysis across the portfolio, constructing a consolidated ranked decision queue and supplier risk hierarchy.

---

## 4. UI Integration & User Experience

Phase 3 seamlessly enriches the existing dark navy/cyan visual interface:

1. **Agentic Intelligence Section on Overview**:
   - **Pipeline Telemetry Bar**: Real-time status cards for each of the 4 logical agents with findings counts, execution times, and completion checkmarks.
   - **Ranked Supplier Risks Requiring Attention**: High-risk supplier queue displaying primary risk drivers, composite scores, and quick dossier launchers.
   - **Prioritized Action Blueprints**: Top portfolio interventions reviewed by Agent D with calculable financial impact badges, priority rationale, and a direct **"Queue to Decisions Pipeline"** button.
2. **Supplier Decision Dossier Modal (`src/components/agentic/AgentInvestigationReportModal.jsx`)**:
   - Accessible from any supplier row or detail drawer.
   - Contains 3 dedicated audit tabs:
     - *Reviewed Decisions & Actions*: Ranked interventions with governance notices and one-click staging.
     - *Cross-Signal Convergence*: Multi-factor hazard patterns and business impacts.
     - *Investigation Findings*: Raw transactional findings with observed facts and evidence strength.
   - Quick navigation into the Evidence Explorer and What-If Simulator.
3. **Decisions View Integration**:
   - Staged agent interventions seamlessly flow into the existing human-in-the-loop approval workflow where managers can inspect evidence, sign off, or reject actions.

---

## 5. Mathematical Calculation Formulas (Phase 2 & 3)

| Metric | Mathematical Formula | Purpose & Safeguards |
|---|---|---|
| **Quality Rejection Rate** | $\text{Rate} = \left(\frac{\sum \text{Rejected Units}}{\sum \text{Inspected Units}}\right) \times 100$ | Safely returns $0.0\%$ when inspected count is zero. |
| **Contract Price Variance** | $\text{Variance} = \left(\frac{\text{Actual Billed Rate} - \text{Contract Rate}}{\text{Contract Rate}}\right) \times 100$ | Detects unapproved raw material and energy surcharge markups. |
| **Audited Overpayment** | $\text{Overpayment} = \sum \left[ \max(0, \text{Actual Rate} - \text{Contract Rate}) \times \text{Units Ordered} \right]$ | Only accrues positive commercial overcharges; zero when compliant. |
| **On-Time Delivery Rate (OTIF)** | $\text{OTIF} = \left(\frac{\text{Deliveries On-Time}}{\text{Total Completed Shipments}}\right) \times 100$ | Compares actual delivery date against contractual SLA date. |
| **Stock Coverage** | $\text{Coverage Days} = \frac{\text{Current On-Hand Units}}{\text{Average Daily Factory Demand}}$ | Quantifies days of factory operation remaining before stockout. |
| **Lead-Time Coverage Gap** | $\text{Gap Days} = \text{Stock Coverage Days} - \text{Replenishment Lead Time Days}$ | Negative values represent an unmitigated replenishment gap. |
| **Composite Risk Score** | $\text{Score} = (Q \times 0.25) + (P \times 0.20) + (D \times 0.20) + (C \times 0.15) + (I \times 0.20)$ | Normalized weighted sum producing a calibrated score between $0$ and $100$. |

---

## 6. Safety & Human Governance Guarantees

- **Decision Support, Not Autonomous Action**: SupplyShield AI is a decision-support platform. It **never** automatically contacts suppliers, alters ERP purchase orders, or disburses payments.
- **Mandatory Human Sign-Off**: Every recommendation generated by Agent C and audited by Agent D explicitly requires human sign-off (`requiresHumanApproval = true`).
- **Explainable Rationale**: Every ranking and priority score includes a transparent rationale citing the specific transactions and operational hazards that triggered it.
- **Deterministic & Local**: Fully offline, deterministic execution with zero third-party dependencies, API keys, or cloud LLM costs.

---

## 7. Automated Test Suite (`tests/run-tests.js`)

Run the test suite with:
```bash
npm test
```

The test runner executes **76 automated unit tests** across Phase 2 and Phase 3:

```
=======================================================
 SupplyShield AI — Phase 2 Risk Engine Verification
=======================================================
[0. Risk Methodology Configuration & Calibration] (4 tests)
[1. Quality Rejection Rate Calculations] (6 tests)
[2. Price Variance & Potential Overpayment Calculations] (6 tests)
[3. Delivery Performance (OTIF) & Delay Calculations] (3 tests)
[4. Compliance & Certificate Expiry Countdown Tests] (3 tests)
[5. Stock Coverage & Lead-Time Coverage Gap Tests] (4 tests)
[6. Composite Multi-Vector Risk Score Engine] (4 tests)
[7. Cross-Signal Scenario Intelligence Engine] (4 tests)
[8. Interactive What-If Simulator Tests] (4 tests)

=======================================================
 SupplyShield AI — Phase 3 Agentic Engine Verification
=======================================================
[9. Agent A: Risk Investigation Agent Tests]
  ✓ PASS: Completes investigation with status COMPLETED
  ✓ PASS: Produces comprehensive findings across operational vectors
  ✓ PASS: Identifies elevated primary risk drivers
  ✓ PASS: Investigates commercial price vector
  ✓ PASS: Attributes exact discrepant PO records
  ✓ PASS: Verifies exact $74,000 overpayment from POs
  ✓ PASS: Handles sparse/missing records gracefully
  ✓ PASS: Flags missing lots as INSUFFICIENT evidence

[10. Agent B: Cross-Signal Intelligence Agent Tests]
  ✓ PASS: Completes cross-signal analysis with status COMPLETED
  ✓ PASS: Detects at least 3 compound cross-signal scenarios on Supplier A
  ✓ PASS: Detects Scenario 1: High defect rate + critical part + low stock buffer
  ✓ PASS: Detects Scenario 2: Unauthorized price variance + repeated POs
  ✓ PASS: Detects Scenario 3: Expiring compliance certificate + sole-source dependency
  ✓ PASS: Enforces deduplication with zero duplicate alert IDs

[11. Agent C: Procurement Recommendation Agent Tests]
  ✓ PASS: Completes recommendations with status COMPLETED
  ✓ PASS: Generates multiple actionable interventions
  ✓ PASS: Strictly enforces requiresHumanApproval = true on ALL recommendations
  ✓ PASS: Generates commercial dispute recommendation
  ✓ PASS: Commercial recommendation has calculable numeric impact
  ✓ PASS: Commercial impact explicitly references $74,000 cash recovery

[12. Agent D: Decision Review Agent Tests]
  ✓ PASS: Completes review with status COMPLETED
  ✓ PASS: Reviews and audits all proposed recommendations
  ✓ PASS: Assigns Rank 1 to top priority action
  ✓ PASS: Strictly sorts decisions in descending order of audit score
  ✓ PASS: Identifies highest urgency decision
  ✓ PASS: Provides explainable priority rationale
  ✓ PASS: Mandates PENDING_EXECUTIVE_APPROVAL

[13. Deterministic Output & Reproducibility Tests]
  ✓ PASS: Both orchestrations complete successfully
  ✓ PASS: Identical number of decisions generated across runs
  ✓ PASS: Identical Rank #1 decision selected across independent runs
  ✓ PASS: Identical audit scores computed deterministically

[14. End-to-End Decision Orchestrator Tests]
  ✓ PASS: Tracks execution across all 4 logical agents
  ✓ PASS: All 4 logical agents succeed in sequence
  ✓ PASS: Exposes topPriorityAction in dossier
  ✓ PASS: Processes all 6 suppliers in portfolio orchestrator
  ✓ PASS: Builds consolidated ranked decision queue
  ✓ PASS: Portfolio ranked decisions start at Rank 1

=======================================================
 Test Execution Summary: 76 Passed, 0 Failed
=======================================================
```

---

## 8. Available NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts Vite local development server at `http://localhost:5173` |
| `npm test` | Runs the 76-test suite verifying calculations, agents, and orchestrator |
| `npm run lint` | Runs `oxlint` across all project files (0 warnings, 0 errors) |
| `npm run build` | Compiles production assets into `dist/` bundle |
| `npm run preview` | Previews the production build locally |

---

## 9. Project Directory Structure

```
SupplyShield AI/
├── index.html                   # HTML entry point, typography & metadata
├── package.json                 # Scripts: dev, build, lint, test
├── package-lock.json            # Deterministic dependency lockfile
├── vite.config.js               # Vite bundler configuration
├── .oxlintrc.json               # Oxlint linter configuration
├── .gitignore                   # Excludes node_modules, dist, .env
├── README.md                    # Complete project documentation
├── tests/
│   └── run-tests.js             # 76 automated tests for risk engine & agents
├── src/
│   ├── main.jsx                 # React root bootstrap
│   ├── App.jsx                  # Main application orchestrator & modal state
│   ├── index.css                # Global design system tokens, typography, dark navy theme
│   ├── App.css                  # Animations, responsive breakpoints & micro-interactions
│   ├── agents/                  # Multi-agent decision engine (Phase 3)
│   │   ├── riskInvestigationAgent.js       # Agent A: Transaction & evidence auditor
│   │   ├── crossSignalAgent.js             # Agent B: Multi-vector convergence detector
│   │   ├── procurementRecommendationAgent.js # Agent C: Actionable intervention designer
│   │   ├── decisionReviewAgent.js          # Agent D: Priority auditor & governance gate
│   │   └── decisionOrchestrator.js         # Central coordinator & portfolio ranker
│   ├── engine/
│   │   └── riskEngine.js        # Pure deterministic multi-vector calculation engine
│   ├── data/
│   │   ├── transactionRecords.js# Relational tables: POs, dock inspections, certs, inventory
│   │   └── suppliers.js         # Compiled suppliers with linked records & decisions
│   └── components/
│       ├── common/
│       │   ├── Badge.jsx        # RiskBadge, CertificateBadge, CriticalityBadge
│       │   └── StateViews.jsx   # LoadingState, EmptyState, ErrorBanner
│       ├── layout/
│       │   ├── Header.jsx       # Header with search, methodology button, notifications
│       │   ├── Sidebar.jsx      # Navigation sidebar with counter badges
│       │   └── NotificationDropdown.jsx # Header notification popover
│       ├── dashboard/
│       │   ├── SummaryCards.jsx # Calculated KPI cards (Overpayment, Lead-Time Deficits)
│       │   └── RiskDistribution.jsx # Risk breakdown bar & Supplier A spotlight
│       ├── agentic/             # Agentic UI components (Phase 3)
│       │   ├── AgenticIntelligenceSection.jsx   # Overview dashboard intelligence section
│       │   └── AgentInvestigationReportModal.jsx# Comprehensive supplier decision dossier
│       ├── suppliers/
│       │   ├── SupplierTable.jsx       # Table with lead-time gap and action triggers
│       │   ├── SupplierDetailModal.jsx # Detail drawer with agent dossier launcher
│       │   └── SupplierAnalysisModal.jsx # Diagnostic modal with action drafting
│       ├── evidence/
│       │   └── EvidenceExplorerModal.jsx # 5-tab granular audit trail modal
│       ├── simulator/
│       │   └── RiskSimulatorModal.jsx    # Interactive What-If sensitivity simulator
│       ├── methodology/
│       │   └── MethodologyModal.jsx      # Scoring equations and weights modal
│       └── views/
│           ├── OverviewView.jsx     # Executive command dashboard with Agentic Section
│           ├── SuppliersView.jsx    # Master supplier directory with CSV export
│           ├── RiskAnalysisView.jsx # Multi-vector risk view with Cross-Signal cards
│           ├── DecisionsView.jsx    # Human-in-the-loop approval workflow
│           └── ActivityView.jsx     # Immutable telemetry event stream
```

---

## 10. Limitations of Simulated Data

- **Demonstration Scope**: All supplier records, part numbers, facilities, contracts, metrics, and price variances are realistic, synthetic demonstration data. They do not represent actual companies or commercial agreements.
- **Rules-Based Agentic System**: The four agents operate through deterministic algorithms, transactional data cross-referencing, and mathematical scoring models. They do not invoke remote LLM inference APIs.
- **Session State**: Interactive decisions (such as approving or rejecting recommendations) are stored in-memory during the browser session.
