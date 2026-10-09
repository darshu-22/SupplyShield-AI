# SupplyShield AI — Agentic Supplier Risk Intelligence

> **Phase 4: AI Procurement Assistant & What-If Intelligence**

SupplyShield AI is an enterprise supplier intelligence platform designed for procurement directors and supply chain leaders. It monitors supply chain vulnerabilities across quality inspection trends, unauthorized price variance leakage, compliance accreditation cliffs, and factory stockout hazards.

In **Phase 4**, the platform introduces an interactive **AI Procurement Assistant & What-If Intelligence Engine**. Users can query the supplier portfolio in natural language, receive evidence-backed explanations citing actual transactional records (POs, inspection lots, certificates), and execute hypothetical risk mitigation scenarios with deterministic, non-mutating risk recalculation. All operations run 100% locally and deterministically.

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
- **Mandatory Human Sign-Off**: Every recommendation generated by Agent C, audited by Agent D, or proposed by the Assistant explicitly requires human sign-off (`requiresHumanApproval = true`).
- **Explainable Rationale**: Every ranking and priority score includes a transparent rationale citing the specific transactions and operational hazards that triggered it.
- **Deterministic & Local**: Fully offline, deterministic execution with zero third-party dependencies, API keys, or cloud LLM costs.

---

## 7. AI Procurement Assistant & What-If Intelligence (Phase 4)

Phase 4 introduces an interactive conversational intelligence layer designed specifically for supply chain professionals. Users can query the supplier portfolio in natural language, investigate specific evidence, compare contract variances, and evaluate hypothetical risk mitigation scenarios.

```
                           ┌─────────────────────────────────────────┐
                           │      Natural Language User Inquiry      │
                           │   ("What if we increase safety stock?") │
                           └────────────────────┬────────────────────┘
                                                │
                                                ▼
                           ┌─────────────────────────────────────────┐
                           │   Intent Router & Entity Recognizer     │
                           │     (src/assistant/intentRouter.js)     │
                           │   • 12 intent categories                │
                           │   • Codes, names, IDs & part aliases    │
                           │   • Ambiguity detector & clarifier      │
                           └────────────────────┬────────────────────┘
                                                │
                                                ▼
     ┌────────────────────────────────────────────────────────────────────────┐
     │ Assistant Orchestration Service (src/assistant/assistantService.js)    │
     │   • Queries transactional dataset & Phase 3 decision orchestrator      │
     │   • Formulates 4-part evidence dossiers (Facts, Risks, Recs, Citations)│
     │   • Transparent adapter pattern for future LLM integration             │
     └────────────────────────────────────┬───────────────────────────────────┘
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    ▼                                           ▼
┌───────────────────────────────────────┐   ┌───────────────────────────────────────┐
│     What-If Scenario Service          │   │      Procurement Assistant UI         │
│  (src/assistant/scenarioService.js)   │   │(src/components/assistant/             │
│ • Pure copy-on-write simulation       │   │ AssistantView.jsx)                    │
│ • Delta & category transition calc    │   │ • Dark navy / cyan chat stream        │
│ • Tracks changed vs unchanged metrics │   │ • Starter questions & Enter-to-send   │
│ • STRICT zero-mutation guarantee      │   │ • Direct 1-click decision staging     │
└───────────────────────────────────────┘   └───────────────────────────────────────┘
```

### A. Core Capabilities & Intent Classification (`src/assistant/intentRouter.js`)
The intent router analyzes queries using tokenized matching and regex heuristics to map user questions to 12 distinct intents:
1. **Risk Ranking (`RISK_RANKING`)**: Compares all suppliers and identifies the riskiest vendor with multi-vector score breakdowns.
2. **Supplier Risk Explanation (`SUPPLIER_EXPLANATION`)**: Deep-dive operational findings for a specific supplier.
3. **Quality & Defects (`QUALITY_INSPECTION`)**: Rejection rates, NDT porosity, CMM failures, and inspection lot histories.
4. **Price Variance & Overpayment (`PRICE_VARIANCE`)**: Unapproved markups, contract price ceilings, and verified dollar overpayment leakage.
5. **Delivery Performance (`DELIVERY_PERFORMANCE`)**: On-time in-full (OTIF) rates, transit delays, and lead-time trends.
6. **Compliance & Expiries (`COMPLIANCE_EXPIRY`)**: ISO/AS/IATF certification expiry countdowns and dock-hold risks.
7. **Inventory & Coverage (`INVENTORY_COVERAGE`)**: Factory stock coverage days and negative lead-time buffer deficits.
8. **Recommended Actions (`RECOMMENDED_ACTIONS`)**: Top audited procurement actions from the Phase 3 Decision Review Agent.
9. **Cross-Signal Compound Hazards (`CROSS_SIGNAL_EXPLANATION`)**: Multi-vector compounding risks (e.g., quality spike + critical part + low stock buffer).
10. **What-If Scenario Simulation (`WHAT_IF_SCENARIO`)**: Hypothetical metric adjustments and simulated risk trajectory.
11. **Ambiguous Clarifications (`AMBIGUOUS_CLARIFICATION`)**: Automatically detects underspecified queries and prompts the user with targeted follow-up suggestions rather than guessing.
12. **General Inquiries (`GENERAL_HELP`)**: Explains assistant capabilities, supported queries, and system boundaries.

### B. Entity Recognition
Identifies suppliers across multiple naming conventions:
- **Codes**: `Supplier A`, `Supplier B`, `Supplier C`, `Supplier D`, `Supplier E`, `Supplier F`
- **Corporate Names**: `Apex Precision Castings`, `Vanguard Industrial`, `HydroTech`, `BioPac`, `Rotary`, `Kinetic`
- **System Identifiers**: `SUP-001`, `SUP-002`, `SUP-003`, `SUP-004`, `SUP-005`, `SUP-006`
- **Part Items**: `ITEM-CAST-4140`, `ITEM-FAST-M8`, `ITEM-SEAL-HNBR`, `ITEM-BEAR-6205`, etc.

### C. Evidence-Backed Answer Architecture
Every assistant response separates data into structured tiers:
- **Narrative Answer**: Concise, professional synthesis formatted in readable markdown.
- **Observed Transaction Facts**: Audited data points directly verified from purchase orders, inspection lots, or certificates.
- **Inferred Risks**: Strategic operational hazards derived from data patterns.
- **Recommendations**: Concrete next steps reviewed by Phase 3 agents.
- **Evidence Citations**: Exact PO numbers (`PO-2026-0810`), lot numbers (`LOT-QA-912`), and certificate IDs (`AS-9100-8841`).

### D. What-If Scenario Engine (`src/assistant/scenarioService.js`)
- **Copy-on-Write Isolation**: Clones supplier metrics defensively. **Never mutates** original supplier records or baseline scores.
- **Comprehensive Recalculation**: Reruns the Phase 2 multi-vector risk engine (`calculateCompositeRiskScore`) with hypothetical adjustments.
- **Trajectory Reporting**: Displays original score, hypothetical score, score delta (e.g., `-20 pts`), and category shifts (e.g., `CRITICAL → MEDIUM`).
- **Transparency**: Explicitly itemizes which metrics changed and which stayed constant, accompanied by a prominent safety disclaimer.

### E. Human-in-the-Loop Integration
Assistant responses featuring recommendations include a **"Stage Action Draft"** button and an **"Inspect Supplier Dossier"** button, allowing managers to seamlessly transition from conversational discovery to official executive approval in the Decisions pipeline.

---

## 8. Automated Test Suite (`tests/run-tests.js`)

Run the test suite with:
```bash
npm test
```

The test runner executes **117 automated unit tests** across Phases 2, 3, and 4:

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
[9. Agent A: Risk Investigation Agent Tests] (8 tests)
[10. Agent B: Cross-Signal Intelligence Agent Tests] (5 tests)
[11. Agent C: Procurement Recommendation Agent Tests] (6 tests)
[12. Agent D: Decision Review Agent Tests] (7 tests)
[13. Deterministic Output & Reproducibility Tests] (4 tests)
[14. End-to-End Decision Orchestrator Tests] (6 tests)

=======================================================
 SupplyShield AI — Phase 4 Assistant & What-If Verification
=======================================================
[15. Supplier Name & Entity Recognition Tests]
  ✓ PASS: Recognizes 'Apex Precision Castings' as Supplier A (SUP-001)
  ✓ PASS: Recognizes 'Vanguard' as Supplier B (SUP-002)
  ✓ PASS: Recognizes 'HydroTech' and 'seals' as Supplier C (SUP-003)
  ✓ PASS: Recognizes exact ID 'SUP-006' as Supplier F
  ✓ PASS: Returns null when no supplier entity is present

[16. Every Supported Intent Category Test]
  ✓ PASS: Classifies intent: RISK_RANKING
  ✓ PASS: Classifies intent: SUPPLIER_EXPLANATION
  ✓ PASS: Classifies intent: QUALITY_INSPECTION
  ✓ PASS: Classifies intent: PRICE_VARIANCE
  ✓ PASS: Classifies intent: DELIVERY_PERFORMANCE
  ✓ PASS: Classifies intent: COMPLIANCE_EXPIRY
  ✓ PASS: Classifies intent: INVENTORY_COVERAGE
  ✓ PASS: Classifies intent: RECOMMENDED_ACTIONS
  ✓ PASS: Classifies intent: CROSS_SIGNAL_EXPLANATION
  ✓ PASS: Classifies intent: WHAT_IF_SCENARIO
  ✓ PASS: Extracts stock coverage delta (+30 days) from query
  ✓ PASS: Extracts rejection rate delta (-3%) from query

[17. Ambiguous Questions & Clarification Behavior Tests]
  ✓ PASS: Classifies ambiguous query as AMBIGUOUS_CLARIFICATION
  ✓ PASS: Assistant generates clarification response for ambiguous metric query
  ✓ PASS: Clarification politely requests supplier specification
  ✓ PASS: Provides helpful follow-up question suggestions

[18. Evidence Attribution in Assistant Answers Tests]
  ✓ PASS: Assistant includes structured evidence citations in answer
  ✓ PASS: Cites specific purchase order numbers for Supplier A
  ✓ PASS: Cites exact verified $74,000 overpayment in observed facts
  ✓ PASS: Cites specific inspection lot numbers for Supplier A
  ✓ PASS: Cites verified 9.2% latest lot defect rate

[19. What-If Scenario Engine & Non-Mutation Tests]
  ✓ PASS: What-If scenario executes successfully
  ✓ PASS: Explicitly flags outcome as isHypothetical = true
  ✓ PASS: Hypothetical mitigation significantly reduces risk score
  ✓ PASS: Score delta reflects comprehensive multi-vector relief
  ✓ PASS: Tracks specific changed metrics
  ✓ PASS: Tracks specific unchanged metrics
  ✓ PASS: STRICT NON-MUTATION: Original supplierA.riskScore remains 100% untouched
  ✓ PASS: STRICT NON-MUTATION: Original score breakdown remains 100% untouched
  ✓ PASS: Handles missing supplier in what-if engine gracefully

[20. Deterministic Output & Reproducibility Tests]
  ✓ PASS: Identical intent produced across repeated queries
  ✓ PASS: Identical content generated deterministically
  ✓ PASS: Identical observed facts generated deterministically

[21. Graceful Error Handling Tests]
  ✓ PASS: Gracefully handles empty query string
  ✓ PASS: Provides helpful prompt for empty query
  ✓ PASS: Gracefully handles null query

=======================================================
 Test Execution Summary: 117 Passed, 0 Failed
=======================================================
```

---

## 9. Available NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts Vite local development server at `http://localhost:5173` |
| `npm test` | Runs the 117-test suite verifying calculations, agents, orchestrator, and assistant |
| `npm run lint` | Runs `oxlint` across all project files (0 warnings, 0 errors) |
| `npm run build` | Compiles production assets into `dist/` bundle |
| `npm run preview` | Previews the production build locally |

---

## 10. Project Directory Structure

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
│   └── run-tests.js             # 117 automated unit tests across Phases 2, 3 & 4
├── src/
│   ├── main.jsx                 # React root bootstrap
│   ├── App.jsx                  # Main application orchestrator & tab routing
│   ├── index.css                # Global design system tokens, typography, dark navy theme
│   ├── App.css                  # Animations, responsive breakpoints & micro-interactions
│   ├── assistant/               # AI Procurement Assistant & What-If Engine (Phase 4)
│   │   ├── assistantService.js  # Query orchestrator, evidence synthesizer, and adapter
│   │   ├── intentRouter.js      # NLP tokenized router, entity recognizer, and parser
│   │   └── scenarioService.js   # Deterministic copy-on-write what-if simulation service
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
│       │   ├── Sidebar.jsx      # Navigation sidebar with counter badges & Assistant tab
│       │   └── NotificationDropdown.jsx # Header notification popover
│       ├── dashboard/
│       │   ├── SummaryCards.jsx # Calculated KPI cards (Overpayment, Lead-Time Deficits)
│       │   └── RiskDistribution.jsx # Risk breakdown bar & Supplier A spotlight
│       ├── agentic/             # Agentic UI components (Phase 3)
│       │   ├── AgenticIntelligenceSection.jsx   # Overview dashboard intelligence section
│       │   └── AgentInvestigationReportModal.jsx# Comprehensive supplier decision dossier
│       ├── assistant/           # Assistant UI components (Phase 4)
│       │   └── AssistantView.jsx# Dedicated AI Assistant chat interface
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

## 11. Current Limitations & Architecture Disclaimers

- **Deterministic Assistant, Not an LLM**: The current procurement assistant is a deterministic, intent-and-data-driven assistant powered by semantic heuristics, transactional data mapping, and mathematical risk simulation. It is intentionally designed without external cloud LLM dependencies to run 100% locally with zero latency, zero cloud costs, and zero hallucinations.
- **LLM-Ready Adapter Architecture**: The codebase is architected with a clean adapter interface in `src/assistant/assistantService.js`. When a cloud or local LLM (such as Gemini 1.5, Claude, or local Ollama) is configured in the future, the backend service can swap query processing with prompt-engineered tool calls without changing the UI architecture or component contracts.
- **Synthetic Demonstration Dataset**: All suppliers, purchase orders, inspection lots, quality metrics, and parts are synthetic demonstration records created for benchmark evaluation.
- **In-Memory Browser Session**: Chat conversations and staged interventions reside in local browser memory and reset on page reload or via the **"Clear Chat"** button.
- **Zero Autonomous Execution**: The assistant never modifies real databases or ERP systems. All actions remain drafts until explicitly ratified by authorized personnel.

