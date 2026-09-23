import React, { useMemo } from 'react';
import { useBudget } from '../../context/BudgetContext';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { PieChart, BarChart3, Activity } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler
);

export const AnalyticsCharts = () => {
  const { data, monthTransactions, categorySpendMap, darkMode, metrics } = useBudget();
  const { totalIncome, totalExpenses } = metrics;
  const currency = data.currency;

  const textColor = darkMode ? '#94a3b8' : '#475569';
  const gridColor = darkMode ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.7)';

  // 1. Prepare Doughnut Chart Data (Category Breakdown)
  const doughnutData = useMemo(() => {
    const activeCategories = data.categories
      .map(cat => ({
        name: cat.name,
        color: cat.color,
        amount: categorySpendMap[cat.id] || 0
      }))
      .filter(item => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    if (activeCategories.length === 0) {
      return {
        labels: ['No Expenses Logged'],
        datasets: [{
          data: [1],
          backgroundColor: [darkMode ? '#334155' : '#e2e8f0'],
          borderWidth: 0
        }]
      };
    }

    return {
      labels: activeCategories.map(c => c.name),
      datasets: [{
        data: activeCategories.map(c => c.amount),
        backgroundColor: activeCategories.map(c => c.color),
        borderColor: darkMode ? '#0f172a' : '#ffffff',
        borderWidth: 2,
        hoverOffset: 6
      }]
    };
  }, [data.categories, categorySpendMap, darkMode]);

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          boxWidth: 12,
          boxHeight: 12,
          padding: 12,
          font: { size: 11, family: 'Plus Jakarta Sans, sans-serif' }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const val = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const pct = total > 0 ? Math.round((val / total) * 100) : 0;
            return ` ${context.label}: ${currency}${val.toLocaleString()} (${pct}%)`;
          }
        }
      }
    },
    cutout: '68%'
  };

  // 2. Prepare Daily Expense Velocity (Line Chart)
  const dailyLineData = useMemo(() => {
    const daysInMonth = 31;
    const dailySpend = Array(daysInMonth).fill(0);

    monthTransactions.forEach(tx => {
      if (tx.type === 'expense' && tx.date) {
        const day = parseInt(tx.date.split('-')[2], 10);
        if (day >= 1 && day <= daysInMonth) {
          dailySpend[day - 1] += Number(tx.amount) || 0;
        }
      }
    });

    return {
      labels: Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`),
      datasets: [{
        label: 'Daily Spending',
        data: dailySpend,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.12)',
        tension: 0.35,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 6,
        pointBackgroundColor: '#6366f1'
      }]
    };
  }, [monthTransactions]);

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => `Day ${items[0].label}`,
          label: (item) => ` Spent: ${currency}${item.raw.toLocaleString()}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor, maxTicksLimit: 12, font: { size: 10 } }
      },
      y: {
        grid: { color: gridColor },
        ticks: {
          color: textColor,
          font: { size: 10 },
          callback: (value) => `${currency}${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`
        }
      }
    }
  };

  // 3. Prepare Bar Chart: Inflow vs Outflow vs Budget
  const barData = {
    labels: ['Total Inflow', 'Total Outflow', 'Monthly Budget Limit'],
    datasets: [{
      label: 'Amount',
      data: [totalIncome, totalExpenses, metrics.totalBudget],
      backgroundColor: [
        'rgba(16, 185, 129, 0.85)', // emerald
        'rgba(244, 63, 94, 0.85)',  // rose
        'rgba(99, 102, 241, 0.85)', // indigo
      ],
      borderRadius: 8,
      borderSkipped: false
    }]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: ${currency}${context.raw.toLocaleString()}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor, font: { size: 11 } }
      },
      y: {
        grid: { color: gridColor },
        ticks: {
          color: textColor,
          font: { size: 10 },
          callback: (value) => `${currency}${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      
      {/* Category Breakdown (Doughnut) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Category Breakdown
              </h3>
              <p className="text-[11px] text-slate-500">Expense distribution</p>
            </div>
          </div>
        </div>
        <div className="h-64 relative flex items-center justify-center">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>

      {/* Daily Velocity Line Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Daily Spend Velocity
              </h3>
              <p className="text-[11px] text-slate-500">Day-wise spend curve</p>
            </div>
          </div>
        </div>
        <div className="h-64">
          <Line data={dailyLineData} options={lineOptions} />
        </div>
      </div>

      {/* Inflow vs Outflow vs Budget Bar Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Inflow vs Outflow vs Cap
              </h3>
              <p className="text-[11px] text-slate-500">Macro financial balance</p>
            </div>
          </div>
        </div>
        <div className="h-64">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

    </div>
  );
};

export default AnalyticsCharts;
