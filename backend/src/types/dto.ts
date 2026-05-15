export interface CreateAppointmentDto {
  patientId: string;
  doctorId: string;
  date: string;
  reason?: string | null;
  consultationType?: string | null;
  department?: string | null;
  aiDiagnosis?: string | null;
  notes?: string | null;
}

export interface UpdateAppointmentDto {
  status?: string;
  notes?: string;
}

export interface CreateLabResultDto {
  patientId: string;
  doctorId: string;
  technicianId?: string | null;
  medicalRecordId?: string | null;
  testName: string;
  testCode?: string | null;
  status?: string | null;
  resultValue?: string | null;
  resultUnit?: string | null;
  normalRange?: string | null;
  referenceValue?: string | null;
  description?: string | null;
  conclusion?: string | null;
  attachmentUrl?: string | null;
  testDate?: string | null;
  completedDate?: string | null;
  notes?: string | null;
}

export interface UpdateLabResultDto {
  status?: string;
  resultValue?: string;
  resultUnit?: string;
  normalRange?: string;
  referenceValue?: string;
  description?: string;
  conclusion?: string;
  attachmentUrl?: string;
  completedDate?: string;
  notes?: string;
}

export interface CreateMedicalRecordDto {
  patientId: string;
  doctorId: string;
  appointmentId?: string | null;
  recordType: string;
  diagnosis?: string | null;
  symptoms?: string | null;
  treatment?: string | null;
  notes?: string | null;
  attachmentUrl?: string | null;
  recordDate?: string | null;
}

export interface UpdateMedicalRecordDto {
  diagnosis?: string;
  symptoms?: string;
  treatment?: string;
  notes?: string;
}

export interface CreatePrescriptionDto {
  patientId: string;
  doctorId: string;
  medicalRecordId?: string | null;
  medicationName: string;
  treatmentType?: string | null;
  dosage: string;
  frequency: string;
  duration?: number | null;
  quantity?: number | null;
  instructions?: string | null;
  refills?: number | null;
  expiryDate?: string | null;
  notes?: string | null;
  prescriptionDate?: string | null;
}

export interface UpdatePrescriptionDto {
  medicationName?: string;
  treatmentType?: string;
  dosage?: string;
  frequency?: string;
  duration?: number;
  quantity?: number;
  instructions?: string;
  refills?: number;
  expiryDate?: string;
  notes?: string;
}

export interface CreateCreditCardDto {
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  isDefault?: boolean;
}

export interface CreatePaymentDto {
  appointmentId?: string | null;
  amount: number;
  currency?: string | null;
  method?: string | null;
  creditCardId?: string | null;
  transactionId?: string | null;
  paymentDate?: string | null;
  description?: string | null;
  invoiceUrl?: string | null;
  notes?: string | null;
}
