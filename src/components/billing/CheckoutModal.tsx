import React, { useEffect, useState } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  User,
  Plus,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { PaymentMethodDetail } from '../../types/pos';

interface CheckoutModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose, onSuccess }) => {
  const {
    cartTotal,
    cartSubtotal,
    cartDiscountAmount,
    cartTaxAmount,
    selectedCustomer,
    orderNote,
    processCheckout,
    settings,
  } = usePOS();

  const curr = settings.currencySymbol || '৳';

  // Active primary payment method
  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'card' | 'bkash' | 'nagad' | 'rocket' | 'bank_transfer' | 'due'>('cash');
  const [tenderedAmount, setTenderedAmount] = useState<string>(Math.ceil(cartTotal).toString());
  const [referenceId, setReferenceId] = useState<string>('');
  const [checkoutNote, setCheckoutNote] = useState<string>(orderNote);

  const numTendered = parseFloat(tenderedAmount) || 0;
  const changeAmount = Math.max(0, numTendered - cartTotal);
  const dueAmount = Math.max(0, cartTotal - numTendered);

  // Keyboard shortcut Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleQuickAmount = (val: number) => {
    setTenderedAmount(val.toString());
  };

  const handleAddAmount = (val: number) => {
    const currVal = parseFloat(tenderedAmount) || 0;
    setTenderedAmount((currVal + val).toString());
  };

  const handleCompleteSale = () => {
    const paymentAmount = selectedMethod === 'due' ? 0 : Math.min(numTendered, cartTotal);
    const payments: PaymentMethodDetail[] = [
      {
        method: selectedMethod,
        amount: selectedMethod === 'cash' ? numTendered : Math.min(numTendered, cartTotal),
        reference: referenceId || undefined,
      },
    ];

    processCheckout({
      payments,
      amountPaid: paymentAmount,
      changeGiven: selectedMethod === 'cash' ? changeAmount : 0,
      note: checkoutNote,
    });

    onSuccess();
  };

  const paymentMethodsList = [
    { id: 'cash', label: 'Cash Payment', icon: Banknote, color: 'hover:border-emerald-500 hover:text-emerald-600' },
    { id: 'bkash', label: 'bKash Mobile', icon: Smartphone, color: 'hover:border-pink-500 hover:text-pink-600' },
    { id: 'nagad', label: 'Nagad Mobile', icon: Smartphone, color: 'hover:border-orange-500 hover:text-orange-600' },
    { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, color: 'hover:border-blue-500 hover:text-blue-600' },
    { id: 'rocket', label: 'Rocket (DBBL)', icon: Smartphone, color: 'hover:border-purple-500 hover:text-purple-600' },
    { id: 'due', label: 'Store Credit / Due', icon: User, color: 'hover:border-amber-500 hover:text-amber-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        id="checkout-modal-container"
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6"
      >
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Complete Payment</h3>
              <p className="text-xs text-slate-300">
                Customer: <span className="font-semibold text-white">{selectedCustomer?.name || 'Walk-in Customer'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Amount Due Big Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white border border-slate-800 flex items-center justify-between shadow-md">
            <div>
              <p className="text-xs text-slate-400 font-medium">TOTAL PAYABLE AMOUNT</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
                {curr}{cartTotal.toFixed(2)}
              </h2>
            </div>
            <div className="text-right text-xs text-slate-300 space-y-0.5">
              <p>Subtotal: <span className="font-mono text-white">{curr}{cartSubtotal.toFixed(2)}</span></p>
              {cartDiscountAmount > 0 && (
                <p className="text-emerald-400">Discount: <span className="font-mono">-{curr}{cartDiscountAmount.toFixed(2)}</span></p>
              )}
              {cartTaxAmount > 0 && (
                <p className="text-sky-300">VAT/Tax: <span className="font-mono">+{curr}{cartTaxAmount.toFixed(2)}</span></p>
              )}
            </div>
          </div>

          {/* Payment Method Selector Grid */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {paymentMethodsList.map((m) => {
                const Icon = m.icon;
                const isSelected = selectedMethod === m.id;
                return (
                  <button
                    key={m.id}
                    id={`pay-method-${m.id}`}
                    type="button"
                    onClick={() => {
                      setSelectedMethod(m.id as any);
                      if (m.id === 'due') {
                        setTenderedAmount('0');
                      } else if (tenderedAmount === '0') {
                        setTenderedAmount(Math.ceil(cartTotal).toString());
                      }
                    }}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 ring-2 ring-sky-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-sky-500' : 'text-slate-400'}`} />
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />}
                    </div>
                    <span className="text-xs font-semibold">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tendered Cash / Received Input */}
          {selectedMethod !== 'due' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Amount Received / Tendered ({curr})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">
                    {curr}
                  </span>
                  <input
                    id="tendered-amount-input"
                    type="number"
                    min="0"
                    step="any"
                    value={tenderedAmount}
                    onChange={(e) => setTenderedAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 shadow-2xs font-mono"
                    placeholder="0.00"
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick Cash Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickAmount(Math.ceil(cartTotal))}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700"
                >
                  Exact ({curr}{Math.ceil(cartTotal)})
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAmount(Math.ceil(cartTotal / 100) * 100)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700"
                >
                  Round Up
                </button>
                {[50, 100, 500, 1000].map((addVal) => (
                  <button
                    key={addVal}
                    type="button"
                    onClick={() => handleAddAmount(addVal)}
                    className="px-2.5 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 text-sky-700 dark:text-sky-300 text-xs font-bold border border-sky-200 dark:border-sky-800/60 flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{addVal}</span>
                  </button>
                ))}
              </div>

              {/* Live Change / Due Indicator */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div
                  className={`p-3 rounded-xl border ${
                    changeAmount > 0
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider">Change Return</p>
                  <p className="text-xl font-black font-mono mt-0.5">
                    {curr}{changeAmount.toFixed(2)}
                  </p>
                </div>

                <div
                  className={`p-3 rounded-xl border ${
                    dueAmount > 0
                      ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                      : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider">Remaining Due</p>
                  <p className="text-xl font-black font-mono mt-0.5">
                    {curr}{dueAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Reference / Transaction ID for Digital payment */}
          {selectedMethod !== 'cash' && selectedMethod !== 'due' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Transaction / Card Reference ID (Optional)
              </label>
              <input
                id="payment-ref-id-input"
                type="text"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                placeholder="e.g. TRX-998812 or Last 4 digits"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>
          )}

          {/* Due warning for general walk-in customer */}
          {selectedMethod === 'due' && !selectedCustomer && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                <strong>Note:</strong> You are selling on credit/due to a General Walk-in Customer. It is recommended to register customer details to track dues accurately.
              </span>
            </div>
          )}

          {/* Order Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Invoice Note / Reference (Optional)
            </label>
            <input
              id="checkout-note-input"
              type="text"
              value={checkoutNote}
              onChange={(e) => setCheckoutNote(e.target.value)}
              placeholder="e.g. Special packing, delivery note"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            id="confirm-checkout-btn"
            type="button"
            onClick={handleCompleteSale}
            className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Confirm & Print Invoice ({curr}{cartTotal.toFixed(2)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
