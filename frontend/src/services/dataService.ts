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
  patientId: string;
  cardNumber: string;
  expiryDate: string;
  cardholderName: string;
  isDefault: boolean;
}

export interface Notification {
  id: string;
  patientId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const dataService = {
  // Appointments
  async createAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/data/appointments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });

    if (!response.ok) {
      throw new Error('Failed to create appointment');
    }

    const data = await response.json();
    return data.appointment;
  },

  async getAppointments(): Promise<Appointment[]> {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/data/appointments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch appointments');
    }

    const data = await response.json();
    return data.appointments;
  },

  async updateAppointment(id: string, updateData: Partial<Appointment>): Promise<Appointment> {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/data/appointments/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error('Failed to update appointment');
    }

    const data = await response.json();
    return data.appointment;
  },

  // Lab Results
  async getLabResults(): Promise<LabResult[]> {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/data/lab-results`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch lab results');
    }

    const data = await response.json();
    return data.labResults;
  },

  async createLabResult(labResultData: Omit<LabResult, 'id' | 'createdAt' | 'updatedAt'>): Promise<LabResult> {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/data/lab-results`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(labResultData),
    });

    if (!response.ok) {
      throw new Error('Failed to create lab result');
    }

    const data = await response.json();
    return data.labResult;
  },

  async updateLabResult(id: string, updateData: Partial<LabResult>): Promise<LabResult> {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/data/lab-results/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error('Failed to update lab result');
    }

    const data = await response.json();
    return data.labResult;
  },

  // Medical Records
  async getMedicalRecords(): Promise<MedicalRecord[]> {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/data/medical-records`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch medical records');
    }

    const data = await response.json();
    return data.medicalRecords;
  },

  async createMedicalRecord(recordData: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MedicalRecord> {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/data/medical-records`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recordData),
    });

    if (!response.ok) {
      throw new Error('Failed to create medical record');
    }

    const data = await response.json();
    return data.medicalRecord;
  },

  async updateMedicalRecord(id: string, updateData: Partial<MedicalRecord>): Promise<MedicalRecord> {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/data/medical-records/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error('Failed to update medical record');
    }

    const data = await response.json();
    return data.medicalRecord;
  },

  // Prescriptions
  async getPrescriptions(): Promise<Prescription[]> {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/data/prescriptions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch prescriptions');
    }

    const data = await response.json();
    return data.prescriptions;
  },

  async createPrescription(prescriptionData: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Prescription> {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/data/prescriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prescriptionData),
    });

    if (!response.ok) {
      throw new Error('Failed to create prescription');
    }

    const data = await response.json();
    return data.prescription;
  },

  async updatePrescription(id: string, updateData: Partial<Prescription>): Promise<Prescription> {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/data/prescriptions/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error('Failed to update prescription');
    }

    const data = await response.json();
    return data.prescription;
  },

  // Payments
  async getPayments(): Promise<Payment[]> {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/data/payments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payments');
    }

    const data = await response.json();
    return data.payments;
  },

  async createPayment(paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/data/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment');
    }

    const data = await response.json();
    return data.payment;
  },

  // Hospital Services (Public)
  async getHospitalServices(): Promise<HospitalService[]> {
    const response = await fetch(`${API_BASE_URL}/data/services`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch hospital services');
    }

    const data = await response.json();
    return data.services;
  },

  // Library (Public)
  async getLibraryDiseases(): Promise<LibraryItem[]> {
    const response = await fetch(`${API_BASE_URL}/data/library/diseases`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch diseases');
    }

    const data = await response.json();
    return data.diseases;
  },

  async getLibraryDrugs(): Promise<LibraryItem[]> {
    const response = await fetch(`${API_BASE_URL}/data/library/drugs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch drugs');
    }

    const data = await response.json();
    return data.drugs;
  },

  async getLibraryProcedures(): Promise<LibraryItem[]> {
    const response = await fetch(`${API_BASE_URL}/data/library/procedures`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch procedures');
    }

    const data = await response.json();
    return data.procedures;
  },

  async getLibraryLabTests(): Promise<LibraryItem[]> {
    const response = await fetch(`${API_BASE_URL}/data/library/lab-tests`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch lab tests');
    }

    const data = await response.json();
    return data.labTests;
  },

  // Credit Cards
  async getCreditCards(): Promise<CreditCard[]> {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/data/credit-cards`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch credit cards');
    }

    const data = await response.json();
    return data.creditCards;
  },

  async createCreditCard(cardData: Omit<CreditCard, 'id'>): Promise<CreditCard> {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/data/credit-cards`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cardData),
    });

    if (!response.ok) {
      throw new Error('Failed to create credit card');
    }

    const data = await response.json();
    return data.creditCard;
  },

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/data/notifications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    const data = await response.json();
    return data.notifications;
  },

  async markNotificationAsRead(id: string): Promise<void> {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/data/notifications/${id}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }
  },
};