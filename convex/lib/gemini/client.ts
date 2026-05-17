// convex/lib/gemini.ts
// Centralized helper for interacting with the Gemini API from Convex Actions.

/**
 * Sends a prompt to the Gemini API with a strict 8-second timeout.
 * 
 * @param prompt The exact string to prompt the Gemini model.
 * @returns The raw string response from Gemini, or null if the request failed or timed out.
 */
export async function askGemini(prompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY environment variable is not set.");
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey
          },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 200 // High token count needed to account for 2.5-flash internal reasoning phase
            },
          }),
        }
      );

      // Gemini rate limited - fall back to Groq
      if (response.status === 429) {
        console.warn("Gemini Insights rate limited (429). Falling back to Groq.");
        return await askGroqInsightsFallback(prompt);
      }

      if (!response.ok) {
        console.error("Failed to fetch from Gemini API", response.status);
        return null;
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      console.error("Gemini API request timed out after 8000ms");
    } else {
      console.error("Error calling Gemini API:", err);
    }
    return null;
  }
}

/**
 * Simpler Groq fallback for insights (no tools, no history).
 */
async function askGroqInsightsFallback(prompt: string): Promise<string | null> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    console.warn("GROQ_API_KEY not set. Cannot fall back from Gemini Insights.");
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      console.error("Groq Insights fallback failed", response.status);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      console.error("Groq Insights fallback timed out after 8000ms");
    } else {
      console.error("Error calling Groq Insights fallback:", err);
    }
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

