import { SaleOrder, StoreSettings } from '../types/pos';

/**
 * Direct printing helper using an isolated hidden iframe.
 * Ensures the printed output is not clipped or impacted by parent styles/resolutions.
 */
export function printReceipt(order: SaleOrder, settings: StoreSettings, format: 'thermal' | 'a4' = 'thermal') {
  const curr = settings.currencySymbol || '৳';
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  const itemsHtml = order.items
    .map(
      (it) => `
      <tr style="border-bottom: 1px dashed #cbd5e1;">
        <td style="padding: 4px 0; font-weight: 600;">${it.productName}</td>
        <td style="padding: 4px 0; text-align: center;">${it.quantity}</td>
        <td style="padding: 4px 0; text-align: right;">${curr}${it.unitPrice.toFixed(2)}</td>
        <td style="padding: 4px 0; text-align: right; font-weight: bold;">${curr}${it.total.toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  const paymentModes = order.payments
    .map((p) => `${p.method.toUpperCase()} (${curr}${p.amount.toFixed(2)})`)
    .join(', ');

  let htmlContent = '';

  if (format === 'thermal') {
    htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${order.invoiceNumber}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 3mm;
          }
          body {
            font-family: 'Courier New', Courier, monospace, sans-serif;
            width: 74mm;
            margin: 0 auto;
            color: #000;
            background: #fff;
            font-size: 11px;
            line-height: 1.3;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 6px 0; }
          .double-divider { border-top: 2px solid #000; margin: 6px 0; }
          table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
          .flex { display: flex; justify-content: space-between; }
          .header-title { font-size: 15px; font-weight: bold; margin-bottom: 2px; }
        </style>
      </head>
      <body>
        <div class="text-center">
          <div class="header-title">${settings.storeName}</div>
          <div>Created by: ${settings.ownerName}</div>
          <div>${settings.address}</div>
          <div>Tel: ${settings.phone}</div>
        </div>

        <div class="divider"></div>

        <div class="flex"><span>Invoice:</span><span class="font-bold">${order.invoiceNumber}</span></div>
        <div class="flex"><span>Date:</span><span>${new Date(order.date).toLocaleDateString()} ${new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
        <div class="flex"><span>Cashier:</span><span>${order.cashierName}</span></div>
        <div class="flex"><span>Customer:</span><span>${order.customerName}</span></div>
        ${order.customerPhone ? `<div class="flex"><span>Phone:</span><span>${order.customerPhone}</span></div>` : ''}

        <div class="divider"></div>

        <table>
          <thead>
            <tr style="border-bottom: 1px solid #000;">
              <th style="text-align: left; padding-bottom: 4px;">Item</th>
              <th style="text-align: center; padding-bottom: 4px;">Qty</th>
              <th style="text-align: right; padding-bottom: 4px;">Rate</th>
              <th style="text-align: right; padding-bottom: 4px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="divider"></div>

        <div class="flex"><span>Subtotal:</span><span>${curr}${order.subTotal.toFixed(2)}</span></div>
        ${order.discountAmount > 0 ? `<div class="flex"><span>Discount (${order.discountType === 'percentage' ? `${order.discountValue}%` : 'Flat'}):</span><span>-${curr}${order.discountAmount.toFixed(2)}</span></div>` : ''}
        ${order.taxAmount > 0 ? `<div class="flex"><span>VAT/Tax (${order.taxRate}%):</span><span>+${curr}${order.taxAmount.toFixed(2)}</span></div>` : ''}
        
        <div class="double-divider"></div>
        
        <div class="flex font-bold" style="font-size: 13px;">
          <span>NET TOTAL:</span>
          <span>${curr}${order.totalAmount.toFixed(2)}</span>
        </div>
        
        <div class="divider"></div>
        
        <div class="flex"><span>Paid Amount:</span><span>${curr}${order.amountPaid.toFixed(2)}</span></div>
        ${order.changeGiven > 0 ? `<div class="flex"><span>Change:</span><span>${curr}${order.changeGiven.toFixed(2)}</span></div>` : ''}
        ${order.amountDue > 0 ? `<div class="flex font-bold" style="color: #000;"><span>Due Balance:</span><span>${curr}${order.amountDue.toFixed(2)}</span></div>` : ''}
        <div style="font-size: 9.5px; margin-top: 3px;">Method: ${paymentModes}</div>

        <div class="divider"></div>

        <div class="text-center" style="font-size: 9.5px; margin-top: 6px;">
          <div>${settings.invoiceFooterNote}</div>
          <div style="margin-top: 4px; font-weight: bold;">*** Thank You! Visit Again ***</div>
        </div>
      </body>
      </html>
    `;
  } else {
    // Standard A4 Format
    htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tax Invoice - ${order.invoiceNumber}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            background: #fff;
            font-size: 12px;
            line-height: 1.5;
            margin: 0;
            padding: 10px;
          }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px; }
          .store-name { font-size: 22px; font-weight: 800; color: #1e293b; }
          .invoice-tag { background: #0f172a; color: #fff; padding: 4px 12px; font-size: 14px; font-weight: bold; border-radius: 4px; display: inline-block; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          th { background: #0f172a; color: #fff; padding: 8px 10px; font-size: 11px; text-transform: uppercase; }
          td { padding: 8px 10px; }
          .totals-table { width: 280px; margin-left: auto; border-collapse: collapse; }
          .totals-table td { padding: 4px 8px; }
          .grand-total { font-size: 15px; font-weight: bold; border-top: 2px solid #0f172a; color: #2563eb; }
          .footer { margin-top: 30px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="store-name">${settings.storeName}</div>
            <div style="font-weight: 600; color: #2563eb;">Created by: ${settings.ownerName}</div>
            <div>${settings.address}</div>
            <div>Phone: ${settings.phone} | Email: ${settings.email}</div>
          </div>
          <div style="text-align: right;">
            <div class="invoice-tag">TAX INVOICE</div>
            <div style="font-size: 14px; font-weight: bold; margin-top: 6px;">${order.invoiceNumber}</div>
            <div style="color: #64748b;">Date: ${new Date(order.date).toLocaleString()}</div>
          </div>
        </div>

        <div class="meta-grid">
          <div>
            <strong style="text-transform: uppercase; font-size: 10px; color: #64748b;">Customer Information</strong>
            <div style="font-size: 13px; font-weight: bold; margin-top: 4px;">${order.customerName}</div>
            <div>Phone: ${order.customerPhone || 'N/A'}</div>
            <div>Status: <span style="font-weight: bold; color: #16a34a; text-transform: uppercase;">${order.status}</span></div>
          </div>
          <div>
            <strong style="text-transform: uppercase; font-size: 10px; color: #64748b;">Order & Staff Details</strong>
            <div style="margin-top: 4px;">Served By: <strong>${order.cashierName}</strong></div>
            <div>Payment: <strong>${paymentModes}</strong></div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="text-align: left;">Product Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <table class="totals-table">
          <tr>
            <td>Subtotal:</td>
            <td style="text-align: right; font-weight: 600;">${curr}${order.subTotal.toFixed(2)}</td>
          </tr>
          ${
            order.discountAmount > 0
              ? `<tr>
                  <td>Discount (${order.discountType === 'percentage' ? `${order.discountValue}%` : 'Flat'}):</td>
                  <td style="text-align: right; color: #16a34a; font-weight: 600;">-${curr}${order.discountAmount.toFixed(2)}</td>
                </tr>`
              : ''
          }
          ${
            order.taxAmount > 0
              ? `<tr>
                  <td>Sales Tax / VAT (${order.taxRate}%):</td>
                  <td style="text-align: right; font-weight: 600;">+${curr}${order.taxAmount.toFixed(2)}</td>
                </tr>`
              : ''
          }
          <tr class="grand-total">
            <td>Grand Total:</td>
            <td style="text-align: right;">${curr}${order.totalAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Amount Paid:</td>
            <td style="text-align: right;">${curr}${order.amountPaid.toFixed(2)}</td>
          </tr>
          ${
            order.changeGiven > 0
              ? `<tr>
                  <td>Change Returned:</td>
                  <td style="text-align: right; color: #2563eb;">${curr}${order.changeGiven.toFixed(2)}</td>
                </tr>`
              : ''
          }
          ${
            order.amountDue > 0
              ? `<tr>
                  <td style="font-weight: bold; color: #dc2626;">Balance Due:</td>
                  <td style="text-align: right; font-weight: bold; color: #dc2626;">${curr}${order.amountDue.toFixed(2)}</td>
                </tr>`
              : ''
          }
        </table>

        <div class="footer">
          <p>${settings.invoiceFooterNote}</p>
          <p style="font-weight: bold; color: #0f172a;">Thank you for your business!</p>
        </div>
      </body>
      </html>
    `;
  }

  doc.open();
  doc.write(htmlContent);
  doc.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    try {
      iframe.contentWindow?.print();
    } catch (e) {
      console.error('Print failed', e);
    }
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 300);
}
