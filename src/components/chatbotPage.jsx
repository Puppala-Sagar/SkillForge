import { useParams } from 'react-router-dom';
import ChatBot from './chatBot.jsx';

export default function ChatbotPage() {
  const { subject, subtopic } = useParams(); // Extracting from URL parameters

  return (
    <div>
      <h1>Learning Platform</h1>
      <ChatBot subject={subject} subtopic={subtopic} />
    </div>
  );
}
