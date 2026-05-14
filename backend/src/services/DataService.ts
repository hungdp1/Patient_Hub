import { ApiError } from '../utils/errorHandler';
import { encryptAES256 } from '../utils/crypto';
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

export interface IDataService {
  createAppointment(userId: string, data: any): Promise<unknown>;
  getAppointments(userId: string, patientId?: string): Promise<unknown[]>;
  updateAppointment(id: string, data: any): Promise<unknown>;
  getLabResults(patientId?: string): Promise<unknown[]>;
  createLabResult(data: any): Promise<unknown>;
  updateLabResult(id: string, data: any): Promise<unknown>;
  getMedicalRecords(patientId?: string): Promise<unknown[]>;
  createMedicalRecord(data: any): Promise<unknown>;
  updateMedicalRecord(id: string, data: any): Promise<unknown>;
  getPrescriptions(patientId?: string): Promise<unknown[]>;
  createPrescription(data: any): Promise<unknown>;
  updatePrescription(id: string, data: any): Promise<unknown>;
  getPayments(userId: string): Promise<unknown[]>;
  getHospitalServices(): Promise<unknown[]>;
  getLibraryDiseases(): Promise<unknown[]>;
  getLibraryDrugs(): Promise<unknown[]>;
  getLibraryProcedures(): Promise<unknown[]>;
  getLibraryLabTests(): Promise<unknown[]>;
  getCreditCards(userId: string): Promise<unknown[]>;
  createCreditCard(userId: string, data: any): Promise<unknown>;
  createPayment(userId: string, data: any): Promise<unknown>;
  getNotifications(userId: string): Promise<unknown[]>;
  markNotificationAsRead(id: string): Promise<unknown>;
}

export class DataService implements IDataService {
  public async createAppointment(userId: string, data: any): Promise<unknown> {
    const appointment = await appointmentRepository.create({
      patientId: data.patientId,
      doctorId: data.doctorId,
      userId,
      date: new Date(data.date),
      reason: data.reason,
      consultationType: data.consultationType,
      status: 'PENDING',
      department: data.department,
      aiDiagnosis: data.aiDiagnosis,
      notes: data.notes,
    });

    await auditRepository.create({
      userId,
      entity: 'Appointment',
      entityId: appointment.id,
      action: 'CREATE',
      description: 'Appointment created',
      resourceAfter: JSON.stringify(appointment),
    });

    return appointment;
  }

  public async getAppointments(userId: string, patientId?: string): Promise<unknown[]> {
    return appointmentRepository.findMany({ patientId, userId });
  }

  public async updateAppointment(id: string, data: any): Promise<unknown> {
    const appointment = await appointmentRepository.update(id, {
      status: data.status,
      notes: data.notes,
    });

    await auditRepository.create({
      userId: appointment.userId,
      entity: 'Appointment',
      entityId: appointment.id,
      action: 'UPDATE',
      description: 'Appointment updated',
      resourceAfter: JSON.stringify(appointment),
    });

    return appointment;
  }

  public async getLabResults(patientId?: string): Promise<unknown[]> {
    return labResultRepository.findMany({ patientId });
  }

  public async createLabResult(data: any): Promise<unknown> {
    const labResult = await labResultRepository.create({
      patientId: data.patientId,
      doctorId: data.doctorId,
      technicianId: data.technicianId,
      medicalRecordId: data.medicalRecordId,
      testName: data.testName,
      testCode: data.testCode,
      status: data.status,
      resultValue: data.resultValue,
      resultUnit: data.resultUnit,
      normalRange: data.normalRange,
      referenceValue: data.referenceValue,
      description: data.description,
      conclusion: data.conclusion,
      attachmentUrl: data.attachmentUrl,
      testDate: data.testDate ? new Date(data.testDate) : new Date(),
      completedDate: data.completedDate ? new Date(data.completedDate) : undefined,
      notes: data.notes,
    });

    await auditRepository.create({
      userId: labResult.doctorId,
      entity: 'LabResult',
      entityId: labResult.id,
      action: 'CREATE',
      description: 'Lab result created',
      resourceAfter: JSON.stringify(labResult),
    });

    return labResult;
  }

  public async updateLabResult(id: string, data: any): Promise<unknown> {
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

    await auditRepository.create({
      userId: labResult.doctorId,
      entity: 'LabResult',
      entityId: labResult.id,
      action: 'UPDATE',
      description: 'Lab result updated',
      resourceAfter: JSON.stringify(labResult),
    });

    return labResult;
  }

  public async getMedicalRecords(patientId?: string): Promise<unknown[]> {
    return medicalRecordRepository.findMany({ patientId });
  }

  public async createMedicalRecord(data: any): Promise<unknown> {
    const record = await medicalRecordRepository.create({
      patientId: data.patientId,
      doctorId: data.doctorId,
      appointmentId: data.appointmentId,
      recordType: data.recordType,
      diagnosis: data.diagnosis,
      symptoms: data.symptoms,
      treatment: data.treatment,
      notes: data.notes,
      attachmentUrl: data.attachmentUrl,
      recordDate: data.recordDate ? new Date(data.recordDate) : new Date(),
      canEditUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });

    await auditRepository.create({
      userId: record.doctorId,
      entity: 'MedicalRecord',
      entityId: record.id,
      action: 'CREATE',
      description: 'Medical record created',
      resourceAfter: JSON.stringify(record),
    });

    return record;
  }

  public async updateMedicalRecord(id: string, data: any): Promise<unknown> {
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

    await auditRepository.create({
      userId: updatedRecord.doctorId,
      entity: 'MedicalRecord',
      entityId: updatedRecord.id,
      action: 'UPDATE',
      description: 'Medical record updated',
      resourceAfter: JSON.stringify(updatedRecord),
    });

    return updatedRecord;
  }

  public async getPrescriptions(patientId?: string): Promise<unknown[]> {
    return prescriptionRepository.findMany({ patientId });
  }

  public async createPrescription(data: any): Promise<unknown> {
    const prescription = await prescriptionRepository.create({
      patientId: data.patientId,
      doctorId: data.doctorId,
      medicalRecordId: data.medicalRecordId,
      medicationName: data.medicationName,
      treatmentType: data.treatmentType,
      dosage: data.dosage,
      frequency: data.frequency,
      duration: data.duration ? Number(data.duration) : undefined,
      quantity: data.quantity ? Number(data.quantity) : undefined,
      instructions: data.instructions,
      refills: data.refills ? Number(data.refills) : undefined,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      notes: data.notes,
      isActive: true,
      prescriptionDate: data.prescriptionDate ? new Date(data.prescriptionDate) : new Date(),
    });

    await auditRepository.create({
      userId: prescription.doctorId,
      entity: 'Prescription',
      entityId: prescription.id,
      action: 'CREATE',
      description: 'Prescription created',
      resourceAfter: JSON.stringify(prescription),
    });

    return prescription;
  }

  public async updatePrescription(id: string, data: any): Promise<unknown> {
    const prescription = await prescriptionRepository.update(id, {
      medicationName: data.medicationName,
      treatmentType: data.treatmentType,
      dosage: data.dosage,
      frequency: data.frequency,
      duration: data.duration ? Number(data.duration) : undefined,
      quantity: data.quantity ? Number(data.quantity) : undefined,
      instructions: data.instructions,
      refills: data.refills ? Number(data.refills) : undefined,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      notes: data.notes,
    });

    await auditRepository.create({
      userId: prescription.doctorId,
      entity: 'Prescription',
      entityId: prescription.id,
      action: 'UPDATE',
      description: 'Prescription updated',
      resourceAfter: JSON.stringify(prescription),
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

  public async createCreditCard(userId: string, data: any): Promise<unknown> {
    const card = await creditCardRepository.create({
      userId,
      cardholderName: encryptAES256(data.cardholderName),
      cardNumber: encryptAES256(data.cardNumber),
      expiryDate: encryptAES256(data.expiryDate),
      cvv: encryptAES256(data.cvv),
      address: data.address ? encryptAES256(data.address) : undefined,
      city: data.city ? encryptAES256(data.city) : undefined,
      postalCode: data.postalCode ? encryptAES256(data.postalCode) : undefined,
      isDefault: Boolean(data.isDefault),
      isEncrypted: true,
    });

    await auditRepository.create({
      userId,
      entity: 'CreditCard',
      entityId: card.id,
      action: 'CREATE',
      description: 'Credit card stored',
    });

    return card;
  }

  public async createPayment(userId: string, data: any): Promise<unknown> {
    const payment = await paymentRepository.create({
      userId,
      appointmentId: data.appointmentId,
      amount: Number(data.amount),
      currency: data.currency || 'USD',
      method: data.method,
      creditCardId: data.creditCardId,
      transactionId: data.transactionId,
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : undefined,
      description: data.description,
      invoiceUrl: data.invoiceUrl,
      notes: data.notes,
      status: 'PENDING',
    });

    await auditRepository.create({
      userId,
      entity: 'Payment',
      entityId: payment.id,
      action: 'CREATE',
      description: 'Payment request created',
      resourceAfter: JSON.stringify(payment),
    });

    return payment;
  }

  public async getNotifications(userId: string): Promise<unknown[]> {
    return notificationRepository.findByUserId(userId);
  }

  public async markNotificationAsRead(id: string): Promise<unknown> {
    return notificationRepository.markAsRead(id);
  }
}

export const dataService = new DataService();
