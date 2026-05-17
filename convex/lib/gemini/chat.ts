// convex/lib/geminiChat.ts
// Chat-specific Gemini wrapper with support for system instructions,
// conversation history, and function calling (tools).
// Falls back to Groq (llama-3.3-70b-versatile) when Gemini returns 429.
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
 *
 * On HTTP 429 (rate limit), automatically falls back to Groq.
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

    // Gemini rate limited — fall back to Groq
    if (response.status === 429) {
      console.warn("Gemini rate limited (429). Falling back to Groq.");
      return await askGroqFallback(options);
    }

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

// ---------------------------------------------------------------------------
// Groq fallback — used when Gemini returns 429 (rate limited)
// Uses llama-3.3-70b-versatile via OpenAI-compatible API.
// ---------------------------------------------------------------------------

/** Shape of a single Gemini functionDeclaration (for type narrowing). */
interface GeminiFunctionDeclaration {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

/** Wrapper object that holds the array of function declarations. */
interface GeminiToolWrapper {
  functionDeclarations?: GeminiFunctionDeclaration[];
}

/** OpenAI-format tool definition expected by Groq. */
interface GroqTool {
  type: "function";
  function: GeminiFunctionDeclaration;
}

async function askGroqFallback(
  options: GeminiChatOptions
): Promise<GeminiChatResult> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    console.warn("GROQ_API_KEY not set. Cannot fall back from Gemini.");
    return { text: null, functionCall: null };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    // Convert Gemini message format → OpenAI message format
    const messages: { role: string; content: string }[] = [
      { role: "system", content: options.systemInstruction },
      ...options.history.map((m) => ({
        role: m.role === "model" ? "assistant" : "user",
        content: m.parts[0]?.text || "",
      })),
      { role: "user", content: options.userMessage },
    ];

    // Convert Gemini tool declarations → OpenAI tool format
    let groqTools: GroqTool[] | undefined;
    if (options.tools && options.tools.length > 0) {
      const toolWrapper = options.tools[0] as GeminiToolWrapper;
      if (toolWrapper.functionDeclarations) {
        groqTools = toolWrapper.functionDeclarations.map(
          (fn: GeminiFunctionDeclaration) => ({
            type: "function" as const,
            function: fn,
          })
        );
      }
    }

    const body: Record<string, unknown> = {
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.7,
      max_tokens: 500,
    };

    if (groqTools) {
      body.tools = groqTools;
      body.tool_choice = "auto";
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqKey}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "unknown");
      console.warn("Groq API error:", response.status, errorText);
      return { text: null, functionCall: null };
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;
    if (!message) return { text: null, functionCall: null };

    // Check for tool calls (OpenAI format)
    if (message.tool_calls && message.tool_calls.length > 0) {
      const call = message.tool_calls[0].function;
      try {
        return {
          text: null,
          functionCall: {
            name: call.name,
            args: JSON.parse(call.arguments),
          },
        };
      } catch (parseErr) {
        console.warn("Groq tool_call arguments parse error:", parseErr);
        return { text: null, functionCall: null };
      }
    }

    return {
      text: message.content || null,
      functionCall: null,
    };
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      console.warn("Groq fallback request timed out after 15000ms");
    } else {
      console.warn("Error calling Groq fallback:", err);
    }
    return { text: null, functionCall: null };
  } finally {
    clearTimeout(timeoutId);
  }
}
