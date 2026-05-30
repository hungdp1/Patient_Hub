# Patient Hub — Hệ thống quản lý bệnh viện lấy người dùng làm trung tâm

| Thư mục | Tên gọi | Mô tả ngắn |
|---|---|---|
| [`ver1/`](ver1/) | **Patient Hub v1** | Bản đầu tiên — kiến trúc xoay quanh **bệnh nhân 
| [`ver2/`](ver2/) | **Patient Hub 2** | Bản viết lại toàn diện — **quản lý bệnh viện đầy đủ**, có **mô hình AI tự huấn luyện** 

## 1. Công nghệ sử dụng

### ver1
- **Backend**: Node.js, Express 4, TypeScript 5, Prisma 6 (PostgreSQL), Socket.IO, JWT, bcryptjs
- **AI**: `@google/genai` (Gemini) — function calling cho trợ lý y tế
- **Thanh toán**: `@payos/node`
- **Frontend**: React 19, Vite 6, TailwindCSS v4, react-router-dom
- **Hạ tầng**: Docker

### ver2
- **Backend**: Node.js, Express 4, TypeScript 5, `pg`
- **Auth & bảo mật**: `jsonwebtoken`, `bcryptjs`, AES-256
- **Thanh toán**: `@payos/node`
- **AI (Python)**: scikit-learn, pandas, numpy, joblib, FastAPI/uvicorn (serve)
  - **Random Forest** — chẩn đoán bệnh từ triệu chứng
  - **Reinforcement Learning** (Q-learning) — xếp lịch xét nghiệm tối ưu
- **Frontend**: React 19, Vite 6, TypeScript, TailwindCSS v4, react-router-dom 
- **Hạ tầng**: Docker, **Caddy**

## 2. Cấu trúc thư mục

### ver1

```
ver1/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      
│   │   │                      
│   │   └── schema.sql
│   ├── seed.ts               
│   └── src/
│       ├── server.ts / index.ts
│       ├── controllers/         # auth, data, user, ai, payos
│       ├── services/           
│       ├── repositories/      
│       ├── routes/              # auth, data, user, ai, payos
│       ├── middleware/          # auth (JWT), error
│       ├── realtime/            # RealTimeServer (Socket.IO)
│       ├── lib/             
│       └── utils/               # crypto, password, validation, errorHandler
├── frontend/
│   └── src/
│       ├── pages/            
│       │                       
│       │                     
│       ├── components/       
│       ├── services/          
│       ├── routes/              
│       └── hooks/ lib/ constants/
└── testing/                     # DATABASE_SETUP.md, DEPLOY.md, HUONG_DAN_CHAY.md, docker-compose.yml
```

### ver2

```
ver2/
├── src/                         # Backend (Express 5 + TypeScript)
│   ├── server.ts                # entry: check DB → listen → start scheduler
│   ├── app.ts                   # khởi tạo Express
│   ├── routes.ts                # gom router mọi module + /health, /ready
│   ├── config/env.ts          
│   ├── db/                      # pool.ts, query.ts
│   ├── middleware/              # auth, error
│   ├── utils/                   # crypto (AES-256-GCM), password, jwt
│   ├── integrations/            # payos.ts
│   ├── scheduler/               # cron job (vd: hết hạn lịch hẹn quá hạn)
│   ├── scripts/               
│   ├── types/                   # db.ts (interface khớp 1-1 bảng DB)
│   └── modules/                
│       ├── auth/        departments/   library/      lab-rooms/
│       ├── staff/       patients/      appointments/ examination-sessions/
│       ├── test-orders/ prescriptions/ invoices/     notifications/
│       └── reports/     chat/          ai/           manager/
├── web/                         # Frontend
│   └── src/
│       ├── auth/                # AuthContext, ProtectedRoute
│       ├── layouts/             # PublicLayout, PatientLayout, StaffLayout
│       ├── lib/               
│       └── pages/
│           ├── public/       
│           ├── patient/         
│           └── staff/           
├── migrations/                 
├── model ai/                    
│   ├── ml random forest/        # chẩn đoán bệnh: data / train / notebooks / serve
│   └── rl scheduling/           # xếp lịch xét nghiệm: env, agent (Q-learning), train, serve
├── ml/data/                     # dữ liệu nguồn cho mô hình 
├── caddy/                       # Caddyfile
├── docker/                     
├── postman/                     # Collection test API đầy đủ (mọi module)
├── dist/                        
├── docker-compose.yml / Dockerfile
└── testing deploy/            
```

## 3. Luồng nghiệp vụ chính (ver2)

```
Lễ tân tạo bệnh nhân + đặt lịch hẹn (appointment)
        │
Bác sĩ bắt đầu khám (examination-session)
        ├─► Chỉ định xét nghiệm (test-order) ──► KTV thực hiện ──► trả kết quả
        └─► Kê đơn thuốc (prescription)
        │
Bác sĩ chốt phiên khám (finalize)
        │
Hệ thống sinh hóa đơn (invoice) ──► Thu ngân thu tiền (cash / PayOS)

Quản lý: dashboard, báo cáo doanh thu, quản lý nhân sự & danh mục.
Bệnh nhân: tra cứu lịch sử khám/đơn thuốc/kết quả XN, chat với staff, chatbot gợi ý.
```
