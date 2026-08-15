import React from 'react';
import {
  CreditCard,
  Users,
  UserCheck,
  Package,
  Layers,
  FileText,
  TrendingUp,
  Receipt,
  Settings,
  Store,
  Sparkles,
  LayoutDashboard,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { NavTab } from '../types/pos';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { currentTab, setCurrentTab, activeCashier, products } = usePOS();

  const lowStockCount = products.filter((p) => p.stock <= p.minStockAlert).length;

  const navItems: { id: NavTab; label: string; icon: React.FC<any>; badge?: string | number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'users', label: 'User Management', icon: UserCheck },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'stock', label: 'Stock', icon: Package, badge: lowStockCount > 0 ? lowStockCount : undefined },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'sales-report', label: 'Sales Report', icon: FileText },
    { id: 'profit-loss', label: 'Profit/Loss', icon: TrendingUp },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelect = (tab: NavTab) => {
    setCurrentTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          id="sidebar-mobile-backdrop"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        id="app-main-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-lg tracking-tight text-white">ProPOS</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                v4.2
              </span>
            </div>
            <p className="text-xs text-slate-400">Retail & Inventory Suite</p>
          </div>
        </div>

        {/* Navigation list matching the Sleek Interface theme */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Main Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                      isActive
                        ? 'bg-white text-blue-700'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Cashier & Credit Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div
            id="active-cashier-card"
            className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-full bg-gradient-to-tr ${activeCashier.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs`}
              >
                {activeCashier.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{activeCashier.name}</p>
                <p className="text-[10px] text-sky-400 capitalize flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {activeCashier.role} on shift
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentTab('users')}
              title="Switch Cashier"
              className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-700/50 hover:bg-slate-700"
            >
              Switch
            </button>
          </div>

          <div className="mt-2 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-400" />
            <span>Smart POS v2.6 Pro</span>
          </div>
        </div>
      </aside>
    </>
  );
};
