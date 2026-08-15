import React, { useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, DollarSign, Receipt, Percent } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { sales, settings, categories, products } = usePOS();
  const curr = settings.currencySymbol || '৳';

  const {
    todayRevenue,
    weeklyRevenue,
    monthlyProfit,
    totalRevenue,
    revenueChartData,
    categoryChartData,
  } = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(todayStart.getDate() - 6); // Last 7 days
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const completedSales = sales.filter((s) => s.status === 'completed');
    
    // Aggregates
    const todayOrders = completedSales.filter((s) => new Date(s.date) >= todayStart);
    const weeklyOrders = completedSales.filter((s) => new Date(s.date) >= weekStart);
    const monthOrders = completedSales.filter((s) => new Date(s.date) >= monthStart);

    const tRev = todayOrders.reduce((sum, s) => sum + s.totalAmount, 0);
    const wRev = weeklyOrders.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalRev = completedSales.reduce((sum, s) => sum + s.totalAmount, 0);

    const mRev = monthOrders.reduce((sum, s) => sum + s.totalAmount, 0);
    const mCOGS = monthOrders.reduce((sum, s) => sum + s.costOfGoodsSold, 0);
    const mProfit = Math.max(0, mRev - mCOGS);

    // Last 7 days revenue chart data
    const chartMap = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(todayStart);
      d.setDate(d.getDate() - (6 - i));
      chartMap.set(d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), 0);
    }

    weeklyOrders.forEach(order => {
      const d = new Date(order.date);
      const key = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      if (chartMap.has(key)) {
        chartMap.set(key, chartMap.get(key)! + order.totalAmount);
      }
    });

    const revChart = Array.from(chartMap.entries()).map(([date, revenue]) => ({
      date,
      revenue
    }));

    // Sales by Category Chart Data
    const catSalesMap = new Map<string, number>();
    categories.forEach(c => catSalesMap.set(c.id, 0));

    completedSales.forEach(order => {
      order.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        if (prod && catSalesMap.has(prod.categoryId)) {
          catSalesMap.set(prod.categoryId, catSalesMap.get(prod.categoryId)! + (item.unitPrice * item.quantity));
        }
      });
    });

    const catChart = Array.from(catSalesMap.entries())
      .map(([catId, sales]) => {
        const cat = categories.find(c => c.id === catId);
        return {
          name: cat ? cat.name : 'Unknown',
          sales
        };
      })
      .filter(c => c.sales > 0)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5); // Top 5 categories

    return {
      todayRevenue: tRev,
      weeklyRevenue: wRev,
      monthlyProfit: mProfit,
      totalRevenue: totalRev,
      revenueChartData: revChart,
      categoryChartData: catChart,
    };
  }, [sales, categories, products]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-950/50">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Business Dashboard
          </h2>
          <p className="text-slate-500 text-sm mt-1">Overview of your store's performance and analytics.</p>
        </div>

        {/* Top KPI Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Today's Revenue */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Revenue</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {curr}{todayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </div>

          {/* Weekly Revenue */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">7-Day Revenue</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {curr}{weeklyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </div>

          {/* Monthly Profit */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Monthly Profit</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {curr}{monthlyProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </div>

          {/* Total Lifetime Revenue */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lifetime Sales</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {curr}{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend Line Chart */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">7-Day Revenue Trend</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickFormatter={(value) => `${curr}${value}`}
                    width={80}
                  />
                  <Tooltip 
                    cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`${curr}${value.toFixed(2)}`, 'Revenue']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#2563eb" 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
                    activeDot={{ r: 6, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Categories Bar Chart */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Sales by Category (Top 5)</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickFormatter={(value) => `${curr}${value}`}
                    width={80}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`${curr}${value.toFixed(2)}`, 'Sales']}
                  />
                  <Bar 
                    dataKey="sales" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
