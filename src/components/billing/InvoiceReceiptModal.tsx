import React, { useState } from 'react';
import {
  X,
  Printer,
  FileDown,
  CheckCircle,
  Receipt,
  FileText,
  CreditCard,
  Building,
  User,
  ShoppingBag,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { SaleOrder } from '../../types/pos';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { printReceipt } from '../../utils/printHelper';

interface InvoiceReceiptModalProps {
  order: SaleOrder | null;
  onClose: () => void;
}

export const InvoiceReceiptModal: React.FC<InvoiceReceiptModalProps> = ({ order, onClose }) => {
  const { settings } = usePOS();
  const [format, setFormat] = useState<'thermal' | 'a4'>(settings.receiptType || 'thermal');

  if (!order) return null;

  const curr = settings.currencySymbol || '৳';

  const handleDownloadPDF = () => {
    generateInvoicePDF(order, settings, format);
  };

  const handlePrint = () => {
    printReceipt(order, settings, format);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        id="invoice-receipt-modal"
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6"
      >
        {/* Modal Top Bar */}
        <div className="p-4 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Sale Completed Successfully!</h3>
              <p className="text-xs text-slate-300">Invoice: {order.invoiceNumber}</p>
            </div>
          </div>

          {/* Format selector */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setFormat('thermal')}
                className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                  format === 'thermal' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Thermal 80mm</span>
              </button>
              <button
                onClick={() => setFormat('a4')}
                className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                  format === 'a4' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Standard A4</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Preview Container */}
        <div className="p-6 max-h-[62vh] overflow-y-auto bg-slate-50 dark:bg-slate-950 flex justify-center">
          {format === 'thermal' ? (
            /* Thermal POS Receipt Layout (80mm) */
            <div
              id="printable-receipt"
              className="w-[320px] bg-white text-slate-900 p-5 rounded-2xl shadow-md border border-slate-200 font-mono text-xs leading-tight"
            >
              {/* Store Header */}
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <h2 className="font-bold text-base tracking-wide text-slate-950">{settings.storeName}</h2>
                <p className="text-[11px] text-slate-600 font-sans mt-0.5">Created by: {settings.ownerName}</p>
                <p className="text-[10px] text-slate-500 font-sans mt-0.5">{settings.address}</p>
                <p className="text-[10px] text-slate-600 font-sans">Tel: {settings.phone}</p>
              </div>

              {/* Order Meta */}
              <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px] space-y-0.5 font-sans">
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice No:</span>
                  <span className="font-bold text-slate-900 font-mono">{order.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span>{new Date(order.date).toLocaleDateString()} {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cashier:</span>
                  <span>{order.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-medium text-slate-900">{order.customerName}</span>
                </div>
                {order.customerPhone && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span>{order.customerPhone}</span>
                  </div>
                )}
              </div>

              {/* Line Items */}
              <div className="py-2.5 border-b border-dashed border-slate-300">
                <div className="flex justify-between font-bold text-[11px] pb-1.5 border-b border-slate-200">
                  <span>Item Description</span>
                  <span>Total</span>
                </div>
                <div className="space-y-1.5 pt-1.5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="text-[11px]">
                      <div className="font-semibold text-slate-900">{item.productName}</div>
                      <div className="flex justify-between text-slate-600 text-[10px]">
                        <span>
                          {item.quantity} x {curr}{item.unitPrice.toFixed(2)}
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {curr}{item.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculations */}
              <div className="py-2.5 space-y-1 text-[11px] font-sans border-b border-dashed border-slate-300">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">{curr}{order.subTotal.toFixed(2)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount ({order.discountType === 'percentage' ? `${order.discountValue}%` : 'Flat'}):</span>
                    <span className="font-mono">-{curr}{order.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {order.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>VAT/Tax ({order.taxRate}%):</span>
                    <span className="font-mono">+{curr}{order.taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-300 text-slate-900">
                  <span>NET TOTAL:</span>
                  <span className="font-mono">{curr}{order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-700 pt-1">
                  <span>Paid:</span>
                  <span className="font-mono">{curr}{order.amountPaid.toFixed(2)}</span>
                </div>
                {order.changeGiven > 0 && (
                  <div className="flex justify-between text-blue-700 font-semibold">
                    <span>Change Returned:</span>
                    <span className="font-mono">{curr}{order.changeGiven.toFixed(2)}</span>
                  </div>
                )}
                {order.amountDue > 0 && (
                  <div className="flex justify-between text-rose-700 font-semibold">
                    <span>Balance Due:</span>
                    <span className="font-mono">{curr}{order.amountDue.toFixed(2)}</span>
                  </div>
                )}
                <div className="text-[10px] text-slate-500 pt-1">
                  Method:{' '}
                  {order.payments.map((p) => `${p.method.toUpperCase()} (${curr}${p.amount.toFixed(0)})`).join(', ')}
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-3 space-y-1 text-[10px] text-slate-500 font-sans">
                <p>{settings.invoiceFooterNote}</p>
                <div className="flex items-center justify-center gap-1 pt-1 font-mono text-[9px] text-slate-400">
                  <span>*** Software by {settings.ownerName} ***</span>
                </div>
              </div>
            </div>
          ) : (
            /* Standard A4 Invoice Layout */
            <div
              id="printable-a4-invoice"
              className="w-full bg-white text-slate-900 p-8 rounded-2xl shadow-md border border-slate-200 font-sans text-xs leading-normal"
            >
              {/* Header */}
              <div className="flex justify-between items-start pb-6 border-b border-slate-200">
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{settings.storeName}</h1>
                  <p className="text-xs text-blue-600 font-medium mt-0.5">Created by: {settings.ownerName}</p>
                  <p className="text-xs text-slate-500 mt-1">{settings.address}</p>
                  <p className="text-xs text-slate-500">Phone: {settings.phone} | Email: {settings.email}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-sm tracking-wider rounded-lg">
                    TAX INVOICE
                  </span>
                  <p className="font-mono font-bold text-sm text-slate-900 mt-2">{order.invoiceNumber}</p>
                  <p className="text-xs text-slate-500">Date: {new Date(order.date).toLocaleString()}</p>
                </div>
              </div>

              {/* Bill to & Details */}
              <div className="grid grid-cols-2 gap-6 my-5 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Billed To (Customer):</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">{order.customerName}</p>
                  {order.customerPhone && <p className="text-slate-600">Phone: {order.customerPhone}</p>}
                  <p className="text-slate-600">Status: <span className="font-semibold capitalize text-emerald-700">{order.status}</span></p>
                </div>
                <div>
                  <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Payment & Cashier:</p>
                  <p className="text-slate-800 mt-1"><span className="font-semibold">Served By:</span> {order.cashierName}</p>
                  <p className="text-slate-800">
                    <span className="font-semibold">Payment Modes:</span>{' '}
                    {order.payments.map((p) => p.method.toUpperCase()).join(' + ')}
                  </p>
                </div>
              </div>

              {/* Item Table */}
              <table className="w-full text-left border-collapse my-4">
                <thead>
                  <tr className="bg-slate-900 text-white font-semibold text-xs">
                    <th className="py-2.5 px-3 rounded-l-lg">#</th>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right rounded-r-lg">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{item.productName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{item.sku}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{curr}{item.unitPrice.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{curr}{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Bottom calculations */}
              <div className="flex justify-between items-start pt-4 border-t border-slate-200">
                <div className="max-w-xs text-xs text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-700">Terms & Conditions:</p>
                  <p>{settings.invoiceFooterNote}</p>
                </div>

                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">{curr}{order.subTotal.toFixed(2)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount ({order.discountType === 'percentage' ? `${order.discountValue}%` : 'Flat'}):</span>
                      <span className="font-mono">-{curr}{order.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {order.taxAmount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>VAT / Tax ({order.taxRate}%):</span>
                      <span className="font-mono">+{curr}{order.taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base text-slate-900 pt-2 border-t border-slate-300">
                    <span>Grand Total:</span>
                    <span className="font-mono text-blue-600">{curr}{order.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 pt-1">
                    <span>Amount Paid:</span>
                    <span className="font-mono">{curr}{order.amountPaid.toFixed(2)}</span>
                  </div>
                  {order.changeGiven > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Change:</span>
                      <span className="font-mono">{curr}{order.changeGiven.toFixed(2)}</span>
                    </div>
                  )}
                  {order.amountDue > 0 && (
                    <div className="flex justify-between text-rose-700 font-semibold">
                      <span>Due Amount:</span>
                      <span className="font-mono">{curr}{order.amountDue.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              id="download-invoice-pdf-btn"
              onClick={handleDownloadPDF}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-colors cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Download PDF Invoice</span>
            </button>
            <button
              id="print-invoice-btn"
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>
          </div>

          <button
            id="start-new-sale-btn"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold tracking-wide shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Start New Sale</span>
          </button>
        </div>
      </div>
    </div>
  );
};
