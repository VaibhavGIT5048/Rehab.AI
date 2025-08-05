import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface ChatMessageProps {
  message: {
    id: string;
    sender: 'user' | 'ai';
    content: string;
    timestamp: string;
    type: 'text' | 'exercise' | 'image';
    exerciseData?: {
      name: string;
      sets: number;
      reps: number;
      image: string;
    };
  };
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  // Format AI responses with bullet points and better structure
  const formatAIResponse = (content: string) => {
    // Split content into paragraphs and bullet points
    const lines = content.split('\n').filter(line => line.trim());
    const formattedContent = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if line starts with a number (like "1.", "2.", etc.)
      if (/^\d+\./.test(line)) {
        const [number, ...rest] = line.split('.');
        const text = rest.join('.').trim();
        formattedContent.push({
          type: 'numbered',
          number: number,
          text: text
        });
      }
      // Check if line is a bullet point
      else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        formattedContent.push({
          type: 'bullet',
          text: line.substring(1).trim()
        });
      }
      // Regular paragraph
      else if (line.length > 0) {
        formattedContent.push({
          type: 'paragraph',
          text: line
        });
      }
    }
    
    return formattedContent;
  };

  const getRecommendationIcon = (text: string) => {
    if (text.toLowerCase().includes('see') && text.toLowerCase().includes('doctor')) {
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
    if (text.toLowerCase().includes('exercise') || text.toLowerCase().includes('stretch')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <Info className="h-4 w-4 text-blue-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-xs lg:max-w-md ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
        {message.type === 'text' && (
          <div className={`px-4 py-3 rounded-2xl ${
            message.sender === 'user' 
              ? 'bg-teal-500 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}>
            {message.sender === 'ai' ? (
              <div className="space-y-3">
                {formatAIResponse(message.content).map((item, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    {item.type === 'numbered' && (
                      <>
                        <div className="flex items-center space-x-2 w-full">
                          {getRecommendationIcon(item.text)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2 py-1 rounded-full">
                                {item.number}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed">{item.text}</p>
                          </div>
                        </div>
                      </>
                    )}
                    {item.type === 'bullet' && (
                      <div className="flex items-start space-x-2 w-full">
                        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm leading-relaxed">{item.text}</p>
                      </div>
                    )}
                    {item.type === 'paragraph' && (
                      <p className="text-sm leading-relaxed w-full">{item.text}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>{message.content}</p>
            )}
          </div>
        )}
        
        {message.type === 'exercise' && message.exerciseData && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <div className="bg-teal-100 p-1 rounded-full">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
              </div>
              <span className="text-sm font-medium text-teal-700">Exercise Prescription</span>
            </div>
            <img
              src={message.exerciseData.image}
              alt={message.exerciseData.name}
              className="w-full h-32 object-cover rounded-lg mb-3"
            />
            <h4 className="font-semibold text-gray-900 mb-2">{message.exerciseData.name}</h4>
            <div className="flex space-x-4 text-sm text-gray-600">
              <span>{message.exerciseData.sets} sets</span>
              <span>{message.exerciseData.reps} seconds hold</span>
            </div>
            <button className="w-full mt-3 bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors">
              Start Exercise with AI
            </button>
          </div>
        )}
        
        <p className={`text-xs mt-1 ${
          message.sender === 'user' ? 'text-right text-gray-500' : 'text-left text-gray-500'
        }`}>
          {message.timestamp}
        </p>
      </div>
    </motion.div>
  );
};

export default ChatMessage;