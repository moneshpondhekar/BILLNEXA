@echo off
echo =======================================================
echo Starting Bill Nexa - AI Claims Automation Platform
echo =======================================================
echo.
echo Application will be available at: http://127.0.0.1:8000
echo.
echo Demo Accounts:
echo   - Admin:      admin@gmail.com / Admin@123
echo   - Employee 1: Monesh@gmail.com / Monesh@123
echo   - Employee 2: Chetan@gmail.com / Chetan@123
echo.
echo Press Ctrl+C to terminate the server.
echo.
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
pause

