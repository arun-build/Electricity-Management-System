@echo off
title VoltGrid Frontend Server
cd /d "%~dp0frontend"

echo ===================================================
echo     VOLTGRID LUXE - REACT FRONTEND LAUNCHER
echo ===================================================

:: Check for Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b
)

:: Install npm dependencies if missing
if not exist "node_modules\" (
    echo [SETUP] Installing npm packages (first time setup)...
    call npm install
)

echo [STARTING] Starting Vite Dev Server on http://localhost:5173 ...
call npm run dev
pause
