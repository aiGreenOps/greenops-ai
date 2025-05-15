const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { register } = require("../controllers/auth.controller");
const { validateRequest } = require("../middleware/validate");
const { verifyEmail } = require("../controllers/auth.controller");
const { login } = require("../controllers/auth.controller");

router.post(
    "/login",
    [
        body("email").isEmail(),
        body("password").notEmpty()
    ],
    validateRequest,
    login
);

router.post(
    "/register",
    [
        body("firstName").notEmpty(),
        body("lastName").notEmpty(),
        body("email").isEmail(),
        body("password").isLength({ min: 6 }),
        body("fiscalCode").notEmpty()
    ],
    validateRequest,
    register
);

router.get("/verify-email", verifyEmail);

module.exports = router;
