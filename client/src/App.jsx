import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './views/DashboardView';
import BedOccupancyView from './views/BedOccupancyView';
import PatientFlowView from './views/PatientFlowView';
import LabTurnaroundView from './views/LabTurnaroundView';
import ReconciliationHubView from './views/ReconciliationHubView';
import DataSourcesView from './views/DataSourcesView';
import AuditTransparencyView from './views/AuditTransparencyView';
import ResourcesView from './views/ResourcesView';
import LoginView from './views/LoginView';
import ConflictDetailModal from './components/ConflictDetailModal';
import GlobalSearchModal from './components/GlobalSearchModal';
import AiCopilotDrawer from './components/AiCopilotDrawer';
import PatientActionModal from './components/PatientActionModal';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('medicover_auth') === 'true';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('medicover_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      name: 'Dr. Rajesh Varma',
      role: 'ADMIN',
      title: 'Hospital Operations Lead',
      email: 'ops.lead@medicover.internal',
      avatar: 'RV'
    };
  });

  const isSupervisor = currentUser?.role === 'SUPERVISOR';

  // Active view tab state - supervisors default to 'beds'
  const [activeTab, setActiveTab] = useState(() => {
    const savedRole = localStorage.getItem('medicover_user');
    if (savedRole && savedRole.includes('SUPERVISOR')) return 'beds';
    return 'dashboard';
  });

  const [selectedDate, setSelectedDate] = useState('2026-07-30');

  // Dashboard state
  const [dashboardData, setDashboardData] = useState(null);
  const [activePatientsList, setActivePatientsList] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals & Drawers
  const [selectedConflict, setSelectedConflict] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState(false);
  const [actionModalConfig, setActionModalConfig] = useState({
    isOpen: false,
    mode: 'admit',
    patient: null
  });

  // Guard against supervisor accessing admin-only tabs
  useEffect(() => {
    if (isSupervisor && !['beds', 'patients', 'resources'].includes(activeTab)) {
      setActiveTab('beds');
    }
  }, [isSupervisor, activeTab]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboard(selectedDate);
      fetchActivePatients();
    }
  }, [isAuthenticated, selectedDate]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchDashboard = async (date) => {
    try {
      const res = await fetch(`/api/dashboard?date=${date}`);
      const json = await res.json();
      if (json.success) {
        setDashboardData(json.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    }
  };

  const fetchActivePatients = async () => {
    try {
      const res = await fetch('/api/patients');
      const json = await res.json();
      if (json.success) {
        const activeOnly = (json.data.patients || []).filter(p => p.isCurrentlyAdmitted);
        setActivePatientsList(activeOnly);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const handleRefreshPipeline = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/reconciliation/recompute', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        await fetchDashboard(selectedDate);
        await fetchActivePatients();
      }
    } catch (err) {
      console.error('Pipeline recompute error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleOpenActionModal = (mode = 'admit', patient = null) => {
    if (isSupervisor && mode === 'lab') {
      return; // Supervisors cannot order lab tests
    }
    setActionModalConfig({
      isOpen: true,
      mode,
      patient
    });
  };

  const handleActionSuccess = () => {
    fetchDashboard(selectedDate);
    fetchActivePatients();
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('medicover_auth', 'true');
    localStorage.setItem('medicover_user', JSON.stringify(user));
    if (user.role === 'SUPERVISOR') {
      setActiveTab('beds');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('medicover_auth');
    localStorage.removeItem('medicover_user');
  };

  const handleSwitchRole = (newRole) => {
    if (newRole === 'SUPERVISOR') {
      const supervisorUser = {
        name: 'Sister Anita Roy',
        role: 'SUPERVISOR',
        title: 'Floor Supervisor',
        email: 'supervisor.floor@medicover.internal',
        avatar: 'AR'
      };
      setCurrentUser(supervisorUser);
      localStorage.setItem('medicover_user', JSON.stringify(supervisorUser));
      setActiveTab('beds');
    } else {
      const adminUser = {
        name: 'Dr. Rajesh Varma',
        role: 'ADMIN',
        title: 'Hospital Operations Lead',
        email: 'ops.lead@medicover.internal',
        avatar: 'RV'
      };
      setCurrentUser(adminUser);
      localStorage.setItem('medicover_user', JSON.stringify(adminUser));
      setActiveTab('dashboard');
    }
  };

  const handleSelectSearchResult = (result) => {
    if (result.type === 'patient') {
      setActiveTab('patients');
    } else if (result.type === 'lab') {
      if (!isSupervisor) setActiveTab('labs');
    } else if (result.type === 'ward') {
      setActiveTab('beds');
    }
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#F1F6FB] via-[#F6F9FD] to-[#EBF2F8] text-slate-800 font-sans overflow-hidden selection:bg-sky-200 selection:text-sky-900">
      {/* Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        conflictCount={dashboardData?.kpis?.dataQuality?.conflictsDetected || 158}
        unmatchedCount={dashboardData?.kpis?.dataQuality?.unmatchedLabRecords || 34}
        delayedLabsCount={dashboardData?.kpis?.laboratory?.delayed || 491}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0 bg-transparent">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAiCopilot={() => setIsAiCopilotOpen(!isAiCopilotOpen)}
          isAiOpen={isAiCopilotOpen}
          onRefresh={handleRefreshPipeline}
          isRefreshing={isRefreshing}
          onOpenActionModal={handleOpenActionModal}
          alertCount={dashboardData?.activeAlerts?.length || 8}
          currentUser={currentUser}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-none bg-transparent">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* View 1: Executive Dashboard (Admin Only) */}
            {activeTab === 'dashboard' && !isSupervisor && (
              <DashboardView
                dashboardData={dashboardData}
                onNavigate={(tab) => setActiveTab(tab)}
                onOpenConflict={(conflict) => setSelectedConflict(conflict)}
                onOpenAction={handleOpenActionModal}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            )}

            {/* View 2: Bed Occupancy & Census (Allowed for Supervisor & Admin) */}
            {activeTab === 'beds' && (
              <BedOccupancyView
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                onOpenConflict={(conflict) => setSelectedConflict(conflict)}
                onOpenAction={handleOpenActionModal}
              />
            )}

            {/* View 3: Patient Flow (Allowed for Supervisor & Admin) */}
            {activeTab === 'patients' && (
              <PatientFlowView
                onOpenAction={handleOpenActionModal}
                currentUser={currentUser}
              />
            )}

            {/* View 4: Lab Turnaround (Admin Only) */}
            {activeTab === 'labs' && !isSupervisor && (
              <LabTurnaroundView
                onOpenAction={handleOpenActionModal}
              />
            )}

            {/* View 5: Oxygen & Blood Bank (Allowed for Supervisor & Admin) */}
            {activeTab === 'resources' && (
              <ResourcesView />
            )}

            {/* View 6: Data Reconciliation Hub (Admin Only) */}
            {activeTab === 'reconciliation' && !isSupervisor && (
              <ReconciliationHubView
                onOpenConflict={(conflict) => setSelectedConflict(conflict)}
              />
            )}

            {/* View 7: Data Sources (Admin Only) */}
            {activeTab === 'sources' && !isSupervisor && (
              <DataSourcesView />
            )}

            {/* View 8: Audit Transparency (Admin Only) */}
            {activeTab === 'audit' && !isSupervisor && (
              <AuditTransparencyView />
            )}
          </div>
        </main>
      </div>

      {/* Helix AI Assistant Drawer */}
      <AiCopilotDrawer
        isOpen={isAiCopilotOpen}
        onClose={() => setIsAiCopilotOpen(false)}
        selectedDate={selectedDate}
      />

      {/* Unified Patient Action Modal */}
      <PatientActionModal
        isOpen={actionModalConfig.isOpen}
        onClose={() => setActionModalConfig(prev => ({ ...prev, isOpen: false }))}
        initialMode={actionModalConfig.mode}
        initialPatient={actionModalConfig.patient}
        activePatients={activePatientsList}
        onActionSuccess={handleActionSuccess}
        currentUser={currentUser}
      />

      {/* Conflict Detail Modal */}
      {selectedConflict && (
        <ConflictDetailModal
          conflict={selectedConflict}
          onClose={() => setSelectedConflict(null)}
        />
      )}

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={handleSelectSearchResult}
      />
    </div>
  );
}
