# Patient Hub Backend

Backend API server cho ứng dụng Patient Hub sử dụng Express, TypeScript, Prisma, và PostgreSQL.

## 🚀 Quick Start

### 1. Setup Database

Đảm bảo PostgreSQL đã cài đặt. Tạo database mới:

```bash
createdb patient_hub
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Cấu hình Environment

```bash
cp .env.example .env
```

Chỉnh sửa `.env` với thông tin database của bạn:

```
DATABASE_URL="postgresql://user:password@localhost:5432/patient_hub"
JWT_SECRET="your-secret-key"
PORT=5000
```

### 4. Setup Database Schema

```bash
npm run prisma:generate
npm run db:push
```

Hoặc để tạo migration:

```bash
npm run db:migrate
```

### 5. Start Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

## 📚 Database Schema

### Core Tables:
- **User**: Người dùng hệ thống (Bệnh nhân, Bác sĩ, Admin)
- **Patient**: Thông tin chi tiết bệnh nhân
- **Doctor**: Thông tin chi tiết bác sĩ
- **Appointment**: Lịch khám
- **MedicalRecord**: Hồ sơ bệnh án
- **LabResult**: Kết quả xét nghiệm
- **Prescription**: Đơn thuốc
- **Payment**: Thanh toán
- **HospitalService**: Dịch vụ bệnh viện
- **MedicalArticle**: Bài viết y tế
- **Notification**: Thông báo
- **ChatMessage**: Tin nhắn chatbot

## 🔧 Useful Commands

```bash
# View database with Prisma Studio
npm run db:studio

# Generate Prisma client
npm run prisma:generate

# Create and run migration
npm run db:migrate

# Lint TypeScript
npm run lint
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/     # Logic xử lý request
│   ├── routes/         # Định tuyến API
│   ├── middleware/     # Middleware xác thực, log...
│   ├── server.ts       # Server chính
│   └── utils/          # Hàm tiện ích
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── migrations/     # Migration files
├── dist/               # Build output
├── .env.example        # Environment template
├── package.json        # Dependencies
└── tsconfig.json       # TypeScript config
```

## 🔐 Authentication

Sử dụng JWT (JSON Web Tokens) cho xác thực. Token được lưu trong cookie HTTP-only.

## 📝 API Endpoints

Sẽ được thêm trong các file routes.

## 🐛 Troubleshooting

**Lỗi kết nối database:**
- Kiểm tra PostgreSQL đang chạy
- Kiểm tra DATABASE_URL trong .env

**Lỗi Prisma:**
```bash
npm run prisma:generate
npm run db:push
```

**Xóa migration và reset database:**
```bash
npx prisma migrate reset
```

## 📦 Dependencies

- **express**: Web framework
- **@prisma/client**: ORM
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **cors**: CORS middleware
- **dotenv**: Environment variables
- **typescript**: Language

## 📄 License

Apache License 2.0
