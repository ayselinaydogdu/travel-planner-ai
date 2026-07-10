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
  return text.replace(/[çÇğĞıİöÖşŞüÜéÉèÈêÊàÀâÂîÎôÔùÙëËïÏñÑß]/g, (ch) => map[ch] || ch);
}

export function downloadTripPDF(trip, plan) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  doc.setFontSize(18);
  doc.text(transliterate(`Trip to ${trip.to}`), margin, y);
  y += 10;

  doc.setFontSize(11);
  doc.text(
    transliterate(`From: ${trip.from}  |  Days: ${trip.days}  |  Budget: EUR ${trip.budget}`),
    margin,
    y
  );
  y += 12;

  const cleanPlan = transliterate(
    plan
      .replace(/#{1,6}\s?/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "-")
      .replace(/€/g, "EUR ")
  );

  doc.setFontSize(10);
  const lines = doc.splitTextToSize(cleanPlan, maxWidth);

  lines.forEach((line) => {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, margin, y);
    y += 6;
  });

  const safeName = transliterate(trip.to).replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`${safeName}_trip_plan.pdf`);
}