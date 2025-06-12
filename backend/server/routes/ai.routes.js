// routes/ai.routes.js
const express = require("express");
const router = express.Router();

const { getAIResponse } = require("../services/ai.service");
const { getGreenOpsLLMAnalysis } = require("../services/ai.service");

router.post("/response", getAIResponse);
router.post("/greenops-analysis", getGreenOpsLLMAnalysis);

module.exports = router;
