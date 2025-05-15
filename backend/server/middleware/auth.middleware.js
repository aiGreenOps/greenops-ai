const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/jwt.config");

// Verifica token JWT
exports.authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token mancante o non valido" });
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded; // contiene userId, role
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token non valido" });
    }
};

// Verifica ruolo (es. admin)
exports.requireRole = (role) => (req, res, next) => {
    if (req.user.role !== role) {
        return res.status(403).json({ message: "Accesso riservato agli admin" });
    }
    next();
};
