import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Sparkles, Stethoscope, BookOpen, FolderHeart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { askMedicalAI, getAIConfig } from '../lib/gemini';
import { ChatMessage } from './chat/ChatMessage';
import { ChatInput } from './chat/ChatInput';
import { socketService } from '../services/socketService';

// Surface which tools the model invoked so the user can see "where the
// answer came from" — small pill under the bot message.
const TOOL_PILLS: Record<string, { label: string; tone: string }> = {
  recommendDepartment: { label: 'Phân tích triệu chứng', tone: 'bg-rose-50 text-rose-700 border-rose-200' },
  searchLibrary: { label: 'Tra cứu thư viện', tone: 'bg-sky-50 text-sky-700 border-sky-200' },
  searchServices: { label: 'Dịch vụ BV', tone: 'bg-violet-50 text-violet-700 border-violet-200' },
  getMyAppointments: { label: 'Lịch khám của tôi', tone: 'bg-amber-50 text-amber-700 border-amber-200' },
  getMyLabResults: { label: 'Kết quả XN', tone: 'bg-teal-50 text-teal-700 border-teal-200' },
  getMyPrescriptions: { label: 'Đơn thuốc', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  getMyPendingPayments: { label: 'Hóa đơn chờ', tone: 'bg-orange-50 text-orange-700 border-orange-200' },
};

const QUICK_PROMPTS = [
  { icon: Stethoscope, label: 'Tôi đau bụng sau khi ăn, nên đi khoa nào?' },
  { icon: BookOpen, label: 'Omeprazole là thuốc gì?' },
  { icon: FolderHeart, label: 'Cho tôi xem lịch khám sắp tới' },
];

interface ChatBubble {
  role: 'user' | 'bot';
  text: string;
  toolsUsed?: string[];
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [smartMode, setSmartMode] = useState(true);
  const [messages, setMessages] = useState<ChatBubble[]>([
    {
      role: 'bot',
      text:
        'Xin chào! Tôi là trợ lý AI Mediflow. Tôi có thể: (1) phân tích triệu chứng và đề xuất khoa khám, ' +
        '(2) tra cứu thư viện thuốc/bệnh/dịch vụ, (3) đọc lịch khám - đơn thuốc - hóa đơn của riêng bạn. ' +
        'Bạn cần hỗ trợ gì hôm nay?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getAIConfig().then((c) => setSmartMode(c.smart));
  }, []);

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

  const sendMessage = async (raw: string) => {
    const userMessage = raw.trim();
    if (!userMessage || isLoading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('chat:typing', { userName: 'Bạn', roomId: 'global' });
    }

    const result = await askMedicalAI(userMessage);
    setMessages((prev) => [
      ...prev,
      { role: 'bot', text: result.text, toolsUsed: result.toolsUsed },
    ]);
    setIsLoading(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
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
                      <span className={`w-1.5 h-1.5 rounded-full ${smartMode ? 'bg-emerald-300 animate-pulse' : 'bg-amber-300'}`} />
                      {smartMode ? 'Gemini 2.0 · Sẵn sàng' : 'Chế độ cơ bản (chưa cấu hình Gemini)'}
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
                <div key={i} className="space-y-1.5">
                  <ChatMessage role={msg.role} text={msg.text} />
                  {msg.role === 'bot' && msg.toolsUsed && msg.toolsUsed.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-9">
                      {Array.from(new Set(msg.toolsUsed)).map((t) => {
                        const pill = TOOL_PILLS[t] || { label: t, tone: 'bg-slate-50 text-slate-600 border-slate-200' };
                        return (
                          <span key={t} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${pill.tone}`}>
                            {pill.label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              {/* Quick prompt chips — only on first bot greeting */}
              {messages.length === 1 && !isLoading && (
                <div className="flex flex-col gap-2 pt-1">
                  {QUICK_PROMPTS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q.label)}
                      className="flex items-center gap-2.5 text-left text-xs font-medium text-slate-700 bg-white hover:bg-sky-50 hover:border-sky-200 border border-slate-200 px-3 py-2.5 rounded-2xl transition-colors group"
                    >
                      <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 text-white grid place-items-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                        <q.icon size={14} />
                      </span>
                      <span>{q.label}</span>
                    </button>
                  ))}
                </div>
              )}

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
