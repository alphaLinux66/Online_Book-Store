import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, ArrowRight } from 'lucide-react';
import { askChatbot, logChatInteraction } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! Welcome to Papyrus Plaza. How can I help you today? You can ask me about our inventory!", isBot: true }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setMessages(prev => [...prev, { text: userText, isBot: false }]);
    setInputValue("");
    
    // Add typing indicator
    setMessages(prev => [...prev, { text: "...", isBot: true, isTyping: true }]);

    try {
      const data = await askChatbot(userText);
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isTyping);
        return [...filtered, { text: data.response, isBot: true }];
      });
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isTyping);
        return [...filtered, { text: "Sorry, I'm having trouble connecting to the network right now.", isBot: true }];
      });
    }
  };

  return (
    <div className="chatbot-widget">
      <div className={`chatbot-window ${!isOpen ? 'hidden' : ''}`}>
        <div className="chatbot-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }}></div>
            Store Assistant
          </div>
          <button onClick={toggleChat} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>
        
        <div className="chatbot-messages">
          {messages.map((msg, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.isBot ? 'flex-start' : 'flex-end' }}>
                <div className={`chat-bubble ${msg.isBot ? 'bot' : 'user'}`}>
                {msg.text}
                </div>
                {msg.action && (
                    <button 
                        onClick={() => {
                            navigate(msg.action.path);
                            setIsOpen(false);
                        }}
                        style={{ marginTop: '0.5rem', background: 'var(--color-accent-primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {msg.action.label} <ArrowRight size={14} />
                    </button>
                )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSend} className="chatbot-input">
          <input 
            type="text" 
            placeholder="Type your question here..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit" disabled={!inputValue.trim()} style={{ background: inputValue.trim() ? 'var(--color-accent-primary)' : 'var(--color-bg-secondary)', color: inputValue.trim() ? 'white' : 'var(--color-text-secondary)', border: 'none', borderRadius: 'var(--radius-full)', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Send size={18} />
          </button>
        </form>
      </div>
      
      {!isOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', position: 'relative' }}>
          <div className="animate-float" style={{ 
              background: 'var(--color-accent-primary)', 
              color: 'white', 
              padding: '0.75rem 1rem', 
              borderRadius: 'var(--radius-lg)',
              borderBottomRightRadius: '0px',
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '1rem',
              boxShadow: 'var(--shadow-md)',
              position: 'relative'
          }}>
              How can I help you?
          </div>
          <button 
            onClick={toggleChat} 
            style={{ width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none', boxShadow: 'var(--shadow-lg)', background: 'var(--color-accent-primary)', color: 'white' }}
          >
            <MessageSquare size={28} />
          </button>
        </div>
      )}
    </div>
  );
}
