import React, { useEffect, useState } from "react";
import axios from "axios";

const Streak= () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [streak, setStreak] = useState(0);
  const [message, setMessage] = useState("");

  // Fetch questions from backend
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/questions");
        setQuestions(res.data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, []);

  // Handle answer selection
  const handleSelect = (topic, option) => {
    setSelectedAnswers(prev => ({ ...prev, [topic]: option }));
  };

  // Handle navigation
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Submit Answers
  const handleSubmit = async () => {
    try {
      const res = await axios.post("http://localhost:3000/api/submit-answer", {
        userId: "user123", // Replace with actual user ID
        answers: selectedAnswers,
      });

      setStreak(res.data.streak);
      setMessage(res.data.message);
    } catch (error) {
      console.error("Error submitting answers:", error);
    }
  };

  if (questions.length === 0) return <p className="text-center mt-10 text-gray-500">Loading questions...</p>;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-2xl font-semibold text-center text-blue-600">📝 Daily MCQs</h2>

        <div className="border border-gray-300 rounded-lg p-4 mt-4">
          <h3 className="text-lg font-semibold text-gray-700">{currentQuestion.topic}</h3>
          <p className="text-gray-600 mt-2">{currentQuestion.question}</p>

          <div className="mt-4 space-y-2">
            {currentQuestion.options.slice(0, 4).map((option, idx) => (
              <label key={idx} className="flex items-center space-x-2 p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 w-80">
                <input
                  type="radio"
                  name={currentQuestion.topic}
                  value={option}
                  checked={selectedAnswers[currentQuestion.topic] === option}
                  onChange={() => handleSelect(currentQuestion.topic, option)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 inline-block min-w-40 max-w-96">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`px-4 py-2 text-white rounded-lg ${currentQuestionIndex === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
          >
            ⬅️ Previous
          </button>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
            >
              ✅ Submit
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Next ➡️
            </button>
          )}
        </div>

        {message && <p className="mt-4 text-green-600 text-center">{message}</p>}
        <p className="mt-2 text-gray-700 text-center">🔥 Streak: {streak} days</p>
      </div>
    </div>
  );
};

export default Streak;
