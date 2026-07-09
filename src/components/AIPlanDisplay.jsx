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
  if (label === "Morning") return "🌅";
  if (label === "Afternoon") return "☀️";
  if (label === "Evening") return "🌙";
  return "📌";
}

function parseCostBreakdown(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const rows = [];
  let grandTotal = null;

  lines.forEach((line) => {
    const match = line.match(/^-?\s*([A-Za-z ]+total)\s*:\s*(.+)$/i);
    if (match) {
      const label = match[1].trim();
      const value = match[2].trim();
      if (/^grand total/i.test(label)) {
        grandTotal = value;
      } else {
        rows.push({ label, value });
      }
    }
  });

  return { rows, grandTotal };
}

function AIPlanDisplay({ plan }) {
  if (!plan) return null;

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

  const { rows, grandTotal } = costSection ? parseCostBreakdown(costSection) : { rows: [], grandTotal: null };

  return (
    <div className="ai-plan-display">
      {days.map((day) => (
        <div className="day-card" key={day.number}>
          <span className="day-badge">📅 Day {day.number}</span>
          {day.periods.map((period, idx) => (
            <div className="period-block" key={idx}>
              {period.label && (
                <h4 className="period-title">
                  {periodIcon(period.label)} {period.label}
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
          <h3>💰 Cost Breakdown</h3>
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
              <span>Grand Total</span>
              <span>{grandTotal}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AIPlanDisplay;