const ReportMobile = require('../models/report-mobile.model');
const { eseguiValutazioneSegnalazioneLLM } = require("../utils/eseguiValutazioneSegnalazioneLLM");
const Activity = require('../models/activity.model'); // assicurati di averlo importato

// POST /api/report-mobile
exports.createReport = async (req, res) => {
    try {
        const { title, description, location, priority, userId } = req.body;
        console.log(req.body);
        const photos = req.files?.map(file => `/uploads/${file.filename}`) || [];

        const report = new ReportMobile({
            title,
            description,
            location,
            priority,
            submittedBy: userId,
            photos,
            status: 'pending',
            submittedAt: new Date(),
        });

        await report.save();

        // 👉 Valutazione AI
        const utile = await eseguiValutazioneSegnalazioneLLM(report);

        if (utile) {
            const nuovaAttivita = new Activity({
                title: report.title,
                description: report.description,
                type: "maintenance", // puoi derivarlo in futuro in modo dinamico se vuoi
                priority: report.priority,
                location: report.location,
                scheduledAt: new Date(), // subito o decidi tu
                generatedByAI: true
            });

            await nuovaAttivita.save();
            report.status = 'accepted';
        } else {
            report.status = 'rejected';
        }

        await report.save();

        res.status(201).json({ report });
    } catch (error) {
        console.error('Failed to create report:', error);
        res.status(500).json({ message: 'Errore interno' });
    }
};

// GET /api/report-mobile
exports.getReports = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        console.log(userId);

        const reports = await ReportMobile.find({ submittedBy: userId })
            .sort({ submittedAt: -1 }) // opzionale: ordine dal più recente
            .populate('submittedBy', 'firstName lastName');

        res.json(reports);
    } catch (error) {
        console.error('Failed to fetch reports:', error);
        res.status(500).json({ message: 'Failed to fetch reports' });
    }
};

exports.deleteReport = async (req, res) => {
    try {
        const { id } = req.params;
        const report = await ReportMobile.findById(id);

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        await ReportMobile.findByIdAndDelete(id);
        res.status(200).json({ message: 'Report deleted successfully' });
    } catch (error) {
        console.error('Failed to delete report:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
