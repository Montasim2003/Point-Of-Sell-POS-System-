import React, { useEffect, useState } from 'react';
import {
  Bell,
  Clock,
  Lock,
  LogOut,
  Menu,
  Moon,
  PauseCircle,
  RotateCcw,
  Sun,
  User,
  Volume2,
  VolumeX,
  ShieldCheck,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';

interface HeaderProps {
  setMobileOpen: (open: boolean) => void;
  onOpenHeldModal: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ setMobileOpen, onOpenHeldModal, onOpenSettings }) => {
  const {
    theme,
    toggleTheme,
    settings,
    updateSettings,
    heldCarts,
    activeCashier,
    currentUser,
    lockRegister,
    logout,
    resetToDemoData,
    products,
    setCurrentTab,
  } = usePOS();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const lowStockItems = products.filter((p) => p.stock <= p.minStockAlert);

  return (
    <header id="app-top-header" className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 z-30">
      <div className="px-4 py-2.5 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left Side: Mobile Menu button + Title & Live Date/Time info */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            id="mobile-sidebar-toggle-btn"
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Title & Live Date/Time matching Sleek theme */}
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ProPOS</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/80">
                v4.2
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
              <span>{currentTime}</span>
              <span>•</span>
              <span className="text-slate-700 dark:text-slate-200 font-medium">{settings.storeName}</span>
            </p>
          </div>
        </div>

        {/* Right Side: Quick info, time, held orders, sound, theme toggle, lock, user profile */}
        <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto">
          {/* Clock */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>{currentTime}</span>
          </div>

          {/* Held Carts Badge */}
          {heldCarts.length > 0 && (
            <button
              id="held-orders-header-badge"
              onClick={onOpenHeldModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 transition-colors animate-pulse"
              title="View Paused / Held Orders"
            >
              <PauseCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>{heldCarts.length} Held</span>
            </button>
          )}

          {/* Low stock notice if any */}
          {lowStockItems.length > 0 && (
            <button
              onClick={() => setCurrentTab('stock')}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition"
              title="View low inventory items"
            >
              <Bell className="w-3.5 h-3.5 text-rose-500" />
              <span>{lowStockItems.length} Low Stock</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            id="sound-toggle-btn"
            onClick={() => updateSettings({ enableSound: !settings.enableSound })}
            className={`p-2 rounded-xl text-xs transition-colors border ${
              settings.enableSound
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 border-rose-200 dark:border-rose-800'
            }`}
            title={settings.enableSound ? 'Audio FX Enabled' : 'Audio FX Muted'}
          >
            {settings.enableSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Light / Dark Mode Switcher */}
          <button
            id="theme-mode-toggle-btn"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-xs cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            )}
          </button>

          {/* Lock Register Button */}
          <button
            id="lock-register-btn"
            onClick={lockRegister}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-700 hover:border-amber-300 text-xs font-medium transition cursor-pointer"
            title="Lock Register Screen"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lock</span>
          </button>

          {/* Active Cashier Pill & Quick Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition cursor-pointer"
            >
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${activeCashier.avatarColor || 'from-blue-600 to-indigo-600'} flex items-center justify-center text-white text-xs font-bold shadow-xs`}>
                {activeCashier.name.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">{activeCashier.name.split(' ')[0]}</p>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-semibold">{activeCashier.role}</span>
              </div>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{activeCashier.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{activeCashier.email}</p>
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] uppercase font-bold">
                    {activeCashier.role}
                  </span>
                </div>

                <div className="py-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setCurrentTab('users');
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <User className="w-4 h-4 text-blue-500" />
                    <span>Manage Staff & Users</span>
                  </button>

                  <button
                    onClick={() => {
                      lockRegister();
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Lock Register</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('Reset all demo products, categories, sales and expenses back to initial clean state?')) {
                        resetToDemoData();
                      }
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <RotateCcw className="w-4 h-4 text-purple-500" />
                    <span>Reset Demo Data</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition border-t border-slate-100 dark:border-slate-800 mt-1 pt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
