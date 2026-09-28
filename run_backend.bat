@echo off
title VoltGrid Backend Server
cd /d "%~dp0backend"

echo ===================================================
echo     VOLTGRID LUXE - FLASK BACKEND LAUNCHER
echo ===================================================

:: Check for Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3.10+ from https://python.org
    pause
    exit /b
)

:: Create virtual environment if missing
if not exist "venv\Scripts\activate.bat" (
    echo [SETUP] Creating Python Virtual Environment (venv)...
    python -m venv venv
    echo [SETUP] Installing Python dependencies...
    call venv\Scripts\python -m pip install --upgrade pip
    call venv\Scripts\pip install -r requirements.txt
    echo [SETUP] Seeding database with demo data...
    call venv\Scripts\python seed_data.py
)

:: Ensure .env exists
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env >nul
    )
)

echo [STARTING] Starting Flask API on http://localhost:5000 ...
call venv\Scripts\python app.py
pause
