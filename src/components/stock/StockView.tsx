import React, { useMemo, useState, useRef } from 'react';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Layers,
  Edit,
  Trash2,
  TrendingUp,
  DollarSign,
  Download,
  Barcode,
  ArrowUpDown,
  CheckCircle2,
  RefreshCw,
  X,
  Image as ImageIcon,
  Upload,
  Sparkles,
  Printer,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Product } from '../../types/pos';
import { PrintLabelsModal } from './PrintLabelsModal';

const PRESET_PRODUCT_IMAGES = [
  { name: 'Beverage / Drink', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80' },
  { name: 'Coffee / Tea', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80' },
  { name: 'Snacks / Chips', url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop&q=80' },
  { name: 'Bakery / Cookies', url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&auto=format&fit=crop&q=80' },
  { name: 'Fresh Fruits', url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=80' },
  { name: 'Dairy / Milk', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80' },
  { name: 'Cooking Oil / Grocery', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80' },
  { name: 'Personal Care', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80' },
];

export const StockView: React.FC = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct, quickStockAdjust, settings } = usePOS();
  const curr = settings.currencySymbol || '৳';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'out' | 'in'>('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printProduct, setPrintProduct] = useState<Product | undefined>(undefined);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(10);

  // Form state for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    categoryId: categories[0]?.id || '',
    costPrice: '',
    sellingPrice: '',
    stock: '',
    minStockAlert: '5',
    unit: 'pcs',
    image: '',
  });

  // Calculate High-level Inventory Metrics
  const totalStockItems = products.reduce((sum, p) => sum + p.stock, 0);
  const totalValuationCost = products.reduce((sum, p) => sum + p.costPrice * p.stock, 0);
  const totalValuationSell = products.reduce((sum, p) => sum + p.sellingPrice * p.stock, 0);
  const potentialProfit = totalValuationSell - totalValuationCost;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.minStockAlert).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q);

      const matchesCat = categoryFilter === 'all' || p.categoryId === categoryFilter;

      let matchesStock = true;
      if (stockStatusFilter === 'low') {
        matchesStock = p.stock > 0 && p.stock <= p.minStockAlert;
      } else if (stockStatusFilter === 'out') {
        matchesStock = p.stock <= 0;
      } else if (stockStatusFilter === 'in') {
        matchesStock = p.stock > p.minStockAlert;
      }

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [products, searchQuery, categoryFilter, stockStatusFilter]);

  const handleOpenAdd = () => {
    const timestamp = Date.now().toString().slice(-6);
    setFormData({
      name: '',
      sku: `SKU-${timestamp}`,
      barcode: `890${Date.now().toString().slice(-10)}`,
      categoryId: categories[0]?.id || '',
      costPrice: '',
      sellingPrice: '',
      stock: '20',
      minStockAlert: '5',
      unit: 'pcs',
      image: '',
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      categoryId: p.categoryId,
      costPrice: p.costPrice.toString(),
      sellingPrice: p.sellingPrice.toString(),
      stock: p.stock.toString(),
      minStockAlert: p.minStockAlert.toString(),
      unit: p.unit,
      image: p.image || '',
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({ ...prev, image: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDropFile = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({ ...prev, image: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseFloat(formData.costPrice) || 0;
    const sell = parseFloat(formData.sellingPrice) || 0;
    const stockQty = parseInt(formData.stock, 10) || 0;
    const minAlert = parseInt(formData.minStockAlert, 10) || 5;

    if (!formData.name.trim() || !formData.sku.trim()) return;

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        barcode: formData.barcode.trim() || formData.sku.trim(),
        categoryId: formData.categoryId,
        costPrice: cost,
        sellingPrice: sell,
        stock: stockQty,
        minStockAlert: minAlert,
        unit: formData.unit,
        image: formData.image.trim() || undefined,
      });
      setEditingProduct(null);
    } else {
      addProduct({
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        barcode: formData.barcode.trim() || formData.sku.trim(),
        categoryId: formData.categoryId,
        costPrice: cost,
        sellingPrice: sell,
        stock: stockQty,
        minStockAlert: minAlert,
        unit: formData.unit,
        image: formData.image.trim() || undefined,
        isActive: true,
      });
      setShowAddModal(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Product Name', 'SKU', 'Barcode', 'Category', 'Cost Price', 'Selling Price', 'Stock', 'Unit', 'Total Cost Value', 'Total Retail Value'];
    const rows = products.map((p) => {
      const cat = categories.find((c) => c.id === p.categoryId)?.name || 'N/A';
      return [
        `"${p.name.replace(/"/g, '""')}"`,
        p.sku,
        p.barcode,
        `"${cat}"`,
        p.costPrice.toFixed(2),
        p.sellingPrice.toFixed(2),
        p.stock,
        p.unit,
        (p.costPrice * p.stock).toFixed(2),
        (p.sellingPrice * p.stock).toFixed(2),
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Inventory_Stock_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div id="stock-inventory-page" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Stock & Inventory Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track real-time inventory units, product images, margins, barcodes, and restock alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="export-stock-csv-btn"
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setPrintProduct(undefined);
              setShowPrintModal(true);
            }}
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Labels</span>
          </button>

          <button
            id="add-new-product-btn"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* 4 Inventory Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Total In Stock</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
            {totalStockItems} <span className="text-xs font-normal text-slate-400">units</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">{products.length} unique products</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Stock Valuation (Cost)</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
            {curr}{totalValuationCost.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Asset capital tied in stock</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Retail Valuation</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
            {curr}{totalValuationSell.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-semibold">
            +{curr}{potentialProfit.toLocaleString()} profit potential
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-xs">
              {lowStockCount} Low
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-bold text-xs">
              {outOfStockCount} Out
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Need supplier reorder</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="stock-search-input"
            type="text"
            placeholder="Search by product name, SKU, barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            id="stock-category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 text-xs font-medium"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock Status Filter */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium">
            <button
              onClick={() => setStockStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                stockStatusFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setStockStatusFilter('low')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                stockStatusFilter === 'low'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Low ({lowStockCount})
            </button>
            <button
              onClick={() => setStockStatusFilter('out')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                stockStatusFilter === 'out'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Out ({outOfStockCount})
            </button>
          </div>
        </div>
      </div>

      {/* Main Stock Inventory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Product & Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Cost</th>
                <th className="py-3.5 px-4 text-right">Sell Price</th>
                <th className="py-3.5 px-4 text-right">Profit / Margin</th>
                <th className="py-3.5 px-4 text-center">Stock Balance</th>
                <th className="py-3.5 px-4 text-right">Total Asset</th>
                <th className="py-3.5 px-4 text-center">Quick Adjust</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">No products found</p>
                    <p className="text-xs text-slate-400">Try adjusting your search query or category filter</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const cat = categories.find((c) => c.id === p.categoryId);
                  const isLow = p.stock > 0 && p.stock <= p.minStockAlert;
                  const isOut = p.stock <= 0;
                  const margin = p.sellingPrice > 0 ? (((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(1) : '0';

                  return (
                    <tr key={p.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      {/* Product Name, Image & SKU */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0 flex items-center justify-center">
                            {p.image ? (
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white leading-tight">{p.name}</div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                              <span>SKU: {p.sku}</span>
                              <span>•</span>
                              <span>Barcode: {p.barcode}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                          {cat?.name || 'General'}
                        </span>
                      </td>

                      {/* Cost Price */}
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-600 dark:text-slate-300">
                        {curr}{p.costPrice.toFixed(2)}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {curr}{p.sellingPrice.toFixed(2)}
                      </td>

                      {/* Margin % */}
                      <td className="py-3 px-4 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                          {margin}%
                        </span>
                      </td>

                      {/* Current Stock */}
                      <td className="py-3 px-4 text-center">
                        {isOut ? (
                          <span className="px-2 py-1 rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800/60">
                            0 {p.unit}
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-1 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold flex items-center justify-center gap-1 border border-amber-200 dark:border-amber-800/60">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            {p.stock} {p.unit}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold">
                            {p.stock} {p.unit}
                          </span>
                        )}
                      </td>

                      {/* Stock Value */}
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {curr}{(p.costPrice * p.stock).toFixed(2)}
                      </td>

                      {/* Quick Adjust +/- Buttons */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => quickStockAdjust(p.id, -1)}
                            className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                            title="Decrease 1 unit"
                          >
                            -
                          </button>
                          <button
                            onClick={() => quickStockAdjust(p.id, 1)}
                            className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                            title="Add 1 unit"
                          >
                            +
                          </button>
                          <button
                            onClick={() => {
                              setAdjustingProduct(p);
                              setAdjustDelta(10);
                            }}
                            className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] font-semibold border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 cursor-pointer"
                            title="Bulk Restock"
                          >
                            Bulk
                          </button>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setPrintProduct(p);
                              setShowPrintModal(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                            title="Print Barcode Labels"
                          >
                            <Barcode className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                            title="Edit product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete product "${p.name}" from inventory?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Delete product"
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

      {/* Add / Edit Product Modal */}
      {(showAddModal || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
            <div className="p-4 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">
                  {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Inventory Product'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProduct(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Product Image Section */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-blue-500" />
                  <span>Product Image (Upload or URL)</span>
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Thumbnail Preview */}
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex-shrink-0 flex items-center justify-center shadow-xs relative group">
                    {formData.image ? (
                      <>
                        <img
                          src={formData.image}
                          alt="Product Preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                          className="absolute inset-0 bg-slate-950/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-400" />
                    )}
                  </div>

                  {/* Upload Controls & URL input */}
                  <div className="flex-1 w-full space-y-2">
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDropFile}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-500 rounded-xl p-2.5 text-center cursor-pointer bg-white dark:bg-slate-900/60 transition"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div className="flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <Upload className="w-3.5 h-3.5 text-blue-500" />
                        <span>Click or drag image file here</span>
                      </div>
                    </div>

                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="Or paste direct image URL (https://...)"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs placeholder:text-slate-400"
                    />
                  </div>
                </div>

              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rupchanda Soybean Oil 2 Litre"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Barcode Number
                  </label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Unit Type
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="ltr">Litre (ltr)</option>
                    <option value="box">Box</option>
                    <option value="pkt">Packet (pkt)</option>
                    <option value="dozen">Dozen</option>
                  </select>
                </div>
              </div>

              {/* Pricing Grid */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Buy / Cost Price ({curr}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    placeholder="e.g. 100"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Selling Price ({curr}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    placeholder="e.g. 130"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Stock Levels */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Low Stock Alert Limit
                  </label>
                  <input
                    type="number"
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Bulk Adjust Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Restock: {adjustingProduct.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Current stock: <strong className="text-slate-900 dark:text-white">{adjustingProduct.stock} {adjustingProduct.unit}</strong>
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Units to Add (+) or Deduct (-)
              </label>
              <input
                type="number"
                value={adjustDelta}
                onChange={(e) => setAdjustDelta(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setAdjustingProduct(null)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  quickStockAdjust(adjustingProduct.id, adjustDelta);
                  setAdjustingProduct(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition cursor-pointer"
              >
                Update Stock ({adjustingProduct.stock + adjustDelta})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
