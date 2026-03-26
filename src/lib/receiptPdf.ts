import { jsPDF } from "jspdf";
import { getPaymentMethodLabel } from "@/lib/paymentMethod";
import type { PaymentMethod } from "@/lib/storeApi";

export interface ReceiptLineItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface ReceiptData {
  orderId: string;
  createdAt: string;
  status: string;
  customerName?: string;
  phone?: string;
  address?: string;
  pincode?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: string;
  notes?: string;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  items: ReceiptLineItem[];
}

const formatPrice = (value: number) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toFixed(2) : "0.00";
};

const drawPdfHeader = (doc: jsPDF, title: string) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(15, 118, 110);
  doc.rect(0, 0, pageWidth, 74, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("VEL SUPER MARKET", 40, 35);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(title, 40, 54);
};

const drawPdfLabelValue = (doc: jsPDF, y: number, label: string, value: string) => {
  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(label, 40, y);
  doc.setFont("helvetica", "normal");
  doc.text(value, 150, y);
};

export const downloadReceiptPdf = (receipt: ReceiptData) => {
  const issuedOn = new Date(receipt.createdAt).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageHeight = doc.internal.pageSize.getHeight();

  drawPdfHeader(doc, "Order Receipt");

  let y = 102;
  drawPdfLabelValue(doc, y, "Receipt For", receipt.customerName || "Customer");
  y += 16;
  drawPdfLabelValue(doc, y, "Order ID", receipt.orderId);
  y += 16;
  drawPdfLabelValue(doc, y, "Placed On", issuedOn);
  y += 16;
  drawPdfLabelValue(doc, y, "Status", receipt.status);
  y += 16;
  drawPdfLabelValue(doc, y, "Payment Method", getPaymentMethodLabel(receipt.paymentMethod, "N/A"));
  y += 16;
  drawPdfLabelValue(doc, y, "Payment Status", receipt.paymentStatus || "N/A");
  y += 16;
  drawPdfLabelValue(doc, y, "Phone", receipt.phone || "N/A");
  y += 16;
  drawPdfLabelValue(doc, y, "Pincode", receipt.pincode || "N/A");
  y += 16;

  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Delivery Address", 40, y);
  doc.setFont("helvetica", "normal");
  const addressLines = doc.splitTextToSize(receipt.address || "N/A", 500);
  doc.text(addressLines, 150, y);
  y += Math.max(18, addressLines.length * 12 + 8);

  doc.setDrawColor(209, 213, 219);
  doc.line(40, y, 555, y);
  y += 16;

  const colName = 40;
  const colQty = 355;
  const colUnit = 435;
  const colTotal = 555;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Item", colName, y);
  doc.text("Qty", colQty, y, { align: "right" });
  doc.text("Unit Price", colUnit, y, { align: "right" });
  doc.text("Line Total", colTotal, y, { align: "right" });
  y += 10;
  doc.line(40, y, 555, y);
  y += 14;

  doc.setFont("helvetica", "normal");
  receipt.items.forEach((item) => {
    const name = item.name || "Product";
    const qty = String(item.quantity);
    const unit = formatPrice(item.unitPrice);
    const lineTotal = formatPrice(item.unitPrice * item.quantity);

    const nameLines = doc.splitTextToSize(name, 290);
    const rowHeight = Math.max(16, nameLines.length * 12);

    if (y + rowHeight > pageHeight - 120) {
      doc.addPage();
      drawPdfHeader(doc, "Order Receipt (Continued)");
      y = 102;
      doc.setFont("helvetica", "bold");
      doc.text("Item", colName, y);
      doc.text("Qty", colQty, y, { align: "right" });
      doc.text("Unit Price", colUnit, y, { align: "right" });
      doc.text("Line Total", colTotal, y, { align: "right" });
      y += 10;
      doc.line(40, y, 555, y);
      y += 14;
      doc.setFont("helvetica", "normal");
    }

    doc.text(nameLines, colName, y);
    doc.text(qty, colQty, y, { align: "right" });
    doc.text(unit, colUnit, y, { align: "right" });
    doc.text(lineTotal, colTotal, y, { align: "right" });
    y += rowHeight;
    doc.setDrawColor(229, 231, 235);
    doc.line(40, y, 555, y);
    y += 10;
  });

  if (y > pageHeight - 120) {
    doc.addPage();
    drawPdfHeader(doc, "Order Receipt (Totals)");
    y = 120;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Subtotal", 430, y, { align: "right" });
  doc.text(formatPrice(receipt.subtotal), 555, y, { align: "right" });
  y += 18;
  doc.text("Delivery", 430, y, { align: "right" });
  doc.text(formatPrice(receipt.deliveryCharge), 555, y, { align: "right" });
  y += 8;
  doc.line(430, y, 555, y);
  y += 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total", 430, y, { align: "right" });
  doc.text(formatPrice(receipt.total), 555, y, { align: "right" });

  const footerText = receipt.notes || "Thank you for shopping with us.";
  const footerLines = doc.splitTextToSize(footerText, 515);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  doc.text(footerLines, 40, pageHeight - 44);

  const fileDate = new Date(receipt.createdAt).toISOString().slice(0, 10);
  const suffix = receipt.orderId.slice(-6);
  doc.save(`receipt-${suffix}-${fileDate}.pdf`);
};
