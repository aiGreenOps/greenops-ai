// routes/manager.routes.js
const express = require("express");
const router = express.Router();
const {
    getPending,
    approve,
    reject,
    invite
} = require("../controllers/manager.controller");
const { protectManager } = require("../middleware/auth.middleware");

// Tutte le route qui sotto richiedono che l’utente sia autenticato come manager
router.use(protectManager);

// GET  /api/manager/users/pending
router.get("/users/pending", getPending);

// PATCH /api/manager/users/:id/approve
router.patch("/users/:id/approve", approve);

// PATCH /api/manager/users/:id/reject
router.patch("/users/:id/reject", reject);

// POST  /api/manager/users/invite
router.post("/users/invite", invite);

module.exports = router;
