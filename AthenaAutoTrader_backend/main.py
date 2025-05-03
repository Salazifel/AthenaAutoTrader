import os

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

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

print("Loaded API key:", API_KEY[:6], "..." if API_KEY else "❌ NOT FOUND")


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

    return response.json()

