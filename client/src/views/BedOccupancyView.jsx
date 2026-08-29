import React, { useState, useEffect } from 'react';
import {
  BedDouble,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Filter,
  Info,
  Clock,
  Printer,
  ChevronDown,
  ChevronUp,
  User,
  UserPlus,
  ArrowRightLeft,
  UserMinus,
  Sparkles,
  X
} from 'lucide-react';

export default function BedOccupancyView({
  selectedDate,
  setSelectedDate,
  onOpenConflict,
  onOpenAction
}) {
  const [bedData, setBedData] = useState(null);
  const [wardFilter, setWardFilter] = useState('ALL');
  const [bedStatusFilter, setBedStatusFilter] = useState('ALL'); // ALL, VACANT, RESERVED
  const [expandedWards, setExpandedWards] = useState({});
  const [selectedBedModal, setSelectedBedModal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBedData(selectedDate);
  }, [selectedDate]);

  const fetchBedData = async (date) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/beds?date=${date}`);
      const json = await res.json();
      if (json.success) {
        setBedData(json.data);
        // By default expand all wards so beds are immediately visible
        const initialExpanded = {};
        json.data.wards.forEach(w => {
          initialExpanded[w.ward] = true;
        });
        setExpandedWards(initialExpanded);
      }
    } catch (err) {
      console.error('Error loading bed occupancy:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleWardExpand = (wardName) => {
    setExpandedWards(prev => ({
      ...prev,
      [wardName]: !prev[wardName]
    }));
  };

  if (loading || !bedData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-medium text-slate-600">Loading Ward Occupancy & Census Ledger...</p>
        </div>
      </div>
    );
  }

  const { hasManualData, statusMessage, wards, timelineSummary } = bedData;

  const filteredWards = wards.filter(w => {
    if (wardFilter === 'ALL') return true;
    return w.ward.toLowerCase().includes(wardFilter.toLowerCase());
  });

  const totalCapacity = wards.reduce((a, b) => a + b.totalCapacity, 0);
  const totalManualOccupied = hasManualData ? wards.reduce((a, b) => a + (b.manualOccupied || 0), 0) : null;
  const totalHisOccupied = wards.reduce((a, b) => a + b.hisOccupiedCount, 0);
  const totalOccupied = totalManualOccupied !== null ? totalManualOccupied : totalHisOccupied;
  const totalAvailable = Math.max(0, totalCapacity - totalOccupied);
  const overallOccupancyPct = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  // Hospital-wide bed counts
  const allBeds = wards.flatMap(w => w.bedRoster || []);
  const hospitalVacantBeds = allBeds.filter(b => b.status === 'VACANT').length;
  const hospitalReservedBeds = allBeds.filter(b => b.status === 'RESERVED').length;

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 hospital-card p-5 border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-sky-700" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Bed Occupancy & Census Reconciliation
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reconciling Daily Manual Floor Headcounts against HIS Inpatient Admission Ledgers
          </p>
        </div>

        {/* Date Selector, Ward Filter, Action & Print Button */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onOpenAction && onOpenAction('admit')}
            className="px-3.5 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <span>+ Admit Patient</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Handover Sheet</span>
          </button>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-sky-700" />
            <span className="text-slate-500 font-medium">Date:</span>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
            >
              {timelineSummary.map((t) => (
                <option
                  key={t.date}
                  value={t.date}
                  className="bg-white text-slate-900"
                >
                  {t.displayDate} {t.discrepancyCount > 0 ? `(${t.discrepancyCount} Δ)` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All 5 Clinical Wards</option>
              <option value="ICU">ICU</option>
              <option value="MICU">MICU</option>
              <option value="General Ward A">General Ward A</option>
              <option value="General Ward B">General Ward B</option>
              <option value="Paediatrics">Paediatrics</option>
            </select>
          </div>
        </div>
      </div>

      {/* RECONCILIATION INTEGRITY BANNER FOR SELECTED DATE */}
      {!hasManualData ? (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold text-amber-900">
              Manual Bed Census Unavailable for {selectedDate}
            </strong>
            <p className="text-amber-800 leading-relaxed">
              No manual nursing sheet was submitted on this date. In accordance with Rule RULE-03, this system does <strong>not assume 0 beds</strong>. Instead, active inpatients derived from HIS continuous streams are utilized for operational capacity reporting.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-emerald-900 font-medium">
              Dual-source reconciliation active for <strong>{selectedDate}</strong>: Manual Floor Count reconciled alongside HIS Inpatient Ledger.
            </span>
          </div>
          <span className="badge-resolved shrink-0">100% Traceable</span>
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="hospital-card p-4 space-y-1">
          <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] block">
            Total Capacity
          </span>
          <p className="text-2xl font-extrabold text-slate-900">{totalCapacity}</p>
          <span className="text-[11px] text-slate-500 font-medium">Operational Beds</span>
        </div>

        <div className="hospital-card p-4 space-y-1">
          <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] block">
            Occupied Beds
          </span>
          <p className="text-2xl font-extrabold text-slate-900">
            {totalOccupied}
            {totalHisOccupied !== totalOccupied && (
              <span className="text-xs text-purple-700 ml-1.5 font-bold">
                (HIS: {totalHisOccupied})
              </span>
            )}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">
            {hasManualData ? 'Reported Floor Count' : 'HIS Census Derived'}
          </span>
        </div>

        <div className="hospital-card p-4 space-y-1">
          <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] block">
            Available Beds
          </span>
          <p className="text-2xl font-extrabold text-emerald-700">{totalAvailable}</p>
          <span className="text-[11px] text-slate-500 font-medium">Vacant / Ready</span>
        </div>

        <div className="hospital-card p-4 space-y-1">
          <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] block">
            Occupancy Rate
          </span>
          <p className={`text-2xl font-extrabold ${overallOccupancyPct > 85 ? 'text-rose-700' : 'text-slate-900'}`}>
            {overallOccupancyPct}%
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Hospital-Wide Utilization</span>
        </div>
      </div>

      {/* WARD RECONCILIATION CARDS WITH INTERACTIVE BED NUMBERS ROSTER */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-700" />
              Ward Occupancy & Bed Allocation Roster
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status of each bed number across wards: 🟢 Vacant (Ready to Admit) vs 🔴 Reserved (Occupied by Inpatient)
            </p>
          </div>

          {/* Bed Status Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setBedStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition ${
                bedStatusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Beds ({totalCapacity})
            </button>
            <button
              onClick={() => setBedStatusFilter('VACANT')}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
                bedStatusFilter === 'VACANT'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Vacant ({hospitalVacantBeds})</span>
            </button>
            <button
              onClick={() => setBedStatusFilter('RESERVED')}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
                bedStatusFilter === 'RESERVED'
                  ? 'bg-white text-rose-800 shadow-xs'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Reserved ({hospitalReservedBeds})</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {filteredWards.map((w) => {
            const occ = w.manualOccupied !== null ? w.manualOccupied : w.hisOccupiedCount;
            const pct = Math.round((occ / w.totalCapacity) * 100);
            const isHigh = pct >= 80;
            const isExpanded = expandedWards[w.ward] !== false;

            const wardBeds = (w.bedRoster || []).filter(b => {
              if (bedStatusFilter === 'VACANT') return b.status === 'VACANT';
              if (bedStatusFilter === 'RESERVED') return b.status === 'RESERVED';
              return true;
            });

            const vacantCount = (w.bedRoster || []).filter(b => b.status === 'VACANT').length;
            const reservedCount = (w.bedRoster || []).filter(b => b.status === 'RESERVED').length;

            return (
              <div
                key={w.ward}
                className={`hospital-card p-5 transition ${
                  w.hasDiscrepancy ? 'border-amber-300 bg-amber-50/20' : ''
                }`}
              >
                {/* Ward Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Ward Title & Badges */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{w.ward}</h3>
                      {w.hasDiscrepancy && (
                        <span className="badge-discrepancy">
                          Δ {w.delta > 0 ? `+${w.delta}` : w.delta} Bed Discrepancy
                        </span>
                      )}
                      {!w.hasManualData && (
                        <span className="badge-missing">
                          Data Unavailable (Manual Sheet)
                        </span>
                      )}
                      {!w.hasDiscrepancy && w.hasManualData && (
                        <span className="badge-resolved">
                          Reconciled Match
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>Operational Capacity: <strong className="text-slate-800">{w.totalCapacity} beds</strong></span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">🟢 {vacantCount} Vacant</span>
                      <span>•</span>
                      <span className="text-rose-700 font-bold">🔴 {reservedCount} Reserved</span>
                    </div>
                  </div>

                  {/* Numbers Side by Side */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    {/* Manual Count */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 min-w-[130px]">
                      <span className="text-[10px] text-sky-800 font-bold block uppercase">
                        Manual Sheet
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-lg font-extrabold text-slate-900">
                          {w.manualOccupied !== null ? w.manualOccupied : 'N/A'}
                        </span>
                        <span className="text-[10px] text-slate-500">occupied</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        Available: {w.manualAvailable !== null ? w.manualAvailable : 'N/A'}
                      </span>
                    </div>

                    {/* HIS Derived Count */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 min-w-[130px]">
                      <span className="text-[10px] text-purple-800 font-bold block uppercase">
                        HIS Derived
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-lg font-extrabold text-purple-900">
                          {w.hisOccupiedCount}
                        </span>
                        <span className="text-[10px] text-slate-500">inpatients</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        Available: {Math.max(0, w.totalCapacity - w.hisOccupiedCount)}
                      </span>
                    </div>

                    {/* Occupancy Utilization */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 min-w-[110px] text-right">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">
                        Utilization
                      </span>
                      <span className={`text-lg font-extrabold ${isHigh ? 'text-rose-700' : 'text-amber-800'}`}>
                        {pct}%
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {occ}/{w.totalCapacity} Beds
                      </span>
                    </div>
                  </div>
                </div>

                {/* Capacity Visual Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex border border-slate-300">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHigh ? 'bg-rose-600' : pct > 60 ? 'bg-amber-500' : 'bg-sky-600'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>0 Beds</span>
                    <span>{pct}% Capacity Used</span>
                    <span>{w.totalCapacity} Total Beds</span>
                  </div>
                </div>

                {/* Remarks & Reconciliation Drill-down */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">Floor Nurse Note:</span>
                    <span className="text-slate-800 font-semibold italic">
                      "{w.manualRemarks || 'None recorded'}"
                    </span>
                  </div>

                  {w.hasDiscrepancy && (
                    <button
                      onClick={() => onOpenConflict({
                        id: `CONF-BED-${w.ward}`,
                        category: 'BED_OCCUPANCY_DISCREPANCY',
                        source: 'Manual Bed Sheet vs HIS Ledger',
                        entityId: `${selectedDate} [${w.ward}]`,
                        sourceValue: `Manual Sheet: ${w.manualOccupied} occupied (${w.manualRemarks || 'No remark'})`,
                        comparedValue: `HIS Ledger: ${w.hisOccupiedCount} actively admitted patients`,
                        conflictDetail: `Discrepancy of ${w.delta > 0 ? '+' + w.delta : w.delta} bed(s). Difference explained by floor remarks.`,
                        resolutionRule: 'Both figures retained for operational review.',
                        finalOperationalValue: `Reported: ${w.manualOccupied} | HIS: ${w.hisOccupiedCount}`,
                        confidence: 'HIGH (Deterministic)',
                        status: 'Resolved'
                      })}
                      className="text-sky-700 hover:text-sky-900 font-bold underline text-xs text-left sm:text-right cursor-pointer"
                    >
                      View Discrepancy Resolution Rule →
                    </button>
                  )}
                </div>

                {/* INTERACTIVE BED NUMBERS GRID SECTION */}
                <div className="mt-4 pt-4 border-t border-slate-200/80">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                        Bed Numbers & Status Grid ({wardBeds.length} of {w.totalCapacity} beds shown)
                      </span>
                    </div>

                    <button
                      onClick={() => toggleWardExpand(w.ward)}
                      className="text-xs text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Collapse Bed Grid' : 'Expand Bed Grid'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                      {wardBeds.map((bed) => {
                        const isVacant = bed.status === 'VACANT';
                        return (
                          <div
                            key={bed.bedNumber}
                            onClick={() => setSelectedBedModal({ bed, ward: w.ward })}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all duration-150 relative group ${
                              isVacant
                                ? 'bg-emerald-50/60 hover:bg-emerald-100/70 border-emerald-200/90 text-emerald-950 shadow-2xs hover:shadow-xs'
                                : 'bg-rose-50/60 hover:bg-rose-100/70 border-rose-200/90 text-rose-950 shadow-2xs hover:shadow-xs'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-mono font-black text-xs">
                                {bed.bedNumber}
                              </span>
                              <span className={`w-2 h-2 rounded-full ${isVacant ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                            </div>

                            <div className="flex items-center gap-1.5 mb-1">
                              <BedDouble className={`w-3.5 h-3.5 ${isVacant ? 'text-emerald-600' : 'text-rose-600'}`} />
                              <span className={`text-[10px] font-extrabold uppercase tracking-wide ${
                                isVacant ? 'text-emerald-700' : 'text-rose-700'
                              }`}>
                                {isVacant ? 'Vacant' : 'Reserved'}
                              </span>
                            </div>

                            {/* Patient Info or Quick Action Note */}
                            {bed.patient ? (
                              <div className="text-[10px] text-slate-600 leading-tight">
                                <span className="font-bold text-slate-900 block truncate">{bed.patient.id}</span>
                                <span className="text-slate-500 truncate block">{bed.patient.gender} • {bed.patient.age}y</span>
                              </div>
                            ) : (
                              <div className="text-[10px] text-emerald-700 font-semibold italic">
                                Ready to Admit →
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BED DETAIL / CLINICAL ACTION MODAL */}
      {selectedBedModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2.5 rounded-2xl ${
                  selectedBedModal.bed.status === 'VACANT' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  <BedDouble className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Bed {selectedBedModal.bed.bedNumber}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedBedModal.ward}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedBedModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-600 font-medium">Current Bed Status:</span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase ${
                selectedBedModal.bed.status === 'VACANT'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}>
                {selectedBedModal.bed.status === 'VACANT' ? '🟢 Vacant (Available)' : '🔴 Reserved (Occupied)'}
              </span>
            </div>

            {/* Patient Information if Reserved */}
            {selectedBedModal.bed.patient ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                  Assigned Inpatient Record
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Patient ID / MRN</span>
                    <strong className="text-slate-900 font-mono">{selectedBedModal.bed.patient.id}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Demographics</span>
                    <strong className="text-slate-900">{selectedBedModal.bed.patient.age} yrs • {selectedBedModal.bed.patient.gender}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Admitting Dept</span>
                    <strong className="text-slate-900">{selectedBedModal.bed.patient.department}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Admission Timestamp</span>
                    <strong className="text-slate-900">{selectedBedModal.bed.patient.admissionDate}</strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center gap-2">
                  <button
                    onClick={() => {
                      const pat = {
                        normalizedPatientId: selectedBedModal.bed.patient.id,
                        canonicalWard: selectedBedModal.ward,
                        department: selectedBedModal.bed.patient.department
                      };
                      setSelectedBedModal(null);
                      onOpenAction && onOpenAction('transfer', pat);
                    }}
                    className="flex-1 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Transfer Ward</span>
                  </button>

                  <button
                    onClick={() => {
                      const pat = {
                        normalizedPatientId: selectedBedModal.bed.patient.id,
                        canonicalWard: selectedBedModal.ward
                      };
                      setSelectedBedModal(null);
                      onOpenAction && onOpenAction('discharge', pat);
                    }}
                    className="flex-1 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                    <span>Discharge Bed</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-3">
                <p className="text-emerald-900 leading-relaxed font-medium">
                  Bed <strong>{selectedBedModal.bed.bedNumber}</strong> in <strong>{selectedBedModal.ward}</strong> is fully cleaned, sanitized, and ready for immediate clinical admission.
                </p>

                <button
                  onClick={() => {
                    const ward = selectedBedModal.ward;
                    setSelectedBedModal(null);
                    onOpenAction && onOpenAction('admit', { canonicalWard: ward });
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Admit New Patient to this Bed</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
