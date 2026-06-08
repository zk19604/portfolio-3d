import json
import re
from pathlib import Path

CHUNKS_PATH = Path(__file__).parent / "zainab_khalil_rag_chunks.json"

# Words that carry no signal for matching — ignored when scoring.
_STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "do", "does", "for",
    "from", "has", "have", "her", "his", "how", "in", "is", "it", "its",
    "of", "on", "or", "she", "tell", "that", "the", "their", "to", "was",
    "what", "when", "where", "which", "who", "why", "with", "you", "your",
    "me", "my", "i", "can", "about",
}


def _stem(word: str) -> str:
    # Crude plural folding so "experiences" matches "experience", "skills" -> "skill".
    if len(word) <= 3 or not word.endswith("s") or word.endswith("ss"):
        return word
    if word.endswith("ies"):
        return word[:-3] + "y"
    # "boxes" -> "box", "classes" -> "class", but "experiences" -> "experience".
    if word.endswith("es") and word[:-2].endswith(("s", "x", "z", "ch", "sh")):
        return word[:-2]
    return word[:-1]


def _tokenize(text: str) -> list[str]:
    return [
        _stem(t)
        for t in re.findall(r"[a-z0-9]+", text.lower())
        if t not in _STOPWORDS
    ]


def _load_chunks() -> list[dict]:
    with open(CHUNKS_PATH, encoding="utf-8") as f:
        chunks = json.load(f)
    # Pre-tokenize once at import time so each query is cheap.
    for c in chunks:
        c["_tokens"] = set(_tokenize(f"{c['section']} {c['text']}"))
    return chunks


_CHUNKS = _load_chunks()


def retrieve(question: str, top_k: int = 4) -> list[dict]:
    """Return the chunks most relevant to the question by keyword overlap.

    Small corpus (9 chunks), so a lightweight token-overlap score is plenty —
    no embeddings or vector store needed.
    """
    q_tokens = set(_tokenize(question))
    if not q_tokens:
        return []

    scored = []
    for c in _CHUNKS:
        overlap = q_tokens & c["_tokens"]
        if overlap:
            # Normalise by query length so longer chunks don't dominate.
            score = len(overlap) / len(q_tokens)
            scored.append((score, c))

    scored.sort(key=lambda s: s[0], reverse=True)
    return [c for _, c in scored[:top_k]]
