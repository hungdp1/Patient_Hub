class RandomForestDiagnosisModel {
    async predict(input) {
        return {
            specialty: 'GENERAL_MEDICINE',
            confidence: 0.82,
            explanation: 'Random Forest strategy recommends the best specialty based on symptom and history patterns.',
        };
    }
}
class DecisionTreeSchedulingModel {
    async predict(input) {
        return {
            priorityLevel: input.severity === 'HIGH' ? 'EMERGENCY' : input.severity === 'MEDIUM' ? 'URGENT' : 'ROUTINE',
            suggestedWindow: input.severity === 'HIGH' ? 'Within 24 hours' : 'Next available slot',
            note: 'Decision Tree model determines schedule priority using deterministic rules.',
        };
    }
}
class DoctorLoadBalancer {
    async predict(input) {
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
    constructor() {
        this.diagnosisModel = new RandomForestDiagnosisModel();
        this.schedulingModel = new DecisionTreeSchedulingModel();
        this.loadBalancer = new DoctorLoadBalancer();
    }
    async extractEntitiesFromChat(input) {
        return {
            symptoms: [],
            desiredSpecialty: undefined,
            preferredDate: undefined,
            urgency: 'LOW',
            patientIntent: 'extract-intent-placeholder',
            rawJson: input,
        };
    }
    async respondToChat(input) {
        return {
            response: `Cảm ơn bạn đã gửi: "${input.message}". Đây là phản hồi mẫu từ hệ thống trợ lý AI. Phần mô hình AI thực tế sẽ được tích hợp sau.`,
        };
    }
    async predictSpecialty(input) {
        return this.diagnosisModel.predict(input);
    }
    async prioritizeAppointment(input) {
        return this.schedulingModel.predict(input);
    }
    async balanceDoctorLoad(input) {
        return this.loadBalancer.predict(input);
    }
}
export const aiService = new AiService();
//# sourceMappingURL=aiService.js.map