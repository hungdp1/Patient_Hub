import { GoogleGenAI } from "@google/genai";

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

export const chatService = {
  getHistory(): ChatSession[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveSession(session: ChatSession) {
    const history = this.getHistory();
    const index = history.findIndex(s => s.id === session.id);
    if (index >= 0) {
      history[index] = session;
    } else {
      history.unshift(session);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 50))); // Keep last 50
  },

  deleteSession(id: string) {
    const history = this.getHistory().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }
};

export const getGeminiResponse = async (messages: Message[]) => {
  const ai = new GoogleGenAI({ apiKey: (process.env.GEMINI_API_KEY as string) });
  
  // Format for Gemini SDK: contents: [{ role: 'user', parts: [{ text: '...' }] }]
  const contents = messages.map(m => ({
    role: m.role,
    parts: [{ text: m.content }]
  }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction: `Bạn là Trợ lý Y tế AI chuyên sâu của ứng dụng Mediflow. 
        Bạn có 3 năng lực chính:
        1. Tra cứu thông tin bệnh lý, dược phẩm và thuật ngữ y tế một cách chính xác.
        2. Quản lý và giải thích lịch trình khám bệnh, giúp bệnh nhân biết họ cần đi đâu tiếp theo.
        3. Chẩn đoán bệnh dựa trên triệu chứng: Hãy hỏi thêm câu hỏi để thu hẹp phạm vi, sau đó đưa ra các chẩn đoán có khả năng nhưng LUÔN LUÔN kèm theo cảnh báo y khoa rằng đây chỉ là thông tin tham khảo và họ PHẢI gặp bác sĩ để có kết luận chính xác.

        Hãy trả lời bằng ngôn ngữ mà người dùng đang sử dụng (Việt hoặc Nhật). 
        Phong cách: Chuyên nghiệp, thấu hiểu, ngắn gọn và hữu ích.`,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Xin lỗi, tôi đã gặp sự cố khi kết nối. Vui lòng thử lại sau.";
  }
};
