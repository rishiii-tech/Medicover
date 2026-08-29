import React from 'react';
import {
  Users,
  BedDouble,
  FlaskConical,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  Info,
  Building2,
  FileSpreadsheet,
  Printer,
  Calendar
} from 'lucide-react';

export default function DashboardView({
  dashboardData,
  onNavigate,
  onOpenConflict,
  onOpenAction,
  selectedDate,
  setSelectedDate
}) {
  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-slate-600">Loading Reconciled Operations Command Center...</p>
        </div>
      </div>
    );
  }

  const { kpis, metadata, bedOccupancySnapshot, patientFlowSnapshot, labSnapshot, activeAlerts } = dashboardData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* OPERATIONS LEAD DAILY BRIEFING BANNER */}
      <div className="hospital-card p-6 sm:p-7 bg-gradient-to-r from-[#0C2D54] via-[#124177] to-[#1B325E] text-white shadow-xl shadow-sky-950/15 relative overflow-hidden border border-sky-600/30">
        {/* Decorative Ambient Radial Gradient Glow Orbs */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 -bottom-20 w-72 h-72 bg-sky-400/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-sky-400/25 to-cyan-400/25 text-cyan-200 border border-cyan-400/30 tracking-wider uppercase shadow-xs">
                Operations Lead Command
              </span>
              <span className="text-xs text-sky-200/90 font-medium">
                Reporting Date: <strong className="text-white font-bold">{selectedDate}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Hospital Operations Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-sky-100/90 mt-1.5 max-w-3xl leading-relaxed font-normal">
              Unified operational command reconciling Inpatient Admissions (HIS), Laboratory Turnaround (LIMS), and Daily Bed Occupancy Sheets with 100% explainability.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onOpenAction && onOpenAction('admit')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-emerald-950/30 cursor-pointer"
            >
              <span>+ Admit Patient</span>
            </button>

            <button
              onClick={() => onOpenAction && onOpenAction('lab')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-purple-950/30 cursor-pointer"
            >
              <span>+ Order Lab</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition border border-white/20 cursor-pointer backdrop-blur-xs"
              title="Print operational handover briefing"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Briefing</span>
            </button>

            <button
              onClick={() => onNavigate('reconciliation')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-300 hover:from-sky-300 hover:to-teal-200 text-slate-950 text-xs font-black flex items-center gap-2 transition shadow-lg shadow-sky-950/40 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              <span>Reconciliation Hub ({kpis.dataQuality.conflictsDetected})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 PRIMARY EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Patient Flow */}
        <div
          onClick={() => onNavigate('patients')}
          className="hospital-card hospital-card-hover p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Patient Flow</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-700 group-hover:translate-x-0.5 transition" />
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {kpis.patientFlow.currentAdmitted}
            </span>
            <span className="text-xs font-semibold text-slate-500">Admitted Inpatients</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
            <div>
              <span className="text-[11px] text-slate-500 block">Total Admissions</span>
              <span className="font-bold text-emerald-700 flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> {kpis.patientFlow.totalAdmissions}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Discharged</span>
              <span className="font-bold text-sky-700 flex items-center gap-0.5">
                <ArrowDownRight className="w-3.5 h-3.5" /> {kpis.patientFlow.totalDischarges}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Bed Occupancy */}
        <div
          onClick={() => onNavigate('beds')}
          className="hospital-card hospital-card-hover p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                <BedDouble className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Bed Occupancy</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition" />
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {kpis.beds.occupancyPercentage}%
            </span>
            <span className="text-xs font-semibold text-slate-500">Capacity In Use</span>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-2 mb-2 border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                kpis.beds.occupancyPercentage > 80 ? 'bg-rose-600' : 'bg-amber-500'
              }`}
              style={{ width: `${kpis.beds.occupancyPercentage}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[11px] text-slate-500 block">Occupied / Total</span>
              <span className="font-bold text-slate-800">{kpis.beds.occupiedBeds} / {kpis.beds.totalBeds} beds</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Available Beds</span>
              <span className="font-bold text-emerald-700">{kpis.beds.availableBeds} vacant</span>
            </div>
          </div>
        </div>

        {/* Card 3: Laboratory Turnaround */}
        <div
          onClick={() => onNavigate('labs')}
          className="hospital-card hospital-card-hover p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                <FlaskConical className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Lab Orders</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-700 group-hover:translate-x-0.5 transition" />
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {kpis.laboratory.totalOrders}
            </span>
            <span className="text-xs font-semibold text-slate-500">Diagnostic Tests</span>
          </div>

          <div className="grid grid-cols-3 gap-1 mt-3 pt-3 border-t border-slate-100 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block">Completed</span>
              <span className="font-bold text-emerald-700">{kpis.laboratory.completed}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">In Queue</span>
              <span className="font-bold text-amber-700">{kpis.laboratory.pending}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">SLA Delayed</span>
              <span className="font-bold text-rose-700">{kpis.laboratory.delayed}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Data Quality & Reconciliation */}
        <div
          onClick={() => onNavigate('reconciliation')}
          className="hospital-card hospital-card-hover p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Data Health</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition" />
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {kpis.dataQuality.reconciliationHealthScore}%
            </span>
            <span className="text-xs font-semibold text-emerald-700">Reconciled Index</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
            <div>
              <span className="text-[11px] text-slate-500 block">Discrepancies Resolved</span>
              <span className="font-bold text-emerald-700">{kpis.dataQuality.conflictsResolved} of {kpis.dataQuality.conflictsDetected}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Unmatched Labs</span>
              <span className="font-bold text-sky-700">{kpis.dataQuality.unmatchedLabRecords} outpatient</span>
            </div>
          </div>
        </div>
      </div>

      {/* CLINICAL OPERATIONAL ALERTS ROW */}
      <div className="hospital-card p-5 space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Clinical & Operational Alerts ({activeAlerts.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Computed strictly from cross-dataset reconciliation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {activeAlerts.slice(0, 3).map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                alert.severity === 'HIGH'
                  ? 'bg-rose-50/60 border-rose-200 hover:border-rose-300'
                  : alert.severity === 'MEDIUM'
                  ? 'bg-amber-50/60 border-amber-200 hover:border-amber-300'
                  : 'bg-sky-50/60 border-sky-200 hover:border-sky-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    alert.severity === 'HIGH' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                    alert.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    'bg-sky-100 text-sky-800 border border-sky-200'
                  }`}>
                    {alert.severity} PRIORITY
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">{alert.timestamp}</span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 mb-1 leading-snug">{alert.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{alert.message}</p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium truncate mr-2">
                  <strong>Action:</strong> {alert.action}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TWO-COLUMN SECTION: WARD CENSUS VS LAB SLA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Bed Capacity Snapshot */}
        <div className="lg:col-span-7 hospital-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-sky-700" />
                Ward Capacity & Census Discrepancy Matrix
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Reporting Date: <strong className="text-slate-800">{selectedDate}</strong> • Comparing Manual Floor Count vs HIS Active Census
              </p>
            </div>
            <button
              onClick={() => onNavigate('beds')}
              className="text-xs text-sky-700 hover:text-sky-800 font-bold flex items-center gap-1"
            >
              <span>Full Census View</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {bedOccupancySnapshot.wards.map((ward) => {
              const occ = ward.manualOccupied !== null ? ward.manualOccupied : ward.hisOccupiedCount;
              const pct = Math.round((occ / ward.totalCapacity) * 100);
              const isHigh = pct >= 80;

              return (
                <div key={ward.ward} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{ward.ward}</span>
                      {ward.hasDiscrepancy && (
                        <span className="badge-discrepancy">
                          Δ {ward.delta > 0 ? `+${ward.delta}` : ward.delta} Bed Discrepancy
                        </span>
                      )}
                      {!ward.hasManualData && (
                        <span className="badge-missing">
                          Manual Sheet Unavailable
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-600">
                        Manual: <strong className="text-slate-900">{ward.manualOccupied ?? 'N/A'}</strong> | HIS: <strong className="text-sky-800">{ward.hisOccupiedCount}</strong>
                      </span>
                      <span className={`font-bold ${isHigh ? 'text-rose-700' : 'text-slate-800'}`}>
                        {pct}% ({occ}/{ward.totalCapacity} beds)
                      </span>
                    </div>
                  </div>

                  {/* Visual Capacity Bar */}
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex border border-slate-300">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHigh ? 'bg-rose-600' : pct > 60 ? 'bg-amber-500' : 'bg-sky-600'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    ></div>
                  </div>

                  {/* Floor Notes */}
                  {ward.manualRemarks && (
                    <p className="text-[11px] text-slate-500 italic">
                      Nurse Floor Remark: "{ward.manualRemarks}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Lab Turnaround & Priority SLAs */}
        <div className="lg:col-span-5 hospital-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-purple-700" />
                Laboratory SLA Performance
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Mean TAT: <strong className="text-purple-900">{labSnapshot.summary.avgTotalTatHours}h</strong> • {labSnapshot.summary.totalOrders} Diagnostic Tests
              </p>
            </div>
            <button
              onClick={() => onNavigate('labs')}
              className="text-xs text-purple-700 hover:text-purple-800 font-bold flex items-center gap-1"
            >
              <span>View Lab Orders</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {labSnapshot.priorityBreakdown.map((pri) => (
              <div key={pri.priority} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      pri.priority === 'STAT' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                      pri.priority === 'URGENT' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      'bg-sky-100 text-sky-800 border border-sky-200'
                    }`}>
                      {pri.priority} (SLA Target: {pri.slaMinutes / 60}h)
                    </span>
                    <span className="text-xs text-slate-700 font-bold">{pri.total} Orders</span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900">
                    Mean TAT: {pri.avgTatHours}h
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 pt-1">
                  <div>
                    <span>Completed: </span>
                    <strong className="text-emerald-700">{pri.completed}</strong>
                  </div>
                  <div>
                    <span>In Queue: </span>
                    <strong className="text-amber-700">{pri.pending}</strong>
                  </div>
                  <div>
                    <span>SLA Delayed: </span>
                    <strong className="text-rose-700">{pri.delayed}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Process Phase Latency */}
          <div className="p-3.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
              Process Stage Breakdown
            </span>
            <div className="flex justify-between items-center text-slate-700">
              <span>Physician Order → Phlebotomy Draw:</span>
              <strong className="text-sky-800">{(labSnapshot.summary.avgOrderToCollectionMin / 60).toFixed(1)}h ({labSnapshot.summary.avgOrderToCollectionMin} mins)</strong>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span>Phlebotomy Draw → Lab Result Entry:</span>
              <strong className="text-purple-800">{(labSnapshot.summary.avgCollectionToResultMin / 60).toFixed(1)}h ({labSnapshot.summary.avgCollectionToResultMin} mins)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* RECONCILIATION TRANSPARENCY SPOTLIGHT */}
      <div className="hospital-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Reconciliation Integrity Highlights
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Handling real hospital inconsistencies without silently dropping conflicting records
            </p>
          </div>
          <button
            onClick={() => onNavigate('reconciliation')}
            className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs transition border border-sky-200"
          >
            Explore 158 Conflict Resolutions →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-purple-800 font-bold mb-1">
              <span>6 Duplicate HIS Records</span>
              <span className="badge-duplicate">Handled</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Detected duplicate inpatient admission rows. Primary record preserved; daily census count adjusted to avoid artificial bed inflation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-sky-800 font-bold mb-1">
              <span>34 Unmatched Lab Patients</span>
              <span className="badge-unmatched">Reconciled</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Lab orders without formal inpatient admission retained as Outpatient / Emergency Direct diagnostic orders.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-amber-800 font-bold mb-1">
              <span>4 Missing Bed Census Dates</span>
              <span className="badge-discrepancy">Preserved</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Unsubmitted nursing census days marked explicitly as "Data unavailable" with HIS active count retained.
            </p>
          </div>
        </div>
      </div>

      {/* CRITICAL SUPPLIES & BLOOD BANK OVERVIEW WIDGET */}
      <div className="hospital-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-700" />
              Oxygen Cylinders & Blood Bank Availability
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live hospital clinical supplies status across Liquid Medical Oxygen (LMO) and 8 Blood Group Reserves
            </p>
          </div>
          <button
            onClick={() => onNavigate('resources')}
            className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-900 font-bold text-xs transition border border-rose-200 cursor-pointer"
          >
            Manage Supplies & Requisitions →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Oxygen Summary */}
          <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 space-y-2">
            <div className="flex items-center justify-between text-sky-900 font-bold">
              <span className="text-xs uppercase tracking-wider">Medical Oxygen Infrastructure</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px]">58 PSI Pipeline (Stable)</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 bg-white rounded-lg border border-sky-100">
                <span className="text-[10px] text-slate-500 block font-semibold">LMO Level</span>
                <strong className="text-sm font-black text-slate-900">7,850 L</strong>
              </div>
              <div className="p-2 bg-white rounded-lg border border-sky-100">
                <span className="text-[10px] text-slate-500 block font-semibold">Full Cylinders</span>
                <strong className="text-sm font-black text-emerald-700">48 Ready</strong>
              </div>
              <div className="p-2 bg-white rounded-lg border border-sky-100">
                <span className="text-[10px] text-slate-500 block font-semibold">Autonomy</span>
                <strong className="text-sm font-black text-sky-800">18.6 Days</strong>
              </div>
            </div>
          </div>

          {/* Blood Bank Summary */}
          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
            <div className="flex items-center justify-between text-rose-900 font-bold">
              <span className="text-xs uppercase tracking-wider">Blood Bank Inventory (8 Groups)</span>
              <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 text-[10px] font-bold">129 Total Units</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center pt-1 font-mono">
              <div className="p-1.5 bg-white rounded-lg border border-rose-100">
                <span className="text-[10px] text-slate-500 block font-bold">O+</span>
                <strong className="text-xs font-black text-slate-900">34 U</strong>
              </div>
              <div className="p-1.5 bg-rose-100 rounded-lg border border-rose-300">
                <span className="text-[10px] text-rose-800 block font-bold">O- ⚠️</span>
                <strong className="text-xs font-black text-rose-950">9 U</strong>
              </div>
              <div className="p-1.5 bg-white rounded-lg border border-rose-100">
                <span className="text-[10px] text-slate-500 block font-bold">A+</span>
                <strong className="text-xs font-black text-slate-900">26 U</strong>
              </div>
              <div className="p-1.5 bg-rose-200 rounded-lg border border-rose-400">
                <span className="text-[10px] text-rose-900 block font-bold">AB- 🔴</span>
                <strong className="text-xs font-black text-rose-950">4 U</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
