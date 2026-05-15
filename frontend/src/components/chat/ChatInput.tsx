import { Send } from 'lucide-react';

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onChange: (value: string) => void;
  onSend: (event: React.FormEvent) => void;
}

export function ChatInput({ input, isLoading, onChange, onSend }: ChatInputProps) {
  return (
    <form onSubmit={onSend} className="p-4 bg-slate-800 border-t border-white/5 flex gap-2">
      <input
        type="text"
        placeholder="Hỏi tôi bất cứ điều gì..."
        className="flex-1 px-4 py-3 bg-slate-900/50 rounded-xl outline-none border border-transparent focus:border-primary/50 text-xs text-white placeholder:text-slate-500"
        value={input}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="submit"
        disabled={isLoading}
        className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all font-bold"
      >
        <Send size={16} />
      </button>
    </form>
  );
}
