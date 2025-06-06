const express = require('express');
const router = express.Router();
const stationController = require('../controllers/station.controller');

// /api/stations/
router.get('/', stationController.getAllStations);
router.put('/:name', stationController.updateStation);

module.exports = router;
