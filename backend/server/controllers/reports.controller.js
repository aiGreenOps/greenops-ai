const Station = require('../models/station.model');
const Sensor = require('../models/sensorData.model');
const Irrigation = require('../models/irrigation.model');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const moment = require('moment');
const Activity = require('../models/activity.model');

exports.generateActivityExcel = async (req, res) => {
    const { location = 'all', duration = 'week' } = req.query;

    const today = moment();
    let fromDate;

    switch (duration) {
        case 'day':
            fromDate = today.clone().startOf('day');
            break;
        case 'month':
            fromDate = today.clone().startOf('month');
            break;
        case 'week':
        default:
            fromDate = today.clone().startOf('isoWeek');
            break;
    }

    const locationFilter = location !== 'all' ? { location } : {};

    try {
        const activities = await Activity.find({
            scheduledAt: { $gte: fromDate.toDate(), $lte: today.toDate() },
            ...locationFilter
        });

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Report');

        sheet.columns = [
            { header: 'Title', key: 'title', width: 30 },
            { header: 'Type', key: 'type', width: 15 },
            { header: 'Priority', key: 'priority', width: 10 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Scheduled At', key: 'scheduledAt', width: 25 },
            { header: 'Location', key: 'location', width: 15 },
        ];

        activities.forEach(activity => {
            sheet.addRow({
                title: activity.title,
                type: activity.type,
                priority: activity.priority,
                status: activity.status,
                scheduledAt: moment(activity.scheduledAt).format('YYYY-MM-DD HH:mm'),
                location: activity.location
            });
        });

        res.setHeader(
            'Content-Disposition',
            `attachment; filename=${duration}_sustainability_report.xlsx`
        );
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error("Errore generazione Excel:", err);
        res.status(500).json({ message: 'Errore generazione report Excel.' });
    }
};

exports.generateWaterUsageExcel = async (req, res) => {
    const { location = 'all', duration = 'week' } = req.query;

    const today = moment();
    let fromDate;

    switch (duration) {
        case 'day':
            fromDate = today.clone().startOf('day');
            break;
        case 'month':
            fromDate = today.clone().startOf('month');
            break;
        case 'week':
        default:
            fromDate = today.clone().startOf('isoWeek');
            break;
    }

    try {
        let stationFilter = {};
        if (location !== 'all') {
            const stations = await Station.find({ location }).select('_id');
            const stationIds = stations.map(s => s._id);
            stationFilter = { stationId: { $in: stationIds } };
        }

        const irrigations = await Irrigation.find({
            startedAt: { $gte: fromDate.toDate(), $lte: today.toDate() },
            ...stationFilter
        }).populate('stationId', 'name');

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Water Usage');

        sheet.columns = [
            { header: 'Station', key: 'station', width: 20 },
            { header: 'Plant Type', key: 'plantType', width: 15 },
            { header: 'Method', key: 'method', width: 12 },
            { header: 'Start', key: 'startedAt', width: 25 },
            { header: 'End', key: 'endedAt', width: 25 },
            { header: 'Water Used (L)', key: 'waterUsed', width: 20 },
        ];

        let totalLiters = 0;
        irrigations.forEach(event => {
            const start = moment(event.startedAt);
            const end = moment(event.endedAt || new Date()); // fallback: ora se mancante
            const durationMinutes = Math.max(end.diff(start, 'minutes', true), 0); // ⬅️ float
            const waterUsed = parseFloat((durationMinutes * 0.62).toFixed(2)); // 0.62 L/min

            totalLiters += waterUsed;

            sheet.addRow({
                station: event.stationId?.name || 'N/A',
                plantType: event.plantType,
                method: event.method,
                startedAt: start.format('YYYY-MM-DD HH:mm:ss'),
                endedAt: end.format('YYYY-MM-DD HH:mm:ss'),
                waterUsed
            });
        });

        // Riga di somma finale
        sheet.addRow({});
        sheet.addRow({
            station: '',
            plantType: '',
            method: '',
            startedAt: '',
            endedAt: 'Total:',
            waterUsed: totalLiters
        });

        res.setHeader(
            'Content-Disposition',
            `attachment; filename=${duration}_water_usage_report.xlsx`
        );
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error("Errore generazione Excel irrigazione:", err);
        res.status(500).json({ message: 'Errore generazione report Excel.' });
    }
};


exports.getSummaryData = async (req, res) => {
    const { duration = 'day', location = 'all' } = req.query;
    const now = new Date();
    let fromCurrent, fromPrevious, toPrevious;

    // Calcola intervalli di tempo
    switch (duration) {
        case 'week':
            fromCurrent = new Date(now);
            fromCurrent.setDate(fromCurrent.getDate() - 7);
            fromPrevious = new Date(now);
            fromPrevious.setDate(fromPrevious.getDate() - 14);
            toPrevious = new Date(now);
            toPrevious.setDate(toPrevious.getDate() - 7);
            break;
        case 'month':
            fromCurrent = new Date(now);
            fromCurrent.setMonth(fromCurrent.getMonth() - 1);
            fromPrevious = new Date(now);
            fromPrevious.setMonth(fromPrevious.getMonth() - 2);
            toPrevious = new Date(now);
            toPrevious.setMonth(toPrevious.getMonth() - 1);
            break;
        default:
            fromCurrent = new Date(now);
            fromCurrent.setDate(fromCurrent.getDate() - 1);
            fromPrevious = new Date(now);
            fromPrevious.setDate(fromPrevious.getDate() - 2);
            toPrevious = new Date(now);
            toPrevious.setDate(toPrevious.getDate() - 1);
            break;
    }

    try {
        let stationIds = [];
        if (location !== 'all') {
            const stations = await Station.find({ location }).select('_id');
            stationIds = stations.map(s => s._id);
        }

        const buildFilter = (timeFrom, timeTo) => ({
            timestamp: { $gte: timeFrom, $lt: timeTo },
            ...(stationIds.length > 0 && { stationId: { $in: stationIds } })
        });

        const buildIrrigationFilter = (timeFrom, timeTo) => ({
            startedAt: { $gte: timeFrom, $lt: timeTo },
            ...(stationIds.length > 0 && { stationId: { $in: stationIds } })
        });

        const getStats = async (sensorFilter, irrigationFilter) => {
            const sensors = await Sensor.find(sensorFilter);
            const irrigations = await Irrigation.find(irrigationFilter);

            const avgTemp = sensors.reduce((sum, s) => sum + s.temperature, 0) / sensors.length || 0;
            const avgHumidity = sensors.reduce((sum, s) => sum + s.humidity, 0) / sensors.length || 0;
            const totalLiters = irrigations.reduce((sum, event) => {
                const start = moment(event.startedAt);
                const end = moment(event.endedAt || new Date()); // fallback se ancora attivo
                const durationMin = Math.max(end.diff(start, 'minutes', true), 0); // ⬅️ float
                return sum + durationMin * 0.62;
            }, 0);

            const totalMinutes = moment(sensorFilter.timestamp.$lt).diff(moment(sensorFilter.timestamp.$gte), 'minutes');

            const readingsByStation = new Map();
            sensors.forEach(sensor => {
                const stationId = sensor.stationId.toString();
                readingsByStation.set(stationId, (readingsByStation.get(stationId) || 0) + 1);
            });

            const totalUptimePercent =
                [...readingsByStation.values()].reduce((sum, count) => {
                    const percent = Math.min((count / totalMinutes) * 100, 100);
                    return sum + percent;
                }, 0) / (readingsByStation.size || 1);

            const uptime = parseFloat(totalUptimePercent.toFixed(2));

            return {
                avgTemperature: parseFloat(avgTemp.toFixed(2)),
                avgHumidity: parseFloat(avgHumidity.toFixed(2)),
                waterUsage: parseFloat(totalLiters.toFixed(3)),
                sensorUptime: parseFloat(uptime.toFixed(2))
            };
        };

        const current = await getStats(
            buildFilter(fromCurrent, now),
            buildIrrigationFilter(fromCurrent, now)
        );

        const previous = await getStats(
            buildFilter(fromPrevious, toPrevious),
            buildIrrigationFilter(fromPrevious, toPrevious)
        );

        res.json({ current, previous });
    } catch (error) {
        console.error("Errore summary report:", error);
        res.status(500).json({ message: "Errore generazione report." });
    }
};
