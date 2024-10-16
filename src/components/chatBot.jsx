'use client';

import { useState, useEffect } from "react";
import Groq from "groq-sdk";

// UI components
const Button = ({ children, ...props }) => (
  <button {...props} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200 disabled:bg-blue-300">
    {children}
  </button>
);

const Input = (props) => (
  <input
    {...props}
    className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 w-full"
  />
);

const Card = ({ children, className }) => (
  <div className={`border rounded-md shadow-md p-4 ${className}`}>{children}</div>
);

const CardHeader = ({ children }) => <div className="font-bold text-lg mb-2">{children}</div>;
const CardTitle = ({ children }) => <h1 className="text-xl font-semibold">{children}</h1>;
const CardContent = ({ children }) => <div className="mb-4">{children}</div>;
const CardFooter = ({ children }) => <div className="text-sm text-gray-500">{children}</div>;

export default function ContentChatbot({ subtopic = "React Hooks", subject = "Web Development" }) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const apiKey = "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"; // Replace with your actual API key
  const groq = new Groq({ apiKey: apiKey, dangerouslyAllowBrowser: true });

  useEffect(() => {
    fetchContent(subject, subtopic); // Fetch content dynamically based on props
  }, [subject, subtopic]);

  const fetchContent = async (subject, subtopic) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/get-subtopic/${subject}/${subtopic}`);
      if (!response.ok) {
        throw new Error('Subtopic not found in database');
      }
      const data = await response.json();
      setContent(data.content);
    } catch (error) {
      console.error('Error fetching content from database:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      if (!content) {
        throw new Error('No content available to answer questions');
      }

      const response = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a helpful teaching assistant. Use ONLY the following content to answer questions: ${content}`,
          },
          { role: "user", content: question },
        ],
        model: "llama3-8b-8192",
        temperature: 0.5,
        max_tokens: 1024,
      });

      const newAnswer = response.choices[0].message.content;
      setAnswer(newAnswer);
      setChatHistory((prevHistory) => [...prevHistory, { question, answer: newAnswer }]);
      setQuestion("");
    } catch (error) {
      console.error("Error generating answer:", error);
      setError("Failed to generate an answer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !content) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Chat with AI Teaching Assistant</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 h-96 overflow-y-auto mb-4 p-2 border rounded">
          {chatHistory.map((chat, index) => (
            <div key={index} className="mb-4">
              <p className="font-semibold">Q: {chat.question}</p>
              <p>A: {chat.answer}</p>
            </div>
          ))}
          {answer && (
            <div className="mb-4">
              <p className="font-semibold">Q: {question}</p>
              <p>A: {answer}</p>
            </div>
          )}
        </div>
        <form onSubmit={handleQuestionSubmit} className="flex space-x-2">
          <Input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about the topic..."
            className="flex-grow"
          />
          <Button type="submit" disabled={isLoading || !content}>
            {isLoading ? "Thinking..." : "Ask"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-gray-500">
          Ask questions related to {subtopic} in {subject}. The AI will answer based on the provided content.
        </p>
      </CardFooter>
    </Card>
  );
}
