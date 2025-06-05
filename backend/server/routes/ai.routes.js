// routes/ai.routes.js
const express = require("express");
const router = express.Router();
const { getAIResponse } = require("../services/ai.service");

router.post("/response", getAIResponse);

module.exports = router;
