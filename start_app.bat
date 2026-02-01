@echo off
echo ========================================
echo  Vape Inventory Manager - Starting...
echo ========================================
echo.

echo [1/2] Starting Backend Server...
start "Vape Backend" cmd /k "python app.py"
timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend...
cd frontend
start "Vape Frontend" cmd /k "npm start"

echo.
echo ========================================
echo  Application Starting!
echo  Backend: http://localhost:5000
echo  Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to close this window...
pause >nul
