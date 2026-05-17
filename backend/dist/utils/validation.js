export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
export const validateCreateAppointment = (data) => {
    if (!data.patientId || !data.doctorId || !data.date) {
        throw new ValidationError('Missing required fields: patientId, doctorId, date');
    }
    return data;
};
export const validateUpdateAppointment = (data) => {
    if (!data.status && !data.notes) {
        throw new ValidationError('At least one field must be provided: status or notes');
    }
    return data;
};
export const validateCreateLabResult = (data) => {
    if (!data.patientId || !data.doctorId || !data.testName) {
        throw new ValidationError('Missing required fields: patientId, doctorId, testName');
    }
    return data;
};
export const validateUpdateLabResult = (data) => {
    if (!data.status && !data.resultValue && !data.description && !data.conclusion) {
        throw new ValidationError('At least one field must be provided for update');
    }
    return data;
};
export const validateCreateMedicalRecord = (data) => {
    if (!data.patientId || !data.doctorId || !data.recordType) {
        throw new ValidationError('Missing required fields: patientId, doctorId, recordType');
    }
    return data;
};
export const validateUpdateMedicalRecord = (data) => {
    if (!data.diagnosis && !data.symptoms && !data.treatment && !data.notes) {
        throw new ValidationError('At least one field must be provided for update');
    }
    return data;
};
export const validateCreatePrescription = (data) => {
    if (!data.patientId || !data.doctorId || !data.medicationName || !data.dosage || !data.frequency) {
        throw new ValidationError('Missing required fields: patientId, doctorId, medicationName, dosage, frequency');
    }
    return data;
};
export const validateUpdatePrescription = (data) => {
    if (!data.medicationName && !data.dosage && !data.frequency && !data.instructions && !data.notes) {
        throw new ValidationError('At least one field must be provided for update');
    }
    return data;
};
export const validateCreateCreditCard = (data) => {
    if (!data.cardholderName || !data.cardNumber || !data.expiryDate || !data.cvv) {
        throw new ValidationError('Missing required fields: cardholderName, cardNumber, expiryDate, cvv');
    }
    return data;
};
export const validateCreatePayment = (data) => {
    if (!data.amount) {
        throw new ValidationError('Missing required field: amount');
    }
    return data;
};
//# sourceMappingURL=validation.js.map