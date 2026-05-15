// convex/lib/geminiChat.ts
// Chat-specific Gemini wrapper with support for system instructions,
// conversation history, and function calling (tools).
// Separate from askGemini which is tuned for single-prompt insight generation.

interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

interface FunctionCall {
  name: string;
  args: Record<string, unknown>;
}

interface GeminiChatOptions {
  systemInstruction: string;
  history: ChatMessage[];
  userMessage: string;
  tools: unknown[];
}

interface GeminiChatResult {
  text: string | null;
  functionCall: FunctionCall | null;
}

/**
 * Sends a chat message to the Gemini API with system instructions,
 * conversation history, and optional tool declarations.
 *
 * Returns either a text response or a function call request.
 * Timeout is 15 seconds (longer than insight calls — chat may need more reasoning).
 */
export async function askGeminiChat(
  options: GeminiChatOptions
): Promise<GeminiChatResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY environment variable is not set.");
    return { text: null, functionCall: null };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    // Build the contents array: history + new user message
    const contents = [
      ...options.history,
      { role: "user" as const, parts: [{ text: options.userMessage }] },
    ];

    const body: Record<string, unknown> = {
      system_instruction: { parts: [{ text: options.systemInstruction }] },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    };

    // Only include tools if there are function declarations
    if (options.tools.length > 0) {
      body.tools = options.tools;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        signal: controller.signal,
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "unknown");
      console.warn("Gemini Chat API error:", response.status, errorText);
      return { text: null, functionCall: null };
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    if (!candidate) {
      console.warn("No candidates in Gemini response");
      return { text: null, functionCall: null };
    }

    const parts = candidate.content?.parts;
    if (!parts || parts.length === 0) {
      return { text: null, functionCall: null };
    }

    // Check for function call first
    const functionCallPart = parts.find(
      (p: Record<string, unknown>) => p.functionCall
    );
    if (functionCallPart) {
      return {
        text: null,
        functionCall: {
          name: functionCallPart.functionCall.name,
          args: functionCallPart.functionCall.args || {},
        },
      };
    }

    // Otherwise, extract text
    const textPart = parts.find((p: Record<string, unknown>) => p.text);
    return {
      text: textPart?.text || null,
      functionCall: null,
    };
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      console.warn("Gemini Chat API request timed out after 15000ms");
    } else {
      console.warn("Error calling Gemini Chat API:", err);
    }
    return { text: null, functionCall: null };
  } finally {
    clearTimeout(timeoutId);
  }
}
