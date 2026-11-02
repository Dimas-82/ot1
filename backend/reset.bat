@echo off
chcp 65001 >nul
echo.
echo ==========================================
echo   АСУ "Охрана труда" - Сброс базы данных
echo ==========================================
echo.
echo [ВНИМАНИЕ] Это действие удалит все данные!
echo.
set /p confirm=Вы уверены? (y/n): 
if /i not "%confirm%"=="y" (
    echo Отменено.
    pause
    exit /b 0
)

echo.
echo [INFO] Удаление базы данных...
if exist data\rcs_ot.db (
    del data\rcs_ot.db
    echo [OK] База данных удалена
) else (
    echo [WARN] База данных не найдена
)
echo.

echo [INFO] Инициализация новой базы данных...
if exist venv (
    call venv\Scripts\activate.bat
    python -c "from main import init_data; init_data()"
    echo [OK] База данных инициализирована
) else (
    echo [ОШИБКА] Виртуальное окружение не найдено!
    echo Сначала выполните установку: setup.bat
)
echo.

echo ==========================================
echo   Сброс завершен!
echo ==========================================
echo.
echo Учетные данные для входа:
echo   Логин: admin
echo   Пароль: admin123
echo.
echo   Логин: safety
echo   Пароль: safety123
echo.
pause
