import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getInitialData, DEFAULT_CATEGORIES, DEFAULT_MEMBERS, INCOME_CATEGORIES } from '../types/defaultData';
import { api } from '../lib/api';
import confetti from 'canvas-confetti';

const BudgetContext = createContext();

export { INCOME_CATEGORIES };

// ─── Map backend expense/income records → frontend transaction format ──────────

function backendExpenseToTx(exp) {
  return {
    id: `db-exp-${exp.id}`,
    _dbId: exp.id,
    _dbType: 'expense',
    title: exp.title,
    amount: Number(exp.amount),
    type: 'expense',
    category: exp.category || 'groceries',
    date: exp.expense_date ? exp.expense_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
    notes: exp.notes || '',
    memberId: 'm1',
    paymentMethod: 'UPI (GPay / PhonePe / Paytm)'
  };
}

function backendIncomeToTx(inc) {
  return {
    id: `db-inc-${inc.id}`,
    _dbId: inc.id,
    _dbType: 'income',
    title: inc.source,
    amount: Number(inc.amount),
    type: 'income',
    category: inc.category || 'Salary',
    date: inc.income_date ? inc.income_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
    notes: inc.notes || '',
    memberId: 'm1',
    paymentMethod: 'Direct Bank Transfer / NEFT'
  };
}

function backendBillToFrontend(bill) {
  return {
    id: `db-bill-${bill.id}`,
    _dbId: bill.id,
    title: bill.name,
    amount: Number(bill.amount),
    dueDate: bill.due_date ? bill.due_date.slice(0, 10) : '',
    isPaid: bill.status === 'paid',
    paidOn: bill.status === 'paid' ? bill.due_date?.slice(0, 10) : null,
    category: 'electricity',
    biller: bill.name,
    icon: 'Zap',
    notes: bill.notes || ''
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const BudgetProvider = ({ children }) => {
  const { currentUser, backendOnline } = useAuth();

  const userStorageKey = currentUser?.id
    ? `homeledger_data_${currentUser.id}`
    : 'homeledger_guest_data';

  // ─── Theme state ──────────────────────────────────────────────────────────

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('homeledger_theme');
    if (saved !== null) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // ─── Selected Month ───────────────────────────────────────────────────────

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // ─── Backend sync state ───────────────────────────────────────────────────

  const [dbLoading, setDbLoading] = useState(false);
  const [dbError, setDbError] = useState(null);
  const [dbTransactions, setDbTransactions] = useState([]); // merged expenses+income from DB
  const [dbBills, setDbBills] = useState([]);
  const [dbBudgets, setDbBudgets] = useState([]); // [{category, amount, month}]

  // ─── Main local data (categories, members, currency, local transactions) ──

  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(userStorageKey);
      if (saved) return JSON.parse(saved);

      if (currentUser?.id === 'usr-admin-1' || currentUser?.email === 'admin@homeledger.com') {
        const legacy = localStorage.getItem('homeledger_pro_v1');
        if (legacy) {
          try { return JSON.parse(legacy); } catch (e) {}
        }
        return getInitialData();
      }

      return {
        transactions: [],
        bills: [],
        categories: DEFAULT_CATEGORIES,
        members: [
          {
            id: 'm1',
            name: currentUser?.name || 'Self',
            role: 'Head of Home',
            avatar: currentUser?.avatar || '👨‍💼',
            color: 'indigo'
          }
        ],
        currency: '₹',
        currencyCode: 'INR',
        monthlyIncomeGoal: 0
      };
    } catch (e) {
      console.error('Failed to parse saved state:', e);
    }
    return getInitialData();
  });

  // ─── Tabs & Modals ────────────────────────────────────────────────────────

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState('expense');
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const openAddModal = (type = 'expense') => {
    setEditingTransaction(null);
    setAddModalType(type);
    setIsAddModalOpen(true);
  };

  // ─── Dark mode sync ───────────────────────────────────────────────────────

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('homeledger_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('homeledger_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // ─── Persist local data ───────────────────────────────────────────────────

  useEffect(() => {
    try {
      if (userStorageKey) {
        localStorage.setItem(userStorageKey, JSON.stringify(data));
      }
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [data, userStorageKey]);

  // ─── Fetch from backend when online ──────────────────────────────────────

  const fetchFromBackend = useCallback(async () => {
    if (!backendOnline || !currentUser) return;
    setDbLoading(true);
    setDbError(null);
    try {
      const [expenses, income, bills, budgets] = await Promise.all([
        api.expenses.list(),
        api.income.list(),
        api.bills.list(),
        api.budgets.list()
      ]);

      // Merge expenses and income into unified transaction list
      const txExpenses = Array.isArray(expenses) ? expenses.map(backendExpenseToTx) : [];
      const txIncome = Array.isArray(income) ? income.map(backendIncomeToTx) : [];
      const merged = [...txIncome, ...txExpenses].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setDbTransactions(merged);
      setDbBills(Array.isArray(bills) ? bills.map(backendBillToFrontend) : []);
      setDbBudgets(Array.isArray(budgets) ? budgets : []);
    } catch (err) {
      console.error('[BudgetContext] Backend fetch failed:', err.message);
      setDbError(err.message);
    } finally {
      setDbLoading(false);
    }
  }, [backendOnline, currentUser]);

  useEffect(() => {
    if (backendOnline) {
      fetchFromBackend();
    }
  }, [backendOnline, fetchFromBackend]);

  // ─── Effective data: prefer DB data when online ───────────────────────────

  /**
   * When backend is online, we use dbTransactions / dbBills.
   * Local data.categories and data.members are always used for UI metadata.
   */
  const effectiveTransactions = backendOnline ? dbTransactions : data.transactions;
  const effectiveBills = backendOnline ? dbBills : data.bills;

  /**
   * When backend is online, merge dbBudgets into categories so category.budget
   * reflects the value stored in the database for the selected month.
   */
  const effectiveCategories = useMemo(() => {
    if (!backendOnline || dbBudgets.length === 0) return data.categories;

    const monthStr = `${selectedMonth}-01`; // YYYY-MM-01
    return data.categories.map(cat => {
      const dbBudget = dbBudgets.find(
        b => b.category === cat.id && b.month?.slice(0, 7) === selectedMonth
      );
      return dbBudget ? { ...cat, budget: Number(dbBudget.amount) } : cat;
    });
  }, [backendOnline, dbBudgets, data.categories, selectedMonth]);

  // ─── Computed metrics ─────────────────────────────────────────────────────

  const monthTransactions = useMemo(() => {
    return effectiveTransactions.filter(tx => {
      if (!tx.date) return false;
      return tx.date.startsWith(selectedMonth);
    });
  }, [effectiveTransactions, selectedMonth]);

  const metrics = useMemo(() => {
    let income = 0;
    let expenses = 0;

    monthTransactions.forEach(tx => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'income') income += amt;
      else expenses += amt;
    });

    const balance = income - expenses;
    const savingsRate = income > 0 ? Math.max(0, Math.round((balance / income) * 100)) : 0;
    const totalBudget = effectiveCategories.reduce((acc, cat) => acc + (Number(cat.budget) || 0), 0);
    const budgetUsedPercent = totalBudget > 0 ? Math.round((expenses / totalBudget) * 100) : 0;

    const now = new Date();
    const [selYear, selMonth] = selectedMonth.split('-').map(Number);
    const isCurrentMonth = now.getFullYear() === selYear && (now.getMonth() + 1) === selMonth;
    const daysInMonth = new Date(selYear, selMonth, 0).getDate();
    const dayToday = isCurrentMonth ? Math.max(1, now.getDate()) : daysInMonth;
    const dailyAvg = expenses / dayToday;
    const projectedSpend = Math.round(dailyAvg * daysInMonth);

    let score = 70;
    if (income > 0) {
      if (savingsRate >= 30) score += 20;
      else if (savingsRate >= 15) score += 10;
      else if (savingsRate < 5) score -= 15;
    }
    if (budgetUsedPercent > 100) score -= 25;
    else if (budgetUsedPercent > 90) score -= 15;
    else if (budgetUsedPercent <= 80 && budgetUsedPercent > 0) score += 10;

    const overdueBillsCount = effectiveBills.filter(
      b => !b.isPaid && new Date(b.dueDate) < new Date(new Date().toISOString().split('T')[0])
    ).length;
    score -= overdueBillsCount * 10;
    score = Math.max(10, Math.min(100, score));

    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance,
      savingsRate,
      totalBudget,
      budgetUsedPercent,
      projectedSpend,
      dailyAvg: Math.round(dailyAvg),
      healthScore: score
    };
  }, [monthTransactions, effectiveCategories, effectiveBills, selectedMonth]);

  const categorySpendMap = useMemo(() => {
    const map = {};
    effectiveCategories.forEach(c => { map[c.id] = 0; });
    monthTransactions.forEach(tx => {
      if (tx.type === 'expense') {
        const catId = tx.category || 'groceries';
        map[catId] = (map[catId] || 0) + (Number(tx.amount) || 0);
      }
    });
    return map;
  }, [effectiveCategories, monthTransactions]);

  const memberSpendMap = useMemo(() => {
    const map = {};
    data.members.forEach(m => { map[m.id] = { spent: 0, count: 0 }; });
    monthTransactions.forEach(tx => {
      if (tx.type === 'expense') {
        const mId = tx.memberId || 'm1';
        if (!map[mId]) map[mId] = { spent: 0, count: 0 };
        map[mId].spent += Number(tx.amount) || 0;
        map[mId].count += 1;
      }
    });
    return map;
  }, [data.members, monthTransactions]);

  const smartInsights = useMemo(() => {
    const insights = [];
    const { totalIncome, savingsRate, projectedSpend, totalBudget } = metrics;
    const todayStr = new Date().toISOString().split('T')[0];

    if (projectedSpend > totalBudget && totalBudget > 0) {
      const overrun = projectedSpend - totalBudget;
      insights.push({
        id: 'proj-overrun', type: 'warning',
        title: 'Projected Budget Overrun',
        message: `At your current velocity, you are projected to spend ${data.currency}${projectedSpend.toLocaleString()}, exceeding your monthly budget by ${data.currency}${overrun.toLocaleString()}.`,
        actionText: 'Review Category Budgets'
      });
    }

    effectiveCategories.forEach(cat => {
      const spent = categorySpendMap[cat.id] || 0;
      if (cat.budget > 0 && spent > cat.budget) {
        const excess = spent - cat.budget;
        insights.push({
          id: `cat-over-${cat.id}`, type: 'danger',
          title: `${cat.name} Budget Exceeded!`,
          message: `You've spent ${data.currency}${spent.toLocaleString()} against budget of ${data.currency}${cat.budget.toLocaleString()} (+${data.currency}${excess.toLocaleString()}).`,
          actionText: 'View Expenses'
        });
      }
    });

    const pendingBills = effectiveBills.filter(b => !b.isPaid);
    const overdue = pendingBills.filter(b => b.dueDate < todayStr);
    const urgent = pendingBills.filter(b => {
      const diffDays = Math.ceil((new Date(b.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 3;
    });

    if (overdue.length > 0) {
      insights.push({
        id: 'bill-overdue', type: 'danger',
        title: `${overdue.length} Overdue Utility Bill(s)`,
        message: `Bills for ${overdue.map(b => b.title).join(', ')} are past due.`,
        actionText: 'Pay Bills Now'
      });
    } else if (urgent.length > 0) {
      insights.push({
        id: 'bill-urgent', type: 'warning',
        title: 'Upcoming Due Bills (Next 3 Days)',
        message: `${urgent[0].title} is due on ${urgent[0].dueDate}. Amount: ${data.currency}${urgent[0].amount.toLocaleString()}.`,
        actionText: 'Quick Pay'
      });
    }

    if (savingsRate >= 30 && totalIncome > 0) {
      insights.push({
        id: 'savings-champ', type: 'success',
        title: 'Outstanding Savings Rate! 🌟',
        message: `Your household has retained a ${savingsRate}% savings rate this month. Consider investing the surplus.`,
        actionText: 'Add Investment'
      });
    }

    if (insights.length < 3) {
      insights.push({
        id: 'smart-tip-utility', type: 'info',
        title: 'Smart Home Energy Tip',
        message: 'Setting your AC thermostat to 24°C instead of 18°C typically reduces electricity bills by 18-24%.',
        actionText: null
      });
    }

    return insights;
  }, [metrics, effectiveCategories, categorySpendMap, effectiveBills, data.currency]);

  // ─── ACTIONS ──────────────────────────────────────────────────────────────

  /**
   * Add a transaction (expense or income).
   * When backend is online: saves to DB, then refreshes from DB.
   * When offline: saves to local state.
   */
  const addTransaction = async (tx) => {
    const amt = parseFloat(tx.amount);
    if (isNaN(amt) || amt <= 0) {
      throw new Error('Transaction amount must be greater than 0.');
    }
    if (!tx.title || !tx.title.trim()) {
      throw new Error('Title / income source is required.');
    }

    const txDate = tx.date || new Date().toISOString().split('T')[0];

    // Switch to transaction's month immediately
    const txMonth = txDate.slice(0, 7);
    if (txMonth && txMonth !== selectedMonth) {
      setSelectedMonth(txMonth);
    }

    // ── Backend mode ────────────────────────────────────────────────────────
    if (backendOnline) {
      if (tx.type === 'income') {
        await api.income.create({
          source: tx.title.trim(),
          amount: amt,
          category: tx.category || 'Salary',
          income_date: txDate,
          notes: tx.notes || ''
        });
      } else {
        await api.expenses.create({
          title: tx.title.trim(),
          amount: amt,
          category: tx.category || 'groceries',
          expense_date: txDate,
          notes: tx.notes || ''
        });
      }
      // Trigger confetti
      if (tx.type === 'income' || tx.category === 'savings') {
        try { confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } }); } catch (e) {}
      }
      await fetchFromBackend();
      return;
    }

    // ── Fallback: localStorage mode ─────────────────────────────────────────
    const newTx = {
      ...tx,
      id: tx.id || `tx-${Date.now()}`,
      title: tx.title.trim(),
      amount: amt,
      type: tx.type === 'income' ? 'income' : 'expense',
      category: tx.category || (tx.type === 'income' ? 'Salary' : 'groceries'),
      date: txDate,
      notes: tx.notes || ''
    };

    if (newTx.type === 'income' || newTx.category === 'savings') {
      try { confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } }); } catch (e) {}
    }
    setData(prev => ({ ...prev, transactions: [newTx, ...prev.transactions] }));
    return newTx;
  };

  /**
   * Edit a transaction.
   */
  const editTransaction = async (id, updated) => {
    if (backendOnline) {
      // Find the transaction to get its DB id
      const tx = effectiveTransactions.find(t => t.id === id);
      if (tx?._dbId) {
        if (tx._dbType === 'expense') {
          await api.expenses.update(tx._dbId, {
            title: updated.title,
            amount: Number(updated.amount),
            category: updated.category,
            expense_date: updated.date,
            notes: updated.notes
          });
        }
        // Note: income edit not implemented in backend yet — treat as local only
      }
      await fetchFromBackend();
      return;
    }

    setData(prev => ({
      ...prev,
      transactions: prev.transactions.map(t =>
        t.id === id ? { ...t, ...updated, amount: Number(updated.amount) || 0 } : t
      )
    }));
  };

  /**
   * Delete a transaction.
   */
  const deleteTransaction = async (id) => {
    if (backendOnline) {
      const tx = effectiveTransactions.find(t => t.id === id);
      if (tx?._dbId) {
        if (tx._dbType === 'expense') await api.expenses.delete(tx._dbId);
        else if (tx._dbType === 'income') await api.income.delete(tx._dbId);
      }
      await fetchFromBackend();
      return;
    }

    setData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
  };

  /**
   * Add a bill.
   */
  const addBill = async (bill) => {
    if (backendOnline) {
      await api.bills.create({
        name: bill.title,
        amount: Number(bill.amount),
        due_date: bill.dueDate || null,
        notes: bill.notes || ''
      });
      await fetchFromBackend();
      return;
    }

    const newBill = {
      ...bill,
      id: bill.id || `bill-${Date.now()}`,
      amount: Number(bill.amount) || 0,
      isPaid: false
    };
    setData(prev => ({ ...prev, bills: [newBill, ...prev.bills] }));
  };

  /**
   * Delete a bill.
   */
  const deleteBill = async (id) => {
    if (backendOnline) {
      const bill = effectiveBills.find(b => b.id === id);
      if (bill?._dbId) {
        await api.bills.delete(bill._dbId);
      }
      await fetchFromBackend();
      return;
    }

    setData(prev => ({ ...prev, bills: prev.bills.filter(b => b.id !== id) }));
  };

  /**
   * Mark a bill as paid.
   * Also auto-creates an expense transaction for the bill amount.
   */
  const markBillAsPaid = async (billId, paymentMethod = 'UPI (GPay / PhonePe / Paytm)') => {
    const todayStr = new Date().toISOString().split('T')[0];

    if (backendOnline) {
      const bill = effectiveBills.find(b => b.id === billId);
      if (bill?._dbId) {
        await api.bills.pay(bill._dbId);
        // Auto-create expense for bill payment
        await api.expenses.create({
          title: `${bill.title} (Bill Paid)`,
          amount: bill.amount,
          category: 'electricity',
          expense_date: todayStr,
          notes: `Automated bill payment for ${bill.title}`
        });
      }
      try { confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } }); } catch (e) {}
      await fetchFromBackend();
      return;
    }

    const bill = data.bills.find(b => b.id === billId);
    if (!bill) return;

    const updatedBills = data.bills.map(b =>
      b.id === billId ? { ...b, isPaid: true, paidOn: todayStr } : b
    );
    const newTx = {
      id: `tx-bill-${Date.now()}`,
      title: `${bill.title} (Bill Paid)`,
      amount: bill.amount,
      type: 'expense',
      category: bill.category || 'electricity',
      memberId: 'm1',
      date: todayStr,
      paymentMethod,
      notes: `Automated bill payment log for ${bill.biller || bill.title}`
    };
    setData(prev => ({ ...prev, bills: updatedBills, transactions: [newTx, ...prev.transactions] }));
    try { confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } }); } catch (e) {}
  };

  /**
   * Update a category budget.
   */
  const updateCategoryBudget = async (catId, newBudget) => {
    if (backendOnline) {
      const monthStr = `${selectedMonth}-01`;
      await api.budgets.upsert({
        category: catId,
        amount: Number(newBudget),
        month: monthStr
      });
      await fetchFromBackend();
    }

    // Always update local categories too for immediate UI feedback
    setData(prev => ({
      ...prev,
      categories: prev.categories.map(c =>
        c.id === catId ? { ...c, budget: Number(newBudget) || 0 } : c
      )
    }));
  };

  // ─── Category / member / currency helpers (local only) ────────────────────

  const addCategory = (category) => {
    setData(prev => ({
      ...prev,
      categories: [...prev.categories, { ...category, id: `cat-${Date.now()}` }]
    }));
  };

  const addMember = (member) => {
    setData(prev => ({
      ...prev,
      members: [...prev.members, { ...member, id: `m-${Date.now()}` }]
    }));
  };

  const setCurrency = (symbol, code = 'INR') => {
    setData(prev => ({ ...prev, currency: symbol, currencyCode: code }));
  };

  const resetToDefaultData = () => {
    setData(getInitialData());
  };

  const importData = (importedData) => {
    if (!importedData.transactions || !importedData.categories) {
      throw new Error('Invalid backup file structure.');
    }
    setData(importedData);
  };

  const exportData = () => JSON.stringify(
    {
      ...data,
      transactions: effectiveTransactions,
      bills: effectiveBills
    },
    null,
    2
  );

  // ─── Compose the data object the frontend reads ───────────────────────────

  /**
   * When backend is online, components read effectiveTransactions and effectiveBills.
   * We expose a merged `data` object so all existing component code (which reads data.transactions
   * and data.bills) works unchanged.
   */
  const exposedData = useMemo(() => ({
    ...data,
    categories: effectiveCategories,
    transactions: effectiveTransactions,
    bills: effectiveBills
  }), [data, effectiveCategories, effectiveTransactions, effectiveBills]);

  return (
    <BudgetContext.Provider
      value={{
        data: exposedData,
        metrics,
        darkMode,
        toggleDarkMode,
        selectedMonth,
        setSelectedMonth,
        activeTab,
        setActiveTab,
        monthTransactions,
        categorySpendMap,
        memberSpendMap,
        smartInsights,
        // DB sync state
        dbLoading,
        dbError,
        backendOnline,
        refreshFromBackend: fetchFromBackend,
        // Modals
        isAddModalOpen,
        setIsAddModalOpen,
        addModalType,
        setAddModalType,
        openAddModal,
        editingTransaction,
        setEditingTransaction,
        isExportModalOpen,
        setIsExportModalOpen,
        INCOME_CATEGORIES,
        // Handlers
        addTransaction,
        editTransaction,
        deleteTransaction,
        addBill,
        deleteBill,
        markBillAsPaid,
        updateCategoryBudget,
        addCategory,
        addMember,
        setCurrency,
        resetToDefaultData,
        importData,
        exportData
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
