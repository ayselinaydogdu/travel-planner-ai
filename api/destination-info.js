export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { city, language } = req.body;
  const API_KEY = process.env.GROQ_API_KEY;

  const LANGUAGE_NAMES = {
    en: "English",
    tr: "Turkish",
    es: "Spanish",
    fr: "French",
    de: "German",
  };
  const languageName = LANGUAGE_NAMES[language] || "English";

  const prompt = `
Give me quick travel facts about ${city}.
Write the text values for "country", "bestSeason" and every item in "highlights" entirely in ${languageName}.
Return ONLY valid JSON, no extra text, no markdown code fences, in this exact format:
{"country": "...", "emoji": "one relevant emoji", "bestSeason": "...", "highlights": ["...", "...", "..."]}
`;

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Groq API error",
      });
    }

    const rawText = data.choices[0].message.content;
    const cleanText = rawText.replace(/```json|```/g, "").trim();

    try {
      return res.status(200).json(JSON.parse(cleanText));
    } catch (e) {
      return res.status(200).json({
        country: "Unknown",
        emoji: "🌍",
        bestSeason: "All Year",
        highlights: ["Explore the city", "Taste local food", "Take amazing photos"],
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}