@echo off
title Decree 30 Document Generator Launcher
echo =====================================================================
echo           DECREE 30 DOCUMENT GENERATOR LAUNCHER
echo =====================================================================
echo.

cd /d "%~dp0"

:: Check if node_modules exists, if not run npm install
if not exist "node_modules\" (
    echo [Frontend] node_modules not found. Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install frontend dependencies.
        pause
        exit /b %errorlevel%
    )
)

:: Start Backend API in a separate window
echo [Backend] Starting Backend API...
start "Decree 30 Backend API" cmd /k "cd backend && call start_api.bat"

:: Start Frontend App in a separate window
echo [Frontend] Starting Frontend App...
start "Decree 30 Frontend App" cmd /k "npm run dev"

:: Wait for servers to start and open browser
echo Waiting for servers to initialize...
timeout /t 5 /nobreak >nul

echo Opening browser...
start http://localhost:3000

echo.
echo =====================================================================
echo   Decree 30 Document Generator has been launched successfully!
echo   - Frontend: http://localhost:3000
echo   - Backend:  http://localhost:8000
echo =====================================================================
echo.
pause
