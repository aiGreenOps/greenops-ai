const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/jwt.config");

// Protegge le route dei manager (/api/auth/*)
exports.protectManager = (req, res, next) => {
    const token =
        req.cookies.managerToken ||
        (req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.split(" ")[1]
            : null);

    if (!token) {
        return res.status(401).json({ message: "Manager non autenticato" });
    }
    try {
        req.user = jwt.verify(token, jwtSecret);
        next();
    } catch {
        return res.status(401).json({ message: "Token manager non valido" });
    }
};

// Protegge le route degli admin (/api/admin/*)
exports.protectAdmin = (req, res, next) => {
    const token = req.cookies.adminToken;
    if (!token) {
        return res.status(401).json({ message: "Admin non autenticato" });
    }
    try {
        req.user = jwt.verify(token, jwtSecret);
        console.log("IN");                    
        next();
    } catch {
        return res.status(401).json({ message: "Token admin non valido" });
    }
};

// (riusa il tuo requireRole per checking del ruolo)
// es.
exports.requireRole = (role) => (req, res, next) => {

    if (req.user.role !== role) {
        return res.status(403).json({ message: "Accesso negato" });
    }
    next();
};

exports.protect = (req, res, next) => {
    // legge il token dal cookie
    const token = req.cookies.managerToken || req.cookies.adminToken;
    if (!token) {
        return res.status(401).json({ error: 'Non autenticato' });
    }

    try {
        const payload = jwt.verify(token, jwtSecret);
        // payload può avere .userId (login) o .id (twoFaToken), unifichiamolo:
        req.user = {
            id: payload.userId ?? payload.id,
            role: payload.role
        };
        return next();
    } catch (err) {
        return res.status(401).json({ error: 'Token non valido' });
    }
};
