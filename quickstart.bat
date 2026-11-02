@echo off
chcp 65001 >nul
echo.
echo ==========================================
echo   АСУ "Охрана труда" - Быстрый старт
echo ==========================================
echo.

:: Проверка наличия backend папки
if not exist backend (
    echo [ОШИБКА] Папка backend не найдена!
    echo.
    echo Убедитесь, что вы находитесь в корневой папке проекта.
    echo.
    pause
    exit /b 1
)

:: Проверка наличия виртуального окружения
if not exist backend\venv (
    echo [INFO] Виртуальное окружение не найдено.
    echo [INFO] Запуск установки...
    echo.
    cd backend
    call setup.bat
    cd ..
) else (
    echo [OK] Виртуальное окружение найдено
)
echo.

:: Запуск сервера
echo [INFO] Переход в папку backend...
cd backend
echo.
call run.bat
cd ..
