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

export async function getDestinationInfo(city) {
  const response = await fetch("/api/destination-info", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ city }),
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