import type { FormEvent } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onChange: (value: string) => void;
  onSend: (event: FormEvent) => void;
}

export function ChatInput({ input, isLoading, onChange, onSend }: ChatInputProps) {
  return (
    <form
      onSubmit={onSend}
      className="p-3 bg-white border-t border-slate-200/70 flex gap-2 items-center"
    >
      <input
        type="text"
        placeholder="Hỏi tôi bất cứ điều gì về sức khỏe..."
        className="flex-1 px-4 py-2.5 bg-slate-50 border border-transparent rounded-xl outline-none text-[13px] text-slate-900 placeholder:text-slate-400 transition-all focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
        value={input}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="w-10 h-10 grid place-items-center bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        aria-label="Gửi"
      >
        <Send size={16} />
      </button>
    </form>
  );
}
