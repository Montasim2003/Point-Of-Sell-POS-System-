import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Shield, KeyRound, UserCheck, Store, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const LoginScreen: React.FC = () => {
  const { staff, login, settings } = usePOS();
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staff[0]?.id || 'staff-1');
  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const selectedUser = staff.find((s) => s.id === selectedStaffId) || staff[0];

  const handleKeypadPress = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMessage('');
      if (nextPin.length === 4) {
        attemptLogin(selectedStaffId, nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handleClear = () => {
    setPin('');
    setErrorMessage('');
  };

  const attemptLogin = (staffId: string, enteredPin: string) => {
    const res = login(staffId, enteredPin);
    if (!res.success) {
      setErrorMessage(res.message || 'Incorrect PIN. Try PIN: 1234 or user PIN.');
      setPin('');
    }
  };

  const handleQuickDemoLogin = (staffId: string, defaultPin: string) => {
    setSelectedStaffId(staffId);
    setPin(defaultPin);
    const res = login(staffId, defaultPin);
    if (!res.success) {
      setErrorMessage(res.message || 'Login failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row my-auto">
        
        {/* Left Side: Store Brand & Staff Picker */}
        <div className="md:w-5/12 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-6 md:p-8 text-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">{settings.storeName}</h1>
                <p className="text-xs text-slate-400">Enterprise Point of Sale Terminal</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-400" /> Select Staff Profile
              </p>
              <div className="space-y-2">
                {staff.map((user) => {
                  const isSelected = selectedStaffId === user.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        setSelectedStaffId(user.id);
                        setPin('');
                        setErrorMessage('');
                      }}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between border ${
                        isSelected
                          ? 'bg-blue-600/30 border-blue-500 text-white shadow-md'
                          : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${user.avatarColor || 'from-blue-600 to-indigo-600'} flex items-center justify-center text-white font-bold text-sm shadow`}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white leading-tight">{user.name}</p>
                          <span className="inline-block px-1.5 py-0.5 mt-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-slate-900/60 text-blue-300">
                            {user.role}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80">
            <p className="text-xs text-slate-400 mb-2">⚡ Quick 1-Click Demo Login:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleQuickDemoLogin('staff-1', '1234')}
                className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-blue-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 transition flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-400" /> Admin (1234)
              </button>
              <button
                onClick={() => handleQuickDemoLogin('staff-2', '0000')}
                className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-emerald-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 transition flex items-center gap-1"
              >
                Cashier (0000)
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Security PIN Keypad */}
        <div className="md:w-7/12 p-6 md:p-8 flex flex-col justify-between bg-slate-50 dark:bg-slate-900">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Staff PIN Authentication
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter 4-digit PIN for <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedUser?.name}</span> ({selectedUser?.role})
                </p>
              </div>
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Shield className="w-5 h-5" />
              </div>
            </div>

            {/* PIN Dots Indicator */}
            <div className="flex justify-center items-center gap-3 my-4 py-3 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner">
              {[0, 1, 2, 3].map((idx) => {
                const filled = pin.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      filled
                        ? 'bg-blue-600 scale-110 shadow-md shadow-blue-500/40'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                );
              })}
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-4 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Digital Keypad */}
            <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadPress(num)}
                  className="h-13 rounded-2xl bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 font-bold text-xl shadow-sm border border-slate-200 dark:border-slate-700 transition flex items-center justify-center cursor-pointer"
                >
                  {num}
                </button>
              ))}

              <button
                type="button"
                onClick={handleClear}
                className="h-13 rounded-2xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs transition flex items-center justify-center cursor-pointer"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="h-13 rounded-2xl bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 font-bold text-xl shadow-sm border border-slate-200 dark:border-slate-700 transition flex items-center justify-center cursor-pointer"
              >
                0
              </button>

              <button
                type="button"
                onClick={handleBackspace}
                className="h-13 rounded-2xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm transition flex items-center justify-center cursor-pointer"
              >
                ⌫
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 text-center border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Default Demo PIN: <strong className="text-slate-700 dark:text-slate-300">1234</strong></span>
            <button
              onClick={() => attemptLogin(selectedStaffId, pin || selectedUser?.pin || '1234')}
              className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Sign In <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
