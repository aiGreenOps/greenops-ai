const express = require("express");
const { body } = require("express-validator");
const passport = require("passport");
const router = express.Router();
const { register } = require("../controllers/auth.controller");
const { validateRequest } = require("../middleware/validate");
const { verifyEmail } = require("../controllers/auth.controller");
const { login } = require("../controllers/auth.controller");
const { logout } = require("../controllers/auth.controller");
const { me } = require("../controllers/auth.controller");
const { logoutManager } = require("../controllers/auth.controller");
const { protectManager } = require("../middleware/auth.middleware");
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

router.post("/logout", protectManager, logoutManager);

const isMobile = (req) => req.get('x-client') === 'mobile';

router.post(
    '/register',
    [
        body('firstName')
            .notEmpty().withMessage('firstName è obbligatorio'),
        body('lastName')
            .notEmpty().withMessage('lastName è obbligatorio'),
        body('email')
            .isEmail().withMessage('Email non valida'),
        body('password')
            .isLength({ min: 6 }).withMessage('La password deve avere almeno 6 caratteri'),

        // fiscalCode solo se NON mobile
        body('fiscalCode')
            .if((value, { req }) => !isMobile(req))
            .notEmpty().withMessage('Codice fiscale obbligatorio'),

        // role solo se mobile
        body('role')
            .if((value, { req }) => isMobile(req))
            .notEmpty().withMessage('Role obbligatorio per mobile')
            .isIn(['dipendente', 'manutentore'])
            .withMessage('Role deve essere dipendente o manutentore'),
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
router.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/login-failed" }),
    (req, res) => {
        const token = jwt.sign({
            userId: req.user._id,
            role: req.user.role,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email
        }, jwtSecret, { expiresIn: jwtExpire });

        const isAdmin = req.user.role === "admin";
        const cookieName = isAdmin ? "adminToken" : "managerToken";

        res.cookie(cookieName, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        if (req.user.status === "pending") {
            const io = req.app.get("io");
            io.emit("newPendingManager", {
                _id: req.user._id,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                email: req.user.email,
            });
            res.redirect(`http://localhost:3000/auth/login?oauthStatus=${req.user.status}`);
        } else {
            res.redirect(`http://localhost:3000/dashboard/user`);
        }
    }
);

// Login GitHub
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

// Callback GitHub
router.get(
    "/github/callback",
    passport.authenticate("github", { session: false, failureRedirect: "/login-failed" }),
    (req, res) => {
        const token = jwt.sign({
            userId: req.user._id,
            role: req.user.role,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email
        }, jwtSecret, { expiresIn: jwtExpire });


        const isAdmin = req.user.role === "admin";
        const cookieName = isAdmin ? "adminToken" : "managerToken";

        res.cookie(cookieName, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        if (req.user.status === "pending") {
            const io = req.app.get("io");
            io.emit("newPendingManager", {
                _id: req.user._id,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                email: req.user.email,
            });
            res.redirect(`http://localhost:3000/auth/login?oauthStatus=${req.user.status}`);
        } else {
            res.redirect(`http://localhost:3000/dashboard/user`);
        }
    }
);

router.get("/discord", passport.authenticate("discord"));

router.get(
    "/discord/callback",
    passport.authenticate("discord", { session: false, failureRedirect: "/login-failed" }),
    (req, res) => {
        const token = jwt.sign({
            userId: req.user._id,
            role: req.user.role,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email
        }, jwtSecret, { expiresIn: jwtExpire });

        const isAdmin = req.user.role === "admin";
        const cookieName = isAdmin ? "adminToken" : "managerToken";

        res.cookie(cookieName, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        if (req.user.status === "pending") {
            const io = req.app.get("io");
            io.emit("newPendingManager", {
                _id: req.user._id,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                email: req.user.email,
            });
            res.redirect(`http://localhost:3000/auth/login?oauthStatus=${req.user.status}`);
        } else {
            res.redirect(`http://localhost:3000/dashboard/user`);
        }
    }
);

router.get("/me", protectManager, me);


module.exports = router;
