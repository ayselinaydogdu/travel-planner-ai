export async function generateItinerary(trip) {
  const response = await fetch("/api/generate-itinerary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trip }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Bir hata oluştu");
  }

  return data.plan;
}

export async function translateItinerary(plan, language) {
  const response = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan, language }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Çeviri sırasında bir hata oluştu");
  }

  return data.plan;
}

export async function getDestinationInfo(city, language = "en") {
  const response = await fetch("/api/destination-info", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ city, language }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(data?.error);
    return {
      country: "Unknown",
      emoji: "🌍",
      bestSeason: "All Year",
      highlights: ["Explore the city", "Taste local food", "Take amazing photos"],
    };
  }

  return data;
}