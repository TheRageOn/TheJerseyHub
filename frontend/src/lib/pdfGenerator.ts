import { jsPDF } from "jspdf";

export interface OrderPDFPayload {
  orderId: string;
  date: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
  };
  items: {
    name: string;
    club?: string;
    size: string;
    quantity: number;
    priceNumeric: number;
    customization?: {
      playerName?: string;
      playerNumber?: string;
      patches?: string[];
    };
  }[];
  subtotal: number;
  total: number;
  paymentMethod: string;
}

export interface CertificatePDFPayload {
  mintId: string;
  productName: string;
  club: string;
  season: string;
  customerName: string;
  orderDate: string;
}

/**
 * Generates and immediately downloads an official Receipt PDF directly to device
 */
export function downloadReceiptPDF(order: OrderPDFPayload): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Background Accent Top Bar
  doc.setFillColor(255, 85, 0); // #ff5500
  doc.rect(0, 0, 210, 8, "F");

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(15, 15, 15);
  doc.text("THEJERSEYHUB", 20, 26);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("OFFICIAL MATCH SPECIFICATION RECEIPT", 20, 32);

  // Order Ref & Date on Top Right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 85, 0);
  doc.text(`ORDER: ${order.orderId}`, 190, 24, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`DATE: ${order.date}`, 190, 30, { align: "right" });
  doc.text(`PAYMENT: ${order.paymentMethod}`, 190, 35, { align: "right" });

  // Divider
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(20, 42, 190, 42);

  // Customer & Shipping Info Box
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(20, 48, 170, 30, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(140, 140, 140);
  doc.text("CUSTOMER DETAILS", 26, 56);
  doc.text("DELIVERY DESTINATION", 110, 56);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text(order.customer.name, 26, 62);
  doc.text(order.customer.address, 110, 62);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`${order.customer.email} • ${order.customer.phone}`, 26, 68);
  doc.text(`${order.customer.city}, Nepal`, 110, 68);

  // Table Header
  let y = 92;
  doc.setFillColor(240, 240, 240);
  doc.rect(20, y - 5, 170, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text("ITEM DESCRIPTION", 24, y);
  doc.text("SPECIFICATION", 95, y);
  doc.text("SIZE", 135, y);
  doc.text("QTY", 155, y);
  doc.text("TOTAL", 186, y, { align: "right" });

  // Table Rows
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);

  order.items.forEach((item) => {
    doc.setFont("helvetica", "bold");
    doc.text(item.name, 24, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(item.club || "Authentic Issue", 24, y + 4);

    // Custom specs
    if (item.customization?.playerName) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 85, 0);
      doc.text(
        `PRESS: ${item.customization.playerName} #${item.customization.playerNumber || ""}`,
        95,
        y
      );
    } else {
      doc.setTextColor(120, 120, 120);
      doc.text("Standard Match Spec", 95, y);
    }

    if (item.customization?.patches && item.customization.patches.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Badges: ${item.customization.patches.join(", ").toUpperCase()}`,
        95,
        y + 4
      );
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.text(item.size, 137, y);
    doc.text(String(item.quantity), 158, y);

    doc.setFont("helvetica", "bold");
    doc.text(`$${(item.priceNumeric * item.quantity).toFixed(2)}`, 186, y, {
      align: "right",
    });

    // Row divider
    y += 11;
    doc.setDrawColor(240, 240, 240);
    doc.line(20, y - 3, 190, y - 3);
  });

  // Totals Area
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("Subtotal:", 140, y);
  doc.text(`$${order.subtotal.toFixed(2)}`, 186, y, { align: "right" });

  y += 6;
  doc.text("Express Courier Shipping:", 140, y);
  doc.setTextColor(46, 125, 50);
  doc.text("FREE ($0.00)", 186, y, { align: "right" });

  y += 8;
  doc.setDrawColor(20, 20, 20);
  doc.line(140, y - 2, 190, y - 2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 85, 0);
  doc.text("Total Due:", 140, y + 4);
  doc.text(`$${order.total.toFixed(2)}`, 186, y + 4, { align: "right" });

  // Footer & Vault Seal
  doc.setDrawColor(230, 230, 230);
  doc.line(20, 270, 190, 270);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.text(
    "Thank you for acquiring authentic football culture kits from TheJerseyHub.",
    105,
    276,
    { align: "center" }
  );
  doc.text(
    "All match specifications are protected by our permanent archive warranty • support@thejerseyhub.com",
    105,
    281,
    { align: "center" }
  );

  // Directly trigger browser file download without opening print dialog
  doc.save(`Receipt_${order.orderId}.pdf`);
}

/**
 * Generates and immediately downloads an official Certificate of Authenticity PDF
 */
export function downloadCertificatePDF(cert: CertificatePDFPayload): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Outer Double Frame
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(1.5);
  doc.rect(15, 15, 180, 267);

  doc.setLineWidth(0.5);
  doc.rect(18, 18, 174, 261);

  // Top Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(20, 20, 20);
  doc.text("THEJERSEYHUB ARCHIVE", 105, 38, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 85, 0);
  doc.text("OFFICIAL CERTIFICATE OF AUTHENTICITY", 105, 45, { align: "center" });

  // Serial Mint Badge
  doc.setFillColor(20, 20, 20);
  doc.roundedRect(65, 54, 80, 10, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`MINT ID: ${cert.mintId}`, 105, 60.5, { align: "center" });

  // Specification Details Box
  let y = 82;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text("KIT SPECIFICATION", 30, y);

  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 15, 15);
  doc.text(cert.productName, 30, y);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Club: ${cert.club}   |   Season: ${cert.season}`, 30, y);

  // Divider
  y += 10;
  doc.setDrawColor(220, 220, 220);
  doc.line(30, y, 180, y);

  // Verification Details
  y += 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text("COLLECTOR PROVENANCE", 30, y);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text(`Certified Owner:`, 30, y);
  doc.setFont("helvetica", "bold");
  doc.text(cert.customerName, 70, y);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.text(`Issue Date:`, 30, y);
  doc.setFont("helvetica", "bold");
  doc.text(cert.orderDate, 70, y);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.text(`Archive Status:`, 30, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(46, 125, 50);
  doc.text("Permanent Vault Record // 100% Authentic Spec", 70, y);

  // Seal Paragraph
  y += 20;
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(30, y, 150, 28, 3, 3, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  doc.text(
    "This certifies that the referenced match kit has been individually verified against official",
    105,
    y + 8,
    { align: "center" }
  );
  doc.text(
    "manufacturer SKU registries, player-issue polyester weight, and authentic badge stitch count.",
    105,
    y + 14,
    { align: "center" }
  );
  doc.text(
    "Guaranteed permanent match specification provenance by TheJerseyHub Atelier.",
    105,
    y + 20,
    { align: "center" }
  );

  // Signatures
  y += 60;
  doc.setDrawColor(50, 50, 50);
  doc.line(35, y, 85, y);
  doc.line(125, y, 175, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(50, 50, 50);
  doc.text("CHIEF CURATOR", 60, y + 6, { align: "center" });
  doc.text("VAULT ARCHIVE SEAL", 150, y + 6, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text("TheJerseyHub Atelier", 60, y + 10, { align: "center" });
  doc.text("Permanent Provenance Registry", 150, y + 10, { align: "center" });

  // Direct download
  doc.save(`Certificate_${cert.mintId}.pdf`);
}
