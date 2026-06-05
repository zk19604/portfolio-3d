# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start both servers (recommended)
./start.sh

# Frontend only (http://localhost:5173)
cd frontend && npm run dev

# Backend only (http://localhost:8000)
cd fastapi && source venv/bin/activate && uvicorn main:app --reload --port 8000

# Frontend lint
cd frontend && npm run lint

# Frontend production build
cd frontend && npm run build

# Install frontend deps
cd frontend && npm install

# Install backend deps (first time)
cd fastapi && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
```

## Architecture

This is a monorepo with two independent services:

### Vite asset imports
Binary assets (`.glb`, `.fbx`) must be imported with the `?url` suffix so Vite/Rolldown emits them as static assets instead of attempting to parse them as JS modules: `import walkingGlb from '../assets/walking.glb?url'`.

### Data layer — `data.tsx` (project root)
Single source of truth for all portfolio content: `EDUCATION`, `PROJECTS`, `SKILL_GROUPS`, `EXPERIENCE`, `CONTACT_LINKS`. This is a TypeScript file at the root (not inside `frontend/`) — it needs to be copied or imported by the frontend. When updating portfolio content, edit this file only.

### Frontend — `frontend/`
React 19 + Vite app. The 3D scene is built with `@react-three/fiber` and `@react-three/drei`, with physics via `@react-three/rapier`. Styling is Tailwind CSS v3 (dark futuristic theme). `frontend/src/App.jsx` is currently the Vite boilerplate starter and needs to be replaced with the actual portfolio UI. Components and hooks live in `frontend/src/components/` and `frontend/src/hooks/` (both currently empty). The 3D character asset is at `frontend/src/assets/walking.glb`.

### Backend — `fastapi/`
FastAPI app with a single route `POST /api/ask` that calls a thin RAG pipeline (`rag.py` → `gemini_client.py`). The RAG layer is currently just a system-prompt wrapper around Gemini (`gemini-1.5-flash`) — no vector store yet. CORS is locked to `http://localhost:5173`. The Gemini API key lives in `fastapi/.env` as `GEMINI_API_KEY`.

### AI / RAG pipeline
`rag.py` constructs the prompt from `PORTFOLIO_CONTEXT` (a hardcoded system prompt) + the user question and sends it to Gemini via `gemini_client.py`. To give the AI real knowledge of the portfolio, the content from `data.tsx` should be injected into `PORTFOLIO_CONTEXT` in `rag.py`.
