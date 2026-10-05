@echo off
title Yash AI 2.0 Launcher
echo ========================================================
echo         Launching Yash AI 2.0 (Anti-Gravity Core)
echo ========================================================
echo.
echo [1/2] Starting Backend Server (FastAPI on Port 8000)...
start "Yash AI - Backend" cmd /k "cd /d "%~dp0backend" && if exist venv\Scripts\activate.bat (call venv\Scripts\activate.bat) && uvicorn app.main:app --reload --port 8000"

echo [2/2] Starting Frontend App (Next.js on Port 3000)...
start "Yash AI - Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ========================================================
echo Yash AI 2.0 is starting!
echo - Web Application: http://localhost:3000
echo - Backend API Docs: http://localhost:8000/docs
echo ========================================================
echo Opening browser in 4 seconds...
timeout /t 4 /nobreak >nul
start http://localhost:3000
