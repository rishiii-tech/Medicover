import React, { useState, useEffect } from 'react';
import {
  Database,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Clock,
  Sparkles,
  GitBranch,
  ShieldCheck,
  Table,
  FileText
} from 'lucide-react';

export default function DataSourcesView({ onRefresh, isRefreshing }) {
  const [sourcesData, setSourcesData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sources');
      const json = await res.json();
      if (json.success) {
        setSourcesData(json.data);
      }
    } catch (err) {
      console.error('Error fetching sources:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !sourcesData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-medium text-slate-600">Loading Data Sources & Pipeline Lineage...</p>
        </div>
      </div>
    );
  }

  const { sources } = sourcesData;

  const pipelineStages = [
    { title: 'CSV Files', desc: 'Raw extracts from HIS, LIMS & Manual Bed sheets', status: 'Ingested' },
    { title: 'Date Normalizer', desc: 'Safe parsing of YYYY-MM-DD, DD/MM/YYYY & DD-MMM-YY', status: 'Normalized' },
    { title: 'Patient ID Bridge', desc: 'Prefix stripping (MCH-0001001 <-> 1001)', status: 'Unified' },
    { title: 'Ward Mapping', desc: 'Dictionary standardizing ICU, MICU, Paediatrics', status: 'Canonical' },
    { title: 'Duplicate Engine', desc: 'Detects duplicate admissions & tags audit record', status: 'Deduplicated' },
    { title: 'Cross-Matching', desc: 'Matches Lab tests to HIS Inpatient Admissions', status: 'Reconciled' },
    { title: 'Discrepancy Matrix', desc: 'Compares Bed Sheet against Derived Census', status: 'Flagged' },
    { title: 'Unified Dashboard', desc: 'Single trusted hospital operations intelligence', status: 'Operational' }
  ];

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* View Header */}
      <div className="hospital-card p-6 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-700" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Data Sources & End-to-End Pipeline
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time inspection of source systems, raw schemas, ingestion metrics, and data lineage
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold flex items-center gap-2 transition shadow-sm cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Re-run Ingestion & Reconciliation</span>
        </button>
      </div>

      {/* PIPELINE ARCHITECTURE FLOW */}
      <div className="hospital-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-sky-700" />
            Hospital Operations Data Ingestion & Transformation Pipeline
          </h2>
          <span className="text-xs text-emerald-800 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Pipeline Healthy
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {pipelineStages.map((stage, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 relative group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold text-sky-800">STAGE 0{idx + 1}</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {stage.status}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">{stage.title}</h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{stage.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3 SOURCE SYSTEM CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-700" />
            Active Source System Datasets (1,046 Total Records)
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {sources.map((src) => (
            <div key={src.id} className="hospital-card p-5 border-slate-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">{src.systemName}</h3>
                      <span className="font-mono text-[11px] text-slate-500 font-semibold">{src.file}</span>
                    </div>
                  </div>
                </div>

                <div className="my-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-baseline justify-between">
                  <span className="text-xs text-slate-600 font-medium">Total Ingested Records:</span>
                  <span className="text-xl font-extrabold text-slate-900">{src.recordCount} records</span>
                </div>

                <p className="text-xs text-slate-600 mb-3 leading-relaxed">{src.description}</p>

                {/* Columns */}
                <div className="space-y-1.5 mb-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Dataset Schema ({src.columns.length} Fields)
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {src.columns.map((col) => (
                      <span key={col} className="px-2 py-0.5 rounded bg-white text-slate-700 font-mono text-[10px] border border-slate-200 font-medium">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sample Rows */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Sample Raw Record
                  </span>
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-700 font-mono text-[10px] overflow-x-auto border border-slate-200">
                    {src.sampleRows[0]?._raw || 'No sample available'}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {src.qualityBadge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
