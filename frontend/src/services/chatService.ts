import { askMedicalAI as askMedicalAIBackend } from '../lib/gemini';

export interface Message {
  role: 'user' | 'model';
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  messages: Message[];
}

const STORAGE_KEY = 'mediflow_chat_history';

export const chatStorageService = {
  getHistory(): ChatSession[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveSession(session: ChatSession) {
    const history = this.getHistory();
    const index = history.findIndex((s) => s.id === session.id);
    if (index >= 0) {
      history[index] = session;
    } else {
      history.unshift(session);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
  },

  deleteSession(id: string) {
    const history = this.getHistory().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  },
};

export async function askMedicalAI(message: string): Promise<string> {
  return askMedicalAIBackend(message);
}
