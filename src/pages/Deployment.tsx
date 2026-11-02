import { Server, Terminal, FileText, CheckCircle } from 'lucide-react';

export default function Deployment() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Развёртывание на сервере</h1>
        <p className="text-gray-500 mt-1">Пошаговая инструкция установки и запуска АСУ ОТ</p>
      </div>

      <div className="card bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Требования:</strong> Linux-сервер с Python 3.10+, nginx (опционально), systemd. 
          Docker и Node.js <strong>не обязательны</strong>. Весь проект размещается в <code className="bg-blue-100 px-1 rounded">rcs_ot/</code>.
        </p>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-green-600" /> Шаг 1: Клонирование и структура
        </h3>
        <div className="code-block bg-gray-900">
          <pre className="text-green-400 text-sm p-4 overflow-x-auto">
{`# Размещение проекта
cd /srv
git clone <repo-url> rcs_ot
cd rcs_ot

# Структура проекта:
# rcs_ot/
#   app/           — исходный код (core, auth, admin, api, templates, static)
#   modules/       — модули предметной области
#   migrations/    — миграции БД (Alembic)
#   data/          — SQLite-БД (rcs_ot.db)
#   uploads/       — загруженные файлы
#   logs/          — логи приложения
#   backups/       — резервные копии
#   deploy/        — шаблоны systemd, nginx
#   tests/         — тесты
#   docs/          — документация
#   .env.example   — шаблон конфигурации
#   requirements.txt
#   run.py`}
          </pre>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-green-600" /> Шаг 2: Виртуальное окружение
        </h3>
        <div className="code-block bg-gray-900">
          <pre className="text-green-400 text-sm p-4 overflow-x-auto">
{`cd /srv/rcs_ot

# Создание виртуального окружения
python3 -m venv .venv

# Активация
source .venv/bin/activate

# Установка зависимостей
pip install -r requirements.txt

# Проверка
python3 -c "import fastapi; print(fastapi.__version__)"`}
          </pre>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" /> Шаг 3: Конфигурация
        </h3>
        <div className="code-block bg-gray-900">
          <pre className="text-green-400 text-sm p-4 overflow-x-auto">
{`# Копирование шаблона конфигурации
cp .env.example .env

# Редактирование .env
nano .env

# Содержимое .env:
# RCS_OT_HOME=/srv/rcs_ot
# DATABASE_URL=sqlite:///data/rcs_ot.db
# SECRET_KEY=<generate-random-64-chars>
# ADMIN_USERNAME=admin
# ADMIN_PASSWORD=<change-me>
# LOG_LEVEL=INFO
# CACHE_BACKEND=memory  # или redis
# REDIS_URL=redis://localhost:6379/0  # если Redis
# SMTP_HOST=localhost
# SMTP_PORT=587
# UPLOAD_MAX_SIZE=52428800  # 50MB`}
          </pre>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-green-600" /> Шаг 4: Инициализация БД
        </h3>
        <div className="code-block bg-gray-900">
          <pre className="text-green-400 text-sm p-4 overflow-x-auto">
{`cd /srv/rcs_ot
source .venv/bin/activate

# Создание миграций и применение
python3 -m app.cli migrate

# Создание учётной записи администратора
python3 -m app.cli create-admin

# Проверка модулей
python3 -m app.cli modules list

# Загрузка начальных маршрутов
python3 -m app.cli routes import --file data/default_routes.json`}
          </pre>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-purple-600" /> Шаг 5: Запуск
        </h3>
        <div className="code-block bg-gray-900">
          <pre className="text-green-400 text-sm p-4 overflow-x-auto">
{`# Вариант A: Прямой запуск (для разработки/тестирования)
cd /srv/rcs_ot
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

# Вариант B: Gunicorn (production)
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker \\
  --bind 0.0.0.0:8000 --access-logfile logs/access.log

# Вариант C: systemd (рекомендуется)
# Скопировать шаблон:
sudo cp deploy/rcs_ot.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable rcs_ot
sudo systemctl start rcs_ot
sudo systemctl status rcs_ot`}
          </pre>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">systemd-шаблон (rcs_ot/deploy/rcs_ot.service)</h3>
        <div className="code-block bg-gray-900">
          <pre className="text-green-400 text-sm p-4 overflow-x-auto">
{`[Unit]
Description=АСУ Охрана Труда
After=network.target postgresql.service

[Service]
Type=exec
User=rcs_ot
Group=rcs_ot
WorkingDirectory=/srv/rcs_ot
Environment="RCS_OT_HOME=/srv/rcs_ot"
ExecStart=/srv/rcs_ot/.venv/bin/gunicorn app.main:app \\
  -w 4 -k uvicorn.workers.UvicornWorker \\
  --bind 127.0.0.1:8000 \\
  --access-logfile /srv/rcs_ot/logs/access.log \\
  --error-logfile /srv/rcs_ot/logs/error.log
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target`}
          </pre>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Nginx-шаблон (rcs_ot/deploy/nginx.conf)</h3>
        <div className="code-block bg-gray-900">
          <pre className="text-green-400 text-sm p-4 overflow-x-auto">
{`server {
    listen 80;
    server_name ot.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ot.example.com;

    ssl_certificate /etc/letsencrypt/live/ot.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ot.example.com/privkey.pem;

    client_max_body_size 50M;

    location /static/ {
        alias /srv/rcs_ot/app/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /uploads/ {
        alias /srv/rcs_ot/uploads/;
        internal;  # только через X-Accel-Redirect
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`}
          </pre>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" /> Чек-лист готовности MVP
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            'Ядро: DI, Event Bus, Module Loader',
            'Аутентификация (JWT/сессии)',
            'RBAC с 6 ролями',
            'Динамическая маршрутизация из БД',
            'Hot-reload маршрутов',
            'Журнал аудита',
            'Веб-админка (модули, маршруты, пользователи)',
            'REST API с OpenAPI',
            'Миграции Alembic',
            'Файловое хранилище',
            'Планировщик задач',
            'Уведомления (in-app, email)',
            'Модуль «Инциденты»',
            'Модуль «Инструктажи»',
            'Модуль «СИЗ»',
            'Тесты ядра ≥ 80%',
            'README + документация',
            'systemd + nginx шаблоны',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-sm text-green-800">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
