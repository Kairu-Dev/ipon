# Groq Fallback Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Implement a fallback mechanism to Groq when Gemini API rate limits (status 429) are encountered.

**Architecture:** We will modify `convex/lib/geminiChat.ts` to catch 429 responses from Gemini. When caught, we will format the context, chat history, and tools into the standard OpenAI API format, and send a request to Groq's `/v1/chat/completions` endpoint using the `llama-3.3-70b-versatile` model. We will then normalize the Groq response back to the existing `GeminiChatResult` format so the rest of the application remains unchanged.

**Tech Stack:** Convex, Node `fetch`, Groq API (OpenAI compatible).

---

### Task 1: Update Gemini Wrapper with Groq Fallback

**Files:**
- Modify: `convex/lib/geminiChat.ts`

**Step 1: Write the implementation**

```typescript
// Add to convex/lib/geminiChat.ts replacing the current askGeminiChat implementation or updating it

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

    if (options.tools.length > 0) {
      body.tools = options.tools;
    }

    const response = await fetch(
      \`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent\`,
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

// Add the new fallback function below it

async function askGroqFallback(options: GeminiChatOptions): Promise<GeminiChatResult> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    console.warn("GROQ_API_KEY missing. Cannot fallback.");
    return { text: null, functionCall: null };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    // Convert to OpenAI format
    const messages = [
      { role: "system", content: options.systemInstruction },
      ...options.history.map((m) => ({
        role: m.role === "model" ? "assistant" : "user",
        content: m.parts[0]?.text || "",
      })),
      { role: "user", content: options.userMessage },
    ];

    let groqTools = undefined;
    if (options.tools && options.tools.length > 0) {
      const toolWrapper = options.tools[0] as any;
      if (toolWrapper.functionDeclarations) {
        groqTools = toolWrapper.functionDeclarations.map((fn: any) => ({
          type: "function",
          function: fn,
        }));
      }
    }

    const body: any = {
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.7,
      max_tokens: 500,
    };

    if (groqTools) {
      body.tools = groqTools;
      body.tool_choice = "auto";
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": \`Bearer \${groqKey}\`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "unknown");
      console.warn("Groq API error:", response.status, errorText);
      return { text: null, functionCall: null };
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;

    if (!message) return { text: null, functionCall: null };

    if (message.tool_calls && message.tool_calls.length > 0) {
      const call = message.tool_calls[0].function;
      return {
        text: null,
        functionCall: {
          name: call.name,
          args: JSON.parse(call.arguments),
        },
      };
    }

    return {
      text: message.content || null,
      functionCall: null,
    };
  } catch (err) {
    console.warn("Error calling Groq fallback:", err);
    return { text: null, functionCall: null };
  } finally {
    clearTimeout(timeoutId);
  }
}
```

**Step 2: Commit**

```bash
git add convex/lib/geminiChat.ts
git commit -m "feat: add Groq fallback for Gemini rate limits"
```
