import React, { useState, useEffect } from 'react';
import {
  Wind,
  Droplet,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Printer,
  PlusCircle,
  Activity,
  HeartPulse,
  ShieldAlert,
  Gauge,
  Layers,
  Send,
  Building2,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function ResourcesView({ onOpenRequisition }) {
  const [resourcesData, setResourcesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bloodModalOpen, setBloodModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('O+');
  const [reqUnits, setReqUnits] = useState(1);
  const [reqComponent, setReqComponent] = useState('PRBC');
  const [reqWard, setReqWard] = useState('Intensive Care Unit (ICU)');
  const [reqUrgency, setReqUrgency] = useState('ROUTINE');
  const [reqPatientId, setReqPatientId] = useState('MCH-0001014');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/resources');
      const json = await res.json();
      if (json.success) {
        setResourcesData(json.data);
      }
    } catch (err) {
      console.error('Error loading resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequisitionSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/resources/blood/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: reqPatientId,
          bloodGroup: selectedGroup,
          units: reqUnits,
          component: reqComponent,
          ward: reqWard,
          urgency: reqUrgency
        })
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', message: json.message });
        fetchResources();
        setTimeout(() => {
          setBloodModalOpen(false);
          setFeedback(null);
        }, 1200);
      } else {
        throw new Error(json.error || 'Failed to request blood units');
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !resourcesData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-medium text-slate-600">Loading Oxygen Cylinders & Blood Bank Inventory...</p>
        </div>
      </div>
    );
  }

  const { oxygen, bloodBank } = resourcesData;
  const lmoCapacityPct = Math.round((oxygen.centralSupply.currentLmoLevelLiters / oxygen.centralSupply.lmoTankCapacityLiters) * 100);

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* View Header */}
      <div className="hospital-card p-6 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-800">
              <Wind className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Oxygen Cylinders & Blood Bank Inventory
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time monitoring of Liquid Medical Oxygen (LMO), portable cylinder allocations & 8 blood group reserves
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setBloodModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Droplet className="w-3.5 h-3.5" />
            <span>+ Request Blood Units</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 border border-slate-200 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Stock Sheet</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. LMO Tank */}
        <div className="hospital-card p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Central LMO Volume</span>
            <Gauge className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{oxygen.centralSupply.currentLmoLevelLiters.toLocaleString()} <span className="text-sm font-bold text-slate-500">Liters</span></p>
          <span className="text-[11px] text-emerald-700 font-bold">{lmoCapacityPct}% Full • {oxygen.centralSupply.pressurePsi} PSI</span>
        </div>

        {/* 2. Full Oxygen Cylinders */}
        <div className="hospital-card p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Full O2 Cylinders</span>
            <Wind className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-extrabold text-sky-800">{oxygen.cylinderSummary.fullAvailable} <span className="text-sm font-bold text-slate-500">Ready</span></p>
          <span className="text-[11px] text-slate-500 font-medium">{oxygen.cylinderSummary.inUseAtBeds} In-Use • {oxygen.cylinderSummary.inRefillCycle} In Refill</span>
        </div>

        {/* 3. Blood Bank Total Units */}
        <div className="hospital-card p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total Blood Reserves</span>
            <Droplet className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-rose-800">{bloodBank.totalUnits} <span className="text-sm font-bold text-slate-500">Units</span></p>
          <span className="text-[11px] text-slate-500 font-medium">8 Blood Groups Monitored</span>
        </div>

        {/* 4. Critical Stock Warnings */}
        <div className="hospital-card p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Stock Shortage Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-800">{bloodBank.criticalAlertCount} <span className="text-sm font-bold text-slate-500">Groups Low</span></p>
          <span className="text-[11px] text-rose-700 font-bold">AB- (4 units) & O- (9 units)</span>
        </div>
      </div>

      {/* SECTION 1: OXYGEN SUPPLY & WARD ALLOCATIONS */}
      <div className="hospital-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Wind className="w-4 h-4 text-sky-700" />
            Medical Oxygen Manifold & Portable Cylinder Allocation
          </h2>
          <span className="text-xs text-emerald-800 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Central Manifold Pipeline Pressure: {oxygen.centralSupply.pressurePsi} PSI (Stable)
          </span>
        </div>

        {/* Central LMO Tank Bar */}
        <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200/90 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-sky-950">Central Liquid Medical Oxygen (LMO) Storage Tank</span>
            <span className="font-bold text-sky-800">
              {oxygen.centralSupply.currentLmoLevelLiters.toLocaleString()} / {oxygen.centralSupply.lmoTankCapacityLiters.toLocaleString()} Liters ({lmoCapacityPct}%)
            </span>
          </div>
          <div className="w-full bg-sky-200 h-3 rounded-full overflow-hidden">
            <div
              className="bg-sky-700 h-full rounded-full transition-all duration-500"
              style={{ width: `${lmoCapacityPct}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-sky-800 font-medium pt-1">
            <span>Daily Burn Rate: ~{oxygen.centralSupply.dailyConsumptionLiters} L / day</span>
            <span>Estimated Autonomy: <strong>{oxygen.centralSupply.estimatedAutonomyDays} Days Supply</strong></span>
          </div>
        </div>

        {/* Ward Cylinders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Clinical Ward / Area</th>
                <th className="py-2.5 px-3">Cylinder Types</th>
                <th className="py-2.5 px-3">Allocated Quota</th>
                <th className="py-2.5 px-3">In-Use at Beds</th>
                <th className="py-2.5 px-3">Full & Available</th>
                <th className="py-2.5 px-3 text-right">Buffer Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {oxygen.wardCylinders.map((w, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{w.ward}</td>
                  <td className="py-2.5 px-3 text-slate-600 font-normal">{w.type}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{w.totalAllocated} Cylinders</td>
                  <td className="py-2.5 px-3 text-sky-800 font-semibold">{w.inUse} In-Use</td>
                  <td className="py-2.5 px-3">
                    <span className="font-extrabold text-emerald-700">{w.available} Ready</span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      w.bufferLevel === 'Reserve Standby' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                      w.bufferLevel === 'Optimal' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-sky-100 text-sky-800 border border-sky-200'
                    }`}>
                      {w.bufferLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: BLOOD BANK INVENTORY (8 BLOOD GROUPS) */}
      <div className="hospital-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Droplet className="w-4 h-4 text-rose-700" />
              Blood Bank Reserves & Transfusion Services (8 Blood Groups)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Available Units of Packed Red Blood Cells (PRBC), Fresh Frozen Plasma (FFP) & Platelets
            </p>
          </div>
          <button
            onClick={() => setBloodModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-900 font-bold text-xs border border-rose-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-rose-700" />
            <span>Emergency Blood Requisition</span>
          </button>
        </div>

        {/* 8 Blood Group Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {bloodBank.groups.map((bg) => (
            <div
              key={bg.bloodGroup}
              className={`p-4 rounded-2xl border transition-all ${
                bg.status === 'CRITICAL'
                  ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-300/40'
                  : bg.status === 'LOW_BUFFER'
                  ? 'bg-amber-50/70 border-amber-300'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-700 text-white flex items-center justify-center font-black text-sm shadow-md">
                    {bg.bloodGroup}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{bg.bloodGroup}</h3>
                    <span className="text-[10px] text-slate-500 font-semibold">{bg.rhFactor}</span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                  bg.status === 'CRITICAL' ? 'bg-rose-200 text-rose-900 border border-rose-300' :
                  bg.status === 'LOW_BUFFER' ? 'bg-amber-200 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {bg.status.replace('_', ' ')}
                </span>
              </div>

              {/* Total Units */}
              <div className="my-2.5 flex items-baseline justify-between">
                <span className="text-xs text-slate-600 font-medium">Total Available:</span>
                <span className="text-2xl font-black text-slate-900">{bg.totalUnits} <span className="text-xs font-bold text-slate-500">Units</span></span>
              </div>

              {/* Component breakdown */}
              <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] pt-2 border-t border-slate-100">
                <div className="p-1 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block font-semibold">PRBC</span>
                  <span className="font-extrabold text-slate-900">{bg.prbcUnits}</span>
                </div>
                <div className="p-1 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block font-semibold">FFP</span>
                  <span className="font-extrabold text-slate-900">{bg.ffpUnits}</span>
                </div>
                <div className="p-1 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block font-semibold">Platelets</span>
                  <span className="font-extrabold text-slate-900">{bg.plateletUnits}</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 mt-2 font-medium truncate" title={bg.universalRole}>
                {bg.universalRole}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Transfusion Log */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
            Active Blood Transfusion & Cross-Match Queue
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Txn ID</th>
                  <th className="py-2 px-3">Patient ID</th>
                  <th className="py-2 px-3">Ward / Area</th>
                  <th className="py-2 px-3">Group</th>
                  <th className="py-2 px-3">Component</th>
                  <th className="py-2 px-3">Units</th>
                  <th className="py-2 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {bloodBank.recentTransfusions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="py-2 px-3 font-mono font-bold text-slate-800">{t.id}</td>
                    <td className="py-2 px-3 font-bold text-slate-900">{t.patientId}</td>
                    <td className="py-2 px-3 text-slate-700">{t.ward}</td>
                    <td className="py-2 px-3 font-bold text-rose-800">{t.bloodGroup}</td>
                    <td className="py-2 px-3 text-slate-600">{t.component}</td>
                    <td className="py-2 px-3 font-bold text-slate-900">{t.units} Unit(s)</td>
                    <td className="py-2 px-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* BLOOD REQUISITION MODAL */}
      {bloodModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-800">
                  <Droplet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Requisition Blood Units</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Cross-match & dispatch from Blood Bank</p>
                </div>
              </div>
              <button onClick={() => setBloodModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            {feedback && (
              <div className={`p-3 rounded-xl text-xs font-bold ${
                feedback.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}>
                {feedback.message}
              </div>
            )}

            <form onSubmit={handleRequisitionSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Patient ID / MRN</label>
                <input
                  type="text"
                  required
                  value={reqPatientId}
                  onChange={(e) => setReqPatientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white"
                  >
                    <option value="O+">O+ Positive</option>
                    <option value="O-">O- Negative (Emergency)</option>
                    <option value="A+">A+ Positive</option>
                    <option value="A-">A- Negative</option>
                    <option value="B+">B+ Positive</option>
                    <option value="B-">B- Negative</option>
                    <option value="AB+">AB+ Positive</option>
                    <option value="AB-">AB- Negative</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Units (Bags)</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    required
                    value={reqUnits}
                    onChange={(e) => setReqUnits(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Component</label>
                  <select
                    value={reqComponent}
                    onChange={(e) => setReqComponent(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white"
                  >
                    <option value="PRBC">Packed Red Cells (PRBC)</option>
                    <option value="FFP">Fresh Frozen Plasma (FFP)</option>
                    <option value="Platelets">Platelets Concentrate</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Urgency</label>
                  <select
                    value={reqUrgency}
                    onChange={(e) => setReqUrgency(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white"
                  >
                    <option value="ROUTINE">ROUTINE</option>
                    <option value="URGENT">URGENT</option>
                    <option value="STAT">STAT (Immediate Dispatch)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Destination Ward / OT</label>
                <select
                  value={reqWard}
                  onChange={(e) => setReqWard(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white"
                >
                  <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</option>
                  <option value="Medical ICU (MICU)">Medical ICU (MICU)</option>
                  <option value="Surgery / OT">Surgery / Main OT</option>
                  <option value="Emergency & Trauma">Emergency & Trauma</option>
                  <option value="General Ward A">General Ward A</option>
                  <option value="General Ward B">General Ward B</option>
                  <option value="Paediatrics Ward">Paediatrics Ward</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Droplet className="w-4 h-4" />
                    <span>Authorize Blood Bank Requisition</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
