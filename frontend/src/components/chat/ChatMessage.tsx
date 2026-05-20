import { Sparkles, User } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ChatMessageProps {
  role: 'user' | 'bot';
  text: string;
}

export function ChatMessage({ role, text }: ChatMessageProps) {
  const isUser = role === 'user';
  return (
    <div className={cn('flex gap-2 items-end', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className={cn(
          'w-7 h-7 rounded-full grid place-items-center shrink-0 shadow-sm',
          isUser
            ? 'bg-primary text-white'
            : 'bg-gradient-to-br from-sky-100 to-teal-100 text-primary border border-sky-200/60',
        )}
      >
        {isUser ? <User size={13} /> : <Sparkles size={13} />}
      </div>
      <div
        className={cn(
          'max-w-[78%] px-3.5 py-2.5 text-[13px] leading-relaxed',
          isUser
            ? 'bg-primary text-white rounded-2xl rounded-br-md'
            : 'bg-white text-slate-800 rounded-2xl rounded-bl-md border border-slate-200 shadow-sm',
        )}
      >
        {text}
      </div>
    </div>
  );
}
