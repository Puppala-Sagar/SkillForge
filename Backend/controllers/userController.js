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

const  Session = require('../models/interviewSessionModel');
const  Interview = require('../models/interviewHistoryModel');





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


exports.getStreak = async (req, res) => {
    const { email } = req.query;
  
    console.log("Received email:", email); // Log the incoming email query
  
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
  
    try {
      // Use the correct database and collection
      const user = await UserStreak.findOne({ email });
  
      if (!user) {
        console.log("User not found:", email); // Log if user is not found
        return res.status(404).json({ message: "User not found" });
      }
  
      console.log("User found:", user); // Log the user found and their streak
      res.json({ streak: user.streak });
    } catch (error) {
      console.error("Error fetching streak:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }


exports.submitStreakAnswers = async (req, res) => {
    try {
        console.log("Received payload:", req.body);
        const { email, answers } = req.body;

        if (!email || !answers || Object.keys(answers).length === 0) {
            return res.status(400).json({ message: "Missing email or answers" });
        }

        let user = await UserStreak.findOne({ email });

        console.log(user)

        if (!user) {
            console.log("Creating new user streak entry");
            user = new UserStreak({ email, streak: 0, lastUpdated: null });
        }

        const today = new Date().toISOString().split("T")[0];
        const lastUpdated = user.lastUpdated ? user.lastUpdated.toISOString().split("T")[0] : null;

        console.log("Today:", today, "| Last Updated:", lastUpdated);

        // If already updated today, return
        if (lastUpdated === today) {
            console.log("⏳ Streak already updated today!");
            return res.json({ message: "❌ Streak already updated today! Try again tomorrow.", streak: user.streak });
        }

        // Fetch correct answers from database
        const questions = await Question.find({});
        const correctAnswers = {};
        questions.forEach(q => {
            correctAnswers[q.topic] = q.correctAnswer.toLowerCase().trim(); // Normalize comparison
        });

        console.log("🔹 Expected Answers:", correctAnswers);
        console.log("🔸 User Answers:", answers);

        // Validate answers
        let allCorrect = Object.keys(correctAnswers).every(topic =>
            answers[topic] && answers[topic].toLowerCase().trim() === correctAnswers[topic]
        );

        if (allCorrect) {
            user.streak += 1; // ✅ Increment streak
            user.lastUpdated = new Date(); // ✅ Update lastUpdated field

            console.log("✅ Streak updated! New streak:", user.streak);

            // Save user streak updates to database
            await user.save(); 

            return res.json({ message: "✅ Streak updated!", streak: user.streak });
        } else {
            console.log("❌ Incorrect answer, streak remains:", user.streak);
            return res.json({ message: "❌ Incorrect answers! Try again.", streak: user.streak });
        }

    } catch (error) {
        console.error("🔥 ERROR in submitStreakAnswers:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};



 

  //Interview


  exports.startInterview = async (req, res) => {
    const { topic } = req.body;
    const sessionId = Date.now().toString(); // Unique session ID
  
    try {
      const response = await groq.chat.completions.create({
        messages: [
          { role: "system", content: `You are an AI interviewer for ${topic}.` },
          { role: "user", content: `Ask an initial interview question about ${topic}.` },
        ],
        model: "llama3-8b-8192",
      });
  
      const initialQuestion = response.choices[0].message.content;
  
      // Save session to DB
      const newSession = new Session({
        sessionId,
        topic,
        questions: [{ question: initialQuestion }],
      });
      await newSession.save();
  
      res.json({ sessionId, question: initialQuestion });
    } catch (error) {
      console.error("Error generating initial question:", error);
      res.status(500).json({ error: "Failed to generate question" });
    }
  };

  exports.answerInterview = async (req, res) => {
    const { sessionId, answer } = req.body;
  
    try {
      // Find session
      const session = await Session.findOne({ sessionId });
      if (!session) return res.status(404).json({ error: "Session not found" });
  
      const lastQuestion = session.questions[session.questions.length - 1].question;
  
      // Generate a follow-up question based on the user's answer
      const response = await groq.chat.completions.create({
        messages: [
          { role: "system", content: `You are an AI interviewer for ${session.topic}.` },
          { role: "user", content: `Previous question: "${lastQuestion}". User answered: "${answer}". Ask a logical follow-up question.` },
        ],
        model: "llama3-8b-8192",
      });
  
      const followUpQuestion = response.choices[0].message.content;
  
      // Update session with the new question
      session.questions.push({
        question: lastQuestion,
        userAnswer: answer,
        followUp: followUpQuestion,
      });
  
      await session.save();
  
      res.json({ followUpQuestion });
    } catch (error) {
      console.error("Error generating follow-up question:", error);
      res.status(500).json({ error: "Failed to generate follow-up question" });
    }
  };


  exports.endInterview = async (req, res) => {
    const { sessionId } = req.body;
    
    try {
      const session = await Session.findOne({ sessionId });
      if (!session) return res.status(404).json({ error: "Session not found" });
  
      res.json({ message: "Interview session ended.", sessionData: session });
    } catch (error) {
      console.error("Error ending interview:", error);
      res.status(500).json({ error: "Failed to end interview" });
    }
  };


  exports.interview = async (req, res) => {
    try {
      const { email } = req.query;
      if (!email) return res.status(400).json({ error: "User email is required" });
  
      const interviews = await Interview.find({ email }).sort({ createdAt: -1 });
      res.json(interviews);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      res.status(500).json({ error: "Server error" });
    }
  };

  exports.saveInterview =async (req, res) => {
  try {
    const { email, sessionId, topic, chatHistory } = req.body;

    // Validate input
    if (!email || !sessionId || !topic || !chatHistory) {
      return res.status(400).json({ error: "❌ Missing required fields" });
    }

    // Save to MongoDB
    const newInterview = new Interview({ email, sessionId, topic, chatHistory });
    await newInterview.save();

    res.status(201).json({ message: "✅ Interview saved successfully" });
  } catch (error) {
    console.error("❌ Error saving interview:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
}

  exports.updateInterview = async (req, res) => {
    try {
      const { sessionId, chatHistory } = req.body;
      if (!sessionId || !chatHistory) {
        return res.status(400).json({ error: "Missing sessionId or chatHistory" });
      }
  
      await Interview.findOneAndUpdate({ sessionId }, { chatHistory });
      res.json({ message: "Interview updated successfully" });
    } catch (error) {
      console.error("Error updating interview:", error);
      res.status(500).json({ error: "Server error" });
    }
  };

  exports.deleteInterview = async (req, res) => {
    try {
      const { sessionId } = req.query;
      if (!sessionId) return res.status(400).json({ error: "sessionId is required" });
  
      await Interview.findOneAndDelete({ sessionId });
      res.json({ message: "Interview deleted successfully" });
    } catch (error) {
      console.error("Error deleting interview:", error);
      res.status(500).json({ error: "Server error" });
    }
  };





  exports.updateStreak = async (req, res) => {
    const { userId } = req.body;
    try {
      let user = await UserStreak.findOne({ userId });
  
      if (!user) {
        user = new UserStreak({ userId, streak: 1, lastAnsweredDate: new Date() });
      } else {
        const today = new Date().toISOString().split("T")[0];
        const lastAnswered = user.lastAnsweredDate ? user.lastAnsweredDate.toISOString().split("T")[0] : null;
  
        if (today !== lastAnswered) {
          user.streak += 1;
          user.lastAnsweredDate = new Date();
        }
      }
  
      await user.save();
      res.json({ streak: user.streak });
    } catch (error) {
      res.status(500).json({ error: "Error updating streak" });
    }
  };  