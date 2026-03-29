import jsPDF from "jspdf";
import QRCode from "qrcode";

interface TicketInfo {
  orderId: string;
  orderItemId: string;
  eventTitle: string;
  ticketName: string;
  quantity: number;
  customerName: string;
  eventDate: string;
  eventLocation: string;
}

export async function generateTicketPDF(tickets: TicketInfo[]): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  for (let i = 0; i < tickets.length; i++) {
    const t = tickets[i];
    if (i > 0) doc.addPage();

    // Background
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 0, 210, 297, "F");

    // Ticket card
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(20, 30, 170, 200, 4, 4, "F");
    doc.setDrawColor(230, 230, 230);
    doc.roundedRect(20, 30, 170, 200, 4, 4, "S");

    // Header bar
    doc.setFillColor(232, 93, 47); // Qantid primary orange
    doc.roundedRect(20, 30, 170, 30, 4, 4, "F");
    doc.rect(20, 46, 170, 14, "F"); // fill bottom corners

    // Event title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    const titleLines = doc.splitTextToSize(t.eventTitle, 150);
    doc.text(titleLines, 30, 48);

    // Details
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    let y = 75;
    const addField = (label: string, value: string) => {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(9);
      doc.text(label.toUpperCase(), 30, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(12);
      doc.text(value, 30, y);
      y += 10;
    };

    addField("Attendee", t.customerName);
    addField("Date", t.eventDate);
    addField("Location", t.eventLocation);
    addField("Ticket", `${t.ticketName} × ${t.quantity}`);
    addField("Order", t.orderId.slice(0, 8).toUpperCase());

    // QR Code
    const qrData = JSON.stringify({
      orderId: t.orderId,
      orderItemId: t.orderItemId,
      event: t.eventTitle,
      ticket: t.ticketName,
    });

    try {
      const qrDataUrl = await QRCode.toDataURL(qrData, { width: 400, margin: 1 });
      doc.addImage(qrDataUrl, "PNG", 125, 75, 55, 55);
    } catch {
      // QR generation failed, skip
    }

    // Dashed line
    doc.setDrawColor(200, 200, 200);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(30, 175, 180, 175);
    doc.setLineDashPattern([], 0);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("Present this ticket at the event entrance", 30, 185);
    doc.text("Powered by Qantid", 30, 192);

    // Ticket ID
    doc.setFontSize(8);
    doc.text(`ID: ${t.orderItemId.slice(0, 12).toUpperCase()}`, 30, 220);
  }

  doc.save(`qantid-${tickets[0]?.orderId?.slice(0, 8) ?? "ticket"}.pdf`);
}
