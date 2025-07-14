// Keyword-based check for real-time info needs
export function needsRealtimeAnswer(message) {
  const keywords = ['today', 'now', 'news', 'weather', 'date', 'time', 'trending'];
  return keywords.some(keyword => message.toLowerCase().includes(keyword));
}

// Fetch response from OpenRouter's online model (e.g. Perplexity)
async function fetchFromOpenRouter(userMessage) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey) {
    console.warn("[OpenRouter] Missing API key. Skipping...");
    throw new Error("OpenRouter API key not found.");
  }

  const body = {
    model: "perplexity/pplx-7b-online",
    messages: [{ role: "user", content: userMessage }],
    stream: false,
  };

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "X-Title": "Velari"
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    console.log("[OpenRouter] Raw response:", data);

    if (!res.ok || !data.choices || data.choices.length === 0) {
      const errMsg = data.error?.message || "OpenRouter gave no usable reply.";
      throw new Error(errMsg);
    }

    return data.choices[0].message.content.trim();
  } catch (err) {
    console.error("[OpenRouter] Fetch error:", err.message);
    throw new Error("OpenRouter failed: " + err.message);
  }
}

// Fetch response from your local Ollama server
export async function fetchFromOllama(userMessage) {
  try {
    const res = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        messages: [{ role: "user", content: userMessage }],
        stream: false
      })
    });

    const raw = await res.text();

    if (!res.ok) {
      console.error("[Ollama] HTTP error:", res.status, raw);
      throw new Error("Ollama server error");
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      console.error("[Ollama] Invalid JSON:", raw);
      throw new Error("Bad JSON from Ollama");
    }

    const reply = data.message?.content?.trim();
    if (!reply) throw new Error("Ollama returned empty reply");

    return reply;
  } catch (err) {
    console.error("[Ollama] Final error:", err.message);
    return "⚠️ Velari couldn't connect to your local AI. Please check that Ollama is running.";
  }
}

// Master router to decide where to get a response from
export async function getChatResponse(userMessage) {
  console.log('[Velari] Incoming:', userMessage);

  if (needsRealtimeAnswer(userMessage)) {
    console.log('[Velari] Real-time keywords found. Using OpenRouter...');
    try {
      return await fetchFromOpenRouter(userMessage);
    } catch (err) {
      console.warn('[Velari] OpenRouter fallback triggered:', err.message);
    }
  }

  console.log('[Velari] Using Ollama (local LLM)...');
  return await fetchFromOllama(userMessage);
}
