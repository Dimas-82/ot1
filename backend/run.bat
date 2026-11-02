@echo off
echo.
echo ==========================================
echo   ASU "Occupational Safety" - Start Server
echo ==========================================
echo.

:: Check virtual environment
if not exist venv (
    echo [ERROR] Virtual environment not found!
    echo.
    echo Run setup.bat first to install the application.
    echo.
    pause
    exit /b 1
)

:: Activate virtual environment
echo [INFO] Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo [ERROR] Failed to activate virtual environment
    pause
    exit /b 1
)
echo [OK] Virtual environment activated
echo.

:: Check main.py
if not exist main.py (
    echo [ERROR] File main.py not found!
    pause
    exit /b 1
)

echo [INFO] Starting server...
echo.
echo ==========================================
echo   Server started!
echo ==========================================
echo.
echo Open browser and go to:
echo   http://localhost:8000
echo.
echo To stop the server press Ctrl+C
echo.
echo ==========================================
echo.

:: Start server
python main.py

:: If server stopped
echo.
echo [INFO] Server stopped
pause
