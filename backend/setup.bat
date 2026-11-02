@echo off
echo.
echo ==========================================
echo   ASU "Occupational Safety" - Installation
echo ==========================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found!
    echo.
    echo Install Python 3.10 or higher:
    echo https://www.python.org/downloads/
    echo.
    echo IMPORTANT: Check "Add Python to PATH" during installation!
    echo.
    pause
    exit /b 1
)

echo [INFO] Python found:
python --version
echo.

:: Create virtual environment
echo [INFO] Creating virtual environment...
if exist venv (
    echo [WARN] Virtual environment already exists
) else (
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment
        pause
        exit /b 1
    )
    echo [OK] Virtual environment created
)
echo.

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

:: Upgrade pip
echo [INFO] Upgrading pip...
python -m pip install --upgrade pip --quiet
echo [OK] pip upgraded
echo.

:: Install dependencies
echo [INFO] Installing Python dependencies...
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

:: Create directories
echo [INFO] Creating directories...
if not exist data mkdir data
if not exist uploads mkdir uploads
if not exist logs mkdir logs
if not exist backups mkdir backups
echo [OK] Directories created
echo.

:: Create .env file
echo [INFO] Creating configuration file...
if not exist .env (
    (
        echo # Database
        echo DATABASE_URL=sqlite:///./data/rcs_ot.db
        echo.
        echo # Secret key
        echo SECRET_KEY=change-this-to-random-string-min-32-chars-long-in-production
        echo.
        echo # App settings
        echo DEBUG=true
    ) > .env
    echo [OK] File .env created
    echo.
    echo [IMPORTANT] Edit .env file and change SECRET_KEY!
) else (
    echo [WARN] File .env already exists
)
echo.

:: Initialize database
echo [INFO] Initializing database...
python -c "from main import init_data; init_data()"
if errorlevel 1 (
    echo [ERROR] Failed to initialize database
    pause
    exit /b 1
)
echo [OK] Database initialized
echo.

echo ==========================================
echo   Installation completed successfully!
echo ==========================================
echo.
echo Login credentials:
echo   Login: admin
echo   Password: admin123
echo.
echo   Login: safety
echo   Password: safety123
echo.
echo [IMPORTANT] Change passwords on first login!
echo.
echo To start the application run: run.bat
echo.
pause
