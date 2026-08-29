// server/pipeline/resourcesManager.js

/**
 * Hospital Critical Resources & Blood Bank Inventory Manager
 * Tracks Liquid Medical Oxygen (LMO), portable cylinders by ward, and 8 blood group units with component breakdown.
 */
class HospitalResourcesManager {
  constructor() {
    // 1. Oxygen System State
    this.oxygenData = {
      centralSupply: {
        lmoTankCapacityLiters: 10000,
        currentLmoLevelLiters: 7850,
        pressurePsi: 58, // Standard hospital pipeline is 50-60 PSI
        status: 'OPTIMAL',
        dailyConsumptionLiters: 420,
        estimatedAutonomyDays: 18.6
      },
      cylinderSummary: {
        totalCylinders: 120,
        fullAvailable: 48,
        inUseAtBeds: 58,
        inRefillCycle: 14
      },
      wardCylinders: [
        { ward: 'Intensive Care Unit (ICU)', totalAllocated: 28, inUse: 22, available: 6, bufferLevel: 'Adequate', type: 'Type D & E (High Flow)' },
        { ward: 'Medical ICU (MICU)', totalAllocated: 22, inUse: 18, available: 4, bufferLevel: 'Adequate', type: 'Type D & E (High Flow)' },
        { ward: 'General Ward A', totalAllocated: 20, inUse: 8, available: 12, bufferLevel: 'Optimal', type: 'Type B & D (Standard)' },
        { ward: 'General Ward B', totalAllocated: 18, inUse: 6, available: 12, bufferLevel: 'Optimal', type: 'Type B & D (Standard)' },
        { ward: 'Paediatrics Ward', totalAllocated: 12, inUse: 4, available: 8, bufferLevel: 'Optimal', type: 'Paediatric Regulators' },
        { ward: 'Emergency & Triage Buffer', totalAllocated: 20, inUse: 0, available: 20, bufferLevel: 'Reserve Standby', type: 'Rapid Transport Kits' }
      ]
    };

    // 2. Blood Bank Inventory State (8 Blood Groups)
    this.bloodBank = [
      {
        bloodGroup: 'O+',
        rhFactor: 'Positive',
        totalUnits: 34,
        prbcUnits: 18, // Packed Red Blood Cells
        ffpUnits: 10,  // Fresh Frozen Plasma
        plateletUnits: 6, // Random Donor Platelets
        status: 'OPTIMAL',
        thresholdMin: 15,
        universalRole: 'Universal RBC Recipient / High Demand'
      },
      {
        bloodGroup: 'O-',
        rhFactor: 'Negative',
        totalUnits: 9,
        prbcUnits: 5,
        ffpUnits: 3,
        plateletUnits: 1,
        status: 'LOW_BUFFER', // Universal donor is often low
        thresholdMin: 12,
        universalRole: 'Universal RBC Donor (Critical Emergency Stock)'
      },
      {
        bloodGroup: 'A+',
        rhFactor: 'Positive',
        totalUnits: 26,
        prbcUnits: 14,
        ffpUnits: 8,
        plateletUnits: 4,
        status: 'OPTIMAL',
        thresholdMin: 12,
        universalRole: 'Standard Stock'
      },
      {
        bloodGroup: 'A-',
        rhFactor: 'Negative',
        totalUnits: 7,
        prbcUnits: 4,
        ffpUnits: 2,
        plateletUnits: 1,
        status: 'LOW_BUFFER',
        thresholdMin: 8,
        universalRole: 'Targeted Donor'
      },
      {
        bloodGroup: 'B+',
        rhFactor: 'Positive',
        totalUnits: 28,
        prbcUnits: 15,
        ffpUnits: 9,
        plateletUnits: 4,
        status: 'OPTIMAL',
        thresholdMin: 12,
        universalRole: 'Standard High Frequency'
      },
      {
        bloodGroup: 'B-',
        rhFactor: 'Negative',
        totalUnits: 6,
        prbcUnits: 3,
        ffpUnits: 2,
        plateletUnits: 1,
        status: 'LOW_BUFFER',
        thresholdMin: 8,
        universalRole: 'Targeted Rare Group'
      },
      {
        bloodGroup: 'AB+',
        rhFactor: 'Positive',
        totalUnits: 15,
        prbcUnits: 8,
        ffpUnits: 5,
        plateletUnits: 2,
        status: 'OPTIMAL',
        thresholdMin: 8,
        universalRole: 'Universal Plasma Donor'
      },
      {
        bloodGroup: 'AB-',
        rhFactor: 'Negative',
        totalUnits: 4,
        prbcUnits: 2,
        ffpUnits: 1,
        plateletUnits: 1,
        status: 'CRITICAL',
        thresholdMin: 6,
        universalRole: 'Rarest Blood Group (Urgent Drive Alert)'
      }
    ];

    this.recentTransfusions = [
      { id: 'TXN-901', patientId: 'MCH-0001014', ward: 'Intensive Care Unit (ICU)', bloodGroup: 'O+', units: 2, component: 'PRBC', time: '30-Jul 11:30', status: 'Transfused' },
      { id: 'TXN-902', patientId: 'MCH-0001048', ward: 'Surgery / OT', bloodGroup: 'A+', units: 1, component: 'FFP', time: '30-Jul 13:15', status: 'Transfused' },
      { id: 'TXN-903', patientId: 'MCH-0001089', ward: 'Emergency', bloodGroup: 'O-', units: 2, component: 'PRBC (Emergency)', time: '30-Jul 14:40', status: 'Cross-Matched' },
      { id: 'TXN-904', patientId: 'MCH-0001122', ward: 'Medical ICU (MICU)', bloodGroup: 'B+', units: 1, component: 'Platelets', time: '30-Jul 15:20', status: 'In Progress' }
    ];
  }

  getResourcesOverview() {
    const totalBloodUnits = this.bloodBank.reduce((acc, b) => acc + b.totalUnits, 0);
    const criticalBloodGroups = this.bloodBank.filter(b => b.status === 'CRITICAL' || b.status === 'LOW_BUFFER');

    return {
      oxygen: this.oxygenData,
      bloodBank: {
        totalUnits: totalBloodUnits,
        groups: this.bloodBank,
        criticalAlertCount: criticalBloodGroups.length,
        recentTransfusions: this.recentTransfusions
      }
    };
  }

  requestBloodUnits({ patientId, bloodGroup, units, component, ward, urgency }) {
    const groupItem = this.bloodBank.find(b => b.bloodGroup.toUpperCase() === bloodGroup.toUpperCase());
    if (!groupItem) {
      throw new Error(`Invalid blood group "${bloodGroup}". Valid groups: O+, O-, A+, A-, B+, B-, AB+, AB-.`);
    }

    const qty = parseInt(units, 10) || 1;
    if (groupItem.totalUnits < qty) {
      throw new Error(`Insufficient inventory for ${bloodGroup}. Available: ${groupItem.totalUnits} units, Requested: ${qty} units.`);
    }

    groupItem.totalUnits -= qty;
    if (component === 'PRBC' && groupItem.prbcUnits >= qty) groupItem.prbcUnits -= qty;
    else if (component === 'FFP' && groupItem.ffpUnits >= qty) groupItem.ffpUnits -= qty;
    else if (component === 'Platelets' && groupItem.plateletUnits >= qty) groupItem.plateletUnits -= qty;

    // Update status
    if (groupItem.totalUnits <= 4) groupItem.status = 'CRITICAL';
    else if (groupItem.totalUnits < groupItem.thresholdMin) groupItem.status = 'LOW_BUFFER';

    const txnId = `TXN-${900 + this.recentTransfusions.length + 1}`;
    const newTxn = {
      id: txnId,
      patientId: patientId || 'Emergency Reserve',
      ward: ward || 'Emergency / OT',
      bloodGroup: groupItem.bloodGroup,
      units: qty,
      component: component || 'PRBC',
      time: 'Just Now',
      status: urgency === 'STAT' ? 'Emergency Dispatch' : 'Cross-Matched'
    };

    this.recentTransfusions.unshift(newTxn);
    return { success: true, transaction: newTxn, remainingUnits: groupItem.totalUnits };
  }

  updateOxygenCylinders({ ward, deliveredQty, refilledQty }) {
    const targetWard = this.oxygenData.wardCylinders.find(w => w.ward.toLowerCase().includes(ward.toLowerCase()));
    if (!targetWard) {
      throw new Error(`Ward "${ward}" not found in oxygen allocation grid.`);
    }

    const delivered = parseInt(deliveredQty, 10) || 0;
    targetWard.available += delivered;
    targetWard.totalAllocated += delivered;
    this.oxygenData.cylinderSummary.fullAvailable += delivered;

    return { success: true, ward: targetWard.ward, available: targetWard.available };
  }
}

module.exports = HospitalResourcesManager;
