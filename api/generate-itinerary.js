export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { trip } = req.body;
  const API_KEY = process.env.GROQ_API_KEY;

  const prompt = `
You are an expert travel planner who is very careful with budgets.
Create a ${trip.days}-day travel itinerary.
Destination: ${trip.to}
Departure City: ${trip.from}
Total Budget: €${trip.budget} — this is a target budget for the ENTIRE trip (accommodation + food + activities + local transportation, for all ${trip.days} days combined).
Travel Style: ${trip.travelStyle}
Main Interest: ${trip.interest}
STRICT BUDGET RULES:
- The Grand Total should be realistic and land close to €${trip.budget} — use at least 85% of the budget. Do not leave a large unused margin; if there is room, upgrade accommodation quality, add more activities, or include nicer dining instead of leaving money unspent.
- The Grand Total must NOT exceed €${trip.budget}.
- Divide a reasonable share of the budget across ${trip.days} nights for accommodation, matching the "${trip.travelStyle}" style.
STYLE AND INTEREST RULES:
- The itinerary must clearly reflect the "${trip.travelStyle}" travel style in the choice of accommodation, dining, and activities (e.g. "Family" style should include family-friendly venues, activities suitable for children, and family-sized dining options; "Luxury" should feel upscale; "Adventure" should include active/outdoor experiences; "Budget" should prioritize free/cheap options).
- At least 60% of the activities each day should relate to the interest: "${trip.interest}".
- Both the Travel Style and the Interest should be visibly reflected together — don't let one completely override the other.
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
Format clearly with "Day 1", "Day 2", etc. as headers. Return only the itinerary and cost breakdown, no introduction or closing remarks.
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
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Groq API error",
      });
    }

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: "Groq API geçerli bir yanıt döndürmedi" });
    }

    return res.status(200).json({ content: data.choices[0].message.content });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}