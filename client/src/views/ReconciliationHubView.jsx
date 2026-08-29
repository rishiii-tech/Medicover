import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  Copy,
  Layers,
  Database,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  Info,
  SlidersHorizontal,
  Printer
} from 'lucide-react';

export default function ReconciliationHubView({ onOpenConflict }) {
  const [reconciliationData, setReconciliationData] = useState(null);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReconciliation();
  }, []);

  const fetchReconciliation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reconciliation');
      const json = await res.json();
      if (json.success) {
        setReconciliationData(json.data);
      }
    } catch (err) {
      console.error('Error fetching reconciliation data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !reconciliationData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-medium text-slate-600">Loading Data Reconciliation & Audit Engine...</p>
        </div>
      </div>
    );
  }

  const { summary, conflicts, rules, duplicates, unmatchedLabs } = reconciliationData;

  const filteredConflicts = conflicts.filter((c) => {
    if (activeCategory === 'BED' && c.category !== 'BED_OCCUPANCY_DISCREPANCY') return false;
    if (activeCategory === 'DUP' && c.category !== 'DUPLICATE_RECORD') return false;
    if (activeCategory === 'UNMATCHED' && c.category !== 'UNMATCHED_LAB_RECORD') return false;
    if (activeCategory === 'MISSING' && c.category !== 'MISSING_BED_SHEET_DATE') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = c.id.toLowerCase().includes(q) || c.entityId.toLowerCase().includes(q);
      const matchSource = c.source.toLowerCase().includes(q);
      const matchDetail = c.conflictDetail.toLowerCase().includes(q);
      if (!matchId && !matchSource && !matchDetail) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* View Header */}
      <div className="hospital-card p-6 border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Data Reconciliation Hub & Audit Register
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-source reconciliation engine resolving discrepancies with 100% explainability
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 border border-slate-200 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Audit Log</span>
          </button>

          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {summary.conflictsResolved} of {summary.conflictsDetected} Discrepancies Reconciled
          </span>
        </div>
      </div>

      {/* 6 SUMMARY KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="hospital-card p-3.5 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Records Ingested</span>
          <span className="text-xl font-extrabold text-slate-900">{summary.recordsProcessed}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">3 Raw CSV sources</span>
        </div>

        <div className="hospital-card p-3.5 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Conflicts Found</span>
          <span className="text-xl font-extrabold text-amber-700">{summary.conflictsDetected}</span>
          <span className="text-[10px] text-amber-800 block mt-0.5">Discrepancy points</span>
        </div>

        <div className="hospital-card p-3.5 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Resolved</span>
          <span className="text-xl font-extrabold text-emerald-700">{summary.conflictsResolved}</span>
          <span className="text-[10px] text-emerald-800 block mt-0.5">100% Rule Governed</span>
        </div>

        <div className="hospital-card p-3.5 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Duplicates Handled</span>
          <span className="text-xl font-extrabold text-purple-700">{summary.duplicatesDetected}</span>
          <span className="text-[10px] text-purple-800 block mt-0.5">HIS duplicate rows</span>
        </div>

        <div className="hospital-card p-3.5 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Unmatched Labs</span>
          <span className="text-xl font-extrabold text-sky-700">{summary.unmatchedLabRecords}</span>
          <span className="text-[10px] text-sky-800 block mt-0.5">Outpatient orders</span>
        </div>

        <div className="hospital-card p-3.5 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Missing Bed Days</span>
          <span className="text-xl font-extrabold text-rose-700">{summary.missingBedDates}</span>
          <span className="text-[10px] text-rose-800 block mt-0.5">Flagged Non-Zero</span>
        </div>
      </div>

      {/* RECONCILIATION RULES ENGINE SHOWCASE */}
      <div className="hospital-card p-5 space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-sky-700" />
            Active Clinical Reconciliation Rulebook (7 Core Rules)
          </h2>
          <span className="text-xs text-slate-500">Deterministic Logic Applied to Ingested Data</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
          {rules.map((r) => (
            <div key={r.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 text-sky-800 font-bold">
                <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-mono text-[10px] border border-sky-200">
                  {r.id}
                </span>
                <span className="text-slate-900 text-xs font-bold">{r.name}</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed mt-1">
                {r.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* INTERACTIVE CONFLICT REGISTRY TABLE */}
      <div className="hospital-card p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-emerald-700" />
              Reconciliation Discrepancy Ledger ({filteredConflicts.length} entries)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any conflict row to open the complete resolution audit panel
            </p>
          </div>

          {/* Filter Tabs & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search conflicts, rules, IDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-600 w-44 sm:w-56"
              />
            </div>

            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setActiveCategory('ALL')}
                className={`px-2.5 py-1 rounded-md transition ${activeCategory === 'ALL' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                All ({conflicts.length})
              </button>
              <button
                onClick={() => setActiveCategory('BED')}
                className={`px-2.5 py-1 rounded-md transition ${activeCategory === 'BED' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Bed Census
              </button>
              <button
                onClick={() => setActiveCategory('DUP')}
                className={`px-2.5 py-1 rounded-md transition ${activeCategory === 'DUP' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Duplicates ({summary.duplicatesDetected})
              </button>
              <button
                onClick={() => setActiveCategory('UNMATCHED')}
                className={`px-2.5 py-1 rounded-md transition ${activeCategory === 'UNMATCHED' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Unmatched Labs ({summary.unmatchedLabRecords})
              </button>
              <button
                onClick={() => setActiveCategory('MISSING')}
                className={`px-2.5 py-1 rounded-md transition ${activeCategory === 'MISSING' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Missing Dates ({summary.missingBedDates})
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200 z-10">
              <tr>
                <th className="py-2.5 px-3">Conflict ID</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Entity Identifier</th>
                <th className="py-2.5 px-3">Source A Value</th>
                <th className="py-2.5 px-3">Source B / Derived Value</th>
                <th className="py-2.5 px-3">Applied Resolution Rule</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredConflicts.slice(0, 100).map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onOpenConflict(c)}
                  className="hover:bg-slate-50 cursor-pointer transition group"
                >
                  <td className="py-2.5 px-3 font-bold text-sky-800">
                    {c.id}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      c.category === 'BED_OCCUPANCY_DISCREPANCY' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      c.category === 'DUPLICATE_RECORD' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                      c.category === 'UNMATCHED_LAB_RECORD' ? 'bg-sky-100 text-sky-800 border border-sky-200' :
                      'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {c.category.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {c.entityId}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 text-[11px] max-w-[180px] truncate">
                    {c.sourceValue}
                  </td>
                  <td className="py-2.5 px-3 text-purple-900 text-[11px] max-w-[180px] truncate font-semibold">
                    {c.comparedValue}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-[220px] truncate text-[11px]">
                    {c.resolutionRule}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="badge-resolved group-hover:bg-emerald-100 transition">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
