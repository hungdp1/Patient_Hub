export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN',
  TECHNICIAN = 'TECHNICIAN',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
}

export enum ExamStatus {
  COMPLETED = 'COMPLETED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING = 'PENDING',
  WAITING = 'WAITING',
}

export interface MedicalExam {
  id: string;
  name: string;
  room: string;
  status: ExamStatus;
  estimatedDuration: number; // minutes
  currentWaitTime: number; // minutes
  order: number;
  price: number; // New field for payment
}

export interface DiseaseInfo {
  id: string;
  name: string;
  description: string;
  causes: string[];
  treatments: string[];
  estimatedCost: {
    min: number;
    max: number;
  };
  specialists: string[];
}

export interface LabResult {
  name: string;
  value: string;
  unit: string;
  range: string;
  date: string;
  status?: 'NORMAL' | 'HIGH' | 'LOW';
  details?: string;
  image?: string;
}

export interface ImagingResult {
  type: string;
  region: string;
  conclusion: string;
  date: string;
  image: string;
  description: string;
}

export interface MedicalRecord {
  id: string;
  patientName?: string;
  symptoms?: string[];
  date: string;
  createdAt?: string;
  doctor: string;
  diagnosis: string;
  summary?: string;
  billingStatus: 'PAID' | 'UNPAID' | 'PENDING';
  totalCost: number;
  results: {
    blood?: LabResult[];
    stool?: LabResult[];
    urine?: LabResult[];
    imaging?: ImagingResult[];
    cardiovascular?: LabResult[];
    labTests?: LabResult[]; // backward compatibility
    medications: { 
      name: string; 
      dosage: string; // e.g. "1 viên"
      quantity: number; 
      price: number;
      unit: string;
      morning: number;
      noon: number;
      afternoon: number;
      evening: number;
      duration: string;
      instructions: string; // e.g. "Sau ăn 30p"
      purpose?: string;
    }[];
    prescriptionNotes?: string;
    generalUsageInstructions?: string;
  }
}

export type PaymentMethodType = 'CARD' | 'QR_CODE';

export interface PaymentItem {
  id: string;
  name: string;
  price: number;
}

export interface PaymentHistoryItem {
  id: string;
  date: string;
  totalAmount: number;
  method: PaymentMethodType;
  items: PaymentItem[];
  status: 'SUCCESS' | 'FAILED';
}

export interface LibraryItem {
  id: string;
  category: 'DISEASE' | 'TEST' | 'MEDICINE' | 'PROCEDURE';
  title: string;
  description: string;
  content: string;
}

export interface CreditCardDetails {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
  address: string;
  city: string;
  zip: string;
}
