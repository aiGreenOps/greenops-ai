const express = require('express');
const router = express.Router();
const { updateProfile } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { getAllUsers } = require('../controllers/user.controller');

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../public/uploads"));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `${Date.now()}-${file.fieldname}${ext}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

router.put(
    "/update-profile",
    protect,
    upload.single("profilePicture"), 
    updateProfile
);

router.get('/all', protect, getAllUsers); // solo admin

module.exports = router;
