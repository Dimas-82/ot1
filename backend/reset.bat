@echo off
echo.
echo ==========================================
echo   ASU "Occupational Safety" - Reset Database
echo ==========================================
echo.
echo [WARNING] This will delete all data!
echo.
set /p confirm=Are you sure? (y/n): 
if /i not "%confirm%"=="y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo [INFO] Deleting database...
if exist data\rcs_ot.db (
    del data\rcs_ot.db
    echo [OK] Database deleted
) else (
    echo [WARN] Database not found
)
echo.

echo [INFO] Initializing new database...
if exist venv (
    call venv\Scripts\activate.bat
    python -c "from main import init_data; init_data()"
    echo [OK] Database initialized
) else (
    echo [ERROR] Virtual environment not found!
    echo Run setup.bat first.
)
echo.

echo ==========================================
echo   Reset completed!
echo ==========================================
echo.
echo Login credentials:
echo   Login: admin
echo   Password: admin123
echo.
echo   Login: safety
echo   Password: safety123
echo.
pause
