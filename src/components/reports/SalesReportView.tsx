import React, { useMemo, useState } from 'react';
import {
  FileText,
  Search,
  Calendar,
  Filter,
  Download,
  Printer,
  RotateCcw,
  Eye,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Percent,
  X,
  CreditCard,
  Trash2,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { SaleOrder } from '../../types/pos';
import { InvoiceReceiptModal } from '../billing/InvoiceReceiptModal';

export const SalesReportView: React.FC = () => {
  const { sales, refundOrder, deleteSale, settings, currentUser } = usePOS();
  const curr = settings.currencySymbol || '৳';

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected Order for viewing receipt/reprinting
  const [selectedOrder, setSelectedOrder] = useState<SaleOrder | null>(null);

  const handleRefundClick = (order: SaleOrder) => {
    if (window.confirm(`Are you sure you want to refund invoice ${order.invoiceNumber}? This will restore product quantities to stock.`)) {
      refundOrder(order.id);
    }
  };

  // Filtered Sales Logic
  const filteredSales = useMemo(() => {
    const now = new Date();

    return sales.filter((order) => {
      const orderDate = new Date(order.date);

      // Date range filtering
      let matchesDate = true;
      if (dateRange === 'today') {
        matchesDate = orderDate.toDateString() === now.toDateString();
      } else if (dateRange === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        matchesDate = orderDate >= oneWeekAgo;
      } else if (dateRange === 'month') {
        matchesDate =
          orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      } else if (dateRange === 'year') {
        matchesDate = orderDate.getFullYear() === now.getFullYear();
      }

      // Payment method filter
      const matchesPayment = paymentFilter === 'all' || order.payments.some(p => p.method === paymentFilter);

      // Status filter
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      // Search query
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        order.invoiceNumber.toLowerCase().includes(q) ||
        (order.customerName && order.customerName.toLowerCase().includes(q)) ||
        order.cashierName.toLowerCase().includes(q);

      return matchesDate && matchesPayment && matchesStatus && matchesQuery;
    });
  }, [sales, dateRange, paymentFilter, statusFilter, searchQuery]);

  // Aggregate Metrics for current filtered view
  const completedSales = filteredSales.filter((s) => s.status === 'completed');
  const totalRevenue = completedSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalProfit = completedSales.reduce((sum, s) => sum + s.grossProfit, 0);
  const totalDiscountGiven = completedSales.reduce((sum, s) => sum + s.discountAmount, 0);
  const averageOrderValue = completedSales.length > 0 ? totalRevenue / completedSales.length : 0;

  const handleExportCSV = () => {
    const headers = [
      'Invoice Number',
      'Date & Time',
      'Customer',
      'Cashier',
      'Items Count',
      'Subtotal',
      'Discount',
      'Tax',
      'Total Amount',
      'Profit (Gross)',
      'Payment Method',
      'Status',
    ];

    const rows = filteredSales.map((s) => {
      const itemsCount = s.items.reduce((sum, it) => sum + it.quantity, 0);
      return [
        s.invoiceNumber,
        `"${new Date(s.date).toLocaleString()}"`,
        `"${s.customerName || 'Walk-in'}"`,
        `"${s.cashierName}"`,
        itemsCount,
        s.subtotal.toFixed(2),
        s.discountAmount.toFixed(2),
        s.taxAmount.toFixed(2),
        s.totalAmount.toFixed(2),
        s.grossProfit.toFixed(2),
        s.payments.map(p => p.method).join(' + ').toUpperCase(),
        s.status.toUpperCase(),
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sales_Ledger_${dateRange}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="sales-report-page" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-sky-500" />
            <span>Sales History & Invoices Register</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Audit customer transactions, reprint thermal/A4 invoices, issue refunds & track register revenue
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Sales CSV</span>
        </button>
      </div>

      {/* Metrics Header Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Filtered Revenue</p>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-1">
            {curr}{totalRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{completedSales.length} successful invoices</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Net Gross Margin / Profit
          </p>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            {curr}{totalProfit.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}% average profit margin
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Average Order Value (AOV)</p>
          <p className="text-xl sm:text-2xl font-extrabold text-sky-600 dark:text-sky-400 font-mono mt-1">
            {curr}{averageOrderValue.toFixed(0)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Per receipt basket average</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Discounts Conceded</p>
          <p className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-1">
            {curr}{totalDiscountGiven.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Campaign & manual discounts</p>
        </div>
      </div>

      {/* Filter and Date Period Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Invoice #, Customer, Staff..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Date Period Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            {(['today', 'week', 'month', 'year', 'all'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setDateRange(period)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                  dateRange === period
                    ? 'bg-white dark:bg-slate-700 font-bold text-sky-600 dark:text-sky-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Payment Method Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
          >
            <option value="all">All Payment Methods</option>
            <option value="cash">Cash</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="card">Card / POS</option>
            <option value="due">Credit / Due</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Cashier</th>
                <th className="py-3 px-4 text-center">Payment</th>
                <th className="py-3 px-4 text-right">Items</th>
                <th className="py-3 px-4 text-right">Gross Total</th>
                <th className="py-3 px-4 text-right">Profit</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400">
                    No sales records found matching the current filters
                  </td>
                </tr>
              ) : (
                filteredSales.map((order) => {
                  const itemsCount = order.items.reduce((sum, it) => sum + it.quantity, 0);
                  const isRefunded = order.status === 'refunded';

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-850/60 transition-colors ${
                        isRefunded ? 'opacity-60 bg-rose-50/20 dark:bg-rose-950/10' : ''
                      }`}
                    >
                      {/* Invoice # */}
                      <td className="py-3 px-4 font-mono font-bold text-sky-600 dark:text-sky-400">
                        {order.invoiceNumber}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        <div>{new Date(order.date).toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                        {order.customerName || <span className="text-slate-400">Walk-in</span>}
                      </td>

                      {/* Cashier */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {order.cashierName}
                      </td>

                      {/* Payment */}
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {order.payments[0]?.method || 'N/A'}
                        </span>
                      </td>

                      {/* Items */}
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        {itemsCount}
                      </td>

                      {/* Gross Total */}
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900 dark:text-white">
                        {curr}{order.totalAmount.toFixed(2)}
                      </td>

                      {/* Profit */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {curr}{order.grossProfit.toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {isRefunded ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                            Refunded
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            Paid
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-700 dark:text-slate-300 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                            title="View / Print Receipt"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Invoice</span>
                          </button>

                          <button
                            onClick={() => handleRefundClick(order)}
                            disabled={isRefunded}
                            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-amber-500 hover:border-amber-200 dark:hover:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                            title="Refund Sale"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to permanently delete this sale record?')) {
                                deleteSale(order.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all shadow-2xs"
                            title="Delete Sale"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Receipt Modal */}
      {selectedOrder && (
        <InvoiceReceiptModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};
