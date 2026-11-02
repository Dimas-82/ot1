# АСУ «Охрана труда» — Руководство по развертыванию

## 📋 Содержание

1. [Требования](#требования)
2. [Быстрый старт](#быстрый-старт)
3. [Ручная установка](#ручная-установка)
4. [Конфигурация](#конфигурация)
5. [Production-развертывание](#production-развертывание)
6. [Обновление](#обновление)
7. [Резервное копирование](#резервное-копирование)
8. [Устранение неполадок](#устранение-неполадок)

---

## 🔧 Требования

### Минимальные
- **ОС:** Linux (Ubuntu 20.04+, Debian 11+, CentOS 8+)
- **Python:** 3.10 или выше
- **RAM:** 2 GB
- **Диск:** 5 GB свободного места
- **Порты:** 80 (HTTP), 443 (HTTPS)

### Рекомендуемые
- **ОС:** Ubuntu 22.04 LTS
- **Python:** 3.11+
- **RAM:** 4 GB
- **Диск:** 20 GB SSD
- **PostgreSQL:** 14+ (опционально, для production)
- **Redis:** 6+ (опционально, для кэширования)
- **Nginx:** 1.18+ (для reverse proxy)

---

## 🚀 Быстрый старт

### Автоматическая установка (рекомендуется)

```bash
# 1. Скачайте скрипт установки
curl -O https://your-server.com/rcs_ot/install.sh

# 2. Сделайте исполняемым
chmod +x install.sh

# 3. Запустите установку
sudo ./install.sh

# 4. Следуйте инструкциям на экране
```

Скрипт автоматически:
- Создаст пользователя `rcs_ot`
- Установит зависимости
- Настроит базу данных
- Создаст администратора
- Настроит systemd-сервис
- Настроит nginx (опционально)

---

## 📥 Ручная установка

### Шаг 1: Подготовка сервера

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка необходимых пакетов
sudo apt install -y python3 python3-pip python3-venv git nginx

# Создание пользователя для приложения
sudo useradd -m -s /bin/bash rcs_ot
sudo usermod -aG sudo rcs_ot
```

### Шаг 2: Клонирование проекта

```bash
# Переход в директорию
cd /srv
sudo git clone https://your-repo.com/rcs_ot.git
sudo chown -R rcs_ot:rcs_ot rcs_ot

# Переход в проект
cd rcs_ot
sudo -u rcs_ot bash
```

### Шаг 3: Создание виртуального окружения

```bash
# Создание venv
python3 -m venv .venv

# Активация
source .venv/bin/activate

# Обновление pip
pip install --upgrade pip

# Установка зависимостей
pip install -r requirements.txt
```

### Шаг 4: Конфигурация

```bash
# Копирование шаблона конфигурации
cp .env.example .env

# Редактирование конфигурации
nano .env
```

Минимальная конфигурация `.env`:

```bash
# Путь к проекту
RCS_OT_HOME=/srv/rcs_ot

# База данных (SQLite для тестирования)
DATABASE_URL=sqlite:///data/rcs_ot.db

# Для PostgreSQL (production):
# DATABASE_URL=postgresql://rcs_ot:password@localhost:5432/rcs_ot

# Секретный ключ (обязательно измените!)
SECRET_KEY=your-super-secret-key-change-this-in-production

# Администратор
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
ADMIN_EMAIL=admin@example.com

# Логирование
LOG_LEVEL=INFO
LOG_FILE=logs/app.log

# Кэш (memory для тестирования, redis для production)
CACHE_BACKEND=memory
# REDIS_URL=redis://localhost:6379/0

# SMTP (для отправки уведомлений)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=АСУ ОТ <noreply@example.com>

# Безопасность
SESSION_TIMEOUT=30  # минуты
MAX_LOGIN_ATTEMPTS=5
PASSWORD_MIN_LENGTH=8

# Загрузки
UPLOAD_MAX_SIZE=52428800  # 50 MB
```

### Шаг 5: Инициализация базы данных

```bash
# Убедитесь, что активировано виртуальное окружение
source .venv/bin/activate

# Создание таблиц
python -m app.cli migrate

# Создание администратора
python -m app.cli create-admin

# Загрузка начальных данных (модули, маршруты)
python -m app.cli init-data

# Проверка
python -m app.cli status
```

### Шаг 6: Создание директорий

```bash
# Создание необходимых директорий
mkdir -p data uploads logs backups

# Установка прав
chmod 755 data uploads logs backups
```

### Шаг 7: Тестовый запуск

```bash
# Запуск в режиме разработки
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Откройте браузер: http://your-server-ip:8000
# Войдите под администратором
```

---

## ⚙️ Конфигурация

### Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `RCS_OT_HOME` | Путь к проекту | `/srv/rcs_ot` |
| `DATABASE_URL` | Строка подключения к БД | `sqlite:///data/rcs_ot.db` |
| `SECRET_KEY` | Секретный ключ для JWT | **Обязательно изменить!** |
| `ADMIN_USERNAME` | Логин администратора | `admin` |
| `ADMIN_PASSWORD` | Пароль администратора | **Обязательно изменить!** |
| `LOG_LEVEL` | Уровень логирования | `INFO` |
| `CACHE_BACKEND` | Тип кэша (`memory`/`redis`) | `memory` |
| `SESSION_TIMEOUT` | Таймаут сессии (минуты) | `30` |

### Настройка PostgreSQL (опционально)

```bash
# Установка PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Создание базы данных и пользователя
sudo -u postgres psql

CREATE DATABASE rcs_ot;
CREATE USER rcs_ot WITH ENCRYPTED PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE rcs_ot TO rcs_ot;
\q

# Обновите .env
DATABASE_URL=postgresql://rcs_ot:your-password@localhost:5432/rcs_ot

# Пересоздайте миграции
python -m app.cli migrate
```

### Настройка Redis (опционально)

```bash
# Установка Redis
sudo apt install -y redis-server

# Запуск
sudo systemctl enable redis
sudo systemctl start redis

# Обновите .env
CACHE_BACKEND=redis
REDIS_URL=redis://localhost:6379/0
```

---

## 🌐 Production-развертывание

### Вариант 1: Systemd (рекомендуется)

```bash
# Копирование systemd-юнита
sudo cp deploy/rcs_ot.service /etc/systemd/system/

# Редактирование путей (если нужно)
sudo nano /etc/systemd/system/rcs_ot.service

# Перезагрузка systemd
sudo systemctl daemon-reload

# Включение автозапуска
sudo systemctl enable rcs_ot

# Запуск сервиса
sudo systemctl start rcs_ot

# Проверка статуса
sudo systemctl status rcs_ot

# Просмотр логов
sudo journalctl -u rcs_ot -f
```

### Вариант 2: Gunicorn + Nginx

#### Gunicorn

```bash
# Установка gunicorn
pip install gunicorn

# Запуск
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 127.0.0.1:8000 \
  --access-logfile /srv/rcs_ot/logs/access.log \
  --error-logfile /srv/rcs_ot/logs/error.log \
  --daemon
```

#### Nginx

```bash
# Копирование конфигурации
sudo cp deploy/nginx.conf /etc/nginx/sites-available/rcs_ot

# Создание симлинка
sudo ln -s /etc/nginx/sites-available/rcs_ot /etc/nginx/sites-enabled/

# Удаление стандартного сайта (опционально)
sudo rm /etc/nginx/sites-enabled/default

# Проверка конфигурации
sudo nginx -t

# Перезагрузка nginx
sudo systemctl reload nginx
```

### SSL-сертификат (Let's Encrypt)

```bash
# Установка certbot
sudo apt install -y certbot python3-certbot-nginx

# Получение сертификата
sudo certbot --nginx -d ot.example.com

# Автообновление
sudo certbot renew --dry-run
```

---

## 🔄 Обновление

```bash
# Перейти в директорию проекта
cd /srv/rcs_ot
sudo -u rcs_ot bash

# Остановить сервис
sudo systemctl stop rcs_ot

# Получить обновления
git pull origin main

# Активировать venv
source .venv/bin/activate

# Обновить зависимости
pip install -r requirements.txt --upgrade

# Применить миграции
python -m app.cli migrate

# Запустить сервис
sudo systemctl start rcs_ot

# Проверить статус
sudo systemctl status rcs_ot
```

---

## 💾 Резервное копирование

### Автоматическое резервное копирование

```bash
# Создание скрипта бэкапа
nano /srv/rcs_ot/backup.sh
```

Содержимое `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/srv/rcs_ot/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/rcs_ot_backup_$DATE.tar.gz"

# Создание резервной копии
tar -czf $BACKUP_FILE \
  -C /srv/rcs_ot \
  data/ \
  uploads/ \
  .env \
  2>/dev/null

# Удаление старых бэкапов (оставить последние 7)
ls -t $BACKUP_DIR/*.tar.gz | tail -n +8 | xargs -r rm

echo "Backup created: $BACKUP_FILE"
```

```bash
# Сделать исполняемым
chmod +x /srv/rcs_ot/backup.sh

# Добавить в cron (ежедневно в 2:00)
crontab -e
# Добавить строку:
0 2 * * * /srv/rcs_ot/backup.sh
```

### Ручное резервное копирование

```bash
# Создать бэкап
/srv/rcs_ot/backup.sh

# Восстановление из бэкапа
cd /srv/rcs_ot
tar -xzf backups/rcs_ot_backup_20240115_020000.tar.gz
```

---

## 🔍 Устранение неполадок

### Сервис не запускается

```bash
# Проверить логи
sudo journalctl -u rcs_ot -n 50 --no-pager

# Проверить конфигурацию
python -m app.cli check-config

# Проверить права доступа
ls -la /srv/rcs_ot
sudo chown -R rcs_ot:rcs_ot /srv/rcs_ot
```

### Ошибки базы данных

```bash
# Проверить подключение к БД
python -m app.cli db-check

# Пересоздать миграции
python -m app.cli migrate --force

# Для SQLite: проверить права
chmod 664 /srv/rcs_ot/data/rcs_ot.db
```

### Проблемы с nginx

```bash
# Проверить конфигурацию
sudo nginx -t

# Проверить логи
sudo tail -f /var/log/nginx/error.log

# Перезапустить nginx
sudo systemctl restart nginx
```

### Высокая нагрузка

```bash
# Увеличить количество workers в systemd
sudo nano /etc/systemd/system/rcs_ot.service
# Изменить: --workers 8

# Перезапустить
sudo systemctl daemon-reload
sudo systemctl restart rcs_ot
```

---

## 📊 Мониторинг

### Просмотр логов

```bash
# Логи приложения
tail -f /srv/rcs_ot/logs/app.log

# Логи доступа
tail -f /srv/rcs_ot/logs/access.log

# Системные логи
sudo journalctl -u rcs_ot -f
```

### Статистика

```bash
# Статус системы
python -m app.cli status

# Статистика модулей
python -m app.cli modules stats

# Статистика пользователей
python -m app.cli users stats
```

---

## 🔒 Безопасность

### Рекомендации

1. **Измените SECRET_KEY** в `.env` на случайную строку:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(64))"
   ```

2. **Используйте HTTPS** (Let's Encrypt)

3. **Настройте firewall:**
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

4. **Регулярно обновляйте систему:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

5. **Ограничьте доступ к админке** по IP (в nginx):
   ```nginx
   location /admin {
       allow 192.168.1.0/24;
       deny all;
   }
   ```

6. **Включите двухфакторную аутентификацию** (если доступно)

7. **Регулярно делайте резервные копии**

---

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи: `sudo journalctl -u rcs_ot -n 100`
2. Проверьте конфигурацию: `python -m app.cli check-config`
3. Обратитесь к документации в разделе "Устранение неполадок"
4. Создайте issue в репозитории проекта

---

## 📝 Лицензия

© 2024 RCS Team. Все права защищены.
