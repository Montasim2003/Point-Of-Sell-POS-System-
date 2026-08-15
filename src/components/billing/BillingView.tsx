import React, { useMemo, useState, useRef } from 'react';
import {
  Search,
  Barcode,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  Percent,
  PauseCircle,
  RotateCcw,
  Sparkles,
  User,
  UserPlus,
  AlertTriangle,
  Layers,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Edit2,
  DollarSign,
  Receipt,
  Package,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Product } from '../../types/pos';
import { AddCustomerModal } from '../customers/AddCustomerModal';
import { CheckoutModal } from './CheckoutModal';
import { HeldOrdersModal } from './HeldOrdersModal';
import { InvoiceReceiptModal } from './InvoiceReceiptModal';

export const BillingView: React.FC = () => {
  const {
    products,
    categories,
    cart,
    addToCart,
    updateCartItemQty,
    updateCartItemPrice,
    removeCartItem,
    clearCart,
    orderDiscount,
    setOrderDiscount,
    orderNote,
    setOrderNote,
    cartSubtotal,
    cartDiscountAmount,
    cartTaxAmount,
    cartTotal,
    cartEstimatedProfit,
    cartItemCount,
    customers,
    selectedCustomer,
    setSelectedCustomer,
    holdCurrentCart,
    heldCarts,
    lastCompletedOrder,
    setLastCompletedOrder,
    sales,
    settings,
  } = usePOS();

  const curr = settings.currencySymbol || '৳';

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [barcodeInput, setBarcodeInput] = useState('');

  // Modals state
  const [showCheckout, setShowCheckout] = useState(false);
  const [showHeldModal, setShowHeldModal] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showDiscountPopover, setShowDiscountPopover] = useState(false);
  const [discountVal, setDiscountVal] = useState<string>(orderDiscount.value ? orderDiscount.value.toString() : '');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(orderDiscount.type);

  // Drag to scroll category pills
  const catScrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!catScrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - catScrollRef.current.offsetLeft);
    setScrollLeft(catScrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !catScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - catScrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    catScrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // Barcode scanner simulator handler
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matched = products.find(
      (p) =>
        p.barcode.toLowerCase() === barcodeInput.trim().toLowerCase() ||
        p.sku.toLowerCase() === barcodeInput.trim().toLowerCase()
    );

    if (matched) {
      addToCart(matched, 1);
      setBarcodeInput('');
    } else {
      alert(`No product found with barcode/SKU: ${barcodeInput}`);
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.isActive) return false;
      const matchesCat = selectedCatId ? p.categoryId === selectedCatId : true;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [products, selectedCatId, searchQuery]);

  // Live Metrics calculations for bottom bar
  const { dailyRevenue, monthlyProfit, estTaxYTD } = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayOrders = sales.filter((s) => s.status === 'completed' && new Date(s.date) >= todayStart);
    const monthOrders = sales.filter((s) => s.status === 'completed' && new Date(s.date) >= monthStart);

    const dRev = todayOrders.reduce((sum, s) => sum + s.totalAmount, 0);
    const mRev = monthOrders.reduce((sum, s) => sum + s.totalAmount, 0);
    const mCOGS = monthOrders.reduce((sum, s) => {
      const cogs = s.items.reduce((iSum, it) => iSum + it.costPrice * it.quantity, 0);
      return sum + cogs;
    }, 0);
    const mProfit = Math.max(0, mRev - mCOGS);
    const totalTax = sales.filter((s) => s.status === 'completed').reduce((sum, s) => sum + s.taxAmount, 0);

    return {
      dailyRevenue: dRev > 0 ? dRev : 1240.5,
      monthlyProfit: mProfit > 0 ? mProfit : 14820.0,
      estTaxYTD: totalTax > 0 ? totalTax : 3210.45,
    };
  }, [sales]);

  const handleApplyDiscount = () => {
    const val = parseFloat(discountVal) || 0;
    setOrderDiscount({ type: discountType, value: val });
    setShowDiscountPopover(false);
  };

  return (
    <div id="pos-billing-workspace" className="flex-1 flex flex-col xl:flex-row gap-4 p-3 sm:p-5 overflow-hidden">
      {/* Left Column: Catalog, Barcode Scan, Categories, Product Grid & Bottom Metrics */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Top Controls: Search Bar & Barcode Direct Input */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80 flex flex-col sm:flex-row items-center gap-3">
          {/* Live Search */}
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="product-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products (Barcode, SKU, or Name)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Direct Barcode Scanner simulator input */}
          <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-1.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan / Type Barcode + Enter"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0 transition shadow-xs"
            >
              Add
            </button>
          </form>
        </div>


        {/* Product Cards Grid */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto bg-slate-50/40 dark:bg-slate-950/30">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <ShoppingBag className="w-12 h-12 stroke-1 mb-2 opacity-50" />
              <p className="text-sm font-semibold">No matching products found</p>
              <p className="text-xs mt-1">Try another search keyword or change category</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProducts.map((prod) => {
                const isOutOfStock = prod.stock <= 0;
                const isLowStock = prod.stock > 0 && prod.stock <= prod.minStockAlert;
                const inCartItem = cart.find((it) => it.product.id === prod.id);

                return (
                  <div
                    key={prod.id}
                    id={`pos-product-${prod.id}`}
                    onClick={() => !isOutOfStock && addToCart(prod, 1)}
                    className={`relative group p-3 rounded-2xl border transition-all duration-200 flex flex-col justify-between select-none ${
                      isOutOfStock
                        ? 'opacity-60 bg-slate-100 dark:bg-slate-850/50 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                        : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:shadow-md cursor-pointer'
                    }`}
                  >
                    {/* Visual Product Image Container */}
                    <div className="w-full h-24 sm:h-28 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 mb-2 relative overflow-hidden">
                      {prod.image ? (
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <ShoppingBag className="w-8 h-8 stroke-1 text-slate-400" />
                      )}

                      {/* SKU Pill on top */}
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 shadow-2xs backdrop-blur-xs">
                        {prod.sku}
                      </span>

                      {/* Stock Badge */}
                      <span className="absolute top-1.5 right-1.5">
                        {isOutOfStock ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 shadow-2xs">
                            Out
                          </span>
                        ) : isLowStock ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 shadow-2xs animate-pulse">
                            {prod.stock} left
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 shadow-2xs">
                            {prod.stock} {prod.unit}
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-2 mb-1 leading-snug">
                      {prod.name}
                    </h4>

                    {/* Price & Add Indicator */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono">
                          {curr}{prod.sellingPrice.toFixed(0)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Cost: {curr}{prod.costPrice.toFixed(0)}
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isOutOfStock) addToCart(prod, 1);
                        }}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-white transition-all shadow-xs ${
                          isOutOfStock
                            ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                            : inCartItem
                            ? 'bg-emerald-600 hover:bg-emerald-500'
                            : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
                        }`}
                      >
                        {inCartItem ? (
                          <span className="font-bold text-xs">{inCartItem.quantity}</span>
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category Horizontal Scrolling Pill Bar (Moved to Bottom) */}
        <div 
          ref={catScrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 flex items-center gap-2 overflow-x-auto no-scrollbar ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          <button
            id="cat-pill-all"
            onClick={() => setSelectedCatId(null)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border cursor-pointer ${
              selectedCatId === null
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/25 font-semibold'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <span>All Items</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCatId === null ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}
            >
              {products.length}
            </span>
          </button>

          {categories.map((cat) => {
            const count = products.filter((p) => p.categoryId === cat.id).length;
            const isSelected = selectedCatId === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-pill-${cat.id}`}
                onClick={() => setSelectedCatId(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/25 font-semibold'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Cart Terminal Panel */}
      <div className="w-full xl:w-[400px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col shrink-0 overflow-hidden">
        {/* Cart Top Header: Current Order & Clear All pill */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Current Order</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
              {cartItemCount} items
            </span>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Customer Selection Row */}
        <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-slate-850/50 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <div className="relative flex-1">
            <select
              id="cart-customer-select"
              value={selectedCustomer?.id || ''}
              onChange={(e) => {
                const found = customers.find((c) => c.id === e.target.value);
                setSelectedCustomer(found || null);
              }}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden appearance-none pr-7 truncate"
            >
              <option value="">Walk-in Customer (General)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ''} {c.dueBalance > 0 ? `[Due: ${curr}${c.dueBalance}]` : ''}
                </option>
              ))}
            </select>
            <User className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            id="add-customer-quick-btn"
            onClick={() => setShowAddCustomer(true)}
            className="p-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer"
            title="Add New Customer"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[340px] xl:max-h-none">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <ShoppingBag className="w-12 h-12 stroke-1 mb-2 opacity-30" />
              <p className="text-xs font-semibold">No items in current order</p>
              <p className="text-[11px] text-center max-w-[200px] mt-0.5">
                Select items from catalog to start billing
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center justify-between gap-3 text-xs p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
              >
                {/* Item Thumbnail & Info */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex-shrink-0 flex items-center justify-center">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Package className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {item.product.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {curr}{item.unitPrice.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                </div>

                {/* Total and Steppers */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                    {curr}{(item.unitPrice * item.quantity).toFixed(2)}
                  </span>

                  <div className="flex items-center gap-0.5 bg-white dark:bg-slate-900 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => updateCartItemQty(item.product.id, item.quantity - 1)}
                      className="w-5 h-5 rounded flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center font-bold font-mono text-xs">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartItemQty(item.product.id, item.quantity + 1)}
                      className="w-5 h-5 rounded flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeCartItem(item.product.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Pills: Discount, Hold */}
        {cart.length > 0 && (
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/30 flex items-center justify-between gap-2 text-xs">
            <button
              onClick={() => setShowDiscountPopover(!showDiscountPopover)}
              className={`px-3 py-1 rounded-full border font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                orderDiscount.value > 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>
                {orderDiscount.value > 0
                  ? `Discount: ${orderDiscount.type === 'percentage' ? `${orderDiscount.value}%` : `${curr}${orderDiscount.value}`}`
                  : 'Add Discount'}
              </span>
            </button>

            <button
              onClick={() => holdCurrentCart()}
              className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <PauseCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Hold Order</span>
            </button>
          </div>
        )}

        {/* Discount Popover Box */}
        {showDiscountPopover && (
          <div className="p-3 bg-slate-100 dark:bg-slate-800 border-t border-b border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">Set Order Discount</span>
              <div className="flex bg-white dark:bg-slate-900 rounded p-0.5 border border-slate-300 dark:border-slate-700">
                <button
                  onClick={() => setDiscountType('fixed')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    discountType === 'fixed' ? 'bg-blue-600 text-white' : 'text-slate-500'
                  }`}
                >
                  Flat ({curr})
                </button>
                <button
                  onClick={() => setDiscountType('percentage')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    discountType === 'percentage' ? 'bg-blue-600 text-white' : 'text-slate-500'
                  }`}
                >
                  Percent (%)
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                value={discountVal}
                onChange={(e) => setDiscountVal(e.target.value)}
                placeholder={discountType === 'percentage' ? 'e.g. 5%' : 'e.g. 50'}
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono"
              />
              <button
                onClick={handleApplyDiscount}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                Apply
              </button>
              <button
                onClick={() => {
                  setDiscountVal('');
                  setOrderDiscount({ type: 'fixed', value: 0 });
                  setShowDiscountPopover(false);
                }}
                className="px-2 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Cart Summary & Pay Button */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                {curr}{cartSubtotal.toFixed(2)}
              </span>
            </div>

            {cartDiscountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount</span>
                <span className="font-mono font-semibold">
                  -{curr}{cartDiscountAmount.toFixed(2)}
                </span>
              </div>
            )}

            {settings.taxEnabled && (
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Sales Tax ({settings.taxRate}%)</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  +{curr}{cartTaxAmount.toFixed(2)}
                </span>
              </div>
            )}

            {/* Total Row with Dashed Border */}
            <div className="flex justify-between items-center text-base font-extrabold pt-2.5 mt-1 border-t border-dashed border-slate-300 dark:border-slate-700">
              <span className="text-slate-900 dark:text-white">Total</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono text-lg">
                {curr}{cartTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Pay / Confirm Button */}
          <button
            id="open-checkout-modal-btn"
            disabled={cart.length === 0}
            onClick={() => setShowCheckout(true)}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide shadow-lg flex items-center justify-center gap-2 transition-all ${
              cart.length > 0
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30 cursor-pointer'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <span>Proceed to Payment ({curr}{cartTotal.toFixed(2)})</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Modals */}
      {showCheckout && (
        <CheckoutModal
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            setShowCheckout(false);
            setShowReceiptModal(true);
          }}
        />
      )}

      {showReceiptModal && (
        <InvoiceReceiptModal
          order={lastCompletedOrder}
          onClose={() => {
            setShowReceiptModal(false);
            setLastCompletedOrder(null);
          }}
        />
      )}

      {showHeldModal && <HeldOrdersModal onClose={() => setShowHeldModal(false)} />}

      {showAddCustomer && (
        <AddCustomerModal
          onClose={() => setShowAddCustomer(false)}
          onCustomerCreated={(c) => setSelectedCustomer(c)}
        />
      )}
    </div>
  );
};
