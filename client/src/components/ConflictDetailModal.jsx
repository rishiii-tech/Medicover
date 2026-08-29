import React from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  FileText,
  ArrowRight,
  CheckCircle2,
  Database,
  Layers,
  HelpCircle,
  Building2
} from 'lucide-react';

export default function ConflictDetailModal({ conflict, onClose }) {
  if (!conflict) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="relative bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-sky-800 font-bold">{conflict.id}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700">
                  {conflict.category.replace(/_/g, ' ')}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                {conflict.entityId || 'Discrepancy Audit'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Conflict Explanation */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700">
            <span className="text-xs font-bold uppercase text-slate-500 block mb-1">Operational Discrepancy Summary</span>
            <p className="leading-relaxed font-medium">{conflict.conflictDetail}</p>
          </div>

          {/* Side-by-Side Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Source A */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-sky-800 mb-2">
                  <Database className="w-3.5 h-3.5" />
                  <span>SOURCE A: {conflict.source}</span>
                </div>
                <div className="p-3 rounded-lg bg-white border border-slate-200 font-mono text-xs text-slate-900 break-words font-medium">
                  {conflict.sourceValue}
                </div>
              </div>
              <span className="text-[10px] text-slate-500 mt-2 font-medium">Raw ingested source entry</span>
            </div>

            {/* Source B */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-purple-800 mb-2">
                  <Layers className="w-3.5 h-3.5" />
                  <span>SOURCE B / DERIVED LEDGER</span>
                </div>
                <div className="p-3 rounded-lg bg-white border border-slate-200 font-mono text-xs text-purple-950 break-words font-medium">
                  {conflict.comparedValue}
                </div>
              </div>
              <span className="text-[10px] text-slate-500 mt-2 font-medium">Cross-matched reference entity</span>
            </div>
          </div>

          {/* Applied Reconciliation Rule */}
          <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-extrabold text-sky-900 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-sky-700" />
              <span>Applied Reconciliation Rule</span>
            </div>
            <p className="text-xs text-sky-950 leading-relaxed font-medium">
              {conflict.resolutionRule}
            </p>
          </div>

          {/* Final Operational Resolution */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                Final Reconciled Operational Status
              </span>
              <p className="text-sm font-extrabold text-emerald-950">
                {conflict.finalOperationalValue}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block font-medium">Confidence</span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {conflict.confidence || 'HIGH'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>Audit Status: <strong className="text-emerald-700 font-bold">{conflict.status || 'Resolved'}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold transition shadow-sm cursor-pointer"
          >
            Close Audit Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
