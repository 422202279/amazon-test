#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-4173}"
RUNTIME_DIR="$ROOT_DIR/.runtime"

mkdir -p "$RUNTIME_DIR"

start_detached() {
  local log_file="$1"
  shift
  nohup "$@" >"$log_file" 2>&1 &
  echo $!
}

if lsof -iTCP:"$BACKEND_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Backend port $BACKEND_PORT is already in use."
  exit 1
fi

if lsof -iTCP:"$FRONTEND_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Frontend port $FRONTEND_PORT is already in use."
  exit 1
fi

cd "$ROOT_DIR/backend"
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate
pip install -r requirements.txt >/dev/null
mkdir -p data/uploads data/exports data/backups

backend_pid="$(start_detached "$RUNTIME_DIR/backend.log" .venv/bin/uvicorn app.main:create_app --factory --host 127.0.0.1 --port "$BACKEND_PORT")"
echo "$backend_pid" >"$RUNTIME_DIR/backend.pid"

cd "$ROOT_DIR"
frontend_pid="$(start_detached "$RUNTIME_DIR/frontend.log" python3 -m http.server "$FRONTEND_PORT" --directory prototype)"
echo "$frontend_pid" >"$RUNTIME_DIR/frontend.pid"

sleep 3

echo "Demo started."
echo "Frontend: http://127.0.0.1:$FRONTEND_PORT/login.html"
echo "Backend:  http://127.0.0.1:$BACKEND_PORT/api/health"
echo "Account:  admin@cb-monitor.local"
echo "Password: admin123456"
