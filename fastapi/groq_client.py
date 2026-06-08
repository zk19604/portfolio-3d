import asyncio
import os

from groq import Groq

_client = None

# llama-3.3-70b is a good default on Groq: fast + strong reasoning.
MODEL = "llama-3.3-70b-versatile"


def get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=os.environ["GROQ_API_KEY"])
    return _client


async def generate(system: str, user: str) -> str:
    client = get_client()

    def _call() -> str:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=0.3,
            max_tokens=512,
        )
        return response.choices[0].message.content.strip()

    # Groq's SDK is synchronous; run it off the event loop so we don't block.
    return await asyncio.to_thread(_call)
