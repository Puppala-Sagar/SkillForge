const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    topic: String,
    question: String,
    options: [String],
    correctAnswer: String,
    date: String,
  });

module.exports = mongoose.model("Question", questionSchema);




