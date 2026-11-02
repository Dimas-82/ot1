# 📦 АСУ "Охрана труда" - Полный список файлов

## 🎯 Быстрый старт

**Для Windows:**
1. Откройте `START_HERE.md` - краткая инструкция
2. Запустите `backend/setup.bat` - установка
3. Запустите `backend/run.bat` - запуск сервера
4. Откройте http://localhost:8000

**Для Linux:**
1. Откройте `README.md` - полная документация
2. Запустите `sudo ./install.sh` - автоматическая установка

---

## 📁 Структура проекта

### Корневая папка
```
├── START_HERE.md              ⭐ Начните отсюда!
├── QUICKSTART_WINDOWS.md      Краткая инструкция для Windows
├── README.md                  Основная документация
├── WINDOWS_DEPLOYMENT.md      Техническое описание для Windows
├── PROJECT_STRUCTURE.md       Структура проекта
│
├── quickstart.bat             Быстрый старт (Windows)
├── build.bat                  Сборка фронтенда (Windows)
├── install.sh                 Установка (Linux)
│
├── package.json               Зависимости Node.js
├── package-lock.json          Lock-файл npm
├── tsconfig.json              Конфигурация TypeScript
├── vite.config.js             Конфигурация Vite
├── requirements.txt           Зависимости Python (Linux)
│
├── index.html                 HTML шаблон
├── src/                       Frontend исходники
└── backend/                   Backend приложение
```

### Frontend (src/)
```
src/
├── main.tsx                   Точка входа
├── App.tsx                    Главный компонент
├── index.css                  Стили
├── types.ts                   Типы TypeScript
├── store.ts                   Хранилище данных
└── hooks/
    └── useStore.ts            React hook для store
```

### Backend (backend/)
```
backend/
├── main.py                    ⭐ Основной файл приложения
├── requirements.txt           Зависимости Python
├── .env.example               Шаблон конфигурации
├── README_WINDOWS.md          Подробная документация
│
├── setup.bat                  Установка (Windows)
├── run.bat                    Запуск (Windows)
├── reset.bat                  Сброс БД (Windows)
│
├── venv/                      Виртуальное окружение (создается)
├── data/                      База данных (создается)
├── logs/                      Логи (создается)
├── uploads/                   Загрузки (создается)
└── backups/                   Резервные копии (создается)
```

### Deploy (deploy/)
```
deploy/
├── rcs_ot.service             Systemd unit (Linux)
└── nginx.conf                 Nginx конфигурация (Linux)
```

---

## 🚀 Скрипты для Windows

| Файл | Описание | Использование |
|------|----------|---------------|
| `quickstart.bat` | Быстрый старт | Дважды кликните |
| `build.bat` | Сборка фронтенда | После изменения frontend |
| `backend/setup.bat` | Установка backend | Первый запуск |
| `backend/run.bat` | Запуск сервера | Каждый запуск |
| `backend/reset.bat` | Сброс базы данных | Очистка данных |

---

## 📚 Документация

| Файл | Описание | Когда читать |
|------|----------|--------------|
| `START_HERE.md` | Краткая инструкция | **Первым делом** |
| `QUICKSTART_WINDOWS.md` | Быстрый старт Windows | Для быстрого старта |
| `backend/README_WINDOWS.md` | Полная документация Windows | Подробная информация |
| `README.md` | Основная документация | Linux и общее |
| `WINDOWS_DEPLOYMENT.md` | Техническое описание | Для разработчиков |
| `PROJECT_STRUCTURE.md` | Структура проекта | Обзор проекта |

---

## 🔐 Учетные данные

После установки доступны тестовые аккаунты:

**Администратор:**
- Логин: `admin`
- Пароль: `admin123`

**Инженер по ОТ:**
- Логин: `safety`
- Пароль: `safety123`

---

## 📊 Функциональность

### Модули системы
1. ✅ Дашборд - статистика и обзор
2. ✅ Инциденты - регистрация и расследование
3. ✅ Инструктажи - планирование и учет
4. ✅ СИЗ - выдача средств защиты
5. ✅ Медосмотры - планирование осмотров
6. ✅ Модули - управление модулями
7. ✅ Маршруты - управление API
8. ✅ Пользователи - управление доступом
9. ✅ Аудит - журнал действий
10. ✅ Настройки - конфигурация

### Роли пользователей
- **Администратор** - полный доступ
- **Инженер по ОТ** - управление модулями ОТ
- **Руководитель** - просмотр данных подразделения
- **Работник** - просмотр своих данных
- **Аудитор** - просмотр журнала аудита

---

## 🛠️ Технологии

### Backend
- Python 3.10+
- FastAPI
- SQLAlchemy
- SQLite (Windows) / PostgreSQL (Linux)
- JWT аутентификация
- Pydantic валидация

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router

---

## 📝 Использование

### Windows - Первый запуск
```cmd
1. Откройте START_HERE.md
2. Запустите backend/setup.bat
3. Запустите backend/run.bat
4. Откройте http://localhost:8000
```

### Windows - Последующие запуски
```cmd
1. Запустите backend/run.bat
2. Откройте http://localhost:8000
```

### Linux - Установка
```bash
sudo ./install.sh
```

### Linux - Запуск
```bash
cd backend
source venv/bin/activate
python main.py
```

---

## 🔧 Обслуживание

### Резервное копирование
```cmd
# Скопируйте папки:
backend/data/      # База данных
backend/uploads/   # Загруженные файлы
backend/.env       # Конфигурация
```

### Сброс базы данных
```cmd
backend/reset.bat
```

### Обновление зависимостей
```cmd
cd backend
venv\Scripts\activate
pip install -r requirements.txt --upgrade
```

---

## ⚠️ Важные замечания

### Безопасность
1. Измените пароль администратора
2. Измените SECRET_KEY в .env
3. Для production отключите DEBUG
4. Настройте firewall
5. Используйте HTTPS

### Ограничения
- SQLite подходит для небольших организаций
- Для production рекомендуется PostgreSQL
- Frontend работает с localStorage (демо)
- Для полной интеграции требуется доработка

---

## 🆘 Поддержка

### Решение проблем
1. Проверьте `START_HERE.md`
2. Проверьте `backend/README_WINDOWS.md`
3. Проверьте логи в `backend/logs/`
4. Попробуйте `backend/reset.bat`

### Контакты
Для вопросов обращайтесь к системному администратору.

---

## ✅ Статус проекта

**Готово к использованию:**
- ✅ Backend на Python/FastAPI
- ✅ Frontend на React/TypeScript
- ✅ Скрипты для Windows (.bat)
- ✅ Скрипты для Linux (.sh)
- ✅ База данных SQLite
- ✅ Тестовые данные
- ✅ Подробная документация
- ✅ Автоматическая установка
- ✅ Простой запуск

**Версия:** 1.0.0
**Дата:** 2024
**Лицензия:** © RCS Team

---

## 🎉 Готово!

Приложение полностью готово к развертыванию на Windows в виртуальном окружении venv.

**Для начала работы:**
1. Установите Python 3.10+
2. Запустите `backend/setup.bat`
3. Запустите `backend/run.bat`
4. Откройте http://localhost:8000

**Приятной работы!** 🚀
