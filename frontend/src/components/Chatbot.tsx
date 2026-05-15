import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { askMedicalAI } from '../lib/gemini';
import { cn } from '../lib/utils';
import { ChatMessage } from './chat/ChatMessage';
import { ChatInput } from './chat/ChatInput';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    {
      role: 'bot',
      text: 'Xin chào! Tôi là trợ lý AI của Mediflow. Tôi có thể giúp bạn giải đáp thắc mắc về bệnh lý hoặc thuật ngữ trong hồ sơ của bạn.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    const botResponse = await askMedicalAI(userMessage);
    setMessages(prev => [...prev, { role: 'bot', text: botResponse || 'Xin lỗi, tôi không thể trả lời lúc này.' }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-full max-w-[380px] bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[520px] text-white"
          >
            {/* Header */}
            <div className="p-6 bg-slate-800 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-xl shadow-lg shadow-primary/20">
                   ✨
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">Trợ lý Y tế AI</h3>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900 custom-scrollbar">
              {messages.map((msg, i) => (
                <ChatMessage key={i} role={msg.role} text={msg.text} />
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-slate-500 text-[10px] bg-slate-800/50 px-3 py-1.5 rounded-full w-fit">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  Trợ lý đang xử lý...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <ChatInput input={input} isLoading={isLoading} onChange={setInput} onSend={handleSend} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all",
          isOpen ? "bg-slate-800 text-white" : "bg-primary text-white"
        )}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </div>
  );
}
