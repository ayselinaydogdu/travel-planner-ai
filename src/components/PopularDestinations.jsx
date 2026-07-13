import destinations from "../data/destinations";
import { useLanguage } from "../context/LanguageContext";

function PopularDestinations() {
  const { t } = useLanguage();

  return (
    <section className="popular-destinations" id="destinations">
      <h2>{t.destinationsSection.title}</h2>
      <p className="itinerary-subtitle">{t.destinationsSection.subtitle}</p>
      <div className="destinations-grid">
        {Object.entries(destinations).map(([key, dest]) => {
          const info = t.destinationsInfo[key];
          return (
            <div className="info-card destination-mini-card" key={key}>
              <div className="info-title">
                {dest.emoji} {info.name}
              </div>
              <div className="info-value">{info.country}</div>
              <ul className="destination-mini-list">
                {info.highlights.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default PopularDestinations;
