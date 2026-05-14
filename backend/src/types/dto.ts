export interface CreateAppointmentDto {
  patientId: string;
  doctorId: string;
  date: string;
  reason?: string;
  consultationType?: string;
  department?: string;
  aiDiagnosis?: string;
  notes?: string;
}

export interface UpdateAppointmentDto {
  status?: string;
  notes?: string;
}

export interface CreateLabResultDto {
  patientId: string;
  doctorId: string;
  technicianId?: string;
  medicalRecordId?: string;
  testName: string;
  testCode?: string;
  status?: string;
  resultValue?: string;
  resultUnit?: string;
  normalRange?: string;
  referenceValue?: string;
  description?: string;
  conclusion?: string;
  attachmentUrl?: string;
  testDate?: string;
  completedDate?: string;
  notes?: string;
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
  appointmentId?: string;
  recordType: string;
  diagnosis?: string;
  symptoms?: string;
  treatment?: string;
  notes?: string;
  attachmentUrl?: string;
  recordDate?: string;
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
  medicalRecordId?: string;
  medicationName: string;
  treatmentType?: string;
  dosage: string;
  frequency: string;
  duration?: number;
  quantity?: number;
  instructions?: string;
  refills?: number;
  expiryDate?: string;
  notes?: string;
  prescriptionDate?: string;
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
  address?: string;
  city?: string;
  postalCode?: string;
  isDefault?: boolean;
}

export interface CreatePaymentDto {
  appointmentId?: string;
  amount: number;
  currency?: string;
  method?: string;
  creditCardId?: string;
  transactionId?: string;
  paymentDate?: string;
  description?: string;
  invoiceUrl?: string;
  notes?: string;
}
