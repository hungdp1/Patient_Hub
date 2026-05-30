# Hướng dẫn chạy Patient Hub (Mediflow)

Hệ thống y tế full-stack: **Backend** Node + Express + Prisma + Socket.io · **Frontend** React 19 + Vite + Tailwind · **Database** PostgreSQL · **Thanh toán** PayOS · **AI** Google Gemini.

Có **3 cách chạy**. Chọn 1 trong 3:

| Cách | Khi nào dùng |
|------|--------------|
| 🐳 **Docker** (khuyến nghị) | Chạy thử local, demo, deploy VPS — dễ nhất |
| 💻 **Local dev** | Đang code, muốn HMR (hot reload) nhanh |
| 🌐 **Public web** | Muốn URL HTTPS công khai chia sẻ cho người khác test |

---

## 0. Yêu cầu cài đặt

Tùy theo cách chạy:

| Phần mềm | Docker | Local dev | Public web |
|---|:---:|:---:|:---:|
| [Docker Desktop](https://www.docker.com/products/docker-desktop) | ✅ bắt buộc | — | ✅ bắt buộc |
| [Node.js 20+](https://nodejs.org/) | — | ✅ bắt buộc | — |
| [PostgreSQL 16+](https://www.postgresql.org/download/) | — | ✅ bắt buộc | — |

Kiểm tra phiên bản:
```bash
docker --version          # ≥ 20
node --version            # ≥ v20
psql --version            # ≥ 16   (chỉ cần cho Local dev)
```

---

## 🐳 Cách 1: Chạy bằng Docker (khuyến nghị)

Đây là cách đơn giản nhất — **một lệnh** dựng cả 3 thành phần (database + backend + frontend) trong container.

### Bước 1: Tạo file `.env`

```bash
cp .env.docker.example .env
```

Mở `.env`, đổi tối thiểu các biến sau:

```env
POSTGRES_PASSWORD=mat_khau_db_manh_cua_ban
JWT_SECRET=chuoi_ngau_nhien_dai_it_nhat_32_ky_tu
CREDIT_CARD_ENCRYPTION_KEY=12345678901234567890123456789012   # đúng 32 ký tự
HTTP_PORT=8090          # đổi sang 80 nếu deploy thật
```

Tùy chọn (có thể để trống):
```env
GEMINI_API_KEY=          # bật chatbot AI thông minh
PAYOS_CLIENT_ID=         # bật thanh toán online
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=
```

### Bước 2: Khởi động stack

```bash
docker compose up -d --build
```

Lần đầu mất ~3-5 phút (tải image + build). Lần sau ~10 giây.

Kiểm tra trạng thái:
```bash
docker compose ps
```

Kết quả mong đợi:
```
SERVICE    STATUS
backend    Up
db         Up (healthy)
frontend   Up
```

### Bước 3: Tạo dữ liệu mẫu (chỉ lần đầu)

> ⚠️ Lệnh này **xóa sạch** rồi tạo lại dữ liệu mẫu. Chỉ chạy khi DB còn trống.

```bash
docker compose exec backend npm run seed
```

### Bước 4: Mở ứng dụng

Vào trình duyệt: **http://localhost:8090**

Đăng nhập bằng [tài khoản demo](#-tài-khoản-demo) bên dưới.

---

## 💻 Cách 2: Chạy local (dev mode)

Phù hợp khi đang code — Vite HMR sẽ tự refresh khi sửa file.

### Bước 1: Cài và chạy PostgreSQL

Cài PostgreSQL 16+, tạo user và database (chạy bằng quyền `postgres` superuser):
```sql
CREATE USER patient_user WITH PASSWORD 'password';
CREATE DATABASE patient_hub OWNER patient_user;
```

### Bước 2: Cấu hình backend

```bash
cd backend
cp .env.example .env
```

Mở `backend/.env` và điền:
```env
DATABASE_URL="postgresql://patient_user:password@localhost:5432/patient_hub"
PORT=5000
JWT_SECRET="chuoi_ngau_nhien_dai"
JWT_EXPIRATION="7d"
FRONTEND_URL="http://localhost:3000"
CREDIT_CARD_ENCRYPTION_KEY="12345678901234567890123456789012"
GEMINI_API_KEY=                # tùy chọn
PAYOS_CLIENT_ID=               # tùy chọn
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=
```

Cài dependencies và sync schema:
```bash
npm install
npx prisma generate
npm run db:push                # tạo bảng trong DB
npm run seed                   # dữ liệu mẫu
npm run dev                    # chạy backend → http://localhost:5000
```

### Bước 3: Cấu hình & chạy frontend (terminal mới)

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev                    # → http://localhost:3000
```

Mở trình duyệt: **http://localhost:3000**

---

## 🌐 Cách 3: Chia sẻ ra web thật (Cloudflare Tunnel)

Sau khi stack Docker đã chạy ([Cách 1](#-cách-1-chạy-bằng-docker-khuyến-nghị)), thêm tunnel để có URL HTTPS công khai, **miễn phí, không cần VPS**:

```bash
docker compose --profile tunnel up -d tunnel
```

Lấy URL công khai:

```bash
# Linux / macOS:
docker compose logs tunnel | grep trycloudflare.com

# Windows PowerShell:
docker compose logs tunnel | Select-String "trycloudflare.com"
```

Kết quả ví dụ:
```
https://xxx-yyy-zzz.trycloudflare.com
```

Gửi link này cho ai cũng truy cập được từ Internet. URL đổi mỗi lần restart tunnel — để có URL cố định, cần đăng ký domain trên Cloudflare (xem [`DEPLOY.md`](DEPLOY.md)).

Để deploy lên VPS riêng (sẵn sàng cho production), xem [`DEPLOY.md`](DEPLOY.md).

---

## 🔐 Tài khoản demo

Sau khi seed, có sẵn **10 tài khoản** (2 cho mỗi role). Mật khẩu chung: **`Password@123`**

| Role | Tài khoản 1 | Tài khoản 2 |
|---|---|---|
| **ADMIN** (Quản trị) | `0900000001` Nguyễn Quản Lý | `0900000011` Trần Giám Đốc |
| **DOCTOR** (Bác sĩ) | `0900000002` BS. Lê Thành Nam (Nội) | `0900000022` BS. Nguyễn Văn An (Tiêu hóa) |
| **TECHNICIAN** (KTV) | `0900000003` Nguyễn Văn Khoa (Sinh hóa) | `0900000033` Phạm Thị Lan (Huyết học) |
| **STAFF** (Nhân viên) | `0900000005` Vũ Thị Mai (Lễ tân) | `0900000055` Đỗ Văn Hùng (Hành chính) |
| **PATIENT** (Bệnh nhân) | `0900000004` Trần Thị B (O+) | `0900000044` Nguyễn Văn A (A+) |

Dữ liệu kèm theo: 13 lịch khám · 7 hồ sơ bệnh án · 29 kết quả xét nghiệm · 10 đơn thuốc · 10 hóa đơn (có PENDING để test PayOS) · 16 thông báo · thẻ tín dụng mã hóa AES-256 · thư viện y khoa.

---

## ⚙️ Bật tính năng tùy chọn

### 🤖 Chatbot AI (Google Gemini)

1. Lấy API key miễn phí tại: https://aistudio.google.com/apikey
2. Sửa `.env`:
   ```env
   GEMINI_API_KEY=AIza...
   ```
3. Restart backend:
   ```bash
   docker compose up -d backend
   ```

Nếu không cấu hình, chatbot vẫn hoạt động nhưng trả lời mẫu (fallback an toàn).

### 💳 Thanh toán PayOS

1. Đăng ký tài khoản tại https://my.payos.vn → tạo app → vào "Thông tin tích hợp"
2. Copy 3 giá trị vào `.env`:
   ```env
   PAYOS_CLIENT_ID=...
   PAYOS_API_KEY=...
   PAYOS_CHECKSUM_KEY=...
   ```
3. Restart backend:
   ```bash
   docker compose up -d backend
   ```
4. Trên PayOS dashboard, ô **Webhook URL**, dán:
   ```
   https://<URL-public-của-bạn>/api/payos/webhook
   ```
   (URL public lấy từ Cloudflare Tunnel ở [Cách 3](#-cách-3-chia-sẻ-ra-web-thật-cloudflare-tunnel))

Khi cấu hình xong, đăng nhập bằng tài khoản bệnh nhân (`0900000044`) sẽ thấy mục **"Thanh toán nhanh qua PayOS"** trên trang Thanh toán.

---

## 🛠️ Lệnh hữu ích thường ngày

| Việc | Lệnh |
|---|---|
| Xem log realtime | `docker compose logs -f` |
| Xem log 1 service | `docker compose logs -f backend` |
| Restart 1 service | `docker compose restart backend` |
| Build lại sau khi sửa code | `docker compose up -d --build` |
| Dừng toàn bộ | `docker compose down` |
| Dừng + xóa database ⚠️ | `docker compose down -v` |
| Tạo lại dữ liệu mẫu | `docker compose exec backend npm run seed` |
| Mở Prisma Studio (xem DB) | `docker compose exec backend npx prisma studio` |
| Backup database | `docker compose exec db pg_dump -U $POSTGRES_USER patient_hub > backup.sql` |
| Restore database | `docker compose exec -T db psql -U $POSTGRES_USER patient_hub < backup.sql` |
| Kiểm tra health backend | `curl http://localhost:8090/api/health` |

---

## 🆘 Khắc phục sự cố thường gặp

<details>
<summary><b>Trang trắng / lỗi 502 Bad Gateway</b></summary>

Backend chưa sẵn sàng. Xem log:
```bash
docker compose logs -f backend
```
Thường do `DATABASE_URL` sai hoặc Postgres chưa healthy. Đợi 30s, refresh trang.
</details>

<details>
<summary><b>Lỗi <code>CREDIT_CARD_ENCRYPTION_KEY</code> phải đúng 32 ký tự</b></summary>

Kiểm tra trong `.env`:
```bash
echo -n "$CREDIT_CARD_ENCRYPTION_KEY" | wc -c
```
Phải in ra **32**. Nếu khác, sửa lại cho đúng 32 ký tự.
</details>

<details>
<summary><b>Cổng <code>80</code> hoặc <code>8090</code> bị bận</b></summary>

Trong `.env` đổi sang cổng khác:
```env
HTTP_PORT=8091
```
Rồi `docker compose up -d frontend`.

Trên Windows kiểm tra cổng đang bị ai chiếm:
```powershell
Get-NetTCPConnection -LocalPort 8090
```
</details>

<details>
<summary><b>Đăng nhập báo "Số điện thoại hoặc mật khẩu không đúng"</b></summary>

1. Click icon 👁 ở ô mật khẩu để xem mình đã gõ gì
2. Đảm bảo gõ chính xác **`Password@123`** (`P` viết hoa, không có khoảng trắng)
3. Số điện thoại đúng định dạng: `0900000004` (không khoảng trắng/dấu cách)
4. Nếu đã chạy `npm run seed`, kiểm tra tài khoản tồn tại:
   ```bash
   docker compose exec db psql -U patient_user -d patient_hub -c "SELECT \"phoneNumber\", role FROM \"User\";"
   ```
</details>

<details>
<summary><b>Docker daemon not running</b></summary>

Mở Docker Desktop và đợi icon ở taskbar chuyển sang xanh. Trên Linux: `sudo systemctl start docker`.
</details>

<details>
<summary><b>PayOS button không hiện trên trang Thanh toán</b></summary>

PayOS chỉ hiện khi cả 3 biến `PAYOS_*` đã có giá trị trong `.env`.

Kiểm tra:
```bash
curl http://localhost:8090/api/payos/config
```
Nếu trả `{"enabled":false}` → vẫn chưa nhận đủ key. Restart backend sau khi sửa `.env`:
```bash
docker compose up -d backend
```
</details>

<details>
<summary><b>Webhook PayOS không cập nhật trạng thái</b></summary>

1. Đảm bảo URL public còn hoạt động: `curl https://<URL>/api/health`
2. URL đã được paste vào ô Webhook trên PayOS dashboard và click validate (icon 🔄)
3. Xem log:
   ```bash
   # Linux / macOS:
   docker compose logs -f backend | grep payos
   # Windows PowerShell:
   docker compose logs -f backend | Select-String "payos"
   ```
4. Nếu webhook chậm, frontend có cơ chế polling fallback — refresh trang `/payment` sau ~10 giây sẽ thấy trạng thái đã cập nhật.
</details>

---

## 📁 Cấu trúc dự án

```
Patient_Hub/
├── backend/                  # Node + Express + Prisma
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── services/         # Business logic (AuthService, PayOSService, ...)
│   │   ├── repositories/     # Data access layer
│   │   ├── routes/           # Express routers
│   │   ├── middleware/       # auth, error handler
│   │   ├── realtime/         # Socket.io
│   │   └── utils/            # crypto, password hash, validators
│   ├── prisma/schema.prisma  # DB schema
│   ├── seed.ts               # Demo data seeder
│   ├── Dockerfile
│   └── docker-entrypoint.sh  # Wait-for-DB + start
│
├── frontend/                 # React 19 + Vite + Tailwind
│   ├── src/
│   │   ├── pages/            # Trang: Login, Dashboard, AdminDashboard, ...
│   │   ├── components/       # Layout, Sidebar, Header, Chatbot, ...
│   │   ├── services/         # API clients (authService, dataService, ...)
│   │   ├── hooks/            # useAuth, ...
│   │   ├── routes/           # Routing config
│   │   └── index.css         # Tailwind v4 + design tokens
│   ├── nginx.conf            # Reverse proxy cấu hình
│   └── Dockerfile            # Multi-stage build (Vite → nginx)
│
├── docker-compose.yml        # 4 services: db, backend, frontend, tunnel
├── .env.docker.example       # Template biến môi trường
├── .env                      # ⚠️ KHÔNG commit — chứa secrets
├── DEPLOY.md                 # Hướng dẫn deploy lên VPS riêng
└── HUONG_DAN_CHAY.md         # File này
```

---

## 📚 Tài liệu liên quan

- [`DEPLOY.md`](DEPLOY.md) — Deploy lên VPS riêng (Ubuntu, Docker, domain + HTTPS)
- [Prisma docs](https://www.prisma.io/docs) — ORM
- [PayOS docs](https://payos.vn/docs/) — Cổng thanh toán
- [Google Gemini API](https://ai.google.dev/) — Chatbot AI
- [Tailwind CSS v4](https://tailwindcss.com/docs) — Styling

---

Có gì khó khăn khi chạy thử? Xem mục **[Khắc phục sự cố](#-khắc-phục-sự-cố-thường-gặp)** ở trên hoặc kiểm tra log: `docker compose logs -f`.
