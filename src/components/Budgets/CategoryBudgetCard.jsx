import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import CategoryIcon from '../CategoryIcon';
import { Edit2, Check, X, AlertTriangle, ShieldCheck, Plus, Sparkles } from 'lucide-react';

export const CategoryBudgetCard = () => {
  const { data, categorySpendMap, updateCategoryBudget } = useBudget();
  const currency = data.currency;

  const [editingId, setEditingId] = useState(null);
  const [tempBudget, setTempBudget] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'household' | 'discretionary'

  const handleStartEdit = (category) => {
    setEditingId(category.id);
    setTempBudget(category.budget.toString());
  };

  const handleSaveEdit = (categoryId) => {
    const num = Number(tempBudget);
    if (!isNaN(num) && num >= 0) {
      updateCategoryBudget(categoryId, num);
    }
    setEditingId(null);
  };

  const filteredCategories = data.categories.filter(cat => {
    if (filter === 'household') return cat.isHousehold;
    if (filter === 'discretionary') return !cat.isHousehold;
    return true;
  });

  // Calculate totals
  const totalBudgeted = filteredCategories.reduce((sum, c) => sum + (c.budget || 0), 0);
  const totalSpent = filteredCategories.reduce((sum, c) => sum + (categorySpendMap[c.id] || 0), 0);
  const overallPct = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Budget Overview */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                Monthly Envelope System
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Smart Category Budgets
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Set spending limits for household utilities, groceries, staff, and lifestyle to prevent budget overruns.
            </p>
          </div>

          {/* Quick Summary Pill */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-center gap-6">
            <div>
              <p className="text-[11px] text-slate-300 uppercase tracking-wider font-semibold">Total Allocated</p>
              <p className="text-lg font-bold text-white">{currency}{totalBudgeted.toLocaleString()}</p>
            </div>
            <div className="h-8 w-[1px] bg-white/20" />
            <div>
              <p className="text-[11px] text-slate-300 uppercase tracking-wider font-semibold">Total Spent</p>
              <p className="text-lg font-bold text-emerald-400">{currency}{totalSpent.toLocaleString()}</p>
            </div>
            <div className="h-8 w-[1px] bg-white/20" />
            <div>
              <p className="text-[11px] text-slate-300 uppercase tracking-wider font-semibold">Utilization</p>
              <p className={`text-lg font-bold ${overallPct > 100 ? 'text-rose-400' : 'text-indigo-300'}`}>
                {overallPct}%
              </p>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            All Categories ({data.categories.length})
          </button>
          <button
            onClick={() => setFilter('household')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === 'household'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Core Household Needs
          </button>
          <button
            onClick={() => setFilter('discretionary')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === 'discretionary'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Lifestyle & Personal
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredCategories.map((category) => {
          const spent = categorySpendMap[category.id] || 0;
          const budget = category.budget || 0;
          const remaining = budget - spent;
          const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
          const isOver = spent > budget && budget > 0;
          const isWarning = pct >= 80 && !isOver;

          return (
            <div
              key={category.id}
              className={`rounded-2xl p-5 bg-white dark:bg-slate-900 border transition-all duration-200 hover:shadow-md ${
                isOver 
                  ? 'border-rose-300 dark:border-rose-900/70 shadow-sm shadow-rose-500/5' 
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${category.bgLight}`}>
                    <CategoryIcon name={category.icon} className="w-5 h-5" color={category.color} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                      {category.name}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {category.isHousehold ? '🏠 Household Utility / Core' : '✨ Discretionary'}
                    </span>
                  </div>
                </div>

                {/* Edit Budget Button */}
                {editingId === category.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSaveEdit(category.id)}
                      className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition"
                      title="Save Limit"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartEdit(category)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Change Budget Limit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Progress & Numbers */}
              <div className="mt-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {currency}{spent.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">spent</span>
                  </div>

                  {editingId === category.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400 font-semibold">{currency}</span>
                      <input
                        type="number"
                        value={tempBudget}
                        onChange={(e) => setTempBudget(e.target.value)}
                        className="w-20 px-2 py-1 text-xs font-bold rounded-lg border border-indigo-400 dark:border-indigo-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Cap: {currency}{budget.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mt-2.5">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isOver 
                        ? 'bg-rose-500 animate-pulse' 
                        : isWarning 
                        ? 'bg-amber-500' 
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                {/* Footer status pill */}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className={`font-semibold ${
                    isOver 
                      ? 'text-rose-600 dark:text-rose-400 flex items-center gap-1' 
                      : isWarning 
                      ? 'text-amber-600 dark:text-amber-400' 
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {isOver && <AlertTriangle className="w-3.5 h-3.5 inline" />}
                    {pct}% utilized
                  </span>

                  <span className={`font-medium ${
                    isOver 
                      ? 'text-rose-600 dark:text-rose-400 font-bold' 
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {isOver 
                      ? `Over by ${currency}${Math.abs(remaining).toLocaleString()}` 
                      : `${currency}${remaining.toLocaleString()} left`
                    }
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBudgetCard;
