@echo off
chcp 65001 >nul
echo.
echo ==========================================
echo   АСУ "Охрана труда" - Установка
echo ==========================================
echo.

:: Проверка наличия Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ОШИБКА] Python не найден!
    echo.
    echo Установите Python 3.10 или выше:
    echo https://www.python.org/downloads/
    echo.
    echo При установке обязательно отметьте "Add Python to PATH"
    echo.
    pause
    exit /b 1
)

echo [INFO] Python найден:
python --version
echo.

:: Создание виртуального окружения
echo [INFO] Создание виртуального окружения...
if exist venv (
    echo [WARN] Виртуальное окружение уже существует
) else (
    python -m venv venv
    if errorlevel 1 (
        echo [ОШИБКА] Не удалось создать виртуальное окружение
        pause
        exit /b 1
    )
    echo [OK] Виртуальное окружение создано
)
echo.

:: Активация виртуального окружения
echo [INFO] Активация виртуального окружения...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo [ОШИБКА] Не удалось активировать виртуальное окружение
    pause
    exit /b 1
)
echo [OK] Виртуальное окружение активировано
echo.

:: Обновление pip
echo [INFO] Обновление pip...
python -m pip install --upgrade pip --quiet
echo [OK] pip обновлен
echo.

:: Установка зависимостей
echo [INFO] Установка зависимостей Python...
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo [ОШИБКА] Не удалось установить зависимости
    pause
    exit /b 1
)
echo [OK] Зависимости установлены
echo.

:: Создание директорий
echo [INFO] Создание необходимых директорий...
if not exist data mkdir data
if not exist uploads mkdir uploads
if not exist logs mkdir logs
if not exist backups mkdir backups
echo [OK] Директории созданы
echo.

:: Создание .env файла
echo [INFO] Создание конфигурационного файла...
if not exist .env (
    (
        echo # База данных
        echo DATABASE_URL=sqlite:///./data/rcs_ot.db
        echo.
        echo # Секретный ключ
        echo SECRET_KEY=change-this-to-random-string-min-32-chars-long-in-production
        echo.
        echo # Настройки приложения
        echo DEBUG=true
    ) > .env
    echo [OK] Файл .env создан
    echo.
    echo [ВАЖНО] Отредактируйте файл .env и измените SECRET_KEY!
) else (
    echo [WARN] Файл .env уже существует
)
echo.

:: Инициализация базы данных
echo [INFO] Инициализация базы данных...
python -c "from main import init_data; init_data()"
if errorlevel 1 (
    echo [ОШИБКА] Не удалось инициализировать базу данных
    pause
    exit /b 1
)
echo [OK] База данных инициализирована
echo.

echo ==========================================
echo   Установка завершена успешно!
echo ==========================================
echo.
echo Учетные данные для входа:
echo   Логин: admin
echo   Пароль: admin123
echo.
echo   Логин: safety
echo   Пароль: safety123
echo.
echo [ВАЖНО] Измените пароли при первом входе!
echo.
echo Для запуска приложения выполните: run.bat
echo.
pause
