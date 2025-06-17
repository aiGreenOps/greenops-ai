const express = require("express");
const router = express.Router();
const { startIrrigation, stopIrrigation } = require("../controllers/irrigation.controller");

router.post("/start", startIrrigation);
router.post("/stop", stopIrrigation);

module.exports = router;
