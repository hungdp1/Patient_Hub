# Patient Hub – Deploy lên web thật (Docker / VPS)

Toàn bộ ứng dụng (frontend + backend + PostgreSQL) chạy bằng Docker Compose.
nginx phục vụ frontend và reverse-proxy `/api` + `/socket.io` về backend, nên
mọi thứ cùng một origin — chạy được trên **bất kỳ IP hoặc domain nào** mà
không cần build lại.

```
Internet ──▶ :80 (nginx)
                ├── /            → React static (frontend)
                ├── /api/...     → backend:5000 (Express)
                └── /socket.io/  → backend:5000 (Socket.io)
                                      └── db:5432 (PostgreSQL, nội bộ)
```

---

## 1. Chuẩn bị VPS

Bạn cần một VPS (Ubuntu 22.04+ khuyến nghị) — ví dụ DigitalOcean, Vultr,
Linode, AWS Lightsail, hoặc bất kỳ server nào bạn có. Bạn tự đăng ký nhà
cung cấp và tạo server (vì lý do bảo mật, tôi không tạo tài khoản hộ bạn).

Cài Docker trên VPS:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # đăng xuất/đăng nhập lại sau lệnh này
```

Mở firewall cho cổng 80 (và 443 nếu dùng HTTPS sau này):

```bash
sudo ufw allow 80/tcp
sudo ufw allow OpenSSH
sudo ufw enable
```

---

## 2. Đưa mã nguồn lên VPS

```bash
git clone <repo-url> patient-hub      # hoặc scp/rsync thư mục dự án lên
cd patient-hub
git checkout ver1
```

---

## 3. Cấu hình biến môi trường

```bash
cp .env.docker.example .env
nano .env
```

Bắt buộc đổi các giá trị sau trong `.env`:

| Biến | Ghi chú |
|---|---|
| `POSTGRES_PASSWORD` | Mật khẩu database mạnh |
| `JWT_SECRET` | Chuỗi ngẫu nhiên dài — tạo bằng `openssl rand -hex 32` |
| `CREDIT_CARD_ENCRYPTION_KEY` | **Đúng 32 ký tự** (AES-256) |
| `GEMINI_API_KEY` | Tùy chọn — để trống thì AI chat dùng phản hồi mẫu an toàn |
| `HTTP_PORT` | Mặc định `80`. Dùng `8080` nếu cổng 80 bận |

---

## 4. Build và chạy

```bash
docker compose build
docker compose up -d
```

Lần đầu backend tự động:
- chờ database sẵn sàng
- đồng bộ schema (`prisma db push`)
- khởi động server

Xem log:

```bash
docker compose logs -f
```

---

## 5. Tạo dữ liệu mẫu (chỉ chạy lần đầu)

> Lệnh seed sẽ **xóa sạch và tạo lại** dữ liệu mẫu — chỉ chạy khi DB còn trống.

```bash
docker compose exec backend npm run seed
```

Tài khoản mẫu (mật khẩu: `Password@123`):

| Vai trò | Số điện thoại |
|---|---|
| Admin | `0900000001` |
| Bác sĩ | `0900000002` |
| KTV | `0900000003` |
| Bệnh nhân | `0900000004` |

---

## 6. Truy cập

Mở trình duyệt: `http://<IP-VPS>/`

Xong — ứng dụng đã chạy online thật.

---

## 7. (Tùy chọn) Gắn domain riêng + HTTPS

1. Trỏ bản ghi DNS `A` của domain về IP VPS.
2. Cài đặt một reverse proxy có SSL tự động (ví dụ Caddy) đứng trước, hoặc
   dùng `certbot` với nginx. Cách nhanh nhất — chạy thêm Caddy:

   ```bash
   docker run -d --name caddy --network host \
     -v caddy_data:/data \
     caddy caddy reverse-proxy --from yourdomain.com --to :80
   ```

   Caddy tự xin chứng chỉ Let's Encrypt → site chạy `https://yourdomain.com`.

---

## 8. Vận hành thường ngày

| Việc | Lệnh |
|---|---|
| Cập nhật code mới | `git pull && docker compose up -d --build` |
| Dừng | `docker compose down` |
| Dừng + xóa database | `docker compose down -v` ⚠️ mất dữ liệu |
| Xem log backend | `docker compose logs -f backend` |
| Backup database | `docker compose exec db pg_dump -U $POSTGRES_USER patient_hub > backup.sql` |
| Mở Prisma Studio | `docker compose exec backend npx prisma studio` |

---

## 9. Khắc phục sự cố

- **Trang trắng / 502**: backend chưa sẵn sàng — `docker compose logs backend`.
- **Lỗi `CREDIT_CARD_ENCRYPTION_KEY`**: phải đúng 32 ký tự.
- **Cổng 80 bận**: đổi `HTTP_PORT=8080` trong `.env`, chạy lại `docker compose up -d`.
- **DB lỗi kết nối**: kiểm tra `POSTGRES_*` trong `.env` khớp nhau, `docker compose logs db`.
