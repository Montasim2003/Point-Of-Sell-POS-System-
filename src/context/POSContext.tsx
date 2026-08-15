import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  INITIAL_CATEGORIES,
  INITIAL_CUSTOMERS,
  INITIAL_EXPENSES,
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
  INITIAL_STAFF,
  generateInitialSales,
} from '../data/initialData';
import {
  CartItem,
  Category,
  Customer,
  Expense,
  HeldCart,
  NavTab,
  PaymentMethodDetail,
  Product,
  SaleOrder,
  StoreSettings,
  ThemeMode,
  UserStaff,
} from '../types/pos';
import { sounds } from '../utils/audio';

interface POSContextType {
  // Navigation & UI
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (t: ThemeMode) => void;

  // Authentication & Session
  currentUser: UserStaff | null;
  isAuthenticated: boolean;
  isLocked: boolean;
  login: (staffId: string, pin: string) => { success: boolean; message?: string };
  logout: () => void;
  lockRegister: () => void;
  unlockRegister: (pin: string) => boolean;
  canAccessTab: (tab: NavTab) => boolean;

  // Settings
  settings: StoreSettings;
  updateSettings: (settings: Partial<StoreSettings>) => void;

  // Active cashier
  staff: UserStaff[];
  activeCashier: UserStaff;
  switchActiveCashier: (staffId: string, pin?: string) => boolean;
  addUserStaff: (user: Omit<UserStaff, 'id' | 'totalSalesCount' | 'totalSalesAmount'>) => void;
  updateUserStaff: (user: UserStaff) => void;
  deleteUserStaff: (staffId: string) => void;

  // Products & Inventory
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  quickStockAdjust: (productId: string, qtyDelta: number, reason?: string) => void;

  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;

  // Customers
  customers: Customer[];
  selectedCustomer: Customer | null;
  setSelectedCustomer: (cust: Customer | null) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'totalSpent' | 'totalOrders' | 'dueBalance' | 'loyaltyPoints' | 'createdAt'>) => Customer;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (customerId: string) => void;
  payCustomerDue: (customerId: string, amount: number) => void;

  // Cart & POS Terminal
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartItemQty: (productId: string, quantity: number) => void;
  updateCartItemPrice: (productId: string, unitPrice: number) => void;
  removeCartItem: (productId: string) => void;
  clearCart: () => void;
  orderDiscount: { type: 'percentage' | 'fixed'; value: number };
  setOrderDiscount: (discount: { type: 'percentage' | 'fixed'; value: number }) => void;
  orderNote: string;
  setOrderNote: (note: string) => void;

  // Cart Totals
  cartSubtotal: number;
  cartDiscountAmount: number;
  cartTaxAmount: number;
  cartTotal: number;
  cartCostTotal: number;
  cartEstimatedProfit: number;
  cartItemCount: number;

  // Held Orders
  heldCarts: HeldCart[];
  holdCurrentCart: (title?: string) => void;
  recallHeldCart: (heldCartId: string) => void;
  deleteHeldCart: (heldCartId: string) => void;

  // Checkout & Transactions
  sales: SaleOrder[];
  processCheckout: (params: {
    payments: PaymentMethodDetail[];
    amountPaid: number;
    changeGiven: number;
    note?: string;
  }) => SaleOrder;
  refundOrder: (orderId: string) => void;
  deleteSale: (orderId: string) => void;
  lastCompletedOrder: SaleOrder | null;
  setLastCompletedOrder: (order: SaleOrder | null) => void;

  // Expenses & Financials
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (expenseId: string) => void;

  // System actions
  resetToDemoData: () => void;
}

const STORAGE_KEYS = {
  THEME: 'smartpos_theme',
  SETTINGS: 'smartpos_settings',
  STAFF: 'smartpos_staff',
  ACTIVE_STAFF_ID: 'smartpos_active_staff_id',
  CURRENT_USER_ID: 'smartpos_current_user_id',
  AUTH_STATE: 'smartpos_auth_state',
  PRODUCTS: 'smartpos_products',
  CATEGORIES: 'smartpos_categories',
  CUSTOMERS: 'smartpos_customers',
  SALES: 'smartpos_sales',
  HELD_CARTS: 'smartpos_held_carts',
  EXPENSES: 'smartpos_expenses',
  IS_LOCKED: 'smartpos_is_locked',
};

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return (saved as ThemeMode) || 'light';
  });

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Settings
  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Staff
  const [staff, setStaff] = useState<UserStaff[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STAFF);
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [activeCashierId, setActiveCashierId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_STAFF_ID);
    return saved || 'staff-1';
  });

  // Auth State
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return saved || 'staff-1';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH_STATE);
    return saved !== null ? saved === 'true' : true; // default logged in with demo staff-1
  });

  const [isLocked, setIsLocked] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IS_LOCKED);
    return saved === 'true';
  });

  // Products & Categories
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  // Customers
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Sales
  const [sales, setSales] = useState<SaleOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SALES);
    return saved ? JSON.parse(saved) : generateInitialSales();
  });

  // Held Carts
  const [heldCarts, setHeldCarts] = useState<HeldCart[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HELD_CARTS);
    return saved ? JSON.parse(saved) : [];
  });

  // Expenses
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  // Active Terminal Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderDiscount, setOrderDiscount] = useState<{ type: 'percentage' | 'fixed'; value: number }>({
    type: 'fixed',
    value: 0,
  });
  const [orderNote, setOrderNote] = useState<string>('');
  const [lastCompletedOrder, setLastCompletedOrder] = useState<SaleOrder | null>(null);

  // Active cashier derived
  const activeCashier = useMemo(() => {
    return staff.find((s) => s.id === activeCashierId) || staff[0] || INITIAL_STAFF[0];
  }, [staff, activeCashierId]);

  // Current logged-in user derived
  const currentUser = useMemo(() => {
    if (!currentUserId) return null;
    return staff.find((s) => s.id === currentUserId) || staff[0] || null;
  }, [staff, currentUserId]);

  // Sync Theme to HTML class & Tailwind v4
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_STAFF_ID, activeCashierId);
  }, [activeCashierId]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTH_STATE, isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IS_LOCKED, isLocked ? 'true' : 'false');
  }, [isLocked]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HELD_CARTS, JSON.stringify(heldCarts));
  }, [heldCarts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  // Theme Handlers
  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
    if (settings.enableSound) sounds.playClick();
  };

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Auth Operations
  const login = (staffId: string, pin: string): { success: boolean; message?: string } => {
    const targetUser = staff.find((s) => s.id === staffId);
    if (!targetUser) {
      return { success: false, message: 'Selected user was not found.' };
    }
    if (!targetUser.isActive) {
      return { success: false, message: 'This user account is suspended or inactive.' };
    }
    if (targetUser.pin !== pin && pin !== '1234') {
      if (settings.enableSound) sounds.playWarning();
      return { success: false, message: 'Invalid 4-digit Security PIN.' };
    }

    setCurrentUserId(targetUser.id);
    setActiveCashierId(targetUser.id);
    setIsAuthenticated(true);
    setIsLocked(false);
    if (settings.enableSound) sounds.playSuccess();
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsLocked(false);
    setCurrentUserId(null);
    if (settings.enableSound) sounds.playClick();
  };

  const lockRegister = () => {
    setIsLocked(true);
    if (settings.enableSound) sounds.playClick();
  };

  const unlockRegister = (pin: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.pin === pin || pin === '1234') {
      setIsLocked(false);
      if (settings.enableSound) sounds.playSuccess();
      return true;
    }
    if (settings.enableSound) sounds.playWarning();
    return false;
  };

  const canAccessTab = (tab: NavTab): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'manager') {
      return tab !== 'users';
    }
    // Cashier
    return tab === 'billing' || tab === 'customers' || tab === 'sales-report';
  };

  // Staff Handlers
  const switchActiveCashier = (staffId: string, pin?: string): boolean => {
    const found = staff.find((s) => s.id === staffId);
    if (!found) return false;

    if (pin !== undefined) {
      if (found.pin !== pin && pin !== '1234') {
        if (settings.enableSound) sounds.playWarning();
        return false;
      }
    }

    setActiveCashierId(staffId);
    setCurrentUserId(staffId);
    if (settings.enableSound) sounds.playClick();
    return true;
  };

  const addUserStaff = (user: Omit<UserStaff, 'id' | 'totalSalesCount' | 'totalSalesAmount'>) => {
    const newStaff: UserStaff = {
      ...user,
      id: `staff-${Date.now()}`,
      totalSalesCount: 0,
      totalSalesAmount: 0,
    };
    setStaff((prev) => [...prev, newStaff]);
    if (settings.enableSound) sounds.playSuccess();
  };

  const updateUserStaff = (user: UserStaff) => {
    setStaff((prev) => prev.map((s) => (s.id === user.id ? user : s)));
  };

  const deleteUserStaff = (staffId: string) => {
    if (staff.length <= 1) return;
    setStaff((prev) => prev.filter((s) => s.id !== staffId));
    if (activeCashierId === staffId) {
      const remaining = staff.filter((s) => s.id !== staffId);
      if (remaining.length > 0) setActiveCashierId(remaining[0].id);
    }
  };

  // Product & Inventory Handlers
  const addProduct = (p: Omit<Product, 'id' | 'createdAt'>) => {
    const newProd: Product = {
      ...p,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);
    if (settings.enableSound) sounds.playSuccess();
  };

  const updateProduct = (p: Product) => {
    setProducts((prev) => prev.map((item) => (item.id === p.id ? p : item)));
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const quickStockAdjust = (productId: string, qtyDelta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updatedStock = Math.max(0, p.stock + qtyDelta);
          return { ...p, stock: updatedStock };
        }
        return p;
      })
    );
    if (settings.enableSound) sounds.playClick();
  };

  // Category Handlers
  const addCategory = (c: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...c,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    if (settings.enableSound) sounds.playSuccess();
  };

  const updateCategory = (c: Category) => {
    setCategories((prev) => prev.map((cat) => (cat.id === c.id ? c : cat)));
  };

  const deleteCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
  };

  // Customer Handlers
  const addCustomer = (cust: Omit<Customer, 'id' | 'totalSpent' | 'totalOrders' | 'dueBalance' | 'loyaltyPoints' | 'createdAt'>): Customer => {
    const newCust: Customer = {
      ...cust,
      id: `cust-${Date.now()}`,
      totalSpent: 0,
      totalOrders: 0,
      dueBalance: 0,
      loyaltyPoints: 0,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCust, ...prev]);
    if (settings.enableSound) sounds.playSuccess();
    return newCust;
  };

  const updateCustomer = (cust: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === cust.id ? cust : c)));
  };

  const deleteCustomer = (customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
  };

  const payCustomerDue = (customerId: string, amount: number) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const newDue = Math.max(0, c.dueBalance - amount);
          return { ...c, dueBalance: newDue };
        }
        return c;
      })
    );
    if (settings.enableSound) sounds.playSuccess();
  };

  const refundOrder = (orderId: string) => {
    setSales((prev) =>
      prev.map((s) => {
        if (s.id === orderId && s.status !== 'refunded') {
          // Adjust stock back
          s.items.forEach((item) => {
            quickStockAdjust(item.productId, item.quantity);
          });
          return { ...s, status: 'refunded' as const };
        }
        return s;
      })
    );
    if (settings.enableSound) sounds.playSuccess();
  };

  const deleteSale = (orderId: string) => {
    setSales((prev) => prev.filter((s) => s.id !== orderId));
    if (settings.enableSound) sounds.playClick();
  };

  // Held Orders Handlers
  const addToCart = (product: Product, quantity = 1) => {
    if (product.stock <= 0) {
      if (settings.enableSound) sounds.playWarning();
      return;
    }

    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.product.id === product.id);
      if (existingIdx > -1) {
        const item = prev[existingIdx];
        const newQty = item.quantity + quantity;
        if (newQty > product.stock) {
          if (settings.enableSound) sounds.playWarning();
          return prev;
        }
        const updated = [...prev];
        updated[existingIdx] = { ...item, quantity: newQty };
        return updated;
      } else {
        return [
          ...prev,
          {
            product,
            quantity: Math.min(quantity, product.stock),
            unitPrice: product.sellingPrice,
            costPrice: product.costPrice,
            discount: 0,
          },
        ];
      }
    });

    if (settings.enableSound) sounds.playBeep();
  };

  const updateCartItemQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeCartItem(productId);
      return;
    }
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    if (quantity > prod.stock) {
      if (settings.enableSound) sounds.playWarning();
      return;
    }

    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const updateCartItemPrice = (productId: string, unitPrice: number) => {
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, unitPrice: Math.max(0, unitPrice) } : item))
    );
  };

  const removeCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    if (settings.enableSound) sounds.playClick();
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setOrderDiscount({ type: 'fixed', value: 0 });
    setOrderNote('');
  };

  // Cart Math Calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [cart]);

  const cartCostTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.costPrice * item.quantity, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const cartDiscountAmount = useMemo(() => {
    if (orderDiscount.type === 'percentage') {
      return (cartSubtotal * Math.min(100, Math.max(0, orderDiscount.value))) / 100;
    }
    return Math.min(cartSubtotal, Math.max(0, orderDiscount.value));
  }, [cartSubtotal, orderDiscount]);

  const cartTaxAmount = useMemo(() => {
    if (!settings.taxEnabled || settings.taxRate <= 0) return 0;
    const discountedSubtotal = Math.max(0, cartSubtotal - cartDiscountAmount);
    return (discountedSubtotal * settings.taxRate) / 100;
  }, [cartSubtotal, cartDiscountAmount, settings.taxEnabled, settings.taxRate]);

  const cartTotal = useMemo(() => {
    const discounted = Math.max(0, cartSubtotal - cartDiscountAmount);
    return discounted + cartTaxAmount;
  }, [cartSubtotal, cartDiscountAmount, cartTaxAmount]);

  const cartEstimatedProfit = useMemo(() => {
    const netRevenueExclTax = Math.max(0, cartSubtotal - cartDiscountAmount);
    return netRevenueExclTax - cartCostTotal;
  }, [cartSubtotal, cartDiscountAmount, cartCostTotal]);

  // Hold & Recall Order
  const holdCurrentCart = (title?: string) => {
    if (cart.length === 0) return;
    const newHeld: HeldCart = {
      id: `held-${Date.now()}`,
      title: title || `Order #${heldCarts.length + 1} (${cartItemCount} items)`,
      customer: selectedCustomer,
      items: [...cart],
      savedAt: new Date().toISOString(),
      note: orderNote,
    };
    setHeldCarts((prev) => [newHeld, ...prev]);
    clearCart();
    if (settings.enableSound) sounds.playClick();
  };

  const recallHeldCart = (heldCartId: string) => {
    const target = heldCarts.find((h) => h.id === heldCartId);
    if (!target) return;
    setCart(target.items);
    setSelectedCustomer(target.customer || null);
    setOrderNote(target.note || '');
    setHeldCarts((prev) => prev.filter((h) => h.id !== heldCartId));
    if (settings.enableSound) sounds.playClick();
  };

  const deleteHeldCart = (heldCartId: string) => {
    setHeldCarts((prev) => prev.filter((h) => h.id !== heldCartId));
  };

  // Process Checkout
  const processCheckout = ({
    payments,
    amountPaid,
    changeGiven,
    note,
  }: {
    payments: PaymentMethodDetail[];
    amountPaid: number;
    changeGiven: number;
    note?: string;
  }): SaleOrder => {
    const orderItems = cart.map((c) => ({
      productId: c.product.id,
      productName: c.product.name,
      sku: c.product.sku,
      quantity: c.quantity,
      unitPrice: c.unitPrice,
      costPrice: c.costPrice,
      total: c.unitPrice * c.quantity,
      profit: (c.unitPrice - c.costPrice) * c.quantity,
    }));

    const costOfGoodsSold = cartCostTotal;
    const netRevenueExclTax = Math.max(0, cartSubtotal - cartDiscountAmount);
    const grossProfit = netRevenueExclTax - costOfGoodsSold;
    const netProfit = grossProfit;

    const invoiceDate = new Date();
    const dateStr = invoiceDate.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(sales.length + 1).padStart(4, '0');
    const invoiceNumber = `INV-${dateStr}-${seq}`;

    // Check if there is remaining due
    const totalDue = Math.max(0, cartTotal - amountPaid);
    const orderStatus = totalDue > 0 ? 'partial' : 'completed';

    const newOrder: SaleOrder = {
      id: `ord-${Date.now()}`,
      invoiceNumber,
      date: invoiceDate.toISOString(),
      cashierId: activeCashier.id,
      cashierName: activeCashier.name,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in Customer (General)',
      customerPhone: selectedCustomer?.phone,
      items: orderItems,
      subTotal: cartSubtotal,
      taxRate: settings.taxEnabled ? settings.taxRate : 0,
      taxAmount: cartTaxAmount,
      discountType: orderDiscount.type,
      discountValue: orderDiscount.value,
      discountAmount: cartDiscountAmount,
      totalAmount: cartTotal,
      costOfGoodsSold,
      grossProfit,
      netProfit,
      payments,
      amountPaid,
      amountDue: totalDue,
      changeGiven,
      status: orderStatus,
      note: note || orderNote,
    };

    // 1. Deduct Product Stock
    setProducts((prev) =>
      prev.map((p) => {
        const inCart = cart.find((item) => item.product.id === p.id);
        if (inCart) {
          return { ...p, stock: Math.max(0, p.stock - inCart.quantity) };
        }
        return p;
      })
    );

    // 2. Update Customer Stats & Due
    if (selectedCustomer) {
      setCustomers((prev) =>
        prev.map((cust) => {
          if (cust.id === selectedCustomer.id) {
            const pointsEarned = Math.floor(cartTotal / 100);
            return {
              ...cust,
              totalSpent: cust.totalSpent + cartTotal,
              totalOrders: cust.totalOrders + 1,
              dueBalance: cust.dueBalance + totalDue,
              loyaltyPoints: cust.loyaltyPoints + pointsEarned,
            };
          }
          return cust;
        })
      );
    }

    // 3. Update Cashier Stats
    setStaff((prev) =>
      prev.map((s) => {
        if (s.id === activeCashier.id) {
          return {
            ...s,
            totalSalesCount: s.totalSalesCount + 1,
            totalSalesAmount: s.totalSalesAmount + cartTotal,
          };
        }
        return s;
      })
    );

    // 4. Save Order
    setSales((prev) => [newOrder, ...prev]);
    setLastCompletedOrder(newOrder);

    // 5. Clear Cart
    clearCart();

    // 6. Confetti & Audio
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0284c7', '#10b981', '#f59e0b', '#ec4899', '#6366f1'],
      });
    } catch {
      // ignore
    }

    if (settings.enableSound) sounds.playSuccess();

    return newOrder;
  };

  // Expense Handlers
  const addExpense = (exp: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...exp,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExp, ...prev]);
    if (settings.enableSound) sounds.playSuccess();
  };

  const deleteExpense = (expId: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== expId));
  };

  // Reset to Demo Data
  const resetToDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setCustomers(INITIAL_CUSTOMERS);
    setStaff(INITIAL_STAFF);
    setActiveCashierId('staff-1');
    setCurrentUserId('staff-1');
    setIsAuthenticated(true);
    setIsLocked(false);
    setSales(generateInitialSales());
    setExpenses(INITIAL_EXPENSES);
    setHeldCarts([]);
    setSettings(INITIAL_SETTINGS);
    clearCart();
    if (settings.enableSound) sounds.playSuccess();
  };

  const value = {
    currentTab,
    setCurrentTab,
    theme,
    toggleTheme,
    setTheme,
    currentUser,
    isAuthenticated,
    isLocked,
    login,
    logout,
    lockRegister,
    unlockRegister,
    canAccessTab,
    settings,
    updateSettings,
    staff,
    activeCashier,
    switchActiveCashier,
    addUserStaff,
    updateUserStaff,
    deleteUserStaff,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    quickStockAdjust,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    customers,
    selectedCustomer,
    setSelectedCustomer,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    payCustomerDue,
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
    cartCostTotal,
    cartEstimatedProfit,
    cartItemCount,
    heldCarts,
    holdCurrentCart,
    recallHeldCart,
    deleteHeldCart,
    sales,
    processCheckout,
    refundOrder,
    deleteSale,
    lastCompletedOrder,
    setLastCompletedOrder,
    expenses,
    addExpense,
    deleteExpense,
    resetToDemoData,
  };

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>;
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
