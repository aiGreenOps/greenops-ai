exports.getSessionInfo = (req, res) => {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const iat = req.user?.iat; // ← dal middleware `protect` non lo passi
        const started = iat
            ? new Date(iat * 1000).toLocaleString('it-IT', {
                timeZone: 'Europe/Rome',
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            })
            : "Unknown";

        return res.status(200).json({ ip, started });
    } catch (err) {
        console.error("Errore session-info:", err);
        res.status(500).json({ message: "Errore nel recupero info sessione" });
    }
};
