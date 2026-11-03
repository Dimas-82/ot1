#!/usr/bin/env bash
# Запуск АСУ ОТ (Linux/Ubuntu). Первый запуск — ./deploy.sh
cd "$(dirname "$0")"
if [ ! -d venv ]; then python3 -m venv venv; venv/bin/pip install -r requirements.txt; fi
exec venv/bin/gunicorn -w 2 -b 0.0.0.0:${ASUOT_PORT:-8080} app:app
