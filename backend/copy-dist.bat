@echo off
echo.
echo ==========================================
echo   Copy Frontend to Backend
echo ==========================================
echo.

:: Check if dist exists in root
if not exist ..\dist (
    echo [ERROR] Frontend not found in root folder!
    echo.
    echo Run build.bat in root folder first.
    echo.
    pause
    exit /b 1
)

:: Copy dist to backend
echo [INFO] Copying frontend to backend...
if exist dist (
    rmdir /s /q dist
)
xcopy /e /i /q ..\dist dist
if errorlevel 1 (
    echo [ERROR] Failed to copy frontend
    pause
    exit /b 1
)
echo [OK] Frontend copied to backend\dist
echo.

echo ==========================================
echo   Copy completed successfully!
echo ==========================================
echo.
echo Now you can start the server: run.bat
echo.
pause
