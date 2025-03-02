const mongoose = require('mongoose');

const userStreakSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    streak: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: null }  // ✅ Added lastUpdated field
});

module.exports = mongoose.model("UserStreak", userStreakSchema);
