import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Lock, KeyRound, ArrowRight, ShieldCheck, AlertCircle, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const LockScreen: React.FC = () => {
  const { currentUser, unlockRegister, logout, settings } = usePOS();
  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleKeypadPress = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMessage('');
      if (nextPin.length === 4) {
        attemptUnlock(nextPin);
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

  const attemptUnlock = (enteredPin: string) => {
    const success = unlockRegister(enteredPin);
    if (!success) {
      setErrorMessage('Incorrect PIN. Please enter your valid 4-digit PIN.');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-center flex flex-col items-center">
        
        {/* Lock Badge */}
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
            <Lock className="w-8 h-8" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Terminal Locked</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
          Session locked for <strong className="text-slate-800 dark:text-slate-200">{currentUser?.name}</strong> ({currentUser?.role})
        </p>

        {/* PIN Dots */}
        <div className="flex justify-center items-center gap-3 my-2 py-3 px-6 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner w-full max-w-xs">
          {[0, 1, 2, 3].map((idx) => {
            const filled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  filled
                    ? 'bg-amber-500 scale-125 shadow-md shadow-amber-500/50'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            );
          })}
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 mb-2 p-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs flex items-center gap-2 max-w-xs"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-xs my-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeypadPress(num)}
              className="h-12 rounded-2xl bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 font-bold text-lg shadow-sm border border-slate-200 dark:border-slate-700 transition flex items-center justify-center cursor-pointer"
            >
              {num}
            </button>
          ))}

          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs transition flex items-center justify-center cursor-pointer"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={() => handleKeypadPress('0')}
            className="h-12 rounded-2xl bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 font-bold text-lg shadow-sm border border-slate-200 dark:border-slate-700 transition flex items-center justify-center cursor-pointer"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm transition flex items-center justify-center cursor-pointer"
          >
            ⌫
          </button>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between w-full pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-red-600 dark:text-red-400 hover:underline font-medium"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out & Switch
          </button>

          <button
            onClick={() => attemptUnlock(pin || currentUser?.pin || '1234')}
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            Unlock Register <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
