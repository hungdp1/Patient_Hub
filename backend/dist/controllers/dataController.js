import { asyncHandler } from '../utils/errorHandler';
import { dataService } from '../services/DataService';
import { validateCreateAppointment, validateUpdateAppointment, validateCreateLabResult, validateUpdateLabResult, validateCreateMedicalRecord, validateUpdateMedicalRecord, validateCreatePrescription, validateUpdatePrescription, validateCreateCreditCard, validateCreatePayment, } from '../utils/validation';
export const createAppointment = asyncHandler(async (req, res) => {
    const data = validateCreateAppointment(req.body);
    const appointment = await dataService.createAppointment(req.userId, data);
    res.status(201).json(appointment);
});
export const getAppointments = asyncHandler(async (req, res) => {
    const { patientId } = req.query;
    const appointments = await dataService.getAppointments(req.userId, patientId);
    res.json(appointments);
});
export const updateAppointment = asyncHandler(async (req, res) => {
    const data = validateUpdateAppointment(req.body);
    const appointment = await dataService.updateAppointment(req.params.id, data);
    res.json(appointment);
});
// ============ LAB RESULTS ============
export const getLabResults = asyncHandler(async (req, res) => {
    const { patientId } = req.query;
    const results = await dataService.getLabResults(patientId);
    res.json(results);
});
export const createLabResult = asyncHandler(async (req, res) => {
    const data = validateCreateLabResult(req.body);
    const labResult = await dataService.createLabResult(req.userId, data);
    res.status(201).json(labResult);
});
export const updateLabResult = asyncHandler(async (req, res) => {
    const data = validateUpdateLabResult(req.body);
    const labResult = await dataService.updateLabResult(req.params.id, data);
    res.json(labResult);
});
// ============ MEDICAL RECORDS ============
export const getMedicalRecords = asyncHandler(async (req, res) => {
    const { patientId } = req.query;
    const records = await dataService.getMedicalRecords(patientId);
    res.json(records);
});
export const createMedicalRecord = asyncHandler(async (req, res) => {
    const data = validateCreateMedicalRecord(req.body);
    const record = await dataService.createMedicalRecord(req.userId, data);
    res.status(201).json(record);
});
export const updateMedicalRecord = asyncHandler(async (req, res) => {
    const data = validateUpdateMedicalRecord(req.body);
    const record = await dataService.updateMedicalRecord(req.params.id, data);
    res.json(record);
});
// ============ PRESCRIPTIONS ============
export const getPrescriptions = asyncHandler(async (req, res) => {
    const { patientId } = req.query;
    const prescriptions = await dataService.getPrescriptions(patientId);
    res.json(prescriptions);
});
export const createPrescription = asyncHandler(async (req, res) => {
    const data = validateCreatePrescription(req.body);
    const prescription = await dataService.createPrescription(req.userId, data);
    res.status(201).json(prescription);
});
export const updatePrescription = asyncHandler(async (req, res) => {
    const data = validateUpdatePrescription(req.body);
    const prescription = await dataService.updatePrescription(req.params.id, data);
    res.json(prescription);
});
// ============ PAYMENTS ============
export const getPayments = asyncHandler(async (req, res) => {
    const payments = await dataService.getPayments(req.userId);
    res.json(payments);
});
// ============ HOSPITAL SERVICES ============
export const getHospitalServices = asyncHandler(async (_req, res) => {
    const services = await dataService.getHospitalServices();
    res.json(services);
});
// ============ MEDICAL LIBRARY ============
export const getLibraryDiseases = asyncHandler(async (_req, res) => {
    const diseases = await dataService.getLibraryDiseases();
    res.json(diseases);
});
export const getLibraryDrugs = asyncHandler(async (_req, res) => {
    const drugs = await dataService.getLibraryDrugs();
    res.json(drugs);
});
export const getLibraryProcedures = asyncHandler(async (_req, res) => {
    const procedures = await dataService.getLibraryProcedures();
    res.json(procedures);
});
export const getLibraryLabTests = asyncHandler(async (_req, res) => {
    const labTests = await dataService.getLibraryLabTests();
    res.json(labTests);
});
// ============ PAYMENTS & CREDIT CARDS ============
export const getCreditCards = asyncHandler(async (req, res) => {
    const cards = await dataService.getCreditCards(req.userId);
    res.json(cards);
});
export const createCreditCard = asyncHandler(async (req, res) => {
    const data = validateCreateCreditCard(req.body);
    const card = await dataService.createCreditCard(req.userId, data);
    res.status(201).json(card);
});
export const createPayment = asyncHandler(async (req, res) => {
    const data = validateCreatePayment(req.body);
    const payment = await dataService.createPayment(req.userId, data);
    res.status(201).json(payment);
});
// ============ NOTIFICATIONS ============
export const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await dataService.getNotifications(req.userId);
    res.json(notifications);
});
export const markNotificationAsRead = asyncHandler(async (req, res) => {
    const notification = await dataService.markNotificationAsRead(req.params.id);
    res.json(notification);
});
//# sourceMappingURL=dataController.js.map