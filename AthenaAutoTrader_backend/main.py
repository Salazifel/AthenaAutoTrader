import os
import json
import logging

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

# validation library
from pydantic import ValidationError

logger = logging.getLogger(__name__)
logging.basicConfig(filename='latest.log', level=logging.INFO)

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

app = FastAPI()

# Allow your frontend (e.g. localhost:5173) to access this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
if API_KEY:
    logger.info("Loaded API key:" + API_KEY[:6] + "...")
else:
    logger.error("❌ API KEY NOT FOUND")


@app.post("/api/gemini")
async def gemini(request: Request):
    body = await request.json()
    prompt = body.get("prompt", "Hello world")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    response = requests.post(
        url, headers={"Content-Type": "application/json"}, json=payload
    )

    print("Gemini raw response:", response.status_code, response.text)  # <- log this

    try:
        parsed = json.loads(response_text)
    except json.JSONDecodeError as e:
        print("❌ Invalid JSON from Gemini:", e)
        raise HTTPException(status_code=400, detail="Invalid JSON from AI")

    try:
        validated = StrategyJson.parse_obj(parsed)
    except ValidationError as e:
        print("❌ Schema validation failed:", e)
        raise HTTPException(status_code=400, detail="AI response does not match expected format")

    # return the original data if it passes the checks vv
    return parsed
