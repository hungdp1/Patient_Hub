# Hướng dẫn chạy dự án Patient Hub

## 1. Khởi động Backend (Cơ sở dữ liệu và API)

1. Mở một cửa sổ Terminal (hoặc PowerShell/Command Prompt).
2. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
3. Chạy lệnh cài đặt (chỉ cần chạy lần đầu hoặc khi có thay đổi thư viện):
   ```bash
   npm install
   ```
4. Khởi động server backend:
   ```bash
   npm run dev
   ```
   *(Backend sẽ chạy ở cổng 5000: http://localhost:5000)*

## 2. Khởi động Frontend (Giao diện web)

1. Mở **thêm một cửa sổ Terminal mới** (giữ nguyên cửa sổ backend đang chạy).
2. Di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
3. Chạy lệnh cài đặt (chỉ cần chạy lần đầu):
   ```bash
   npm install
   ```
4. Khởi động giao diện web:
   ```bash
   npm run dev
   ```
   *(Frontend sẽ tự động mở lên tại: http://localhost:3000)*

---

### Lưu ý:
- Phải đảm bảo PostgreSQL đang chạy trên máy của bạn và database đã được tạo (xem file `DATABASE_SETUP.md` để biết thêm chi tiết nếu có lỗi kết nối database).
- Bạn cần chạy cả Backend và Frontend cùng lúc (trên 2 cửa sổ terminal khác nhau) thì ứng dụng mới hoạt động hoàn chỉnh.
