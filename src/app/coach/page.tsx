'use client';

import { useState, useEffect, useRef } from 'react';
import { Brain, Send, Sparkles } from 'lucide-react';
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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-center gap-2 h-14 px-4 bg-white border-b border-gray-100">
        <Brain size={24} className="text-purple-500" />
        <h1 className="text-lg font-semibold">AI 건강 코치</h1>
      </header>

      {/* Chat Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 pb-48 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-800 rounded-bl-md'
              }`}
            >
              {msg.role === 'ai' && (
                <div className="flex items-center gap-1 mb-1">
                  <Sparkles size={14} className="text-purple-500" />
                  <span className="text-xs font-medium text-purple-500">UricAI 코치</span>
                </div>
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p
                className={`text-[10px] mt-1 ${
                  msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                }`}
              >
                {msg.time}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Suggestion Chips + Input Bar — fixed above BottomNav */}
      <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 z-40">
        {/* Quick Chips */}
        <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
          {quickChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleChipClick(chip)}
              className="flex-shrink-0 px-3 py-1.5 bg-purple-50 text-purple-600 text-xs rounded-full border border-purple-200 hover:bg-purple-100 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 pb-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="건강에 대해 물어보세요..."
            className="flex-1 h-10 px-4 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-300"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full disabled:opacity-40 hover:bg-blue-600 transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}
