function About() {
  return (
    <section className="about-section" id="about">
      <h2>🧭 About YourNextTrip</h2>
      <p className="about-text">
        YourNextTrip creates a personalized, day-by-day travel itinerary in
        seconds. Just tell us where you're going, your budget, your travel
        style, and what you're most excited about — our AI takes care of the
        rest, matching real recommendations to your budget and interests.
      </p>
      <div className="about-cards">
        <div className="about-card">
          <div className="about-icon">🎯</div>
          <h4>Personalized</h4>
          <p>Tailored to you</p>
        </div>
        <div className="about-card">
          <div className="about-icon">💶</div>
          <h4>Budget-Aware</h4>
          <p>Fits your wallet</p>
        </div>
        <div className="about-card">
          <div className="about-icon">⚡</div>
          <h4>Instant</h4>
          <p>Ready in seconds</p>
        </div>
      </div>
    </section>
  );
}

export default About;