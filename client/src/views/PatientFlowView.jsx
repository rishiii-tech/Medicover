import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Filter,
  Search,
  Building,
  HeartPulse,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Printer,
  UserPlus,
  ArrowRightLeft,
  UserMinus,
  FlaskConical
} from 'lucide-react';

export default function PatientFlowView({ onOpenAction, currentUser }) {
  const isSupervisor = currentUser?.role === 'SUPERVISOR';
  const [patientData, setPatientData] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [wardFilter, setWardFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/patients');
      const json = await res.json();
      if (json.success) {
        setPatientData(json.data);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !patientData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-medium text-slate-600">Loading Patient Admissions & Census Flow...</p>
        </div>
      </div>
    );
  }

  const { metrics, patients } = patientData;

  const filteredPatients = patients.filter((p) => {
    if (statusFilter === 'ADMITTED' && !p.isCurrentlyAdmitted) return false;
    if (statusFilter === 'DISCHARGED' && !p.isDischarged) return false;
    if (wardFilter !== 'ALL' && !p.canonicalWard.toLowerCase().includes(wardFilter.toLowerCase())) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.normalizedPatientId.toLowerCase().includes(q) ||
        p.sourcePatientId.toLowerCase().includes(q) ||
        p.canonicalWard.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q)
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
            <Users className="w-5 h-5 text-sky-700" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Patient Flow & Inpatient Census Roster
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking 303 total admissions, 247 clinical discharges, and 56 currently active inpatients
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onOpenAction && onOpenAction('admit')}
            className="px-3.5 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Admit Patient</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 border border-slate-200 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Roster</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="hospital-card p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total Admissions</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{metrics.totalAdmissions}</p>
          <span className="text-[11px] text-slate-500 font-medium">303 unique deduplicated</span>
        </div>

        <div className="hospital-card p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Clinical Discharges</span>
            <ArrowDownRight className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{metrics.totalDischarges}</p>
          <span className="text-[11px] text-slate-500 font-medium">Recorded with discharge date</span>
        </div>

        <div className="hospital-card p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Current Admitted Inpatients</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700">{metrics.currentAdmitted}</p>
          <span className="text-[11px] text-slate-500 font-medium">Null discharge timestamp</span>
        </div>

        <div className="hospital-card p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Net Patient Flow</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-purple-900">+{metrics.netFlow}</p>
          <span className="text-[11px] text-slate-500 font-medium">Admissions minus Discharges</span>
        </div>
      </div>

      {/* DEPARTMENT CENSUS DISTRIBUTION */}
      <div className="hospital-card p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Building className="w-4 h-4 text-sky-700" />
          Inpatient Volume by Admitting Department
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {metrics.departmentBreakdown.map((dept) => (
            <div key={dept.department} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-900 block truncate">{dept.department}</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-xl font-extrabold text-sky-800">{dept.total}</span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  {dept.active} active
                </span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {dept.discharged} discharged
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* PATIENT ROSTER TABLE WITH ROW ACTIONS */}
      <div className="hospital-card p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Normalized Inpatient Census Ledger ({filteredPatients.length} records)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Unified view with source ID preservation and standardized admission timestamps
            </p>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient, dept, ward..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-600 w-44 sm:w-56"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 font-medium text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ADMITTED">Admitted Only ({metrics.currentAdmitted})</option>
              <option value="DISCHARGED">Discharged Only ({metrics.totalDischarges})</option>
            </select>

            {/* Ward Filter */}
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 font-medium text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Clinical Wards</option>
              <option value="ICU">ICU</option>
              <option value="MICU">Medical ICU (MICU)</option>
              <option value="General Ward A">General Ward A</option>
              <option value="General Ward B">General Ward B</option>
              <option value="Paediatrics">Paediatrics Ward</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200 z-10">
              <tr>
                <th className="py-2.5 px-3">Normalized Patient ID</th>
                <th className="py-2.5 px-3">Source ID</th>
                <th className="py-2.5 px-3">Clinical Ward</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Age / Gender</th>
                <th className="py-2.5 px-3">Admission Datetime</th>
                <th className="py-2.5 px-3">Discharge Datetime</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredPatients.slice(0, 100).map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {p.normalizedPatientId}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-normal">
                    {p.sourcePatientId}
                  </td>
                  <td className="py-2.5 px-3 text-slate-800">
                    {p.canonicalWard}
                  </td>
                  <td className="py-2.5 px-3 text-slate-800">
                    {p.department}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {p.age} yrs • {p.gender}
                  </td>
                  <td className="py-2.5 px-3 text-slate-800">
                    {p.admissionDateStr}
                  </td>
                  <td className="py-2.5 px-3 text-slate-800">
                    {p.dischargeDateStr}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={p.isCurrentlyAdmitted ? 'badge-resolved' : 'badge-missing'}>
                      {p.isCurrentlyAdmitted ? 'Admitted' : 'Discharged'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {p.isCurrentlyAdmitted && (
                        <>
                          <button
                            onClick={() => onOpenAction && onOpenAction('transfer', p)}
                            className="p-1 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded transition"
                            title="Transfer Ward"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenAction && onOpenAction('discharge', p)}
                            className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition"
                            title="Discharge Inpatient"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {!isSupervisor && (
                        <button
                          onClick={() => onOpenAction && onOpenAction('lab', p)}
                          className="p-1 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded transition cursor-pointer"
                          title="Order Lab Test"
                        >
                          <FlaskConical className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
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
