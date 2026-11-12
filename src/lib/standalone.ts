/** Fallbacks used when the site is hosted outside Claude (GitHub Pages, Vercel, Netlify, …):
 *  - AI: calls the Claude API, either through your own server function (VITE_AI_PROXY_URL)
 *    or directly from the browser with an API key the visitor pastes in (kept in localStorage only).
 *  - Downloads: a normal browser download. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { runtime, type SampleFn, type DownloadsNamespace } from "./runtime";

type Msg = { role: "user" | "assistant"; content: string };
export type AiSource = "claude" | "proxy" | "key" | null;

const KEY_LS = "fahrplan-anthropic-key";
const API_URL = "https://api.anthropic.com/v1/messages";
const PROXY_URL: string = (import.meta.env.VITE_AI_PROXY_URL as string) || "";
const MODEL: string = (import.meta.env.VITE_AI_MODEL as string) || "claude-sonnet-5-5";
const QUICK_MODEL: string = (import.meta.env.VITE_AI_QUICK_MODEL as string) || "claude-haiku-5-5";

export const aiInfo = { source: null as AiSource, hasProxy: !!PROXY_URL };

export function getApiKey() {
  try {
    return localStorage.getItem(KEY_LS) || "";
  } catch {
    return "";
  }
}
export function setApiKey(k: string) {
  try {
    if (k) localStorage.setItem(KEY_LS, k.trim());
    else localStorage.removeItem(KEY_LS);
  } catch {
    /* storage blocked */
  }
}

class AiError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

async function callClaude(messages: Msg[], opts: { quick?: boolean; maxTokens?: number } = {}): Promise<string> {
  const body = { model: opts.quick ? QUICK_MODEL : MODEL, max_tokens: opts.maxTokens || (opts.quick ? 1500 : 8000), messages };
  let res: Response;
  try {
    if (PROXY_URL)
      res = await fetch(PROXY_URL, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    else {
      const key = getApiKey();
      if (!key) throw new AiError("not_granted", "No API key");
      res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "content-type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
      });
    }
  } catch (e) {
    if (e instanceof AiError) throw e;
    throw new AiError("network", "Network error");
  }
  if (res.status === 401 || res.status === 403) throw new AiError("bad_key", "The API key was rejected");
  if (res.status === 429 || res.status === 529) throw new AiError("rate_limited", "Rate limited");
  if (!res.ok) throw new AiError("http_" + res.status, (await res.text().catch(() => "")).slice(0, 200));
  const j = await res.json();
  return (j.content || [])
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("");
}

/** Pull the first JSON object out of a model reply (tolerates ```json fences and stray text). */
export function parseJson(text: string) {
  const t = text.replace(/```(?:json)?/g, "");
  const a = t.indexOf("{"),
    b = t.lastIndexOf("}");
  if (a < 0 || b <= a) throw new AiError("invalid_json", "No JSON");
  try {
    return JSON.parse(t.slice(a, b + 1));
  } catch {
    throw new AiError("invalid_json", "Bad JSON");
  }
}

function makeSample(): SampleFn {
  const toMsgs = (input: string | Msg[]): Msg[] => (typeof input === "string" ? [{ role: "user", content: input }] : (input as Msg[]));
  const fn = (async (input: string | Msg[], opts: any = {}) => {
    const text = await callClaude(toMsgs(input), { quick: opts.modelTier === "quick" });
    opts.onText?.({ text, delta: text });
    return { text };
  }) as SampleFn;
  fn.json = async (input: string, opts: any = {}) =>
    parseJson(
      await callClaude(
        [{ role: "user", content: input + "\n\nGib ausschließlich das JSON-Objekt aus, ohne Erklärung und ohne Code-Block." }],
        { quick: opts.modelTier === "quick" },
      ),
    );
  return fn;
}

const browserDownloads: DownloadsNamespace = {
  async save({ filename, data }) {
    const blob = data instanceof Blob ? data : new Blob([data]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return { status: "saved" };
  },
};

/** Fill in AI and downloads when the Claude runtime didn't provide them. */
export function applyStandalone() {
  if (aiInfo.source !== "claude") {
    if (PROXY_URL) {
      runtime.sample = makeSample();
      aiInfo.source = "proxy";
    } else if (getApiKey()) {
      runtime.sample = makeSample();
      aiInfo.source = "key";
    } else {
      runtime.sample = null;
      aiInfo.source = null;
    }
  }
  if (!runtime.downloads) runtime.downloads = browserDownloads;
}

/** Quick check that the key works. */
export async function testConnection() {
  await callClaude([{ role: "user", content: "Antworte nur mit: OK" }], { quick: true, maxTokens: 10 });
}
