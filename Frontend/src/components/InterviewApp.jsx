// import React, { useState, useRef, useEffect } from "react";
// import { motion } from "framer-motion";
// import axios from "axios";
// import { Volume2, Mic, Send } from "lucide-react";
// import { RiRobot3Line } from "react-icons/ri";

// export default function InterviewApp() {
//   const [topic, setTopic] = useState("");
//   const [sessionId, setSessionId] = useState(null);
//   const [question, setQuestion] = useState("");
//   const [answer, setAnswer] = useState("");
//   const [chatHistory, setChatHistory] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);

//   const recognitionRef = useRef(null);
//   const synthRef = useRef(window.speechSynthesis);
//   const chatContainerRef = useRef(null);

//   // Scroll to latest message when chat updates
//   useEffect(() => {
//     if (chatContainerRef.current) {
//       chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
//     }
//   }, [chatHistory]);

//   // Load session from local storage on refresh
//   useEffect(() => {
//     const savedSessionId = localStorage.getItem("sessionId");
//     const savedChatHistory = localStorage.getItem("chatHistory");

//     if (savedSessionId && savedChatHistory) {
//       setSessionId(savedSessionId);
//       setChatHistory(JSON.parse(savedChatHistory));
//       const lastAIQuestion = JSON.parse(savedChatHistory).find(
//         (msg) => msg.role === "AI"
//       );
//       if (lastAIQuestion) {
//         setQuestion(lastAIQuestion.content);
//       }
//     }
//   }, []);

//   useEffect(() => {
//     if (sessionId) {
//       localStorage.setItem("sessionId", sessionId);
//       localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
//     }
//   }, [chatHistory, sessionId]);

//   // Initialize speech recognition
//   const initSpeechRecognition = () => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       alert("Your browser does not support voice recognition.");
//       return;
//     }
//     recognitionRef.current = new SpeechRecognition();
//     recognitionRef.current.continuous = false;
//     recognitionRef.current.lang = "en-US";
//     recognitionRef.current.onstart = () => setIsListening(true);
//     recognitionRef.current.onresult = (event) => {
//       let transcript = event.results[0][0].transcript;
//       setAnswer(transcript.trim());
//     };
//     recognitionRef.current.onend = () => setIsListening(false);
//   };

//   // Handle voice input (start/stop)
//   const handleVoiceInput = () => {
//     if (!recognitionRef.current) initSpeechRecognition();
//     if (isListening) {
//       recognitionRef.current.stop();
//     } else {
//       recognitionRef.current.start();
//     }
//   };

//   // Speak AI's message
//   const speakText = (text) => {
//     if (isSpeaking) {
//       synthRef.current.cancel();
//       setIsSpeaking(false);
//     } else {
//       const utterance = new SpeechSynthesisUtterance(text);
//       utterance.lang = "en-US";
//       utterance.onend = () => setIsSpeaking(false);
//       synthRef.current.speak(utterance);
//       setIsSpeaking(true);
//     }
//   };

//   // Start interview
//   const startInterview = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.post("http://localhost:3000/api/start-interview", {
//         topic,
//       });
//       setSessionId(res.data.sessionId);
//       setQuestion(res.data.question);
//       setChatHistory([{ role: "AI", content: res.data.question }]);
//     } catch (error) {
//       console.error("Error starting interview:", error);
//     }
//     setLoading(false);
//   };

//   // Submit answer
//   const submitAnswer = async () => {
//     if (!answer.trim()) return;
//     setLoading(true);
//     try {
//       const res = await axios.post("http://localhost:3000/api/answer", {
//         sessionId,
//         answer,
//       });
//       const newChatHistory = [
//         ...chatHistory,
//         { role: "User", content: answer },
//         { role: "AI", content: res.data.followUpQuestion },
//       ];
//       setChatHistory(newChatHistory);
//       setQuestion(res.data.followUpQuestion);
//       setAnswer("");
//     } catch (error) {
//       console.error("Error fetching next question:", error);
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="fixed inset-0 bg-white text-black flex flex-col items-center p-8 w-full h-full pt-20">
//       <motion.h1
//         className="text-3xl font-bold mb-6 mt-1"
//         initial={{ y: -20, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ duration: 0.5 }}
//       >
//         🎤 AI-Powered Interview Simulator
//       </motion.h1>

//       {!sessionId ? (
//         <motion.div
//           className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-lg border"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.7 }}
//         >
//           <label className="block text-lg font-medium mb-2">Select Topic:</label>
//           <input
//             type="text"
//             placeholder="e.g., Machine Learning"
//             className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             value={topic}
//             onChange={(e) => setTopic(e.target.value)}
//           />
//           <button
//             onClick={startInterview}
//             className="mt-4 w-full text-white bg-black hover:bg-[#676767] transition p-3 rounded-lg font-semibold"
//             disabled={loading}
//           >
//             {loading ? "Starting..." : "Start Interview"}
//           </button>
//         </motion.div>
//       ) : (
//         <motion.div
//           className="w-full max-w-3xl bg-white p-6 rounded-xl shadow-lg border"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.7 }}
//         >
//           {/* Chat Window with Auto-Scrolling */}
//           <div ref={chatContainerRef} className="h-96 overflow-y-auto space-y-2">
//             {chatHistory.map((msg, index) => (
//               <motion.div
//                 key={index}
//                 className={`p-3 rounded-lg border ${
//                   msg.role === "AI" ? "bg-gray-300 border-gray-300" : "bg-gray-100 border-gray-300"
//                 }`}
//                 initial={{ opacity: 0, x: msg.role === "AI" ? -20 : 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ duration: 0.5 }}
//               >
//                 {msg.role === "AI" && <RiRobot3Line className="inline mr-2" size={20} />}
//                 <strong>{msg.role}:</strong> {msg.content}
//                 {msg.role === "AI" && (
//                   <button className="ml-2" onClick={() => speakText(msg.content)}>
//                     <Volume2 size={20} className="text-black hover:text-gray-500" />
//                   </button>
//                 )}
//               </motion.div>
//             ))}
//           </div>

//           {/* Answer Input & Buttons */}
//           <div className="relative w-full mt-4">
//             <textarea
//               className="w-full p-3 pr-16 rounded-lg border border-gray-300 focus:outline-none resize-none"
//               value={answer}
//               onChange={(e) => setAnswer(e.target.value)}
//               placeholder="Type your answer..."
//               rows={3}
//             />
//             <div className="absolute bottom-2 right-3 flex space-x-2">
//               <button onClick={handleVoiceInput} className="chat-submit-btn font-semibold hover:bg-[#676767]">
//                 <Mic size={20} className="text-white" />
//               </button>
//               <button onClick={submitAnswer} className="chat-submit-btn font-semibold hover:bg-[#676767]">
//                 <Send size={20} className="text-white" />
//               </button>
//             </div>
//           </div>
//         </motion.div>
//       )}
//     </div>
//   );
// }


// import React, { useState, useRef, useEffect } from "react";
// import { motion } from "framer-motion";
// import axios from "axios";
// import { Volume2, Mic, Send, Plus, Trash2 } from "lucide-react";
// import { RiRobot3Line } from "react-icons/ri";
// import { useAuth } from "../services/AuthService"

// export default function InterviewApp() {
//   const { user } = useAuth(); // Get authenticated user details
//   const [topic, setTopic] = useState("");
//   const [sessionId, setSessionId] = useState(null);
//   const [question, setQuestion] = useState("");
//   const [answer, setAnswer] = useState("");
//   const [chatHistory, setChatHistory] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [interviewHistory, setInterviewHistory] = useState([]);

//   const recognitionRef = useRef(null);
//   const synthRef = useRef(window.speechSynthesis);
//   const chatContainerRef = useRef(null);

//   // Auto-scroll to latest message
//   useEffect(() => {
//     if (chatContainerRef.current) {
//       chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
//     }
//   }, [chatHistory]);

//   // Fetch interview history from database on login
//   useEffect(() => {
//     if (user?.email) {
//       fetchInterviewHistory();
//     }
//   }, [user]);

//   // Fetch interview history from database
//   const fetchInterviewHistory = async () => {
//     try {
//       const res = await axios.get(`http://localhost:3000/api/interviews?email=${user.email}`);
//       setInterviewHistory(res.data);
//     } catch (error) {
//       console.error("Error fetching interview history:", error);
//     }
//   };

//   // Start a new interview
//   const startInterview = async () => {
//     if (!topic.trim()) return alert("Please enter a topic");
//     setLoading(true);
//     try {
//       const res = await axios.post("http://localhost:3000/api/start-interview", {
//         email: user.email, // Store user email
//         topic,
//       });

//       const newInterview = {
//         sessionId: res.data.sessionId,
//         topic,
//         timestamp: new Date().toISOString(),
//         chatHistory: [{ role: "AI", content: res.data.question }],
//       };

//       setSessionId(res.data.sessionId);
//       setChatHistory(newInterview.chatHistory);
//       setInterviewHistory([newInterview, ...interviewHistory]);

//       await axios.post("http://localhost:3000/api/save-interview", newInterview);
//     } catch (error) {
//       console.error("Error starting interview:", error);
//     }
//     setLoading(false);
//   };

//   // Submit an answer
//   const submitAnswer = async () => {
//     if (!answer.trim()) return;
//     setLoading(true);
//     try {
//       const res = await axios.post("http://localhost:3000/api/answer", {
//         sessionId,
//         answer,
//       });

//       const updatedChatHistory = [
//         ...chatHistory,
//         { role: "User", content: answer },
//         { role: "AI", content: res.data.followUpQuestion },
//       ];

//       setChatHistory(updatedChatHistory);
//       setAnswer("");
//       setQuestion(res.data.followUpQuestion);

//       // Update database
//       await axios.post("http://localhost:3000/api/update-interview", {
//         sessionId,
//         chatHistory: updatedChatHistory,
//       });

//       // Update local state
//       setInterviewHistory((prevHistory) =>
//         prevHistory.map((intv) =>
//           intv.sessionId === sessionId ? { ...intv, chatHistory: updatedChatHistory } : intv
//         )
//       );
//     } catch (error) {
//       console.error("Error submitting answer:", error);
//     }
//     setLoading(false);
//   };

//   const handleVoiceInput = () => {
//     if (!recognitionRef.current) {
//       recognitionRef.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//       recognitionRef.current.continuous = false;
//       recognitionRef.current.interimResults = false;
  
//       recognitionRef.current.onstart = () => setIsListening(true);
//       recognitionRef.current.onresult = (event) => {
//         const transcript = event.results[0][0].transcript;
//         setAnswer(transcript);
//       };
//       recognitionRef.current.onerror = (event) => console.error("Voice Input Error:", event.error);
//       recognitionRef.current.onend = () => setIsListening(false);
//     }
  
//     recognitionRef.current.start();
//   };
  

//   // Load previous interview
//   const loadPreviousInterview = (interview) => {
//     setSessionId(interview.sessionId);
//     setChatHistory(interview.chatHistory);
//     setQuestion(interview.chatHistory[interview.chatHistory.length - 1].content);
//   };

//   // Delete an interview from database
//   const deleteInterview = async (sessionId) => {
//     try {
//       await axios.delete(`http://localhost:3000/api/delete-interview?sessionId=${sessionId}`);
//       setInterviewHistory(interviewHistory.filter((interview) => interview.sessionId !== sessionId));
//     } catch (error) {
//       console.error("Error deleting interview:", error);
//     }
//   };

//   return (
//     <div className="flex h-screen">
//       {/* Left Sidebar (History) */}
//       <div className="w-64 bg-gray-900 text-white p-4 flex flex-col">
//         <h2 className="text-lg font-bold mb-4">Interview History</h2>
//         <button onClick={() => setSessionId(null)} className="mb-4 bg-blue-500 p-2 rounded-lg flex items-center">
//           <Plus size={16} className="mr-2" />
//           Start New Interview
//         </button>
//         <div className="space-y-2 overflow-y-auto flex-1">
//           {interviewHistory.length === 0 ? (
//             <p className="text-gray-400">No past interviews</p>
//           ) : (
//             interviewHistory.map((interview, index) => (
//               <div key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded-lg">
//                 <button className="text-left flex-1" onClick={() => loadPreviousInterview(interview)}>
//                   {interview.topic}
//                 </button>
//                 <button onClick={() => deleteInterview(interview.sessionId)} className="text-red-500">
//                   <Trash2 size={16} />
//                 </button>
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       {/* Main Chat Window */}
//       <div className="flex-1 p-8">
//         <motion.h1 className="text-3xl font-bold mb-6 mt-1">🎤 AI Interview Simulator</motion.h1>

//         {!sessionId ? (
//           <div className="max-w-xl bg-white p-6 rounded-xl shadow-lg border">
//             <label className="block text-lg font-medium mb-2">Enter Topic:</label>
//             <input
//               type="text"
//               placeholder="e.g., Machine Learning"
//               className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none"
//               value={topic}
//               onChange={(e) => setTopic(e.target.value)}
//             />
//             <button onClick={startInterview} className="mt-4 w-full bg-black text-white p-3 rounded-lg">
//               {loading ? "Starting..." : "Start Interview"}
//             </button>
//           </div>
//         ) : (
//           <div className="h-full bg-white p-6 rounded-xl shadow-lg border flex flex-col">
//             <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-2">
//               {chatHistory.map((msg, index) => (
//                 <div key={index} className={`p-3 rounded-lg ${msg.role === "AI" ? "bg-gray-300" : "bg-gray-100"}`}>
//                   <strong>{msg.role}:</strong> {msg.content}
//                   {msg.role === "AI" && <button onClick={() => speakText(msg.content)}><Volume2 size={20} /></button>}
//                 </div>
//               ))}
//             </div>
//             <textarea className="w-full p-3 rounded-lg border mt-4" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer..." />
//             <div className="mt-2 flex space-x-2">
//               <button onClick={handleVoiceInput}><Mic size={20} /></button>
//               <button onClick={submitAnswer}><Send size={20} /></button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Volume2, Mic, Send, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../services/AuthService";

export default function InterviewApp() {
  const { user } = useAuth();
  const [topic, setTopic] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [interviewHistory, setInterviewHistory] = useState([]);

  const chatContainerRef = useRef(null);
  const textAreaRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Fetch interview history on login or refresh
  useEffect(() => {
    if (user?.email) {
      fetchInterviewHistory();
    }
  }, [user?.email]);

  const fetchInterviewHistory = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/interviews?email=${user.email}`);
      setInterviewHistory(res.data);

      // Restore the most recent session if available
      if (res.data.length > 0) {
        loadPreviousInterview(res.data[0]);
      }
    } catch (error) {
      console.error("Error fetching interview history:", error);
    }
  };

  const startInterview = async () => {
    if (!topic.trim()) return alert("Please enter a topic");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3000/api/start-interview", {
        email: user.email,
        topic,
      });

      const newInterview = {
        sessionId: res.data.sessionId,
        topic,
        email: user.email,
        timestamp: new Date().toISOString(),
        chatHistory: [{ role: "AI", content: res.data.question }],
      };

      setSessionId(res.data.sessionId);
      setChatHistory(newInterview.chatHistory);
      setInterviewHistory([newInterview, ...interviewHistory]);
      setTopic("");

      await axios.post("http://localhost:3000/api/save-interview", newInterview);
      fetchInterviewHistory();
    } catch (error) {
      console.error("Error starting interview:", error.response?.data || error);
    }
    setLoading(false);
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3000/api/answer", {
        sessionId,
        answer,
      });

      const updatedChatHistory = [
        ...chatHistory,
        { role: "User", content: answer },
        { role: "AI", content: res.data.followUpQuestion },
      ];

      setChatHistory(updatedChatHistory);
      setAnswer("");

      await axios.post("http://localhost:3000/api/update-interview", {
        sessionId,
        email: user.email,
        chatHistory: updatedChatHistory,
      });

      setInterviewHistory((prevHistory) =>
        prevHistory.map((intv) =>
          intv.sessionId === sessionId ? { ...intv, chatHistory: updatedChatHistory } : intv
        )
      );
    } catch (error) {
      console.error("Error submitting answer:", error.response?.data || error);
    }
    setLoading(false);
  };

  const loadPreviousInterview = (interview) => {
    setSessionId(interview.sessionId);
    setChatHistory(interview.chatHistory);
  };

  const deleteInterview = async (sessionId) => {
    try {
      await axios.delete(`http://localhost:3000/api/delete-interview?sessionId=${sessionId}&email=${user.email}`);
      setInterviewHistory(interviewHistory.filter((interview) => interview.sessionId !== sessionId));
      fetchInterviewHistory();
    } catch (error) {
      console.error("Error deleting interview:", error);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar - Interview History */}
      <div className="w-64 bg-gray-900 text-white p-4 flex flex-col">
        <h2 className="text-lg font-bold mb-4">Interview History</h2>
        <button onClick={() => setSessionId(null)} className="mb-4 bg-blue-500 p-2 rounded-lg flex items-center">
          <Plus size={16} className="mr-2" />
          Start New Interview
        </button>
        <div className="space-y-2 overflow-y-auto flex-1">
          {interviewHistory.length === 0 ? (
            <p className="text-gray-400">No past interviews</p>
          ) : (
            interviewHistory.map((interview, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded-lg">
                <button className="text-left flex-1" onClick={() => loadPreviousInterview(interview)}>
                  {interview.topic}
                </button>
                <button onClick={() => deleteInterview(interview.sessionId)} className="text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Section */}
      <div className="flex-1 p-8 flex flex-col">
        <motion.h1 className="text-3xl font-bold mb-6">🎤 AI Interview Simulator</motion.h1>
        {!sessionId ? (
          <div className="max-w-xl bg-white p-6 rounded-xl shadow-lg border">
            <label className="block text-lg font-medium mb-2">Enter Topic:</label>
            <input
              type="text"
              placeholder="e.g., Java"
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <button onClick={startInterview} className="mt-4 w-full bg-black text-white p-3 rounded-lg">
              {loading ? "Starting..." : "Start Interview"}
            </button>
          </div>
        ) : (
          <div className="flex-1 bg-white p-6 rounded-xl shadow-lg border flex flex-col">
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-2">
              {chatHistory.map((msg, index) => (
                <div key={index} className={`p-3 rounded-lg ${msg.role === "AI" ? "bg-gray-300" : "bg-gray-100"}`}>
                  <strong>{msg.role}:</strong> {msg.content}
                </div>
              ))}
            </div>
            <div className="flex items-center border rounded-lg p-2 mt-4 bg-gray-50">
              <textarea
                ref={textAreaRef}
                className="flex-1 p-2 resize-none focus:outline-none min-h-[60px]"
                rows={2}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer..."
              />
              <button><Mic size={20} /></button>
              <button onClick={submitAnswer}><Send size={20} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
