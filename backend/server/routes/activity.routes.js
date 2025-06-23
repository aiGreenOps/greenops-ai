const express = require('express');
const router = express.Router();
const { protectMaintainer } = require('../middleware/auth.middleware');
const {
    createActivity,
    getAllActivities,
    deleteActivity,
    getActivitiesForMaintainer,
    acceptTask,
    completeTask,
} = require('../controllers/activity.controller');

router.post('/', createActivity);
router.get('/', getAllActivities);
router.delete('/:id', deleteActivity); // ← questo deve esserci
router.get('/mobile', getActivitiesForMaintainer);

router.patch('/:activityId/accept', protectMaintainer, acceptTask);
router.patch('/:activityId/complete', protectMaintainer, completeTask);

module.exports = router;
