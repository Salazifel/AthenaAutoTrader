// src/geminiApi.js

export async function generateAIResponse(prompt) {
    const res = await fetch("http://localhost:8000/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });
  
    const data = await res.json();
  
    try {
      return data.candidates[0].content.parts[0].text;
    } catch {
      return "No response from Gemini";
    }
  }
  
  