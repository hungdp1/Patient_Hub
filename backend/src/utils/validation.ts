import { CreateAppointmentDto, UpdateAppointmentDto, CreateLabResultDto, UpdateLabResultDto, CreateMedicalRecordDto, UpdateMedicalRecordDto, CreatePrescriptionDto, UpdatePrescriptionDto, CreateCreditCardDto, CreatePaymentDto } from '../types/dto';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validateCreateAppointment = (data: any): CreateAppointmentDto => {
  if (!data.patientId || !data.doctorId || !data.date) {
    throw new ValidationError('Missing required fields: patientId, doctorId, date');
  }
  return data as CreateAppointmentDto;
};

export const validateUpdateAppointment = (data: any): UpdateAppointmentDto => {
  if (!data.status && !data.notes) {
    throw new ValidationError('At least one field must be provided: status or notes');
  }
  return data as UpdateAppointmentDto;
};

export const validateCreateLabResult = (data: any): CreateLabResultDto => {
  if (!data.patientId || !data.doctorId || !data.testName) {
    throw new ValidationError('Missing required fields: patientId, doctorId, testName');
  }
  return data as CreateLabResultDto;
};

export const validateUpdateLabResult = (data: any): UpdateLabResultDto => {
  if (!data.status && !data.resultValue && !data.description && !data.conclusion) {
    throw new ValidationError('At least one field must be provided for update');
  }
  return data as UpdateLabResultDto;
};

export const validateCreateMedicalRecord = (data: any): CreateMedicalRecordDto => {
  if (!data.patientId || !data.doctorId || !data.recordType) {
    throw new ValidationError('Missing required fields: patientId, doctorId, recordType');
  }
  return data as CreateMedicalRecordDto;
};

export const validateUpdateMedicalRecord = (data: any): UpdateMedicalRecordDto => {
  if (!data.diagnosis && !data.symptoms && !data.treatment && !data.notes) {
    throw new ValidationError('At least one field must be provided for update');
  }
  return data as UpdateMedicalRecordDto;
};

export const validateCreatePrescription = (data: any): CreatePrescriptionDto => {
  if (!data.patientId || !data.doctorId || !data.medicationName || !data.dosage || !data.frequency) {
    throw new ValidationError('Missing required fields: patientId, doctorId, medicationName, dosage, frequency');
  }
  return data as CreatePrescriptionDto;
};

export const validateUpdatePrescription = (data: any): UpdatePrescriptionDto => {
  if (!data.medicationName && !data.dosage && !data.frequency && !data.instructions && !data.notes) {
    throw new ValidationError('At least one field must be provided for update');
  }
  return data as UpdatePrescriptionDto;
};

export const validateCreateCreditCard = (data: any): CreateCreditCardDto => {
  if (!data.cardholderName || !data.cardNumber || !data.expiryDate || !data.cvv) {
    throw new ValidationError('Missing required fields: cardholderName, cardNumber, expiryDate, cvv');
  }
  return data as CreateCreditCardDto;
};

export const validateCreatePayment = (data: any): CreatePaymentDto => {
  if (!data.amount) {
    throw new ValidationError('Missing required field: amount');
  }
  return data as CreatePaymentDto;
};
