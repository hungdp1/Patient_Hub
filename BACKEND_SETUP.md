# 🎯 Patient Hub - Database Complete Setup

## 📦 Tổng quát

Tôi đã tạo một **Backend hoàn chỉnh** cho ứng dụng Patient Hub với:

✅ **Express.js** - Web framework  
✅ **PostgreSQL** - Cơ sở dữ liệu  
✅ **Prisma ORM** - Database management  
✅ **TypeScript** - Type safety  
✅ **JWT Authentication** - Xác thực người dùng  
✅ **12 bảng cơ sở dữ liệu** - Quản lý bệnh nhân, bác sĩ, lịch khám, v.v.

---

## 📁 Cấu trúc Thư mục

```
Patient_Hub/
├── frontend/                    # React frontend
├── backend/                     # ✨ NEW BACKEND
│   ├── src/
│   │   ├── controllers/         # Logic xử lý request
│   │   │   ├── authController.ts
│   │   │   ├── userController.ts
│   │   │   └── dataController.ts
│   │   ├── routes/              # API routes
│   │   │   ├── authRoutes.ts
│   │   │   ├── userRoutes.ts
│   │   │   └── dataRoutes.ts
│   │   ├── middleware/          # Xác thực & phân quyền
│   │   │   └── auth.ts
│   │   └── server.ts            # Server chính
│   ├── prisma/
│   │   ├── schema.prisma        # Prisma schema
│   │   └── schema.sql           # SQL script
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md
├── DATABASE_SETUP.md            # Hướng dẫn thiết lập database
└── README.md

```

---

## 🗄️ Database Tables (12 bảng)

### 👥 User Management
- **User** - Tài khoản người dùng (Bệnh nhân, Bác sĩ, Admin, Kỹ thuật viên)
- **Patient** - Hồ sơ bệnh nhân (nhóm máu, dị ứng, bệnh mãn tính...)
- **Doctor** - Hồ sơ bác sĩ (chuyên khoa, giấy phép, kinh nghiệm...)

### 📋 Medical Management
- **Appointment** - Lịch khám (trạng thái, thời gian, loại tư vấn...)
- **MedicalRecord** - Hồ sơ bệnh án (chẩn đoán, triệu chứng, điều trị...)
- **LabResult** - Kết quả xét nghiệm (tên xét nghiệm, giá trị, trạng thái...)
- **Prescription** - Đơn thuốc (tên thuốc, liều lượng, tần suất...)

### 💳 Other Services
- **Payment** - Thanh toán (số tiền, trạng thái, phương thức...)
- **HospitalService** - Dịch vụ bệnh viện (tên, mô tả, giá...)
- **MedicalArticle** - Bài viết y tế (tiêu đề, nội dung, danh mục...)
- **Notification** - Thông báo (tin nhắn cho người dùng...)
- **ChatMessage** - Tin nhắn chatbot

---

## 🚀 Quick Start

### 1️⃣ Cài đặt PostgreSQL

**Windows:**
- Tải từ: https://www.postgresql.org/download/windows/
- Chọn cài đặt mặc định, nhớ password superuser

**macOS:**
```bash
brew install postgresql
```

**Linux (Ubuntu):**
```bash
sudo apt-get install postgresql postgresql-contrib
```

### 2️⃣ Tạo Database

```bash
createdb -U postgres patient_hub
```

### 3️⃣ Setup Backend

```bash
cd backend
cp .env.example .env
```

Chỉnh sửa `.env`:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/patient_hub"
JWT_SECRET="your-secret-key-123456"
PORT=5000
```

### 4️⃣ Cài đặt Dependencies & Setup Database

```bash
npm install
npm run prisma:generate
npm run db:push
```

### 5️⃣ Chạy Server

```bash
npm run dev
```

✅ Server sẽ chạy tại: **http://localhost:5000**

### 6️⃣ Kiểm tra Kết nối Database

```bash
curl http://localhost:5000/api/db-check
```

Kết quả:
```json
{"status":"Database connection successful!"}
```

### 7️⃣ Xem Database với Prisma Studio

```bash
npm run db:studio
```

Mở: **http://localhost:5555**

---

## 📚 API Routes

### Authentication (`/api/auth`)
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký tài khoản

### User (`/api/user`)
- `GET /api/user/profile` - Lấy hồ sơ người dùng
- `PUT /api/user/profile` - Cập nhật hồ sơ
- `GET /api/user/dashboard` - Bảng điều khiển bệnh nhân

### Data (`/api/data`)
- `GET /api/data/appointments` - Danh sách lịch khám
- `POST /api/data/appointments` - Tạo lịch khám
- `GET /api/data/lab-results` - Kết quả xét nghiệm
- `GET /api/data/medical-records` - Hồ sơ bệnh án
- `GET /api/data/prescriptions` - Đơn thuốc
- `GET /api/data/payments` - Lịch sử thanh toán
- `GET /api/data/services` - Dịch vụ bệnh viện (public)
- `GET /api/data/articles` - Bài viết y tế (public)
- `GET /api/data/notifications` - Thông báo

---

## 🔑 Key Features

✅ **User Roles**
- PATIENT - Bệnh nhân
- DOCTOR - Bác sĩ
- ADMIN - Quản trị viên
- TECHNICIAN - Kỹ thuật viên
- STAFF - Nhân viên

✅ **Appointment Status**
- PENDING - Chờ xác nhận
- CONFIRMED - Đã xác nhận
- IN_PROGRESS - Đang thực hiện
- COMPLETED - Hoàn thành
- CANCELLED - Hủy bỏ
- NO_SHOW - Không tham dự

✅ **Payment Status**
- PENDING - Chờ thanh toán
- PROCESSING - Đang xử lý
- COMPLETED - Hoàn thành
- FAILED - Thất bại
- REFUNDED - Hoàn tiền

✅ **Security**
- JWT Authentication
- Password hashing (bcryptjs)
- Role-based access control

---

## 📝 File quan trọng

| File | Mô tả |
|------|-------|
| [backend/prisma/schema.prisma](backend/prisma/schema.prisma) | Định nghĩa cơ sở dữ liệu |
| [backend/prisma/schema.sql](backend/prisma/schema.sql) | SQL schema (tuỳ chọn) |
| [backend/src/server.ts](backend/src/server.ts) | Server chính |
| [backend/src/middleware/auth.ts](backend/src/middleware/auth.ts) | Xác thực JWT |
| [backend/src/controllers/](backend/src/controllers/) | Logic xử lý |
| [DATABASE_SETUP.md](DATABASE_SETUP.md) | Hướng dẫn chi tiết |

---

## 🔧 Useful Commands

```bash
# Development
npm run dev                  # Chạy dev server
npm run build              # Build TypeScript
npm start                  # Chạy production

# Database
npm run db:studio          # Xem database (Prisma Studio)
npm run db:push            # Sync schema với database
npm run db:migrate         # Tạo migration
npm run prisma:generate    # Generate Prisma client

# Lint
npm run lint               # Check TypeScript
```

---

## 🐛 Troubleshooting

### ❌ "Connection refused"
```bash
# Kiểm tra PostgreSQL đang chạy
# Windows: sc query postgresql-x64-14
# macOS: brew services list
# Linux: sudo service postgresql status
```

### ❌ "database does not exist"
```bash
createdb -U postgres patient_hub
```

### ❌ Lỗi Prisma
```bash
npm run prisma:generate
npm run db:push
```

### ❌ Reset Database (XÓA TẤT CẢ DỮ LIỆU)
```bash
npx prisma migrate reset
```

---

## 📚 Next Steps

1. ✅ Backend PostgreSQL đã setup
2. 🔄 Kết nối Frontend với API
3. 📝 Thêm thêm endpoints theo yêu cầu
4. 🔐 Implement email verification
5. 📧 Setup email notifications
6. 📊 Add admin dashboard APIs

---

## 📖 Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [JWT Guide](https://jwt.io/)

---

## ✨ Done!

Database của bạn đã sẵn sàng! Hãy bắt đầu chạy backend:

```bash
cd backend
npm install
npm run db:push
npm run dev
```

Backend sẽ chạy tại **http://localhost:5000** ✨
