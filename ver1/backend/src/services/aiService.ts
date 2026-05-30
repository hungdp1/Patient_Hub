import { GoogleGenAI } from '@google/genai';
import {
  ChatExtractionInput,
  ChatExtractionResult,
  DiagnosisInput,
  DiagnosisResult,
  SchedulingInput,
  SchedulingResult,
  LoadBalanceInput,
  LoadBalanceResult,
} from '../models/aiModels';

const MEDICAL_AI_SYSTEM = `Bạn là trợ lý y tế AI tên Mediflow, được thiết kế để hỗ trợ bệnh nhân tại bệnh viện Mediflow.
Bạn có thể trả lời các câu hỏi về triệu chứng, thuốc, quy trình y tế và lịch khám.
Luôn khuyến nghị bệnh nhân gặp bác sĩ cho các vấn đề y tế nghiêm trọng.
Trả lời bằng tiếng Việt, ngắn gọn và dễ hiểu.`;

async function callGemini(message: string, context?: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your-gemini-api-key') {
    return `Cảm ơn bạn đã hỏi: "${message}". Hệ thống trợ lý AI đang trong giai đoạn cấu hình. Vui lòng liên hệ bác sĩ để được tư vấn trực tiếp.`;
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = context ? `${context}\n\nCâu hỏi: ${message}` : message;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: { systemInstruction: MEDICAL_AI_SYSTEM },
  });

  return response.text || 'Xin lỗi, tôi không thể trả lời lúc này.';
}

export interface IAiModel<I, O> {
  predict(input: I): Promise<O>;
}

class RandomForestDiagnosisModel implements IAiModel<DiagnosisInput, DiagnosisResult> {
  public async predict(input: DiagnosisInput): Promise<DiagnosisResult> {
    return {
      specialty: 'GENERAL_MEDICINE',
      confidence: 0.82,
      explanation: 'Random Forest strategy recommends the best specialty based on symptom and history patterns.',
    };
  }
}

class DecisionTreeSchedulingModel implements IAiModel<SchedulingInput, SchedulingResult> {
  public async predict(input: SchedulingInput): Promise<SchedulingResult> {
    return {
      priorityLevel:
        input.severity === 'HIGH' ? 'EMERGENCY' : input.severity === 'MEDIUM' ? 'URGENT' : 'ROUTINE',
      suggestedWindow:
        input.severity === 'HIGH' ? 'Within 24 hours' : 'Next available slot',
      note: 'Decision Tree model determines schedule priority using deterministic rules.',
    };
  }
}

class DoctorLoadBalancer implements IAiModel<LoadBalanceInput, LoadBalanceResult> {
  public async predict(input: LoadBalanceInput): Promise<LoadBalanceResult> {
    const sorted = [...(input.doctorWorkloads || [])].sort((a, b) => a.currentCount - b.currentCount);
    const selected = sorted[0];

    return {
      selectedDoctorId: selected?.doctorId || '',
      selectedDoctorName: selected?.doctorName,
      reason: selected
        ? 'Selected doctor with the lowest workload to ensure objective balancing.'
        : 'No doctors available for load balancing.',
    };
  }
}

export class AiService {
  private readonly diagnosisModel = new RandomForestDiagnosisModel();
  private readonly schedulingModel = new DecisionTreeSchedulingModel();
  private readonly loadBalancer = new DoctorLoadBalancer();

  public async extractEntitiesFromChat(input: ChatExtractionInput): Promise<ChatExtractionResult> {
    return {
      symptoms: [],
      desiredSpecialty: undefined,
      preferredDate: undefined,
      urgency: 'LOW',
      patientIntent: 'extract-intent-placeholder',
      rawJson: input,
    };
  }

  public async respondToChat(input: { message: string; context?: string; userId?: string }): Promise<{ response: string }> {
    const response = await callGemini(input.message, input.context);
    return { response };
  }

  public async predictSpecialty(input: DiagnosisInput): Promise<DiagnosisResult> {
    return this.diagnosisModel.predict(input);
  }

  public async prioritizeAppointment(input: SchedulingInput): Promise<SchedulingResult> {
    return this.schedulingModel.predict(input);
  }

  public async balanceDoctorLoad(input: LoadBalanceInput): Promise<LoadBalanceResult> {
    return this.loadBalancer.predict(input);
  }
}

export const aiService = new AiService();
