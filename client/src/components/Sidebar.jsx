import React from 'react';
import {
  LayoutDashboard,
  BedDouble,
  Users,
  FlaskConical,
  GitCompare,
  Database,
  FileCheck2,
  ShieldCheck,
  Building2,
  Clock,
  LogOut,
  ChevronRight,
  Activity,
  AlertTriangle,
  UserCheck,
  RefreshCw,
  Lock
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  onLogout,
  currentUser,
  onSwitchRole,
  conflictCount,
  unmatchedCount = 34,
  delayedLabsCount = 491
}) {
  const isSupervisor = currentUser?.role === 'SUPERVISOR';

  // Navigation Items allowed based on role
  const allMainNav = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, desc: 'Overview & KPIs', adminOnly: true },
    { id: 'beds', label: 'Bed Occupancy & Census', icon: BedDouble, desc: 'Ward capacity & bed numbers', supervisorAllowed: true },
    { id: 'patients', label: 'Patient Flow', icon: Users, desc: 'Admissions & discharges roster', supervisorAllowed: true },
    { id: 'labs', label: 'Lab Turnaround (TAT)', icon: FlaskConical, desc: 'Diagnostic SLAs & latencies', badge: `${delayedLabsCount} delay`, badgeColor: 'bg-rose-50 text-rose-700 border-rose-200', adminOnly: true },
    { id: 'resources', label: 'Oxygen & Blood Bank', icon: Activity, desc: 'Cylinders & 8 blood groups', badge: '129 units', badgeColor: 'bg-rose-50 text-rose-700 border-rose-200', supervisorAllowed: true },
  ];

  const mainNav = isSupervisor
    ? allMainNav.filter(item => item.supervisorAllowed)
    : allMainNav;

  const dataNav = [
    { id: 'reconciliation', label: 'Data Reconciliation', icon: GitCompare, desc: 'Conflict resolution engine', badge: `${conflictCount}`, badgeColor: 'bg-amber-50 text-amber-800 border-amber-200' },
    { id: 'sources', label: 'Data Sources & Pipeline', icon: Database, desc: '3 Ingested datasets & lineage' },
    { id: 'audit', label: 'Audit & Rules', icon: FileCheck2, desc: 'Derivation formulas & logic' },
  ];

  return (
    <aside className="w-64 lg:w-72 bg-white text-slate-700 flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-200/90 shadow-sm select-none z-30 font-sans">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-cyan-600 to-teal-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-sky-600/25 ring-2 ring-sky-400/20 shrink-0">
            <span className="tracking-tighter drop-shadow-xs">M</span>
            <span className="text-[10px] text-cyan-100">+</span>
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 text-sm tracking-tight truncate">
                MEDICOVER
              </span>
              <span className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                isSupervisor
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-sky-50 text-sky-700 border border-sky-200/80'
              }`}>
                {isSupervisor ? 'FLOOR' : 'OPS'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate font-medium">
              {isSupervisor ? 'Supervisor Console' : 'Operations Intelligence'}
            </p>
          </div>
        </div>

        {/* Live Facility & Shift Tag */}
        <div className="mt-3.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Building2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="truncate font-semibold">Central Hospital</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-700 font-bold text-[10px] uppercase tracking-wider bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-xs"></span>
            <span>Day Shift</span>
          </div>
        </div>

        {/* Role Badge Indicator */}
        <div className={`mt-2 px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center justify-between border ${
          isSupervisor
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
            : 'bg-sky-50 text-sky-900 border-sky-200'
        }`}>
          <span>ROLE: {isSupervisor ? 'Floor Supervisor (Clinical)' : 'Operations Lead (Full Admin)'}</span>
          <span className="text-[9px] font-semibold">{isSupervisor ? '3 Tabs' : '8 Tabs'}</span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-none bg-white">
        {/* Section 1: Clinical Operations */}
        <div className="space-y-1">
          <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
            {isSupervisor ? 'Authorized Clinical Modules' : 'Clinical Operations'}
          </span>
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group text-left cursor-pointer relative overflow-hidden active:scale-[0.98] duration-150 ${
                  isActive
                    ? 'bg-white text-sky-950 shadow-lg shadow-slate-300/60 border border-slate-200/90 ring-1 ring-sky-500/20 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r before:bg-sky-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:shadow-xs border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 truncate mr-2">
                  <div className={`p-1.5 rounded-lg transition-colors ${
                    isActive ? 'bg-sky-50 text-sky-700' : 'bg-slate-100 text-slate-500 group-hover:bg-sky-50 group-hover:text-sky-600'
                  }`}>
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>
                  <div className="truncate">
                    <span className={`block truncate leading-snug ${isActive ? 'font-extrabold text-sky-950' : 'font-semibold text-slate-700 group-hover:text-slate-900'}`}>
                      {item.label}
                    </span>
                    <span className={`text-[10px] font-normal block truncate ${isActive ? 'text-sky-700' : 'text-slate-400'}`}>
                      {item.desc}
                    </span>
                  </div>
                </div>

                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold border uppercase shrink-0 ${
                    isActive ? 'bg-sky-50 text-sky-800 border-sky-200' : item.badgeColor
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Section 2: Data Intelligence & Governance (Hidden for Supervisor) */}
        {!isSupervisor && (
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
              Data Governance & Audit
            </span>
            {dataNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group text-left cursor-pointer relative overflow-hidden active:scale-[0.98] duration-150 ${
                    isActive
                      ? 'bg-white text-sky-950 shadow-lg shadow-slate-300/60 border border-slate-200/90 ring-1 ring-sky-500/20 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r before:bg-sky-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:shadow-xs border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate mr-2">
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      isActive ? 'bg-sky-50 text-sky-700' : 'bg-slate-100 text-slate-500 group-hover:bg-sky-50 group-hover:text-sky-600'
                    }`}>
                      <Icon className="w-4 h-4 shrink-0" />
                    </div>
                    <div className="truncate">
                      <span className={`block truncate leading-snug ${isActive ? 'font-extrabold text-sky-950' : 'font-semibold text-slate-700 group-hover:text-slate-900'}`}>
                        {item.label}
                      </span>
                      <span className={`text-[10px] font-normal block truncate ${isActive ? 'text-sky-700' : 'text-slate-400'}`}>
                        {item.desc}
                      </span>
                    </div>
                  </div>

                  {item.badge && (
                    <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold border shrink-0 ${
                      isActive ? 'bg-sky-50 text-sky-800 border-sky-200' : item.badgeColor
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Supervisor Scope Note */}
        {isSupervisor && (
          <div className="mx-1 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px]">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Restricted Supervisor Access</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Authorized for Bed Census, Patient Flow, Oxygen & Blood Bank, Admitting, Discharging & Transferring. Governance & Lab SLAs require Operations Lead credentials.
            </p>
          </div>
        )}

        {/* Reconciliation Status Card (Visible for Lead) */}
        {!isSupervisor && (
          <div className="mx-1 p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Reconciliation
              </span>
              <span className="text-emerald-700 font-bold">100% Resolved</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full w-full rounded-full"></div>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              1,046 cross-system records reconciled with 0 silent deletions.
            </p>
          </div>
        )}
      </div>

      {/* User Profile & Quick Role Switcher Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`w-9 h-9 rounded-xl text-white shadow-sm flex items-center justify-center font-bold text-xs shrink-0 ring-1 ${
              isSupervisor
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 ring-emerald-400/30'
                : 'bg-gradient-to-tr from-sky-600 to-cyan-500 ring-sky-400/30'
            }`}>
              {currentUser?.avatar || (isSupervisor ? 'AR' : 'RV')}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-slate-900 truncate">
                {currentUser?.name || (isSupervisor ? 'Sister Anita Roy' : 'Dr. Rajesh Varma')}
              </h4>
              <p className="text-[10px] text-slate-500 font-medium truncate">
                {currentUser?.title || (isSupervisor ? 'Floor Supervisor' : 'Operations Lead')}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            title="Log out of console"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Instant Role Toggle Button */}
        <button
          onClick={() => onSwitchRole && onSwitchRole(isSupervisor ? 'ADMIN' : 'SUPERVISOR')}
          className="w-full py-1.5 px-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
          title="Switch role without logging out"
        >
          <RefreshCw className="w-3 h-3 text-sky-600" />
          <span>Switch to {isSupervisor ? 'Operations Lead' : 'Floor Supervisor'}</span>
        </button>
      </div>
    </aside>
  );
}
