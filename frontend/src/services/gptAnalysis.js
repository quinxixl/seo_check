const API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "process.env.HF_TOKEN";
const API_URL = import.meta.env.VITE_OPENAI_API_URL || "https://router.huggingface.co/v1";
const MODEL = import.meta.env.VITE_OPENAI_MODEL || "Qwen/Qwen2.5-7B-Instruct:together";

/**
 * Делает запрос к GPT, чтобы получить анализ сайта.
 * Возвращает объект совместимый с текущей структурой отчёта.
 */
export async function analyzeWithGpt(url, plan = "free") {
  if (!API_KEY) {
    throw new Error("GPT API key is not configured");
  }

  const messages = [
    {
      role: "system",
      content:
        "You are an expert web performance, SEO, security, and UX auditor. Respond ONLY with valid JSON. Do not include markdown. Keep values realistic. Scores 0-100.",
    },
    {
      role: "user",
      content: `Analyze the website ${url} for plan ${plan}.
Return strict JSON with:
{
  "url": "${url}",
  "timestamp": "<ISO>",
  "performance": { "score": number, "metrics": { "loadTime": number, "firstContentfulPaint": number }, "recommendations": [string] },
  "seo": { "score": number, "issues": number, "recommendations": [string] },
  "security": { "headers": [string], "advanced": ${plan !== "free"} },
  "content": { "score": number, "summary": string },
  "ux": { "tips": [string] },
  "techSeo": ${plan === "business" ? "{ \"crawlLimit\": number, \"checks\": [string] }" : "null"},
  "monitoring": ${plan === "business" ? "{ \"uptime\": true, \"speed\": true, \"autoAuditWeekly\": true }" : "null"},
  "competitiveAnalysis": ${plan === "business"},
  "whiteLabel": ${plan === "business"},
  "teamAccess": ${plan === "business"},
  "autoAudit": ${plan === "business"},
  "pdfExport": ${plan !== "free"}
}`,
    },
  ];

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      max_tokens: 900,
      messages,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GPT request failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from GPT");

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    throw new Error("Invalid JSON from GPT");
  }

  // Минимальная валидация
  return {
    ...parsed,
    url,
    timestamp: parsed.timestamp || new Date().toISOString(),
    performance: parsed.performance || { score: 0, metrics: {}, recommendations: [] },
    seo: parsed.seo || { score: 0, issues: 0, recommendations: [] },
    security: parsed.security || { headers: [], advanced: plan !== "free" },
    content: parsed.content || {},
    ux: parsed.ux || { tips: [] },
  };
}

