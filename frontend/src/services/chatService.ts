import { askMedicalAI as askMedicalAIBackend } from '../lib/gemini';
import { authService } from './authService';

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
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:5000/api`;

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

/**
 * Ask medical AI - tries backend API first, falls back to Gemini
 */
export async function askMedicalAI(message: string): Promise<string> {
  try {
    // Try backend AI endpoint first
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({ message }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.response || 'Xin lỗi, tôi không thể trả lời lúc này.';
    }
  } catch (error) {
    console.warn('Backend AI API failed, falling back to Gemini:', error);
  }

  // Fallback to Gemini
  try {
    return await askMedicalAIBackend(message);
  } catch (error) {
    console.error('Both AI services failed:', error);
    return 'Xin lỗi, tôi không thể trả lời lúc này. Vui lòng thử lại sau.';
  }
}

/**
 * Extract medical entities from chat message
 */
export async function extractMedicalEntities(message: string) {
  try {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/ai/chat/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({ message }),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to extract medical entities:', error);
  }
  return null;
}

/**
 * Predict diagnosis based on symptoms
 */
export async function predictDiagnosis(symptoms: string[], medicalHistory?: string) {
  try {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/ai/diagnosis/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({ symptoms, medicalHistory }),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to predict diagnosis:', error);
  }
  return null;
}

/**
 * Prioritize appointment scheduling based on urgency
 */
export async function prioritizeAppointmentScheduling(symptoms: string[], severity: 'LOW' | 'MEDIUM' | 'HIGH') {
  try {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/ai/scheduling/prioritize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({ symptoms, severity }),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to prioritize scheduling:', error);
  }
  return null;
}

/**
 * Balance doctor load for appointment assignment
 */
export async function balanceDoctorLoad(doctorWorkloads: Array<{ doctorId: string; doctorName: string; currentCount: number }>) {
  try {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/ai/load-balance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({ doctorWorkloads }),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to balance doctor load:', error);
  }
  return null;
}
