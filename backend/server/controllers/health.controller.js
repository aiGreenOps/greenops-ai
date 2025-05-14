exports.healthCheck = (req, res) => {
    res.json({ status: "ok", message: "GreenOps server attivo!" });
};
