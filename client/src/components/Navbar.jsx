import React from 'react';
import {
  LayoutDashboard,
  BedDouble,
  Users,
  FlaskConical,
  GitCompare,
  Database,
  FileCheck2,
  Search,
  RefreshCw,
  Bell,
  LogOut,
  ShieldCheck,
  Calendar,
  Clock,
  Building2,
  CheckCircle2
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenSearch,
  onLogout,
  conflictCount,
  selectedDate,
  setSelectedDate,
  onRefresh,
  isRefreshing
}) {
  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'beds', label: 'Bed Occupancy & Census', icon: BedDouble },
    { id: 'patients', label: 'Patient Flow', icon: Users },
    { id: 'labs', label: 'Lab Turnaround (TAT)', icon: FlaskConical },
    { id: 'reconciliation', label: 'Data Reconciliation', icon: GitCompare, badge: conflictCount },
    { id: 'sources', label: 'Data Sources & Pipeline', icon: Database },
    { id: 'audit', label: 'Audit & Rules', icon: FileCheck2 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Hospital Brand & Location */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-700 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-sky-800/10">
              <span className="tracking-tighter">M</span>
              <span className="text-xs text-sky-200 font-semibold">+</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-slate-900 tracking-tight font-sans">
                  MEDICOVER HOSPITALS
                </span>
                <span className="text-[10px] tracking-wide uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold border border-sky-200">
                  Operations Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal flex items-center gap-2">
                <span>Central Operations Intelligence & Census Reconciliation</span>
                <span className="hidden sm:inline-block text-slate-300">•</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-emerald-700 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Reconciled Census
                </span>
              </p>
            </div>
          </div>

          {/* Controls: Shift Info, Date Selector, Global Search, User Profile */}
          <div className="flex items-center gap-3">
            {/* Shift Context */}
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100/80 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Shift: <strong>Day Shift (08:00 - 20:00)</strong></span>
            </div>

            {/* Global Date Selector */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-lg px-3 py-1.5 text-xs text-slate-700 transition">
              <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="text-slate-500 font-medium hidden sm:inline">Reporting Date:</span>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="2026-07-30">30-Jul-2026 (Latest Shift)</option>
                <option value="2026-07-28">28-Jul-2026</option>
                <option value="2026-07-27">27-Jul-2026 ⚠️ (No Sheet)</option>
                <option value="2026-07-20">20-Jul-2026</option>
                <option value="2026-07-15">15-Jul-2026</option>
                <option value="2026-07-12">12-Jul-2026 ⚠️ (No Sheet)</option>
                <option value="2026-07-09">09-Jul-2026 ⚠️ (No Sheet)</option>
                <option value="2026-07-05">05-Jul-2026</option>
                <option value="2026-07-01">01-Jul-2026</option>
              </select>
            </div>

            {/* Global Search Button */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-300 px-3 py-1.5 rounded-lg text-xs transition font-medium shadow-2xl"
              title="Search Patient ID, Lab Order, Ward..."
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Quick Search...</span>
              <kbd className="hidden md:inline-block bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded border border-slate-300">⌘K</kbd>
            </button>

            {/* Refresh Sync Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition border border-slate-200"
              title="Re-run data reconciliation pipeline"
            >
              <RefreshCw className={`w-4 h-4 text-slate-600 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-sky-100 border border-sky-300 flex items-center justify-center text-xs font-bold text-sky-800 shadow-sm">
                RV
              </div>
              <div className="hidden lg:block text-left text-xs leading-tight">
                <p className="font-bold text-slate-900">Dr. Rajesh Varma</p>
                <p className="text-[11px] text-slate-500 font-medium">Operations Lead</p>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="Log out of console"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Human Navigation Tab Bar */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none border-t border-slate-200/80 pt-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-700' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-sky-200 text-sky-900' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
