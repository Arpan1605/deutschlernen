export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Missing ANTHROPIC_API_KEY environment variable." });
    return;
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {};
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      Accept: "application/json",
    },
    body: JSON.stringify({
      model: body.model || "claude-3-5-sonnet-20241022",
      max_tokens: body.max_tokens || 1200,
      temperature: body.temperature ?? 0.7,
      system: body.system,
      messages: body.messages || [{ role: "user", content: [{ type: "text", text: body.prompt || "" }] }],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    res.status(response.status).json({ error: data?.error?.message || "Claude request failed." });
    return;
  }

  res.status(200).json(data);
}
