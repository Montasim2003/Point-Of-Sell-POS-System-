import React, { useMemo, useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  Award,
  DollarSign,
  ShoppingBag,
  CreditCard,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Customer } from '../../types/pos';
import { AddCustomerModal } from './AddCustomerModal';

export const CustomersView: React.FC = () => {
  const { customers, settings, updateCustomer, payCustomerDue, deleteCustomer, sales } = usePOS();
  const curr = settings.currencySymbol || '৳';

  const [searchQuery, setSearchQuery] = useState('');
  const [dueFilter, setDueFilter] = useState<'all' | 'with_due' | 'clear'>('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedHistoryCust, setSelectedHistoryCust] = useState<Customer | null>(null);
  const [payDueModalCust, setPayDueModalCust] = useState<Customer | null>(null);
  const [duePaymentAmount, setDuePaymentAmount] = useState<string>('');

  // Metrics
  const totalReceivablesDue = customers.reduce((sum, c) => sum + c.dueBalance, 0);
  const totalCustomersCount = customers.length;
  const customersWithDueCount = customers.filter((c) => c.dueBalance > 0).length;
  const totalLoyaltyPoints = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0);

  // Filtered List
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q));

      let matchesDue = true;
      if (dueFilter === 'with_due') {
        matchesDue = c.dueBalance > 0;
      } else if (dueFilter === 'clear') {
        matchesDue = c.dueBalance <= 0;
      }

      return matchesSearch && matchesDue;
    });
  }, [customers, searchQuery, dueFilter]);

  const handlePayDueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payDueModalCust) return;
    const amt = parseFloat(duePaymentAmount) || 0;
    if (amt <= 0) return;

    payCustomerDue(payDueModalCust.id, amt);
    setPayDueModalCust(null);
    setDuePaymentAmount('');
  };

  return (
    <div id="customers-crm-page" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-sky-500" />
            <span>Customer Directory & Credit Ledger</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track customer profiles, purchase history, loyalty rewards, and outstanding due credit balances
          </p>
        </div>

        <button
          id="add-customer-btn-main"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-600/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Registered Customers</p>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-1">
            {totalCustomersCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">CRM database profiles</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Outstanding Receivables (Due)
          </p>
          <p className="text-xl sm:text-2xl font-extrabold text-rose-600 dark:text-rose-400 font-mono mt-1">
            {curr}{totalReceivablesDue.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{customersWithDueCount} customers have pending balance</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Clear / Settled Customers</p>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            {totalCustomersCount - customersWithDueCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Zero outstanding credit</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            Total Loyalty Points
          </p>
          <p className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-1">
            {totalLoyaltyPoints.toLocaleString()} pts
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Reward program balance</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Customer Name, Phone, Email..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
          />
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <button
            onClick={() => setDueFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              dueFilter === 'all' ? 'bg-white dark:bg-slate-700 font-bold text-sky-600 dark:text-sky-400 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            All Customers ({customers.length})
          </button>
          <button
            onClick={() => setDueFilter('with_due')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              dueFilter === 'with_due' ? 'bg-white dark:bg-slate-700 font-bold text-rose-600 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            With Due Credit ({customersWithDueCount})
          </button>
          <button
            onClick={() => setDueFilter('clear')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              dueFilter === 'clear' ? 'bg-white dark:bg-slate-700 font-bold text-emerald-600 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Settled ({totalCustomersCount - customersWithDueCount})
          </button>
        </div>
      </div>

      {/* Customer List Grid / Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4">Customer Name & Contact</th>
                <th className="py-3 px-4">Address / Area</th>
                <th className="py-3 px-4 text-center">Total Orders</th>
                <th className="py-3 px-4 text-right">Lifetime Spent</th>
                <th className="py-3 px-4 text-center">Loyalty Points</th>
                <th className="py-3 px-4 text-right">Outstanding Due</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No customers found matching filter
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const hasDue = c.dueBalance > 0;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{c.name}</div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {c.phone}
                          </span>
                          {c.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {c.email}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {c.address || 'N/A'}
                      </td>

                      <td className="py-3 px-4 text-center font-bold font-mono">
                        {c.totalOrders} orders
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {curr}{c.totalSpent.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold text-[11px]">
                          {c.loyaltyPoints} pts
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {hasDue ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="font-bold font-mono text-rose-600 dark:text-rose-400 text-sm">
                              {curr}{c.dueBalance.toFixed(2)}
                            </span>
                            <button
                              onClick={() => {
                                setPayDueModalCust(c);
                                setDuePaymentAmount(c.dueBalance.toString());
                              }}
                              className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] shadow-xs"
                            >
                              Collect Due
                            </button>
                          </div>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-end gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Settled
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedHistoryCust(c)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors"
                            title="View Invoices History"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingCustomer(c)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors"
                            title="Edit Customer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to permanently delete customer: ${c.name}?`)) {
                                deleteCustomer(c.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Delete Customer"
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

      {/* Collect Due Modal */}
      {payDueModalCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Collect Due Balance
              </h3>
              <button onClick={() => setPayDueModalCust(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200">
              <p>Customer: <strong>{payDueModalCust.name}</strong></p>
              <p className="mt-1">Current Pending Due: <strong className="font-mono text-sm">{curr}{payDueModalCust.dueBalance.toFixed(2)}</strong></p>
            </div>

            <form onSubmit={handlePayDueSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Received Amount ({curr}) *
                </label>
                <input
                  type="number"
                  step="any"
                  max={payDueModalCust.dueBalance}
                  required
                  value={duePaymentAmount}
                  onChange={(e) => setDuePaymentAmount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-lg font-mono focus:ring-2 focus:ring-sky-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayDueModalCust(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Purchase History Drawer */}
      {selectedHistoryCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">{selectedHistoryCust.name}</h3>
                <p className="text-xs text-slate-400">Purchase & Invoice History</p>
              </div>
              <button onClick={() => setSelectedHistoryCust(null)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {sales.filter((s) => s.customerId === selectedHistoryCust.id).length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-semibold">No recorded invoices for this customer yet</p>
                </div>
              ) : (
                sales
                  .filter((s) => s.customerId === selectedHistoryCust.id)
                  .map((order) => (
                    <div
                      key={order.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-mono font-bold text-slate-900 dark:text-white">{order.invoiceNumber}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{new Date(order.date).toLocaleString()}</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {order.items.map((it) => `${it.productName} (x${it.quantity})`).join(', ')}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-mono font-bold text-sm text-sky-600 dark:text-sky-400">
                          {curr}{order.totalAmount.toFixed(2)}
                        </p>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 text-right">
              <button
                onClick={() => setSelectedHistoryCust(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && <AddCustomerModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
};
