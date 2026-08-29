import React, { useState } from 'react';
import {
  Hospital,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building2,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  User,
  Shield,
  Activity,
  BedDouble,
  Users
} from 'lucide-react';

export default function LoginView({ onLogin }) {
  // Active selected login type: 'MANAGER' or 'SUPERVISOR'
  const [activePortal, setActivePortal] = useState('MANAGER');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Form states
  const [email, setEmail] = useState('ops.lead@medicover.internal');
  const [password, setPassword] = useState('HospitalOps2026!');
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPortal = (portal) => {
    setActivePortal(portal);
    setIsDropdownOpen(false);
    if (portal === 'MANAGER') {
      setEmail('ops.lead@medicover.internal');
      setPassword('HospitalOps2026!');
    } else {
      setEmail('supervisor.floor@medicover.internal');
      setPassword('Supervisor2026!');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      if (activePortal === 'SUPERVISOR') {
        onLogin({
          name: 'Sister Anita Roy',
          role: 'SUPERVISOR',
          title: 'Clinical Floor Supervisor',
          email: email || 'supervisor.floor@medicover.internal',
          avatar: 'AR'
        });
      } else {
        onLogin({
          name: 'Dr. Rajesh Varma',
          role: 'ADMIN',
          title: 'Hospital Operations Manager',
          email: email || 'ops.lead@medicover.internal',
          avatar: 'RV'
        });
      }
      setIsLoading(false);
    }, 250);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col justify-between font-sans relative select-none"
      style={{
        backgroundImage: "url('/login-bg.jpg')",
        imageRendering: 'auto'
      }}
    >
      {/* ============================================================ */}
      {/* TOP INSTITUTIONAL HEADER BAR WITH "LOGIN ▾" DROPDOWN          */}
      {/* ============================================================ */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-50 px-6 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo & Hospital Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-cyan-600 to-teal-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-sky-600/25 ring-2 ring-sky-400/20 shrink-0">
              <span className="tracking-tighter">M</span>
              <span className="text-[10px] text-cyan-100">+</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm tracking-tight">
                  MEDICOVER HEALTH SYSTEM
                </span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200">
                  CENTRAL HOSPITAL
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Hospital Operations Intelligence & Clinical Reconciliation
              </p>
            </div>
          </div>

          {/* Right: Status & Prominent Login Dropdown matching user's image */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Operations Gateway Active</span>
            </div>

            {/* THE "LOGIN ▾" BUTTON & DROPDOWN MENU */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white shadow-md shadow-sky-700/25 transition-all active:scale-95 cursor-pointer"
              >
                <span>Login</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* DROPDOWN MENU POPUP (Matching the user's reference image) */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100">
                  <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Select Portal Role
                  </div>

                  <div className="py-1">
                    {/* Option 1: Manager Login */}
                    <button
                      onClick={() => handleSelectPortal('MANAGER')}
                      className={`w-full px-4 py-2.5 flex items-center justify-between text-left text-xs font-bold transition cursor-pointer ${
                        activePortal === 'MANAGER'
                          ? 'bg-sky-50 text-sky-900 font-extrabold'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-black text-xs">
                          👔
                        </div>
                        <div>
                          <span className="block text-slate-900 text-xs">Manager Login</span>
                          <span className="text-[10px] text-slate-500 font-normal">Hospital Operations Lead</span>
                        </div>
                      </div>
                      {activePortal === 'MANAGER' && (
                        <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                      )}
                    </button>

                    {/* Option 2: Supervisor Login */}
                    <button
                      onClick={() => handleSelectPortal('SUPERVISOR')}
                      className={`w-full px-4 py-2.5 flex items-center justify-between text-left text-xs font-bold transition cursor-pointer ${
                        activePortal === 'SUPERVISOR'
                          ? 'bg-emerald-50 text-emerald-900 font-extrabold'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                          📋
                        </div>
                        <div>
                          <span className="block text-slate-900 text-xs">Supervisor Login</span>
                          <span className="text-[10px] text-slate-500 font-normal">Clinical Floor Supervisor</span>
                        </div>
                      </div>
                      {activePortal === 'SUPERVISOR' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  </div>

                  <div className="p-2 bg-slate-50 text-[10px] text-slate-500 text-center font-medium">
                    Role-Based Access Control (RBAC)
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* MAIN BODY: SELECTED PORTAL LOGIN CARD                        */}
      {/* ============================================================ */}
      <main className="flex-1 flex items-center justify-center py-10 px-4 relative z-10">
        <div className="w-full max-w-md bg-white/85 backdrop-blur-md p-6 sm:p-8 shadow-2xl rounded-3xl border border-white/90 space-y-4 relative overflow-hidden transition-all">
          {/* Card Top Indicator Bar */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${
            activePortal === 'MANAGER'
              ? 'bg-gradient-to-r from-sky-600 via-cyan-500 to-sky-700'
              : 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700'
          }`}></div>

          {/* Header of Active Form */}
          <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl text-white flex items-center justify-center font-black text-base shadow-md ${
                activePortal === 'MANAGER'
                  ? 'bg-gradient-to-tr from-sky-700 to-cyan-600 shadow-sky-700/25'
                  : 'bg-gradient-to-tr from-emerald-700 to-teal-600 shadow-emerald-700/25'
              }`}>
                {activePortal === 'MANAGER' ? 'RV' : 'AR'}
              </div>
              <div>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-0.5 ${
                  activePortal === 'MANAGER'
                    ? 'bg-sky-100 text-sky-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {activePortal === 'MANAGER' ? 'Administrative Lead' : 'Clinical Floor Operations'}
                </span>
                <h2 className="text-base font-black text-slate-900 leading-tight">
                  {activePortal === 'MANAGER' ? 'Manager Login' : 'Supervisor Login'}
                </h2>
              </div>
            </div>

            {/* Quick Switch Dropdown Trigger Pill */}
            <button
              onClick={() => handleSelectPortal(activePortal === 'MANAGER' ? 'SUPERVISOR' : 'MANAGER')}
              className="text-[10px] text-sky-700 hover:text-sky-900 font-bold underline cursor-pointer"
              title="Click to switch role"
            >
              Switch to {activePortal === 'MANAGER' ? 'Supervisor' : 'Manager'} →
            </button>
          </div>

          {/* Role Description */}
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {activePortal === 'MANAGER'
              ? 'Full administrative command: Executive Dashboard, Lab Turnaround SLAs, Data Reconciliation Hub, Audit Rulebook, and Bed Census.'
              : 'Dedicated floor supervisor access: Bed Numbers Matrix, Vacant vs Reserved status, Patient Flow, Oxygen & Blood Bank, and Admitting / Transfers.'}
          </p>

          {/* Scope Capsule */}
          <div className={`p-3 rounded-2xl border text-xs font-semibold space-y-1 ${
            activePortal === 'MANAGER'
              ? 'bg-sky-50/80 border-sky-200/80 text-sky-950'
              : 'bg-emerald-50/80 border-emerald-200/80 text-emerald-950'
          }`}>
            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase">
              <span>Account: {activePortal === 'MANAGER' ? 'Dr. Rajesh Varma' : 'Sister Anita Roy'}</span>
              <span>{activePortal === 'MANAGER' ? 'All 8 Modules' : 'Clinical Floor Only'}</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {activePortal === 'MANAGER' ? 'Manager Email' : 'Supervisor Email'}
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-white/85 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-sky-600"
                  placeholder={activePortal === 'MANAGER' ? 'ops.lead@medicover.internal' : 'supervisor.floor@medicover.internal'}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Security Password
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-white/85 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-sky-600"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 px-4 rounded-xl shadow-lg text-xs font-black text-white transition flex items-center justify-center gap-2 cursor-pointer ${
                activePortal === 'MANAGER'
                  ? 'bg-gradient-to-r from-sky-700 to-sky-800 hover:from-sky-600 hover:to-sky-700 shadow-sky-700/25'
                  : 'bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-700/25'
              }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In as {activePortal === 'MANAGER' ? 'Operations Manager' : 'Floor Supervisor'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom helper tip */}
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Click <strong>Login ▾</strong> at top right to switch</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Demo Pre-verified
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-3 text-center text-xs text-slate-600 font-medium bg-white/70 backdrop-blur-sm border-t border-slate-200/60">
        Medicover Hospital Operations Intelligence & Governance Console • Central Hospital Day Shift
      </footer>
    </div>
  );
}
