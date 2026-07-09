import destinations from "../data/destinations";

function PopularDestinations() {
  return (
    <section className="popular-destinations" id="destinations">
      <h2>🌍 Popular Destinations</h2>
      <p className="itinerary-subtitle">
        Get inspired — here are a few favorites travelers love.
      </p>
      <div className="destinations-grid">
        {Object.entries(destinations).map(([key, dest]) => (
          <div className="info-card destination-mini-card" key={key}>
            <div className="info-title">
              {dest.emoji} {key.charAt(0).toUpperCase() + key.slice(1)}
            </div>
            <div className="info-value">{dest.country}</div>
            <ul className="destination-mini-list">
              {dest.highlights.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default PopularDestinations;