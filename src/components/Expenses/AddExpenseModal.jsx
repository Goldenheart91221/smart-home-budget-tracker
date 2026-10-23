import React, { useState, useEffect } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { QUICK_ADD_TEMPLATES, QUICK_INCOME_TEMPLATES, PAYMENT_METHODS, INCOME_CATEGORIES } from '../../types/defaultData';
import CategoryIcon from '../CategoryIcon';
import { X, Plus, Check, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';

export const AddExpenseModal = () => {
  const { 
    isAddModalOpen, 
    setIsAddModalOpen, 
    addModalType,
    setAddModalType,
    editingTransaction, 
    setEditingTransaction, 
    addTransaction, 
    editTransaction, 
    data 
  } = useBudget();

  const currency = data.currency;

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: 'groceries',
    memberId: 'm1',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI (GPay / PhonePe / Paytm)',
    notes: ''
  });

  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    setValidationError('');
    if (editingTransaction) {
      setFormData({
        title: editingTransaction.title || '',
        amount: editingTransaction.amount?.toString() || '',
        type: editingTransaction.type || 'expense',
        category: editingTransaction.category || (editingTransaction.type === 'income' ? 'Salary' : 'groceries'),
        memberId: editingTransaction.memberId || 'm1',
        date: editingTransaction.date || new Date().toISOString().split('T')[0],
        paymentMethod: editingTransaction.paymentMethod || (editingTransaction.type === 'income' ? 'Direct Bank Transfer / NEFT' : 'UPI (GPay / PhonePe / Paytm)'),
        notes: editingTransaction.notes || ''
      });
    } else {
      const initialType = addModalType || 'expense';
      setFormData({
        title: '',
        amount: '',
        type: initialType,
        category: initialType === 'income' ? 'Salary' : (data.categories[0]?.id || 'groceries'),
        memberId: 'm1',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: initialType === 'income' ? 'Direct Bank Transfer / NEFT' : 'UPI (GPay / PhonePe / Paytm)',
        notes: ''
      });
    }
  }, [editingTransaction, isAddModalOpen, addModalType, data.categories]);

  if (!isAddModalOpen) return null;

  const isIncome = formData.type === 'income';

  const handleTypeChange = (newType) => {
    setValidationError('');
    if (newType === 'income') {
      setFormData(prev => ({
        ...prev,
        type: 'income',
        category: 'Salary',
        paymentMethod: prev.paymentMethod || 'Direct Bank Transfer / NEFT'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        type: 'expense',
        category: data.categories[0]?.id || 'groceries',
        paymentMethod: prev.paymentMethod || 'UPI (GPay / PhonePe / Paytm)'
      }));
    }
    if (setAddModalType) setAddModalType(newType);
  };

  const handleQuickAdd = (template) => {
    setValidationError('');
    setFormData(prev => ({
      ...prev,
      title: template.title,
      amount: template.amount.toString(),
      category: template.category,
      type: template.type
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    // Strict validation
    const trimmedTitle = formData.title.trim();
    if (!trimmedTitle) {
      setValidationError(isIncome ? 'Please enter the income source/title.' : 'Please enter an expense title.');
      return;
    }

    const parsedAmount = parseFloat(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setValidationError('Please enter a valid amount greater than ₹0.');
      return;
    }

    if (!formData.date) {
      setValidationError('Please select a valid date.');
      return;
    }

    try {
      if (editingTransaction) {
        editTransaction(editingTransaction.id, {
          ...formData,
          title: trimmedTitle,
          amount: parsedAmount
        });
      } else {
        addTransaction({
          ...formData,
          title: trimmedTitle,
          amount: parsedAmount
        });
      }

      setIsAddModalOpen(false);
      setEditingTransaction(null);
    } catch (err) {
      setValidationError(err.message || 'Failed to save record.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              {isIncome ? (
                <span className="text-emerald-600 dark:text-emerald-400">
                  {editingTransaction ? 'Edit Income Entry' : 'Record New Income'}
                </span>
              ) : (
                <span>
                  {editingTransaction ? 'Edit Expense Entry' : 'Record Household Expense'}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isIncome 
                ? 'Track salary, freelance payments, business revenue, gifts, or investments' 
                : 'Log day-to-day household purchases, utility bills, or maintenance costs'}
            </p>
          </div>
          <button
            onClick={() => {
              setIsAddModalOpen(false);
              setEditingTransaction(null);
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Quick Add Chips (Only for new entries) */}
        {!editingTransaction && (
          <div className="mt-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>{isIncome ? 'Quick Inflow Presets:' : 'Quick Add Household Staples:'}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(isIncome ? QUICK_INCOME_TEMPLATES : QUICK_ADD_TEMPLATES).map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickAdd(tmpl)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition ${
                    isIncome 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border-emerald-200/60 dark:border-emerald-800/60'
                      : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border-indigo-200/60 dark:border-indigo-800/60'
                  }`}
                >
                  {tmpl.title} ({currency}{tmpl.amount.toLocaleString()})
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Income vs Expense Pill Switch */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
                !isIncome
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Expense (Outflow)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 rounded-lg text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
                isIncome
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Income (Inflow)</span>
            </button>
          </div>

          {/* Title / Description */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {isIncome ? 'Income Source / Title' : 'Expense Title / Description'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={isIncome ? 'e.g. Monthly Salary, Freelance project, Consulting, Stock dividend' : 'e.g. Monthly Grocery Ration, Milk delivery, Doctor fee'}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Amount ({currency}) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  {currency}
                </span>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="any"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Category & Member */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isIncome ? 'Income Category' : 'Expense Category'} <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {isIncome ? (
                  INCOME_CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  data.categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isIncome ? 'Recipient / Family Member' : 'Paid by / Family Member'}
              </label>
              <select
                value={formData.memberId}
                onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {data.members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.avatar} {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {isIncome ? 'Deposit / Payment Method' : 'Payment Method'}
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {PAYMENT_METHODS.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Optional Note / Bank Ref / Receipt Details
            </label>
            <input
              type="text"
              placeholder={isIncome ? 'e.g. Credited to HDFC Bank, Client invoice #104' : 'e.g. Bought via Blinkit, Bill ref #4512'}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingTransaction(null);
              }}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl shadow-md transition transform active:scale-95 flex items-center gap-1.5 ${
                isIncome
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-indigo-500/25'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                {editingTransaction 
                  ? 'Save Changes' 
                  : isIncome ? 'Save Income Record' : 'Record Transaction'}
              </span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
