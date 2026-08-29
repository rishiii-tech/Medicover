// server/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const HospitalReconciliationEngine = require('./pipeline/reconciliationEngine');
const HospitalAiAssistant = require('./pipeline/aiAssistant');
const HospitalResourcesManager = require('./pipeline/resourcesManager');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize and execute reconciliation pipeline
const dataDir = path.join(__dirname, '../data');
const engine = new HospitalReconciliationEngine(dataDir);
engine.runPipeline();
const resourcesManager = new HospitalResourcesManager();
const aiAssistant = new HospitalAiAssistant(engine, resourcesManager);

// API ROUTES

// 1. Dashboard Overview
app.get('/api/dashboard', (req, res) => {
  try {
    const { date } = req.query;
    const overview = engine.getDashboardOverview(date || '2026-07-30');
    res.json({ success: true, data: overview });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Patients Flow & Census
app.get('/api/patients', (req, res) => {
  try {
    const { status, ward, department } = req.query;
    const result = engine.getPatients({ status, ward, department });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Bed Occupancy & Reconciliation Matrix
app.get('/api/beds', (req, res) => {
  try {
    const { date } = req.query;
    const result = engine.getBeds(date || '2026-07-30');
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching bed occupancy:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Laboratory Orders & Turnaround Times
app.get('/api/labs', (req, res) => {
  try {
    const { priority, status, department } = req.query;
    const result = engine.getLabs({ priority, status, department });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching lab data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Data Reconciliation Hub & Conflict Registry
app.get('/api/reconciliation', (req, res) => {
  try {
    const result = engine.getReconciliationData();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching reconciliation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Data Quality Scorecard
app.get('/api/data-quality', (req, res) => {
  try {
    const result = engine.getDataQuality();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching data quality:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Operational Alerts
app.get('/api/alerts', (req, res) => {
  try {
    const result = engine.getAlerts();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. Data Sources Metadata
app.get('/api/sources', (req, res) => {
  try {
    const result = engine.getSources();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching sources:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 9. Global Search
app.get('/api/search', (req, res) => {
  try {
    const { q } = req.query;
    const result = engine.search(q);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error executing search:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 11. AI Operations Assistant Query
app.post('/api/ai-assistant/query', (req, res) => {
  try {
    const { query, date } = req.body;
    const result = aiAssistant.processQuery(query, date || '2026-07-30');
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error processing AI query:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 12. Clinical Operational Actions: Admit Patient
app.post('/api/patients/admit', (req, res) => {
  try {
    const { patientId, age, gender, ward, department, admissionDate } = req.body;
    const record = engine.admitPatient({ patientId, age, gender, ward, department, admissionDate });
    res.json({ success: true, message: `Patient ${record.normalizedPatientId || record.patient_id} admitted successfully to ${record.canonicalWard || record.ward}.`, data: record });
  } catch (error) {
    console.error('Error admitting patient:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 13. Clinical Operational Actions: Discharge Patient
app.post('/api/patients/discharge', (req, res) => {
  try {
    const { patientId, dischargeDate, dischargeNotes } = req.body;
    const result = engine.dischargePatient({ patientId, dischargeDate, dischargeNotes });
    res.json({ success: true, message: `Patient ${patientId} discharged successfully. Bed capacity updated.`, data: result });
  } catch (error) {
    console.error('Error discharging patient:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 14. Clinical Operational Actions: Transfer Patient (Ward Move)
app.post('/api/patients/transfer', (req, res) => {
  try {
    const { patientId, toWard, transferReason } = req.body;
    const result = engine.transferPatient({ patientId, toWard, transferReason });
    res.json({ success: true, message: `Patient ${patientId} transferred to ${toWard}.`, data: result });
  } catch (error) {
    console.error('Error transferring patient:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 15. Clinical Operational Actions: Order Lab Test
app.post('/api/labs/order', (req, res) => {
  try {
    const { patientId, testName, priority, department, orderedAt } = req.body;
    const record = engine.orderLabTest({ patientId, testName, priority, department, orderedAt });
    res.json({ success: true, message: `Diagnostic order ${record.orderId || record.order_id} placed successfully.`, data: record });
  } catch (error) {
    console.error('Error ordering lab test:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 16. Clinical Operational Actions: Complete Lab Test
app.post('/api/labs/complete', (req, res) => {
  try {
    const { orderId, resultDate } = req.body;
    const result = engine.completeLabTest({ orderId, resultDate });
    res.json({ success: true, message: `Lab order ${orderId} marked as completed & resulted.`, data: result });
  } catch (error) {
    console.error('Error completing lab test:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 17. Critical Resources & Blood Bank
app.get('/api/resources', (req, res) => {
  try {
    const data = resourcesManager.getResourcesOverview();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/resources/blood/request', (req, res) => {
  try {
    const { patientId, bloodGroup, units, component, ward, urgency } = req.body;
    const result = resourcesManager.requestBloodUnits({ patientId, bloodGroup, units, component, ward, urgency });
    res.json({ success: true, message: `${units} units of ${bloodGroup} (${component || 'PRBC'}) requisitioned successfully.`, data: result });
  } catch (error) {
    console.error('Error requesting blood units:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/resources/oxygen/update', (req, res) => {
  try {
    const { ward, deliveredQty } = req.body;
    const result = resourcesManager.updateOxygenCylinders({ ward, deliveredQty });
    res.json({ success: true, message: `Oxygen cylinder inventory updated for ${ward}.`, data: result });
  } catch (error) {
    console.error('Error updating oxygen cylinders:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 18. Serve static client production build if available
const clientDistPath = path.join(__dirname, '../client/dist');
const fs = require('fs');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    }
  });
}

// Start Express server
app.listen(PORT, () => {
  console.log(`[Medicover Server] Hospital Operations API running on port ${PORT}`);
});
