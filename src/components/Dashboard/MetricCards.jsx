import React from 'react';
import { useBudget } from '../../context/BudgetContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight,
  PiggyBank
} from 'lucide-react';

export const MetricCards = () => {
  const { metrics, data } = useBudget();
  const { 
    totalIncome, 
    totalExpenses, 
    balance, 
    savingsRate, 
    totalBudget, 
    budgetUsedPercent, 
    projectedSpend, 
    healthScore 
  } = metrics;

  const currency = data.currency;

  // Health score badge & color
  const getHealthBadge = (score) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' };
    if (score >= 60) return { label: 'Good & Stable', color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800' };
    if (score >= 40) return { label: 'Needs Attention', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800' };
    return { label: 'Critical Risk', color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800' };
  };

  const healthBadge = getHealthBadge(healthScore);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      
      {/* 1. Total Income Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Inflow
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {currency}{totalIncome.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-semibold mr-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              100%
            </span>
            <span>Recorded household inflows</span>
          </div>
        </div>
      </div>

      {/* 2. Total Outflow / Expenses Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-rose-500/10 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Household Spent
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {currency}{totalExpenses.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500 dark:text-slate-400">
            <span className={`inline-flex items-center font-semibold mr-1.5 ${
              budgetUsedPercent > 100 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'
            }`}>
              {budgetUsedPercent}%
            </span>
            <span>of monthly budget limit</span>
          </div>
        </div>
      </div>

      {/* 3. Leftover Balance & Savings Rate */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Net Savings & Balance
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {balance < 0 ? '-' : ''}{currency}{Math.abs(balance).toLocaleString()}
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-bold mr-1.5">
              {savingsRate}%
            </span>
            <span>Savings rate retention</span>
          </div>
        </div>
      </div>

      {/* 4. Financial Health Score Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Financial Health
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {healthScore}
            </span>
            <span className="text-xs font-semibold text-slate-400">/100</span>
          </div>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${healthBadge.color}`}>
            {healthBadge.label}
          </span>
        </div>
        <div className="mt-2">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                healthScore >= 75 ? 'bg-emerald-500' : healthScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${healthScore}%` }}
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default MetricCards;
