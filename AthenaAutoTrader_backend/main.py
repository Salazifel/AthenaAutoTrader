import os
import logging
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from jsonValidator import validate_response_json

logging.basicConfig(filename='latest.log', level=logging.INFO)
logger = logging.getLogger(__name__)

# Load .env and API key
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

# FastAPI app instance
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

if API_KEY:
    logger.info("✅ Loaded API key: " + API_KEY[:6] + "...")
else:
    logger.error("❌ API KEY NOT FOUND")


@app.post("/api/gemini")
async def gemini(request: Request):
    body = await request.json()
    prompt = body.get("prompt", "").strip()
    validate = body.get("validate", True)  # default to True
    model = body.get("model", "gemini-2.5-flash-preview-04-17") # default to 2.5 Flash

    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    def call_gemini(model):
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{model}:generateContent?key={API_KEY}"
        )
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        try:
            response = requests.post(
                url,
                headers={"Content-Type": "application/json"},
                json=payload
            )
        except requests.RequestException as e:
            raise RuntimeError("Network error while calling Gemini") from e

        if response.status_code != 200:
            raise RuntimeError(f"Gemini API error: {response.status_code}")
        try:
            return response.json()["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            raise RuntimeError("Malformed Gemini response") from e

    for attempt in range(3):  # First try + 2 retries
        try:
            raw_response = call_gemini(model)
            logger.info(f"Gemini response (attempt {attempt + 1}):\n{raw_response}")

            cleaned = (
                raw_response
                .removeprefix("```json")
                .removeprefix("```")
                .removesuffix("```")
                .strip()
            )

            if validate:
                validated = validate_response_json(cleaned)
                return validated.model_dump()
            else:
                return {"raw": cleaned}

        except RuntimeError as e:
            logger.warning(f"[Gemini Retry] Attempt {attempt + 1}/3 failed: {e}")
            if attempt == 2:
                raise HTTPException(status_code=500, detail="Gemini response invalid after retries")
