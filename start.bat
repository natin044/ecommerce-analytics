@echo off
title E-Commerce Analytics Platform

echo ==========================================
echo   E-Commerce Analytics Platform
echo ==========================================
echo.

:: Start Backend
echo Starting Backend...
start "Backend - FastAPI" cmd /k "cd /d %~dp0backend && python main.py"

:: Small delay to let backend window open
timeout /t 2 /nobreak >nul

:: Start Frontend
echo Starting Frontend...
start "Frontend - React" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers started!
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:5173
echo.
echo Close this window or press any key to exit.
pause >nul
