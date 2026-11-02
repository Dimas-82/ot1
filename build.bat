@echo off
chcp 65001 >nul
echo.
echo ==========================================
echo   АСУ "Охрана труда" - Сборка фронтенда
echo ==========================================
echo.

:: Проверка наличия Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ОШИБКА] Node.js не найден!
    echo.
    echo Для сборки фронтенда необходим Node.js:
    echo https://nodejs.org/
    echo.
    echo Если вы не планируете изменять фронтенд,
    echo этот шаг можно пропустить.
    echo.
    pause
    exit /b 1
)

echo [INFO] Node.js найден:
node --version
echo.

:: Проверка наличия package.json
if not exist package.json (
    echo [ОШИБКА] Файл package.json не найден!
    echo.
    echo Убедитесь, что вы находитесь в корневой папке проекта.
    echo.
    pause
    exit /b 1
)

:: Установка зависимостей
echo [INFO] Установка зависимостей npm...
call npm install
if errorlevel 1 (
    echo [ОШИБКА] Не удалось установить зависимости npm
    pause
    exit /b 1
)
echo [OK] Зависимости установлены
echo.

:: Сборка проекта
echo [INFO] Сборка фронтенда...
call npm run build
if errorlevel 1 (
    echo [ОШИБКА] Не удалось собрать фронтенд
    pause
    exit /b 1
)
echo [OK] Фронтенд собран
echo.

:: Копирование в backend
echo [INFO] Копирование файлов в backend...
if exist backend\dist (
    rmdir /s /q backend\dist
)
xcopy /e /i /q dist backend\dist
if errorlevel 1 (
    echo [ОШИБКА] Не удалось скопировать файлы
    pause
    exit /b 1
)
echo [OK] Файлы скопированы в backend\dist
echo.

echo ==========================================
echo   Сборка завершена успешно!
echo ==========================================
echo.
echo Фронтенд собран и скопирован в папку backend\dist
echo.
echo Теперь вы можете запустить приложение:
echo   1. Перейдите в папку backend
echo   2. Запустите run.bat
echo   3. Откройте http://localhost:8000
echo.
pause
