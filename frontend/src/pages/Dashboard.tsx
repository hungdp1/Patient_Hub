import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles,
  User,
  Bot,
  Plus,
  MessageSquare,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';
import { chatService, type ChatSession, type Message, getGeminiResponse } from '../services/chatService';
import { useLanguage } from '../contexts/LanguageContext';

export default function Dashboard() {
  const { t } = useLanguage();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const history = chatService.getHistory();
    setSessions(history);
    if (history.length > 0) {
      handleSelectSession(history[0].id);
    } else {
      createNewSession();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createNewSession = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: t('new_chat'),
      timestamp: Date.now(),
      messages: []
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setMessages([]);
  };

  const handleSelectSession = (id: string) => {
    const history = chatService.getHistory();
    const session = history.find(s => s.id === id);
    if (session) {
      setCurrentSessionId(id);
      setMessages(session.messages);
    }
  };

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    chatService.deleteSession(id);
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    if (currentSessionId === id) {
      if (updated.length > 0) {
        handleSelectSession(updated[0].id);
      } else {
        createNewSession();
      }
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentInput = input.trim();
    if (!currentInput || isLoading || !currentSessionId) return;

    const userMsg: Message = { role: 'user', content: currentInput };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const responseText = await getGeminiResponse(newMessages);
    const assistantMsg: Message = { role: 'model', content: responseText || 'Lỗi kết nối.' };
    
    const finalMessages = [...newMessages, assistantMsg];
    setMessages(finalMessages);
    setIsLoading(false);

    // Update session
    const history = chatService.getHistory();
    const sessionIdx = history.findIndex(s => s.id === currentSessionId);
    
    const updatedSession: ChatSession = {
      id: currentSessionId,
      title: messages.length === 0 ? currentInput.slice(0, 30) + (currentInput.length > 30 ? '...' : '') : (history[sessionIdx]?.title || t('new_chat')),
      messages: finalMessages,
      timestamp: Date.now()
    };
    
    chatService.saveSession(updatedSession);
    setSessions(chatService.getHistory());
  };

  return (
    <div className="flex bg-slate-50 rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm h-[calc(100vh-140px)] relative transition-all duration-500">
      
      {/* Sidebar: Chat History */}
      <div className={cn(
        "border-r border-slate-200 bg-white flex flex-col shrink-0 transition-all duration-300 relative group hidden sm:flex",
        isSidebarCollapsed ? "w-0 border-none opacity-0" : "w-64 md:w-72"
      )}>
        <div className="p-4 border-b border-slate-100 shrink-0">
            <button 
              onClick={createNewSession}
              className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md active:scale-95"
            >
              {t('new_chat')}
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          <div className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('recent')}</div>
          {sessions.map(session => (
            <div 
              key={session.id}
              onClick={() => handleSelectSession(session.id)}
              className={cn(
                "group flex items-center gap-4 px-5 py-4 rounded-2xl cursor-pointer transition-all",
                currentSessionId === session.id ? "bg-slate-100 text-slate-900 shadow-sm" : "hover:bg-slate-50 text-slate-500"
              )}
            >
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-black truncate leading-tight tracking-tight">{session.title}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{new Date(session.timestamp).toLocaleDateString()}</p>
              </div>
              <button 
                onClick={(e) => handleDeleteSession(e, session.id)}
                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-rose-50 hover:text-rose-500 rounded-lg transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white relative overflow-hidden">
        {/* Sidebar Toggle Button (Visible when collapsed) */}
        {isSidebarCollapsed && (
          <button 
            onClick={() => setIsSidebarCollapsed(false)}
            className="absolute left-6 top-8 z-20 w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm"
          >
            <ChevronRight size={20} />
          </button>
        )}
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="grow flex flex-col items-center justify-center text-center space-y-4 max-w-lg mx-auto h-full">
              <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-[2.5rem] flex items-center justify-center border border-slate-100 shadow-inner">
                 AI
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{t('ai_assistant')}</h3>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">{t('input_placeholder')}</p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div key={idx} className={cn(
                  "flex gap-4 md:gap-6",
                  msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}>
                  <div className={cn(
                    "w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                    msg.role === 'user' ? "bg-slate-800 text-white" : "bg-primary text-slate-800"
                  )}>
                    {msg.role === 'user' ? <User size={18} /> : <Sparkles size={18} />}
                  </div>
                  <div className={cn(
                    "max-w-[85%] sm:max-w-[75%] p-4 md:p-6 rounded-3xl text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-slate-100 text-slate-800 rounded-tr-none" 
                      : "bg-white border border-slate-100 text-slate-700 shadow-sm rounded-tl-none ring-1 ring-slate-50"
                  )}>
                    <div className="markdown-body">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4 md:gap-6">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center shrink-0 animate-pulse">
                    <Sparkles size={18} />
                  </div>
                  <div className="bg-slate-50 p-4 rounded-3xl flex items-center px-6">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-primary/50 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                      <div className="w-2 h-2 bg-primary/20 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-6 bg-white border-t border-slate-100 sticky bottom-0">
          <form 
            onSubmit={handleSend}
            className="max-w-4xl mx-auto flex gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-primary/50 focus-within:bg-white transition-all shadow-sm"
          >
            <input 
              type="text"
              placeholder={t('input_placeholder')}
              className="flex-1 px-4 py-3 bg-transparent outline-none text-sm text-slate-800"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}

