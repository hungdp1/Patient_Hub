import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  createAppointment,
  getAppointments,
  updateAppointment,
  getLabResults,
  createLabResult,
  updateLabResult,
  getMedicalRecords,
  createMedicalRecord,
  updateMedicalRecord,
  getPrescriptions,
  createPrescription,
  updatePrescription,
  getPayments,
  getHospitalServices,
  getLibraryDiseases,
  getLibraryDrugs,
  getLibraryProcedures,
  getLibraryLabTests,
  getCreditCards,
  createCreditCard,
  createPayment,
  getNotifications,
  markNotificationAsRead,
} from '../controllers/dataController';

const router = Router();

// Public routes
router.get('/services', getHospitalServices);
router.get('/library/diseases', getLibraryDiseases);
router.get('/library/drugs', getLibraryDrugs);
router.get('/library/procedures', getLibraryProcedures);
router.get('/library/lab-tests', getLibraryLabTests);

// Protected routes
router.use(authMiddleware);

// Appointments
router.post('/appointments', createAppointment);
router.get('/appointments', getAppointments);
router.put('/appointments/:id', updateAppointment);

// Lab Results
router.get('/lab-results', getLabResults);
router.post('/lab-results', createLabResult);
router.put('/lab-results/:id', updateLabResult);

// Medical Records
router.get('/medical-records', getMedicalRecords);
router.post('/medical-records', createMedicalRecord);
router.put('/medical-records/:id', updateMedicalRecord);

// Prescriptions
router.get('/prescriptions', getPrescriptions);
router.post('/prescriptions', createPrescription);
router.put('/prescriptions/:id', updatePrescription);

// Payments
router.get('/payments', getPayments);
router.post('/payments', createPayment);

// Credit cards
router.get('/credit-cards', getCreditCards);
router.post('/credit-cards', createCreditCard);

// Notifications
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationAsRead);

export default router;
