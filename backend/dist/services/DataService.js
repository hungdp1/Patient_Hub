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
export class DataService {
    async logAudit(options) {
        await auditRepository.create({
            userId: options.userId,
            entity: options.entity,
            entityId: options.entityId,
            action: options.action,
            description: options.description,
            resourceAfter: options.resourceAfter ? JSON.stringify(options.resourceAfter) : undefined,
        });
    }
    async createAppointment(userId, data) {
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
    async getAppointments(userId, patientId) {
        return appointmentRepository.findMany({ patientId, userId });
    }
    async updateAppointment(id, data) {
        const appointment = await appointmentRepository.update(id, {
            status: data.status,
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
    async getLabResults(patientId) {
        return labResultRepository.findMany({ patientId });
    }
    async createLabResult(userId, data) {
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
    async updateLabResult(id, data) {
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
    async getMedicalRecords(patientId) {
        return medicalRecordRepository.findMany({ patientId });
    }
    async createMedicalRecord(userId, data) {
        const record = await medicalRecordRepository.create({
            patientId: data.patientId,
            doctorId: data.doctorId,
            appointmentId: data.appointmentId || null,
            recordType: data.recordType,
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
    async updateMedicalRecord(id, data) {
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
    async getPrescriptions(patientId) {
        return prescriptionRepository.findMany({ patientId });
    }
    async createPrescription(userId, data) {
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
    async updatePrescription(id, data) {
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
    async getPayments(userId) {
        return paymentRepository.findByUserId(userId);
    }
    async getHospitalServices() {
        return hospitalServiceRepository.findActiveServices();
    }
    async getLibraryDiseases() {
        return libraryRepository.findDiseases();
    }
    async getLibraryDrugs() {
        return libraryRepository.findDrugs();
    }
    async getLibraryProcedures() {
        return libraryRepository.findProcedures();
    }
    async getLibraryLabTests() {
        return libraryRepository.findLabTests();
    }
    async getCreditCards(userId) {
        return creditCardRepository.findByUserId(userId);
    }
    async createCreditCard(userId, data) {
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
    async createPayment(userId, data) {
        const payment = await paymentRepository.create({
            userId,
            appointmentId: data.appointmentId || null,
            amount: Number(data.amount),
            currency: data.currency || 'USD',
            method: data.method ? data.method : null,
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
    async getNotifications(userId) {
        return notificationRepository.findByUserId(userId);
    }
    async markNotificationAsRead(id) {
        return notificationRepository.markAsRead(id);
    }
}
export const dataService = new DataService();
//# sourceMappingURL=DataService.js.map