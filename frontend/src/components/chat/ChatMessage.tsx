import { cn } from '../../lib/utils';

interface ChatMessageProps {
  role: 'user' | 'bot';
  text: string;
}

export function ChatMessage({ role, text }: ChatMessageProps) {
  return (
    <div
      className={cn(
        'flex items-end gap-3 max-w-[85%]',
        role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto',
      )}
    >
      <div
        className={cn(
          'p-3 rounded-2xl text-xs leading-relaxed',
          role === 'user'
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-slate-800 text-slate-100 rounded-bl-none border-l-2 border-primary',
        )}
      >
        {text}
      </div>
    </div>
  );
}
