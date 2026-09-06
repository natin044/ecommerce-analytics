@echo off
title Setup - E-Commerce Analytics Platform

echo ==========================================
echo   Installing All Dependencies
echo ==========================================
echo.

:: Python dependencies (backend + pipeline)
echo [1/2] Installing Python packages...
pip install fastapi uvicorn pandas numpy matplotlib pydantic -q
if %errorlevel% neq 0 (
    echo ERROR: pip install failed. Make sure Python is installed.
    pause
    exit /b 1
)
echo Python packages installed.
echo.

:: Frontend dependencies
echo [2/2] Installing frontend packages...
cd /d "%~dp0frontend"
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed. Make sure Node.js is installed.
    pause
    exit /b 1
)
echo Frontend packages installed.
echo.

echo ==========================================
echo   Setup Complete!
echo ==========================================
echo.
echo Next steps:
echo   1. Place Olist CSVs in data\raw\
echo   2. Run: cd python ^&^& python data_cleaning.py ^&^& python analytics.py
echo   3. Run: start.bat
echo.
pause
