function Hero() {
  function scrollToPlanner() {
    const target = document.getElementById("planner");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <section className="hero" id="home">
      <div className="hero-glow"></div>
      <div className="hero-badge">✨ Powered by AI</div>
      <h1 className="hero-title">
        <span className="hero-emoji">🌍</span> YourNextTrip
      </h1>
      <h2 className="hero-subtitle">Plan Smarter. Travel Better.</h2>
      <p>
        AI-powered travel itineraries tailored to your destination,
        budget and travel style.
      </p>
      <button className="hero-cta" onClick={scrollToPlanner}>
        ✈️ Start Planning →
      </button>
    </section>
  );
}

export default Hero;