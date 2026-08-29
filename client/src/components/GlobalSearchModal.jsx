import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  User,
  FlaskConical,
  BedDouble,
  ArrowRight,
  Clock,
  ShieldAlert
} from 'lucide-react';

export default function GlobalSearchModal({ isOpen, onClose, onSelectResult }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ patients: [], labs: [], wards: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ patients: [], labs: [], wards: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ patients: [], labs: [], wards: [] });
      return;
    }

    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        if (json.success) {
          setResults(json.data.results);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(handler);
  }, [query]);

  if (!isOpen) return null;

  const totalResults = results.patients.length + results.labs.length + results.wards.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-start justify-center pt-16 p-4 font-sans">
      <div className="relative bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-slate-200 bg-slate-50">
          <Search className="w-5 h-5 text-sky-700 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search Patient ID (e.g. MCH-0001001, 1023), Lab Order (LAB500001), Ward, or Department..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full py-4 bg-transparent text-slate-900 placeholder-slate-400 text-sm focus:outline-none font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 mr-2">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-2.5 py-1 rounded-md border border-slate-300">
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {loading && (
            <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Searching hospital operational registry...</span>
            </div>
          )}

          {!loading && query && totalResults === 0 && (
            <div className="py-8 text-center text-slate-500 text-sm">
              No matching records found for "{query}".
            </div>
          )}

          {!loading && !query && (
            <div className="py-6 text-center text-xs text-slate-500">
              Type a patient ID, test name, department, or clinical ward to search.
            </div>
          )}

          {/* Patient Results */}
          {results.patients.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-sky-800 uppercase tracking-wider mb-2 px-2">
                <User className="w-3.5 h-3.5" />
                <span>Inpatients ({results.patients.length})</span>
              </div>
              <div className="space-y-1.5">
                {results.patients.map((pat) => (
                  <div
                    key={pat.id}
                    onClick={() => {
                      onSelectResult({ type: 'patient', data: pat });
                      onClose();
                    }}
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 cursor-pointer flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs">
                        {pat.gender === 'Male' ? 'M' : 'F'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">{pat.normalizedPatientId}</span>
                          <span className="text-[11px] text-slate-500 font-medium">(Source: {pat.sourcePatientId})</span>
                        </div>
                        <p className="text-xs text-slate-700">
                          {pat.canonicalWard} • {pat.department} • Age {pat.age}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pat.isCurrentlyAdmitted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                        {pat.isCurrentlyAdmitted ? 'Admitted' : 'Discharged'}
                      </span>
                      <span className="block text-[10px] text-slate-500 mt-1">Adm: {pat.admissionDateStr}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lab Results */}
          {results.labs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-purple-800 uppercase tracking-wider mb-2 px-2">
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Laboratory Diagnostic Orders ({results.labs.length})</span>
              </div>
              <div className="space-y-1.5">
                {results.labs.map((lab) => (
                  <div
                    key={lab.id}
                    onClick={() => {
                      onSelectResult({ type: 'lab', data: lab });
                      onClose();
                    }}
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 cursor-pointer flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
                        LAB
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">{lab.orderId}</span>
                          <span className="text-xs font-bold text-purple-900">{lab.testName}</span>
                        </div>
                        <p className="text-xs text-slate-700">
                          Patient: {lab.normalizedPatientId} • {lab.department}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        lab.priority === 'STAT' ? 'bg-rose-100 text-rose-800' :
                        lab.priority === 'URGENT' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                      }`}>
                        {lab.priority}
                      </span>
                      <span className="block text-[10px] text-slate-500 mt-1 font-medium">
                        {lab.isCompleted ? `TAT: ${(lab.totalTatMin / 60).toFixed(1)}h` : 'In Queue'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ward Results */}
          {results.wards.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 px-2">
                <BedDouble className="w-3.5 h-3.5" />
                <span>Clinical Wards ({results.wards.length})</span>
              </div>
              <div className="space-y-1.5">
                {results.wards.map((w, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      onSelectResult({ type: 'ward', data: w });
                      onClose();
                    }}
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 cursor-pointer flex items-center justify-between transition"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{w.ward}</h4>
                      <p className="text-xs text-slate-600">
                        Manual Sheet: {w.manualOccupied ?? 'N/A'} beds • HIS Census: {w.hisOccupiedCount} inpatients
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700">
                      Capacity: {w.totalCapacity} beds
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
