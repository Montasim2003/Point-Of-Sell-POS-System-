import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Download,
  FileSpreadsheet,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Sparkles,
  ShoppingBag,
  Receipt,
  Plus,
  Percent,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { exportProfitLossToPDF } from '../../utils/pdfGenerator';
import { AddExpenseModal } from '../expenses/AddExpenseModal';

export const ProfitLossView: React.FC = () => {
  const { sales, expenses, products, settings } = usePOS();
  const curr = settings.currencySymbol || '৳';

  // Period Selector: weekly, monthly, yearly, all
  const [period, setPeriod] = useState<'today' | 'weekly' | 'monthly' | 'yearly' | 'all'>('monthly');
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Compute Filtered Sales & Expenses based on Selected Period
  const { filteredSales, filteredExpenses, periodLabel, daysCount } = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let label = '';
    let days = 30;

    if (period === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      label = `Today (${now.toLocaleDateString()})`;
      days = 1;
    } else if (period === 'weekly') {
      startDate = new Date();
      startDate.setDate(now.getDate() - 7);
      label = 'Past 7 Days (Weekly)';
      days = 7;
    } else if (period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      label = `This Month (${now.toLocaleString('default', { month: 'long', year: 'numeric' })})`;
      days = 30;
    } else if (period === 'yearly') {
      startDate = new Date(now.getFullYear(), 0, 1);
      label = `This Year (${now.getFullYear()})`;
      days = 365;
    } else {
      startDate = new Date(2020, 0, 1);
      label = 'All Time History';
      days = 365;
    }

    const fSales = sales.filter((s) => s.status === 'completed' && new Date(s.date) >= startDate);
    const fExpenses = expenses.filter((e) => new Date(e.date) >= startDate);

    return { filteredSales: fSales, filteredExpenses: fExpenses, periodLabel: label, daysCount: days };
  }, [sales, expenses, period]);

  // Financial Calculations (Net Revenue excluding tax)
  const grossSales = filteredSales.reduce((sum, s) => sum + Math.max(0, s.subTotal - s.discountAmount), 0);
  const discountsGiven = filteredSales.reduce((sum, s) => sum + s.discountAmount, 0);
  const taxesCollected = filteredSales.reduce((sum, s) => sum + s.taxAmount, 0);

  // Cost of Goods Sold (COGS)
  const totalCOGS = filteredSales.reduce((sum, order) => sum + order.costOfGoodsSold, 0);

  // Gross Profit
  const grossProfit = filteredSales.reduce((sum, order) => sum + order.grossProfit, 0);
  const grossMargin = grossSales > 0 ? (grossProfit / grossSales) * 100 : 0;

  // Operating Expenses
  const totalOperatingExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Net Profit = Gross Profit - Operating Expenses
  const netProfit = grossProfit - totalOperatingExpenses;
  const netMargin = grossSales > 0 ? (netProfit / grossSales) * 100 : 0;

  // Average Daily Sales
  const avgDailySales = grossSales / Math.max(1, daysCount);

  // Top Most Profitable Products in this period
  const productProfitMap = useMemo(() => {
    const map: { [productId: string]: { name: string; sku: string; qty: number; revenue: number; profit: number } } = {};

    filteredSales.forEach((order) => {
      order.items.forEach((it) => {
        if (!map[it.productId]) {
          map[it.productId] = {
            name: it.productName,
            sku: it.sku,
            qty: 0,
            revenue: 0,
            profit: 0,
          };
        }
        const itemRev = it.unitPrice * it.quantity;
        const itemProf = (it.unitPrice - it.costPrice) * it.quantity;
        map[it.productId].qty += it.quantity;
        map[it.productId].revenue += itemRev;
        map[it.productId].profit += itemProf;
      });
    });

    return Object.values(map)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);
  }, [filteredSales]);

  // Expenses Category Breakdown
  const expenseByCategory = useMemo(() => {
    const map: { [cat: string]: number } = {};
    filteredExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalOperatingExpenses > 0 ? ((amount / totalOperatingExpenses) * 100).toFixed(1) : '0',
    }));
  }, [filteredExpenses, totalOperatingExpenses]);

  // Download PDF Report
  const handleDownloadPDF = () => {
    exportProfitLossToPDF(
      {
        grossSales,
        totalCOGS,
        grossProfit,
        grossMargin,
        totalExpenses: totalOperatingExpenses,
        netProfit,
        netMargin,
        orderCount: filteredSales.length,
        periodLabel,
      },
      settings
    );
  };

  return (
    <div id="profit-loss-analytics-page" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span>Profit & Loss Statement (P&L)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Accurate revenue, COGS, operating costs, gross margins & net income accounting analysis
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            {(
              [
                { id: 'today', label: 'Today' },
                { id: 'weekly', label: 'Weekly (7D)' },
                { id: 'monthly', label: 'Monthly' },
                { id: 'yearly', label: 'Yearly' },
                { id: 'all', label: 'All-Time' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setPeriod(t.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  period === t.id
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Official P&L PDF</span>
          </button>
        </div>
      </div>

      {/* Main Income & Profit KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Gross Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-2">
            {curr}{grossSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
            <span>{filteredSales.length} total orders in {periodLabel}</span>
          </div>
        </div>

        {/* 2. COGS (Cost of Goods Sold) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Cost of Goods (COGS)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-2">
            {curr}{totalCOGS.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
            <span>Inventory purchase cost of sold items</span>
          </div>
        </div>

        {/* 3. Gross Profit & Margin */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Gross Profit
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-2">
            {curr}{grossProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-bold">
            <Percent className="w-3 h-3" />
            <span>Gross Margin: {grossMargin.toFixed(1)}%</span>
          </div>
        </div>

        {/* 4. Net Profit (Bottom Line) */}
        <div
          className={`p-5 rounded-2xl border shadow-md relative overflow-hidden ${
            netProfit >= 0
              ? 'bg-gradient-to-br from-emerald-900/10 via-slate-900 to-slate-900 text-white border-emerald-500/30'
              : 'bg-gradient-to-br from-rose-900/10 via-slate-900 to-slate-900 text-white border-rose-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Net Profit (Bottom Line)
            </span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <p
            className={`text-2xl font-black font-mono mt-2 ${
              netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {curr}{netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-300 mt-1 font-semibold">
            <span>Net Margin: {netMargin.toFixed(1)}%</span>
            <span>Operating Exp: {curr}{totalOperatingExpenses.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Accounting Breakdown Statement Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6">
        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-sky-500" />
          <span>Income & Expense Breakdown Statement ({periodLabel})</span>
        </h3>

        <div className="space-y-3 font-mono text-xs sm:text-sm">
          {/* Revenue */}
          <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 font-semibold text-slate-900 dark:text-white">
            <span className="font-sans font-bold">1. Total Gross Sales Revenue (+)</span>
            <span>{curr}{grossSales.toFixed(2)}</span>
          </div>

          {/* COGS */}
          <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-amber-600 dark:text-amber-400">
            <span className="font-sans pl-4">Less: Cost of Goods Sold (COGS) (-)</span>
            <span>-{curr}{totalCOGS.toFixed(2)}</span>
          </div>

          {/* Gross Profit Subtotal */}
          <div className="flex justify-between py-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 px-3 rounded-xl font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30">
            <span className="font-sans">2. Gross Profit (Margin: {grossMargin.toFixed(1)}%)</span>
            <span>{curr}{grossProfit.toFixed(2)}</span>
          </div>

          {/* Operating Expenses */}
          <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-rose-600 dark:text-rose-400">
            <span className="font-sans pl-4">Less: Store Operating Expenses (-)</span>
            <span>-{curr}{totalOperatingExpenses.toFixed(2)}</span>
          </div>

          {/* Net Profit Final Row */}
          <div className="flex justify-between py-3.5 bg-slate-900 text-white px-4 rounded-xl font-black text-sm sm:text-base border border-slate-800 shadow-md">
            <span className="font-sans flex items-center gap-2">
              <span>3. Net Profit / Clean Earnings</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold">
                Net Margin: {netMargin.toFixed(1)}%
              </span>
            </span>
            <span className={netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {curr}{netProfit.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Top Profitable Products & Expense Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Profitable Products */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Top 5 Profitable Products</span>
            </h4>
            <span className="text-[11px] text-slate-400">Ranked by gross profit</span>
          </div>

          {productProfitMap.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No sales data recorded for this period
            </div>
          ) : (
            <div className="space-y-3">
              {productProfitMap.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{item.name}</p>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 pl-7">
                      Qty Sold: <strong className="text-slate-700 dark:text-slate-300 font-mono">{item.qty}</strong> | Revenue: {curr}{item.revenue.toFixed(0)}
                    </p>
                  </div>

                  <div className="text-right pl-3 shrink-0">
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      +{curr}{item.profit.toFixed(0)}
                    </span>
                    <p className="text-[10px] text-slate-400">Profit contribution</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Operating Expense Distribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-rose-500" />
                <span>Operating Expense Breakdown</span>
              </h4>
              <button
                onClick={() => setShowAddExpense(true)}
                className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-bold flex items-center gap-1 border border-rose-200 dark:border-rose-900/40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Expense</span>
              </button>
            </div>

            {expenseByCategory.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No operating expenses logged for this period
              </div>
            ) : (
              <div className="space-y-3">
                {expenseByCategory.map((exp, idx) => (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{exp.category}</span>
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                        {curr}{exp.amount.toLocaleString()} ({exp.percentage}%)
                      </span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full"
                        style={{ width: `${Math.min(100, parseFloat(exp.percentage))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Total Filtered Operating Costs:</span>
            <span className="font-mono font-extrabold text-rose-600 dark:text-rose-400">
              {curr}{totalOperatingExpenses.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && <AddExpenseModal onClose={() => setShowAddExpense(false)} />}
    </div>
  );
};
