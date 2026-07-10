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

function parsePeriods(dayContent) {
  const regex = /\*{0,2}(Morning|Afternoon|Evening)\*{0,2}:?/gi;
  const matches = [...dayContent.matchAll(regex)];
  if (matches.length === 0) {
    return [{ label: null, items: splitItems(dayContent) }];
  }
  const periods = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : dayContent.length;
    const content = dayContent.slice(start, end).trim();
    periods.push({ label: matches[i][1], items: splitItems(content) });
  }
  return periods;
}

function splitItems(content) {
  const items = content
    .split(/\n\s*[-*]\s*|\n+/)
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
  return items.length > 0 ? items : [content.trim()];
}

function periodIcon(label) {
  if (/morning/i.test(label)) return "🌅";
  if (/afternoon/i.test(label)) return "☀️";
  if (/evening/i.test(label)) return "🌙";
  return "📌";
}

// Artık "total" kelimesinin İngilizce geçmesine bağımlı değil.
// Her "Etiket: €değer" satırını yakalar, en sondaki satırı Grand Total sayar
// (AI prompt'ta Grand Total'ı her zaman en sona yazıyor).
function parseCostBreakdown(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const rows = [];
  lines.forEach((line) => {
    const match = line.match(/^[-*]?\s*([^:]+):\s*(.+)$/);
    if (match) {
      rows.push({ label: match[1].trim(), value: match[2].trim() });
    }
  });
  if (rows.length === 0) return { rows: [], grandTotal: null };
  const grandTotal = rows[rows.length - 1].value;
  return { rows: rows.slice(0, -1), grandTotal };
}

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

function AIPlanDisplay({ plan, destination }) {
  const { t } = useLanguage();
  if (!plan) return null;

  const periodLabels = {
    Morning: t.planLabels.morning,
    Afternoon: t.planLabels.afternoon,
    Evening: t.planLabels.evening,
  };

  const [daysSection, costSection] = plan.split(/##\s*Cost Breakdown/i);
  const dayBlocks = daysSection.split(/##\s*Day\s*(\d+)/i).filter((s) => s.trim() !== "");
  const days = [];
  for (let i = 0; i < dayBlocks.length; i += 2) {
    const number = dayBlocks[i];
    const content = dayBlocks[i + 1] || "";
    if (/^\d+$/.test(number.trim())) {
      days.push({ number: number.trim(), periods: parsePeriods(content) });
    }
  }

  const { rows, grandTotal } = costSection
    ? parseCostBreakdown(costSection)
    : { rows: [], grandTotal: null };

  return (
    <div className="ai-plan-display">
      {days.map((day) => (
        <div className="day-card" key={day.number}>
          <span className="day-badge">
            📅 {t.planLabels.day} {day.number}
          </span>
          {day.periods.map((period, idx) => (
            <div className="period-block" key={idx}>
              {period.label && (
                <h4 className="period-title">
                  {periodIcon(period.label)} {periodLabels[period.label] || period.label}
                </h4>
              )}
              <ul>
                {period.items.map((item, i) => (
                  <li key={i}>{highlightCosts(item)}</li>
                ))}
              </ul>
            </div>
          ))}
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