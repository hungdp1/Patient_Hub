import { CreateAppointmentDto, UpdateAppointmentDto, CreateLabResultDto, UpdateLabResultDto, CreateMedicalRecordDto, UpdateMedicalRecordDto, CreatePrescriptionDto, UpdatePrescriptionDto, CreateCreditCardDto, CreatePaymentDto } from '../types/dto';
export interface IDataService {
    createAppointment(userId: string, data: CreateAppointmentDto): Promise<unknown>;
    getAppointments(userId: string, patientId?: string): Promise<unknown[]>;
    updateAppointment(id: string, data: UpdateAppointmentDto): Promise<unknown>;
    getLabResults(patientId?: string): Promise<unknown[]>;
    createLabResult(userId: string, data: CreateLabResultDto): Promise<unknown>;
    updateLabResult(id: string, data: UpdateLabResultDto): Promise<unknown>;
    getMedicalRecords(patientId?: string): Promise<unknown[]>;
    createMedicalRecord(userId: string, data: CreateMedicalRecordDto): Promise<unknown>;
    updateMedicalRecord(id: string, data: UpdateMedicalRecordDto): Promise<unknown>;
    getPrescriptions(patientId?: string): Promise<unknown[]>;
    createPrescription(userId: string, data: CreatePrescriptionDto): Promise<unknown>;
    updatePrescription(id: string, data: UpdatePrescriptionDto): Promise<unknown>;
    getPayments(userId: string): Promise<unknown[]>;
    getHospitalServices(): Promise<unknown[]>;
    getLibraryDiseases(): Promise<unknown[]>;
    getLibraryDrugs(): Promise<unknown[]>;
    getLibraryProcedures(): Promise<unknown[]>;
    getLibraryLabTests(): Promise<unknown[]>;
    getCreditCards(userId: string): Promise<unknown[]>;
    createCreditCard(userId: string, data: CreateCreditCardDto): Promise<unknown>;
    createPayment(userId: string, data: CreatePaymentDto): Promise<unknown>;
    getNotifications(userId: string): Promise<unknown[]>;
    markNotificationAsRead(id: string): Promise<unknown>;
}
export declare class DataService implements IDataService {
    private logAudit;
    createAppointment(userId: string, data: CreateAppointmentDto): Promise<unknown>;
    getAppointments(userId: string, patientId?: string): Promise<unknown[]>;
    updateAppointment(id: string, data: UpdateAppointmentDto): Promise<unknown>;
    getLabResults(patientId?: string): Promise<unknown[]>;
    createLabResult(userId: string, data: CreateLabResultDto): Promise<unknown>;
    updateLabResult(id: string, data: UpdateLabResultDto): Promise<unknown>;
    getMedicalRecords(patientId?: string): Promise<unknown[]>;
    createMedicalRecord(userId: string, data: CreateMedicalRecordDto): Promise<unknown>;
    updateMedicalRecord(id: string, data: UpdateMedicalRecordDto): Promise<unknown>;
    getPrescriptions(patientId?: string): Promise<unknown[]>;
    createPrescription(userId: string, data: CreatePrescriptionDto): Promise<unknown>;
    updatePrescription(id: string, data: UpdatePrescriptionDto): Promise<unknown>;
    getPayments(userId: string): Promise<unknown[]>;
    getHospitalServices(): Promise<unknown[]>;
    getLibraryDiseases(): Promise<unknown[]>;
    getLibraryDrugs(): Promise<unknown[]>;
    getLibraryProcedures(): Promise<unknown[]>;
    getLibraryLabTests(): Promise<unknown[]>;
    getCreditCards(userId: string): Promise<unknown[]>;
    createCreditCard(userId: string, data: CreateCreditCardDto): Promise<unknown>;
    createPayment(userId: string, data: CreatePaymentDto): Promise<unknown>;
    getNotifications(userId: string): Promise<unknown[]>;
    markNotificationAsRead(id: string): Promise<unknown>;
}
export declare const dataService: DataService;
//# sourceMappingURL=DataService.d.ts.map