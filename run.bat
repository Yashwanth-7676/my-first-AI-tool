@echo off
title Yash AI Backend Server
cd /d "%~dp0backend"
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)
echo =======================================================
echo  Starting Yash AI Backend Server...
echo  API Documentation: http://localhost:8000/docs
echo =======================================================
uvicorn app.main:app --reload --port 8000
pause
