#!/bin/bash

# DNS Security Auditor - Start Both Frontend and Backend

echo ""
echo "===================================="
echo " DNS Security Auditor"
echo "===================================="
echo ""

# Check if venv exists in backend
if [ ! -d "backend/venv" ]; then
    echo "Creating Python virtual environment..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# Check if node_modules exists in frontend
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

echo ""
echo "Starting Django Backend (Port 8000)..."
cd backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

echo ""
echo "Starting React Frontend (Port 3000)..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "===================================="
echo "Applications starting:"
echo "- Backend: http://localhost:8000"
echo "- Frontend: http://localhost:3000"
echo "===================================="
echo ""

# Keep script running
wait $BACKEND_PID $FRONTEND_PID
