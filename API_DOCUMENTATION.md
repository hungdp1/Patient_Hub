# 📚 Patient Hub API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Sử dụng JWT token trong header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### POST `/auth/login`
Đăng nhập tài khoản

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "PATIENT"
  }
}
```

### POST `/auth/register`
Đăng ký tài khoản mới

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "PATIENT"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "newuser123",
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "PATIENT"
  }
}
```

---

## 👤 User Endpoints

### GET `/user/profile`
Lấy thông tin hồ sơ người dùng

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "user123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+84123456789",
  "dateOfBirth": "1990-01-15",
  "gender": "MALE",
  "address": "123 Street",
  "city": "Ho Chi Minh",
  "country": "Vietnam",
  "role": "PATIENT",
  "patient": {
    "id": "patient123",
    "bloodType": "O+",
    "allergies": "Penicillin",
    "chronicDiseases": "None"
  }
}
```

### PUT `/user/profile`
Cập nhật thông tin hồ sơ

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+84123456789",
  "address": "456 New Street",
  "city": "Ho Chi Minh",
  "country": "Vietnam"
}
```

**Response:**
```json
{
  "id": "user123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+84123456789",
  "address": "456 New Street",
  ...
}
```

### GET `/user/dashboard`
Lấy thông tin bảng điều khiển bệnh nhân

**Response:**
```json
{
  "id": "patient123",
  "userId": "user123",
  "bloodType": "O+",
  "allergies": "Penicillin",
  "appointments": [
    {
      "id": "appt1",
      "date": "2024-05-20T10:00:00Z",
      "status": "CONFIRMED",
      "reason": "General checkup"
    }
  ],
  "labResults": [
    {
      "id": "lab1",
      "testName": "Blood Test",
      "status": "COMPLETED",
      "resultValue": "120"
    }
  ],
  "prescriptions": [
    {
      "id": "presc1",
      "medicationName": "Aspirin",
      "dosage": "100mg",
      "frequency": "Once daily"
    }
  ]
}
```

---

## 📅 Appointment Endpoints

### POST `/data/appointments`
Tạo lịch khám mới

**Request:**
```json
{
  "patientId": "patient123",
  "doctorId": "doctor456",
  "date": "2024-05-20T10:00:00Z",
  "reason": "General checkup",
  "consultationType": "IN_PERSON"
}
```

**Response:**
```json
{
  "id": "appt123",
  "patientId": "patient123",
  "doctorId": "doctor456",
  "date": "2024-05-20T10:00:00Z",
  "status": "PENDING",
  "reason": "General checkup",
  "consultationType": "IN_PERSON",
  "createdAt": "2024-05-15T14:30:00Z"
}
```

### GET `/data/appointments`
Danh sách lịch khám

**Query Parameters:**
- `patientId` (optional) - Lọc theo bệnh nhân

**Response:**
```json
[
  {
    "id": "appt123",
    "date": "2024-05-20T10:00:00Z",
    "status": "CONFIRMED",
    "reason": "General checkup",
    "doctor": {
      "user": {
        "firstName": "Dr.",
        "lastName": "Smith"
      },
      "specialization": "General Practice"
    }
  }
]
```

### PUT `/data/appointments/:id`
Cập nhật lịch khám

**Request:**
```json
{
  "status": "CANCELLED",
  "notes": "Patient requested cancellation"
}
```

---

## 🧪 Lab Results Endpoints

### GET `/data/lab-results`
Danh sách kết quả xét nghiệm

**Query Parameters:**
- `patientId` (optional) - Lọc theo bệnh nhân

**Response:**
```json
[
  {
    "id": "lab123",
    "testName": "Blood Test",
    "testCode": "CBC",
    "status": "COMPLETED",
    "resultValue": "120",
    "resultUnit": "mg/dL",
    "normalRange": "70-100",
    "testDate": "2024-05-10T09:00:00Z",
    "completedDate": "2024-05-11T14:30:00Z"
  }
]
```

---

## 📋 Medical Records Endpoints

### GET `/data/medical-records`
Danh sách hồ sơ bệnh án

**Query Parameters:**
- `patientId` (optional) - Lọc theo bệnh nhân

**Response:**
```json
[
  {
    "id": "record123",
    "recordType": "GENERAL_CHECKUP",
    "diagnosis": "Hypertension",
    "symptoms": "High blood pressure",
    "treatment": "Prescribed medication",
    "recordDate": "2024-05-10T10:00:00Z",
    "doctor": {
      "user": {
        "firstName": "Dr.",
        "lastName": "Smith"
      }
    }
  }
]
```

---

## 💊 Prescription Endpoints

### GET `/data/prescriptions`
Danh sách đơn thuốc

**Response:**
```json
[
  {
    "id": "presc123",
    "medicationName": "Aspirin",
    "dosage": "100mg",
    "frequency": "Once daily",
    "duration": 30,
    "instructions": "Take with food",
    "isActive": true,
    "doctor": {
      "user": {
        "firstName": "Dr.",
        "lastName": "Smith"
      }
    }
  }
]
```

---

## 💳 Payment Endpoints

### GET `/data/payments`
Lịch sử thanh toán

**Response:**
```json
[
  {
    "id": "payment123",
    "amount": 150.00,
    "currency": "USD",
    "status": "COMPLETED",
    "method": "CREDIT_CARD",
    "transactionId": "txn_123456",
    "paymentDate": "2024-05-10T14:30:00Z",
    "description": "Consultation fee"
  }
]
```

---

## 🏥 Hospital Services (Public)

### GET `/data/services`
Danh sách dịch vụ bệnh viện (không cần token)

**Response:**
```json
[
  {
    "id": "service1",
    "name": "Emergency Care",
    "category": "Emergency",
    "price": 500.00,
    "duration": 60,
    "description": "24/7 emergency medical care",
    "isActive": true
  }
]
```

---

## 📚 Medical Articles (Public)

### GET `/data/articles`
Danh sách bài viết y tế (không cần token)

**Query Parameters:**
- `category` (optional) - Lọc theo danh mục

**Response:**
```json
[
  {
    "id": "article1",
    "title": "How to manage hypertension",
    "content": "Hypertension is...",
    "category": "Disease",
    "author": "Dr. Johnson",
    "views": 1250,
    "likes": 320,
    "publishedDate": "2024-05-01T08:00:00Z"
  }
]
```

---

## 🔔 Notification Endpoints

### GET `/data/notifications`
Danh sách thông báo

**Response:**
```json
[
  {
    "id": "notif1",
    "title": "Appointment reminder",
    "message": "Your appointment with Dr. Smith is tomorrow at 10:00 AM",
    "type": "APPOINTMENT_REMINDER",
    "isRead": false,
    "createdAt": "2024-05-19T16:00:00Z"
  }
]
```

### PUT `/data/notifications/:id/read`
Đánh dấu thông báo đã đọc

**Response:**
```json
{
  "id": "notif1",
  "title": "Appointment reminder",
  "isRead": true,
  "readAt": "2024-05-19T16:30:00Z"
}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

### 403 Forbidden
```json
{
  "error": "Admin access required"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch data"
}
```

---

## 🔄 User Roles & Permissions

| Endpoint | PATIENT | DOCTOR | ADMIN | TECHNICIAN |
|----------|---------|--------|-------|-----------|
| Login | ✅ | ✅ | ✅ | ✅ |
| Register | ✅ | ✅ | ✅ | ✅ |
| Get Profile | ✅ | ✅ | ✅ | ✅ |
| View Appointments | ✅ | ✅ | ✅ | ✅ |
| Create Appointment | ✅ | ❌ | ✅ | ❌ |
| View Lab Results | ✅ | ✅ | ✅ | ✅ |
| Create Lab Result | ❌ | ✅ | ✅ | ✅ |
| View Medical Records | ✅ | ✅ | ✅ | ✅ |
| Create Medical Record | ❌ | ✅ | ✅ | ❌ |
| View Services | ✅ | ✅ | ✅ | ✅ |
| View Articles | ✅ | ✅ | ✅ | ✅ |

---

## 🧪 Testing with cURL

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer your_jwt_token"
```

### Get Appointments
```bash
curl -X GET http://localhost:5000/api/data/appointments \
  -H "Authorization: Bearer your_jwt_token"
```

### Get Services (Public)
```bash
curl -X GET http://localhost:5000/api/data/services
```

---

## 📌 Notes

- Tất cả endpoints trả về JSON
- Thời gian sử dụng ISO 8601 format
- JWT token có hạn sử dụng (mặc định 7 ngày)
- Cần refresh token mới khi hết hạn
- Database sử dụng transaction cho dữ liệu nhạy cảm
