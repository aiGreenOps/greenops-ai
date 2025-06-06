const Station = require('../models/station.model');

// GET tutte le stazioni
exports.getAllStations = async (req, res) => {
    try {
        const stations = await Station.find();
        res.status(200).json(stations);
    } catch (err) {
        res.status(500).json({ error: 'Errore nel recupero delle stazioni' });
    }
};

// PUT aggiorna (o crea) una stazione
exports.updateStation = async (req, res) => {
    const { name } = req.params;
    const { coordinates, status } = req.body;

    try {
        const station = await Station.findOneAndUpdate(
            { name },
            {
                coordinates,
                status,
                updatedAt: new Date(),
            },
            { new: true, upsert: true }
        );

        res.status(200).json(station);
    } catch (err) {
        res.status(500).json({ error: 'Errore durante l\'aggiornamento' });
    }
};
