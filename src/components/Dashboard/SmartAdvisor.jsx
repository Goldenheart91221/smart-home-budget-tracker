import React from 'react';
import { useBudget } from '../../context/BudgetContext';
import { Sparkles, AlertTriangle, AlertOctagon, CheckCircle2, Info, ArrowRight } from 'lucide-react';

export const SmartAdvisor = () => {
  const { smartInsights, setActiveTab } = useBudget();

  if (!smartInsights || smartInsights.length === 0) return null;

  const getStyle = (type) => {
    switch (type) {
      case 'danger':
        return {
          cardBg: 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60',
          iconColor: 'text-rose-600 dark:text-rose-400',
          iconBg: 'bg-rose-100 dark:bg-rose-900/50',
          textColor: 'text-rose-950 dark:text-rose-100',
          buttonColor: 'bg-rose-600 hover:bg-rose-700 text-white',
          icon: AlertOctagon
        };
      case 'warning':
        return {
          cardBg: 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60',
          iconColor: 'text-amber-600 dark:text-amber-400',
          iconBg: 'bg-amber-100 dark:bg-amber-900/50',
          textColor: 'text-amber-950 dark:text-amber-100',
          buttonColor: 'bg-amber-600 hover:bg-amber-700 text-white',
          icon: AlertTriangle
        };
      case 'success':
        return {
          cardBg: 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60',
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
          textColor: 'text-emerald-950 dark:text-emerald-100',
          buttonColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          icon: CheckCircle2
        };
      case 'info':
      default:
        return {
          cardBg: 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/60',
          iconColor: 'text-indigo-600 dark:text-indigo-400',
          iconBg: 'bg-indigo-100 dark:bg-indigo-900/50',
          textColor: 'text-indigo-950 dark:text-indigo-100',
          buttonColor: 'bg-indigo-600 hover:bg-indigo-700 text-white',
          icon: Info
        };
    }
  };

  const handleAction = (actionText) => {
    if (!actionText) return;
    if (actionText.includes('Bill')) {
      setActiveTab('bills');
    } else if (actionText.includes('Budget')) {
      setActiveTab('budgets');
    } else {
      setActiveTab('expenses');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-indigo-500 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
              Smart Household Insights & Advisor
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Automated telemetry, budget alerts and smart saving recommendations
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {smartInsights.slice(0, 3).map((insight) => {
          const style = getStyle(insight.type);
          const Icon = style.icon;

          return (
            <div
              key={insight.id}
              className={`flex flex-col justify-between p-4 rounded-xl border ${style.cardBg} transition`}
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${style.iconBg} ${style.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className={`text-sm font-bold ${style.textColor}`}>
                    {insight.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {insight.message}
                </p>
              </div>

              {insight.actionText && (
                <div className="mt-3 pt-3 border-t border-slate-200/40 dark:border-slate-800/40">
                  <button
                    onClick={() => handleAction(insight.actionText)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
                  >
                    <span>{insight.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SmartAdvisor;
