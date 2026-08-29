# Medicover Operations Intelligence Dashboard

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/rishiii-tech/Medicover)

A human-designed, enterprise-grade **Hospital Operations Intelligence Dashboard & Data Reconciliation Engine** engineered for hospital Operations Leads and Clinical Administrators.

---

## 🌟 Key Features

1. **Integrated Operations Intelligence Command Center:**
   - Unified operational view reconciling **HIS Admissions**, **LIMS Diagnostic Orders**, and **Daily Floor Bed Occupancy Sheets** with 100% explainability.
   - Live reconciliation pipeline handling duplicates, date format discrepancies, unmatched outpatient records, and missing census dates without silent data loss.

2. **Interactive Clinical Management:**
   - **Admit Patient:** Real-time inpatient admission with auto-generated MRN, ward assignment, and department allocation.
   - **Ward Transfer:** Intra-hospital transfers between critical care (ICU, MICU) and general wards with automatic census updates.
   - **Clinical Discharge:** Processing patient discharges with disposition logs and instant bed clearance.
   - **Order Diagnostic Labs:** STAT, URGENT, and ROUTINE requisitioning with turnaround time (TAT) latency monitoring.

3. **Critical Resources & Blood Bank:**
   - **Oxygen Supply Infrastructure:** Central Liquid Medical Oxygen (LMO) tank volume (Liters, PSI, Autonomy days) and portable cylinder allocations across all hospital wards.
   - **Blood Bank (8 Blood Groups):** Real-time inventory tracking for `O+`, `O-`, `A+`, `A-`, `B+`, `B-`, `AB+`, and `AB-` across PRBC, FFP, and Platelets, featuring emergency blood requisitioning.

4. **Helix AI Assistant (Right Drawer):**
   - Natural language operations reasoning engine answering questions on bed availability, ward census, lab turnaround delays, oxygen cylinders, and blood group stocks.

5. **Human-Centric Clinical UI/UX:**
   - Clean white left navigation sidebar with elevated interactive button shadows.
   - Calm `#F5F8FC` clinical canvas minimizing visual fatigue.
   - Frosted glassmorphic authentication screen with clinical photography backdrop.

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- `npm` (version 9+ recommended)

### 1. Install Dependencies
In the root directory, install both server and client dependencies:
```bash
# Install root & server dependencies
npm install

# Install client dependencies
npm install --prefix client
```

### 2. Run the Application
Run both the backend Express API and the frontend Vite server concurrently:
```bash
npm run dev
```

- **Frontend Application:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

### 3. Production Build
To create a production-optimized build of the frontend:
```bash
npm run build
```

---

## 📁 Repository Structure

```
medicover/
├── client/                     # Vite + React 18 Frontend Application
│   ├── public/                 # Static assets (favicons, background images)
│   ├── src/
│   │   ├── components/         # Sidebar, Header, Helix AI Drawer, Modals
│   │   ├── views/              # Dashboard, Bed Occupancy, Patient Flow, Labs, Resources, Reconciliation
│   │   ├── App.jsx             # Main application component & routing
│   │   ├── index.css           # Tailwind + Custom Design System
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Node.js + Express API Backend
│   ├── index.js                # Server entry point & REST endpoints
│   └── pipeline/
│       ├── reconciliationEngine.js   # Ingestion, cleaning, matching & mutations
│       ├── resourcesManager.js       # Oxygen cylinders & 8 blood groups
│       └── aiAssistant.js            # Helix AI clinical reasoning engine
│
├── data/                       # Synthetic Hospital Datasets
│   ├── his_admissions.csv      # Hospital Information System census records
│   ├── lab_orders.csv          # Laboratory Information Management System orders
│   └── daily_bed_occupancy.csv # Manual floor nursing headcount sheets
│
├── package.json                # Root orchestration & concurrently scripts
└── README.md                   # Project documentation
```

---

## 🔐 Default Access Credentials

- **Username / Email:** `rajesh.varma@medicover.org` (or any valid email)
- **Password:** `Medicover2026!` (or any 6+ character password)
- **Role:** Operations Lead / Operations Manager
