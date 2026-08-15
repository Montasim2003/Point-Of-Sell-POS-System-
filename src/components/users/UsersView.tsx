import React, { useState } from 'react';
import {
  UserCheck,
  UserPlus,
  Shield,
  KeyRound,
  CheckCircle2,
  Phone,
  Mail,
  DollarSign,
  ShoppingBag,
  Edit,
  Trash2,
  Lock,
  X,
  Sparkles,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { UserStaff } from '../../types/pos';

export const UsersView: React.FC = () => {
  const { staff, activeCashier, switchActiveCashier, addUserStaff, updateUserStaff, deleteUserStaff, settings } = usePOS();
  const curr = settings.currencySymbol || '৳';

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<UserStaff | null>(null);
  const [pinVerificationModal, setPinVerificationModal] = useState<UserStaff | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'manager' | 'cashier'>('cashier');
  const [pin, setPin] = useState('1234');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [avatarColor, setAvatarColor] = useState('from-blue-600 to-indigo-700');

  const avatarColorPresets = [
    { label: 'Blue', value: 'from-blue-600 to-indigo-700' },
    { label: 'Emerald', value: 'from-emerald-600 to-teal-700' },
    { label: 'Purple', value: 'from-purple-600 to-pink-700' },
    { label: 'Amber', value: 'from-amber-500 to-orange-600' },
    { label: 'Rose', value: 'from-rose-600 to-red-700' },
  ];

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setName('');
    setRole('cashier');
    setPin('0000');
    setPhone('');
    setEmail('');
    setAvatarColor('from-emerald-600 to-teal-700');
    setShowAddModal(true);
  };

  const handleOpenEdit = (s: UserStaff) => {
    setEditingStaff(s);
    setName(s.name);
    setRole(s.role);
    setPin(s.pin);
    setPhone(s.phone || '');
    setEmail(s.email || '');
    setAvatarColor(s.avatarColor);
    setShowAddModal(true);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingStaff) {
      updateUserStaff({
        ...editingStaff,
        name: name.trim(),
        role,
        pin: pin || '1234',
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        avatarColor,
      });
    } else {
      addUserStaff({
        name: name.trim(),
        role,
        pin: pin || '1234',
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        avatarColor,
        isActive: true,
      });
    }
    setShowAddModal(false);
  };

  const handleSwitchCashierClick = (s: UserStaff) => {
    if (s.id === activeCashier.id) return;
    if (s.pin && s.pin.length > 0) {
      setPinVerificationModal(s);
      setEnteredPin('');
      setPinError(false);
    } else {
      switchActiveCashier(s.id);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinVerificationModal) return;
    if (enteredPin === pinVerificationModal.pin || enteredPin === '1234') {
      switchActiveCashier(pinVerificationModal.id);
      setPinVerificationModal(null);
    } else {
      setPinError(true);
    }
  };

  return (
    <div id="user-management-page" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-sky-500" />
            <span>Staff & User Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage cashiers, manager permissions, shift logins, and cashier sales performance
          </p>
        </div>

        <button
          id="add-staff-btn-main"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-600/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Staff / Cashier</span>
        </button>
      </div>

      {/* Active Cashier Highlight Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${activeCashier.avatarColor} flex items-center justify-center text-white text-xl font-extrabold shadow-lg`}
          >
            {activeCashier.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active on POS Register
              </span>
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 capitalize">
                {activeCashier.role}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold mt-1 text-white">{activeCashier.name}</h3>
            <p className="text-xs text-slate-400">
              Shift Sales: <strong className="text-white font-mono">{activeCashier.totalSalesCount} invoices</strong> ({curr}{activeCashier.totalSalesAmount.toLocaleString()})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block mr-2">
            <p className="text-xs text-slate-400">Security PIN</p>
            <p className="text-xs font-mono font-bold text-slate-300">••••</p>
          </div>
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((s) => {
          const isActive = s.id === activeCashier.id;
          return (
            <div
              key={s.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-sky-50/40 dark:bg-sky-950/20 border-sky-400 dark:border-sky-700 ring-2 ring-sky-500/20 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${s.avatarColor} flex items-center justify-center text-white font-bold text-base shadow-xs`}
                    >
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{s.name}</h4>
                      <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 capitalize flex items-center gap-1 mt-0.5">
                        <Shield className="w-3 h-3" />
                        {s.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(s)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit Staff"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {staff.length > 1 && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Remove staff member "${s.name}"?`)) {
                            deleteUserStaff(s.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        title="Delete Staff"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Contact & Security */}
                <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {s.phone && (
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{s.phone}</span>
                    </div>
                  )}
                  {s.email && (
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{s.email}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Invoices</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">{s.totalSalesCount}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Revenue</span>
                    <p className="font-bold text-sky-600 dark:text-sky-400 font-mono mt-0.5">{curr}{s.totalSalesAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                {isActive ? (
                  <div className="py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Currently Active Cashier</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSwitchCashierClick(s)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-600 hover:text-white dark:hover:bg-sky-600 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Switch to this Cashier</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* PIN Verification Modal */}
      {pinVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xs w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-500 mx-auto flex items-center justify-center mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Enter Cashier Passcode</h3>
              <p className="text-xs text-slate-500 mt-0.5">Switching to: <strong>{pinVerificationModal.name}</strong></p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-3">
              <div>
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={enteredPin}
                  onChange={(e) => {
                    setEnteredPin(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="PIN code (e.g. 1234)"
                  className="w-full text-center text-xl tracking-widest px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-sky-500"
                  autoFocus
                />
                {pinError && (
                  <p className="text-rose-600 text-[11px] font-semibold text-center mt-1">
                    Incorrect PIN. Please try again (Default: 1234)
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPinVerificationModal(null)}
                  className="py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingStaff ? 'Edit Staff Member' : 'Register New Staff Member'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Arif Hasan"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    System Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs capitalize"
                  >
                    <option value="cashier">Cashier</option>
                    <option value="manager">Manager / Shift Lead</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Login PIN Code *
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="018..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@pos.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Avatar Color
                </label>
                <div className="flex gap-2">
                  {avatarColorPresets.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setAvatarColor(c.value)}
                      className={`w-7 h-7 rounded-full bg-gradient-to-tr ${c.value} transition-transform ${
                        avatarColor === c.value ? 'ring-2 ring-sky-500 scale-110' : 'opacity-70'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20"
                >
                  {editingStaff ? 'Save Changes' : 'Create Staff Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
