@echo off
echo.
echo ==========================================
echo   ASU "Occupational Safety" - Build Frontend
echo ==========================================
echo.

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found!
    echo.
    echo Node.js is required to build the frontend:
    echo https://nodejs.org/
    echo.
    echo If you don't need to modify the frontend,
    echo you can skip this step.
    echo.
    pause
    exit /b 1
)

echo [INFO] Node.js found:
node --version
echo.

:: Check package.json
if not exist package.json (
    echo [ERROR] File package.json not found!
    echo.
    echo Make sure you are in the project root folder.
    echo.
    pause
    exit /b 1
)

:: Install dependencies
echo [INFO] Installing npm dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install npm dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

:: Build project
echo [INFO] Building frontend...
call npm run build
if errorlevel 1 (
    echo [ERROR] Failed to build frontend
    pause
    exit /b 1
)
echo [OK] Frontend built
echo.

:: Copy to backend
echo [INFO] Copying files to backend...
if exist backend\dist (
    rmdir /s /q backend\dist
)
xcopy /e /i /q dist backend\dist
if errorlevel 1 (
    echo [ERROR] Failed to copy files
    pause
    exit /b 1
)
echo [OK] Files copied to backend\dist
echo.

echo ==========================================
echo   Build completed successfully!
echo ==========================================
echo.
echo Frontend built and copied to backend\dist
echo.
echo Now you can start the application:
echo   1. Go to backend folder
echo   2. Run run.bat
echo   3. Open http://localhost:8000
echo.
pause
