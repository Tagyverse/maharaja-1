'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, ArrowRight } from 'lucide-react';
import { brand } from '../config/brand';

type Message = {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
};

interface WhatsAppChatModalProps {
  onClose: () => void;
}

export default function WhatsAppChatModal({ onClose }: WhatsAppChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState('');
  const [awaitingName, setAwaitingName] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      addBotMessage(`${brand.whatsappGreeting} What's your name?`);
    }, 500);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addBotMessage = (text: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text,
        sender: 'bot',
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1000 + Math.random() * 500);
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Date()
    }]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const message = inputValue.trim();
    addUserMessage(message);
    setInputValue('');

    if (awaitingName) {
      setUserName(message);
      setAwaitingName(false);
      setTimeout(() => {
        addBotMessage(`Nice to meet you, ${message}! How can I help you today?`);
      }, 800);
    } else {
      setTimeout(() => {
        addBotMessage("Thanks for your message! Tap below to continue on WhatsApp.");
      }, 1200);
    }
  };

  const handleWhatsAppRedirect = () => {
    const lastUserMessage = messages.filter(m => m.sender === 'user').pop()?.text || '';
    const whatsappMessage = userName
      ? `Hi, I'm ${userName}. ${lastUserMessage}`
      : lastUserMessage;
    const whatsappNumber = brand.whatsapp;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    window.open(whatsappUrl, '_blank');
    onClose();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <>
      {/* Scrim overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-[998] transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal container - centered dialog, keyboard-aware */}
      <div className="fixed inset-0 z-[999] flex items-start sm:items-center justify-center pt-12 sm:pt-0 p-4 overflow-hidden">
        <div className="chat-modal-enter bg-white flex flex-col w-full max-w-[380px] h-[min(520px,70dvh)] sm:h-[min(520px,85vh)] rounded-2xl overflow-hidden shadow-2xl">

          {/* App Bar */}
          <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#F0F5F0] flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src={brand.logo || '/favicon.png'}
                alt={brand.name}
                className="w-6 h-6 object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{brand.name}</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                <span className="text-xs text-gray-500">Online</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors active:scale-95"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 px-4 py-3 space-y-3 overflow-y-auto overscroll-contain bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} chat-msg-enter`}
              >
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 ${
                    msg.sender === 'user'
                      ? 'bg-[#2D4A3A] text-white rounded-2xl rounded-br-md'
                      : 'bg-white text-gray-800 rounded-2xl rounded-bl-md border border-gray-100'
                  }`}
                >
                  <p className="text-[13px] leading-relaxed break-words">{msg.text}</p>
                  <span className={`block text-[10px] mt-1 text-right ${
                    msg.sender === 'user' ? 'text-white/60' : 'text-gray-400'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start chat-msg-enter">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-gray-300 rounded-full chat-typing-dot"></span>
                    <span className="w-2 h-2 bg-gray-300 rounded-full chat-typing-dot" style={{ animationDelay: '0.15s' }}></span>
                    <span className="w-2 h-2 bg-gray-300 rounded-full chat-typing-dot" style={{ animationDelay: '0.3s' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* WhatsApp CTA */}
          {!awaitingName && messages.filter(m => m.sender === 'user').length > 1 && (
            <div className="px-4 py-2 bg-white border-t border-gray-100">
              <button
                onClick={handleWhatsAppRedirect}
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-medium py-2.5 rounded-xl transition-colors active:scale-[0.98]"
              >
                Continue on WhatsApp
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Input area */}
          <div className="px-3 py-3 bg-white border-t border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSendMessage(); } }}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 text-sm bg-gray-100 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-[#2D4A3A]/20 text-gray-900 placeholder-gray-400 transition-all"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#2D4A3A] text-white disabled:bg-gray-200 disabled:text-gray-400 transition-colors active:scale-95 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .chat-modal-enter {
          animation: chatModalScale 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }

        @keyframes chatModalScale {
          from {
            opacity: 0;
            transform: scale(0.93);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .chat-msg-enter {
          animation: chatMsgFade 0.25s ease-out forwards;
        }

        @keyframes chatMsgFade {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chat-typing-dot {
          animation: chatTypingBounce 1.2s ease-in-out infinite;
        }

        @keyframes chatTypingBounce {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-4px);
          }
        }
      `}</style>
    </>
  );
}
