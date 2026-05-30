export interface ChatExtractionInput {
  userId?: string;
  message: string;
  context?: string;
}

export interface ChatExtractionResult {
  symptoms: string[];
  desiredSpecialty?: string;
  preferredDate?: string;
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  patientIntent?: string;
  rawJson?: unknown;
}

export interface DiagnosisInput {
  symptoms: string[];
  age?: number;
  gender?: string;
  medicalHistory?: string;
}

export interface DiagnosisResult {
  specialty: string;
  confidence: number;
  explanation?: string;
}

export interface SchedulingInput {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  age?: number;
  symptoms?: string[];
  medicalHistory?: string;
}

export interface SchedulingResult {
  priorityLevel: 'EMERGENCY' | 'URGENT' | 'ROUTINE' | string;
  suggestedWindow: string;
  note?: string;
}

export interface DoctorWorkload {
  doctorId: string;
  doctorName?: string;
  currentCount: number;
  availableSlots?: string[];
}

export interface LoadBalanceInput {
  specialty: string;
  doctorWorkloads: DoctorWorkload[];
}

export interface LoadBalanceResult {
  selectedDoctorId: string;
  selectedDoctorName?: string;
  reason: string;
}
