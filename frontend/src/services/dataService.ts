import { authService } from './authService';

const API_BASE_URL = 'http://localhost:5000/api';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  department: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  testDate: string;
  results: string;
  status: 'pending' | 'completed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  treatment: string;
  prescription?: string;
  recordDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  medications: string;
  dosage: string;
  duration: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  patientId: string;
  amount: number;
  description: string;
  status: 'pending' | 'paid' | 'failed';
  paymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HospitalService {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface LibraryItem {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface CreditCard {
  id: string;
  userId: string;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

const getHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const dataService = {
  // ============ APPOINTMENTS ============
  async createAppointment(data: any): Promise<Appointment> {
    const response = await fetch(`${API_BASE_URL}/data/appointments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create appointment');
    return response.json();
  },

  async getAppointments(patientId?: string): Promise<Appointment[]> {
    const url = new URL(`${API_BASE_URL}/data/appointments`);
    if (patientId) url.searchParams.append('patientId', patientId);
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch appointments');
    return response.json();
  },

  async updateAppointment(id: string, data: any): Promise<Appointment> {
    const response = await fetch(`${API_BASE_URL}/data/appointments/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update appointment');
    return response.json();
  },

  // ============ LAB RESULTS ============
  async getLabResults(patientId?: string): Promise<LabResult[]> {
    const url = new URL(`${API_BASE_URL}/data/lab-results`);
    if (patientId) url.searchParams.append('patientId', patientId);
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch lab results');
    return response.json();
  },

  async createLabResult(data: any): Promise<LabResult> {
    const response = await fetch(`${API_BASE_URL}/data/lab-results`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create lab result');
    return response.json();
  },

  async updateLabResult(id: string, data: any): Promise<LabResult> {
    const response = await fetch(`${API_BASE_URL}/data/lab-results/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update lab result');
    return response.json();
  },

  // ============ MEDICAL RECORDS ============
  async getMedicalRecords(patientId?: string): Promise<MedicalRecord[]> {
    const url = new URL(`${API_BASE_URL}/data/medical-records`);
    if (patientId) url.searchParams.append('patientId', patientId);
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch medical records');
    return response.json();
  },

  async createMedicalRecord(data: any): Promise<MedicalRecord> {
    const response = await fetch(`${API_BASE_URL}/data/medical-records`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create medical record');
    return response.json();
  },

  async updateMedicalRecord(id: string, data: any): Promise<MedicalRecord> {
    const response = await fetch(`${API_BASE_URL}/data/medical-records/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update medical record');
    return response.json();
  },

  // ============ PRESCRIPTIONS ============
  async getPrescriptions(patientId?: string): Promise<Prescription[]> {
    const url = new URL(`${API_BASE_URL}/data/prescriptions`);
    if (patientId) url.searchParams.append('patientId', patientId);
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch prescriptions');
    return response.json();
  },

  async createPrescription(data: any): Promise<Prescription> {
    const response = await fetch(`${API_BASE_URL}/data/prescriptions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create prescription');
    return response.json();
  },

  async updatePrescription(id: string, data: any): Promise<Prescription> {
    const response = await fetch(`${API_BASE_URL}/data/prescriptions/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update prescription');
    return response.json();
  },

  // ============ PAYMENTS ============
  async getPayments(): Promise<Payment[]> {
    const response = await fetch(`${API_BASE_URL}/data/payments`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch payments');
    return response.json();
  },

  async createPayment(data: any): Promise<Payment> {
    const response = await fetch(`${API_BASE_URL}/data/payments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create payment');
    return response.json();
  },

  // ============ HOSPITAL SERVICES ============
  async getHospitalServices(): Promise<HospitalService[]> {
    const response = await fetch(`${API_BASE_URL}/data/services`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch hospital services');
    return response.json();
  },

  // ============ LIBRARY ============
  async getLibraryDiseases(): Promise<LibraryItem[]> {
    const response = await fetch(`${API_BASE_URL}/data/library/diseases`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch diseases');
    return response.json();
  },

  async getLibraryDrugs(): Promise<LibraryItem[]> {
    const response = await fetch(`${API_BASE_URL}/data/library/drugs`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch drugs');
    return response.json();
  },

  async getLibraryProcedures(): Promise<LibraryItem[]> {
    const response = await fetch(`${API_BASE_URL}/data/library/procedures`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch procedures');
    return response.json();
  },

  async getLibraryLabTests(): Promise<LibraryItem[]> {
    const response = await fetch(`${API_BASE_URL}/data/library/lab-tests`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch lab tests');
    return response.json();
  },

  // ============ CREDIT CARDS ============
  async getCreditCards(): Promise<CreditCard[]> {
    const response = await fetch(`${API_BASE_URL}/data/credit-cards`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch credit cards');
    return response.json();
  },

  async createCreditCard(data: any): Promise<CreditCard> {
    const response = await fetch(`${API_BASE_URL}/data/credit-cards`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create credit card');
    return response.json();
  },

  // ============ NOTIFICATIONS ============
  async getNotifications(): Promise<Notification[]> {
    const response = await fetch(`${API_BASE_URL}/data/notifications`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
  },

  async markNotificationAsRead(id: string): Promise<Notification> {
    const response = await fetch(`${API_BASE_URL}/data/notifications/${id}/read`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to mark notification as read');
    return response.json();
  },

  // ============ SERVICES ============
  async getServices(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/data/services`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch services');
    return response.json();
  },

  // ============ ARTICLES ============
  async getArticles(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/data/articles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch articles');
    return response.json();
  },

  // ============ ADMIN (Assumed endpoints) ============
  async getAdminUsers(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async getAdminShifts(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/admin/shifts`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch shifts');
    return response.json();
  },

  async getAdminHistory(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/admin/history`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
  },

  // ============ PATIENT DASHBOARD ============
  async getPatientDashboard(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/user/dashboard`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch patient dashboard');
    return response.json();
  },

  // ============ PENDING INVOICES ============
  async getPendingInvoices(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/data/pending-invoices`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch pending invoices');
    return response.json();
  },
};
