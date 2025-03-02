const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getSubtopics);
// router.get('/', (req, res) => res.send('Hello World!'));
router.post('/add-subtopic', userController.addSubtopic);
router.get('/get-subtopic/:subject/:subtopic', userController.getSubtopicBySubjectAndName);
router.post('/add-feedback', userController.addFeedback);
router.get('/get-video-link/:subject/:topic', userController.getVideoLink);
router.post('/add-video-link', userController.addVideoLink);
router.post('/signup', userController.signUp);
router.post('/login', userController.login);
router.get('/validateJWT', userController.validateJWT);
router.get('/get-badges/:email', userController.getBadges);
router.post('/add-badges', userController.addBadges);
router.get('/get-tasks/:email', userController.getTasks);
router.post('/add-task', userController.addTask);

//streak

router.get("/questions",userController.getStreakQuestions);
router.post("/submit-answer",userController.submitStreakAnswers);
router.get("/streak",userController.getStreak);
router.post("/update-streak",userController.updateStreak);


//interview
router.post("/start-interview", userController.startInterview);
router.post("/answer",userController.answerInterview);
router.post("/end-interview",userController.endInterview);

router.get("interview",userController.interview);
router.post("/save-interview",userController.saveInterview);
router.post("/update-interview",userController.updateInterview);
router.delete("/delete-interview",userController.deleteInterview);




module.exports = router;
