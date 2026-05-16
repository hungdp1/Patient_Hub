import { ApiError } from '../utils/errorHandler';
import { encryptAES256 } from '../utils/crypto';
import { AppointmentStatus, PaymentMethod, RecordType } from '@prisma/client';
import { appointmentRepository } from '../repositories/AppointmentRepository';
import { labResultRepository } from '../repositories/LabResultRepository';
import { medicalRecordRepository } from '../repositories/MedicalRecordRepository';
import { prescriptionRepository } from '../repositories/PrescriptionRepository';
import { paymentRepository } from '../repositories/PaymentRepository';
import { creditCardRepository } from '../repositories/CreditCardRepository';
import { hospitalServiceRepository } from '../repositories/HospitalServiceRepository';
import { libraryRepository } from '../repositories/LibraryRepository';
import { notificationRepository } from '../repositories/NotificationRepository';
import { auditRepository } from '../repositories/AuditRepository';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  CreateLabResultDto,
  UpdateLabResultDto,
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  CreatePrescriptionDto,
  UpdatePrescriptionDto,
  CreateCreditCardDto,
  CreatePaymentDto,
} from '../types/dto';

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
  getAdminUsers(): Promise<unknown[]>;
  getAdminShifts(): Promise<unknown[]>;
  getAdminHistory(): Promise<unknown[]>;
  getArticles(): Promise<unknown[]>;
  getPendingInvoices(): Promise<unknown[]>;
  getPatientDashboard(userId: string): Promise<unknown>;
}

export class DataService implements IDataService {
  private async logAudit(options: {
    userId: string;
    entity: string;
    entityId: string;
    action: string;
    description: string;
    resourceAfter?: unknown;
  }): Promise<void> {
    await auditRepository.create({
      userId: options.userId,
      entity: options.entity,
      entityId: options.entityId,
      action: options.action,
      description: options.description,
      resourceAfter: options.resourceAfter ? JSON.stringify(options.resourceAfter) : undefined,
    });
  }

  public async createAppointment(userId: string, data: CreateAppointmentDto): Promise<unknown> {
    const appointment = await appointmentRepository.create({
      patientId: data.patientId,
      doctorId: data.doctorId,
      userId,
      date: new Date(data.date),
      duration: null,
      status: 'PENDING',
      reason: data.reason || null,
      symptoms: null,
      consultationType: data.consultationType || null,
      department: data.department || null,
      aiDiagnosis: data.aiDiagnosis || null,
      meetingUrl: null,
      cancelReason: null,
      notes: data.notes || null,
    });

    await this.logAudit({
      userId,
      entity: 'Appointment',
      entityId: appointment.id,
      action: 'CREATE',
      description: 'Appointment created',
      resourceAfter: appointment,
    });

    return appointment;
  }

  public async getAppointments(userId: string, patientId?: string): Promise<unknown[]> {
    return appointmentRepository.findMany({ patientId, userId });
  }

  public async updateAppointment(id: string, data: UpdateAppointmentDto): Promise<unknown> {
    const appointment = await appointmentRepository.update(id, {
      status: data.status as AppointmentStatus | undefined,
      notes: data.notes ?? null,
    });

    await this.logAudit({
      userId: appointment.userId,
      entity: 'Appointment',
      entityId: appointment.id,
      action: 'UPDATE',
      description: 'Appointment updated',
      resourceAfter: appointment,
    });

    return appointment;
  }

  public async getLabResults(patientId?: string): Promise<unknown[]> {
    return labResultRepository.findMany({ patientId });
  }

  public async createLabResult(userId: string, data: CreateLabResultDto): Promise<unknown> {
    const labResult = await labResultRepository.create({
      patientId: data.patientId,
      doctorId: data.doctorId,
      technicianId: data.technicianId || null,
      medicalRecordId: data.medicalRecordId || null,
      testName: data.testName,
      testCode: data.testCode || null,
      status: data.status || null,
      resultValue: data.resultValue || null,
      resultUnit: data.resultUnit || null,
      normalRange: data.normalRange || null,
      referenceValue: data.referenceValue || null,
      description: data.description || null,
      conclusion: data.conclusion || null,
      attachmentUrl: data.attachmentUrl || null,
      testDate: data.testDate ? new Date(data.testDate) : new Date(),
      completedDate: data.completedDate ? new Date(data.completedDate) : null,
      notes: data.notes || null,
    });

    await this.logAudit({
      userId,
      entity: 'LabResult',
      entityId: labResult.id,
      action: 'CREATE',
      description: 'Lab result created',
      resourceAfter: labResult,
    });

    return labResult;
  }

  public async updateLabResult(id: string, data: UpdateLabResultDto): Promise<unknown> {
    const labResult = await labResultRepository.update(id, {
      status: data.status,
      resultValue: data.resultValue,
      resultUnit: data.resultUnit,
      normalRange: data.normalRange,
      referenceValue: data.referenceValue,
      description: data.description,
      conclusion: data.conclusion,
      attachmentUrl: data.attachmentUrl,
      completedDate: data.completedDate ? new Date(data.completedDate) : undefined,
      notes: data.notes,
    });

    await this.logAudit({
      userId: labResult.doctorId,
      entity: 'LabResult',
      entityId: labResult.id,
      action: 'UPDATE',
      description: 'Lab result updated',
      resourceAfter: labResult,
    });

    return labResult;
  }

  public async getMedicalRecords(patientId?: string): Promise<unknown[]> {
    return medicalRecordRepository.findMany({ patientId });
  }

  public async createMedicalRecord(userId: string, data: CreateMedicalRecordDto): Promise<unknown> {
    const record = await medicalRecordRepository.create({
      patientId: data.patientId,
      doctorId: data.doctorId,
      appointmentId: data.appointmentId || null,
      recordType: data.recordType as RecordType,
      diagnosis: data.diagnosis || null,
      symptoms: data.symptoms || null,
      treatment: data.treatment || null,
      notes: data.notes || null,
      attachmentUrl: data.attachmentUrl || null,
      recordDate: data.recordDate ? new Date(data.recordDate) : new Date(),
      canEditUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });

    await this.logAudit({
      userId,
      entity: 'MedicalRecord',
      entityId: record.id,
      action: 'CREATE',
      description: 'Medical record created',
      resourceAfter: record,
    });

    return record;
  }

  public async updateMedicalRecord(id: string, data: UpdateMedicalRecordDto): Promise<unknown> {
    const existingRecord = await medicalRecordRepository.findById(id);
    if (!existingRecord) {
      throw new ApiError(404, 'Medical record not found');
    }

    if (existingRecord.canEditUntil && new Date() > existingRecord.canEditUntil) {
      throw new ApiError(403, 'Medical record can no longer be edited');
    }

    const updatedRecord = await medicalRecordRepository.update(id, {
      diagnosis: data.diagnosis,
      symptoms: data.symptoms,
      treatment: data.treatment,
      notes: data.notes,
    });

    await this.logAudit({
      userId: updatedRecord.doctorId,
      entity: 'MedicalRecord',
      entityId: updatedRecord.id,
      action: 'UPDATE',
      description: 'Medical record updated',
      resourceAfter: updatedRecord,
    });

    return updatedRecord;
  }

  public async getPrescriptions(patientId?: string): Promise<unknown[]> {
    return prescriptionRepository.findMany({ patientId });
  }

  public async createPrescription(userId: string, data: CreatePrescriptionDto): Promise<unknown> {
    const prescription = await prescriptionRepository.create({
      patientId: data.patientId,
      doctorId: data.doctorId,
      medicalRecordId: data.medicalRecordId || null,
      medicationName: data.medicationName,
      treatmentType: data.treatmentType || null,
      dosage: data.dosage,
      frequency: data.frequency,
      duration: data.duration || null,
      quantity: data.quantity || null,
      instructions: data.instructions || null,
      refills: data.refills || null,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      notes: data.notes || null,
      isActive: true,
      prescriptionDate: data.prescriptionDate ? new Date(data.prescriptionDate) : new Date(),
    });

    await this.logAudit({
      userId,
      entity: 'Prescription',
      entityId: prescription.id,
      action: 'CREATE',
      description: 'Prescription created',
      resourceAfter: prescription,
    });

    return prescription;
  }

  public async updatePrescription(id: string, data: UpdatePrescriptionDto): Promise<unknown> {
    const prescription = await prescriptionRepository.update(id, {
      medicationName: data.medicationName || undefined,
      treatmentType: data.treatmentType || undefined,
      dosage: data.dosage || undefined,
      frequency: data.frequency || undefined,
      duration: data.duration ? Number(data.duration) : undefined,
      quantity: data.quantity ? Number(data.quantity) : undefined,
      instructions: data.instructions || undefined,
      refills: data.refills ? Number(data.refills) : undefined,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      notes: data.notes,
    });

    await this.logAudit({
      userId: prescription.doctorId,
      entity: 'Prescription',
      entityId: prescription.id,
      action: 'UPDATE',
      description: 'Prescription updated',
      resourceAfter: prescription,
    });

    return prescription;
  }

  public async getPayments(userId: string): Promise<unknown[]> {
    return paymentRepository.findByUserId(userId);
  }

  public async getHospitalServices(): Promise<unknown[]> {
    return hospitalServiceRepository.findActiveServices();
  }

  public async getLibraryDiseases(): Promise<unknown[]> {
    return libraryRepository.findDiseases();
  }

  public async getLibraryDrugs(): Promise<unknown[]> {
    return libraryRepository.findDrugs();
  }

  public async getLibraryProcedures(): Promise<unknown[]> {
    return libraryRepository.findProcedures();
  }

  public async getLibraryLabTests(): Promise<unknown[]> {
    return libraryRepository.findLabTests();
  }

  public async getCreditCards(userId: string): Promise<unknown[]> {
    return creditCardRepository.findByUserId(userId);
  }

  public async createCreditCard(userId: string, data: CreateCreditCardDto): Promise<unknown> {
    const card = await creditCardRepository.create({
      userId,
      cardholderName: encryptAES256(data.cardholderName),
      cardNumber: encryptAES256(data.cardNumber),
      expiryDate: encryptAES256(data.expiryDate),
      cvv: encryptAES256(data.cvv),
      address: data.address ? encryptAES256(data.address) : null,
      city: data.city ? encryptAES256(data.city) : null,
      postalCode: data.postalCode ? encryptAES256(data.postalCode) : null,
      isDefault: Boolean(data.isDefault),
      isEncrypted: true,
    });

    await this.logAudit({
      userId,
      entity: 'CreditCard',
      entityId: card.id,
      action: 'CREATE',
      description: 'Credit card stored',
      resourceAfter: card,
    });

    return card;
  }

  public async createPayment(userId: string, data: CreatePaymentDto): Promise<unknown> {
    const payment = await paymentRepository.create({
      userId,
      appointmentId: data.appointmentId || null,
      amount: Number(data.amount),
      currency: data.currency || 'USD',
      method: data.method ? (data.method as PaymentMethod) : null,
      creditCardId: data.creditCardId || null,
      transactionId: data.transactionId || null,
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : null,
      description: data.description || null,
      invoiceUrl: data.invoiceUrl || null,
      notes: data.notes || null,
      status: 'PENDING',
    });

    await this.logAudit({
      userId,
      entity: 'Payment',
      entityId: payment.id,
      action: 'CREATE',
      description: 'Payment request created',
      resourceAfter: payment,
    });

    return payment;
  }

  public async getNotifications(userId: string): Promise<unknown[]> {
    return notificationRepository.findByUserId(userId);
  }

  public async markNotificationAsRead(id: string): Promise<unknown> {
    return notificationRepository.markAsRead(id);
  }

  public async getAdminUsers(): Promise<unknown[]> {
    const { userRepository } = await import('../repositories/UserRepository');
    return userRepository.findManyAll();
  }

  public async getAdminShifts(): Promise<unknown[]> {
    return appointmentRepository.findAll();
  }

  public async getAdminHistory(): Promise<unknown[]> {
    return auditRepository.findAll();
  }

  public async getArticles(): Promise<unknown[]> {
    const diseases = await libraryRepository.findDiseases() as any[];
    const drugs = await libraryRepository.findDrugs() as any[];
    const procedures = await libraryRepository.findProcedures() as any[];
    const labTests = await libraryRepository.findLabTests() as any[];
    
    return [
      ...diseases.map(d => ({ ...d, category: 'DISEASE' })),
      ...drugs.map(d => ({ ...d, category: 'MEDICINE' })),
      ...procedures.map(d => ({ ...d, category: 'PROCEDURE' })),
      ...labTests.map(d => ({ ...d, category: 'TEST' })),
    ];
  }

  public async getPendingInvoices(): Promise<unknown[]> {
    return paymentRepository.findPendingInvoices();
  }

  public async getPatientDashboard(userId: string): Promise<unknown> {
    const { userRepository } = await import('../repositories/UserRepository');
    return userRepository.getPatientDashboard(userId);
  }
}

export const dataService = new DataService();
