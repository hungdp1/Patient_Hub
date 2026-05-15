const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:5000/api`;

export async function askMedicalAI(prompt: string, context?: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: prompt, context }),
    });

    if (!response.ok) {
      throw new Error('AI service unavailable');
    }

    const data = await response.json();
    return data.response || 'Xin lỗi, tôi không thể trả lời lúc này.';
  } catch (error) {
    console.error('AI Chat Error:', error);
    return 'Xin lỗi, tôi gặp sự cố khi kết nối. Vui lòng thử lại sau.';
  }
}
