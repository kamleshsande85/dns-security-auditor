@echo off
REM DNS Security Auditor - Start Both Frontend and Backend

echo.
echo ====================================
echo  DNS Security Auditor
echo ====================================
echo.

REM Check if venv exists in backend
if not exist "backend\venv" (
    echo Creating Python virtual environment...
    cd backend
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    cd ..
)

REM Check if node_modules exists in frontend
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo.
echo Starting Django Backend (Port 8000)...
start cmd /k "cd backend && venv\Scripts\activate.bat && python manage.py runserver 0.0.0.0:8000"

REM Wait a bit for backend to start
timeout /t 3

echo.
echo Starting React Frontend (Port 3000)...
start cmd /k "cd frontend && npm start"

echo.
echo ====================================
echo Applications starting:
echo - Backend: http://localhost:8000
echo - Frontend: http://localhost:3000
echo ====================================
echo.

pause
