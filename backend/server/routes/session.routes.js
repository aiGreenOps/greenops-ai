const express = require('express');
const router = express.Router();
const { getSessionInfo } = require('../controllers/session.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/info', protect, getSessionInfo);

module.exports = router;
