const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const controller = require('../controllers/report-mobile.controller');
const { protectEmployee } = require('../middleware/auth.middleware');

// Configurazione storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads'),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Rotte
router.post('/', upload.array('photos', 4), controller.createReport);
router.get('/', protectEmployee, controller.getReports);
router.delete('/:id', controller.deleteReport);

module.exports = router;
