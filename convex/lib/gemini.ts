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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error("Failed to fetch from Gemini API", response.status);
      return null;
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      console.error("Gemini API request timed out after 8000ms");
    } else {
      console.error("Error calling Gemini API:", err);
    }
    return null;
  }
}
