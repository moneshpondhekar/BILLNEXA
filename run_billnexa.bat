@echo off
title Bill Nexa - Healthcare Automation System
echo =======================================================
echo Starting Bill Nexa - AI Claims Automation Platform
echo =======================================================
echo.
echo Starting Backend API on http://127.0.0.1:8000 ...
echo Starting Frontend Dev Server on http://localhost:3000 ...
echo.
echo Demo Accounts:
echo   - Admin:      admin@gmail.com / Admin@123
echo   - Employee 1: Monesh@gmail.com / Monesh@123
echo   - Employee 2: Chetan@gmail.com / Chetan@123
echo.
start "Bill Nexa Backend (Port 8000)" cmd /k "python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000"
timeout /t 2 /nobreak >nul
start "Bill Nexa Frontend (Port 3000)" cmd /k "cd frontend && npm run dev -- --host 0.0.0.0 --port 3000"
timeout /t 3 /nobreak >nul
start http://localhost:3000
echo.
echo =======================================================
echo Bill Nexa is now running!
echo Access URL: http://localhost:3000
echo Backend API: http://127.0.0.1:8000
echo Swagger Docs: http://127.0.0.1:8000/docs
echo =======================================================
echo.
pause
