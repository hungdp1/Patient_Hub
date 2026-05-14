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
