from gemini_client import generate

PORTFOLIO_CONTEXT = """
You are an AI assistant embedded in a developer portfolio.
Answer questions about the portfolio owner's skills, projects, and experience.
Keep answers concise and relevant to software engineering.
"""


async def get_answer(question: str) -> str:
    prompt = f"{PORTFOLIO_CONTEXT}\n\nUser question: {question}"
    return await generate(prompt)
