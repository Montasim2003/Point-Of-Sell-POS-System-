import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  X,
  Store,
  DollarSign,
  Receipt,
  RotateCcw,
  Download,
  Sparkles,
  CheckCircle2,
  Sliders,
  Shield,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';

interface SettingsModalProps {
  onClose: () => void;
  isTabMode?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, isTabMode = false }) => {
  const { settings, updateSettings, resetToDemoData } = usePOS();

  const [formData, setFormData] = useState({
    storeName: settings.storeName,
    ownerName: settings.ownerName,
    phone: settings.phone,
    email: settings.email,
    address: settings.address,
    currencySymbol: settings.currencySymbol,
    taxRate: settings.taxRate.toString(),
    taxEnabled: settings.taxEnabled,
    invoiceFooterNote: settings.invoiceFooterNote,
    receiptType: settings.receiptType,
    enableSound: settings.enableSound,
    lowStockThresholdDefault: settings.lowStockThresholdDefault.toString(),
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName: formData.storeName.trim(),
      ownerName: formData.ownerName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      currencySymbol: formData.currencySymbol.trim() || '৳',
      taxRate: parseFloat(formData.taxRate) || 0,
      taxEnabled: formData.taxEnabled,
      invoiceFooterNote: formData.invoiceFooterNote.trim(),
      receiptType: formData.receiptType as 'thermal' | 'a4',
      enableSound: formData.enableSound,
      lowStockThresholdDefault: parseInt(formData.lowStockThresholdDefault, 10) || 5,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      if (!isTabMode) {
        onClose();
      }
    }, 1000);
  };

  const handleExportBackupJSON = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      products: localStorage.getItem('smartpos_products'),
      categories: localStorage.getItem('smartpos_categories'),
      sales: localStorage.getItem('smartpos_sales'),
      customers: localStorage.getItem('smartpos_customers'),
      expenses: localStorage.getItem('smartpos_expenses'),
      staff: localStorage.getItem('smartpos_staff'),
      settings: localStorage.getItem('smartpos_settings'),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `SmartPOS_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const content = (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Header banner */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">System & Store Settings</h3>
              <p className="text-xs text-slate-300">Customize currency, tax rates, receipts, sound, and store profile</p>
            </div>
          </div>
          {!isTabMode && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Store Profile */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Store className="w-4 h-4" />
              <span>Store Profile & Invoice Header</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Store / Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Owner / System Creator Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Store Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Store Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Store Physical Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Tax & Currency Configuration */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
              <DollarSign className="w-4 h-4" />
              <span>Currency & Sales Tax Settings</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={formData.currencySymbol}
                  onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                  placeholder="e.g. ৳ or $ or € or ₹"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs font-bold font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sales Tax / VAT Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                  disabled={!formData.taxEnabled}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs font-mono disabled:opacity-40 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tax Calculation Status
                </label>
                <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.taxEnabled}
                    onChange={(e) => setFormData({ ...formData, taxEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    {formData.taxEnabled ? 'Tax Enabled on Checkout' : 'Tax Disabled (0%)'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Receipt & Hardware Preferences */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Receipt className="w-4 h-4" />
              <span>Receipt & Sound Feedback</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default Receipt Format
                </label>
                <select
                  value={formData.receiptType}
                  onChange={(e) => setFormData({ ...formData, receiptType: e.target.value as 'thermal' | 'a4' })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="thermal">Thermal POS Receipt (80mm / 3 inch)</option>
                  <option value="a4">Standard A4 Tax Invoice Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Low Stock Alert Threshold
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.lowStockThresholdDefault}
                  onChange={(e) => setFormData({ ...formData, lowStockThresholdDefault: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Invoice Footer Note / Return Policy
                </label>
                <input
                  type="text"
                  value={formData.invoiceFooterNote}
                  onChange={(e) => setFormData({ ...formData, invoiceFooterNote: e.target.value })}
                  placeholder="Thank you for shopping with us! Please come again."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Backup & Demo Management */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Database Backup & Recovery</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Download a full JSON database snapshot or reset to seed state</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportBackupJSON}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-blue-500" />
                Backup JSON
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset all demo products, categories, sales, and expenses back to initial demo data?')) {
                    resetToDemoData();
                    if (!isTabMode) onClose();
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-xs font-semibold text-red-600 dark:text-red-300 hover:bg-red-100 transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Demo
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            {!isTabMode && (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
            )}
            <button
              id="save-settings-btn"
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-2 transition cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Settings Saved Successfully!</span>
                </>
              ) : (
                <span>Save Store Settings</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (isTabMode) {
    return <div className="p-4 sm:p-6">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      {content}
    </div>
  );
};
