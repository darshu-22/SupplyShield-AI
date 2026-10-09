# SupplyShield AI — Agentic Supplier Risk Intelligence

> **Phase 2: Evidence-Driven Risk Intelligence & Decision Simulation Platform**

SupplyShield AI is an enterprise-grade supplier intelligence platform designed for procurement directors and supply chain leaders. It monitors supply chain vulnerabilities across quality inspection trends, unauthorized price variance leakage, compliance accreditation cliffs, and factory stockout hazards.

In **Phase 2**, the application replaces decorative metrics with **deterministic, mathematically grounded calculations** derived directly from structured transaction logs, featuring a multi-vector risk engine, compound cross-signal intelligence, deep Evidence Explorer, an interactive What-If Simulator, and a comprehensive Methodology transparency panel.

---

## What's New in Phase 2

### 1. Deterministic Multi-Vector Risk Engine (`src/engine/riskEngine.js`)
- Independent, pure-function scoring engine covering **5 operational vectors**:
  - **Quality (25%)**: Historical series and latest batch dock rejection rates, trend velocity.
  - **Price Variance (20%)**: Line-item contract ceiling variances and calculated cumulative overpayment.
  - **Delivery Reliability (20%)**: On-Time In-Full (OTIF) fulfillment rate and average delay days.
  - **Compliance Validity (15%)**: Real-time calendar day countdown to ISO/AS/IATF certificate expiration.
  - **Continuity & Stock Buffer (20%)**: Factory days of stock coverage vs. replenishment lead time, plus sole-source exposure weighting.
- Standardized composite score ($0 - 100$) mapped to 4 severity bands: **CRITICAL** (80–100), **HIGH** (60–79), **MEDIUM** (30–59), and **LOW** (0–29).

### 2. Compound Cross-Signal Intelligence
Connects isolated operational signals to detect high-impact systemic vulnerabilities:
- **Scenario A (Quality Spike + Buffer Deficit)**: Rejection rate spike on a critical part with stock coverage below safety target. Identifies immediate manufacturing line shutdown risk.
- **Scenario B (Commercial Price Leakage)**: Contract ceiling breach across repeated purchase order lines. Quantifies dollar leakage (e.g., $74,000 on Supplier A, $45,100 on Supplier F; total audited: $127,272).
- **Scenario C (Compliance Expiry Cliff + Sole Source)**: Mandatory quality certificate expiring in $\le 30$ days with 0 secondary sources qualified. Highlights regulatory shipping blockage.
- **Scenario D (Logistics Slippage + Lead-Time Gap)**: Delivery fulfillment $< 75\%$ opening an unmitigated lead-time coverage deficit where consumption outpaces replenishment.

### 3. Evidence Explorer Modal (`src/components/evidence/EvidenceExplorerModal.jsx`)
One-click explainability modal revealing the source transaction records behind every risk score:
- **Tab 1: Purchase Orders & Invoicing**: PO numbers, contract unit prices, actual billed rates, line variance %, and line overpayment totals.
- **Tab 2: Dock Inspections**: Inspection lot IDs, inspected units, rejected units, defect rates, and non-destructive testing (NDT) defect classifications.
- **Tab 3: Delivery Logs**: Scheduled vs actual delivery dates, transit delay days, OTIF flags, and carrier logistics notes.
- **Tab 4: Accreditation & Audits**: Standard (AS9100, ISO 9001, IATF 16949), accredited registrar, certificate numbers, expiration dates, and days remaining.
- **Tab 5: Inventory & Lead-Time Gap**: On-hand units, daily consumption rate, safety stock target, replenishment lead time, and calculated coverage gap.

### 4. Interactive What-If Risk Simulator (`src/components/simulator/RiskSimulatorModal.jsx`)
Pure-function sensitivity simulator allowing procurement teams to test mitigation strategies without mutating source records:
- Adjust **Delivery Delay delta** ($-15$ to $+15$ days).
- Adjust **Quality Rejection delta** ($-5.0\%$ to $+5.0\%$).
- Adjust **Inventory Buffer delta** ($-30$ to $+60$ days).
- Toggle **Dual-Source Qualification** on/off.
- Real-time recalculation of simulated score, score delta, severity category, and explainable outcome narrative.
- Direct **"Stage as Decision Plan"** action pushing hypothetical blueprints into the executive approval pipeline.

### 5. Transparency & Methodology Modal (`src/components/methodology/MethodologyModal.jsx`)
- Complete documentation of weighting coefficients, mathematical equations, risk threshold bands, and safeguard rules accessible directly from the dashboard header.

### 6. Critical Warnings Notification Drawer (`src/components/layout/NotificationDropdown.jsx`)
- Header notification popover aggregating all active critical and high cross-signal alerts across the vendor portfolio with one-click supplier inspection.

---

## Mathematical Calculation Formulas

All dashboard KPIs and vendor scores are computed deterministically using standard supply-chain formulas:

| Metric | Mathematical Formula | Purpose & Safeguards |
|---|---|---|
| **Quality Rejection Rate** | $\text{Rate} = \left(\frac{\sum \text{Rejected Units}}{\sum \text{Inspected Units}}\right) \times 100$ | Safely returns $0.0\%$ when inspected units count is zero. |
| **Contract Price Variance** | $\text{Variance} = \left(\frac{\text{Actual Billed Rate} - \text{Contract Rate}}{\text{Contract Rate}}\right) \times 100$ | Detects unapproved raw material and energy surcharge markups. |
| **Audited Overpayment** | $\text{Overpayment} = \sum \left[ \max(0, \text{Actual Rate} - \text{Contract Rate}) \times \text{Units Ordered} \right]$ | Only accrues positive commercial overcharges; zero when compliant. |
| **On-Time Delivery Rate (OTIF)** | $\text{OTIF} = \left(\frac{\text{Deliveries On-Time}}{\text{Total Completed Shipments}}\right) \times 100$ | Compares actual delivery date against contractual SLA date. |
| **Stock Coverage** | $\text{Coverage Days} = \frac{\text{Current On-Hand Units}}{\text{Average Daily Factory Demand}}$ | Quantifies days of factory operation remaining before stockout. |
| **Lead-Time Coverage Gap** | $\text{Gap Days} = \text{Stock Coverage Days} - \text{Replenishment Lead Time Days}$ | Negative values represent an unmitigated replenishment gap. |
| **Composite Risk Score** | $\text{Score} = (Q \times 0.25) + (P \times 0.20) + (D \times 0.20) + (C \times 0.15) + (I \times 0.20)$ | Normalized weighted sum producing a calibrated score between $0$ and $100$. |

---

## Risk Scoring Weights & Calibration

```
Composite Score (0 - 100)
├── Quality Score (25% weight)       -> Rejection rate baseline, latest lot spike, defect trends
├── Price Variance (20% weight)      -> Contract ceiling variance % and total billed overpayment
├── Delivery Reliability (20% weight)-> OTIF % and average shipment delay days
├── Compliance Validity (15% weight) -> Calendar countdown to accreditation expiration
└── Inventory Continuity (20% weight)-> Stock coverage vs lead-time gap & sole-source exposure
```

### Risk Severity Bands
- **CRITICAL (80–100)**: Immediate operational threat; executive intervention required within 48 hours.
- **HIGH (60–79)**: Elevated exposure; mitigation planning required within 72 hours.
- **MEDIUM (30–59)**: Moderate variance; review during standard weekly procurement cycle.
- **LOW (0–29)**: Operational parameters tracking within contractual SLA boundaries.

---

## Dataset Structure (`src/data/transactionRecords.js`)

All metrics stem from relational demonstration transaction records:

```
src/data/transactionRecords.js
├── INVENTORY_RECORDS       -> currentOnHandUnits, dailyDemandRate, targetSafetyStockDays, replenishmentLeadTimeDays
├── PURCHASE_ORDER_RECORDS  -> poNumber, orderDate, expectedDeliveryDate, actualDeliveryDate, contractUnitPrice, actualBilledUnitPrice, quantityOrdered
├── INSPECTION_LOTS_RECORDS -> lotNumber, inspectionDate, inspectedUnits, rejectedUnits, defectCategory
├── COMPLIANCE_RECORDS      -> certType, certNumber, registrar, issueDate, expiryDate, recertAuditScheduled
└── DEPENDENCY_RECORDS      -> criticalityTier, isSingleSource, approvedSourcesCount, standbySupplierName, switchingLeadTimeWeeks
```

Suppliers are dynamically synthesized in `src/data/suppliers.js` by piping these transaction tables through `src/engine/riskEngine.js`.

---

## Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Language**: JavaScript (ES Modules + JSX)
- **Styling**: Pure Vanilla CSS with tailored design tokens (`src/index.css` & `src/App.css`), featuring a midnight navy (`#080d1a`) and cyan-teal (`#0ea5e9`) enterprise SaaS visual identity with accessible contrast and reduced-motion compliance.
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: Deterministic Node.js unit test suite (`tests/run-tests.js`)
- **Linter**: [Oxlint](https://oxc.rs/)

---

## Prerequisites

- **Node.js**: `v18.0.0` or higher (tested on `v20.x` / `v22.x`)
- **npm**: `v9.0.0` or higher
- **Git**: Installed and configured

---

## Local Setup & Quick Start

```bash
# 1. Clone repository
git clone https://github.com/darshu-22/SupplyShield-AI.git
cd SupplyShield-AI

# 2. Install dependencies
npm install

# 3. Run unit tests
npm test

# 4. Start local development server
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## Available NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts Vite local development server with HMR at `http://localhost:5173` |
| `npm test` | Executes 38 automated unit tests verifying formulas, edge cases, and simulation models |
| `npm run lint` | Runs `oxlint` across all files to enforce zero warnings and zero errors |
| `npm run build` | Compiles production assets into `dist/` |
| `npm run preview` | Previews the production build locally |

---

## Test Suite Coverage (`tests/run-tests.js`)

Run tests via:
```bash
npm test
```

The test runner validates:
1. **Methodology Configuration**: Verifies 5-vector weights sum to exactly $1.00$ ($100\%$) and threshold calibrations.
2. **Quality Rejection Rates**: Series batch averages, latest lot rates, defect trend classification, empty inspection array safeguards.
3. **Price Variance & Overpayment**: Exact line-by-line calculations ($74,000$ on Supplier A), ceiling variance percentages, zero overpayment for compliant orders.
4. **Delivery Performance**: OTIF percentages, late shipment detection, average delay days.
5. **Compliance Expiry**: Date difference countdowns, $<30$ day threshold flags, critical expiration penalties.
6. **Stock Coverage & Lead-Time Gap**: Daily demand depletion calculations, sole-source continuity scoring, negative lead-time gap identification.
7. **Composite Scoring**: Deterministic multi-vector weighting and severity band assignment.
8. **Cross-Signal Scenarios**: Automated detection of Scenarios A, B, C, and D.
9. **What-If Simulation**: Parameter adjustment calculation, score delta tracking, non-mutation of base records, and narrative generation.

---

## Project Folder Structure

```
SupplyShield AI/
├── index.html                   # HTML entry point, typography & SEO metadata
├── package.json                 # Scripts: dev, build, lint, test
├── package-lock.json            # Deterministic dependency lockfile
├── vite.config.js               # Vite bundler configuration
├── .oxlintrc.json               # Oxlint linter configuration
├── .gitignore                   # Excludes node_modules, dist, .env
├── README.md                    # Complete project documentation
├── tests/
│   └── run-tests.js             # 38 automated unit tests for risk engine
├── src/
│   ├── main.jsx                 # React root bootstrap
│   ├── App.jsx                  # Main application orchestrator & modal state
│   ├── index.css                # Global design system tokens, typography, dark navy theme
│   ├── App.css                  # Animations, responsive breakpoints & micro-interactions
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
│       ├── suppliers/
│       │   ├── SupplierTable.jsx       # Table with lead-time gap and action triggers
│       │   ├── SupplierDetailModal.jsx # Detail drawer with sparklines & record counts
│       │   └── SupplierAnalysisModal.jsx # Diagnostic modal with action drafting
│       ├── evidence/
│       │   └── EvidenceExplorerModal.jsx # 5-tab granular audit trail modal
│       ├── simulator/
│       │   └── RiskSimulatorModal.jsx    # Interactive What-If sensitivity simulator
│       ├── methodology/
│       │   └── MethodologyModal.jsx      # Scoring equations and weights modal
│       └── views/
│           ├── OverviewView.jsx     # Executive command dashboard
│           ├── SuppliersView.jsx    # Master supplier directory with CSV export
│           ├── RiskAnalysisView.jsx # Multi-vector risk view with Cross-Signal cards
│           ├── DecisionsView.jsx    # Human-in-the-loop approval workflow
│           └── ActivityView.jsx     # Immutable telemetry event stream
```

---

## Limitations of Simulated Data

- **Demonstration Scope**: The dataset uses realistic, synthetic data representing aerospace, automotive, and industrial manufacturing suppliers. It does not represent actual operating companies or proprietary commercial contracts.
- **Rules-Based Engine**: In Phase 2, all diagnostic suggestions, risk classifications, and compound warnings are derived through **deterministic rules and mathematical thresholds**, with no external AI API or black-box LLM calls.
- **Local Persistence**: State changes (such as approving or rejecting decisions and staging simulation plans) are managed in-memory during the browser session.
