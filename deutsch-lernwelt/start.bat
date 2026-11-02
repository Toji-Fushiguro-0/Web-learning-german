@echo off
rem start.bat - chay Deutsch Lernwelt bang server cuc bo (tranh loi fetch tren file://)
rem Chi can nhap doi file nay.

cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [!] Khong tim thay Node.js.
  echo     Cai tai https://nodejs.org
  echo     Hoac mo thang index.html - app se dung du lieu nhung, khong can server.
  pause
  exit /b 1
)

echo Dang mo http://localhost:8080 ...
start "" http://localhost:8080
node tools\serve.js 8080
pause
