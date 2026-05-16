# Patient Hub - Hướng dẫn Triển khai (Deployment Guide)

Tài liệu này cung cấp hướng dẫn chi tiết các bước để đưa ứng dụng **Patient Hub** lên môi trường Production (Internet).

## 1. Yêu cầu Hệ thống
- **Cơ sở dữ liệu:** PostgreSQL (Có thể dùng Supabase, Render, Neon, hoặc AWS RDS).
- **Backend (Node.js):** Một dịch vụ Cloud Hosting (Render, Railway, Heroku, AWS EC2, DigitalOcean).
- **Frontend (Vite/React):** Một dịch vụ Static Hosting (Vercel, Netlify, Cloudflare Pages).

---

## 2. Chuẩn bị Cơ sở dữ liệu (PostgreSQL)

1. Tạo một cơ sở dữ liệu PostgreSQL trực tuyến (ví dụ dùng Supabase hoặc Neon).
2. Lấy Connection String (URL kết nối), định dạng thường là:
   `postgresql://username:password@host:port/database`

---

## 3. Triển khai Backend

Khuyến nghị sử dụng **Render** hoặc **Railway** để triển khai nhanh.

### Bước 3.1: Cấu hình biến môi trường (Environment Variables)
Trên nền tảng hosting, cấu hình các biến môi trường sau cho dự án Backend:

```env
# Môi trường chạy
NODE_ENV=production

# Cổng khởi chạy (thường Hosting tự động gán, nếu có)
PORT=5000

# Chuỗi kết nối Database
DATABASE_URL="postgresql://user:password@cloud-host:5432/patient_hub"

# Khóa bí mật JWT (Mã hóa token bảo mật, NÊN LÀ MỘT CHUỖI RANDOM DÀI)
JWT_SECRET="mot-chuoi-random-bi-mat-nao-do-cho-production"
JWT_EXPIRATION="7d"

# Địa chỉ URL của Frontend sau khi triển khai (Dùng cho CORS)
FRONTEND_URL="https://ten-ung-dung-frontend.vercel.app"

# API Key cho tính năng AI (tùy chọn)
GEMINI_API_KEY="your-gemini-api-key"
```

### Bước 3.2: Khởi tạo Database (Prisma)
Đảm bảo rằng trong quy trình build (Build Command) của backend, bạn chạy lệnh Prisma để tạo các bảng trong Database:
```bash
npm install
npx prisma generate
npx prisma migrate deploy
```

### Bước 3.3: Khởi chạy Backend (Start Command)
```bash
npm run build
npm start
```
*Ghi chú: Lệnh `npm start` trong `package.json` nên gọi đến thư mục build (ví dụ `node dist/server.js`). Nếu bạn dùng ts-node, có thể sẽ phải điều chỉnh lại package.json hoặc chạy bằng `ts-node src/server.ts`.*

---

## 4. Triển khai Frontend

Khuyến nghị sử dụng **Vercel** hoặc **Netlify**.

### Bước 4.1: Cấu hình URL Backend
Trong thư mục `frontend`, đổi hoặc thiết lập biến môi trường chỉ đến URL của Backend vừa được triển khai.
Ví dụ trong `.env.production`:
```env
VITE_API_URL="https://ten-ung-dung-backend.onrender.com/api"
```

### Bước 4.2: Build & Deploy
- Khi đẩy (push) code lên GitHub và kết nối với Vercel, hãy đảm bảo `Build Command` là:
  ```bash
  npm run build
  ```
- Thư mục Output là: `dist`

---

## 5. Kiểm tra Tích hợp
1. **Kiểm tra Frontend:** Truy cập URL Frontend. Đảm bảo giao diện hiển thị đúng.
2. **Kiểm tra API / Backend:** Đăng nhập và kiểm tra dữ liệu trả về từ Dashboard, xem thông tin Bệnh nhân có được truy xuất thành công hay không.
3. **Kiểm tra Database:** Truy cập Prisma Studio (nếu chạy local kết nối remote DB) để xem dữ liệu có đúng ở trên PostgreSQL production không.

## 6. Lưu ý Bảo mật
- **Không bao giờ** commit file `.env` lên Github.
- Đổi các `JWT_SECRET` và mật khẩu admin định kỳ.
- Bật `CORS` với danh sách whitelist chỉ bao gồm URL của Frontend (Backend `server.ts` đã được cấu hình sẵn cho việc này).
