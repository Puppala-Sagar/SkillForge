// User controller logic
const User = require('../models/userModel');
const Subtopic = require('../models/subtopicModel'); // Correcting the import statement
const Feedback = require('../models/feedbackModel');
const VideoLink = require('../models/videoLinks');
const Badge = require('../models/badgeModel');
const Task = require('../models/tasksModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const nodeSchedule = require("node-schedule");
const Groq = require("groq-sdk");
const Question = require('../models/streakQuestionsModel');
const UserStreak = require('../models/userStreakModel')



const SECRET_KEY = 'd8be994c77d05f0b6e22949d6b21ca871c46f52839bc9630ce1d028e30231945'; // Replace with your secret key

exports.getSubtopics = async (req, res) => {
    try {
        const subtopics = await Subtopic.find();
        res.json(subtopics);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.addSubtopic = async (req, res) => {
    const { subject, subtopic, content } = req.body;
    const newSubtopic = new Subtopic({ subject, subtopic, content });
    try {
        await newSubtopic.save();
        res.status(201).json(newSubtopic);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

exports.getSubtopicBySubjectAndName = async (req, res) => {
    const { subject, subtopic } = req.params;
    try {
        const subtopicData = await Subtopic.findOne({ subject, subtopic });
        if (!subtopicData) {
            return res.status(404).send('Subtopic not found');
        }
        res.json(subtopicData);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.addFeedback = async (req, res) => {
    const { name, email, subject, topic, feedbacks } = req.body;
    const update = { $set: { feedbacks, name, email, subject, topic} };

    try {
        const updatedFeedback = await Feedback.findOneAndUpdate({ email, subject, topic }, update, { upsert: true, new: true });
        res.status(201).json(updatedFeedback);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

exports.getVideoLink = async (req, res) => {
    let { subject, topic } = req.params;
    subject = String(subject).toLowerCase();
    topic = String(topic).toLowerCase();
    try {
        const videoLink = await VideoLink.findOne({ subject, topic });
        if (!videoLink) {
            return res.status(404).send('Video link not found');
        }
        res.json(videoLink);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.addVideoLink = async (req, res) => {
    let { subject, topic, videoLink } = req.body;
    subject = String(subject).toLowerCase();
    topic = String(topic).toLowerCase();
    const newVideoLink = new VideoLink({ subject, topic, videoLink });
    try {
        await newVideoLink.save();
        res.status(201).json(newVideoLink);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

exports.signUp = async (req, res) => {
    try {
        const { name, email, password, phone, college } = req.body;
        const hashedPassword = await bcrypt.hash(String(password), 10);
        console.log(hashedPassword);
        const user = new User({ name, email, password: hashedPassword, phone, college });
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(String(password), user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials'});
        }

        const token = jwt.sign({ name: user.name, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.validateJWT = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, SECRET_KEY);
        res.status(200).json({ message: 'Token is valid' });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

exports.getBadges = async (req, res) => {
    try {
        const { email } = req.params;
        const badges = await Badge.findOne({ email }, { _id: 0, __v: 0, 'badges._id': 0 });
        res.status(200).json(badges);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addBadges = async (req, res) => {
    try {
       const { email, badges } = req.body;
       await Badge.findOneAndUpdate({ email }, req.body, { upsert: true });
       res.status(200).json({ message: 'Badges added successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addTask = async (req, res) => {
    try {
       const { email, task } = req.body;
    //    console.log(email, task);
       await Task.findOneAndUpdate({ email }, { $addToSet: { tasks: task }}, { upsert: true });
       res.status(200).json({ message: 'Task added successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

exports.getTasks = async (req, res) => {
    try {
        const { email } = req.params;
        let tasks = await Task.findOne({ email }, { _id: 0, __v: 0, 'tasks._id': 0, email: 0 });
        if(!tasks) tasks = [];
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



const groq = new Groq({ apiKey: "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" });

const fetchAndStoreQuestions = async () => {
  const topics = ["ML", "Programming", "Aptitude", "Web Dev"];
  const subject = "Computer Science";
  const today = new Date().toISOString().split("T")[0];

  try {
    // 🧹 Step 1: Delete existing questions
    await Question.deleteMany({});
    console.log("🗑️ Old questions cleared from database.");

    for (const topic of topics) {
      const response = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: `You are a professional ${subject} teacher.
                      Generate exactly 1 multiple-choice question (MCQ) for ${topic} within ${subject}.
                      Format:
                      [
                          {
                              "question": "What is ...?",
                              "options": ["option 1", "option 2", "option 3", "option 4"],
                              "correctAnswer": "correct option"
                          },
                          ...
                      ]
                      Return ONLY a valid JSON array with NO extra text.`,
          },
        ],
        model: "llama3-8b-8192",
      });

      let responseString = response.choices[0].message.content;

      try {
        responseString = responseString.replace(/\\"/g, '"').replace(/\\n/g, "");
        const quizArray = JSON.parse(responseString);

        if (Array.isArray(quizArray) && quizArray.length === 1) {
          quizArray.forEach(async (q) => {
            const newQuestion = new Question({
              topic,
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
              date: today,
            });
            await newQuestion.save();
          });

          console.log(`✅ Successfully stored ${topic} questions.`);
        } else {
          console.error(`❌ Invalid response format for ${topic}`);
        }
      } catch (err) {
        console.error(`❌ Error parsing response for ${topic}:`, err);
      }
    }
  } catch (error) {
    console.error("❌ API Request Error:", error);
  }
};

// ⏳ Schedule job to run every 1 minute
nodeSchedule.scheduleJob("0 0 * * *", fetchAndStoreQuestions);

exports.getStreakQuestions = async (req, res) => {
    const today = new Date().toISOString().split("T")[0];
    const questions = await Question.find({ date: today });
  
    if (questions.length === 0) {
      await fetchAndStoreQuestions();
      return res.json({ message: "Fetching new questions..." });
    }
  
    res.json(questions);
  };


  exports.submitStreakAnswers =  async (req, res) => {
    const { userId, answers } = req.body;
    const today = new Date().toISOString().split("T")[0];
  
    let user = await UserStreak.findOne({ userId });
  
    if (!user) {
      user = new UserStreak({ userId, streak: 0, lastAnsweredDate: null });
    }
  
    const lastAnsweredDate = user.lastAnsweredDate
      ? user.lastAnsweredDate.toISOString().split("T")[0]
      : null;
  
    // If user already answered today, don't let them submit again
    if (lastAnsweredDate === today) {
      return res.json({
        message: "❌ You already answered today.",
        streak: user.streak,
      });
    }
  
    const questions = await Question.find({ date: today });
  
    let correctCount = 0;
    questions.forEach((q) => {
      if (answers[q.topic] === q.correctAnswer) correctCount++;
    });
  
    if (correctCount === questions.length) {
      // Check if the user answered yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
  
      if (lastAnsweredDate === yesterdayStr) {
        user.streak += 1; // Continue streak
      } else {
        user.streak = 1; // Reset streak if missed a day
      }
  
      user.lastAnsweredDate = new Date();
      await user.save();
  
      return res.json({ message: "✅ Correct! Streak increased.", streak: user.streak });
    } else {
      // Reset streak on incorrect answer
      user.streak = 0;
      user.lastAnsweredDate = new Date();
      await user.save();
  
      return res.json({ message: "❌ Some answers were incorrect. Streak reset.", streak: 0 });
    }
  }  
  
