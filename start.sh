#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "Starting FastAPI on :8000 ..."
cd "$ROOT/fastapi"
if [ ! -d venv ]; then
  python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt -q
uvicorn main:app --reload --port 8000 &
FASTAPI_PID=$!

echo "Starting Vite on :5173 ..."
cd "$ROOT/frontend"
npm install -q
npm run dev &
VITE_PID=$!

echo ""
echo "  Frontend: http://localhost:5173"
echo "  API:      http://localhost:8000"
echo "  API docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $FASTAPI_PID $VITE_PID 2>/dev/null; exit 0" INT TERM
wait
