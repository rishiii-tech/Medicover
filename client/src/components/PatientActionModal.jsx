import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  ArrowRightLeft,
  UserMinus,
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BedDouble,
  Building2,
  Sparkles,
  FileText
} from 'lucide-react';

export default function PatientActionModal({
  isOpen,
  onClose,
  initialMode = 'admit', // 'admit' | 'transfer' | 'discharge' | 'lab'
  initialPatient = null,
  activePatients = [],
  onActionSuccess,
  currentUser
}) {
  const isSupervisor = currentUser?.role === 'SUPERVISOR';
  const effectiveInitialMode = (isSupervisor && initialMode === 'lab') ? 'admit' : initialMode;
  const [mode, setMode] = useState(effectiveInitialMode);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Form states - Admit
  const [admitPatId, setAdmitPatId] = useState('');
  const [admitAge, setAdmitAge] = useState(42);
  const [admitGender, setAdmitGender] = useState('Female');
  const [admitWard, setAdmitWard] = useState('General Ward A');
  const [admitDept, setAdmitDept] = useState('General Medicine');
  const [admitDate, setAdmitDate] = useState('2026-07-30 14:00:00');

  // Form states - Transfer
  const [transferPatId, setTransferPatId] = useState('');
  const [transferToWard, setTransferToWard] = useState('Intensive Care Unit (ICU)');
  const [transferReason, setTransferReason] = useState('Clinical condition change / Critical care escalation');

  // Form states - Discharge
  const [dischargePatId, setDischargePatId] = useState('');
  const [dischargeDate, setDischargeDate] = useState('2026-07-30 18:00:00');
  const [dischargeNotes, setDischargeNotes] = useState('Patient stabilized, vitals normal, discharged home with medication');

  // Form states - Lab Order
  const [labPatId, setLabPatId] = useState('');
  const [labTestName, setLabTestName] = useState('Complete Blood Count (CBC)');
  const [labPriority, setLabPriority] = useState('ROUTINE');
  const [labDept, setLabDept] = useState('General Medicine');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setFeedback(null);
      const nextId = `MCH-000${1300 + Math.floor(Math.random() * 50)}`;
      setAdmitPatId(nextId);

      if (initialPatient) {
        setTransferPatId(initialPatient.normalizedPatientId || initialPatient.sourcePatientId);
        setDischargePatId(initialPatient.normalizedPatientId || initialPatient.sourcePatientId);
        setLabPatId(initialPatient.normalizedPatientId || initialPatient.sourcePatientId);
        setLabDept(initialPatient.department || 'General Medicine');
      } else if (activePatients.length > 0) {
        const firstActive = activePatients[0].normalizedPatientId || activePatients[0].sourcePatientId;
        setTransferPatId(firstActive);
        setDischargePatId(firstActive);
        setLabPatId(firstActive);
      }
    }
  }, [isOpen, initialMode, initialPatient]);

  if (!isOpen) return null;

  const handleAdmitSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/patients/admit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: admitPatId,
          age: parseInt(admitAge, 10),
          gender: admitGender,
          ward: admitWard,
          department: admitDept,
          admissionDate: admitDate
        })
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', message: json.message });
        if (onActionSuccess) onActionSuccess();
        setTimeout(() => onClose(), 1200);
      } else {
        throw new Error(json.error || 'Failed to admit patient');
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/patients/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: transferPatId,
          toWard: transferToWard,
          transferReason
        })
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', message: json.message });
        if (onActionSuccess) onActionSuccess();
        setTimeout(() => onClose(), 1200);
      } else {
        throw new Error(json.error || 'Failed to transfer patient');
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDischargeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/patients/discharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: dischargePatId,
          dischargeDate,
          dischargeNotes
        })
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', message: json.message });
        if (onActionSuccess) onActionSuccess();
        setTimeout(() => onClose(), 1200);
      } else {
        throw new Error(json.error || 'Failed to discharge patient');
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLabSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/labs/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: labPatId,
          testName: labTestName,
          priority: labPriority,
          department: labDept,
          orderedAt: '2026-07-30 15:30:00'
        })
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', message: json.message });
        if (onActionSuccess) onActionSuccess();
        setTimeout(() => onClose(), 1200);
      } else {
        throw new Error(json.error || 'Failed to order lab test');
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="relative bg-white border border-slate-200 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-700 text-white shadow-sm">
              {mode === 'admit' && <UserPlus className="w-5 h-5" />}
              {mode === 'transfer' && <ArrowRightLeft className="w-5 h-5" />}
              {mode === 'discharge' && <UserMinus className="w-5 h-5" />}
              {mode === 'lab' && <FlaskConical className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                {mode === 'admit' && 'Admit New Inpatient'}
                {mode === 'transfer' && 'Transfer Inpatient Ward'}
                {mode === 'discharge' && 'Process Clinical Discharge'}
                {mode === 'lab' && 'Place Diagnostic Lab Order'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Live Operations Mutation & Capacity Updates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className={`grid ${isSupervisor ? 'grid-cols-3' : 'grid-cols-4'} border-b border-slate-200 bg-slate-100/60 p-1.5 gap-1 text-xs font-bold`}>
          <button
            onClick={() => { setMode('admit'); setFeedback(null); }}
            className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'admit' ? 'bg-white text-sky-800 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Admit</span>
          </button>
          <button
            onClick={() => { setMode('transfer'); setFeedback(null); }}
            className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'transfer' ? 'bg-white text-sky-800 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Transfer</span>
          </button>
          <button
            onClick={() => { setMode('discharge'); setFeedback(null); }}
            className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'discharge' ? 'bg-white text-sky-800 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserMinus className="w-3.5 h-3.5" />
            <span>Discharge</span>
          </button>
          {!isSupervisor && (
            <button
              onClick={() => { setMode('lab'); setFeedback(null); }}
              className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'lab' ? 'bg-white text-sky-800 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Lab Test</span>
            </button>
          )}
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`m-5 p-3 rounded-xl border flex items-center gap-2 text-xs font-bold ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6">
          {/* 1. ADMIT FORM */}
          {mode === 'admit' && (
            <form onSubmit={handleAdmitSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Patient ID</label>
                  <input
                    type="text"
                    required
                    value={admitPatId}
                    onChange={(e) => setAdmitPatId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-600"
                    placeholder="MCH-0001305"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Patient Age</label>
                  <input
                    type="number"
                    min="1"
                    max="110"
                    required
                    value={admitAge}
                    onChange={(e) => setAdmitAge(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={admitGender}
                    onChange={(e) => setAdmitGender(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-600"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Clinical Ward</label>
                  <select
                    value={admitWard}
                    onChange={(e) => setAdmitWard(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-600"
                  >
                    <option value="General Ward A">General Ward A (30 Cap)</option>
                    <option value="General Ward B">General Ward B (30 Cap)</option>
                    <option value="Paediatrics">Paediatrics Ward (16 Cap)</option>
                    <option value="ICU">Intensive Care Unit (ICU) (12 Cap)</option>
                    <option value="MICU">Medical ICU (MICU) (10 Cap)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Admitting Department</label>
                  <select
                    value={admitDept}
                    onChange={(e) => setAdmitDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-600"
                  >
                    <option value="Emergency">Emergency</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Surgery">Surgery</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Paediatrics">Paediatrics</option>
                    <option value="Orthopaedics">Orthopaedics</option>
                    <option value="Neurology">Neurology</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Admission Timestamp</label>
                  <input
                    type="text"
                    value={admitDate}
                    onChange={(e) => setAdmitDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-sky-600 font-semibold"
                  />
                </div>
              </div>

              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between text-xs text-sky-900">
                <span className="font-semibold">Reconciliation Engine Impact:</span>
                <span className="font-bold text-sky-950">+1 Active Inpatient • Occupancy Live Update</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Confirm Admission & Allocate Bed</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. TRANSFER FORM */}
          {mode === 'transfer' && (
            <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Admitted Inpatient</label>
                {activePatients.length > 0 ? (
                  <select
                    value={transferPatId}
                    onChange={(e) => setTransferPatId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-600"
                  >
                    {activePatients.slice(0, 30).map((p) => (
                      <option key={p.id} value={p.normalizedPatientId || p.sourcePatientId}>
                        {p.normalizedPatientId} — {p.canonicalWard} ({p.department}, Age {p.age})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={transferPatId}
                    onChange={(e) => setTransferPatId(e.target.value)}
                    placeholder="Enter Patient ID e.g. MCH-0001001"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:bg-white"
                  />
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Transfer Destination Ward</label>
                <select
                  value={transferToWard}
                  onChange={(e) => setTransferToWard(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-600"
                >
                  <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</option>
                  <option value="Medical ICU (MICU)">Medical ICU (MICU)</option>
                  <option value="General Ward A">General Ward A</option>
                  <option value="General Ward B">General Ward B</option>
                  <option value="Paediatrics">Paediatrics Ward</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinical Transfer Rationale</label>
                <input
                  type="text"
                  required
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-600 font-medium"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
                <span className="font-semibold">Census Impact:</span>
                <span className="font-bold">Bed transfer logged in HIS census</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>Execute Ward Transfer</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* 3. DISCHARGE FORM */}
          {mode === 'discharge' && (
            <form onSubmit={handleDischargeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Inpatient to Discharge</label>
                {activePatients.length > 0 ? (
                  <select
                    value={dischargePatId}
                    onChange={(e) => setDischargePatId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-600"
                  >
                    {activePatients.slice(0, 30).map((p) => (
                      <option key={p.id} value={p.normalizedPatientId || p.sourcePatientId}>
                        {p.normalizedPatientId} — {p.canonicalWard} (Adm: {p.admissionDateStr})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={dischargePatId}
                    onChange={(e) => setDischargePatId(e.target.value)}
                    placeholder="Enter Patient ID e.g. MCH-0001001"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:bg-white"
                  />
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Discharge Timestamp</label>
                <input
                  type="text"
                  value={dischargeDate}
                  onChange={(e) => setDischargeDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-sky-600 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Discharge Summary & Disposition</label>
                <textarea
                  rows="2"
                  value={dischargeNotes}
                  onChange={(e) => setDischargeNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-600 font-medium"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                <span className="font-semibold">Bed Utilization Impact:</span>
                <span className="font-bold">+1 Bed Immediately Vacant & Ready</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <UserMinus className="w-4 h-4" />
                    <span>Complete Discharge & Release Bed</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* 4. LAB ORDER FORM */}
          {mode === 'lab' && (
            <form onSubmit={handleLabSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Patient ID / MRN</label>
                  <input
                    type="text"
                    required
                    value={labPatId}
                    onChange={(e) => setLabPatId(e.target.value)}
                    placeholder="MCH-0001001"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority SLA</label>
                  <select
                    value={labPriority}
                    onChange={(e) => setLabPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-600"
                  >
                    <option value="STAT">STAT (2-Hour SLA)</option>
                    <option value="URGENT">URGENT (4-Hour SLA)</option>
                    <option value="ROUTINE">ROUTINE (8-Hour SLA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Diagnostic Test Panel</label>
                <select
                  value={labTestName}
                  onChange={(e) => setLabTestName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-600"
                >
                  <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
                  <option value="Serum Electrolytes">Serum Electrolytes (Na+, K+, Cl-)</option>
                  <option value="Lipid Panel">Lipid Panel</option>
                  <option value="Cardiac Troponin I">Cardiac Troponin I (STAT)</option>
                  <option value="Renal Function Test">Renal Function Test (BUN / Creatinine)</option>
                  <option value="Liver Function Test">Liver Function Test (LFT)</option>
                  <option value="Blood Culture & Sensitivity">Blood Culture & Sensitivity</option>
                  <option value="Coagulation Profile (PT/INR)">Coagulation Profile (PT/INR)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ordering Department</label>
                <select
                  value={labDept}
                  onChange={(e) => setLabDept(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-600"
                >
                  <option value="Emergency">Emergency</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Surgery">Surgery</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Paediatrics">Paediatrics</option>
                  <option value="Outpatient Clinic">Outpatient Clinic</option>
                </select>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between text-xs text-purple-900">
                <span className="font-semibold">Lab Queue Tracking:</span>
                <span className="font-bold">Added to Pending Specimen Queue</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FlaskConical className="w-4 h-4" />
                    <span>Transmit Lab Requisition</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
