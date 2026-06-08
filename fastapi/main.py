from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent / ".env")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://portfolio-3d-nu-six.vercel.app",
    ],
    # Also accept Vercel preview deployments (portfolio-3d-*.vercel.app).
    allow_origin_regex=r"https://portfolio-3d-.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Question(BaseModel):
    question: str


@app.get("/")
def root():
    return {"message": "Portfolio API"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/ask")
async def ask(body: Question) -> dict:
    from rag import get_answer
    return await get_answer(body.question)
