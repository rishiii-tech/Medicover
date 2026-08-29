import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  Timer,
  Activity,
  ArrowRight,
  TrendingDown,
  Info,
  Printer,
  PlusCircle,
  Check
} from 'lucide-react';

export default function LabTurnaroundView({ onOpenAction }) {
  const [labData, setLabData] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/labs');
      const json = await res.json();
      if (json.success) {
        setLabData(json.data);
      }
    } catch (err) {
      console.error('Error fetching labs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOrder = async (orderId) => {
    setCompletingId(orderId);
    try {
      const res = await fetch('/api/labs/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          resultDate: '2026-07-30 17:45:00'
        })
      });
      const json = await res.json();
      if (json.success) {
        fetchLabs();
      }
    } catch (err) {
      console.error('Error completing lab:', err);
    } finally {
      setCompletingId(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !labData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-medium text-slate-600">Computing Laboratory Turnaround & Latency Engine...</p>
        </div>
      </div>
    );
  }

  const { metrics, orders } = labData;

  const filteredOrders = orders.filter((o) => {
    if (priorityFilter !== 'ALL' && o.priority !== priorityFilter) return false;
    if (statusFilter === 'COMPLETED' && !o.isCompleted) return false;
    if (statusFilter === 'PENDING' && !o.isPending) return false;
    if (statusFilter === 'DELAYED' && !o.isDelayed) return false;
    if (departmentFilter !== 'ALL' && !o.department.toLowerCase().includes(departmentFilter.toLowerCase())) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        o.orderId.toLowerCase().includes(q) ||
        o.normalizedPatientId.toLowerCase().includes(q) ||
        o.testName.toLowerCase().includes(q) ||
        o.department.toLowerCase().includes(q)
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
            <FlaskConical className="w-5 h-5 text-purple-700" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Laboratory Turnaround Time (TAT) Intelligence
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking diagnostic order-to-collection and collection-to-result latencies with SLA breach detection
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onOpenAction && onOpenAction('lab')}
            className="px-3.5 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Order Lab Test</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 border border-slate-200 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="hospital-card p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total Lab Orders</span>
            <FlaskConical className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{metrics.totalOrders}</p>
          <span className="text-[11px] text-slate-500 font-medium">607 diagnostic requests</span>
        </div>

        <div className="hospital-card p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Completed & Resulted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700">{metrics.completedOrders}</p>
          <span className="text-[11px] text-slate-500 font-medium">Resulted with valid timestamps</span>
        </div>

        <div className="hospital-card p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Pending in Queue</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-800">{metrics.pendingOrders}</p>
          <span className="text-[11px] text-slate-500 font-medium">Awaiting specimen / analyzer</span>
        </div>

        <div className="hospital-card p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Delayed Past SLA</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-rose-700">{metrics.delayedOrders}</p>
          <span className="text-[11px] text-slate-500 font-medium">{metrics.slaComplianceRate}% on-time compliance</span>
        </div>
      </div>

      {/* THREE-STAGE LATENCY BREAKDOWN */}
      <div className="hospital-card p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Timer className="w-4 h-4 text-purple-700" />
          Diagnostic Turnaround Pipeline Latency Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider text-[10px]">Phase 1: Phlebotomy Draw</span>
              <span className="text-[10px] font-bold text-slate-500">Order → Collection</span>
            </div>
            <p className="text-2xl font-black text-slate-900">
              {(metrics.avgOrderToCollectionMin / 60).toFixed(1)} <span className="text-sm font-bold text-slate-500">Hours</span>
            </p>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Mean latency from physician requisition to sample draw ({metrics.avgOrderToCollectionMin} mins)
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider text-[10px]">Phase 2: Analyzer Processing</span>
              <span className="text-[10px] font-bold text-slate-500">Collection → Result</span>
            </div>
            <p className="text-2xl font-black text-slate-900">
              {(metrics.avgCollectionToResultMin / 60).toFixed(1)} <span className="text-sm font-bold text-slate-500">Hours</span>
            </p>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Mean lab analyzer processing, verification and result upload ({metrics.avgCollectionToResultMin} mins)
            </p>
          </div>

          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900 uppercase tracking-wider text-[10px]">Total End-to-End TAT</span>
              <span className="text-[10px] font-bold text-purple-700">Order → Result</span>
            </div>
            <p className="text-2xl font-black text-purple-900">
              {metrics.avgTatHours} <span className="text-sm font-bold text-purple-700">Hours</span>
            </p>
            <p className="text-xs text-purple-800 font-medium leading-relaxed">
              Hospital-wide total turnaround time across all 579 completed orders
            </p>
          </div>
        </div>
      </div>

      {/* PRIORITY SLA PERFORMANCE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.priorityStats.map((pri) => (
          <div key={pri.priority} className="hospital-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                pri.priority === 'STAT' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                pri.priority === 'URGENT' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-sky-100 text-sky-800 border border-sky-200'
              }`}>
                {pri.priority} PRIORITY
              </span>
              <span className="text-xs font-bold text-slate-600">
                Target: {pri.slaMinutes / 60}h SLA
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Total</span>
                <span className="text-sm font-extrabold text-slate-900">{pri.total}</span>
              </div>
              <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-[10px] text-emerald-700 uppercase font-bold block">Done</span>
                <span className="text-sm font-extrabold text-emerald-800">{pri.completed}</span>
              </div>
              <div className="p-2 bg-rose-50 rounded-lg border border-rose-200">
                <span className="text-[10px] text-rose-700 uppercase font-bold block">Delayed</span>
                <span className="text-sm font-extrabold text-rose-800">{pri.delayed}</span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Mean Turnaround:</span>
              <strong className="text-slate-900 font-bold">{pri.avgTatHours} Hours</strong>
            </div>
          </div>
        ))}
      </div>

      {/* LAB ORDERS TABLE */}
      <div className="hospital-card p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Diagnostic Order Log & Turnaround Records ({filteredOrders.length} orders)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cross-dataset matched diagnostic records with HIS inpatient and outpatient reconciliation
            </p>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search order ID, patient, test..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-purple-600 w-44 sm:w-56"
              />
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 font-medium text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="STAT">STAT</option>
              <option value="URGENT">URGENT</option>
              <option value="ROUTINE">ROUTINE</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 font-medium text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed ({metrics.completedOrders})</option>
              <option value="PENDING">Pending in Queue ({metrics.pendingOrders})</option>
              <option value="DELAYED">SLA Delayed ({metrics.delayedOrders})</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200 z-10">
              <tr>
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Patient ID</th>
                <th className="py-2.5 px-3">Test Name</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Ordered At</th>
                <th className="py-2.5 px-3">Resulted At</th>
                <th className="py-2.5 px-3">Turnaround (TAT)</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredOrders.slice(0, 100).map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {o.orderId}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-slate-800 font-semibold">{o.normalizedPatientId}</span>
                    {!o.isMatchedHis && (
                      <span className="block text-[10px] text-sky-700 font-bold">Outpatient Direct</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-purple-900 font-semibold">
                    {o.testName}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      o.priority === 'STAT' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                      o.priority === 'URGENT' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-sky-100 text-sky-800 border border-sky-200'
                    }`}>
                      {o.priority}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-800">
                    {o.department}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-normal">
                    {o.orderedAtDisplay}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-normal">
                    {o.resultedAtDisplay}
                  </td>
                  <td className="py-2.5 px-3 font-bold">
                    {o.isCompleted ? (
                      <span className={o.isDelayed ? 'text-rose-700' : 'text-emerald-700'}>
                        {(o.totalTatMin / 60).toFixed(1)} hrs ({o.totalTatMin}m)
                      </span>
                    ) : (
                      <span className="text-amber-800 italic">
                        Awaiting Result
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    {o.isCompleted ? (
                      o.isDelayed ? (
                        <span className="badge-delayed">SLA Breach (+{Math.round(o.delayMinutes / 60)}h)</span>
                      ) : (
                        <span className="badge-resolved">On Time</span>
                      )
                    ) : (
                      <span className="badge-discrepancy">In Queue</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {o.isPending && (
                      <button
                        onClick={() => handleCompleteOrder(o.orderId)}
                        disabled={completingId === o.orderId}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-bold transition shadow-xs flex items-center gap-1 ml-auto cursor-pointer"
                        title="Enter specimen result"
                      >
                        {completingId === o.orderId ? (
                          <span className="animate-spin text-[10px]">...</span>
                        ) : (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Complete</span>
                          </>
                        )}
                      </button>
                    )}
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
