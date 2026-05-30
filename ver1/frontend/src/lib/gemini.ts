import { authService } from '../services/authService';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:5000/api`;

export interface AskAIResult {
  text: string;
  toolsUsed: string[];
}

/**
 * Ask the Mediflow AI assistant.
 *
 * Sends the user's message + their JWT to the backend, which runs Gemini
 * function-calling on their behalf. The backend scopes "my data" lookups
 * (appointments, labs, prescriptions, payments) by the JWT's userId — so
 * without a token we can't get personal answers, only general fallback.
 */
export async function askMedicalAI(prompt: string): Promise<AskAIResult> {
  const token = authService.getToken();

  try {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message: prompt }),
    });

    if (response.status === 401) {
      return {
        text: 'Bạn cần đăng nhập để dùng trợ lý AI. Vui lòng đăng nhập lại.',
        toolsUsed: [],
      };
    }

    if (!response.ok) {
      throw new Error('AI service unavailable');
    }

    const data = await response.json();
    return {
      text: data.response || 'Xin lỗi, tôi không thể trả lời lúc này.',
      toolsUsed: Array.isArray(data.toolsUsed) ? data.toolsUsed : [],
    };
  } catch (error) {
    console.error('AI Chat Error:', error);
    return {
      text: 'Xin lỗi, tôi gặp sự cố khi kết nối. Vui lòng thử lại sau.',
      toolsUsed: [],
    };
  }
}

/** Tells the chatbot whether to advertise "smart" vs "fallback" mode. */
export async function getAIConfig(): Promise<{ smart: boolean }> {
  try {
    const r = await fetch(`${API_BASE_URL}/ai/config`);
    if (!r.ok) return { smart: false };
    return r.json();
  } catch {
    return { smart: false };
  }
}
