import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/errorHandler';
import { dataService } from '../services/DataService';
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
import {
  validateCreateAppointment,
  validateUpdateAppointment,
  validateCreateLabResult,
  validateUpdateLabResult,
  validateCreateMedicalRecord,
  validateUpdateMedicalRecord,
  validateCreatePrescription,
  validateUpdatePrescription,
  validateCreateCreditCard,
  validateCreatePayment,
} from '../utils/validation';

export const getAdminUsers = asyncHandler(async (_req, res: Response) => {
  const users = await dataService.getAdminUsers();
  res.json(users);
});

export const getAdminShifts = asyncHandler(async (_req, res: Response) => {
  const shifts = await dataService.getAdminShifts();
  res.json(shifts);
});

export const getAdminHistory = asyncHandler(async (_req, res: Response) => {
  const history = await dataService.getAdminHistory();
  res.json(history);
});

export const getArticles = asyncHandler(async (_req, res: Response) => {
  const articles = await dataService.getArticles();
  res.json(articles);
});

export const getPendingInvoices = asyncHandler(async (_req, res: Response) => {
  const invoices = await dataService.getPendingInvoices();
  res.json(invoices);
});

export const getPatientDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const dashboard = await dataService.getPatientDashboard(req.userId!);
  res.json(dashboard);
});




export const createAppointment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = validateCreateAppointment(req.body);
  const appointment = await dataService.createAppointment(req.userId!, data);
  res.status(201).json(appointment);
});

export const getAppointments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { patientId } = req.query as { patientId?: string };
  const appointments = await dataService.getAppointments(req.userId!, patientId);
  res.json(appointments);
});

export const updateAppointment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = validateUpdateAppointment(req.body);
  const appointment = await dataService.updateAppointment(req.params.id, data);
  res.json(appointment);
});


// ============ LAB RESULTS ============
export const getLabResults = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { patientId } = req.query as { patientId?: string };
  const results = await dataService.getLabResults(patientId);
  res.json(results);
});

export const createLabResult = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = validateCreateLabResult(req.body);
  const labResult = await dataService.createLabResult(req.userId!, data);
  res.status(201).json(labResult);
});

export const updateLabResult = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = validateUpdateLabResult(req.body);
  const labResult = await dataService.updateLabResult(req.params.id, data);
  res.json(labResult);
});

// ============ MEDICAL RECORDS ============
export const getMedicalRecords = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { patientId } = req.query as { patientId?: string };
  const records = await dataService.getMedicalRecords(patientId);
  res.json(records);
});

export const createMedicalRecord = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = validateCreateMedicalRecord(req.body);
  const record = await dataService.createMedicalRecord(req.userId!, data);
  res.status(201).json(record);
});

export const updateMedicalRecord = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = validateUpdateMedicalRecord(req.body);
  const record = await dataService.updateMedicalRecord(req.params.id, data);
  res.json(record);
});

// ============ PRESCRIPTIONS ============
export const getPrescriptions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { patientId } = req.query as { patientId?: string };
  const prescriptions = await dataService.getPrescriptions(patientId);
  res.json(prescriptions);
});

export const createPrescription = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = validateCreatePrescription(req.body);
  const prescription = await dataService.createPrescription(req.userId!, data);
  res.status(201).json(prescription);
});

export const updatePrescription = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = validateUpdatePrescription(req.body);
  const prescription = await dataService.updatePrescription(req.params.id, data);
  res.json(prescription);
});


// ============ PAYMENTS ============
export const getPayments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const payments = await dataService.getPayments(req.userId!);
  res.json(payments);
});

// ============ HOSPITAL SERVICES ============
export const getHospitalServices = asyncHandler(async (_req, res: Response) => {
  const services = await dataService.getHospitalServices();
  res.json(services);
});

// ============ MEDICAL LIBRARY ============
export const getLibraryDiseases = asyncHandler(async (_req, res: Response) => {
  const diseases = await dataService.getLibraryDiseases();
  res.json(diseases);
});

export const getLibraryDrugs = asyncHandler(async (_req, res: Response) => {
  const drugs = await dataService.getLibraryDrugs();
  res.json(drugs);
});

export const getLibraryProcedures = asyncHandler(async (_req, res: Response) => {
  const procedures = await dataService.getLibraryProcedures();
  res.json(procedures);
});

export const getLibraryLabTests = asyncHandler(async (_req, res: Response) => {
  const labTests = await dataService.getLibraryLabTests();
  res.json(labTests);
});

// ============ PAYMENTS & CREDIT CARDS ============
export const getCreditCards = asyncHandler(async (req: AuthRequest, res: Response) => {
  const cards = await dataService.getCreditCards(req.userId!);
  res.json(cards);
});

export const createCreditCard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = validateCreateCreditCard(req.body);
  const card = await dataService.createCreditCard(req.userId!, data);
  res.status(201).json(card);
});

export const createPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = validateCreatePayment(req.body);
  const payment = await dataService.createPayment(req.userId!, data);
  res.status(201).json(payment);
});


// ============ NOTIFICATIONS ============
export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notifications = await dataService.getNotifications(req.userId!);
  res.json(notifications);
});

export const markNotificationAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notification = await dataService.markNotificationAsRead(req.params.id);
  res.json(notification);
});
