const express = require("express");
const { body } = require("express-validator");
const passport = require("passport");
const router = express.Router();
const { register } = require("../controllers/auth.controller");
const { validateRequest } = require("../middleware/validate");
const { verifyEmail } = require("../controllers/auth.controller");
const { login } = require("../controllers/auth.controller");
const jwt = require("jsonwebtoken");
const { jwtSecret, jwtExpire } = require("../config/jwt.config");

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


// Avvia login con Google
router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"]
}));

// Callback da Google
router.get("/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/login-failed" }),
    (req, res) => {
        const token = jwt.sign(
            { userId: req.user._id, role: req.user.role },
            jwtSecret,
            { expiresIn: jwtExpire }
        );

        // redirect al frontend con il token JWT
        res.redirect(`http://localhost:3001/login-success.html?token=${token}`);
    }
);

// Login GitHub
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

// Callback GitHub
router.get("/github/callback",
    passport.authenticate("github", { session: false, failureRedirect: "/login-failed" }),
    (req, res) => {
        const token = jwt.sign(
            { userId: req.user._id, role: req.user.role },
            jwtSecret,
            { expiresIn: jwtExpire }
        );

        res.redirect(`http://localhost:3001/login-success.html?token=${token}`);
    }
);

router.get("/discord", passport.authenticate("discord"));

router.get("/discord/callback",
    passport.authenticate("discord", { session: false, failureRedirect: "/login-failed" }),
    (req, res) => {
        const token = jwt.sign(
            { userId: req.user._id, role: req.user.role },
            jwtSecret,
            { expiresIn: jwtExpire }
        );

        res.redirect(`http://localhost:3001/login-success.html?token=${token}`);
    }
);



module.exports = router;
