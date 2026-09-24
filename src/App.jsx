import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BudgetProvider, useBudget } from './context/BudgetContext';
import Navbar from './components/Navbar';
import AuthPage from './components/Auth/AuthPage';
import MetricCards from './components/Dashboard/MetricCards';
import SmartAdvisor from './components/Dashboard/SmartAdvisor';
import AnalyticsCharts from './components/Dashboard/AnalyticsCharts';
import CategoryBudgetCard from './components/Budgets/CategoryBudgetCard';
import BillManager from './components/Bills/BillManager';
import ExpenseList from './components/Expenses/ExpenseList';
import FamilySplitView from './components/Family/FamilySplitView';
import AdminDashboard from './components/Admin/AdminDashboard';
import AddExpenseModal from './components/Expenses/AddExpenseModal';
import ExportModal from './components/ExportModal';
import CategoryIcon from './components/CategoryIcon';
import { 
  Plus, 
  ArrowRight, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Receipt, 
  SlidersHorizontal, 
  Crown
} from 'lucide-react';

const DashboardView = () => {
  const { 
    data, 
    categorySpendMap, 
    monthTransactions, 
    setActiveTab, 
    setIsAddModalOpen, 
    setEditingTransaction 
  } = useBudget();
  const { currentUser, isUserAdmin } = useAuth();
  const currency = data.currency;

  const urgentBills = data.bills.filter(b => !b.isPaid).slice(0, 3);
  const recentTransactions = monthTransactions.slice(0, 5);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/40 border border-indigo-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl sm:text-3xl p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            {currentUser?.avatar || '👋'}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Welcome back, {currentUser?.name}!</span>
              {isUserAdmin && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/40 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-600 inline" />
                  <span>Master Owner</span>
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Household financials are synchronized and running smoothly.
            </p>
          </div>
        </div>

        {/* ONLY show shortcut if isUserAdmin */}
        {isUserAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition whitespace-nowrap"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Open Admin Portal</span>
          </button>
        )}
      </div>

      {/* 1. Top KPI Summary Cards */}
      <MetricCards />

      {/* 2. Smart AI-style Advisor & Recommendation Banner */}
      <SmartAdvisor />

      {/* 3. Analytics Charts Grid */}
      <AnalyticsCharts />

      {/* 4. Split Section: Top Budget Envelope Status & Urgent Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Top Category Budgets Snapshot */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Household Budget Limits
                  </h3>
                  <p className="text-xs text-slate-400">Monthly envelope tracking</p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('budgets')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {data.categories.slice(0, 4).map(cat => {
                const spent = categorySpendMap[cat.id] || 0;
                const budget = cat.budget || 0;
                const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
                const isOver = spent > budget && budget > 0;

                return (
                  <div key={cat.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${cat.bgLight}`}>
                          <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" color={cat.color} />
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.name}</span>
                      </div>
                      <div className="font-medium text-slate-600 dark:text-slate-400">
                        <span className="font-bold text-slate-900 dark:text-white">{currency}{spent.toLocaleString()}</span>
                        <span className="text-slate-400"> / {currency}{budget.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
            <span>Tracking {data.categories.length} categories</span>
            <button
              onClick={() => setActiveTab('budgets')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Adjust Spending Caps →
            </button>
          </div>
        </div>

        {/* Right: Upcoming Utility Bills */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Due Household Bills
                  </h3>
                  <p className="text-xs text-slate-400">Utility bills & staff payments</p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('bills')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
              >
                <span>Manage Bills</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {urgentBills.length === 0 ? (
              <div className="py-10 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  All current bills are cleared!
                </p>
                <p className="text-xs text-slate-400">No overdue or pending payments found.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {urgentBills.map(bill => (
                  <div key={bill.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <CategoryIcon name={bill.icon || 'Zap'} className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{bill.title}</p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span>Due: {bill.dueDate}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {currency}{bill.amount.toLocaleString()}
                      </p>
                      <button
                        onClick={() => setActiveTab('bills')}
                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Settle Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
            <span>{urgentBills.length} pending bill(s)</span>
            <button
              onClick={() => setActiveTab('bills')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Open Bill Due-Date Calendar →
            </button>
          </div>
        </div>

      </div>

      {/* 5. Recent Activity Ledger */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Household Transactions
              </h3>
              <p className="text-xs text-slate-400">Latest entries logged for this month</p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('expenses')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
          >
            <span>View All Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recentTransactions.map(tx => {
            const isIncome = tx.type === 'income';
            const cat = data.categories.find(c => c.id === tx.category) || {};
            const member = data.members.find(m => m.id === tx.memberId) || data.members[0];

            return (
              <div key={tx.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${cat.color || '#6366f1'}18` }}
                  >
                    <CategoryIcon name={isIncome ? 'TrendingUp' : (cat.icon || 'Receipt')} className="w-4 h-4" color={cat.color} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{tx.title}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{tx.date}</span>
                      <span>•</span>
                      <span>{cat.name}</span>
                      <span>•</span>
                      <span>{member.avatar} {member.name}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-sm sm:text-base font-extrabold ${isIncome ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                    {isIncome ? '+' : '-'}{currency}{Number(tx.amount).toLocaleString()}
                  </p>
                  <span className="text-[10px] text-slate-400">{tx.paymentMethod}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

const MainContent = () => {
  const { activeTab, setActiveTab } = useBudget();
  const { isUserAdmin } = useAuth();

  // STRICT SECURITY GUARD: If activeTab is 'admin' and user is not admin, instantly redirect to dashboard!
  if (activeTab === 'admin' && !isUserAdmin) {
    setActiveTab('dashboard');
    return <DashboardView />;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'expenses' && <ExpenseList />}
      {activeTab === 'budgets' && <CategoryBudgetCard />}
      {activeTab === 'bills' && <BillManager />}
      {activeTab === 'family' && <FamilySplitView />}
      {activeTab === 'admin' && isUserAdmin && <AdminDashboard />}

      {/* Floating Action Button for Mobile screens */}
      <div className="fixed bottom-6 right-6 sm:hidden z-30">
        <button
          onClick={() => {
            // Handled via context
          }}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex items-center justify-center shadow-xl shadow-indigo-600/40 transform active:scale-90 transition"
          aria-label="Add transaction"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>
    </main>
  );
};

function AuthenticatedApp() {
  const { currentUser, isUserAdmin } = useAuth();

  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <BudgetProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <div className="flex-1">
          <MainContent />
        </div>
        <AddExpenseModal />
        <ExportModal />

        {/* Modern App Footer */}
        <footer className="mt-12 py-6 border-t border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>HomeLedger Pro • Signed in as <strong>{currentUser.name}</strong></span>
            </div>
            <div className="flex items-center gap-4">
              <span>Multi-User Session Guard</span>
              <span>•</span>
              <span>Encrypted Local Sync</span>
              {isUserAdmin && (
                <>
                  <span>•</span>
                  <span>Admin Activity Logs Active</span>
                </>
              )}
            </div>
          </div>
        </footer>
      </div>
    </BudgetProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}
