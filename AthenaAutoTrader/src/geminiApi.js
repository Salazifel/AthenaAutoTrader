// src/geminiApi.js

export async function generateAIResponse(prompt) {
  const res = await fetch("http://localhost:8000/api/gemini", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    return "Server error or invalid response";
  }

  try {
    const data = await res.json();
    return data; // this is the validated strategy JSON
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    return "No response from Gemini";
  }
}

  