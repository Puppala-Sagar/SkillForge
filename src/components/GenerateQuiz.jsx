'use client'

import { useState, useEffect } from "react"
import Groq from "groq-sdk"

export default function GenerateQuiz({ topic = "", subject = "" }) {
  const apiKey = "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"
  const groq = new Groq({ apiKey: apiKey, dangerouslyAllowBrowser: true })
  const [quiz, setQuiz] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswers, setUserAnswers] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchQuizFromDatabase = async (subject, subtopic) => {
    try {
      const response = await fetch(`http://localhost:5000/api/get-subtopic/${subject}/${subtopic}`)
      // console.log(response)
      if (!response.ok) {
        throw new Error('Quiz not found in database')
      }
      const data = await response.json()
      return data.quiz
    } catch (error) {
      console.error('Error fetching quiz from database:', error)
      return null
    }
  }

  const generateQuiz = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // First, try to fetch the quiz from the database
      const existingQuiz = await fetchQuizFromDatabase(subject, topic)
      if (existingQuiz && existingQuiz.length > 0) {
        setQuiz(existingQuiz)
        setUserAnswers(new Array(existingQuiz.length).fill(""))
        setIsLoading(false)
        return
      }

      // If not found in the database, generate a new quiz using Groq API
      const response = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: `Imagine you are a professional ${subject} teacher.
              Create a 5-question multiple-choice quiz on the topic "${topic}". 
              Each question should have 4 options with one correct answer. 
              Format:
              Question: <Question text>
              A) <Option 1>
              B) <Option 2>
              C) <Option 3>
              D) <Option 4>
              Correct Answer: <Correct option>`,
          },
        ],
        model: "llama3-8b-8192",
      })

      const generatedQuiz = response.choices[0].message.content
      const parsedQuiz = parseQuiz(generatedQuiz)
      setQuiz(parsedQuiz)
      setUserAnswers(new Array(parsedQuiz.length).fill(""))
      
      // Save the generated quiz to the database
      await saveQuizToDatabase(subject, topic, parsedQuiz)
    } catch (error) {
      console.error("Error generating quiz:", error)
      setError("Failed to load quiz. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const parseQuiz = (quizText) => {
    const questions = quizText.split("Question:").slice(1)
    return questions.map((questionText) => {
      const [questionPart, answerPart] = questionText.split("Correct Answer:")
      const options = questionPart
        .split("\n")
        .filter((line) => line.trim().match(/^[A-D]\)/))
        .map((opt) => opt.trim())
      const correctAnswer = answerPart.trim()
      return {
        question: questionPart.split("\n")[0].trim(),
        options,
        correctAnswer,
      }
    })
  }

  const saveQuizToDatabase = async (subject, subtopic, quizData) => {
    try {
      const response = await fetch(`http://localhost:5000/api/add-quiz/${subject}/${subtopic}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quiz: quizData }),
      })

      if (!response.ok) {
        throw new Error('Failed to save quiz to database')
      }

      console.log('Quiz saved successfully')
    } catch (error) {
      console.error('Error saving quiz to database:', error)
      setError('Failed to save quiz. Please try again.')
    }
  }

  useEffect(() => {
    generateQuiz()
  }, [subject, topic])

  const handleAnswerSelect = (answer) => {
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestion] = answer
    setUserAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = () => {
    let newScore = 0
    for (let i = 0; i < quiz.length; i++) {
      if (userAnswers[i] === quiz[i].correctAnswer[0]) {
        newScore++
      }
    }
    setScore(newScore)
    setShowResults(true)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  if (quiz.length === 0) {
    return null
  }

  if (showResults) {
    return (
      <div className="max-w-2xl mx-auto p-4 border rounded shadow">
        <h2 className="text-2xl font-bold">Quiz Results</h2>
        <p className="text-xl mb-4">Your score: {score} out of {quiz.length}</p>
        {quiz.map((q, index) => (
          <div key={index} className="mb-4">
            <p className="font-semibold">{index + 1}. {q.question}</p>
            <p className="text-green-600">Correct Answer: {q.correctAnswer}</p>
            <p className={userAnswers[index] === q.correctAnswer[0] ? "text-green-600" : "text-red-600"}>
              Your Answer: {userAnswers[index] || "Not answered"}
            </p>
          </div>
        ))}
        <button onClick={() => window.location.reload()} className="w-full bg-blue-500 text-white py-2 rounded">
          Retake Quiz
        </button>
      </div>
    )
  }

  const currentQ = quiz[currentQuestion]

  return (
    <div className="max-w-2xl mx-auto p-4 border rounded shadow">
      <h2 className="text-2xl font-bold">Quiz on {topic}</h2>
      <p className="text-lg mb-4">
        Question {currentQuestion + 1} of {quiz.length}
      </p>
      <p className="text-xl mb-4">{currentQ.question}</p>
      <div className="space-y-2 mb-4">
        {currentQ.options.map((option, index) => (
          <label key={index} className="flex items-center">
            <input
              type="radio"
              name="quiz-option"
              value={option[0]}
              checked={userAnswers[currentQuestion] === option[0]}
              onChange={() => handleAnswerSelect(option[0])}
              className="mr-2"
            />
            {option}
          </label>
        ))}
      </div>
      <div className="flex justify-between">
        <button onClick={handlePrevious} disabled={currentQuestion === 0} className="bg-gray-300 text-black py-2 px-4 rounded">
          Previous
        </button>
        {currentQuestion < quiz.length - 1 ? (
          <button onClick={handleNext} className="bg-blue-500 text-white py-2 px-4 rounded">
            Next
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={userAnswers.some((answer) => answer === "")} className="bg-blue-500 text-white py-2 px-4 rounded">
            Submit
          </button>
        )}
      </div>
    </div>
  )
}