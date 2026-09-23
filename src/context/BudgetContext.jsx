import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getInitialData, DEFAULT_CATEGORIES, DEFAULT_MEMBERS } from '../types/defaultData';
import confetti from 'canvas-confetti';

const BudgetContext = createContext();

const STORAGE_KEY = 'homeledger_pro_v1';

export const BudgetProvider = ({ children }) => {
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('homeledger_theme');
    if (saved !== null) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Selected Month (e.g., "2026-09")
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Main data state
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved state, using default data:', e);
    }
    return getInitialData();
  });

  // Active view tab state: 'dashboard' | 'expenses' | 'budgets' | 'bills' | 'family' | 'reports'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Sync darkMode class on html root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('homeledger_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('homeledger_theme', 'light');
    }
  }, [darkMode]);

  // Sync data with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [data]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // Filter transactions for currently selected month
  const monthTransactions = useMemo(() => {
    return data.transactions.filter(tx => {
      if (!tx.date) return false;
      return tx.date.startsWith(selectedMonth);
    });
  }, [data.transactions, selectedMonth]);

  // Aggregate Metrics for selected month
  const metrics = useMemo(() => {
    let income = 0;
    let expenses = 0;

    monthTransactions.forEach(tx => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'income') {
        income += amt;
      } else {
        expenses += amt;
      }
    });

    const balance = income - expenses;
    const savingsRate = income > 0 ? Math.max(0, Math.round((balance / income) * 100)) : 0;

    // Total monthly allocated budget
    const totalBudget = data.categories.reduce((acc, cat) => acc + (Number(cat.budget) || 0), 0);
    const budgetUsedPercent = totalBudget > 0 ? Math.round((expenses / totalBudget) * 100) : 0;

    // Projected spend calculation
    const now = new Date();
    const [selYear, selMonth] = selectedMonth.split('-').map(Number);
    const isCurrentMonth = now.getFullYear() === selYear && (now.getMonth() + 1) === selMonth;
    const daysInMonth = new Date(selYear, selMonth, 0).getDate();
    const dayToday = isCurrentMonth ? Math.max(1, now.getDate()) : daysInMonth;
    
    const dailyAvg = expenses / dayToday;
    const projectedSpend = Math.round(dailyAvg * daysInMonth);

    // Calculate smart financial health score (0 - 100)
    let score = 70;
    if (income > 0) {
      if (savingsRate >= 30) score += 20;
      else if (savingsRate >= 15) score += 10;
      else if (savingsRate < 5) score -= 15;
    }
    if (budgetUsedPercent > 100) score -= 25;
    else if (budgetUsedPercent > 90) score -= 15;
    else if (budgetUsedPercent <= 80 && budgetUsedPercent > 0) score += 10;

    // Check overdue bills
    const overdueBillsCount = data.bills.filter(b => !b.isPaid && new Date(b.dueDate) < new Date(now.toISOString().split('T')[0])).length;
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
  }, [monthTransactions, data.categories, data.bills, selectedMonth]);

  // Category-wise spend breakdown
  const categorySpendMap = useMemo(() => {
    const map = {};
    data.categories.forEach(c => {
      map[c.id] = 0;
    });

    monthTransactions.forEach(tx => {
      if (tx.type === 'expense') {
        const catId = tx.category || 'groceries';
        map[catId] = (map[catId] || 0) + (Number(tx.amount) || 0);
      }
    });

    return map;
  }, [data.categories, monthTransactions]);

  // Family Member-wise spend breakdown
  const memberSpendMap = useMemo(() => {
    const map = {};
    data.members.forEach(m => {
      map[m.id] = { spent: 0, count: 0 };
    });

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

  // Dynamic Rule-Based AI Insights
  const smartInsights = useMemo(() => {
    const insights = [];
    const { totalIncome, totalExpenses, savingsRate, projectedSpend, totalBudget } = metrics;

    // 1. Budget projection alert
    if (projectedSpend > totalBudget && totalBudget > 0) {
      const overrun = projectedSpend - totalBudget;
      insights.push({
        id: 'proj-overrun',
        type: 'warning',
        title: 'Projected Budget Overrun',
        message: `At your current velocity, you are projected to spend ${data.currency}${projectedSpend.toLocaleString()}, which exceeds your total monthly budget by ${data.currency}${overrun.toLocaleString()}.`,
        actionText: 'Review Category Budgets'
      });
    }

    // 2. Over-budget categories
    data.categories.forEach(cat => {
      const spent = categorySpendMap[cat.id] || 0;
      if (cat.budget > 0 && spent > cat.budget) {
        const excess = spent - cat.budget;
        insights.push({
          id: `cat-over-${cat.id}`,
          type: 'danger',
          title: `${cat.name} Budget Exceeded!`,
          message: `You have spent ${data.currency}${spent.toLocaleString()} against your budget of ${data.currency}${cat.budget.toLocaleString()} (+${data.currency}${excess.toLocaleString()}).`,
          actionText: 'View Expenses'
        });
      }
    });

    // 3. Upcoming/Overdue Bills
    const todayStr = new Date().toISOString().split('T')[0];
    const pendingBills = data.bills.filter(b => !b.isPaid);
    const overdue = pendingBills.filter(b => b.dueDate < todayStr);
    const urgent = pendingBills.filter(b => {
      const diffDays = Math.ceil((new Date(b.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 3;
    });

    if (overdue.length > 0) {
      insights.push({
        id: 'bill-overdue',
        type: 'danger',
        title: `${overdue.length} Overdue Utility Bill(s)`,
        message: `Bills for ${overdue.map(b => b.title).join(', ')} are past due. Pay now to avoid power or service interruption penalties.`,
        actionText: 'Pay Bills Now'
      });
    } else if (urgent.length > 0) {
      insights.push({
        id: 'bill-urgent',
        type: 'warning',
        title: `Upcoming Due Bills (Next 3 Days)`,
        message: `${urgent[0].title} is due on ${urgent[0].dueDate}. Amount: ${data.currency}${urgent[0].amount.toLocaleString()}.`,
        actionText: 'Quick Pay'
      });
    }

    // 4. Positive savings rate insight
    if (savingsRate >= 30 && totalIncome > 0) {
      insights.push({
        id: 'savings-champ',
        type: 'success',
        title: 'Outstanding Savings Rate! 🌟',
        message: `Your household has retained a ${savingsRate}% savings rate this month. Consider investing the surplus into emergency funds or SIPs.`,
        actionText: 'Add Investment'
      });
    }

    // 5. Default household optimization tip if few insights
    if (insights.length < 3) {
      insights.push({
        id: 'smart-tip-utility',
        type: 'info',
        title: 'Smart Home Energy Tip',
        message: 'Setting your AC thermostat to 24°C instead of 18°C typically reduces electricity bills by 18-24% during warmer periods.',
        actionText: null
      });
    }

    return insights;
  }, [metrics, data.categories, categorySpendMap, data.bills, data.currency]);

  // Actions
  const addTransaction = (tx) => {
    const newTx = {
      ...tx,
      id: tx.id || `tx-${Date.now()}`,
      amount: Number(tx.amount) || 0,
      date: tx.date || new Date().toISOString().split('T')[0]
    };
    setData(prev => ({
      ...prev,
      transactions: [newTx, ...prev.transactions]
    }));

    // Trigger celebratory confetti if saving/income added!
    if (newTx.type === 'income' || newTx.category === 'savings') {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 }
        });
      } catch (e) {
        // ignore
      }
    }
  };

  const editTransaction = (id, updated) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => t.id === id ? { ...t, ...updated, amount: Number(updated.amount) || 0 } : t)
    }));
  };

  const deleteTransaction = (id) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
  };

  const addBill = (bill) => {
    const newBill = {
      ...bill,
      id: bill.id || `bill-${Date.now()}`,
      amount: Number(bill.amount) || 0,
      isPaid: false
    };
    setData(prev => ({
      ...prev,
      bills: [newBill, ...prev.bills]
    }));
  };

  const deleteBill = (id) => {
    setData(prev => ({
      ...prev,
      bills: prev.bills.filter(b => b.id !== id)
    }));
  };

  const markBillAsPaid = (billId, paymentMethod = 'UPI (GPay / PhonePe / Paytm)') => {
    const bill = data.bills.find(b => b.id === billId);
    if (!bill) return;

    const todayStr = new Date().toISOString().split('T')[0];

    // Mark as paid
    const updatedBills = data.bills.map(b => {
      if (b.id === billId) {
        return { ...b, isPaid: true, paidOn: todayStr };
      }
      return b;
    });

    // Auto-create an expense transaction for this bill payment!
    const newTx = {
      id: `tx-bill-${Date.now()}`,
      title: `${bill.title} (Bill Paid)`,
      amount: bill.amount,
      type: 'expense',
      category: bill.category || 'electricity',
      memberId: 'm1',
      date: todayStr,
      paymentMethod: paymentMethod,
      notes: `Automated bill payment log for ${bill.biller || bill.title}`
    };

    setData(prev => ({
      ...prev,
      bills: updatedBills,
      transactions: [newTx, ...prev.transactions]
    }));

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch (e) {}
  };

  const updateCategoryBudget = (catId, newBudget) => {
    setData(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === catId ? { ...c, budget: Number(newBudget) || 0 } : c)
    }));
  };

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
    setData(prev => ({
      ...prev,
      currency: symbol,
      currencyCode: code
    }));
  };

  const resetToDefaultData = () => {
    const defaults = getInitialData();
    setData(defaults);
  };

  const importData = (importedData) => {
    if (!importedData.transactions || !importedData.categories) {
      throw new Error('Invalid backup file structure.');
    }
    setData(importedData);
  };

  const exportData = () => {
    return JSON.stringify(data, null, 2);
  };

  return (
    <BudgetContext.Provider
      value={{
        data,
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
        // Modals
        isAddModalOpen,
        setIsAddModalOpen,
        editingTransaction,
        setEditingTransaction,
        isExportModalOpen,
        setIsExportModalOpen,
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
