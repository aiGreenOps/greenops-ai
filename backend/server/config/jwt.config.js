module.exports = {
    jwtSecret: process.env.JWT_SECRET || "greenops-secret",
    jwtExpire: "1h"
};
