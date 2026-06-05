import os
import google.generativeai as genai

_model = None


def get_model():
    global _model
    if _model is None:
        genai.configure(api_key=os.environ["GEMINI_API_KEY"])
        _model = genai.GenerativeModel("gemini-1.5-flash")
    return _model


async def generate(prompt: str) -> str:
    model = get_model()
    response = model.generate_content(prompt)
    return response.text
