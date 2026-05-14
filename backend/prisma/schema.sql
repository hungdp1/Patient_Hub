-- =============== USERS & ROLES ===============
CREATE TABLE "User" (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  phoneNumber VARCHAR(20),
  dateOfBirth DATE,
  gender VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  profilePicture VARCHAR(500),
  role VARCHAR(20) DEFAULT 'PATIENT',
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============== PATIENT DATA ===============
CREATE TABLE "Patient" (
  id SERIAL PRIMARY KEY,
  userId INTEGER UNIQUE NOT NULL,
  bloodType VARCHAR(10),
  allergies TEXT,
  chronicDiseases TEXT,
  emergencyContact VARCHAR(255),
  insuranceId VARCHAR(100),
  insuranceProvider VARCHAR(100),
  nextAppointment TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

-- =============== DOCTOR DATA ===============
CREATE TABLE "Doctor" (
  id SERIAL PRIMARY KEY,
  userId INTEGER UNIQUE NOT NULL,
  specialization VARCHAR(100),
  licenseNumber VARCHAR(100) UNIQUE,
  department VARCHAR(100),
  clinic VARCHAR(255),
  experience INTEGER,
  rating FLOAT DEFAULT 0,
  availableSlots TEXT,
  isAvailable BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

-- =============== APPOINTMENTS ===============
CREATE TABLE "Appointment" (
  id SERIAL PRIMARY KEY,
  patientId INTEGER NOT NULL,
  doctorId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  date TIMESTAMP,
  duration INTEGER,
  status VARCHAR(50) DEFAULT 'PENDING',
  reason TEXT,
  notes TEXT,
  consultationType VARCHAR(50),
  meetingUrl VARCHAR(500),
  cancelReason TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES "Patient"(id) ON DELETE CASCADE,
  FOREIGN KEY (doctorId) REFERENCES "Doctor"(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

-- =============== MEDICAL RECORDS ===============
CREATE TABLE "MedicalRecord" (
  id SERIAL PRIMARY KEY,
  patientId INTEGER NOT NULL,
  doctorId INTEGER NOT NULL,
  appointmentId INTEGER UNIQUE,
  recordType VARCHAR(50),
  diagnosis TEXT,
  symptoms TEXT,
  treatment TEXT,
  notes TEXT,
  attachmentUrl VARCHAR(500),
  recordDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES "Patient"(id) ON DELETE CASCADE,
  FOREIGN KEY (doctorId) REFERENCES "Doctor"(id) ON DELETE CASCADE,
  FOREIGN KEY (appointmentId) REFERENCES "Appointment"(id)
);

-- =============== LAB RESULTS ===============
CREATE TABLE "LabResult" (
  id SERIAL PRIMARY KEY,
  patientId INTEGER NOT NULL,
  doctorId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  testName VARCHAR(255),
  testCode VARCHAR(100),
  status VARCHAR(50),
  resultValue VARCHAR(255),
  resultUnit VARCHAR(50),
  normalRange VARCHAR(100),
  referenceValue VARCHAR(100),
  attachmentUrl VARCHAR(500),
  testDate TIMESTAMP,
  completedDate TIMESTAMP,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES "Patient"(id) ON DELETE CASCADE,
  FOREIGN KEY (doctorId) REFERENCES "Doctor"(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

-- =============== PRESCRIPTIONS ===============
CREATE TABLE "Prescription" (
  id SERIAL PRIMARY KEY,
  patientId INTEGER NOT NULL,
  doctorId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  medicationName VARCHAR(255),
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  duration INTEGER,
  instructions TEXT,
  quantity INTEGER,
  refills INTEGER DEFAULT 0,
  prescriptionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expiryDate TIMESTAMP,
  isActive BOOLEAN DEFAULT true,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES "Patient"(id) ON DELETE CASCADE,
  FOREIGN KEY (doctorId) REFERENCES "Doctor"(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

-- =============== PAYMENTS ===============
CREATE TABLE "Payment" (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL,
  appointmentId INTEGER,
  amount FLOAT,
  currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'PENDING',
  method VARCHAR(50),
  transactionId VARCHAR(255) UNIQUE,
  paymentDate TIMESTAMP,
  description TEXT,
  invoiceUrl VARCHAR(500),
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

-- =============== HOSPITAL SERVICES ===============
CREATE TABLE "HospitalService" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  price FLOAT,
  duration INTEGER,
  availability TEXT,
  imageUrl VARCHAR(500),
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============== MEDICAL LIBRARY ===============
CREATE TABLE "MedicalArticle" (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  content TEXT,
  category VARCHAR(100),
  author VARCHAR(255),
  imageUrl VARCHAR(500),
  tags TEXT,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  isPublished BOOLEAN DEFAULT true,
  publishedDate TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============== NOTIFICATIONS ===============
CREATE TABLE "Notification" (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL,
  title VARCHAR(255),
  message TEXT,
  type VARCHAR(50),
  isRead BOOLEAN DEFAULT false,
  actionUrl VARCHAR(500),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  readAt TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

-- =============== CHAT MESSAGES ===============
CREATE TABLE "ChatMessage" (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL,
  message TEXT,
  response TEXT,
  messageType VARCHAR(50),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

-- =============== INDEXES ===============
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_patient_userId ON "Patient"(userId);
CREATE INDEX idx_doctor_userId ON "Doctor"(userId);
CREATE INDEX idx_appointment_patientId ON "Appointment"(patientId);
CREATE INDEX idx_appointment_doctorId ON "Appointment"(doctorId);
CREATE INDEX idx_appointment_date ON "Appointment"(date);
CREATE INDEX idx_medicalrecord_patientId ON "MedicalRecord"(patientId);
CREATE INDEX idx_labresult_patientId ON "LabResult"(patientId);
CREATE INDEX idx_payment_userId ON "Payment"(userId);
CREATE INDEX idx_notification_userId ON "Notification"(userId);
CREATE INDEX idx_chatmessage_userId ON "ChatMessage"(userId);
