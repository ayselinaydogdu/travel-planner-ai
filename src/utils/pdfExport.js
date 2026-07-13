import jsPDF from "jspdf";

function transliterate(text) {
  const map = {
    ç: "c", Ç: "C",
    ğ: "g", Ğ: "G",
    ı: "i", İ: "I",
    ö: "o", Ö: "O",
    ş: "s", Ş: "S",
    ü: "u", Ü: "U",
    é: "e", É: "E",
    è: "e", È: "E",
    ê: "e", Ê: "E",
    à: "a", À: "A",
    â: "a", Â: "A",
    î: "i", Î: "I",
    ô: "o", Ô: "O",
    ù: "u", Ù: "U",
    ë: "e", Ë: "E",
    ï: "i", Ï: "I",
    ñ: "n", Ñ: "N",
    ß: "ss",
  };
  return text.replace(
    /[çÇğĞıİöÖşŞüÜéÉèÈêÊàÀâÂîÎôÔùÙëËïÏñÑß]/g,
    (ch) => map[ch] || ch
  );
}

// Basit renk paleti (RGB)
const COLORS = {
  primary: [37, 99, 235], // mavi
  dayBg: [239, 246, 255], // açık mavi
  costBg: [254, 249, 231], // açık sarı
  text: [30, 41, 59],
  muted: [100, 116, 139],
};

const PERIOD_ICON_LABEL = {
  morning: "AM",
  afternoon: "PM",
  evening: "EVE",
};

// plan artık JSON: { days: [{ number, morning: [], afternoon: [], evening: [] }], costBreakdown: { rows, grandTotal } }
// labels: { day, morning, afternoon, evening, costBreakdown, grandTotal, tripTo, from, days, budget }
export function downloadTripPDF(trip, plan, labels = {}) {
  const L = {
    tripTo: labels.tripTo || "Trip to",
    from: labels.from || "From",
    days: labels.days || "Days",
    budget: labels.budget || "Budget",
    day: labels.day || "Day",
    morning: labels.morning || "Morning",
    afternoon: labels.afternoon || "Afternoon",
    evening: labels.evening || "Evening",
    costBreakdown: labels.costBreakdown || "Cost Breakdown",
    grandTotal: labels.grandTotal || "Grand Total",
  };

  const CURRENCY_CODES = { EUR: "EUR", TRY: "TRY", USD: "USD" };
  const curCode = CURRENCY_CODES[trip.currency] || "EUR";
  // Para sembollerini jsPDF'in desteklediği ASCII kodlara çevirir (€/₺ varsayılan fontta çıkmaz)
  function money(text) {
    return text.replace(/€/g, "EUR ").replace(/₺/g, "TRY ");
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  function ensureSpace(neededHeight) {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = 20;
    }
  }

  // Başlık
  doc.setTextColor(...COLORS.text);
  doc.setFont(undefined, "bold");
  doc.setFontSize(20);
  doc.text(transliterate(`${L.tripTo} ${trip.to}`), margin, y);
  y += 9;

  doc.setFont(undefined, "normal");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.muted);
  doc.text(
    transliterate(
      `${L.from}: ${trip.from}  |  ${L.days}: ${trip.days}  |  ${L.budget}: ${curCode} ${trip.budget}`
    ),
    margin,
    y
  );
  y += 10;

  // Gün kartları
  plan.days.forEach((day) => {
    ensureSpace(16);

    // Gün başlığı kutusu
    doc.setFillColor(...COLORS.dayBg);
    doc.roundedRect(margin, y - 6, maxWidth, 10, 2, 2, "F");
    doc.setFont(undefined, "bold");
    doc.setFontSize(13);
    doc.setTextColor(...COLORS.primary);
    doc.text(transliterate(`${L.day} ${day.number}`), margin + 3, y);
    y += 11;

    const periods = [
      ["morning", L.morning, day.morning],
      ["afternoon", L.afternoon, day.afternoon],
      ["evening", L.evening, day.evening],
    ];

    periods.forEach(([key, label, items]) => {
      if (!items || items.length === 0) return;
      ensureSpace(8);
      doc.setFont(undefined, "bold");
      doc.setFontSize(11);
      doc.setTextColor(...COLORS.text);
      doc.text(
        transliterate(`${PERIOD_ICON_LABEL[key]}  ${label}`),
        margin + 3,
        y
      );
      y += 6;

      doc.setFont(undefined, "normal");
      doc.setTextColor(...COLORS.text);
      items.forEach((item) => {
        const bulletText = `-  ${money(item)}`;
        const lines = doc.splitTextToSize(
          transliterate(bulletText),
          maxWidth - 10
        );
        lines.forEach((line) => {
          ensureSpace(6);
          doc.text(line, margin + 6, y);
          y += 5.5;
        });
      });
      y += 2;
    });

    y += 4;
  });

  // Cost Breakdown
  const { rows = [], grandTotal } = plan.costBreakdown || {};
  if (rows.length > 0 || grandTotal) {
    ensureSpace(14);
    doc.setFillColor(...COLORS.costBg);
    const boxHeight = 10 + rows.length * 7 + (grandTotal ? 9 : 0);
    ensureSpace(boxHeight);
    doc.roundedRect(margin, y - 6, maxWidth, boxHeight, 2, 2, "F");

    doc.setFont(undefined, "bold");
    doc.setFontSize(13);
    doc.setTextColor(...COLORS.primary);
    doc.text(transliterate(L.costBreakdown), margin + 3, y);
    y += 9;

    doc.setFont(undefined, "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...COLORS.text);
    rows.forEach((row) => {
      const label = transliterate(row.label);
      const value = transliterate(money(row.value));
      doc.text(label, margin + 4, y);
      doc.text(value, pageWidth - margin - 4, y, { align: "right" });
      y += 7;
    });

    if (grandTotal) {
      doc.setFont(undefined, "bold");
      doc.setFontSize(12);
      doc.setTextColor(...COLORS.primary);
      doc.text(transliterate(L.grandTotal), margin + 4, y + 1);
      doc.text(
        transliterate(money(grandTotal)),
        pageWidth - margin - 4,
        y + 1,
        { align: "right" }
      );
      y += 9;
    }
  }

  const safeName = transliterate(trip.to).replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`${safeName}_trip_plan.pdf`);
}