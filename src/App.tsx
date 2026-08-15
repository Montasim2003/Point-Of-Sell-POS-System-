import React, { useState } from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { BillingView } from './components/billing/BillingView';
import { StockView } from './components/stock/StockView';
import { CategoriesView } from './components/categories/CategoriesView';
import { CustomersView } from './components/customers/CustomersView';
import { SalesReportView } from './components/reports/SalesReportView';
import { ProfitLossView } from './components/profitloss/ProfitLossView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { UsersView } from './components/users/UsersView';
import { SettingsModal } from './components/settings/SettingsModal';
import { HeldOrdersModal } from './components/billing/HeldOrdersModal';
import { LoginScreen } from './components/auth/LoginScreen';
import { LockScreen } from './components/auth/LockScreen';

const POSMainApp: React.FC = () => {
  const { currentTab, isAuthenticated, isLocked } = usePOS();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHeldModal, setShowHeldModal] = useState(false);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  if (isLocked) {
    return <LockScreen />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased select-none">

      {/* Navigation Sidebar */}
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <Header
          setMobileOpen={setMobileSidebarOpen}
          onOpenHeldModal={() => setShowHeldModal(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
        />

        {/* Dynamic Workspace View */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
          {currentTab === 'dashboard' && <DashboardView />}
          {currentTab === 'billing' && <BillingView />}
          {currentTab === 'stock' && <StockView />}
          {currentTab === 'categories' && <CategoriesView />}
          {currentTab === 'customers' && <CustomersView />}
          {currentTab === 'sales-report' && <SalesReportView />}
          {currentTab === 'profit-loss' && <ProfitLossView />}
          {currentTab === 'expenses' && <ExpensesView />}
          {currentTab === 'users' && <UsersView />}
          {currentTab === 'settings' && <SettingsModal onClose={() => {}} isTabMode={true} />}
        </main>
      </div>

      {/* Held Orders Modal */}
      {showHeldModal && <HeldOrdersModal onClose={() => setShowHeldModal(false)} />}

      {/* Settings Modal (Global) */}
      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <POSProvider>
      <POSMainApp />
    </POSProvider>
  );
}
