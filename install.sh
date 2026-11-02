#!/bin/bash

# Скрипт автоматической установки АСУ «Охрана труда»
# Использование: sudo ./install.sh

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функции вывода
info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Проверка прав root
if [ "$EUID" -ne 0 ]; then
  error "Скрипт должен быть запущен с правами root (sudo ./install.sh)"
fi

# Конфигурация
PROJECT_NAME="rcs_ot"
PROJECT_USER="rcs_ot"
PROJECT_DIR="/srv/$PROJECT_NAME"
PYTHON_VERSION="3.10"

echo ""
echo "=========================================="
echo "  АСУ «Охрана труда» - Установка"
echo "=========================================="
echo ""

# Проверка ОС
if ! command -v apt-get &> /dev/null; then
  error "Скрипт поддерживает только Debian/Ubuntu системы"
fi

# Обновление системы
info "Обновление системы..."
apt-get update -qq
apt-get upgrade -y -qq

# Установка зависимостей
info "Установка необходимых пакетов..."
apt-get install -y -qq \
  python3 \
  python3-pip \
  python3-venv \
  python3-dev \
  git \
  nginx \
  postgresql \
  postgresql-contrib \
  redis-server \
  curl \
  wget \
  build-essential

# Создание пользователя
info "Создание пользователя $PROJECT_USER..."
if id "$PROJECT_USER" &>/dev/null; then
  warn "Пользователь $PROJECT_USER уже существует"
else
  useradd -m -s /bin/bash $PROJECT_USER
  info "Пользователь $PROJECT_USER создан"
fi

# Создание директории проекта
info "Создание директории проекта..."
mkdir -p $PROJECT_DIR
chown $PROJECT_USER:$PROJECT_USER $PROJECT_DIR

# Копирование файлов проекта
info "Копирование файлов проекта..."
if [ -d "./app" ]; then
  cp -r ./* $PROJECT_DIR/
  chown -R $PROJECT_USER:$PROJECT_USER $PROJECT_DIR
else
  warn "Файлы проекта не найдены в текущей директории"
  warn "Скопируйте файлы проекта в $PROJECT_DIR вручную"
fi

# Переход в директорию проекта
cd $PROJECT_DIR

# Создание виртуального окружения
info "Создание виртуального окружения Python..."
sudo -u $PROJECT_USER python3 -m venv .venv

# Активация и установка зависимостей
info "Установка Python зависимостей..."
sudo -u $PROJECT_USER bash -c "source .venv/bin/activate && pip install --upgrade pip -q"
sudo -u $PROJECT_USER bash -c "source .venv/bin/activate && pip install -r requirements.txt -q"

# Создание директорий
info "Создание необходимых директорий..."
sudo -u $PROJECT_USER mkdir -p data uploads logs backups
chmod 755 data uploads logs backups

# Настройка PostgreSQL
info "Настройка PostgreSQL..."
read -p "Использовать PostgreSQL? (y/n) [n]: " use_postgres
use_postgres=${use_postgres:-n}

if [ "$use_postgres" = "y" ]; then
  # Запуск PostgreSQL
  systemctl start postgresql
  systemctl enable postgresql
  
  # Создание базы данных и пользователя
  read -p "Пароль для PostgreSQL: " -s pg_password
  echo ""
  
  sudo -u postgres psql -c "CREATE USER $PROJECT_USER WITH PASSWORD '$pg_password';" || warn "Пользователь уже существует"
  sudo -u postgres psql -c "CREATE DATABASE $PROJECT_NAME OWNER $PROJECT_USER;" || warn "База данных уже существует"
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $PROJECT_NAME TO $PROJECT_USER;"
  
  info "PostgreSQL настроена"
  DB_URL="postgresql://$PROJECT_USER:$pg_password@localhost:5432/$PROJECT_NAME"
else
  DB_URL="sqlite:///data/$PROJECT_NAME.db"
  info "Будет использоваться SQLite"
fi

# Настройка Redis
info "Настройка Redis..."
read -p "Использовать Redis для кэширования? (y/n) [n]: " use_redis
use_redis=${use_redis:-n}

if [ "$use_redis" = "y" ]; then
  systemctl start redis
  systemctl enable redis
  CACHE_BACKEND="redis"
  REDIS_URL="redis://localhost:6379/0"
  info "Redis настроен"
else
  CACHE_BACKEND="memory"
  REDIS_URL=""
  info "Будет использоваться in-memory кэш"
fi

# Генерация секретного ключа
info "Генерация секретного ключа..."
SECRET_KEY=$(sudo -u $PROJECT_USER python3 -c "import secrets; print(secrets.token_urlsafe(64))")

# Создание .env файла
info "Создание конфигурационного файла..."
cat > $PROJECT_DIR/.env << EOF
# Путь к проекту
RCS_OT_HOME=$PROJECT_DIR

# База данных
DATABASE_URL=$DB_URL

# Секретный ключ
SECRET_KEY=$SECRET_KEY

# Администратор
ADMIN_USERNAME=admin
ADMIN_PASSWORD=$(openssl rand -base64 12)
ADMIN_EMAIL=admin@example.com
ADMIN_FULL_NAME=Администратор системы

# Логирование
LOG_LEVEL=INFO
LOG_FILE=logs/app.log

# Кэш
CACHE_BACKEND=$CACHE_BACKEND
REDIS_URL=$REDIS_URL

# Сессии
SESSION_TIMEOUT=30
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTPONLY=true

# Безопасность
MAX_LOGIN_ATTEMPTS=5
PASSWORD_MIN_LENGTH=8

# Загрузки
UPLOAD_MAX_SIZE=52428800

# SMTP (настройте позже)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
SMTP_USE_TLS=true

# Уведомления
NOTIFICATION_EMAIL_ENABLED=false

# Timezone
TIMEZONE=Europe/Moscow
LANGUAGE=ru

# Debug
DEBUG=false
EOF

chown $PROJECT_USER:$PROJECT_USER $PROJECT_DIR/.env
chmod 600 $PROJECT_DIR/.env

# Инициализация базы данных
info "Инициализация базы данных..."
sudo -u $PROJECT_USER bash -c "source .venv/bin/activate && python -m app.cli migrate"
sudo -u $PROJECT_USER bash -c "source .venv/bin/activate && python -m app.cli create-admin"
sudo -u $PROJECT_USER bash -c "source .venv/bin/activate && python -m app.cli init-data"

# Настройка systemd
info "Настройка systemd сервиса..."
cp deploy/rcs_ot.service /etc/systemd/system/
sed -i "s|/path/to/rcs_ot|$PROJECT_DIR|g" /etc/systemd/system/rcs_ot.service
sed -i "s|rcs_ot_user|$PROJECT_USER|g" /etc/systemd/system/rcs_ot.service

systemctl daemon-reload
systemctl enable rcs_ot
systemctl start rcs_ot

# Настройка nginx
info "Настройка nginx..."
read -p "Домен для приложения (например, ot.example.com): " domain
domain=${domain:-ot.example.com}

cp deploy/nginx.conf /etc/nginx/sites-available/$PROJECT_NAME
sed -i "s/ot.example.com/$domain/g" /etc/nginx/sites-available/$PROJECT_NAME
sed -i "s|/path/to/rcs_ot|$PROJECT_DIR|g" /etc/nginx/sites-available/$PROJECT_NAME

ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx

# Настройка firewall
info "Настройка firewall..."
if command -v ufw &> /dev/null; then
  ufw allow 22/tcp
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw --force enable
  info "Firewall настроен"
else
  warn "UFW не установлен, пропуск настройки firewall"
fi

# SSL сертификат
info "Настройка SSL..."
read -p "Установить SSL сертификат Let's Encrypt? (y/n) [n]: " install_ssl
install_ssl=${install_ssl:-n}

if [ "$install_ssl" = "y" ]; then
  apt-get install -y -qq certbot python3-certbot-nginx
  certbot --nginx -d $domain --non-interactive --agree-tos --email admin@$domain
  
  # Настройка автообновления
  (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet") | crontab -
  info "SSL сертификат установлен"
else
  warn "SSL не настроен. Настройте вручную: certbot --nginx -d $domain"
fi

# Создание скрипта бэкапа
info "Создание скрипта резервного копирования..."
cat > $PROJECT_DIR/backup.sh << 'BACKUP_EOF'
#!/bin/bash
BACKUP_DIR="/srv/rcs_ot/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/rcs_ot_backup_$DATE.tar.gz"

tar -czf $BACKUP_FILE -C /srv/rcs_ot data/ uploads/ .env 2>/dev/null
ls -t $BACKUP_DIR/*.tar.gz | tail -n +8 | xargs -r rm

echo "Backup created: $BACKUP_FILE"
BACKUP_EOF

chmod +x $PROJECT_DIR/backup.sh
chown $PROJECT_USER:$PROJECT_USER $PROJECT_DIR/backup.sh

# Добавление в cron
(crontab -l 2>/dev/null; echo "0 2 * * * $PROJECT_DIR/backup.sh") | crontab -
info "Резервное копирование настроено (ежедневно в 2:00)"

# Вывод информации
echo ""
echo "=========================================="
echo "  Установка завершена!"
echo "=========================================="
echo ""
echo "Доступ к системе:"
echo "  URL: http://$domain"
if [ "$install_ssl" = "y" ]; then
  echo "  URL: https://$domain"
fi
echo ""
echo "Учетные данные администратора:"
echo "  Логин: admin"
echo "  Пароль: $(grep ADMIN_PASSWORD $PROJECT_DIR/.env | cut -d'=' -f2)"
echo ""
echo "ВАЖНО: Сохраните пароль и измените его при первом входе!"
echo ""
echo "Полезные команды:"
echo "  systemctl status rcs_ot    - статус сервиса"
echo "  systemctl restart rcs_ot   - перезапуск сервиса"
echo "  journalctl -u rcs_ot -f    - логи в реальном времени"
echo "  $PROJECT_DIR/backup.sh     - создать резервную копию"
echo ""
echo "Документация: $PROJECT_DIR/README.md"
echo ""
