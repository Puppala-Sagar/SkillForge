import React, { useState, useEffect } from 'react';
import { Button, FormGroup, Input } from 'reactstrap';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use'; // to get window dimensions for confetti

const QuizApp = () => {
  const questions = [
    {
      question: 'In strong scaling, what remains constant as the number of processors increases?',
      options: ['Execution time.', 'Problem size.', 'Data size.', 'Processor speed.'],
      key_or_answer: 'Problem size.',
    },
    {
      question: 'Which planet is known as the Red Planet?',
      options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
      key_or_answer: 'Mars',
    },
    {
      question: 'What is the largest ocean on Earth?',
      options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
      key_or_answer: 'Pacific Ocean',
    },
  ];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(''));
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isPerfectScore, setIsPerfectScore] = useState(false); // To track if all answers are correct

  const { width, height } = useWindowSize(); // Get window dimensions for confetti

  const handleNext = () => {
    setCurrentQuestion((prev) => prev + 1);
  };

  const handleAnswerSelect = (selectedAnswer) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = selectedAnswer;
    setAnswers(updatedAnswers);
  };

  const handleSubmit = () => {
    const newScore = answers.reduce((totalScore, selectedAnswer, index) => {
      const correctAnswer = questions[index].key_or_answer.trim();
      if (selectedAnswer === correctAnswer) {
        return totalScore + 1;
      }
      return totalScore;
    }, 0);

    setScore(newScore);
    setShowResult(true);
    setIsPerfectScore(newScore === questions.length); // Check if all answers are correct
  };

  return (
    <div className="">
      {/* Confetti only shows when all answers are correct */}
      {isPerfectScore && <Confetti width={width} height={height} />} 

      {!showResult && questions.length > 0 && (
        <div className="w-full max-w-3xl mx-auto bg-[#fefcf8] p-6 rounded-lg shadow-lg">
          {/* Progress Bar */}
          <div className="flex justify-between mb-6">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentQuestion === index ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>

          {/* Question */}
          <h2 className="text-2xl font-bold mb-4">
            {questions[currentQuestion].question}
          </h2>

          {/* Options */}
          <FormGroup>
            {questions[currentQuestion].options.map((option, index) => (
              <div key={index} className="mb-4">
                <Input
                  type="radio"
                  name={`question-${currentQuestion}`}
                  value={option}
                  checked={answers[currentQuestion] === option}
                  onChange={() => handleAnswerSelect(option)}
                />
                <label className="ml-3 text-lg">{option}</label>
              </div>
            ))}
          </FormGroup>

          {/* Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              color="secondary"
              className="text-gray-500 font-medium px-6 py-2 rounded-lg border"
              onClick={() => alert('Quiz Cancelled')}
            >
              Cancel
            </Button>

            {currentQuestion < questions.length - 1 && (
              <Button
                color="primary"
                className="bg-orange-500 text-white px-6 py-2 rounded-lg"
                onClick={handleNext}
              >
                Save & Next
              </Button>
            )}

            {currentQuestion === questions.length - 1 && (
              <Button
                color="success"
                className="bg-green-500 text-white px-6 py-2 rounded-lg"
                onClick={handleSubmit}
              >
                Submit
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Quiz Result */}
      {showResult && (
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Quiz Result</h2>
          <p className="text-lg mb-4">Your Score: {score}</p>
          {isPerfectScore && <p className="text-green-500 text-xl">Congratulations! You got a perfect score!</p>}
          <Button
            color="primary"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg"
            onClick={() => window.location.reload()}
          >
            Retake Quiz
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuizApp;
