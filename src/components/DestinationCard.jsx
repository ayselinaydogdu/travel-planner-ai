import { useState, useEffect } from "react";
import { getDestinationInfo } from "../services/groqService";

function DestinationCard({ trip }) {
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInfo() {
      setLoading(true);
      try {
        const info = await getDestinationInfo(trip.to);
        setDestination(info);
      } catch (error) {
        console.error("Destination info error:", error);
        setDestination({
          emoji: "🌍",
          country: "Unknown",
          bestSeason: "All Year",
          highlights: [
            "Explore the city",
            "Taste local food",
            "Take amazing photos",
          ],
        });
      }
      setLoading(false);
    }
    fetchInfo();
  }, [trip.to]);

  if (loading || !destination) {
    return (
      <section className="destination-card">
        <h2>🌍 Loading destination info...</h2>
      </section>
    );
  }

  return (
    <section className="destination-card">
      <h2>
        {destination.emoji} {trip.to}
      </h2>
      <h4>{destination.country}</h4>
      <div className="destination-content">
        <div className="destination-box">
          <h3>⭐ Highlights</h3>
          <ul>
            {destination.highlights.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="destination-box">
          <h3>📅 Best Season</h3>
          <p>{destination.bestSeason}</p>
        </div>
      </div>
    </section>
  );
}

export default DestinationCard;