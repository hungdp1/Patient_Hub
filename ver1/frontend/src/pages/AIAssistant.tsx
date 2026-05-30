/**
 * Full-page AI assistant.
 *
 * The floating Chatbot widget in the bottom-right is great for "quick
 * question while doing something else"; this page is the workspace for
 * an actual conversation — wider message bubbles, persisted history in
 * localStorage, quick-prompt chips, and a sidebar listing past sessions.
 *
 * Same backend (`POST /api/ai/chat`) as the widget — the model is
 * Gemini-with-function-calling when `GEMINI_API_KEY` is set, and a
 * rule-based fallback otherwise. The little status dot in the header
 * tells the user which mode is active.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Send,
  Loader2,
  Stethoscope,
  BookOpen,
  FolderHeart,
  Receipt,
  Pill,
  FlaskConical,
  Plus,
  Trash2,
  MessageSquare,
  Bot,
  User as UserIcon,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

import { askMedicalAI, getAIConfig } from '../lib/gemini';
import { cn } from '../lib/utils';
import { authService } from '../services/authService';

// ─── Types & storage ─────────────────────────────────────

interface ChatBubble {
  role: 'user' | 'bot';
  text: string;
  toolsUsed?: string[];
  timestamp: number;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatBubble[];
  createdAt: number;
}

const STORAGE_KEY = 'mediflow_ai_sessions';

function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, 30)));
  } catch {
    /* localStorage full — silently drop */
  }
}

function newSession(): ChatSession {
  return {
    id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: 'Cuộc trò chuyện mới',
    messages: [],
    createdAt: Date.now(),
  };
}

function deriveTitle(firstUserMessage: string): string {
  const t = firstUserMessage.trim().slice(0, 40);
  return t.length < firstUserMessage.length ? t + '…' : t || 'Cuộc trò chuyện';
}

// ─── Tool pill catalogue (matches backend names) ────────

const TOOL_PILLS: Record<string, { label: string; tone: string; icon: React.ComponentType<{ size?: number }> }> = {
  recommendDepartment: { label: 'Phân tích triệu chứng', tone: 'bg-rose-50 text-rose-700 border-rose-200', icon: Stethoscope },
  searchLibrary: { label: 'Tra cứu thư viện', tone: 'bg-sky-50 text-sky-700 border-sky-200', icon: BookOpen },
  searchServices: { label: 'Dịch vụ bệnh viện', tone: 'bg-violet-50 text-violet-700 border-violet-200', icon: Sparkles },
  getMyAppointments: { label: 'Lịch khám', tone: 'bg-amber-50 text-amber-700 border-amber-200', icon: FolderHeart },
  getMyLabResults: { label: 'Kết quả XN', tone: 'bg-teal-50 text-teal-700 border-teal-200', icon: FlaskConical },
  getMyPrescriptions: { label: 'Đơn thuốc', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Pill },
  getMyPendingPayments: { label: 'Hóa đơn chờ', tone: 'bg-orange-50 text-orange-700 border-orange-200', icon: Receipt },
};

// ─── Quick prompts grouped by capability ────────────────

const QUICK_PROMPTS = [
  {
    group: 'Triệu chứng → Khoa khám',
    icon: Stethoscope,
    tone: 'from-rose-500 to-pink-500',
    items: [
      'Tôi đau bụng vùng thượng vị, ợ chua sau khi ăn — nên đi khoa nào?',
      'Tôi ho khan, sốt cao, sổ mũi — tôi bị gì?',
      'Đau đầu kéo dài, chóng mặt — nên khám khoa nào?',
    ],
  },
  {
    group: 'Tra cứu kiến thức',
    icon: BookOpen,
    tone: 'from-sky-500 to-cyan-500',
    items: [
      'Omeprazole là thuốc gì? Dùng để chữa bệnh nào?',
      'Có dịch vụ siêu âm tim không, giá bao nhiêu?',
      'Xét nghiệm công thức máu CBC để làm gì?',
    ],
  },
  {
    group: 'Dữ liệu của tôi',
    icon: FolderHeart,
    tone: 'from-emerald-500 to-teal-500',
    items: [
      'Cho tôi xem lịch khám sắp tới',
      'Đơn thuốc đang dùng của tôi là gì?',
      'Tôi có hóa đơn nào chưa thanh toán không?',
    ],
  },
];

// ─── Page component ──────────────────────────────────────

export default function AIAssistant() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [smartMode, setSmartMode] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const userData = authService.getUserData();
  const userName = userData
    ? `${userData.firstName ?? ''} ${userData.lastName ?? ''}`.trim() || 'Bạn'
    : 'Bạn';

  // ─── Lifecycle ─────────────────────────────────────
  useEffect(() => {
    const loaded = loadSessions();
    if (loaded.length === 0) {
      const s = newSession();
      setSessions([s]);
      setActiveSessionId(s.id);
    } else {
      setSessions(loaded);
      setActiveSessionId(loaded[0].id);
    }
    getAIConfig().then((c) => setSmartMode(c.smart));
  }, []);

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages.length, isLoading]);

  // ─── Mutators ──────────────────────────────────────
  const updateSession = useCallback((id: string, mutator: (s: ChatSession) => ChatSession) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? mutator(s) : s)));
  }, []);

  const createNewSession = () => {
    const s = newSession();
    setSessions((prev) => [s, ...prev]);
    setActiveSessionId(s.id);
    inputRef.current?.focus();
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      // If we deleted the active one, pick another (or create a fresh one).
      if (id === activeSessionId) {
        if (next.length > 0) setActiveSessionId(next[0].id);
        else {
          const s = newSession();
          setActiveSessionId(s.id);
          return [s];
        }
      }
      return next;
    });
  };

  const sendMessage = async (rawMessage: string) => {
    const msg = rawMessage.trim();
    if (!msg || isLoading || !activeSessionId) return;

    setInput('');
    setIsLoading(true);

    // Optimistic: append user bubble + (if empty) title the session.
    updateSession(activeSessionId, (s) => ({
      ...s,
      title: s.messages.length === 0 ? deriveTitle(msg) : s.title,
      messages: [...s.messages, { role: 'user', text: msg, timestamp: Date.now() }],
    }));

    const result = await askMedicalAI(msg);

    updateSession(activeSessionId, (s) => ({
      ...s,
      messages: [
        ...s.messages,
        { role: 'bot', text: result.text, toolsUsed: result.toolsUsed, timestamp: Date.now() },
      ],
    }));
    setIsLoading(false);
    inputRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const isEmpty = (activeSession?.messages.length ?? 0) === 0;

  // ─── Render ────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-7rem)] -mt-2 grid grid-cols-12 gap-4">
      {/* Sidebar: session list */}
      <aside className="col-span-12 lg:col-span-3 xl:col-span-3 hidden lg:flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <button
            onClick={createNewSession}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 text-white font-semibold text-sm shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 transition-all"
          >
            <Plus size={16} /> Cuộc trò chuyện mới
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {sessions.length === 0 && (
            <p className="text-xs text-slate-400 px-3 py-4 text-center">Chưa có cuộc trò chuyện nào.</p>
          )}
          {sessions.map((s) => {
            const active = s.id === activeSessionId;
            const last = s.messages[s.messages.length - 1];
            return (
              <button
                key={s.id}
                onClick={() => setActiveSessionId(s.id)}
                className={cn(
                  'group w-full text-left p-3 rounded-xl transition-all flex items-start gap-2.5',
                  active ? 'bg-sky-50 border border-sky-200' : 'hover:bg-slate-50 border border-transparent',
                )}
              >
                <MessageSquare
                  size={16}
                  className={cn('shrink-0 mt-0.5', active ? 'text-primary' : 'text-slate-400')}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm font-semibold truncate',
                      active ? 'text-slate-900' : 'text-slate-700',
                    )}
                  >
                    {s.title}
                  </p>
                  {last && (
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {last.role === 'user' ? 'Bạn: ' : ''}
                      {last.text}
                    </p>
                  )}
                </div>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(s.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      deleteSession(s.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer"
                  aria-label="Xóa cuộc trò chuyện"
                >
                  <Trash2 size={13} />
                </span>
              </button>
            );
          })}
        </div>
        <div className="p-4 border-t border-slate-100 text-[10px] text-slate-400 flex items-center gap-1.5">
          <ShieldCheck size={11} /> Dữ liệu lưu cục bộ — không gửi lên cloud
        </div>
      </aside>

      {/* Main chat panel */}
      <main className="col-span-12 lg:col-span-9 xl:col-span-9 flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="relative px-6 py-4 bg-gradient-to-br from-sky-500 to-teal-500 text-white flex items-center justify-between gap-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,white_0%,transparent_60%)] opacity-15" />
          <div className="relative flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md grid place-items-center border border-white/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Trợ lý y tế Mediflow</h1>
              <p className="text-xs text-white/85 flex items-center gap-1.5 mt-0.5">
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    smartMode ? 'bg-emerald-300 animate-pulse' : 'bg-amber-300',
                  )}
                />
                {smartMode ? 'Gemini 2.0 · Sẵn sàng' : 'Chế độ cơ bản (chưa cấu hình Gemini)'}
              </p>
            </div>
          </div>
          <div className="relative hidden sm:flex items-center gap-2 text-[11px] text-white/80">
            <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/15">
              Phân tích triệu chứng
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/15">Tra cứu y khoa</span>
            <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/15">Dữ liệu cá nhân</span>
          </div>
        </div>

        {/* Fallback warning bar */}
        {!smartMode && (
          <div className="px-6 py-3 bg-amber-50/70 border-b border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <p>
              <strong>Chế độ cơ bản đang chạy.</strong> Quản trị viên cần điền{' '}
              <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[11px]">GEMINI_API_KEY</code> trong{' '}
              <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[11px]">.env</code> rồi chạy{' '}
              <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[11px]">
                docker compose up -d backend
              </code>{' '}
              để bật suy luận đầy đủ. Trong lúc đó tôi vẫn trả lời được các câu hỏi về triệu chứng, lịch khám, đơn thuốc, hóa đơn của bạn.
            </p>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/60">
          {isEmpty ? (
            // ─── Empty state: greeting + quick prompts ───
            <div className="px-6 py-8 max-w-3xl mx-auto space-y-8">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-sky-500 to-teal-500 text-white rounded-3xl grid place-items-center shadow-lg shadow-sky-500/25">
                  <Sparkles size={32} />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900">Xin chào, {userName}!</h2>
                <p className="text-slate-500 max-w-lg mx-auto text-sm leading-relaxed">
                  Tôi là trợ lý y tế AI của Mediflow. Hãy chọn một câu hỏi gợi ý phía dưới hoặc gõ vào ô tin nhắn để bắt đầu.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {QUICK_PROMPTS.map((group) => (
                  <div
                    key={group.group}
                    className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          'w-9 h-9 rounded-xl bg-gradient-to-br text-white grid place-items-center shadow-sm',
                          group.tone,
                        )}
                      >
                        <group.icon size={16} />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">{group.group}</h3>
                    </div>
                    <div className="space-y-1.5">
                      {group.items.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(q)}
                          className="block w-full text-left text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-2.5 py-2 rounded-lg transition-colors leading-relaxed"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // ─── Active conversation ───
            <div className="px-6 py-6 max-w-3xl mx-auto space-y-5">
              {activeSession!.messages.map((msg, i) => (
                <Bubble key={i} msg={msg} userName={userName} />
              ))}
              {isLoading && (
                <div className="flex items-center gap-3 text-slate-500 text-sm">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-teal-500 grid place-items-center text-white shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 inline-flex items-center gap-2 text-xs">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                    Đang phân tích...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-slate-200 bg-white px-4 py-3 flex items-end gap-3 max-w-3xl mx-auto w-full"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mô tả triệu chứng, hoặc hỏi về thuốc / lịch khám / hóa đơn của bạn..."
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none rounded-2xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none px-4 py-3 text-sm bg-slate-50/50 placeholder:text-slate-400 max-h-32 transition-all"
            style={{ minHeight: '46px' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={cn(
              'w-12 h-12 rounded-2xl grid place-items-center text-white transition-all shrink-0 shadow-md',
              isLoading || !input.trim()
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-gradient-to-br from-sky-500 to-teal-500 hover:shadow-lg hover:shadow-sky-500/30 hover:scale-105',
            )}
            aria-label="Gửi"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </main>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────

function Bubble({ msg, userName }: { msg: ChatBubble; userName: string }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      <div
        className={cn(
          'w-9 h-9 rounded-full grid place-items-center shrink-0 shadow-sm',
          isUser
            ? 'bg-gradient-to-br from-slate-800 to-slate-700 text-white'
            : 'bg-gradient-to-br from-sky-500 to-teal-500 text-white',
        )}
      >
        {isUser ? <UserIcon size={16} /> : <Bot size={16} />}
      </div>
      <div className={cn('flex-1 max-w-[80%]', isUser ? 'items-end' : 'items-start', 'flex flex-col gap-1.5')}>
        <p className="text-[11px] font-semibold text-slate-400 px-1">{isUser ? userName : 'Mediflow AI'}</p>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
            isUser
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-800 shadow-sm',
          )}
        >
          {msg.text}
        </div>
        {!isUser && msg.toolsUsed && msg.toolsUsed.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {Array.from(new Set(msg.toolsUsed)).map((t) => {
              const pill = TOOL_PILLS[t] || { label: t, tone: 'bg-slate-50 text-slate-600 border-slate-200', icon: Sparkles };
              return (
                <span
                  key={t}
                  className={cn(
                    'inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-full border',
                    pill.tone,
                  )}
                >
                  <pill.icon size={10} /> {pill.label}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
