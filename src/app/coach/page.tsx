'use client';

import { useState, useEffect, useRef } from 'react';
import { Brain, Send, Sparkles, Bot, User } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { storage } from '@/lib/storage';
import { getChatResponse } from '@/lib/mockAI';

interface ChatMessage {
  role: 'ai' | 'user';
  content: string;
  time: string;
}

const WELCOME_MESSAGE: ChatMessage = {
  role: 'ai',
  content: '안녕하세요! UricAI 건강 코치입니다. 요산, 혈당, 식단, 운동 등 건강 관련 궁금한 점을 물어보세요! 💪',
  time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
};

const quickChips = ['요산 관리 팁', '오늘 식단 분석', '운동 추천', 'GLP-1 관리'];

export default function CoachPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history on mount
  useEffect(() => {
    const saved = storage.getChatHistory();
    if (saved.length > 0) {
      setMessages(saved as ChatMessage[]);
    } else {
      setMessages([WELCOME_MESSAGE]);
      storage.addChat(WELCOME_MESSAGE);
    }
  }, []);

  // Auto-scroll on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: text.trim(),
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    storage.addChat(userMsg);
    setInput('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        role: 'ai',
        content: getChatResponse(text.trim()),
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiResponse]);
      storage.addChat(aiResponse);
      setIsTyping(false);
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleChipClick = (chip: string) => {
    sendMessage(chip);
  };

  return (
    <div className="flex flex-col h-screen bg-neo-bg">
      {/* Header */}
      <header className="neo-card-violet flex items-center justify-center gap-3 h-16 mx-4 mt-4">
        <div className="w-10 h-10 rounded-full bg-violet-400 border-3 border-black flex items-center justify-center">
          <Brain size={20} className="text-black" />
        </div>
        <h1 className="text-lg font-black">AI 건강 코치</h1>
      </header>

      {/* Chat Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 pb-52 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-cyan-300' : 'bg-violet-300'
              }`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              
              {/* Message Bubble */}
              <div
                className={`rounded-xl px-4 py-3 text-sm leading-relaxed border-3 border-black ${
                  msg.role === 'user'
                    ? 'bg-cyan-300 shadow-neo-sm'
                    : 'bg-white shadow-neo-sm'
                }`}
              >
                {msg.role === 'ai' && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles size={14} className="text-violet-600" />
                    <span className="text-xs font-bold text-violet-600">UricAI 코치</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                <p className="text-[10px] mt-2 text-gray-500 font-medium">
                  {msg.time}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-black bg-violet-300 flex items-center justify-center">
                <Bot size={14} />
              </div>
              <div className="bg-white border-3 border-black rounded-xl px-4 py-3 shadow-neo-sm">
                <div className="flex items-center gap-1 text-lg">
                  <span className="animate-bounce" style={{ animationDelay: '0ms' }}>•</span>
                  <span className="animate-bounce" style={{ animationDelay: '150ms' }}>•</span>
                  <span className="animate-bounce" style={{ animationDelay: '300ms' }}>•</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Suggestion Chips + Input Bar — fixed above BottomNav */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-neo-bg border-t-3 border-black z-40">
        {/* Quick Chips */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          {quickChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleChipClick(chip)}
              className="flex-shrink-0 px-4 py-2 bg-violet-200 text-black text-xs font-bold rounded-full border-2 border-black shadow-neo-xs hover:bg-violet-300 hover:-translate-y-0.5 transition-all"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 pb-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="건강에 대해 물어보세요..."
            className="flex-1 h-12 px-4 bg-white rounded-xl text-sm font-medium border-3 border-black shadow-neo-sm outline-none focus:shadow-neo transition-shadow"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 flex items-center justify-center bg-lime-400 text-black rounded-xl border-3 border-black shadow-neo-sm disabled:opacity-40 hover:bg-lime-300 hover:-translate-y-0.5 hover:shadow-neo active:translate-y-0.5 active:shadow-neo-xs transition-all"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}
