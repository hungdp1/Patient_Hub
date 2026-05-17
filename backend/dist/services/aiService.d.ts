import { ChatExtractionInput, ChatExtractionResult, DiagnosisInput, DiagnosisResult, SchedulingInput, SchedulingResult, LoadBalanceInput, LoadBalanceResult } from '../models/aiModels';
export interface IAiModel<I, O> {
    predict(input: I): Promise<O>;
}
export declare class AiService {
    private readonly diagnosisModel;
    private readonly schedulingModel;
    private readonly loadBalancer;
    extractEntitiesFromChat(input: ChatExtractionInput): Promise<ChatExtractionResult>;
    respondToChat(input: {
        message: string;
        context?: string;
        userId?: string;
    }): Promise<{
        response: string;
    }>;
    predictSpecialty(input: DiagnosisInput): Promise<DiagnosisResult>;
    prioritizeAppointment(input: SchedulingInput): Promise<SchedulingResult>;
    balanceDoctorLoad(input: LoadBalanceInput): Promise<LoadBalanceResult>;
}
export declare const aiService: AiService;
//# sourceMappingURL=aiService.d.ts.map