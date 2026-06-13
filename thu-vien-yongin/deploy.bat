@echo off
REM ========================================
RAILWAY DEPLOY - Thư viện Yongin
Cách dùng: Click đúp hoặc chạy từ CMD
============================================

echo.
echo  ========================================
echo    🚀 THƯ VIỆN YONGIN - DEPLOY TO RAILWAY
echo  ========================================
echo.
echo  Yeu cau: Node.js, Railway CLI (da cai san)
echo.
echo  🟢 Buoc 1: Dang nhap Railway
echo     Chay: railway login
echo     -> Mo trinh duyet -> Dang nhap GitHub -> Quay lai
echo.
echo  🟢 Buoc 2: Khoi tao project
echo     Chay: railway init
echo     -> Chon "Empty Project" -> Dat ten: "thu-vien-yongin"
echo.
echo  🟢 Buoc 3: Set environment variables
echo     Chay cac lenh ben duoi:
echo.
echo  railway env set NODE_ENV=production
echo  railway env set PORT=3000
echo  railway env set SUPABASE_URL=https://qtvofbptqnopmlqegnkw.supabase.co
echo  railway env set SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0dm9mYnB0cW5vcG1scWVnbmt3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTI0MDgzOSwiZXhwIjoyMDk2ODE2ODM5fQ.MSUaOSoPoS0p0VZREcLN49ydyBzZwn16S56mfhvLo_U
echo  railway env set JWT_SECRET=yongin_jwt_secret_2026
echo  railway env set JWT_EXPIRES_IN=24h
echo  railway env set JWT_REFRESH_SECRET=yongin_refresh_secret_2026
echo  railway env set JWT_REFRESH_EXPIRES_IN=7d
echo  railway env set LIBRARY_NAME="Thư viện số cộng đồng Yongin"
echo  railway env set LIBRARY_ADDRESS="46 Bạch Đằng, Hải Châu, Đà Nẵng"
echo.
echo  🟢 Buoc 4: Deploy
echo     Chay: railway up
echo     -> Doi 3-5 phut -> Xem logs: railway logs
echo.
echo  🟢 Buoc 5: Mo app
echo     Chay: railway domain
echo     -> Copy URL -> Mo trinh duyet
echo.
echo  ========================================
echo  ✅ Sau deploy, test:
echo     https://thuvienyongin.up.railway.app/api/health
echo     https://thuvienyongin.up.railway.app/
echo     https://thuvienyongin.up.railway.app/librarian/
echo     https://thuvienyongin.up.railway.app/admin/
echo  ========================================
echo.
pause
