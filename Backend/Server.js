const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection string (replace with your actual connection string)
const url = "mongodb+srv://sagarpuppala123:GhhGbKNrXWfAKMDC@cluster0.vhnk2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB
mongoose.connect(url)
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Could not connect to MongoDB...', err));

// Define a schema for Subtopics
const SubtopicSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  subtopic: { type: String, required: true },
  content: { type: String, required: true },
  quiz: [
    {
      question: { type: String, required: true },
      options: [{ type: String, required: true }], // Array of 4 options
      correctAnswer: { type: String, required: true }, // Original answer
      studentAnswer: { type: String } // Will be filled later
    }
  ]
});

// Create a model for Subtopic
const Subtopic = mongoose.model('Content', SubtopicSchema);

// Example route to get all subtopics
app.get('/api/subtopics', async (req, res) => {
  try {
    const subtopics = await Subtopic.find();
    res.json(subtopics);
  } catch (error) {
    console.error('Error fetching subtopics:', error);
    res.status(500).send('Failed to fetch subtopics');
  }
});

// Example route to add a new subtopic
app.post('/api/add-subtopic', async (req, res) => {
  const { subject, subtopic, content, quiz } = req.body;
  
  const newSubtopic = new Subtopic({
    subject,
    subtopic,
    content,
    quiz,
  });

  try {
    await newSubtopic.save();
    res.status(201).json(newSubtopic);
  } catch (error) {
    console.error('Error saving subtopic:', error);
    res.status(400).send('Failed to add subtopic');
  }
});

// Example route to get a subtopic by subject and subtopic name
app.get('/api/get-subtopic/:subject/:subtopic', async (req, res) => {
  const { subject, subtopic } = req.params;

  // Assuming you're using Mongoose to query your database
  try {
      const subtopicData = await Subtopic.findOne({ subject, subtopic });
      if (!subtopicData) {
          return res.status(404).send('Subtopic not found in database');
      }
      res.json(subtopicData);
  } catch (error) {
      console.error('Error fetching subtopic:', error);
      res.status(500).send('Internal Server Error');
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
