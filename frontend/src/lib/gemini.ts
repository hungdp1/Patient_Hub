import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function askMedicalAI(prompt: string, context?: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Bạn là trợ lý AI y tế thông minh tại bệnh viện Mediflow. 
      Nhiệm vụ của bạn là giải thích các thuật ngữ y học một cách dễ hiểu và tư vấn quy trình bệnh viện.
      Lưu ý: Luôn khuyên bệnh nhân hỏi ý kiến bác sĩ cho các chẩn đoán cụ thể.
      
      Ngữ cảnh lịch sử bệnh án (nếu có): ${context || 'Không có'}
      
      Câu hỏi của bệnh nhân: ${prompt}`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Xin lỗi, tôi gặp sự cố khi kết nối. Vui lòng thử lại sau.";
  }
}
