import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import CategoryIcon from '../CategoryIcon';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Plus, 
  Trash2, 
  CreditCard, 
  Zap, 
  Wifi, 
  Droplet, 
  Users, 
  ShieldCheck, 
  X 
} from 'lucide-react';

export const BillManager = () => {
  const { data, markBillAsPaid, addBill, deleteBill } = useBudget();
  const currency = data.currency;

  const [activeFilter, setActiveFilter] = useState('pending'); // 'pending' | 'paid' | 'all'
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [payingBillId, setPayingBillId] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('UPI (GPay / PhonePe / Paytm)');

  // New bill form state
  const [newBill, setNewBill] = useState({
    title: '',
    biller: '',
    category: 'electricity',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    frequency: 'Monthly',
    icon: 'Zap'
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const getBillStatus = (bill) => {
    if (bill.isPaid) {
      return { label: 'Paid', type: 'paid', badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' };
    }
    const today = new Date(todayStr);
    const due = new Date(bill.dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { 
        label: `Overdue by ${Math.abs(diffDays)}d`, 
        type: 'overdue', 
        badge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 animate-pulse' 
      };
    } else if (diffDays === 0) {
      return { 
        label: 'Due Today', 
        type: 'today', 
        badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 font-bold' 
      };
    } else if (diffDays <= 3) {
      return { 
        label: `Due in ${diffDays}d`, 
        type: 'urgent', 
        badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' 
      };
    } else {
      return { 
        label: `Due in ${diffDays}d`, 
        type: 'normal', 
        badge: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700' 
      };
    }
  };

  const handlePayConfirm = () => {
    if (payingBillId) {
      markBillAsPaid(payingBillId, selectedPaymentMethod);
      setPayingBillId(null);
    }
  };

  const handleCreateBill = (e) => {
    e.preventDefault();
    if (!newBill.title || !newBill.amount) return;

    addBill({
      ...newBill,
      amount: parseFloat(newBill.amount)
    });

    setNewBill({
      title: '',
      biller: '',
      category: 'electricity',
      amount: '',
      dueDate: new Date().toISOString().split('T')[0],
      frequency: 'Monthly',
      icon: 'Zap'
    });
    setIsAddBillOpen(false);
  };

  // Filter bills
  const filteredBills = data.bills.filter(b => {
    if (activeFilter === 'pending') return !b.isPaid;
    if (activeFilter === 'paid') return b.isPaid;
    return true;
  });

  const totalPendingAmount = data.bills.filter(b => !b.isPaid).reduce((sum, b) => sum + (b.amount || 0), 0);
  const totalPaidAmount = data.bills.filter(b => b.isPaid).reduce((sum, b) => sum + (b.amount || 0), 0);
  const pendingCount = data.bills.filter(b => !b.isPaid).length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-amber-500/30 text-amber-300 border border-amber-500/40">
              Household Utilities & Subscriptions
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Smart Bill Due-Date Manager
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Never miss an electricity, broadband, piped gas, or staff salary payment. Automated 1-click expense logging upon payment.
          </p>
        </div>

        <button
          onClick={() => setIsAddBillOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition transform active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add Recurring Bill</span>
        </button>
      </div>

      {/* Metric Summary Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Upcoming Due Outflow</p>
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
              {currency}{totalPendingAmount.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">{pendingCount} bill(s) to settle</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Paid Settled Bills</p>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {currency}{totalPaidAmount.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Cleared this cycle</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Household Commitments</p>
            <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
              {currency}{(totalPendingAmount + totalPaidAmount).toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">{data.bills.length} total active billers</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveFilter('pending')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
            activeFilter === 'pending'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Pending / Due ({data.bills.filter(b => !b.isPaid).length})
        </button>
        <button
          onClick={() => setActiveFilter('paid')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
            activeFilter === 'paid'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Settled / Paid ({data.bills.filter(b => b.isPaid).length})
        </button>
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
            activeFilter === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Bills ({data.bills.length})
        </button>
      </div>

      {/* Bills List / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBills.map((bill) => {
          const status = getBillStatus(bill);
          const cat = data.categories.find(c => c.id === bill.category) || {};

          return (
            <div
              key={bill.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200">
                      <CategoryIcon name={bill.icon || cat.icon || 'Zap'} className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                        {bill.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">{bill.biller || cat.name}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${status.badge}`}>
                    {status.label}
                  </span>
                </div>

                {/* Amount & Due Date */}
                <div className="mt-4 flex items-baseline justify-between pt-3 border-t border-slate-100 dark:border-slate-800/60">
                  <div>
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {currency}{bill.amount.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-1.5">({bill.frequency || 'Monthly'})</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 justify-end">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Due: {bill.dueDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => deleteBill(bill.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                  title="Remove Bill"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {!bill.isPaid ? (
                  <button
                    onClick={() => setPayingBillId(bill.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Pay & Record Expense</span>
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Paid on {bill.paidOn || 'Current Month'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Confirm Payment & Select Mode */}
      {payingBillId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Confirm Bill Payment
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Select payment method used. This will automatically record an expense entry in your transaction statement.
            </p>

            <div className="space-y-3 mb-5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Payment Channel:
              </label>
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="UPI (GPay / PhonePe / Paytm)">UPI (GPay / PhonePe / Paytm)</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setPayingBillId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePayConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition"
              >
                Mark as Settled
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Recurring Bill */}
      {isAddBillOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Add New Household Bill
              </h3>
              <button
                onClick={() => setIsAddBillOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBill} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Bill Title (e.g. Electricity, Water, Broadband)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. State Electricity Board (BESCOM)"
                  value={newBill.title}
                  onChange={(e) => setNewBill({ ...newBill, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Amount ({currency})
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="2500"
                    value={newBill.amount}
                    onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newBill.dueDate}
                    onChange={(e) => setNewBill({ ...newBill, dueDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Category
                </label>
                <select
                  value={newBill.category}
                  onChange={(e) => setNewBill({ ...newBill, category: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {data.categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddBillOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition"
                >
                  Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default BillManager;
