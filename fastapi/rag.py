from groq_client import generate
from retriever import retrieve

SYSTEM_PROMPT = """You are an AI assistant embedded in Zainab Khalil's developer portfolio.
You answer questions about Zainab's skills, projects, education, and experience.

Rules:
- Use ONLY the information in the CONTEXT below. Do not invent facts.
- If the context does not contain the answer, say you don't have that detail.
- Speak about Zainab in first person, warmly and concisely (2-4 sentences).
- Keep answers relevant to a recruiter or fellow engineer reading a portfolio."""


def _build_context(chunks: list[dict]) -> str:
    return "\n\n".join(f"[{c['section']}] {c['text']}" for c in chunks)


async def get_answer(question: str) -> dict:
    chunks = retrieve(question)

    if not chunks:
        context = "(No matching information found in the portfolio.)"
    else:
        context = _build_context(chunks)

    user_message = f"CONTEXT:\n{context}\n\nQUESTION: {question}"
    answer = await generate(SYSTEM_PROMPT, user_message)

    return {
        "answer": answer,
        "sources": [c["chunk_id"] for c in chunks],
    }
