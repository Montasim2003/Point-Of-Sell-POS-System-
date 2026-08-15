export type ThemeMode = 'light' | 'dark';

export type NavTab = 
  | 'dashboard'
  | 'billing'
  | 'users'
  | 'customers'
  | 'stock'
  | 'categories'
  | 'sales-report'
  | 'profit-loss'
  | 'expenses'
  | 'settings';

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  costPrice: number; // Buy Price for Profit calculation
  sellingPrice: number; // Retail Selling Price
  stock: number;
  minStockAlert: number; // Low stock threshold
  unit: string; // pcs, kg, box, ltr
  image?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  iconName: string;
  description?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalSpent: number;
  totalOrders: number;
  dueBalance: number; // Pending credit
  loyaltyPoints: number;
  createdAt: string;
}

export interface UserStaff {
  id: string;
  name: string;
  role: 'admin' | 'manager' | 'cashier';
  pin: string;
  phone?: string;
  email?: string;
  avatarColor: string;
  isActive: boolean;
  totalSalesCount: number;
  totalSalesAmount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number; // Allows override or discounted price
  costPrice: number;
  discount: number; // per item discount amount
  note?: string;
}

export interface PaymentMethodDetail {
  method: 'cash' | 'card' | 'bkash' | 'nagad' | 'rocket' | 'bank_transfer' | 'due';
  amount: number;
  reference?: string;
}

export interface SaleOrder {
  id: string;
  invoiceNumber: string;
  date: string; // ISO string
  cashierId: string;
  cashierName: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  items: {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    costPrice: number;
    total: number;
    profit: number; // (unitPrice - costPrice) * quantity
  }[];
  subTotal: number;
  taxRate: number; // e.g. 5 for 5%
  taxAmount: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  totalAmount: number;
  costOfGoodsSold: number; // Sum of cost prices * qty
  grossProfit: number; // totalAmount (excluding tax) - costOfGoodsSold
  netProfit: number;
  payments: PaymentMethodDetail[];
  amountPaid: number;
  amountDue: number;
  changeGiven: number;
  status: 'completed' | 'refunded' | 'partial';
  note?: string;
}

export interface HeldCart {
  id: string;
  title: string;
  customer?: Customer | null;
  items: CartItem[];
  savedAt: string;
  note?: string;
}

export interface Expense {
  id: string;
  category: 'Rent' | 'Electricity & Utility' | 'Staff Salary' | 'Packaging & Supplies' | 'Marketing' | 'Maintenance' | 'Transport' | 'Misc';
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  recordedBy: string;
}

export interface StoreSettings {
  storeName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  currencySymbol: string; // e.g. "৳" or "$"
  currencyCode: string; // "BDT" or "USD"
  taxRate: number; // percentage
  taxEnabled: boolean;
  invoiceFooterNote: string;
  showLogoOnReceipt: boolean;
  receiptType: 'thermal' | 'a4';
  enableSound: boolean;
  lowStockThresholdDefault: number;
}
