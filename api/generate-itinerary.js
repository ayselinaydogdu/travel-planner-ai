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

// CJK (Çince/Japonca/Korece) ve Arapça karakter var mı diye kontrol eder.
// Bu karakterler hiçbir desteklenen dilde (en/tr/es/fr/de) normalde bulunmaz,
// bu yüzden görülürse dil karışması olduğunu gösterir.
function hasUnexpectedCharacters(text) {
  const leakRegex = /[\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF\u0600-\u06FF]/;
  return leakRegex.test(text);
}

// JSON'daki tüm string değerleri tek bir metinde birleştirir, böylece dil
// sızıntısı kontrolünü tüm plan üzerinde tek seferde yapabiliriz.
function collectStrings(value, acc = []) {
  if (typeof value === "string") {
    acc.push(value);
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, acc));
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectStrings(item, acc));
  }
  return acc;
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

function extractPlan(apiData) {
  const raw = apiData?.choices?.[0]?.message?.content;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
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
- Each day must have 4-5 rich activities/recommendations for morning, 4-5 for afternoon, and 3-4 for evening, each with its estimated cost in € (use 0€ for free activities like walking around a neighborhood or viewing a landmark from outside).
- Think like a local expert planning a real day: group activities that are geographically close together so the day flows naturally (e.g. if you recommend a museum, also suggest a second nearby museum, a nearby café, or a nearby viewpoint within walking distance — mention that it's nearby in the description).
- Include MULTIPLE distinct food/drink experiences per day (not just one meal) — for example: a local breakfast spot, a mid-morning coffee or street snack, a lunch recommendation, an afternoon treat, and a dinner spot with a specific dish or specialty named. Vary the type of place each time (café, market stall, traditional restaurant, rooftop bar, bakery, etc.) — never repeat the same food venue type twice in the same day.
- Include MULTIPLE sightseeing options where relevant (e.g. if the destination has several notable museums, galleries, or landmarks, spread them across different days and mention nearby alternatives the traveler could also check out if they have extra time).
- Make each activity description vivid and specific: instead of just naming a place, add a short, evocative detail (e.g. why it's worth visiting, what makes it special, a sensory detail, opening-hours tip, or a local secret) in 1 concise sentence.
- Include variety across categories every day: at least two landmarks/sights, two food/drink experiences, one local/cultural experience (market, neighborhood walk, viewpoint, hidden gem), and where relevant one or two activities tied to the traveler's interests.
- Avoid generic phrasing like "Visit X for €Y" repeated mechanically — vary sentence structure and tone across activities so the itinerary feels lively, detailed, and written by someone who truly knows the destination, not like a checklist.
COST BREAKDOWN RULES:
- Provide exactly 4 rows: Accommodation total, Food total, Activities total, Transportation total.
- Then provide a separate Grand Total (must be ≤ €${trip.budget} and close to it, at least 85% of it).
- The Grand Total must be the actual sum of the 4 rows — never add an unexplained extra amount.
- If the sum is far below the budget, add more/better activities, dining, or accommodation into the days themselves so the itemized costs already reflect the full budget.
LANGUAGE RULES (very important, follow strictly):
- ALL text VALUES in the JSON (activity descriptions, cost breakdown row labels, everything) must be written entirely and only in ${languageName}.
- Do NOT mix in English words, Chinese characters, Arabic characters, or any other language inside the ${languageName} text. Every sentence must be pure, natural, grammatically correct ${languageName}.
- The JSON KEYS themselves (like "morning", "afternoon", "label", "value") must stay exactly as specified in the schema below — do not translate keys, only values.
- Before finalizing, re-read every text value and make sure it is entirely in ${languageName}.
OUTPUT FORMAT (very important):
Respond with ONLY a single valid JSON object, no markdown, no code fences, no explanation, matching EXACTLY this schema:
{
  "days": [
    {
      "number": 1,
      "morning": ["activity 1 with cost", "activity 2 with cost", "activity 3 with cost", "activity 4 with cost"],
      "afternoon": ["activity 1 with cost", "activity 2 with cost", "activity 3 with cost", "activity 4 with cost"],
      "evening": ["activity 1 with cost", "activity 2 with cost", "activity 3 with cost"]
    }
  ],
  "costBreakdown": {
    "rows": [
      { "label": "Accommodation total (in ${languageName})", "value": "€240 (...)" },
      { "label": "Food total (in ${languageName})", "value": "€240 (...)" },
      { "label": "Activities total (in ${languageName})", "value": "€170 (...)" },
      { "label": "Transportation total (in ${languageName})", "value": "€110 (...)" }
    ],
    "grandTotal": "€760"
  }
}
The "days" array must contain exactly ${trip.days} entries, numbered 1 to ${trip.days}.
`;

  try {
    let result = await callGroq(prompt, API_KEY);

    if (!result.ok) {
      return res.status(result.status).json({
        error: result.data?.error?.message || "Groq API error",
      });
    }

    let plan = extractPlan(result.data);
    let planText = plan ? collectStrings(plan).join(" ") : "";

    const needsRetry =
      !isValidPlan(plan) || hasUnexpectedCharacters(planText);

    if (needsRetry) {
      const retryResult = await callGroq(prompt, API_KEY);
      const retryPlan = extractPlan(retryResult.data);
      const retryText = retryPlan ? collectStrings(retryPlan).join(" ") : "";

      if (isValidPlan(retryPlan) && !hasUnexpectedCharacters(retryText)) {
        plan = retryPlan;
      } else if (isValidPlan(retryPlan) && !isValidPlan(plan)) {
        // İlk deneme geçersizdi ama en azından yeniden deneme geçerliyse onu kullan.
        plan = retryPlan;
      }
    }

    if (!isValidPlan(plan)) {
      return res.status(500).json({
        error: "AI geçerli bir plan üretemedi, lütfen tekrar deneyin.",
      });
    }

    return res.status(200).json({ plan });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}