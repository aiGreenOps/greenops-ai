// routes/reports.routes.js
const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');

router.get('/summary', reportsController.getSummaryData);
router.get('/weekly-activities-excel', reportsController.generateActivityExcel);
router.get('/water-usage-excel', reportsController.generateWaterUsageExcel);
router.get('/segnalazioni-excel', reportsController.generateSegnalazioniExcel);

module.exports = router;
