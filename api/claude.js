// Optional server function for hosting on Vercel (also works as a Netlify/Node handler with small changes).
// It keeps your Anthropic API key on the server so visitors don't need their own.
// Set ANTHROPIC_API_KEY in the host's environment variables, and build the site with
// VITE_AI_PROXY_URL=/api/claude. Optionally set ALLOWED_ORIGIN to your site's URL.
const MODELS = new Set([process.env.AI_MODEL || "claude-sonnet-5-5", process.env.AI_QUICK_MODEL || "claude-haiku-5-5"]);
const MAX_TOKENS = 8000;

export default async function handler(req, res) {
  const origin = process.env.ALLOWED_ORIGIN;
  if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
  if (req.method === "OPTIONS") { res.setHeader("Access-Control-Allow-Headers", "content-type"); return res.status(204).end(); }
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  if (origin && req.headers.origin && req.headers.origin !== origin) return res.status(403).json({ error: "Origin not allowed" });

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const { model, messages } = body;
  if (!MODELS.has(model) || !Array.isArray(messages) || messages.length > 60) return res.status(400).json({ error: "Bad request" });

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY || "", "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model, messages, max_tokens: Math.min(+body.max_tokens || 2000, MAX_TOKENS) }),
  });
  res.status(r.status).setHeader("content-type", "application/json").send(await r.text());
}
