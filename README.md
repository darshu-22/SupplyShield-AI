# SupplyShield AI — Agentic Supplier Risk Intelligence

> **Phase 5 & 6: Procurement Approval Workflow & Secure Groq AI Integration**

SupplyShield AI is an enterprise supplier intelligence platform designed for procurement directors and supply chain leaders. It monitors supply chain vulnerabilities across quality inspection trends, unauthorized price variance leakage, compliance accreditation cliffs, and factory stockout hazards.

In **Phase 5 & 6**, the platform delivers:
1. **Secure Groq AI Integration (Phase 5)**: Natural language supplier intelligence powered by Groq's official OpenAI-compatible API (`llama-3.3-70b-versatile`) with free-only safety controls (`ENABLE_GROQ=false` default), server-only credential security, controlled prompt grounding in relational transaction records, and instant fallback to the deterministic engine.
2. **Human-in-the-Loop Procurement Action & Audit Workflow (Phase 6)**: Strict finite-state machine (FSM) action lifecycles, an upgraded Decision Center with real-time KPI metrics, mandatory documented justifications, and an append-only tamper-proof governance audit trail.

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

## 8. Secure Groq AI Integration (Phase 5)

Phase 5 introduces optional natural language intelligence powered by the official **Groq Cloud API** (`https://api.groq.com/openai/v1/chat/completions`). It enables the assistant to synthesize complex supplier evidence, translate multi-factor hazards into executive briefings, compare supplier risk profiles, and explain proposed mitigation trade-offs—while strictly maintaining the authoritative deterministic risk engine as the source of truth.

```
                           ┌──────────────────────────────────────────────┐
                           │      Conversational Procurement Query        │
                           │   ("Why is Supplier A classified high risk?")│
                           └──────────────────────┬───────────────────────┘
                                                  │
                                                  ▼
                           ┌──────────────────────────────────────────────┐
                           │   Frontend Assistant (AssistantView.jsx)     │
                           │   • Mode Switcher: Deterministic vs Groq AI  │
                           │   • Live Status Indicator & Fallback Badge   │
                           │   • User-Driven Manual Retry Controls        │
                           └──────────────────────┬───────────────────────┘
                                                  │ POST /api/assistant/chat
                                                  ▼
      ┌────────────────────────────────────────────────────────────────────────┐
      │ Secure Express Backend Service (server/app.js & assistantRoutes.js)   │
      │   • Sliding Window IP Rate Limiter (server/middleware/rateLimiter.js)  │
      │   • Payload Sizing & Anti-Injection (middleware/requestValidator.js)  │
      │   • Free-Only Safety Gate: ENABLE_GROQ=false (Default Safe State)      │
      └───────────────────────────────────┬────────────────────────────────────┘
                                          │
                     ┌────────────────────┴────────────────────┐
                     │ When ENABLE_GROQ=false                  │ When ENABLE_GROQ=true
                     ▼                                         ▼
┌─────────────────────────────────────────┐ ┌─────────────────────────────────────────┐
│     Authoritative Fallback Engine       │ │      Controlled Prompt Assembler        │
│   (src/assistant/assistantService.js)   │ │    (server/services/promptBuilder.js)   │
│ • 100% Offline, Zero Cloud API Latency  │ │ • Injects exact deterministic scores    │
│ • Zero External API Fees                │ │ • Injects verified POs & QA Lots        │
│ • Immediate Deterministic Resolution    │ │ • Injects Agent Orchestrator findings   │
└─────────────────────────────────────────┘ └────────────────────┬────────────────────┘
                                                                 │
                                                                 ▼
                                            ┌─────────────────────────────────────────┐
                                            │      Groq API Client (groqClient.js)    │
                                            │ • POST https://api.groq.com/openai/v1/  │
                                            │ • Model: llama-3.3-70b-versatile (Free) │
                                            │ • Secret Key strictly on backend        │
                                            │ • AbortController Timeout Protection    │
                                            └─────────────────────────────────────────┘
```

### A. Free-Only Safety & Cost Protection Guarantees
- **Disabled by Default**: External cloud AI calls are strictly disabled (`ENABLE_GROQ=false`) by default to prevent unintended API usage.
- **Zero Live Calls During Testing or Builds**: Automated verification suites use 100% mocked HTTP responses via dependency injection; no tokens or credits are ever consumed during test runs.
- **No Silent Fallbacks to Paid Providers**: If Groq is unavailable, rate-limited, or disabled, the application never attempts other providers; it transparently falls back to the local deterministic engine.
- **Zero Runaway Retry Loops**: No automated retry loops. Failed or rate-limited requests present friendly status notifications and give the procurement user explicit manual retry buttons.

### B. Server-Only Key Security Architecture
- **Zero Frontend Leakage**: The `GROQ_API_KEY` is read strictly on the Node.js backend via `process.env.GROQ_API_KEY`.
- **Bundle Isolation**: Never prefixed with `VITE_*`. Automated tests assert that client files and production bundles contain zero references to server secrets.
- **Zero Log Exposure**: Authorization headers and secret tokens are never written to server logs, error dumps, or client responses.
- **Git Ignored**: `.env` and all credential patterns are strictly excluded in `.gitignore`. A `.env.example` file contains placeholders only.

### C. Grounding & Authoritative Risk Engine Rule
- **Calculations are Authoritative**: All numerical risk scores ($0\text{--}100$), financial price variances ($\$74,000$), defect percentages ($9.2\%$), and lead-time gap calculations ($-87\text{ days}$) remain deterministically computed by the Phase 2 risk engine and Phase 3 agents.
- **Zero Hallucination Mandate**: Groq is instructed to explain and interpret these calculations, never recalculate or invent numbers.
- **Explicit Missing Data Handling**: If an inspection history or contract record is not in the system, the model must explicitly state that the data is not on file rather than guessing.
- **Human Governance Uncompromised**: Groq has zero authority to approve, reject, start, complete, or cancel procurement actions. All lifecycle transitions remain gated by human executive sign-off.

### D. Supported Supplier Intelligence Inquiries
1. **Root-Cause Risk Explanation**: *"Why is Supplier A classified as high risk?"* (Explains 9.2% defect spike and +7.4% unapproved price variance).
2. **Evidence Synthesis**: *"Which evidence supports this risk assessment?"* (Cites specific purchase orders like `PO-2026-0810` and inspection lots like `LOT-QA-912`).
3. **Failure Impact Analysis**: *"What could happen if Supplier A fails?"* (Details assembly line stoppage within 25 days due to depleted buffer and sole-source dependency).
4. **Prioritization Guidance**: *"Which suppliers should procurement investigate first?"* (Reviews portfolio ranking and highlights immediate intervention targets).
5. **Agent Findings Translation**: *"Explain the existing agents' findings in simple language."* (Translates technical NDT porosity and commercial leakage into clear operational summaries).
6. **Multi-Vendor Risk Comparison**: *"Compare the deterministic risk findings for Supplier A and Supplier C."* (Evaluates quality/price exposure vs delivery/lead-time exposure).
7. **Mitigation Trade-Offs**: *"Explain a proposed mitigation and its trade-offs."* (Analyzes safety stock expansion vs inventory holding cost).

### E. Backend Configuration & Setup

1. **Environment Configuration**:
   ```bash
   # Copy example configuration template
   cp .env.example .env
   ```

2. **Environment Variables**:
   | Variable | Default | Purpose |
   |---|---|---|
   | `PORT` | `3001` | Express backend HTTP server port |
   | `ALLOWED_ORIGIN` | `http://localhost:5173` | Allowed frontend origin for CORS |
   | `ENABLE_GROQ` | `false` | Master safety switch. Set to `true` only when intentionally using Groq |
   | `GROQ_API_KEY` | *(empty)* | Official Groq API key from `https://console.groq.com/keys` (kept on server only) |
   | `GROQ_MODEL` | `llama-3.3-70b-versatile` | Free-tier model identifier (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`) |
   | `GROQ_BASE_URL` | `https://api.groq.com/openai/v1` | Official Groq OpenAI-compatible base URL |
   | `REQUEST_TIMEOUT_MS`| `20000` | AbortController network timeout bound (20 seconds) |
   | `RATE_LIMIT_MAX_REQUESTS`| `20` | Max requests per minute per IP |

3. **Running in Free-Only Mode (Default)**:
   ```bash
   # Terminal 1: Start backend server (Groq disabled by default)
   npm run server

   # Terminal 2: Start frontend development server
   npm run dev
   ```
   *In this mode, all assistant inquiries run instantly via the local deterministic engine with zero API charges.*

4. **Enabling Groq Manually**:
   Create a free account and generate an API key at [console.groq.com/keys](https://console.groq.com/keys):
   ```bash
   # Edit .env
   ENABLE_GROQ=true
   GROQ_API_KEY=gsk_your_actual_key_here
   GROQ_MODEL=llama-3.3-70b-versatile
   GROQ_BASE_URL=https://api.groq.com/openai/v1
   ```
   Restart `npm run server`. The frontend Assistant status pill will display: **Groq AI Active (llama-3.3-70b-versatile)**.

---

## 9. Procurement Action, Approval & Audit Workflow (Phase 6)

Phase 6 implements a comprehensive, human-in-the-loop governance system for the procurement action lifecycle. It bridges agentic intelligence and conversational discovery directly into executive sign-off, work tracking, and append-only audit verification.

```
                           ┌──────────────────────────────────────────────┐
                           │      Agent Dossier / AI Assistant Staging    │
                           │     ("Issue Contract Price Dispute (+7.4%)") │
                           └──────────────────────┬───────────────────────┘
                                                  │
                                                  ▼
                                      ┌───────────────────────┐
                                      │         DRAFT         │
                                      └───────────┬───────────┘
                                                  │ Submit for Approval
                                                  ▼
                                      ┌───────────────────────┐
                     ┌───────────────►│   PENDING_APPROVAL    │◄──────────────┐
                     │                └─────┬───────────┬─────┘               │
                     │                      │           │                     │
                     │             Approve  │           │  Reject (Mandatory  │
                     │                      ▼           ▼  Rationale Reason)  │
                     │            ┌───────────────┐   ┌───────────────┐       │
                     │            │   APPROVED    │   │   REJECTED    │       │
                     │            └───────┬───────┘   └───────────────┘       │
                     │                    │               (Terminal)          │
                     │         Start Work │                                   │
                     │                    ▼                                   │
                     │            ┌───────────────┐                           │
                     │            │  IN_PROGRESS  │                           │
                     │            └───────┬───────┘                           │
                     │                    │                                   │
                     │      Mark Complete │                                   │
                     │                    ▼                                   │
                     │            ┌───────────────┐                           │
                     │            │   COMPLETED   │                           │
                     │            └───────────────┘                           │
                     │               (Terminal)                               │
                     │                                                        │
                     │                  CANCELLED                             │
                     └──────────────── (Terminal Reason Required) ────────────┘
```

### A. Finite-State Machine (FSM) Governance Rules (`src/workflow/actionLifecycleService.js`)
The action lifecycle strictly enforces valid transitions:
- `DRAFT` → `PENDING_APPROVAL`, `CANCELLED`
- `PENDING_APPROVAL` → `APPROVED`, `REJECTED`, `CANCELLED`
- `APPROVED` → `IN_PROGRESS`, `CANCELLED`
- `IN_PROGRESS` → `COMPLETED`, `CANCELLED`
- **Terminal States**: `REJECTED`, `COMPLETED`, `CANCELLED` cannot transition silently into unrelated states.
- **Mandatory Justification**: Rejection and cancellation strictly require a documented rationale reason before the state transition can execute.
- **Human Reviewer Stamp**: Approvals, rejections, and work status updates record the exact reviewer name and role (e.g., `Sarah Chen (Director of Procurement)`).

### B. Upgraded Procurement Decision Center (`src/components/views/DecisionsView.jsx`)
- **Status Summary KPI Cards**: Derived from active action records (`All`, `Pending Review`, `Approved`, `In Progress`, `Completed`, `Rejected/Cancelled`).
- **Actions Pipeline**:
  - Multi-attribute text search across Action ID, title, supplier name, and evidence.
  - Multi-criteria filtering by Status, Priority, Supplier, and Category.
  - Sorting by Urgency First, Newest First, and Oldest First.
  - Permitted transition controls directly on action cards (Submit, Approve, Reject Dialog, Start Work, Mark Complete, Cancel Dialog).
- **Action Detail & Timeline Modal (`src/components/decisions/ActionDetailModal.jsx`)**:
  - Full intervention blueprint, financial exposure, urgency rating, and underlying transaction evidence.
  - Contextual transition buttons right inside the modal.
  - Embedded vertical visual audit timeline tracking every event from staging to completion.
- **Mandatory Reason Dialog (`src/components/decisions/TransitionReasonModal.jsx`)**:
  - Presents curated industry presets (e.g., *"Alternative supplier qualified"*, *"Price variance settled with credit memo"*) alongside custom justification text entry.
  - Form validation blocks empty submissions.
- **Reviewer Switcher**: Allows toggling between authorized demo personas (`Sarah Chen — Director of Procurement`, `Marcus Vance — VP Supply Chain`, `Elena Rostova — Lead Quality Auditor`) to test multi-role governance sign-offs.

### C. Append-Only Audit Trail Architecture (`src/workflow/auditService.js`)
- **Immutability Guarantee**: Audit records are created with unique IDs (`AUD-xxxx`) and frozen in memory to prevent modification or purging.
- **Event Attributes**:
  - `id`: Unique audit identifier.
  - `actionId`: Linked procurement action.
  - `eventType`: `ACTION_CREATED`, `SUBMITTED_FOR_APPROVAL`, `ACTION_APPROVED`, `ACTION_REJECTED`, `WORK_STARTED`, `ACTION_COMPLETED`, `ACTION_CANCELLED`.
  - `fromStatus` & `toStatus`: Exact state transition.
  - `actor`: Reviewer identity.
  - `timestamp`: ISO-8601 timestamp.
  - `reason`: Documented justification.
  - `evidenceReferences`: Transactional records cited.
- **Dedicated Audit Log View**: Provides an interactive table with event type filtering, search, and one-click JSON export.

### D. Local Persistence & Reliability Architecture (`src/workflow/persistenceService.js`)
- **Safe Browser Storage**: Actions and audit events persist across page refreshes via `localStorage` (`supplyshield_actions_v1` and `supplyshield_audit_v1`).
- **Schema Validation & Error Recovery**: Normalizes status strings, validates required fields, and recovers gracefully from corrupted or partial storage states.
- **Sequential Stable Action IDs**: Generates collision-free IDs in the format `ACT-2026-xxx`.
- **Duplicate Staging Prevention**: Inspects active actions before staging recommendations from the Assistant or Agent Dossiers. If an active action already exists for that recommendation or supplier initiative, it warns the user and opens the existing record instead of creating duplicates.
- **Reset to Seeds**: One-click reset restores the benchmark demo dataset and initial audit history.

---

## 10. Automated Test Suite (`tests/run-tests.js`)

Run the test suite with:
```bash
npm test
```

The test runner executes **309 automated unit tests** across Phases 2, 3, 4, 6, and 5:

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
[15. Supplier Name & Entity Recognition Tests] (5 tests)
[16. Every Supported Intent Category Test] (12 tests)
[17. Ambiguous Questions & Clarification Behavior Tests] (4 tests)
[18. Evidence Attribution in Assistant Answers Tests] (5 tests)
[19. What-If Scenario Engine & Non-Mutation Tests] (8 tests)
[20. Deterministic Output & Reproducibility Tests] (3 tests)
[21. Graceful Error Handling Tests] (3 tests)

=======================================================
 SupplyShield AI — Phase 6 Workflow & Audit Verification
=======================================================
[22. Action Lifecycle Valid Transitions Tests] (8 tests)
[23. Invalid Transitions & State Machine Enforcement Tests] (8 tests)
[24. Mandatory Rejection & Cancellation Reasons Tests] (5 tests)
[25. Audit Event Creation & Append-Only Immutability Tests] (7 tests)
[26. Stable Action IDs & Duplicate Recommendation Detection Tests] (4 tests)
[27. Persistence Validation & Recovery Tests] (6 tests)
[28. Human Approval Enforcement & Governance Guarantees Tests] (3 tests)
[29. Filtering and Sorting Logic Tests] (3 tests)

=======================================================
 SupplyShield AI — Phase 5 Secure Grok AI Verification
=======================================================
[30. Grok AI Configuration & Default Safe State] (10 tests)
  ✓ PASS: Grok is disabled by default (ENABLE_GROK=false)
  ✓ PASS: isGrokEnabled() returns false by default
  ✓ PASS: isGrokConfigured() returns false by default
  ✓ PASS: getClientSafeStatus reports enabled: false
  ✓ PASS: getClientSafeStatus never exposes XAI_API_KEY
  ✓ PASS: Custom config with ENABLE_GROK=false remains disabled even when key provided
  ✓ PASS: Defaults to grok-2-latest model

[31. Request Validation & Payload Constraints] (8 tests)
  ✓ PASS: Rejects null body with 400
  ✓ PASS: Rejects missing message with 400
  ✓ PASS: Rejects non-string message with 400
  ✓ PASS: Rejects whitespace-only message with 400
  ✓ PASS: Rejects oversized message exceeding limit with 400
  ✓ PASS: Flags payload_too_large status
  ✓ PASS: Valid request sanitizes and trims message

[32. Sliding Window Rate Limiting Enforcement] (5 tests)
  ✓ PASS: Rate limit permits requests within quota
  ✓ PASS: Rate limit blocks requests exceeding quota with HTTP 429
  ✓ PASS: Payload flags status: rate_limited with Retry-After header
  ✓ PASS: resetRateLimits allows subsequent requests

[33. Prompt Grounding & Evidence Context Construction] (7 tests)
  ✓ PASS: Detects Supplier A as target supplier
  ✓ PASS: System prompt mandates authoritative calculations
  ✓ PASS: System prompt enforces human approval boundaries
  ✓ PASS: System prompt mandates explicit missing data reporting
  ✓ PASS: User prompt injects exact deterministic score 92/100
  ✓ PASS: User prompt cites relational inspection lots and purchase orders
  ✓ PASS: Constructs standard 2-message array [system, user]

[34. Mocked Grok API Call & Successful Explanation Synthesis] (4 tests)
  ✓ PASS: Mocked Grok call succeeds with success: true
  ✓ PASS: Source stamped as grok-ai
  ✓ PASS: Returns expected synthesized explanation without live calls
  ✓ PASS: Returns correct model

[35. Provider Failure Scenarios & Safe Recovery] (8 tests)
  ✓ PASS: Disabled client rejects call before network
  ✓ PASS: Missing key client rejects call with unconfigured
  ✓ PASS: Captures AbortError as timeout (HTTP 504)
  ✓ PASS: Captures provider 429 as provider_rate_limited
  ✓ PASS: Captures 401 as auth_error
  ✓ PASS: Captures 402 as insufficient_credits
  ✓ PASS: Captures 500 as provider_error
  ✓ PASS: Captures malformed responses gracefully

[36. Strict API Key Security & Client Bundle Hygiene] (84 tests)
  ✓ PASS: Zero client files in src/ reference process.env.XAI_API_KEY
  ✓ PASS: Zero client files in src/ reference VITE_XAI_API_KEY
  ✓ PASS: .gitignore explicitly excludes .env and secrets/
  ✓ PASS: .env.example contains only placeholders and ENABLE_GROK=false

[37. Deterministic Fallback & Zero Mutation Guarantees] (6 tests)
  ✓ PASS: Unified query in deterministic mode returns source: deterministic
  ✓ PASS: Unified query with unconfigured Grok defaults safely to deterministic
  ✓ PASS: STRICT NON-MUTATION: supplierA.riskScore remains exactly 92
  ✓ PASS: STRICT NON-MUTATION: Quality score breakdown remains identical
  ✓ PASS: STRICT NON-MUTATION: Rejection rate remains exactly 9.2%

=======================================================
 Test Execution Summary: 309 Passed, 0 Failed
=======================================================
```

---

## 11. Available NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts Vite local development server at `http://localhost:5173` |
| `npm run server` | Boots Node.js/Express backend on port `3001` (Groq AI proxy & status) |
| `npm test` | Runs the 392-test suite verifying risk engine, agents, orchestrator, assistant, FSM, audit log, and Groq AI |
| `npm run lint` | Runs `oxlint` across all project files (0 warnings, 0 errors) |
| `npm run build` | Compiles production assets into `dist/` bundle |
| `npm run preview` | Previews the production build locally |

---

## 12. Project Directory Structure

```
SupplyShield AI/
├── index.html                   # HTML entry point, typography & metadata
├── package.json                 # Scripts: dev, server, build, lint, test
├── package-lock.json            # Deterministic dependency lockfile
├── vite.config.js               # Vite bundler configuration with /api proxy
├── .oxlintrc.json               # Oxlint linter configuration
├── .gitignore                   # Excludes node_modules, dist, .env, secrets/
├── .env.example                 # Template environment variables (placeholders only)
├── README.md                    # Complete project documentation
├── server/                      # Secure Node.js/Express Backend (Phase 5)
│   ├── index.js                 # Server entry point & graceful shutdown
│   ├── app.js                   # Express app factory, CORS, body limits & routes
│   ├── config.js                # Environment config, safe status sanitization & defaults
│   ├── middleware/
│   │   ├── rateLimiter.js       # In-memory sliding window IP rate limiter (429)
│   │   └── requestValidator.js  # Request size bounds, schema & anti-injection validation
│   ├── services/
│   │   ├── groqClient.js        # Official Groq Cloud API client with dependency injection
│   │   └── promptBuilder.js     # Controlled, grounded prompt synthesizer
│   └── routes/
│       └── assistantRoutes.js   # GET /api/assistant/status & POST /api/assistant/chat
├── tests/
│   └── run-tests.js             # 392 automated unit tests across Phases 2, 3, 4, 6 & 5
├── src/
│   ├── main.jsx                 # React root bootstrap
│   ├── App.jsx                  # Main application orchestrator & tab routing
│   ├── index.css                # Global design system tokens, typography, dark navy theme
│   ├── App.css                  # Animations, responsive breakpoints & micro-interactions
│   ├── workflow/                # Action Lifecycle, Audit & Persistence (Phase 6)
│   │   ├── actionLifecycleService.js # Finite-state machine, transitions & validators
│   │   ├── auditService.js      # Append-only immutable audit trail logger
│   │   └── persistenceService.js# LocalStorage serialization, validation & recovery
│   ├── assistant/               # AI Procurement Assistant & What-If Engine (Phase 4 & 5)
│   │   ├── assistantService.js  # Authoritative deterministic query orchestrator
│   │   ├── groqAssistantService.js # Frontend Groq bridge, status polling & fallback
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
│       ├── assistant/           # Assistant UI components (Phase 4 & 5)
│       │   └── AssistantView.jsx# Assistant chat interface with Groq indicator & mode toggle
│       ├── decisions/           # Action Lifecycle UI components (Phase 6)
│       │   ├── ActionDetailModal.jsx      # Detailed dossier & visual audit timeline modal
│       │   └── TransitionReasonModal.jsx  # Rejection & cancellation rationale dialog
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
│           ├── DecisionsView.jsx    # Upgraded Procurement Decision Center & Audit Log
│           └── ActivityView.jsx     # Immutable telemetry event stream
```

---

## 13. Current Limitations & Architecture Disclaimers

- **Human Approval & Decision Support**: Approval of an action grants operational sign-off to proceed with an internal intervention. It **never** claims that an external supplier was contacted or that a real-world enterprise ERP purchase order was altered.
- **Authoritative Deterministic Risk Calculations**: Groq AI explains and interprets the results of the deterministic engine. It **never** computes or alters numerical risk scores, price variances, or safety stock figures.
- **Free-Tier Cost Protection**: Groq API integration is disabled by default (`ENABLE_GROQ=false`). Automated tests run 100% locally with zero live network calls to Groq Cloud. External AI calls require explicit configuration of API keys and billing controls by the user.
- **Demonstration Audit Log**: The audit trail is an append-only in-browser governance log persisted in browser `localStorage`. It demonstrates tamper-proof audit concepts but is not a cryptographic distributed ledger or backend compliance vault.
- **Synthetic Demonstration Dataset**: All suppliers, purchase orders, inspection lots, quality metrics, and parts are synthetic demonstration records created for benchmark evaluation.
- **Session State & Persistence**: Action records and audit entries persist across browser reloads via `localStorage` and can be reset to benchmark seeds at any time via the **"Reset Seeds"** control.


