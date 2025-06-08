const User = require('../models/user.model');

exports.updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { firstName, lastName, email, phone, fiscalCode } = req.body;

    if (!firstName || !lastName || !email) {
        return res.status(400).json({ message: "First name, last name, and email are required" });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.phone = phone || "";
        user.fiscalCode = fiscalCode || "";

        if (req.file) {
            const baseUrl = process.env.BASE_URL || "http://localhost:3001";
            user.profilePicture = `${baseUrl}/uploads/${req.file.filename}`;
        }

        await user.save();

        res.status(200).json({
            message: "Profile updated",
            profilePicture: user.profilePicture, // opzionale: torna l'immagine aggiornata
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
