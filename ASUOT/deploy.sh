#!/usr/bin/env bash
# Комплексное развертывание АСУ ОТ на Ubuntu 20.04+ (systemd + gunicorn)
set -e
SUDO=$(command -v sudo || true)
$SUDO apt-get update -y
$SUDO apt-get install -y python3 python3-venv python3-pip
DIR=${1:-/opt/ASUOT}
if [ "$(pwd)" != "$DIR" ]; then sudo mkdir -p $DIR && sudo cp -r $(dirname $0)/. $DIR/; fi
cd $DIR
python3 -m venv venv
venv/bin/pip install --upgrade pip
venv/bin/pip install -r requirements.txt
venv/bin/python -c "import app; app.init_db()"
$SUDO useradd -r -s /sbin/nologin asuot 2>/dev/null || true
$SUDO chown -R asuot: $DIR
$SUDO cp asuot.service /etc/systemd/system/asuot.service
$SUDO systemctl daemon-reload
$SUDO systemctl enable --now asuot
echo "АСУ ОТ запущена: http://$(hostname -I | awk '{print $1}'):8080 (admin/admin123)"
