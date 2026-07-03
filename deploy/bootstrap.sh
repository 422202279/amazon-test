#!/usr/bin/env bash
set -euo pipefail

APP_DIR=${APP_DIR:-/opt/cb-monitor}
PYTHON_BIN=${PYTHON_BIN:-python3}

mkdir -p "$APP_DIR"
mkdir -p "$APP_DIR/data/uploads" "$APP_DIR/data/exports" "$APP_DIR/data/backups"

cd "$APP_DIR"

if [ ! -d "backend/.venv" ]; then
  "$PYTHON_BIN" -m venv backend/.venv
fi

source backend/.venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt

if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  cp .env.example .env
fi

echo "Bootstrap completed for $APP_DIR"
