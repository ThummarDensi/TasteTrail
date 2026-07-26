import React, { useState, useRef, useEffect } from 'react';
import { RxCross2 } from 'react-icons/rx';
import { HiChatBubbleLeftRight } from 'react-icons/hi2';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I am a highly responsible and helpful AI assistant powered by KOS. Ask me anything, and I'll do my best to provide you with an accurate and complete answer.",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Gemini API Configuration
  const MODEL_NAME = 'gemini-2.5-flash-preview-09-2025';
  const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/';
  const API_KEY = "AIzaSyDHg6bQPx4H0yCplFA3aWAXukbMVSfLe44";
  const SYSTEM_PROMPT = "You are a highly responsible, knowledgeable, and helpful AI chatbot for KOS food delivery platform. Your primary goal is to provide accurate, informative, and complete answers to every question the user asks. Always maintain a professional and friendly tone. Help users with food orders, delivery questions, restaurant information, and any other queries related to the food delivery service.";

  // Load chat history from sessionStorage
  useEffect(() => {
    const savedHistory = sessionStorage.getItem('kosChatHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  }, []);

  // Save chat history to sessionStorage
  useEffect(() => {
    if (messages.length > 1) {
      sessionStorage.setItem('kosChatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Exponential backoff fetch function
  const exponentialBackoffFetch = async (url, options, maxRetries = 5, delay = 1000) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);
        if (response.status !== 429 && response.ok) {
          return response;
        } else if (response.status === 429 && attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        } else {
          throw new Error(`API error: ${response.statusText}`);
        }
      } catch (error) {
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        } else {
          throw error;
        }
      }
    }
    throw new Error('Max retries exceeded.');
  };

  // Format text with markdown support
  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const query = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build chat history for API
      const chatHistory = messages
        .filter(msg => msg.id !== 1) // Exclude initial welcome message
        .map(msg => ({
          role: msg.isBot ? "model" : "user",
          parts: [{ text: msg.text }]
        }));

      // Add current user message
      chatHistory.push({
        role: "user",
        parts: [{ text: query }]
      });

      const apiUrl = `${API_BASE}${MODEL_NAME}:generateContent?key=${API_KEY}`;
      const payload = {
        contents: chatHistory,
        tools: [{ "google_search": {} }],
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        }
      };

      const response = await exponentialBackoffFetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      const candidate = result.candidates?.[0];
      
      let aiResponseText = "Sorry, I encountered an error while processing your request.";
      
      if (candidate && candidate.content?.parts?.[0]?.text) {
        aiResponseText = candidate.content.parts[0].text;

        // Check for grounding sources
        const groundingMetadata = candidate.groundingMetadata;
        if (groundingMetadata && groundingMetadata.groundingAttributions) {
          const sources = groundingMetadata.groundingAttributions
            .map(attribution => ({
              uri: attribution.web?.uri,
              title: attribution.web?.title,
            }))
            .filter(source => source.uri && source.title)
            .slice(0, 3);

          if (sources.length > 0) {
            const sourcesHtml = '<div class="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">Sources: ' +
              sources.map((s, i) => `<a href="${s.uri}" target="_blank" class="text-[#ff4d2d] hover:underline">${s.title}</a>`).join(', ') +
              '</div>';
            aiResponseText += sourcesHtml;
          }
        }
      } else if (result.error) {
        console.error("API Error:", result.error);
        aiResponseText = `Error: ${result.error.message || 'An unexpected API error occurred.'}`;
      }

      const botMessage = {
        id: Date.now() + 1,
        text: aiResponseText,
        isBot: true,
        timestamp: new Date()
      };

      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
      }, 500);

    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Error: Could not connect to the service. Please check your connection and try again.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && inputMessage.trim() && !isLoading) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[9998] w-14 h-14 bg-[#ff4d2d] text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-[#ff4d2d]/90 transition-all duration-300 hover:scale-110"
          aria-label="Open chatbot"
        >
          <HiChatBubbleLeftRight size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[9998] w-[85vw] sm:w-[380px] h-[500px] sm:h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col border-2 border-[#ff4d2d] overflow-hidden">
          {/* Header */}
          <div className="bg-[#ff4d2d] text-white p-3 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold">KOS Chatbot</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/30 active:bg-white/40 rounded-full p-2 transition-all flex items-center justify-center cursor-pointer"
              aria-label="Close chatbot"
              title="Close chatbot"
            >
              <RxCross2 size={22} className="font-bold" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-3 bg-[#fff9f6] space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                    message.isBot
                      ? 'bg-white text-gray-800 border border-gray-200 shadow-md rounded-bl-md'
                      : 'bg-[#ff4d2d] text-white rounded-br-md'
                  }`}
                >
                  <div
                    className="text-xs sm:text-sm break-words"
                    dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }}
                  />
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-3 py-2 shadow-md">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-1.5 h-1.5 bg-[#ff4d2d] rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-[#ff4d2d] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 h-1.5 bg-[#ff4d2d] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    <span className="text-gray-600 text-xs sm:text-sm ml-2">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-200">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 text-sm border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#ff4d2d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-[#ff4d2d] text-white p-2.5 rounded-xl hover:bg-[#ff4d2d]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px]"
                aria-label="Send message"
                title="Send message"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;