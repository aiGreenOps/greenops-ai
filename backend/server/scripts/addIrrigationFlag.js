const mongoose = require("mongoose");
const connectDB = require("../config/db.config");
const Station = require("../models/station.model");
require("dotenv").config();

(async () => {
  try {
    await connectDB();

    const result = await Station.updateMany(
      {
        $or: [
          { isIrrigating: { $exists: false } },
          { irrigationStartTime: { $exists: false } }
        ]
      },
      {
        $set: {
          isIrrigating: false,
          irrigationStartTime: null
        }
      }
    );

    console.log("✅ Aggiornate", result.modifiedCount, "stazioni");

    const all = await Station.find().lean();
    all.forEach(s => {
      console.log(`${s.name}:`, {
        isIrrigating: s.isIrrigating,
        irrigationStartTime: s.irrigationStartTime
      });
    });

    process.exit(0);
  } catch (err) {
    console.error("❌ Errore aggiornamento stazioni:", err.message);
    process.exit(1);
  }
})();
