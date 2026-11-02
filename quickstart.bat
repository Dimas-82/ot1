@echo off
echo.
echo ==========================================
echo   ASU "Occupational Safety" - Quick Start
echo ==========================================
echo.

:: Check backend folder
if not exist backend (
    echo [ERROR] Backend folder not found!
    echo.
    echo Make sure you are in the project root folder.
    echo.
    pause
    exit /b 1
)

:: Check virtual environment
if not exist backend\venv (
    echo [INFO] Virtual environment not found.
    echo [INFO] Running installation...
    echo.
    cd backend
    call setup.bat
    cd ..
) else (
    echo [OK] Virtual environment found
)
echo.

:: Start server
echo [INFO] Starting server...
cd backend
echo.
call run.bat
cd ..
