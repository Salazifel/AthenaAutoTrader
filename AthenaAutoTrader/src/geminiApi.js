// src/geminiApi.js

export async function generateAIResponse(prompt, validate, model) {
  const res = await fetch("http://localhost:8000/api/gemini", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, validate, model }),
  });

  if (!res.ok) {
    return "Server error or invalid response";
  }

  if(validate == true) {
    try {
      const data = await res.json();
      return data; // this is the validated strategy JSON
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      return "No response from Gemini";
    }
  } 
  else {
    try {
      const data = await res.json(); // returns { raw: string }
      return data.raw || "No 'raw' field in response";
    } catch (e) {
      console.error("Failed to parse unvalidated response:", e);
      return "Validation disabled, but response was not JSON";
    }
  }
}

  