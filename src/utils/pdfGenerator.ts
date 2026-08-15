import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Expense, SaleOrder, StoreSettings } from '../types/pos';

export function generateInvoicePDF(order: SaleOrder, settings: StoreSettings, format: 'a4' | 'thermal' = 'a4') {
  const curr = settings.currencySymbol || '৳';

  if (format === 'thermal') {
    // Calculate required height based on items to avoid overflow
    const estimatedHeight = Math.max(160, 95 + order.items.length * 10);
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, estimatedHeight],
    });

    let y = 6;

    // Header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(settings.storeName, 40, y, { align: 'center', maxWidth: 72 });
    y += 5;

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Created by: ${settings.ownerName}`, 40, y, { align: 'center' });
    y += 3.5;
    doc.text(settings.address, 40, y, { align: 'center', maxWidth: 68 });
    y += 4;
    doc.text(`Tel: ${settings.phone}`, 40, y, { align: 'center' });
    y += 4;

    doc.setLineDashPattern([1, 1], 0);
    doc.line(4, y, 76, y);
    doc.setLineDashPattern([], 0);
    y += 3.5;

    // Invoice meta
    doc.setFontSize(7.5);
    doc.text(`Invoice: ${order.invoiceNumber}`, 4, y);
    y += 3.5;
    doc.text(`Date: ${new Date(order.date).toLocaleDateString()} ${new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 4, y);
    y += 3.5;
    doc.text(`Cashier: ${order.cashierName}`, 4, y);
    y += 3.5;
    doc.text(`Customer: ${order.customerName}`, 4, y);
    if (order.customerPhone) {
      y += 3.5;
      doc.text(`Phone: ${order.customerPhone}`, 4, y);
    }
    y += 3.5;

    doc.setLineDashPattern([1, 1], 0);
    doc.line(4, y, 76, y);
    doc.setLineDashPattern([], 0);
    y += 2;

    // Items table
    const tableData = order.items.map((it) => [
      it.productName,
      `${it.quantity} x ${curr}${it.unitPrice.toFixed(0)}`,
      `${curr}${it.total.toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Item', 'Qty x Rate', 'Total']],
      body: tableData,
      theme: 'plain',
      styles: {
        fontSize: 7.5,
        cellPadding: { top: 1, bottom: 1, left: 1, right: 1 },
        overflow: 'linebreak',
        textColor: [0, 0, 0],
      },
      headStyles: { fontStyle: 'bold', textColor: [0, 0, 0] },
      columnStyles: {
        0: { cellWidth: 34 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 18, halign: 'right' },
      },
      margin: { left: 4, right: 4 },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || y + 25;
    y = finalY + 2;

    doc.setLineDashPattern([1, 1], 0);
    doc.line(4, y, 76, y);
    doc.setLineDashPattern([], 0);
    y += 3.5;

    // Totals
    doc.setFontSize(7.5);
    doc.text('Subtotal:', 4, y);
    doc.text(`${curr}${order.subTotal.toFixed(2)}`, 76, y, { align: 'right' });
    y += 3.5;

    if (order.discountAmount > 0) {
      doc.text(`Discount (${order.discountType === 'percentage' ? order.discountValue + '%' : 'Flat'}):`, 4, y);
      doc.text(`-${curr}${order.discountAmount.toFixed(2)}`, 76, y, { align: 'right' });
      y += 3.5;
    }

    if (order.taxAmount > 0) {
      doc.text(`VAT/Tax (${order.taxRate}%):`, 4, y);
      doc.text(`+${curr}${order.taxAmount.toFixed(2)}`, 76, y, { align: 'right' });
      y += 3.5;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('NET TOTAL:', 4, y);
    doc.text(`${curr}${order.totalAmount.toFixed(2)}`, 76, y, { align: 'right' });
    y += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`Paid Amount: ${curr}${order.amountPaid.toFixed(2)}`, 4, y);
    if (order.changeGiven > 0) {
      doc.text(`Change: ${curr}${order.changeGiven.toFixed(2)}`, 76, y, { align: 'right' });
    } else if (order.amountDue > 0) {
      doc.text(`Due: ${curr}${order.amountDue.toFixed(2)}`, 76, y, { align: 'right' });
    }
    y += 3.5;

    const paymentMethods = order.payments.map((p) => `${p.method.toUpperCase()} (${curr}${p.amount.toFixed(0)})`).join(', ');
    doc.text(`Method: ${paymentMethods}`, 4, y, { maxWidth: 72 });
    y += 4.5;

    // Footer note
    doc.setFontSize(6.8);
    doc.text(settings.invoiceFooterNote, 40, y, { align: 'center', maxWidth: 70 });
    y += 4.5;
    doc.setFontSize(6.5);
    doc.text('*** Thank You! Please Visit Again ***', 40, y, { align: 'center' });

    doc.save(`${order.invoiceNumber}.pdf`);
    return;
  }

  // Standard A4 Invoice
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Primary banner
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(0, 0, 210, 36, 'F');

  // Accent line
  doc.setFillColor(37, 99, 235); // Blue-600
  doc.rect(0, 36, 210, 2, 'F');

  // Header texts
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.storeName, 14, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Created by: ${settings.ownerName}`, 14, 23);
  doc.text(`${settings.address} | Tel: ${settings.phone}`, 14, 29);

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', 196, 18, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(order.invoiceNumber, 196, 26, { align: 'right' });

  // Reset text color for body
  doc.setTextColor(15, 23, 42);

  // Metadata boxes
  let y = 46;

  // Bill To Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 88, 26, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 88, 26, 2, 2, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('BILLED TO (CUSTOMER)', 18, y + 5);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(order.customerName, 18, y + 11);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Phone: ${order.customerPhone || 'N/A'}`, 18, y + 17);
  doc.text(`Status: ${order.status.toUpperCase()}`, 18, y + 22);

  // Invoice Details Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(108, y, 88, 26, 2, 2, 'F');
  doc.roundedRect(108, y, 88, 26, 2, 2, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('INVOICE INFORMATION', 112, y + 5);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Date: ${new Date(order.date).toLocaleString()}`, 112, y + 11);
  doc.text(`Served By: ${order.cashierName}`, 112, y + 17);
  const payLabels = order.payments.map((p) => p.method.toUpperCase()).join(' + ');
  doc.text(`Payment: ${payLabels}`, 112, y + 22);

  // Table of Items
  y = 78;

  const tableBody = order.items.map((item, index) => [
    index + 1,
    item.productName,
    item.sku,
    `${curr}${item.unitPrice.toFixed(2)}`,
    item.quantity,
    `${curr}${item.total.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [['#', 'Item Description', 'SKU', 'Unit Price', 'Qty', 'Total']],
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [15, 23, 42],
      overflow: 'linebreak',
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 78 },
      2: { cellWidth: 32 },
      3: { cellWidth: 26, halign: 'right' },
      4: { cellWidth: 16, halign: 'center' },
      5: { cellWidth: 26, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });

  const tableEndY = (doc as any).lastAutoTable?.finalY || 140;
  y = tableEndY + 8;

  // Notes on left side
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Terms & Notes:', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(settings.invoiceFooterNote, 14, y + 5, { maxWidth: 95 });

  // Calculation Breakdown on right side
  const rightBoxX = 120;
  let calcY = y;

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal:', rightBoxX, calcY);
  doc.text(`${curr}${order.subTotal.toFixed(2)}`, 196, calcY, { align: 'right' });
  calcY += 5.5;

  if (order.discountAmount > 0) {
    doc.text(`Discount (${order.discountType === 'percentage' ? order.discountValue + '%' : 'Flat'}):`, rightBoxX, calcY);
    doc.text(`-${curr}${order.discountAmount.toFixed(2)}`, 196, calcY, { align: 'right' });
    calcY += 5.5;
  }

  if (order.taxAmount > 0) {
    doc.text(`Sales Tax / VAT (${order.taxRate}%):`, rightBoxX, calcY);
    doc.text(`+${curr}${order.taxAmount.toFixed(2)}`, 196, calcY, { align: 'right' });
    calcY += 5.5;
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(rightBoxX, calcY, 196, calcY);
  calcY += 5.5;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Grand Total:', rightBoxX, calcY);
  doc.text(`${curr}${order.totalAmount.toFixed(2)}`, 196, calcY, { align: 'right' });
  calcY += 6.5;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Amount Paid:', rightBoxX, calcY);
  doc.text(`${curr}${order.amountPaid.toFixed(2)}`, 196, calcY, { align: 'right' });
  calcY += 5;

  if (order.changeGiven > 0) {
    doc.text('Change Returned:', rightBoxX, calcY);
    doc.text(`${curr}${order.changeGiven.toFixed(2)}`, 196, calcY, { align: 'right' });
  } else if (order.amountDue > 0) {
    doc.setTextColor(220, 38, 38);
    doc.text('Balance Due:', rightBoxX, calcY);
    doc.text(`${curr}${order.amountDue.toFixed(2)}`, 196, calcY, { align: 'right' });
  }

  // Bottom Signature & Watermark
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 268, 70, 268);
  doc.line(140, 268, 196, 268);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Customer Signature', 42, 273, { align: 'center' });
  doc.text('Authorized Signature', 168, 273, { align: 'center' });

  doc.setFontSize(7.5);
  doc.text(`ProPOS v4.2 — ${settings.storeName} — All Rights Reserved`, 105, 284, { align: 'center' });

  doc.save(`${order.invoiceNumber}.pdf`);
}

export function exportProfitLossToPDF(
  metrics: {
    grossSales: number;
    totalCOGS: number;
    grossProfit: number;
    grossMargin: number;
    totalExpenses: number;
    netProfit: number;
    netMargin: number;
    orderCount: number;
    periodLabel: string;
  },
  settings: StoreSettings
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const curr = settings.currencySymbol || '৳';

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 36, 'F');
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 36, 210, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`${settings.storeName} — Profit & Loss Statement`, 14, 16);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Created by: ${settings.ownerName} | Period: ${metrics.periodLabel}`, 14, 24);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

  let y = 48;

  // Key Summary 4-Box Grid
  const boxes = [
    { label: 'Gross Revenue', value: `${curr}${metrics.grossSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: [37, 99, 235] },
    { label: 'Cost of Goods (COGS)', value: `${curr}${metrics.totalCOGS.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: [220, 38, 38] },
    { label: 'Gross Profit', value: `${curr}${metrics.grossProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${metrics.grossMargin.toFixed(1)}%)`, color: [16, 185, 129] },
    {
      label: 'Net Profit',
      value: `${curr}${metrics.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${metrics.netMargin.toFixed(1)}%)`,
      color: metrics.netProfit >= 0 ? [16, 185, 129] : [220, 38, 38],
    },
  ];

  boxes.forEach((b, i) => {
    const bx = 14 + (i % 2) * 94;
    const by = y + Math.floor(i / 2) * 26;

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(bx, by, 88, 22, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(bx, by, 88, 22, 2, 2, 'S');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(b.label.toUpperCase(), bx + 4, by + 6);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(b.color[0], b.color[1], b.color[2]);
    doc.text(b.value, bx + 4, by + 16);
  });

  y += 58;

  // Breakdown Statement Table
  const tableData = [
    ['1. Gross Sales Revenue (Orders: ' + metrics.orderCount + ')', `${curr}${metrics.grossSales.toFixed(2)}`, '100.0%'],
    ['2. Less: Cost of Goods Sold (COGS)', `-${curr}${metrics.totalCOGS.toFixed(2)}`, `${metrics.grossSales > 0 ? ((metrics.totalCOGS / metrics.grossSales) * 100).toFixed(1) : 0}%`],
    ['3. GROSS PROFIT (Line 1 - Line 2)', `${curr}${metrics.grossProfit.toFixed(2)}`, `${metrics.grossMargin.toFixed(1)}%`],
    ['4. Less: Operating Expenses', `-${curr}${metrics.totalExpenses.toFixed(2)}`, `${metrics.grossSales > 0 ? ((metrics.totalExpenses / metrics.grossSales) * 100).toFixed(1) : 0}%`],
    ['5. NET PROFIT / (LOSS) (Line 3 - Line 4)', `${curr}${metrics.netProfit.toFixed(2)}`, `${metrics.netMargin.toFixed(1)}%`],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Financial Statement Metric', 'Amount', 'Margin %']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [15, 23, 42],
    },
    columnStyles: {
      0: { cellWidth: 110 },
      1: { cellWidth: 45, halign: 'right', fontStyle: 'bold' },
      2: { cellWidth: 25, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated by ProPOS — ${settings.storeName}`, 105, 280, { align: 'center' });

  doc.save(`Profit_Loss_Report_${metrics.periodLabel.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}
