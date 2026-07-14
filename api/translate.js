const LANGUAGE_NAMES = {
  en: "English",
  tr: "Turkish",
  es: "Spanish",
  fr: "French",
  de: "German",
};

function extractPlan(apiData) {
  const raw = apiData?.choices?.[0]?.message?.content;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isValidPlan(plan) {
  if (!plan || !Array.isArray(plan.days) || plan.days.length === 0) return false;
  const hasValidDays = plan.days.every(
    (d) =>
      typeof d.number !== "undefined" &&
      Array.isArray(d.morning) &&
      Array.isArray(d.afternoon) &&
      Array.isArray(d.evening)
  );
  if (!hasValidDays) return false;
  if (!plan.costBreakdown || !Array.isArray(plan.costBreakdown.rows)) return false;
  if (!plan.costBreakdown.grandTotal) return false;
  return true;
}

async function callGroq(prompt, apiKey) {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    }
  );
  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { plan, language } = req.body;
  const API_KEY = process.env.GROQ_API_KEY;
  const languageName = LANGUAGE_NAMES[language] || "English";

  if (!plan || !Array.isArray(plan.days)) {
    return res.status(400).json({ error: "Invalid plan" });
  }

  const prompt = `
You are a professional translator. Translate the following travel itinerary JSON into ${languageName}.
STRICT RULES:
- Translate ONLY the text VALUES (activity descriptions and the cost breakdown labels/descriptive words).
- Keep the JSON KEYS exactly as they are: "days", "number", "morning", "afternoon", "evening", "costBreakdown", "rows", "label", "value", "grandTotal".
- Keep ALL numbers, prices and currency symbols (€, ₺, $) EXACTLY as they appear — do not convert, recalculate or change them.
- You may keep proper nouns (place names, landmark names, restaurant names) in their original form, but translate the surrounding descriptive words naturally.
- Every translated text value must be written entirely and only in ${languageName} — do not leave any sentence in the original language.
- Return ONLY a single valid JSON object with the EXACT same structure, no markdown, no code fences, no explanation.

JSON to translate:
${JSON.stringify(plan)}
`;

  try {
    let result = await callGroq(prompt, API_KEY);

    if (!result.ok) {
      return res.status(result.status).json({
        error: result.data?.error?.message || "Groq API error",
      });
    }

    let translated = extractPlan(result.data);

    if (!isValidPlan(translated)) {
      const retry = await callGroq(prompt, API_KEY);
      const retryPlan = extractPlan(retry.data);
      if (isValidPlan(retryPlan)) translated = retryPlan;
    }

    if (!isValidPlan(translated)) {
      return res.status(500).json({ error: "Translation failed" });
    }

    return res.status(200).json({ plan: translated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
