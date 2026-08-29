import React, { useState } from 'react';
import {
  Search,
  Calendar,
  RefreshCw,
  Printer,
  Bell,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  PlusCircle,
  UserPlus,
  ArrowRightLeft,
  UserMinus,
  FlaskConical,
  ChevronDown
} from 'lucide-react';

export default function Header({
  activeTab,
  selectedDate,
  setSelectedDate,
  onOpenSearch,
  onOpenAiCopilot,
  isAiOpen,
  onRefresh,
  isRefreshing,
  onOpenActionModal,
  alertCount = 8,
  currentUser
}) {
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const isSupervisor = currentUser?.role === 'SUPERVISOR';

  const pageTitles = {
    dashboard: { title: 'Executive Operations Dashboard', subtitle: 'Real-time census, capacity utilization & diagnostic throughput' },
    beds: { title: 'Bed Occupancy & Census Reconciliation', subtitle: 'Daily ward capacity vs physical floor headcounts' },
    patients: { title: 'Patient Flow & Inpatient Roster', subtitle: 'Admissions, discharges, ward placements & department load' },
    labs: { title: 'Laboratory Turnaround (TAT) Intelligence', subtitle: 'Order-to-collection and analyzer processing SLAs' },
    resources: { title: 'Oxygen Cylinders & Blood Bank Inventory', subtitle: 'Real-time LMO pipeline, ward cylinders & 8 blood group reserves' },
    reconciliation: { title: 'Data Reconciliation Hub', subtitle: 'Cross-dataset discrepancy resolution with 100% explainability' },
    sources: { title: 'Data Sources & Transformation Pipeline', subtitle: 'Ingested raw schemas, dataset statistics & data lineage' },
    audit: { title: 'Audit Transparency & Derivation Rulebook', subtitle: 'Explicit mathematical formulas and exception criteria' },
  };

  const current = pageTitles[activeTab] || pageTitles.dashboard;

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-20 shadow-xs">
      <div className="px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Breadcrumbs & View Title */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-0.5">
            <span>Medicover Console</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-sky-700 font-bold capitalize">{activeTab}</span>
          </div>
          <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
            {current.title}
          </h1>
        </div>

        {/* Right: Global Actions & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Operations Action Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsActionsOpen(!isActionsOpen)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white transition shadow-md shadow-sky-600/20 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Operations Actions</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {isActionsOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    setIsActionsOpen(false);
                    onOpenActionModal('admit');
                  }}
                  className="w-full px-3.5 py-2.5 flex items-center gap-2.5 text-slate-700 hover:bg-sky-50 hover:text-sky-900 transition font-semibold text-left"
                >
                  <UserPlus className="w-4 h-4 text-sky-700" />
                  <div>
                    <span className="block font-bold">Admit Patient</span>
                    <span className="text-[10px] text-slate-400 font-normal">Allocate bed & update census</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsActionsOpen(false);
                    onOpenActionModal('transfer');
                  }}
                  className="w-full px-3.5 py-2.5 flex items-center gap-2.5 text-slate-700 hover:bg-sky-50 hover:text-sky-900 transition font-semibold text-left"
                >
                  <ArrowRightLeft className="w-4 h-4 text-amber-600" />
                  <div>
                    <span className="block font-bold">Transfer Ward</span>
                    <span className="text-[10px] text-slate-400 font-normal">Move patient between wards</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsActionsOpen(false);
                    onOpenActionModal('discharge');
                  }}
                  className="w-full px-3.5 py-2.5 flex items-center gap-2.5 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition font-semibold text-left"
                >
                  <UserMinus className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="block font-bold">Discharge Patient</span>
                    <span className="text-[10px] text-slate-400 font-normal">Complete stay & free up bed</span>
                  </div>
                </button>

                {!isSupervisor && (
                  <>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={() => {
                        setIsActionsOpen(false);
                        onOpenActionModal('lab');
                      }}
                      className="w-full px-3.5 py-2.5 flex items-center gap-2.5 text-slate-700 hover:bg-purple-50 hover:text-purple-900 transition font-semibold text-left cursor-pointer"
                    >
                      <FlaskConical className="w-4 h-4 text-purple-600" />
                      <div>
                        <span className="block font-bold">Order Lab Test</span>
                        <span className="text-[10px] text-slate-400 font-normal">Place diagnostic panel order</span>
                      </div>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Helix AI Button Trigger */}
          <button
            onClick={onOpenAiCopilot}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer border ${
              isAiOpen
                ? 'bg-sky-700 text-white border-sky-800'
                : 'bg-gradient-to-r from-sky-50 to-cyan-50 text-sky-900 border-sky-200 hover:border-sky-300'
            }`}
            title="Ask Helix about ICU beds, occupancy, lab TAT..."
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAiOpen ? 'text-amber-300' : 'text-sky-700'}`} />
            <span>Helix</span>
          </button>

          {/* Reporting Date Selector */}
          <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-300 rounded-xl px-3 py-1.5 text-xs transition">
            <Calendar className="w-3.5 h-3.5 text-sky-700 shrink-0" />
            <span className="text-slate-500 font-semibold hidden sm:inline">Date:</span>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
            >
              <option value="2026-07-30">30-Jul-2026 (Latest Shift)</option>
              <option value="2026-07-28">28-Jul-2026</option>
              <option value="2026-07-27">27-Jul-2026 ⚠️ (No Sheet)</option>
              <option value="2026-07-20">20-Jul-2026</option>
              <option value="2026-07-15">15-Jul-2026</option>
              <option value="2026-07-12">12-Jul-2026 ⚠️ (No Sheet)</option>
              <option value="2026-07-09">09-Jul-2026 ⚠️ (No Sheet)</option>
              <option value="2026-07-05">05-Jul-2026</option>
              <option value="2026-07-01">01-Jul-2026</option>
            </select>
          </div>

          {/* Quick Search */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
            title="Search Patient ID, Lab Order, Ward..."
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline-block bg-white text-slate-500 text-[10px] px-1.5 py-0.5 rounded border border-slate-200">⌘K</kbd>
          </button>

          {/* Print / Handover Report */}
          <button
            onClick={handlePrint}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 transition cursor-pointer"
            title="Print operational view"
          >
            <Printer className="w-4 h-4 text-slate-600" />
          </button>

          {/* Pipeline Re-sync */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 transition cursor-pointer"
            title="Re-run data reconciliation pipeline"
          >
            <RefreshCw className={`w-4 h-4 text-sky-700 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
