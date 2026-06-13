# 🚀 HƯỚNG DẪN DEPLOY — THƯ VIỆN YONGIN

> Chiến lược: **Backend trên Railway** + **Frontend trên Vercel** (hoặc tất cả trên Railway)

---

## PHƯƠNG ÁN A: BACKEND TRÊN RAILWAY + FRONTEND TRÊN VERCEL (Khuyên dùng)

### Bước 1: Deploy Backend lên Railway

```bash
# Railway.app hỗ trợ Node.js miễn phí
# 1. Đăng ký https://railway.app (GitHub login)
# 2. Cài Railway CLI
npm install -g @railway/cli

# 3. Deploy
cd backend
railway login
railway init
railway up

# 4. Set environment variables trên Railway Dashboard:
#    SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET, JWT_REFRESH_SECRET
#    → Copy từ file backend/.env

# 5. Lấy URL backend (ví dụ: https://thuvienyongin.up.railway.app)
railway domain
```

### Bước 2: Deploy 3 Frontend lên Vercel

#### Cách 1: Vercel Dashboard (kéo-thả - nhanh nhất)

```bash
# Build 3 app
cd frontend
npm install
npm run build -w apps/reader
npm run build -w apps/librarian
npm run build -w apps/admin

# Copy dist ra ngoài để deploy riêng
```

Vào https://vercel.com → **Add New Project** → **Deploy without Git**

| App | Build folder | URL mong muốn |
|-----|-------------|---------------|
| **Reader** | `frontend/apps/reader/dist` | `thuvienyongin.vercel.app` |
| **Librarian** | `frontend/apps/librarian/dist` | `thuvienyongin.vercel.app/librarian` |
| **Admin** | `frontend/apps/admin/dist` | `thuvienyongin.vercel.app/admin` |

Thực tế, Vercel không hỗ trợ deploy 3 app dưới cùng 1 domain dạng subfolder dễ dàng. 
→ **Giải pháp:** Dùng Railway cho cả frontend (đơn giản nhất) hoặc deploy 3 Vercel project riêng.

---

## PHƯƠNG ÁN B: TẤT CẢ TRÊN RAILWAY (Đơn giản nhất)

Railway hỗ trợ Node.js app serve static files → **1 lần deploy là xong**.

### Bước 1: Chuẩn bị

```bash
# 1. Tạo Railway account https://railway.app
# 2. Cài CLI
npm install -g @railway/cli

# 3. Build frontend
cd frontend
npm install && npm run build
# → Kết quả: frontend/apps/*/dist/ đã có file build
```

### Bước 2: Deploy

```bash
cd D:\01.PROJECTS\Công Việc AI\Phần Mềm Thư viện Yongin Đà Nẵng\thu-vien-yongin
railway login
railway init

# Set env variables
railway env set SUPABASE_URL=https://qtvofbptqnopmlqegnkw.supabase.co
railway env set SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1Ni...
railway env set JWT_SECRET=your_jwt_secret
railway env set JWT_EXPIRES_IN=24h
railway env set JWT_REFRESH_SECRET=your_refresh_secret
railway env set JWT_REFRESH_EXPIRES_IN=7d
railway env set LIBRARY_NAME="Thư viện số cộng đồng Yongin"
railway env set LIBRARY_ADDRESS="46 Bạch Đằng, Hải Châu, Đà Nẵng"
railway env set NODE_ENV=production

# Deploy
railway up

# Xem logs
railway logs

# Mở URL
railway domain
# → https://thuvienyongin.up.railway.app/
```

### Bước 3: Cập nhật .env cho production

Trước khi deploy, kiểm tra file `backend/.env`:
```
PORT=3000
NODE_ENV=production
SUPABASE_URL=https://qtvofbptqnopmlqegnkw.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJI...
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_refresh_secret_key_change_this
JWT_REFRESH_EXPIRES_IN=7d
LIBRARY_NAME="Thư viện số cộng đồng Yongin"
LIBRARY_ADDRESS="46 Bạch Đằng, Hải Châu, Đà Nẵng"
```

> ⚠️ QUAN TRỌNG: Đổi JWT_SECRET và JWT_REFRESH_SECRET thành chuỗi ngẫu nhiên!

---

## PHƯƠNG ÁN C: TẤT CẢ TRÊN VERCEL (Cần sửa code)

Vercel chạy serverless → **không hỗ trợ multer/file upload** và cần sửa backend.

### Sửa backend cho Vercel

Tạo file `backend/api/index.js`:

```javascript
// backend/api/index.js — Vercel serverless entry point
const app = require('../src/app');
module.exports = app;
```

Cập nhật `backend/package.json` thêm:
```json
{
  "scripts": {
    "vercel-build": "cd ../frontend && npm install && npm run build"
  }
}
```

Tạo `vercel.json` ở thư mục gốc:

```json
{
  "version": 2,
  "buildCommand": "cd frontend && npm install && npm run build",
  "installCommand": "cd backend && npm install",
  "outputDirectory": "backend",
  "functions": {
    "api/index.js": { "runtime": "@vercel/node@3" }
  },
  "routes": [
    { "src": "/api/(.*)", "dest": "api/index.js" },
    { "src": "/librarian/assets/(.*)", "dest": "frontend/apps/librarian/dist/assets/$1" },
    { "src": "/librarian/.*", "dest": "frontend/apps/librarian/dist/index.html" },
    { "src": "/admin/assets/(.*)", "dest": "frontend/apps/admin/dist/assets/$1" },
    { "src": "/admin/.*", "dest": "frontend/apps/admin/dist/index.html" },
    { "src": "/assets/(.*)", "dest": "frontend/apps/reader/dist/assets/$1" },
    { "src": "/(.*)", "dest": "frontend/apps/reader/dist/index.html" }
  ]
}
```

```bash
# Deploy lên Vercel
npx vercel --prod
```

> ⚠️ Hạn chế: Vercel serverless **không hỗ trợ** multer (file upload) và rate limiting.
> → Import CSV/Excel sẽ không hoạt động. Cần chuyển sang dùng API upload của Supabase Storage.

---

## SO SÁNH CÁC PHƯƠNG ÁN

| Tiêu chí | Railway (B) | Vercel (C) |
|----------|------------|------------|
| **Độ phức tạp** | ⭐ Đơn giản | ⭐⭐⭐ Phức tạp |
| **File upload** | ✅ Hoạt động | ❌ Không hỗ trợ |
| **Chi phí (free)** | $5/tháng (free $5) | ✅ Free |
| **Tốc độ** | Nhanh | Nhanh (có cold start) |
| **Domain** | `*.up.railway.app` | `*.vercel.app` |
| **SSL** | ✅ Tự động | ✅ Tự động |
| **Database** | Dùng Supabase sẵn | Dùng Supabase sẵn |

---

## SAU KHI DEPLOY: KIỂM TRA

```bash
# Test health
curl https://thuvienyongin.up.railway.app/api/health

# Test OPAC
curl https://thuvienyongin.up.railway.app/
curl https://thuvienyongin.up.railway.app/librarian/
curl https://thuvienyongin.up.railway.app/admin/

# Test API
curl "https://thuvienyongin.up.railway.app/api/opac/newest?limit=3"
curl "https://thuvienyongin.up.railway.app/api/opac/search?q=van"
curl "https://thuvienyongin.up.railway.app/api/opac/works/78"
```

### Cập nhật frontend API URL

Nếu deploy frontend riêng trên Vercel, cập nhật `packages/api/src/client.ts`:

```typescript
const apiClient = axios.create({
  baseURL: process.env.VITE_API_URL || 'https://thuvienyongin.up.railway.app/api',
  //                                ^ thay localhost bằng Railway URL
});
```

### CORS

Nếu deploy backend và frontend riêng, sửa CORS trong `backend/src/app.js`:

```javascript
app.use(cors({
  origin: [
    'https://thuvienyongin.vercel.app',
    'https://thuvienyongin.up.railway.app',
  ],
  credentials: true,
}));
```

---

## KHUYẾN NGHỊ

> **Chọn Phương án B (Railway)** vì đơn giản nhất, giữ nguyên code, file upload hoạt động.

```bash
# Tổng kết: Chỉ 3 bước
cd backend && railway up
# Set env variables
# Mở URL → App online!
```
