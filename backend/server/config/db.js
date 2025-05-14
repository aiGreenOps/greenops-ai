const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ Connessione a MongoDB riuscita");
    } catch (err) {
        console.error("❌ Errore nella connessione a MongoDB:", err.message);
        process.exit(1); // Termina il processo in caso di errore
    }
};

module.exports = connectDB;
