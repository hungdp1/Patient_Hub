# Patient Hub - Frontend & Backend API Integration Guide

## 🎯 Overview
Complete API integration between React frontend (port 5173) and Express backend (port 5000) with full CRUD operations for patient management system.

## 📋 API Base URLs

### Development
- **Frontend API Base**: `http://localhost:5000/api`
- **Frontend Dashboard**: `http://localhost:5173`
- **Backend Server**: `http://localhost:5000`

### Configuration Files
- Frontend: `.env.local` (use `VITE_API_BASE_URL`)
- Backend: `.env` (use `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`)

---

## 🔐 Authentication Endpoints

### POST /api/auth/login
**Request:**
```json
{
  "phoneNumber": "0123456789",
  "password": "password123"
}
```
**Response:** 
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "PATIENT"
  }
}
```

### POST /api/auth/register
**Request:**
```json
{
  "phoneNumber": "0123456789",
  "password": "password123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "PATIENT"
}
```
**Response:** Same as login

---

## 👤 User Management Endpoints

### GET /api/user/profile
**Headers:** `Authorization: Bearer {token}`
**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "0123456789",
    "address": "123 Main St",
    "city": "City",
    "country": "Country",
    "role": "PATIENT",
    "patient": {
      "bloodType": "O+",
      "allergies": "Penicillin",
      "chronicDiseases": "None"
    }
  }
}
```

### PUT /api/user/profile
**Headers:** `Authorization: Bearer {token}`
**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "0123456789",
  "address": "456 New St",
  "city": "New City",
  "country": "New Country"
}
```

### GET /api/user/dashboard
**Headers:** `Authorization: Bearer {token}`
**Response:** Patient dashboard with appointments, lab results, and medical records

---

## 📅 Appointment Endpoints

### GET /api/data/appointments
**Headers:** `Authorization: Bearer {token}`
**Query:** `?patientId=optional_patient_id`
**Response:**
```json
[
  {
    "id": "appointment_id",
    "patientId": "patient_id",
    "doctorId": "doctor_id",
    "date": "2024-05-20T14:00:00Z",
    "duration": 30,
    "status": "PENDING",
    "reason": "Checkup",
    "department": "General",
    "notes": "Regular checkup"
  }
]
```

### POST /api/data/appointments
**Headers:** `Authorization: Bearer {token}`
**Request:**
```json
{
  "patientId": "patient_id",
  "doctorId": "doctor_id",
  "date": "2024-05-20T14:00:00Z",
  "reason": "Checkup",
  "consultationType": "ONLINE",
  "department": "General",
  "notes": "Regular checkup"
}
```

### PUT /api/data/appointments/{id}
**Headers:** `Authorization: Bearer {token}`
**Request:**
```json
{
  "status": "CONFIRMED",
  "notes": "Updated notes"
}
```

---

## 🧪 Lab Results Endpoints

### GET /api/data/lab-results
**Query:** `?patientId=optional_patient_id`

### POST /api/data/lab-results
**Request:**
```json
{
  "patientId": "patient_id",
  "doctorId": "doctor_id",
  "testName": "Blood Test",
  "testCode": "BT001",
  "resultValue": "120",
  "resultUnit": "mg/dL",
  "testDate": "2024-05-20",
  "description": "Complete blood work"
}
```

### PUT /api/data/lab-results/{id}
**Request:**
```json
{
  "status": "COMPLETED",
  "conclusion": "Normal results"
}
```

---

## 📝 Medical Records Endpoints

### GET /api/data/medical-records
**Query:** `?patientId=optional_patient_id`

### POST /api/data/medical-records
**Request:**
```json
{
  "patientId": "patient_id",
  "doctorId": "doctor_id",
  "recordType": "CONSULTATION",
  "diagnosis": "Common Cold",
  "symptoms": "Cough, fever",
  "treatment": "Rest and fluids",
  "notes": "Follow-up after 1 week"
}
```

### PUT /api/data/medical-records/{id}
**Request:**
```json
{
  "diagnosis": "Updated diagnosis",
  "symptoms": "Updated symptoms",
  "treatment": "Updated treatment"
}
```

---

## 💊 Prescription Endpoints

### GET /api/data/prescriptions
**Query:** `?patientId=optional_patient_id`

### POST /api/data/prescriptions
**Request:**
```json
{
  "patientId": "patient_id",
  "doctorId": "doctor_id",
  "medicationName": "Aspirin",
  "dosage": "500mg",
  "frequency": "Twice daily",
  "duration": 7,
  "quantity": 14,
  "instructions": "Take with food"
}
```

### PUT /api/data/prescriptions/{id}
**Request:**
```json
{
  "medicationName": "Updated medication",
  "dosage": "250mg",
  "frequency": "Once daily"
}
```

---

## 💳 Payment Endpoints

### GET /api/data/payments
**Headers:** `Authorization: Bearer {token}`

### POST /api/data/payments
**Request:**
```json
{
  "appointmentId": "appointment_id",
  "amount": 150000,
  "currency": "VND",
  "method": "CREDIT_CARD",
  "creditCardId": "card_id",
  "description": "Appointment payment"
}
```

### GET /api/data/credit-cards
**Headers:** `Authorization: Bearer {token}`

### POST /api/data/credit-cards
**Request:**
```json
{
  "cardholderName": "John Doe",
  "cardNumber": "4111111111111111",
  "expiryDate": "12/25",
  "cvv": "123"
}
```

### GET /api/data/pending-invoices
**Headers:** `Authorization: Bearer {token}`

---

## 📚 Library & Services Endpoints

### GET /api/data/library/diseases
Public endpoint - returns available diseases

### GET /api/data/library/drugs
Public endpoint - returns available medications

### GET /api/data/library/procedures
Public endpoint - returns available procedures

### GET /api/data/library/lab-tests
Public endpoint - returns available lab tests

### GET /api/data/services
Public endpoint - returns hospital services

### GET /api/data/articles
Public endpoint - returns medical articles

---

## 🔔 Notification Endpoints

### GET /api/data/notifications
**Headers:** `Authorization: Bearer {token}`

### PUT /api/data/notifications/{id}/read
**Headers:** `Authorization: Bearer {token}`

---

## 👨‍💼 Admin Endpoints

### GET /api/data/admin/users
**Headers:** `Authorization: Bearer {token}` (admin required)

### GET /api/data/admin/shifts
**Headers:** `Authorization: Bearer {token}` (admin required)

### GET /api/data/admin/history
**Headers:** `Authorization: Bearer {token}` (admin required)

---

## 🤖 AI/Chat Endpoints

### POST /api/ai/chat
**Request:**
```json
{
  "message": "I have a headache and fever"
}
```
**Response:**
```json
{
  "response": "Based on your symptoms..."
}
```

### POST /api/ai/chat/extract
**Request:**
```json
{
  "message": "I have chest pain and shortness of breath"
}
```
**Response:** Extracted medical entities and intent

### POST /api/ai/diagnosis/predict
**Request:**
```json
{
  "symptoms": ["headache", "fever"],
  "medicalHistory": "None"
}
```

### POST /api/ai/scheduling/prioritize
**Request:**
```json
{
  "symptoms": ["chest pain"],
  "severity": "HIGH"
}
```
**Response:** Priority level and suggested scheduling window

### POST /api/ai/load-balance
**Request:**
```json
{
  "doctorWorkloads": [
    {"doctorId": "doc1", "doctorName": "Dr. A", "currentCount": 5},
    {"doctorId": "doc2", "doctorName": "Dr. B", "currentCount": 3}
  ]
}
```
**Response:** Selected doctor with lowest workload

---

## 📱 Frontend Services & Usage

### Authentication Service (`src/services/authService.ts`)
```typescript
// Login
const result = await authService.login({
  phoneNumber: "0123456789",
  password: "password123"
});

// Register
const result = await authService.register({
  phoneNumber: "0123456789",
  password: "password123",
  fullName: "John Doe",
  email: "john@example.com",
  dateOfBirth: "1990-01-01",
  gender: "male",
  address: "123 Main St",
  emergencyContact: "0987654321"
});

// Logout
authService.logout();

// Get token
const token = authService.getToken();
```

### Data Service (`src/services/dataService.ts`)
```typescript
// Appointments
await dataService.createAppointment(data);
await dataService.getAppointments();
await dataService.updateAppointment(id, data);

// Lab Results
await dataService.getLabResults();
await dataService.createLabResult(data);

// Medical Records
await dataService.getMedicalRecords();
await dataService.createMedicalRecord(data);

// Prescriptions
await dataService.getPrescriptions();
await dataService.createPrescription(data);

// Payments
await dataService.getPayments();
await dataService.createPayment(data);
await dataService.getPendingInvoices();

// Admin
await dataService.getAdminUsers();
await dataService.getAdminShifts();
await dataService.getAdminHistory();
```

### Chat Service (`src/services/chatService.ts`)
```typescript
// Chat with AI
const response = await askMedicalAI("I have a headache");

// Extract entities
const entities = await extractMedicalEntities("chest pain and fever");

// Predict diagnosis
const diagnosis = await predictDiagnosis(["fever", "cough"]);

// Prioritize scheduling
const priority = await prioritizeAppointmentScheduling(["chest pain"], "HIGH");

// Load balance
const doctor = await balanceDoctorLoad(doctorWorkloads);
```

### User Service (`src/services/userService.ts`)
```typescript
// Get profile
const profile = await userService.getProfile();

// Update profile
const updated = await userService.updateProfile({
  firstName: "Jane",
  address: "789 New St"
});

// Get dashboard
const dashboard = await userService.getDashboard();
```

---

## 🚀 Setup & Deployment

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL 14+
- Git

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your database URL and JWT secret
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
# Update .env.local with VITE_API_BASE_URL
npm run dev
```

### Environment Variables

**Backend (.env):**
```
DATABASE_URL=postgresql://user:password@localhost:5432/patient_hub
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=7d
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your-gemini-key
```

**Frontend (.env.local):**
```
VITE_API_BASE_URL=http://localhost:5000/api
GEMINI_API_KEY=your-gemini-api-key
```

---

## ✅ Testing Endpoints

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Database Check
```bash
curl http://localhost:5000/api/db-check
```

### Login Test
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "0123456789",
    "password": "password123"
  }'
```

---

## 🔗 Related Documentation
- [BACKEND_SETUP.md](./BACKEND_SETUP.md) - Backend installation guide
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database configuration
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Detailed API specs
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide

---

## 📞 Support
For integration issues, check the error logs:
- **Frontend**: Browser console (F12)
- **Backend**: Terminal output or logs/error.log
