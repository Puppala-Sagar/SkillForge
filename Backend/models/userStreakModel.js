const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: String,
    streak: { type: Number, default: 0 },
    lastAnsweredDate: { type: Date, default: null },
  });

module.exports =  mongoose.model("UserStreak", userSchema);

