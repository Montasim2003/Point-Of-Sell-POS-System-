import React, { useState, useMemo, useEffect } from 'react';
import { X, Printer, Settings, Barcode as BarcodeIcon } from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Product } from '../../types/pos';
import JsBarcode from 'jsbarcode';

// Local Barcode Component to avoid third-party react wrappers crashing
const BarcodeGenerator: React.FC<{ value: string }> = ({ value }) => {
  const svgRef = React.useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          height: 30,
          width: 1.2,
          fontSize: 10,
          margin: 0,
          displayValue: true,
        });
      } catch (err) {
        console.error('Barcode generation error:', err);
      }
    }
  }, [value]);

  return <svg ref={svgRef} className="max-w-full" />;
};

interface PrintLabelsModalProps {
  onClose: () => void;
  preselectedProduct?: Product;
}

export const PrintLabelsModal: React.FC<PrintLabelsModalProps> = ({ onClose, preselectedProduct }) => {
  const { products, categories, settings } = usePOS();
  
  const [printMode, setPrintMode] = useState<'single' | 'category' | 'all'>(preselectedProduct ? 'single' : 'all');
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [printQty, setPrintQty] = useState<number>(preselectedProduct ? preselectedProduct.stock : 1);
  const [selectedProductId, setSelectedProductId] = useState<string>(preselectedProduct ? preselectedProduct.id : '');

  // Calculate items to print
  const printItems = useMemo(() => {
    let items: { product: Product; qty: number }[] = [];

    if (printMode === 'single') {
      const prod = products.find(p => p.id === selectedProductId);
      if (prod) {
        items.push({ product: prod, qty: Math.max(1, printQty) });
      }
    } else if (printMode === 'category') {
      const catProducts = products.filter(p => p.categoryId === selectedCatId);
      items = catProducts.map(p => ({ product: p, qty: Math.max(1, p.stock) }));
    } else {
      items = products.map(p => ({ product: p, qty: Math.max(1, p.stock) }));
    }

    return items;
  }, [printMode, selectedProductId, selectedCatId, printQty, products]);

  const totalLabels = printItems.reduce((sum, item) => sum + item.qty, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in hide-on-print">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarcodeIcon className="w-5 h-5 text-blue-500" />
              Generate Barcode Labels
            </h2>
            <p className="text-slate-500 text-sm mt-1">Configure and print product barcode tags</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body - Controls */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          {/* Mode Selection */}
          {!preselectedProduct && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Print Mode</label>
              <div className="flex gap-3">
                <label className="flex-1 cursor-pointer">
                  <input type="radio" className="peer sr-only" name="printMode" checked={printMode === 'all'} onChange={() => setPrintMode('all')} />
                  <div className="p-3 text-center rounded-xl border border-slate-200 dark:border-slate-700 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 peer-checked:border-blue-500 peer-checked:text-blue-600 dark:peer-checked:text-blue-400 font-medium text-sm transition-all">
                    All Products
                  </div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input type="radio" className="peer sr-only" name="printMode" checked={printMode === 'category'} onChange={() => setPrintMode('category')} />
                  <div className="p-3 text-center rounded-xl border border-slate-200 dark:border-slate-700 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 peer-checked:border-blue-500 peer-checked:text-blue-600 dark:peer-checked:text-blue-400 font-medium text-sm transition-all">
                    By Category
                  </div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input type="radio" className="peer sr-only" name="printMode" checked={printMode === 'single'} onChange={() => setPrintMode('single')} />
                  <div className="p-3 text-center rounded-xl border border-slate-200 dark:border-slate-700 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 peer-checked:border-blue-500 peer-checked:text-blue-600 dark:peer-checked:text-blue-400 font-medium text-sm transition-all">
                    Single Product
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Contextual Options */}
          <div className="grid grid-cols-1 gap-4">
            {printMode === 'category' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Select Category</label>
                <select
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  <option value="all" disabled>Choose category...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {printMode === 'single' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Select Product</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => {
                      setSelectedProductId(e.target.value);
                      const p = products.find(prod => prod.id === e.target.value);
                      if (p) setPrintQty(p.stock > 0 ? p.stock : 1);
                    }}
                    disabled={!!preselectedProduct}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                  >
                    <option value="" disabled>Choose product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - {p.sku}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Quantity to Print</label>
                  <input
                    type="number"
                    min="1"
                    value={printQty}
                    onChange={(e) => setPrintQty(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Preview Warning */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-xl flex gap-3">
            <Settings className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-bold mb-1">Print Configuration</p>
              <p>You are about to generate <strong>{totalLabels}</strong> barcode labels. When the print dialog opens, ensure you have selected your label printer and the correct paper size (e.g., A4 Sticker Paper or Continuous Label Roll) and have set margins to "None".</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePrint}
            disabled={totalLabels === 0}
            className="px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs flex items-center gap-2"
          >
            <Printer className="w-5 h-5" />
            Print {totalLabels} Labels
          </button>
        </div>
      </div>

      {/* 
        PRINTABLE AREA 
        This is hidden on screen but visible when printing.
      */}
      <div className="hidden print:block print:w-full print:m-0 print:p-0 absolute top-0 left-0 bg-white text-black z-[9999]">
        <div className="grid grid-cols-3 gap-2 p-2" style={{ width: '210mm' }}>
          {printItems.flatMap(item => 
            Array.from({ length: item.qty }).map((_, idx) => (
              <div key={`${item.product.id}-${idx}`} className="border border-slate-300 p-2 flex flex-col items-center justify-center text-center bg-white" style={{ height: '38mm', overflow: 'hidden' }}>
                <p className="font-bold text-[10px] uppercase truncate w-full mb-0.5">{settings.storeName}</p>
                <p className="text-[9px] truncate w-full mb-0.5">{item.product.name} ({item.product.unit})</p>
                <p className="font-bold text-sm mb-1">{settings.currencySymbol || '৳'}{item.product.sellingPrice}</p>
                <BarcodeGenerator value={item.product.barcode || item.product.sku || '0000000000'} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
