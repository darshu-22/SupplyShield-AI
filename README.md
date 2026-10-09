# SupplyShield AI — Agentic Supplier Risk Intelligence

> **Phase 1: Project Foundation & Interactive Procurement Dashboard**

SupplyShield AI is an intelligent supplier risk monitoring and intervention platform designed for procurement managers and supply chain directors. It detects supplier anomalies, quantifies unratified contract price variances, monitors quality defect trends, tracks compliance certificate expiration cliffs, and prepares human-in-the-loop actions for executive sign-off.

---

## Key Features (Phase 1)

- **Interactive Executive Dashboard**: Real-time KPI summary cards tracking monitored suppliers, high-risk flags, pending decision drafts, and potential quarterly contract-price overpayment exposure.
- **Searchable, Filterable & Sortable Supplier Registry**: Real-time multi-attribute search, risk severity filtering (`HIGH`, `MEDIUM`, `LOW`), certificate status filtering, and multi-column sorting.
- **Supplier Inspection Drawer / Modal**: Detailed view displaying component criticality, single-source dependency flags, historical defect baselines, invoice discrepancies, and chronological evidence logs.
- **Preliminary Rules-Based Diagnostic ("Analyse Supplier")**: Structured rules diagnostic highlighting primary risk drivers, financial exposure calculations, and one-click drafting of procurement mitigation actions.
- **Human-in-the-Loop Decision Pipeline**: Action review center where managers can approve, reject, or inspect evidence for commercial and operational intervention drafts.
- **Live Telemetry & Audit Stream**: Chronological event log tracking automated ERP invoice comparisons, incoming dock inspections, and compliance checks with severity filters.
- **CSV Data Export**: Functional client-side export utility that generates a structured CSV of the supplier master dataset.
- **Resilient UI States**: Built-in loading skeletons, empty state filters with one-click resets, and simulated error banner testing.

---

## Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Language**: JavaScript (ES Modules + JSX)
- **Styling**: Pure Vanilla CSS with tailored design tokens (`src/index.css` & `src/App.css`), featuring a dark navy & cyan-teal visual identity with accessible contrast.
- **Icons**: [Lucide React](https://lucide.dev/)
- **Dataset**: Fictional demonstration dataset (`src/data/suppliers.js`) with 6 distinct supplier profiles (Suppliers A–F). No external database or AI backend required in Phase 1.

---

## Prerequisites

Before running the application, make sure your computer has:

- **Node.js**: `v18.0.0` or higher (recommended: `v20.x` or `v22.x` / `v24.x`)
- **npm**: `v9.0.0` or higher (bundled with Node.js)
- **Git**: Installed and available in your terminal

To verify your installation:
```bash
node -v
npm -v
git --version
```

---

## Quick Start & Setup Instructions

Follow these steps to clone and run the project locally on another machine:

### 1. Clone the Repository
```bash
git clone https://github.com/darshu-22/SupplyShield-AI.git
cd SupplyShield-AI
```

### 2. Install Dependencies
Install all required dependencies using `package-lock.json`:
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```

### 4. Open in Browser
Open your browser and navigate to:
```
http://localhost:5173
```

---

## Available NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts Vite local development server with Hot Module Replacement (HMR) at `http://localhost:5173` |
| `npm run build` | Compiles and builds the production bundle into the `dist/` directory |
| `npm run preview` | Starts a local web server to preview the production build |
| `npm run lint` | Runs the linter (`oxlint`) across all project files to verify code quality |

---

## Project Folder Structure

```
SupplyShield AI/
├── index.html                   # HTML entry point, typography & SEO metadata
├── package.json                 # Project dependencies & scripts
├── package-lock.json            # Deterministic dependency lockfile
├── vite.config.js               # Vite bundler configuration
├── .oxlintrc.json               # Oxlint linter configuration
├── .gitignore                   # Excludes node_modules, dist, .env, and OS artifacts
├── README.md                    # Setup documentation & project guide
├── public/                      # Static assets (favicons, SVG icons)
└── src/
    ├── main.jsx                 # React root bootstrap
    ├── App.jsx                  # Main application orchestrator & state manager
    ├── index.css                # Global design system tokens, typography, dark navy theme
    ├── App.css                  # Animations & responsive breakpoints
    ├── assets/                  # Brand images & SVG icons
    ├── data/
    │   └── suppliers.js         # Fictional demonstration dataset (Suppliers A–F, actions, logs)
    └── components/
        ├── common/
        │   ├── Badge.jsx        # RiskBadge, CertificateBadge, CriticalityBadge
        │   └── StateViews.jsx   # LoadingState, EmptyState, ErrorBanner
        ├── layout/
        │   ├── Header.jsx       # Header with breadcrumbs, search, and telemetry sync triggers
        │   └── Sidebar.jsx      # Persistent left navigation sidebar with badge indicators
        ├── dashboard/
        │   ├── SummaryCards.jsx # 4 executive KPI cards & quarterly price overpayment sum
        │   └── RiskDistribution.jsx # Risk breakdown bar & Supplier A threat spotlight
        ├── suppliers/
        │   ├── SupplierTable.jsx       # Filterable, sortable, searchable supplier table
        │   ├── SupplierDetailModal.jsx # Deep evidence inspection panel
        │   └── SupplierAnalysisModal.jsx # Preliminary rules-based diagnostic modal
        └── views/
            ├── OverviewView.jsx     # Executive dashboard view
            ├── SuppliersView.jsx    # Master supplier directory with CSV export
            ├── RiskAnalysisView.jsx # Multi-vector risk intelligence view (4 pillars)
            ├── DecisionsView.jsx    # Human-in-the-loop action approval pipeline
            └── ActivityView.jsx     # Real-time telemetry audit log stream
```

---

## Fictional Demonstration Dataset Notice

All supplier names, part numbers, facilities, contracts, metrics, and price variances in `src/data/suppliers.js` are **synthetic, fictional test data** created specifically for demonstration:

- **Supplier A (Apex Precision Castings)**: Critical metal casting; defect rate increased from 6.0% to 9.2%; contract price exceeded by +7.4% ($74K quarterly leakage); AS9100 certificate expires in 10 days; 25 days stock coverage; sole-source supplier.
- **Supplier B (Vanguard Microelectronics)**: Industrial microcontrollers; stable 0.4% rejection; price matches contract; valid certificate; 62 days stock coverage.
- **Supplier C (HydroTech Fluid Systems)**: Hydraulic seals; delivery delays increasing (OTIF 64.2%); low stock coverage (14 days vs 35-day target).
- **Supplier D (BioPac Sustainable Packaging)**: Packaging materials; low criticality commodity; stable 99.2% OTIF and 0.2% defect rate.
- **Supplier E (Rotary Precision Bearings)**: Precision bearings; defect rate increasing to 4.6%; certificate expires in 20 days; 34 days stock coverage.
- **Supplier F (Kinetic Dynamics Motor Works)**: Motor assemblies; unapproved +5.5% copper surcharge; delivery fulfillment degraded to 74.1%.

---

## Verification & Status

- **Build**: Passes cleanly with zero warnings/errors (`npm run build`).
- **Linter**: Passes cleanly with 0 warnings and 0 errors (`npm run lint`).
- **Phase 1**: Fully completed and self-contained. Ready for Phase 2 agentic workflows.
