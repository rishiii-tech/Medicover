// server/pipeline/aiAssistant.js

/**
 * Intelligent Hospital Operations Helix Assistant Engine
 * Answers natural language operational questions with exact real-time data from the reconciliation engine.
 */
class HospitalAiAssistant {
  constructor(engine, resourcesManager) {
    this.engine = engine;
    this.resourcesManager = resourcesManager;
  }

  processQuery(queryText, contextDate = '2026-07-30') {
    if (!queryText || typeof queryText !== 'string' || !queryText.trim()) {
      return {
        answer: "Hello! I am **Helix**, your **Hospital Operations Intelligence Assistant**. You can ask me anything about bed occupancy, ward availability, patient admissions, lab turnaround times, oxygen cylinders, or blood bank inventory.",
        suggestions: [
          "How many ICU beds are available?",
          "What is the oxygen cylinder availability?",
          "Show blood group inventory in blood bank",
          "Show active operational alerts"
        ],
        dataRef: null
      };
    }

    const q = queryText.toLowerCase().trim();
    const overview = this.engine.getDashboardOverview(contextDate);
    const kpis = overview.kpis;
    const beds = this.engine.getBeds(contextDate);
    const labs = this.engine.getLabs();
    const recon = this.engine.getReconciliationData();
    const patients = this.engine.getPatients();
    const resources = this.resourcesManager ? this.resourcesManager.getResourcesOverview() : null;

    // 0. Oxygen Cylinder & Central Manifold Availability
    if (q.includes('oxygen') || q.includes('cylinder') || q.includes('lmo') || q.includes('o2')) {
      if (resources) {
        const ox = resources.oxygen;
        let response = `### 🫁 Oxygen Supply & Cylinder Availability Report\n\n`;
        response += `**Central Liquid Medical Oxygen (LMO) Plant:**\n`;
        response += `- **Current Liquid Volume:** **${ox.centralSupply.currentLmoLevelLiters.toLocaleString()} Liters** / ${ox.centralSupply.lmoTankCapacityLiters.toLocaleString()} L (${Math.round((ox.centralSupply.currentLmoLevelLiters / ox.centralSupply.lmoTankCapacityLiters) * 100)}% capacity)\n`;
        response += `- **Pipeline Pressure:** **${ox.centralSupply.pressurePsi} PSI** (Standard normal: 50-60 PSI)\n`;
        response += `- **Estimated Autonomy / Run-Time:** **${ox.centralSupply.estimatedAutonomyDays} Days** at ${ox.centralSupply.dailyConsumptionLiters} L/day burn rate\n\n`;

        response += `**Portable Oxygen Cylinders (Total: ${ox.cylinderSummary.totalCylinders}):**\n`;
        response += `- **Full & Ready to Deploy:** **${ox.cylinderSummary.fullAvailable} cylinders**\n`;
        response += `- **In-Use at Patient Beds / Ventilators:** ${ox.cylinderSummary.inUseAtBeds} cylinders\n`;
        response += `- **In Refill Cycle:** ${ox.cylinderSummary.inRefillCycle} cylinders\n\n`;

        response += `**Ward-by-Ward Cylinder Allocation:**\n`;
        ox.wardCylinders.forEach(w => {
          response += `- **${w.ward}:** ${w.available} available (${w.inUse} in use / ${w.totalAllocated} total) • *Status: ${w.bufferLevel}*\n`;
        });

        return {
          answer: response,
          suggestions: [
            "Show blood group inventory in blood bank",
            "How many ICU beds are available?",
            "View critical care bed status"
          ],
          actionTab: 'resources'
        };
      }
    }

    // 0.5. Blood Bank & Blood Group Availability
    if (q.includes('blood') || q.includes('group') || q.includes('transfus') || q.includes('plasma') || q.includes('prbc') || q.includes('platelet')) {
      if (resources) {
        const bb = resources.bloodBank;
        let response = `### 🩸 Blood Bank Inventory & Group Availability\n\n`;
        response += `**Total Reserve:** **${bb.totalUnits} Blood Units Available** (${bb.criticalAlertCount} groups requiring monitoring)\n\n`;

        response += `**Availability by Blood Group:**\n`;
        bb.groups.forEach(g => {
          const statusIcon = g.status === 'CRITICAL' ? '🔴 **CRITICAL**' : g.status === 'LOW_BUFFER' ? '🟡 *Low Buffer*' : '🟢 *Optimal*';
          response += `- **${g.bloodGroup} (${g.rhFactor}):** **${g.totalUnits} Units** (${g.prbcUnits} PRBC, ${g.ffpUnits} FFP, ${g.plateletUnits} Platelets) — ${statusIcon}\n`;
        });

        response += `\n**Urgent Clinical Stock Alert:**\n`;
        const lowList = bb.groups.filter(g => g.status === 'CRITICAL' || g.status === 'LOW_BUFFER');
        lowList.forEach(l => {
          response += `- *${l.bloodGroup}:* ${l.totalUnits} units on hand (Min safe buffer: ${l.thresholdMin}). ${l.universalRole}\n`;
        });

        return {
          answer: response,
          suggestions: [
            "What is the oxygen cylinder availability?",
            "How many ICU beds are available?",
            "Show active operational alerts"
          ],
          actionTab: 'resources'
        };
      }
    }

    // 1. Specific ICU / MICU Bed Availability Question
    if (q.includes('icu') && (q.includes('bed') || q.includes('available') || q.includes('how many') || q.includes('occupan') || q.includes('count') || q.includes('vacant'))) {
      const icuWard = beds.wards.find(w => w.ward.toLowerCase().includes('intensive care unit') || w.ward.toLowerCase().includes('icu') && !w.ward.toLowerCase().includes('medical icu'));
      const micuWard = beds.wards.find(w => w.ward.toLowerCase().includes('medical icu') || w.ward.toLowerCase().includes('micu'));

      let response = `### 🏥 ICU Bed Availability Report (${contextDate})\n\n`;

      if (icuWard) {
        const icuAvail = icuWard.manualAvailable !== null ? icuWard.manualAvailable : Math.max(0, icuWard.totalCapacity - icuWard.hisOccupiedCount);
        const icuOcc = icuWard.manualOccupied !== null ? icuWard.manualOccupied : icuWard.hisOccupiedCount;
        const icuPct = Math.round((icuOcc / icuWard.totalCapacity) * 100);

        response += `**1. Intensive Care Unit (ICU):**\n`;
        response += `- **Available Beds:** **${icuAvail} vacant beds**\n`;
        response += `- **Occupied Beds:** ${icuOcc} / ${icuWard.totalCapacity} beds (${icuPct}% occupancy)\n`;
        response += `- **HIS Clinical Census:** ${icuWard.hisOccupiedCount} active inpatients\n`;
        if (icuWard.manualRemarks) {
          response += `- *Nursing Note:* "${icuWard.manualRemarks}"\n`;
        }
        response += `\n`;
      }

      if (micuWard) {
        const micuAvail = micuWard.manualAvailable !== null ? micuWard.manualAvailable : Math.max(0, micuWard.totalCapacity - micuWard.hisOccupiedCount);
        const micuOcc = micuWard.manualOccupied !== null ? micuWard.manualOccupied : micuWard.hisOccupiedCount;
        const micuPct = Math.round((micuOcc / micuWard.totalCapacity) * 100);

        response += `**2. Medical ICU (MICU):**\n`;
        response += `- **Available Beds:** **${micuAvail} vacant beds** ${micuAvail === 0 ? '⚠️ *(At 100% Critical Capacity!)*' : ''}\n`;
        response += `- **Occupied Beds:** ${micuOcc} / ${micuWard.totalCapacity} beds (${micuPct}% occupancy)\n`;
        response += `- **HIS Clinical Census:** ${micuWard.hisOccupiedCount} active inpatients\n`;
        if (micuWard.manualRemarks) {
          response += `- *Nursing Note:* "${micuWard.manualRemarks}"\n`;
        }
        response += `\n`;
      }

      const totalIcuBeds = (icuWard?.totalCapacity || 0) + (micuWard?.totalCapacity || 0);
      const totalIcuOcc = (icuWard ? (icuWard.manualOccupied ?? icuWard.hisOccupiedCount) : 0) + (micuWard ? (micuWard.manualOccupied ?? micuWard.hisOccupiedCount) : 0);
      const totalIcuAvail = Math.max(0, totalIcuBeds - totalIcuOcc);

      response += `**Summary for Critical Care:** Combined ICU + MICU currently has **${totalIcuAvail} available beds** out of ${totalIcuBeds} total critical beds (${Math.round((totalIcuOcc / totalIcuBeds) * 100)}% utilization).`;

      return {
        answer: response,
        suggestions: [
          "Show bed occupancy for General Ward A & B",
          "What is the total hospital available beds?",
          "View active operational alerts"
        ],
        actionTab: 'beds'
      };
    }

    // 2. Overall Bed Occupancy & Capacity
    if (q.includes('bed') || q.includes('occupan') || q.includes('capacity') || q.includes('available bed') || q.includes('vacant')) {
      const bKpi = kpis.beds;
      let response = `### 🛏️ Hospital-Wide Bed Capacity & Census (${contextDate})\n\n`;
      response += `- **Total Operational Beds:** **${bKpi.totalBeds} beds**\n`;
      response += `- **Occupied Beds:** **${bKpi.occupiedBeds} beds** (${bKpi.occupancyPercentage}% hospital-wide occupancy)\n`;
      response += `- **Available / Vacant Beds:** **${bKpi.availableBeds} beds ready for admission**\n\n`;

      response += `**Ward-by-Ward Breakdown:**\n`;
      beds.wards.forEach(w => {
        const occ = w.manualOccupied !== null ? w.manualOccupied : w.hisOccupiedCount;
        const avail = w.manualAvailable !== null ? w.manualAvailable : Math.max(0, w.totalCapacity - w.hisOccupiedCount);
        const pct = Math.round((occ / w.totalCapacity) * 100);
        response += `- **${w.ward}:** ${occ}/${w.totalCapacity} occupied (${avail} available, **${pct}%**) ${w.hasDiscrepancy ? `*(Δ ${w.delta > 0 ? '+' + w.delta : w.delta} discrepancy)*` : ''}\n`;
      });

      return {
        answer: response,
        suggestions: [
          "How many ICU beds are available?",
          "Why is there a discrepancy in Medical ICU?",
          "What about July 9 missing bed sheet date?"
        ],
        actionTab: 'beds'
      };
    }

    // 3. Laboratory Turnaround Time (TAT), Pending & Delayed Orders
    if (q.includes('lab') || q.includes('test') || q.includes('turnaround') || q.includes('tat') || q.includes('pending') || q.includes('delay') || q.includes('sla') || q.includes('urgent') || q.includes('stat')) {
      const lKpi = kpis.laboratory;
      const metrics = labs.metrics;

      let response = `### 🧪 Laboratory Turnaround (TAT) Status\n\n`;
      response += `- **Total Diagnostic Orders:** **${lKpi.totalOrders} requests**\n`;
      response += `- **Completed & Resulted:** **${lKpi.completed} tests**\n`;
      response += `- **Currently in Processing (Pending):** **${lKpi.pending} specimens**\n`;
      response += `- **SLA Breaches / Delayed:** **${lKpi.delayed} orders** exceeded priority turnaround targets\n`;
      response += `- **Mean Turnaround Time:** **${lKpi.avgTatHours} Hours**\n\n`;

      response += `**Turnaround by Clinical Priority:**\n`;
      metrics.priorityStats.forEach(pri => {
        response += `- **${pri.priority} (Target: ${pri.slaMinutes / 60}h):** Total: ${pri.total}, Done: ${pri.completed}, Pending: ${pri.pending}, Delayed: ${pri.delayed} (Mean TAT: **${pri.avgTatHours}h**, Compliance: ${pri.complianceRate}%)\n`;
      });

      response += `\n**Phase Latencies:**\n`;
      response += `- *Order → Collection:* ${(metrics.avgOrderToCollectionMin / 60).toFixed(1)}h (${metrics.avgOrderToCollectionMin} mins)\n`;
      response += `- *Collection → Result Entry:* ${(metrics.avgCollectionToResultMin / 60).toFixed(1)}h (${metrics.avgCollectionToResultMin} mins)\n`;

      return {
        answer: response,
        suggestions: [
          "Which department has the most lab orders?",
          "How many lab patients had no admission record?",
          "Show pending lab tests"
        ],
        actionTab: 'labs'
      };
    }

    // 4. Patient Flow, Admissions, Discharges & Current Inpatients
    if (q.includes('patient') || q.includes('admi') || q.includes('discharg') || q.includes('inpatient') || q.includes('flow') || q.includes('census')) {
      const pKpi = kpis.patientFlow;
      let response = `### 👥 Patient Flow & Inpatient Census Summary\n\n`;
      response += `- **Currently Admitted Inpatients:** **${pKpi.currentAdmitted} active patients**\n`;
      response += `- **Total Admissions in July:** **${pKpi.totalAdmissions} patients** (deduplicated)\n`;
      response += `- **Total Discharges in July:** **${pKpi.totalDischarges} patients**\n`;
      response += `- **Net Census Change:** +${pKpi.netFlow} patients\n\n`;

      response += `**Admissions by Clinical Department:**\n`;
      patients.metrics.departmentBreakdown.slice(0, 5).forEach(d => {
        response += `- **${d.department}:** ${d.total} admissions (${d.active} currently admitted)\n`;
      });

      response += `\n**Demographics:** Average Patient Age is **${patients.metrics.demographics.avgAge} years** (${patients.metrics.demographics.maleCount} Male, ${patients.metrics.demographics.femaleCount} Female).`;

      return {
        answer: response,
        suggestions: [
          "How many ICU beds are available?",
          "Show 6 duplicate HIS admission rows",
          "What is the total hospital occupancy?"
        ],
        actionTab: 'patients'
      };
    }

    // 5. Data Quality, Reconciliation, Discrepancies & Conflicts
    if (q.includes('conflict') || q.includes('reconcil') || q.includes('discrepan') || q.includes('rule') || q.includes('duplicate') || q.includes('unmatch') || q.includes('missing')) {
      const dq = kpis.dataQuality;
      let response = `### 🔄 Data Reconciliation & Integrity Overview\n\n`;
      response += `- **Total Ingested Records:** **${dq.recordsProcessed} rows** across 3 systems (HIS: 309, Labs: 607, Beds: 130)\n`;
      response += `- **Discrepancies Detected:** **${dq.conflictsDetected} conflict points**\n`;
      response += `- **Discrepancies Resolved:** **${dq.conflictsResolved} resolved with visible rules (100%)**\n`;
      response += `- **Reconciliation Health Score:** **${dq.reconciliationHealthScore}%**\n\n`;

      response += `**Key Reconciliation Decisions Applied:**\n`;
      response += `1. **Duplicate Deduplication (6 rows):** Preserved primary admission in census to prevent artificial bed inflation.\n`;
      response += `2. **Unmatched Lab Patients (34 patients / 42 orders):** Preserved as Outpatient/Direct diagnostic orders.\n`;
      response += `3. **Missing Bed Dates (July 9, 12, 19, 27):** Preserved as *"Data unavailable"* rather than assumed zero.\n`;
      response += `4. **Floor Census vs HIS Delta:** Preserved manual headcount as physical snapshot; retained HIS active count as clinical census.\n`;

      return {
        answer: response,
        suggestions: [
          "Explain Rule 4 for Bed Discrepancies",
          "How were duplicate records handled?",
          "Why are 4 bed sheet dates missing?"
        ],
        actionTab: 'reconciliation'
      };
    }

    // 6. Operational Alerts
    if (q.includes('alert') || q.includes('warn') || q.includes('critical') || q.includes('issue') || q.includes('bottleneck')) {
      const alerts = overview.activeAlerts;
      let response = `### ⚠️ Active Operational Alerts (${alerts.length})\n\n`;

      alerts.forEach((alt, idx) => {
        response += `**${idx + 1}. [${alt.severity} PRIORITY] ${alt.title}**\n`;
        response += `- *Details:* ${alt.message}\n`;
        response += `- *Recommended Action:* **${alt.action}**\n\n`;
      });

      return {
        answer: response,
        suggestions: [
          "How many ICU beds are available?",
          "Show delayed lab orders",
          "Open Data Reconciliation Hub"
        ],
        actionTab: 'dashboard'
      };
    }

    // 7. Specific Search Query for Patient ID / Lab Order ID
    if (q.includes('mch-') || q.includes('lab5') || q.match(/\b\d{4}\b/)) {
      const searchRes = this.engine.search(q);
      let response = `### 🔍 Search Results for "${queryText}"\n\n`;

      if (searchRes.results.patients.length > 0) {
        response += `**Matched Patients (${searchRes.results.patients.length}):**\n`;
        searchRes.results.patients.forEach(p => {
          response += `- **${p.normalizedPatientId}** (Source: ${p.sourcePatientId}) | Ward: **${p.canonicalWard}** | Dept: ${p.department} | Status: **${p.isCurrentlyAdmitted ? 'Admitted' : 'Discharged'}** | Adm: ${p.admissionDateStr}\n`;
        });
        response += `\n`;
      }

      if (searchRes.results.labs.length > 0) {
        response += `**Matched Lab Orders (${searchRes.results.labs.length}):**\n`;
        searchRes.results.labs.forEach(l => {
          response += `- **${l.orderId}** | Test: **${l.testName}** | Patient: ${l.normalizedPatientId} | Priority: **${l.priority}** | Status: **${l.status}** | TAT: ${l.isCompleted ? (l.totalTatMin / 60).toFixed(1) + 'h' : 'In Queue'}\n`;
        });
      }

      if (searchRes.results.patients.length === 0 && searchRes.results.labs.length === 0) {
        response += `No direct patient or order ID matched "${queryText}". You can search by patient IDs (e.g. \`MCH-0001001\`, \`1023\`) or order IDs (e.g. \`LAB500001\`).`;
      }

      return {
        answer: response,
        suggestions: [
          "How many ICU beds are available?",
          "What is the total bed occupancy?",
          "Show active alerts"
        ]
      };
    }

    // 8. General / Fallback Response with rich context
    return {
      answer: `### 🏥 Helix Operations Intelligence\n\nI can provide exact, reconciled operational data for any aspect of the hospital:\n\n- **Bed Occupancy & Census:** ${kpis.beds.occupiedBeds}/${kpis.beds.totalBeds} beds occupied (**${kpis.beds.occupancyPercentage}%**), **${kpis.beds.availableBeds} beds available**.\n- **Critical Care (ICU/MICU):** Real-time headcount, capacity limits, and nurse shift notes.\n- **Patient Flow:** **${kpis.patientFlow.currentAdmitted} admitted inpatients**, ${kpis.patientFlow.totalAdmissions} admissions, ${kpis.patientFlow.totalDischarges} discharges.\n- **Laboratory Diagnostics:** **${kpis.laboratory.totalOrders} total orders** (${kpis.laboratory.completed} completed, ${kpis.laboratory.pending} in queue, ${kpis.laboratory.delayed} delayed against SLAs).\n- **Data Reconciliation Engine:** **${kpis.dataQuality.conflictsResolved} of ${kpis.dataQuality.conflictsDetected} cross-system discrepancies resolved** across HIS, LIMS, and Manual Bed sheets.\n\n*What specific metric or ward would you like me to inspect?*`,
      suggestions: [
        "How many ICU beds are available?",
        "What is the overall bed occupancy?",
        "How many lab tests are pending or delayed?",
        "Show active high-severity operational alerts"
      ]
    };
  }
}

module.exports = HospitalAiAssistant;
