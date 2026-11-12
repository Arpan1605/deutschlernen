/** Direct Claude API support for hosts without the Claude artifact runtime.
 *  Works with a user-pasted key in the browser and can be switched to a server-side key later.
 */
import { runtime, type DownloadsNamespace, type SampleFn } from "./runtime";

export const CLAUDE_KEY_STORAGE = "fahrplan-claude-api-key";
const DEFAULT_MODEL = "claude-3-5-sonnet-20241022";
const QUICK_MODEL = "claude-3-5-haiku-20241022";

export function getClaudeApiKey() {
  if (typeof window === "undefined") return "";
  const value = ((window as any).__CLAUDE_API_KEY__ ?? localStorage.getItem(CLAUDE_KEY_STORAGE) ?? "").trim();
  return value;
}

export function setClaudeApiKey(value: string) {
  const clean = value.trim();
  if (typeof window !== "undefined") {
    (window as any).__CLAUDE_API_KEY__ = clean;
    if (clean) localStorage.setItem(CLAUDE_KEY_STORAGE, clean);
    else localStorage.removeItem(CLAUDE_KEY_STORAGE);
  }
}

export function hasClaudeApiKey() {
  return !!getClaudeApiKey();
}

function stripCodeFence(text: string) {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

function extractText(payload: any): string {
  if (!payload) return "";
  if (typeof payload === "string") return payload;
  if (typeof payload.text === "string") return payload.text;
  if (Array.isArray(payload.content)) {
    return payload.content
      .map((part: any) => {
        if (typeof part === "string") return part;
        if (part?.type === "text" && typeof part.text === "string") return part.text;
        return "";
      })
      .join("");
  }
  if (typeof payload.content === "string") return payload.content;
  return JSON.stringify(payload);
}

export function createClaudeSample(): SampleFn {
  const run = async (input: string | { role: string; content: string }[], opts: any = {}) => {
    const apiKey = getClaudeApiKey();
    if (!apiKey) throw { code: "unavailable", message: "Missing Claude API key." };
    const model = opts.modelTier === "quick" ? QUICK_MODEL : DEFAULT_MODEL;
    const messages = Array.isArray(input)
      ? input.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: [{ type: "text", text: String(m.content) }],
        }))
      : [{ role: "user", content: [{ type: "text", text: String(input) }] }];
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        Accept: "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: opts.maxTokens ?? 1200,
        temperature: opts.temperature ?? 0.7,
        system: typeof opts.system === "string" ? opts.system : undefined,
        messages,
      }),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      const detail = body?.error?.message || body?.message || "Claude request failed.";
      const code = response.status === 429 ? "rate_limited" : response.status === 400 ? "invalid_json" : "other";
      throw { code, message: detail };
    }
    const text = extractText(body);
    if (typeof opts.onText === "function") opts.onText({ text });
    return { text };
  };

  const json = async (input: string, opts: any = {}) => {
    const { text } = await run(input, opts);
    try {
      return JSON.parse(stripCodeFence(text));
    } catch {
      throw { code: "invalid_json", message: "Claude returned invalid JSON." };
    }
  };

  return Object.assign(run, { json });
}

export function createBrowserDownloads(): DownloadsNamespace {
  return {
    save: async ({ filename, data }) => {
      const blob = data instanceof Blob ? data : new Blob([data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      return { status: "ok" };
    },
  };
}

export function configureDirectClaudeRuntime() {
  if (typeof window === "undefined") return false;
  if (window.claude?.use) return false;

  runtime.downloads = createBrowserDownloads();
  runtime.downloadsReady = true;

  if (!hasClaudeApiKey()) {
    runtime.sample = null;
    runtime.sampleReady = true;
    return false;
  }

  runtime.sample = createClaudeSample();
  runtime.sampleReady = true;
  return true;
}
