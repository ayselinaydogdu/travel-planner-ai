function formatList(list) {
  if (!list || list.length === 0 || list.includes("General")) {
    return null;
  }
  return list.join(", ");
}

const LANGUAGE_NAMES = {
  en: "English",
  tr: "Turkish",
  es: "Spanish",
  fr: "French",
  de: "German",
};

// CJK (Çince/Japonca/Korece) karakter var mı diye kontrol eder.
// Bu karakterler hiçbir desteklenen dilde (en/tr/es/fr/de) normalde bulunmaz,
// bu yüzden görülürse dil karışması olduğunu gösterir.
function hasUnexpectedCharacters(text) {
  const cjkRegex = /[\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/;
  return cjkRegex.test(text);
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
      }),
    }
  );
  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { trip } = req.body;
  const API_KEY = process.env.GROQ_API_KEY;

  const styleText = formatList(trip.travelStyle);
  const interestText = formatList(trip.interest);
  const languageName = LANGUAGE_NAMES[trip.language] || "English";

  const styleInstruction = styleText
    ? `Travel Style(s): ${styleText}. The itinerary must clearly reflect ALL of these styles together in the choice of accommodation, dining, and activities.`
    : `Travel Style: General — no specific style was requested, so create a well-balanced, broadly appealing itinerary suitable for an average traveler.`;

  const interestInstruction = interestText
    ? `Main Interest(s): ${interestText}. At least 60% of the activities each day should relate to these interests, distributing attention across all of them (don't let one completely dominate).`
    : `Main Interest: General — no specific interest was requested, so include a diverse mix of popular activities (sightseeing, food, culture, nature) to give a well-rounded experience.`;

  const prompt = `
You are an expert travel planner who is very careful with budgets.
Create a ${trip.days}-day travel itinerary.
Destination: ${trip.to}
Departure City: ${trip.from}
Total Budget: €${trip.budget} — this is a target budget for the ENTIRE trip (accommodation + food + activities + local transportation, for all ${trip.days} days combined).
${styleInstruction}
${interestInstruction}
STRICT BUDGET RULES:
- The Grand Total should be realistic and land close to €${trip.budget} — use at least 85% of the budget. Do not leave a large unused margin; if there is room, upgrade accommodation quality, add more activities, or include nicer dining instead of leaving money unspent.
- The Grand Total must NOT exceed €${trip.budget}.
- Divide a reasonable share of the budget across ${trip.days} nights for accommodation.
STYLE AND INTEREST RULES:
- Generate a DIFFERENT set of activities for EACH day — do not repeat activities across days.
For each day, include:
Morning
Afternoon
Evening
(each with 1-2 activities and their estimated cost in €)
At the very end, add a section titled "Cost Breakdown" with:
- Accommodation total
- Food total
- Activities total
- Transportation total
- Grand Total (must be ≤ €${trip.budget} and close to it)
If the Grand Total is too far below or above €${trip.budget}, revise your choices before answering.
IMPORTANT: The Grand Total must be the actual sum of Accommodation + Food + Activities + Transportation — do not add any extra unexplained amount to force the total closer to the budget. If the sum is far below the budget, go back and genuinely add more activities, better dining, or nicer accommodation into the daily plan itself (Day 1, Day 2, etc.) so that the itemized costs already reflect the full budget. Never write things like "+ €X (adjustment)" in the Grand Total. The Grand Total must be a single plain number, e.g. "Grand Total: €950".
LANGUAGE RULES (very important, follow strictly):
- Write ALL content — activity descriptions, place explanations, and the Cost Breakdown category labels (e.g. the Turkish word for "Accommodation total", "Food total", etc.) — entirely and only in ${languageName}.
- Do NOT mix in English words, Chinese characters, or any other language inside the ${languageName} text. Every sentence must be pure, natural, grammatically correct ${languageName}.
- Do NOT invent or use non-${languageName} vocabulary for concepts that have a normal ${languageName} translation.
- The ONLY exception — the ONLY text allowed to stay in English no matter what — is these exact structural headers: "## Day 1", "## Day 2", etc., "Morning", "Afternoon", "Evening", and "## Cost Breakdown". These five header types must ALWAYS stay in English exactly as shown, since they are used for parsing.
- Before finalizing your answer, re-read every sentence and make sure it is entirely in ${languageName} except for those exact headers.
Format clearly with "## Day 1", "## Day 2", etc. as headers (always in English). Return only the itinerary and cost breakdown, no introduction or closing remarks.
`;

  try {
    let result = await callGroq(prompt, API_KEY);

    if (!result.ok) {
      return res.status(result.status).json({
        error: result.data?.error?.message || "Groq API error",
      });
    }

    if (!result.data.choices || !result.data.choices[0]) {
      return res.status(500).json({ error: "Groq API geçerli bir yanıt döndürmedi" });
    }

    let content = result.data.choices[0].message.content;

    // Dil karışması tespit edilirse (örn. CJK karakterler), bir kez daha dene.
    if (hasUnexpectedCharacters(content)) {
      const retryResult = await callGroq(prompt, API_KEY);
      if (
        retryResult.ok &&
        retryResult.data.choices &&
        retryResult.data.choices[0]
      ) {
        const retryContent = retryResult.data.choices[0].message.content;
        // Yeniden deneme temiz geldiyse onu kullan; hâlâ bozuksa elimizdeki
        // ilk yanıtla devam et (sonsuz döngüye girmemek için).
        if (!hasUnexpectedCharacters(retryContent)) {
          content = retryContent;
        }
      }
    }

    return res.status(200).json({ content });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}