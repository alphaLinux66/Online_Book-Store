import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, ArrowRight } from 'lucide-react';
import { fetchBooks } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! Welcome to Nyeras Book Store. How can I help you today? You can ask me about our inventory!", isBot: true }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks().then(books => setKnowledgeBase(books)).catch(err => console.log('Chatbot failed binding: ', err));
  }, []);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setMessages(prev => [...prev, { text: userText, isBot: false }]);
    setInputValue("");

    setTimeout(() => {
      const response = generateDynamicBotResponse(userText);
      setMessages(prev => [...prev, response]);
    }, 600);
  };

  const generateDynamicBotResponse = (query) => {
    const lowerQuery = query.toLowerCase();

    // Dynamically search knowledge base
    const matchingBook = knowledgeBase.find(book => 
        lowerQuery.includes(book.title.toLowerCase()) || 
        book.title.toLowerCase().includes(lowerQuery.replace('about ', ''))
    );

    if (matchingBook && lowerQuery.length > 3) {
        return {
            text: `Ah, "${matchingBook.title}"! ${matchingBook.description} Available in our catalog for ₹${matchingBook.price}.`,
            isBot: true,
            action: { label: "View in Catalog", path: "/catalog" }
        };
    }
    
    // Fallbacks
    if (lowerQuery.includes("best seller") || lowerQuery.includes("popular")) {
      return { text: "Our best sellers feature Orwell, Austen, and many more. Please check the catalog to see them all!", isBot: true, action: { label: "Browse Catalog", path: "/catalog" } };
    } else if (lowerQuery.includes("shipping") || lowerQuery.includes("delivery")) {
      return { text: "We offer free standard shipping on orders over ₹500! Standard delivery takes 3-5 business days.", isBot: true };
    } else if (lowerQuery.includes("hello") || lowerQuery.includes("hi") || lowerQuery.includes("hey")) {
      return { text: "Hi there! Feel free to ask me for a summary of any book in our collection.", isBot: true };
    } else {
      return { text: "I'm your assistant! Try asking me about a specific book by its title to get a brief summary.", isBot: true };
    }
  };

  return (
    <div className="chatbot-widget">
      <div className={`glass-panel chatbot-window ${!isOpen ? 'hidden' : ''}`}>
        <div className="chatbot-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }}></div>
            Store Assistant
          </div>
          <button onClick={toggleChat} className="btn-icon" style={{ background: 'transparent', border: 'none' }}>
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
                        style={{ marginTop: '0.5rem', background: 'var(--color-accent-secondary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
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
          <button type="submit" className="btn-icon" disabled={!inputValue.trim()} style={{ background: inputValue.trim() ? 'var(--color-accent-primary)' : 'transparent' }}>
            <Send size={18} />
          </button>
        </form>
      </div>
      
      {!isOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', position: 'relative' }}>
          <div className="animate-float" style={{ 
              background: 'white', 
              color: 'var(--color-bg-primary)', 
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
            className="btn-primary animate-float"
            style={{ width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none', boxShadow: 'var(--shadow-lg)' }}
          >
            <MessageSquare size={28} />
          </button>
        </div>
      )}
    </div>
  );
}
