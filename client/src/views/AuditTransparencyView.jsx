import React, { useState } from 'react';
import {
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Code,
  Layers,
  Sparkles,
  Info,
  Printer,
  Users,
  BedDouble,
  FlaskConical,
  Eye,
  Check,
  ArrowRight,
  Search,
  Filter
} from 'lucide-react';

export default function AuditTransparencyView() {
  const [viewMode, setViewMode] = useState('simple'); // 'simple' or 'technical'
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const handlePrint = () => {
    window.print();
  };

  const rules = [
    {
      id: 'RULE-01',
      category: 'PATIENTS',
      categoryLabel: 'Patient Admissions',
      icon: Users,
      iconColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      title: 'How We Count Real Admitted Patients',
      technicalName: 'Current Admitted Inpatients Ledger',
      currentValue: '56 Inpatients in Beds Today',
      plainEnglish: 'If a patient arrived and hasn\'t been formally discharged home yet, they are counted as currently admitted. If an admission record was accidentally clicked twice by the front desk, our rule keeps only one copy so beds aren\'t wrongly blocked.',
      whyItMatters: 'Prevents ghost patients and double-counting so your census matches real people sleeping in hospital beds.',
      visualFlow: [
        { label: 'Total Ingested Records', val: '309 rows' },
        { label: 'Minus Accidental Duplicates', val: '-6 rows' },
        { label: 'Minus Discharged Home', val: '-247 discharged' },
        { label: 'Currently in Hospital Beds', val: '= 56 Active', highlight: true }
      ],
      technicalDetails: {
        source: '01_his_admissions_discharges.csv (HIS Ledger)',
        formula: 'Admission Datetime <= Selected Date 23:59:59 AND (Discharge Datetime is NULL OR Discharge Datetime > Selected Date 00:00:00) AND Duplicate Row = False',
        confidence: '100% Deterministic'
      }
    },
    {
      id: 'RULE-02',
      category: 'BEDS',
      categoryLabel: 'Bed Occupancy',
      icon: BedDouble,
      iconColor: 'text-sky-700 bg-sky-50 border-sky-200',
      title: 'Physical Floor Headcounts vs Computer Records',
      technicalName: 'Bed Occupancy & Capacity Utilization',
      currentValue: '61% (60 Occupied / 98 Total Beds)',
      plainEnglish: 'Every morning, floor nurses walk each ward and count who is physically in bed (60 beds). The computer system shows 56. Why the difference? Daycare chemotherapy patients and patients waiting for discharge paperwork. We show you both numbers transparently instead of forcing a fake match.',
      whyItMatters: 'You always know the real physical bed availability for incoming emergency admissions without hidden surprises.',
      visualFlow: [
        { label: 'Physical Floor Headcount', val: '60 Beds Counted' },
        { label: 'HIS Electronic Census', val: '56 Inpatients' },
        { label: 'Explained Discrepancy', val: 'Δ +4 (Daycare / Paperwork)', highlight: true }
      ],
      technicalDetails: {
        source: '03_bed_occupancy_manual.csv + 01_his_admissions_discharges.csv',
        formula: 'Reported Manual Occupied Count as operational snapshot; Compare against HIS Active Census per ward; Flag delta (Δ).',
        confidence: 'Dual-Source Reconciled'
      }
    },
    {
      id: 'RULE-03',
      category: 'SAFETY',
      categoryLabel: 'Safety & Missing Data',
      icon: AlertTriangle,
      iconColor: 'text-amber-700 bg-amber-50 border-amber-200',
      title: 'Handling Missing Shift Sheets (Never Assume Zero!)',
      technicalName: 'Missing Bed Sheet Imputation Guard',
      currentValue: 'July 09, 12, 19, 27 Safely Protected',
      plainEnglish: 'If a busy floor nurse forgets to turn in their morning bed clipboard, generic software would assume 0 patients were admitted. Our rule protects against this disaster: it marks the clipboard as "Data unavailable" and safely uses the verified electronic admissions count instead.',
      whyItMatters: 'Guarantees the hospital executive report never shows a fake 0% occupancy drop on days with missing paperwork.',
      visualFlow: [
        { label: 'Missing Clipboard Sheet', val: 'July 09, 12, 19, 27' },
        { label: 'Unsafe Default (Avoided)', val: '0 Beds Occupied ❌' },
        { label: 'Our Protected Action', val: 'Data Unavailable + Safe HIS Count ✅', highlight: true }
      ],
      technicalDetails: {
        source: '03_bed_occupancy_manual.csv (Floor Log)',
        formula: 'IF Date NOT IN BedSheetDates THEN Display "Data unavailable" AND Display HIS Active Count',
        confidence: 'Rule-Governed Safety Guard'
      }
    },
    {
      id: 'RULE-04',
      category: 'LABS',
      categoryLabel: 'Lab Turnaround',
      icon: FlaskConical,
      iconColor: 'text-purple-700 bg-purple-50 border-purple-200',
      title: 'Tracking Blood Test Latency & SLA Delays',
      technicalName: 'Laboratory Turnaround Time (TAT) Pipeline',
      currentValue: 'Mean TAT: 9.3 Hours (579 Done, 28 In Queue)',
      plainEnglish: 'We measure diagnostic turnaround in two clear phases: (1) Time taken from doctor order to drawing the sample, and (2) Time for analyzer machines to verify and post results. If a test is still running in the analyzer, we never guess — we track it live in the pending queue.',
      whyItMatters: 'Pinpoints whether laboratory bottlenecks are caused by phlebotomy sample collection delays or machine processing queues.',
      visualFlow: [
        { label: 'Phase 1: Phlebotomy Draw', val: '~4.5 Hours' },
        { label: 'Phase 2: Machine Analyzer', val: '~4.8 Hours' },
        { label: 'Total End-to-End TAT', val: '9.3 Hours Average', highlight: true }
      ],
      technicalDetails: {
        source: '02_lab_order_to_result.csv (LIMS Diagnostic Export)',
        formula: 'Total TAT = (Resulted At - Ordered At). Phase 1 = (Collected At - Ordered At). Phase 2 = (Resulted At - Collected At).',
        confidence: '100% Exact Timestamps'
      }
    },
    {
      id: 'RULE-05',
      category: 'LABS',
      categoryLabel: 'Lab Reconcilation',
      icon: ArrowRight,
      iconColor: 'text-sky-700 bg-sky-50 border-sky-200',
      title: 'Walk-In & Emergency Direct Diagnostic Tests',
      technicalName: 'Unmatched Outpatient Laboratory Reconciliation',
      currentValue: '34 Patients (42 Orders Preserved)',
      plainEnglish: '34 patients had emergency blood tests or outpatient lab work done without ever staying overnight in an inpatient bed. Rigid systems delete these records because there is no matching admission bed. Our rule automatically labels them "Outpatient Direct" so laboratory staff get full credit for their work.',
      whyItMatters: 'No lab orders are lost or deleted, giving lab managers 100% accurate workload tracking.',
      visualFlow: [
        { label: 'Total Lab Orders', val: '607 Requisitions' },
        { label: 'Matched Inpatient Beds', val: '565 Orders' },
        { label: 'Emergency / Outpatient Walk-Ins', val: '42 Orders (100% Preserved)', highlight: true }
      ],
      technicalDetails: {
        source: '02_lab_order_to_result.csv cross-referenced with HIS Ledger',
        formula: 'IF Lab Patient ID NOT FOUND in HIS Inpatient Admissions THEN Retain Order AND Tag as "Outpatient Direct"',
        confidence: 'Cross-System Reconciled'
      }
    },
    {
      id: 'RULE-06',
      category: 'SAFETY',
      categoryLabel: 'Deduplication',
      icon: Check,
      iconColor: 'text-teal-700 bg-teal-50 border-teal-200',
      title: 'Eliminating Accidental Duplicate Paperwork',
      technicalName: 'HIS Inpatient Admission Deduplication Rule',
      currentValue: '6 Duplicate Rows Safely Filtered',
      plainEnglish: 'When admissions staff double-click the "Submit" button or enter a patient twice at the exact same minute, our deduplication rule flags the duplicate, keeps the original admission, and stops your hospital dashboard from counting phantom patients.',
      whyItMatters: 'Stops artificial census inflation and ensures ward beds aren\'t falsely locked by clerical errors.',
      visualFlow: [
        { label: 'Identical Duplicate Rows', val: '6 Discovered' },
        { label: 'Primary Row Action', val: 'Preserved in Census' },
        { label: 'Duplicate Copy Action', val: 'Archived in Audit Log', highlight: true }
      ],
      technicalDetails: {
        source: '01_his_admissions_discharges.csv',
        formula: 'Identify identical (Patient ID + Admission Datetime) combinations. Preserve primary row in census; flag secondary row in audit log.',
        confidence: 'Exact Match Deduplicated'
      }
    }
  ];

  const filteredRules = rules.filter(r => {
    if (categoryFilter !== 'ALL' && r.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.plainEnglish.toLowerCase().includes(q) ||
        r.whyItMatters.toLowerCase().includes(q) ||
        r.currentValue.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* View Header */}
      <div className="hospital-card p-6 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-sky-700" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Audit Transparency & Derivation Rulebook
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            "Where did this number come from?" — Plain-English operational explanations and mathematical derivation rules
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mode Toggle: Plain English vs Technical */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
            <button
              onClick={() => setViewMode('simple')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'simple'
                  ? 'bg-white text-sky-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Simple Plain-English</span>
            </button>
            <button
              onClick={() => setViewMode('technical')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'technical'
                  ? 'bg-white text-sky-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-slate-500" />
              <span>Technical / Formulas</span>
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 border border-slate-200 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Rulebook</span>
          </button>
        </div>
      </div>

      {/* QUICK EXPLAINER HERO BANNER */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-white to-sky-50/50 border border-sky-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-100 text-sky-800 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-extrabold text-slate-900 text-sm">
              Zero Hidden Assumptions & 100% Explainable Metrics
            </h3>
            <p className="text-slate-600 max-w-3xl leading-relaxed">
              Every single bed count, turnaround time, and census figure displayed on this dashboard is governed by these 6 rules. No records are ever secretly deleted or guessed.
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0 self-start md:self-auto">
          ✓ All 6 Rules Active
        </span>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 hospital-card p-3.5 border-slate-200">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 mr-1.5">Filter by:</span>
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              categoryFilter === 'ALL'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Rules (6)
          </button>
          <button
            onClick={() => setCategoryFilter('BEDS')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              categoryFilter === 'BEDS'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🛏️ Beds & Wards
          </button>
          <button
            onClick={() => setCategoryFilter('PATIENTS')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              categoryFilter === 'PATIENTS'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            👥 Inpatient Census
          </button>
          <button
            onClick={() => setCategoryFilter('LABS')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              categoryFilter === 'LABS'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🧪 Lab Turnaround
          </button>
          <button
            onClick={() => setCategoryFilter('SAFETY')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              categoryFilter === 'SAFETY'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🛡️ Safety & Deduplication
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search rules (e.g. bed, duplicate)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-600"
          />
        </div>
      </div>

      {/* RULES CARDS */}
      <div className="space-y-4">
        {filteredRules.map((rule, idx) => {
          const Icon = rule.icon;
          return (
            <div
              key={rule.id}
              className="hospital-card p-5 border-slate-200 transition space-y-4 hover:border-slate-300 hover:shadow-sm"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl border ${rule.iconColor} shrink-0 mt-0.5`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase">
                        {rule.id}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {rule.categoryLabel}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight mt-0.5">
                      {rule.title}
                    </h3>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left sm:text-right shrink-0">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Current Operational Result</span>
                  <span className="text-xs font-black text-emerald-800">{rule.currentValue}</span>
                </div>
              </div>

              {/* View Mode 1: SIMPLE PLAIN-ENGLISH MODE (Default) */}
              {viewMode === 'simple' ? (
                <div className="space-y-3.5 text-xs">
                  {/* The Plain English Rule */}
                  <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100 space-y-1">
                    <span className="text-[10px] font-black text-sky-900 uppercase tracking-wider block">
                      🗣️ What This Rule Does in Plain Words:
                    </span>
                    <p className="text-slate-800 text-sm font-medium leading-relaxed">
                      {rule.plainEnglish}
                    </p>
                  </div>

                  {/* Why it matters */}
                  <div className="flex items-start gap-2.5 text-slate-700 bg-white p-3 rounded-xl border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 font-bold">Why this matters to operations: </strong>
                      <span className="text-slate-600">{rule.whyItMatters}</span>
                    </div>
                  </div>

                  {/* Visual Step-by-Step Flow */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                      📊 Step-by-Step Data Flow:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
                      {rule.visualFlow.map((step, sIdx) => (
                        <div
                          key={sIdx}
                          className={`p-2 rounded-lg border ${
                            step.highlight
                              ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-300'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <span className="text-[10px] text-slate-500 block font-semibold truncate" title={step.label}>
                            {step.label}
                          </span>
                          <strong className={`text-xs block mt-0.5 ${step.highlight ? 'text-emerald-900 font-black' : 'text-slate-900'}`}>
                            {step.val}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* View Mode 2: TECHNICAL / AUDITOR FORMULAS MODE */
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Raw Source Dataset</span>
                      <p className="text-slate-900 font-bold font-mono text-xs">{rule.technicalDetails.source}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Confidence & Verification</span>
                      <p className="text-emerald-700 font-bold text-xs">{rule.technicalDetails.confidence}</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs space-y-1 shadow-inner">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase block">Exact Derivation Formula</span>
                    <p className="break-words leading-relaxed text-cyan-100">{rule.technicalDetails.formula}</p>
                  </div>
                </div>
              )}

              {/* Footer Badge */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Rule Engine: <strong>Active & Enforced in Pipeline</strong></span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Fully Audited
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
