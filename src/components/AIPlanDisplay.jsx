import { useLanguage } from "../context/LanguageContext";

function highlightCosts(text) {
  const parts = text.split(/(€\s?[\d.,]+(?:-€?\s?[\d.,]+)?)/g);
  return parts.map((part, i) =>
    /€/.test(part) ? (
      <span className="cost-tag" key={i}>
        {part.trim()}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

const PERIOD_ICONS = {
  morning: "🌅",
  afternoon: "☀️",
  evening: "🌙",
};

function BookingLinks({ destination }) {
  const { t } = useLanguage();
  if (!destination) return null;

  const city = encodeURIComponent(destination);

  const links = [
    {
      name: "Booking.com",
      icon: "🛏️",
      url: `https://www.booking.com/searchresults.html?ss=${city}`,
    },
    {
      name: "Trivago",
      icon: "🔍",
      url: `https://www.trivago.com/en-US/srl/hotels-${city}`,
    },
    {
      name: "Airbnb",
      icon: "🏠",
      url: `https://www.airbnb.com/s/${city}/homes`,
    },
  ];

  return (
    <div className="booking-links-card">
      <h3>{t.booking.title}</h3>
      <p className="booking-links-subtitle">{t.booking.subtitle}</p>
      <div className="booking-links-grid">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="booking-link"
          >
            <span className="booking-link-icon">{link.icon}</span>
            {link.name}
          </a>
        ))}
      </div>
    </div>
  );
}

// plan artık düz metin değil, şu şekilde bir JSON objesi:
// {
//   days: [{ number: 1, morning: ["..."], afternoon: ["..."], evening: ["..."] }],
//   costBreakdown: { rows: [{ label, value }], grandTotal: "€760" }
// }
function AIPlanDisplay({ plan, destination }) {
  const { t } = useLanguage();
  if (!plan || !Array.isArray(plan.days)) return null;

  const periodLabels = {
    morning: t.planLabels.morning,
    afternoon: t.planLabels.afternoon,
    evening: t.planLabels.evening,
  };

  const periodOrder = ["morning", "afternoon", "evening"];
  const { rows = [], grandTotal } = plan.costBreakdown || {};

  return (
    <div className="ai-plan-display">
      {plan.days.map((day) => (
        <div className="day-card" key={day.number}>
          <span className="day-badge">
            📅 {t.planLabels.day} {day.number}
          </span>
          {periodOrder.map((periodKey) => {
            const items = day[periodKey];
            if (!items || items.length === 0) return null;
            return (
              <div className="period-block" key={periodKey}>
                <h4 className="period-title">
                  {PERIOD_ICONS[periodKey]} {periodLabels[periodKey]}
                </h4>
                <ul>
                  {items.map((item, i) => (
                    <li key={i}>{highlightCosts(item)}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      ))}
      {(rows.length > 0 || grandTotal) && (
        <div className="cost-breakdown-card">
          <h3>💰 {t.planLabels.costBreakdown}</h3>
          <div className="cost-grid">
            {rows.map((row, i) => (
              <div className="cost-row" key={i}>
                <span className="cost-label">{row.label}</span>
                <span className="cost-value">{highlightCosts(row.value)}</span>
              </div>
            ))}
          </div>
          {grandTotal && (
            <div className="grand-total">
              <span>{t.planLabels.grandTotal}</span>
              <span>{highlightCosts(grandTotal)}</span>
            </div>
          )}
        </div>
      )}
      <BookingLinks destination={destination} />
    </div>
  );
}

export default AIPlanDisplay;