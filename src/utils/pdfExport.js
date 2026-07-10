import jsPDF from "jspdf";

export function downloadTripPDF(trip, plan) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  doc.setFontSize(18);
  doc.text(`Trip to ${trip.to}`, margin, y);
  y += 10;

  doc.setFontSize(11);
  doc.text(`From: ${trip.from}  |  Days: ${trip.days}  |  Budget: EUR ${trip.budget}`, margin, y);
  y += 12;

  const cleanPlan = plan
    .replace(/#{1,6}\s?/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "-")
    .replace(/€/g, "EUR ");

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

  const safeName = trip.to.replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`${safeName}_trip_plan.pdf`);
}