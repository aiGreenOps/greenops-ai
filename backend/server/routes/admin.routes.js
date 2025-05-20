// routes/admin.routes.js
const express = require("express");
const router = express.Router();
const { requireRole, protectAdmin } = require("../middleware/auth.middleware");
const adminCtrl = require("../controllers/admin.controller");
const { logoutAdmin }  = require("../controllers/auth.controller");

router.post("/logout", protectAdmin, logoutAdmin);

// tutte le route giù in ordine
router.get("/users/pending", protectAdmin, requireRole("admin"), adminCtrl.getPending);
router.patch("/users/:id/approve", protectAdmin, requireRole("admin"), adminCtrl.approve);
router.patch("/users/:id/reject", protectAdmin, requireRole("admin"), adminCtrl.reject);
router.post("/users/invite", protectAdmin, requireRole("admin"), adminCtrl.invite);

module.exports = router;
