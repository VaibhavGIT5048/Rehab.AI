import React, { useState } from 'react';
import { useEffect } from 'react';
import { Send, Phone, Video, MoreVertical, Paperclip, Smile, Search, Trash2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { generateAIResponse, doctorContexts } from '../lib/ai';
import ChatMessage from '../components/ChatMessage';
import toast from 'react-hot-toast';

interface Message {
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
}

interface Conversation {
  id: string;
  doctor: {
    id: string;
    name: string;
    specialty: string;
    avatar: string;
    online: boolean;
  };
  lastMessage: string;
  timestamp: string;
  unread: number;
}

const Chat = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const formattedConversations: Conversation[] = (data || []).map(conv => {
        const doctorContext = doctorContexts[conv.doctor_id];
        return {
          id: conv.id,
          doctor: {
            id: conv.doctor_id,
            name: doctorContext?.name || 'Unknown Doctor',
            specialty: doctorContext?.specialty || 'General Practice',
            avatar: conv.doctor_id === 'mitchell' 
              ? "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=400"
              : conv.doctor_id === 'chen'
              ? "https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=400"
              : "https://images.pexels.com/photos/8376285/pexels-photo-8376285.jpeg?auto=compress&cs=tinysrgb&w=400",
            online: true
          },
          lastMessage: "Start a conversation",
          timestamp: new Date(conv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unread: 0
        };
      });
      
      setConversations(formattedConversations);
      
      // If no conversation is selected and we have conversations, select the first one
      if (!selectedConversation && formattedConversations.length > 0) {
        setSelectedConversation(formattedConversations[0]);
        await loadMessages(formattedConversations[0].id);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    setActiveConversationId(conversationId);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const formattedMessages = data?.map(msg => ({
        id: msg.id,
        sender: msg.sender_type,
        content: msg.content,
        timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: msg.message_type,
        exerciseData: msg.metadata?.exerciseData
      })) || [];
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const createNewConversation = async (doctorId: string) => {
    if (!user) return;

    // Check if conversation already exists
    const { data: existingConv } = await supabase
      .from('chat_conversations')
      .select('id')
      .eq('user_id', user.id)
      .eq('doctor_id', doctorId)
      .maybeSingle();

    if (existingConv) {
      // Find and select the existing conversation
      const existingConversation = conversations.find(conv => conv.id === existingConv.id);
      if (existingConversation) {
        setSelectedConversation(existingConversation);
      }
      await loadMessages(existingConv.id);
      return existingConv.id;
    }

    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: user.id,
          doctor_id: doctorId
        })
        .select()
        .single();

      if (error) throw error;
      
      await loadConversations();
      await loadMessages(data.id);
      
      // Update selected conversation
      const doctorContext = doctorContexts[doctorId];
      const newConversation: Conversation = {
        id: data.id,
        doctor: {
          id: doctorId,
          name: doctorContext?.name || 'Unknown Doctor',
          specialty: doctorContext?.specialty || 'General Practice',
          avatar: doctorId === 'mitchell' 
            ? "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=400"
            : doctorId === 'chen'
            ? "https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=400"
            : "https://images.pexels.com/photos/8376285/pexels-photo-8376285.jpeg?auto=compress&cs=tinysrgb&w=400",
          online: true
        },
        lastMessage: "Start a conversation",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unread: 0
      };
      setSelectedConversation(newConversation);
      
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      // Delete messages first
      await supabase
        .from('chat_messages')
        .delete()
        .eq('conversation_id', conversationId);

      // Delete conversation
      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;
      
      toast.success('Conversation deleted');
      await loadConversations();
      setMessages([]);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedConversation) {
      // Ensure we have an active conversation
      let conversationId = activeConversationId;
      
      if (!conversationId) {
        const doctorId = selectedConversation.doctor.id;
        conversationId = await createNewConversation(doctorId);
        if (!conversationId) return;
      }
      
      setLoading(true);
      
      // Add user message
      const message: Message = {
        id: crypto.randomUUID(),
        sender: 'user',
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text'
      };
      setMessages(prev => [...prev, message]);
      
      // Save user message to database
      try {
        if (user) {
          const { data: savedMessage, error } = await supabase
            .from('chat_messages')
            .insert({
              conversation_id: conversationId,
              sender_type: 'user',
              content: newMessage,
              message_type: 'text'
            })
            .select('id')
            .single();
            
          if (error) throw error;
          
          // Update the message with the actual database ID
          if (savedMessage) {
            setMessages(prev => prev.map(msg => 
              msg.id === message.id ? { ...msg, id: savedMessage.id } : msg
            ));
          }
        }
      } catch (error) {
        console.error('Error saving message:', error);
        toast.error('Failed to save message');
      }
      
      setNewMessage('');

      // Generate AI response
      try {
        const currentMessages = [...messages, message];
        const conversationHistory = currentMessages.slice(-5).map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        }));

        const aiResponse = await generateAIResponse(
          newMessage,
          selectedConversation.doctor.id,
          conversationHistory
        );

        if (aiResponse.success) {
          const aiMessage: Message = {
            id: crypto.randomUUID(),
            sender: 'ai',
            content: aiResponse.content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'text'
          };
          
          setMessages(prev => [...prev, aiMessage]);

          // Save AI response to database
          if (user) {
            const { data: savedAIMessage, error } = await supabase
              .from('chat_messages')
              .insert({
                conversation_id: conversationId,
                sender_type: 'ai',
                content: aiResponse.content,
                message_type: 'text'
              })
              .select('id')
              .single();
              
            if (error) throw error;
            
            // Update the AI message with the actual database ID
            if (savedAIMessage) {
              setMessages(prev => prev.map(msg => 
                msg.id === aiMessage.id ? { ...msg, id: savedAIMessage.id } : msg
              ));
            }
          }
        } else {
          toast.error('Failed to get AI response');
        }
      } catch (error) {
        console.error('Error generating AI response:', error);
        toast.error('Failed to generate response');
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!selectedConversation) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-gray-600 mb-4">Start a conversation with one of your doctors</p>
              <div className="space-y-2">
                {Object.entries(doctorContexts).map(([doctorId, doctor]) => (
                  <button
                    key={doctorId}
                    onClick={() => createNewConversation(doctorId)}
                    className="block w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                  >
                    Chat with {doctor.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  whileHover={{ backgroundColor: '#f9fafb' }}
                  onClick={() => {
                    setSelectedConversation(conversation);
                    loadMessages(conversation.id);
                  }}
                  className={`p-4 cursor-pointer border-l-4 transition-all ${
                    selectedConversation.id === conversation.id
                      ? 'border-l-teal-500 bg-teal-50'
                      : 'border-l-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <img
                        src={conversation.doctor.avatar}
                        alt={conversation.doctor.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {conversation.doctor.online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900 truncate">{conversation.doctor.name}</h4>
                        <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{conversation.doctor.specialty}</p>
                      <p className="text-sm text-gray-500 truncate mt-1">{conversation.lastMessage}</p>
                    </div>
                    {conversation.unread > 0 && (
                      <div className="bg-teal-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {conversation.unread}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={selectedConversation.doctor.avatar}
                      alt={selectedConversation.doctor.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {selectedConversation.doctor.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedConversation.doctor.name}</h3>
                    <p className="text-sm text-gray-600">{selectedConversation.doctor.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Video className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => {
                      if (activeConversationId && window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
                        deleteConversation(activeConversationId);
                      }
                    }}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => {
                      const doctorId = selectedConversation.doctor.id;
                      createNewConversation(doctorId);
                    }}
                    className="px-3 py-2 text-sm bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    New Chat
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                />
              ))}
            </div>

            {/* Message Input */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <Paperclip className="h-5 w-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-600 hover:text-gray-700">
                    <Smile className="h-4 w-4" />
                  </button>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={loading}
                  className="bg-teal-500 text-white p-2 rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;