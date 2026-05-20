import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { askMedicalAI } from '../lib/gemini';
import { ChatMessage } from './chat/ChatMessage';
import { ChatInput } from './chat/ChatInput';
import { socketService } from '../services/socketService';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    {
      role: 'bot',
      text: 'Xin chào! Tôi là trợ lý AI của Mediflow. Tôi có thể giúp bạn giải đáp thắc mắc về bệnh lý, thuốc hoặc thuật ngữ trong hồ sơ của bạn.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleIncomingMessage = (payload: any) => {
      const text = payload.message || payload.text || 'Tin nhắn mới từ hệ thống.';
      setMessages((prev) => [...prev, { role: 'bot', text }]);
    };

    socket.on('chat:message_received', handleIncomingMessage);
    return () => {
      socket.off('chat:message_received', handleIncomingMessage);
    };
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('chat:typing', { userName: 'Bạn', roomId: 'global' });
    }

    const botResponse = await askMedicalAI(userMessage);
    setMessages((prev) => [
      ...prev,
      { role: 'bot', text: botResponse || 'Xin lỗi, tôi không thể trả lời lúc này.' },
    ]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="mb-4 w-[380px] max-w-[calc(100vw-3rem)] h-[560px] max-h-[calc(100vh-7rem)] bg-white rounded-3xl shadow-[0_20px_50px_rgb(15_23_42/0.18)] overflow-hidden flex flex-col border border-slate-200/70"
          >
            {/* Header */}
            <div className="relative px-5 py-4 bg-gradient-to-br from-sky-500 to-teal-500 text-white">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,white_0%,transparent_50%)] opacity-15" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md grid place-items-center border border-white/20">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[15px] leading-tight">Trợ lý y tế AI</h3>
                    <p className="text-[11px] text-white/80 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                      Sẵn sàng 24/7
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 grid place-items-center rounded-full text-white/80 hover:bg-white/15 transition-colors"
                  aria-label="Đóng"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/60 custom-scrollbar">
              {messages.map((msg, i) => (
                <ChatMessage key={i} role={msg.role} text={msg.text} />
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-slate-500 text-xs bg-white border border-slate-200 px-3 py-2 rounded-full w-fit shadow-sm">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                  Đang phân tích...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <ChatInput input={input} isLoading={isLoading} onChange={setInput} onSend={handleSend} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-14 h-14 rounded-full grid place-items-center text-white transition-colors ${
          isOpen
            ? 'bg-slate-900'
            : 'bg-gradient-to-br from-sky-500 to-teal-500'
        }`}
        style={{
          boxShadow: isOpen
            ? '0 8px 24px rgb(15 23 42 / 0.25)'
            : '0 8px 28px rgb(2 132 199 / 0.45)',
        }}
        aria-label={isOpen ? 'Đóng chat' : 'Mở chat AI'}
      >
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-sky-400 animate-ping opacity-20" />
        )}
        {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
      </motion.button>
    </div>
  );
}
