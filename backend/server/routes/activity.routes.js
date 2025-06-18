const express = require('express');
const router = express.Router();
const {
    createActivity,
    getAllActivities,
    deleteActivity,
    getActivitiesForMaintainer,
} = require('../controllers/activity.controller');

router.post('/', createActivity);
router.get('/', getAllActivities);
router.delete('/:id', deleteActivity); // ← questo deve esserci
router.get('/mobile', getActivitiesForMaintainer);

module.exports = router;
