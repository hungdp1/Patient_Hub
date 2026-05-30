# PostgreSQL Database Setup Guide

## 📋 Prerequisites

- PostgreSQL 14+ installed
- Node.js 18+
- npm or yarn

## 🗄️ Database Setup

### 1. Install PostgreSQL

**Windows:**
- Download từ https://www.postgresql.org/download/windows/
- Chọn mặc định, nhớ password superuser

**macOS:**
```bash
brew install postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

### 2. Create Database

```bash
# Using psql
psql -U postgres
```

```sql
-- In psql prompt
CREATE DATABASE patient_hub;
\c patient_hub
```

Hoặc sử dụng command line:

```bash
createdb -U postgres patient_hub
```

### 3. Get Connection String

Thường là:
```
postgresql://postgres:password@localhost:5432/patient_hub
```

Đổi `postgres` và `password` thành username/password của bạn.

## 🚀 Backend Setup

### 1. Copy file .env

```bash
cd backend
cp .env.example .env
```

### 2. Edit .env

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/patient_hub"
JWT_SECRET="your-super-secret-key-12345"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Setup Prisma

```bash
# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run db:push
```

Hoặc tạo migration:

```bash
npm run db:migrate -- --name init
```

### 5. Start Server

```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:5000`

## ✅ Verify Setup

### Check Database Connection

```bash
# Terminal
curl http://localhost:5000/api/db-check
```

Kết quả:
```json
{"status":"Database connection successful!"}
```

### View Database with Prisma Studio

```bash
npm run db:studio
```

Mở http://localhost:5555

## 📊 Database Schema

Xem `prisma/schema.prisma` để hiểu cấu trúc các bảng.

Các bảng chính:
- **User** - Người dùng (Bệnh nhân, Bác sĩ, Admin)
- **Patient** - Hồ sơ bệnh nhân
- **Doctor** - Hồ sơ bác sĩ
- **Appointment** - Lịch khám
- **MedicalRecord** - Hồ sơ bệnh án
- **LabResult** - Kết quả xét nghiệm
- **Prescription** - Đơn thuốc
- **Payment** - Thanh toán

## 🔧 Useful Commands

```bash
# View database
npm run db:studio

# Create new migration
npm run db:migrate -- --name your_migration_name

# Reset database (DELETE ALL DATA)
npx prisma migrate reset

# Generate types
npm run prisma:generate

# Format schema
npx prisma format
```

## 🐛 Troubleshooting

### "Connection refused"

1. Kiểm tra PostgreSQL đang chạy:
   ```bash
   # Windows
   sc query postgresql-x64-14
   
   # macOS
   brew services list
   
   # Linux
   sudo service postgresql status
   ```

2. Kiểm tra DATABASE_URL đúng trong .env

3. Kiểm tra password đúng

### "FATAL: database does not exist"

```bash
createdb -U postgres patient_hub
```

### "Error: P1000"

Database connection error. Kiểm tra:
- PostgreSQL server đang chạy
- DATABASE_URL đúng
- Username/password đúng
- Database tồn tại

## 🔄 Reset Database

```bash
# Xóa tất cả dữ liệu và tạo lại schema
npx prisma migrate reset

# Hoặc từng bước:
npx prisma migrate deploy  # Deploy migrations
npx prisma db seed         # Seed sample data (nếu có)
```

## 📝 Sample Data

Để thêm sample data, tạo file `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Add your seed data here
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Chạy:
```bash
npx prisma db seed
```

## 📚 Resources

- Prisma Docs: https://www.prisma.io/docs/
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Express Docs: https://expressjs.com/
