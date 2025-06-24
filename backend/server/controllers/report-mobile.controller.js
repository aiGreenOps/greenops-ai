const ReportMobile = require('../models/report-mobile.model');

// POST /api/report-mobile
exports.createReport = async (req, res) => {
    try {
        const { title, description, location, priority, userId } = req.body;

        // Foto caricate
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
        res.status(201).json(report);
    } catch (error) {
        console.error('Failed to create report:', error);
        res.status(500).json({ message: 'Failed to create report' });
    }
};

// GET /api/report-mobile
exports.getReports = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;

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
