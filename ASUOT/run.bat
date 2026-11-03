@echo off
rem Запуск АСУ ОТ на Windows (dev-сервер waitress)
cd /d %~dp0
if not exist venv (py -3 -m venv venv & venv\Scripts\pip install -r requirements.txt)
venv\Scripts\python -m waitress --listen=0.0.0.0:8080 app:app
