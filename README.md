# Portfolio

Interactive 3D developer portfolio powered by React Three Fiber + FastAPI + Gemini AI.

## Stack

| Layer     | Tech                                         |
|-----------|----------------------------------------------|
| Frontend  | React 19, Vite, Three.js, @react-three/fiber |
| 3D        | @react-three/drei, @react-three/rapier       |
| Animation | Framer Motion                                |
| Styling   | Tailwind CSS v3 (dark futuristic theme)      |
| Backend   | FastAPI, Python 3.11+                        |
| AI        | Google Gemini via RAG pipeline               |

## Project Structure

```
portfolio-2/
├── assets/              # Source 3D assets (.glb, .fbx)
├── frontend/            # Vite + React app
│   └── src/
│       ├── assets/      # Bundled assets (walking.glb, etc.)
│       ├── components/  # React components
│       └── hooks/       # Custom React hooks
├── fastapi/             # Python API
│   ├── main.py          # FastAPI app + CORS + routes
│   ├── rag.py           # RAG pipeline
│   ├── gemini_client.py # Gemini API wrapper
│   ├── requirements.txt
│   └── .env             # GEMINI_API_KEY
└── start.sh             # Start both servers
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+

### Install dependencies

```bash
# Frontend
cd frontend && npm install

# Backend
cd fastapi && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
```

### Run (both servers)

```bash
chmod +x start.sh && ./start.sh
```

- Frontend: http://localhost:5173
- API:      http://localhost:8000
- API docs: http://localhost:8000/docs

### Run individually

```bash
# Frontend
cd frontend && npm run dev

# Backend
cd fastapi && source venv/bin/activate && uvicorn main:app --reload --port 8000
```

## API

### POST /api/ask

```json
{ "question": "What projects have you worked on?" }
```

```json
{ "answer": "..." }
```
