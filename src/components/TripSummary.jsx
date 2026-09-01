import { useLanguage } from "../context/LanguageContext";

const CURRENCY_SYMBOLS = { EUR: "€", TRY: "₺", USD: "$" };

function TripSummary({ trip }) {
  const { t } = useLanguage();

  const styleText = trip.travelStyle.map((s) => t.styles[s] || s).join(", ");
  const interestText = trip.interest.map((i) => t.interests[i] || i).join(", ");
  const symbol = CURRENCY_SYMBOLS[trip.currency] || "€";

  return (
    <div className="preview">
      <h3>🌍 {t.summary.title}</h3>
      <div className="trip-info">
        <div className="info-card">
          <div className="info-title">📍 {t.summary.departure}</div>
          <div className="info-value">{trip.from}</div>
        </div>
        <div className="info-card">
          <div className="info-title">✈️ {t.summary.destination}</div>
          <div className="info-value">{trip.to}</div>
        </div>
        <div className="info-card">
          <div className="info-title">📅 {t.summary.duration}</div>
          <div className="info-value">{trip.days} {t.summary.daysUnit}</div>
        </div>
        <div className="info-card">
          <div className="info-title">💶 {t.summary.budget}</div>
          <div className="info-value">{symbol}{trip.budget}</div>
        </div>
        <div className="info-card">
          <div className="info-title">✈️ {t.summary.style}</div>
          <div className="info-value">{styleText}</div>
        </div>
        <div className="info-card">
          <div className="info-title">❤️ {t.summary.interest}</div>
          <div className="info-value">{interestText}</div>
        </div>
      </div>
    </div>
  );
}

export default TripSummary;
