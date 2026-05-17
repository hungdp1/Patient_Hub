import { CreateAppointmentDto, UpdateAppointmentDto, CreateLabResultDto, UpdateLabResultDto, CreateMedicalRecordDto, UpdateMedicalRecordDto, CreatePrescriptionDto, UpdatePrescriptionDto, CreateCreditCardDto, CreatePaymentDto } from '../types/dto';
export declare class ValidationError extends Error {
    constructor(message: string);
}
export declare const validateCreateAppointment: (data: any) => CreateAppointmentDto;
export declare const validateUpdateAppointment: (data: any) => UpdateAppointmentDto;
export declare const validateCreateLabResult: (data: any) => CreateLabResultDto;
export declare const validateUpdateLabResult: (data: any) => UpdateLabResultDto;
export declare const validateCreateMedicalRecord: (data: any) => CreateMedicalRecordDto;
export declare const validateUpdateMedicalRecord: (data: any) => UpdateMedicalRecordDto;
export declare const validateCreatePrescription: (data: any) => CreatePrescriptionDto;
export declare const validateUpdatePrescription: (data: any) => UpdatePrescriptionDto;
export declare const validateCreateCreditCard: (data: any) => CreateCreditCardDto;
export declare const validateCreatePayment: (data: any) => CreatePaymentDto;
//# sourceMappingURL=validation.d.ts.map