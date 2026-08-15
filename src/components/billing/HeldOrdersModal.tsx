import React from 'react';
import { X, Play, Trash2, Clock, User, ShoppingBag } from 'lucide-react';
import { usePOS } from '../../context/POSContext';

interface HeldOrdersModalProps {
  onClose: () => void;
}

export const HeldOrdersModal: React.FC<HeldOrdersModalProps> = ({ onClose }) => {
  const { heldCarts, recallHeldCart, deleteHeldCart, settings } = usePOS();
  const curr = settings.currencySymbol || '৳';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        id="held-orders-modal"
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6"
      >
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm">Paused / Held Orders ({heldCarts.length})</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {heldCarts.length === 0 ? (
            <div className="text-center py-10 text-slate-400 dark:text-slate-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No held orders found</p>
              <p className="text-xs mt-1">You can pause current active carts at any time</p>
            </div>
          ) : (
            heldCarts.map((held) => {
              const totalAmount = held.items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
              const itemCount = held.items.reduce((sum, it) => sum + it.quantity, 0);

              return (
                <div
                  key={held.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:border-sky-500/50 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {held.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold shrink-0">
                        {itemCount} items
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                      {held.customer && (
                        <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400">
                          <User className="w-3 h-3" />
                          {held.customer.name}
                        </span>
                      )}
                      <span className="text-[11px] font-mono">
                        Saved: {new Date(held.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Total: {curr}{totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      id={`recall-held-${held.id}`}
                      onClick={() => {
                        recallHeldCart(held.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Resume</span>
                    </button>
                    <button
                      onClick={() => deleteHeldCart(held.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete held order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
