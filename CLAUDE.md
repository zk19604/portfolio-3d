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
React 19 + Vite app. Third-person game-like 3D portfolio inspired by Bruno Simon. Key files:

- **`App.jsx`** — Root orchestrator. Renders Scene + ZonePanel + DirectionControls. Owns `activeZone` state and `handleAskQuestion` callback.
- **`components/Scene.jsx`** — R3F Canvas. Contains: `Character` (Mixamo GLB + animation state machine), `FollowCamera` (smooth third-person camera), `ZoneArea` (4 zones with 3D structures), `Workstation` (visual prop only — no Html), `FloorGrid`, `HomeMarker`.
- **`components/ZonePanel.jsx`** — Right-side 2D overlay (380px, z-index 50). Shows AI terminal when `activeZone=null`, and zone-specific portfolio content when at a zone. Uses framer-motion AnimatePresence for slide-in.
- **`components/DirectionControls.jsx`** — D-pad HTML overlay + zone HUD. Dispatches to `useCharacterMovement`.
- **`hooks/useCharacterMovement.js`** — Keyboard listener, zone target positions.

**Critical patterns:**
- Binary assets: `import model from './foo.glb?url'` (Rolldown rejects raw binary)
- Imperative 3D transforms: set in `useEffect(() => { group.current.position.set(...) }, [])`, never as JSX props — R3F reconciler re-applies props on re-render
- `useAnimations` animation mutations: must happen inside `useFrame` via `configuredRef` guard (react-hooks/immutability v7 forbids mutations in `useEffect`)
- `characterRef`: created in Scene, passed as `groupRef` prop to Character AND to FollowCamera — this lets the camera read the character's live position/rotation without context
- FollowCamera: `camAngleRef=null` on init → snaps to correct position on first frame character loads. Camera angle lerps with lag (0.05/frame) for cinematic weight
- Zone content: `onAsk`/`isLoading` go to **ZonePanel**, not to Scene. Scene only gets `{ targetPosition, targetZone, onArrive }`
- Arrival: `arrivedAtRef.current !== targetZone` guard fires `onArrive` exactly once per zone visit at 60fps

### Backend — `fastapi/`
FastAPI app with a single route `POST /api/ask` that calls a thin RAG pipeline (`rag.py` → `gemini_client.py`). The RAG layer is currently just a system-prompt wrapper around Gemini (`gemini-1.5-flash`) — no vector store yet. CORS is locked to `http://localhost:5173`. The Gemini API key lives in `fastapi/.env` as `GEMINI_API_KEY`.

### AI / RAG pipeline
`rag.py` constructs the prompt from `PORTFOLIO_CONTEXT` (a hardcoded system prompt) + the user question and sends it to Gemini via `gemini_client.py`. To give the AI real knowledge of the portfolio, the content from `data.tsx` should be injected into `PORTFOLIO_CONTEXT` in `rag.py`.
