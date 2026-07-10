function TripSummary({ trip }) {
  return (
    <div className="preview">
      <h3>🌍 Your Trip Summary</h3>
      <div className="trip-info">
        <div className="info-card">
          <div className="info-title">📍 Departure</div>
          <div className="info-value">{trip.from}</div>
        </div>
        <div className="info-card">
          <div className="info-title">✈️ Destination</div>
          <div className="info-value">{trip.to}</div>
        </div>
        <div className="info-card">
          <div className="info-title">📅 Duration</div>
          <div className="info-value">{trip.days} Days</div>
        </div>
        <div className="info-card">
          <div className="info-title">💶 Budget</div>
          <div className="info-value">€{trip.budget}</div>
        </div>
        <div className="info-card">
          <div className="info-title">✈️ Style</div>
          <div className="info-value">{trip.travelStyle.join(", ")}</div>
        </div>
        <div className="info-card">
          <div className="info-title">❤️ Interest</div>
          <div className="info-value">{trip.interest.join(", ")}</div>
        </div>
      </div>
    </div>
  );
}

export default TripSummary;