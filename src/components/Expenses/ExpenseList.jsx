import React, { useState, useMemo } from 'react';
import { useBudget } from '../../context/BudgetContext';
import CategoryIcon from '../CategoryIcon';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download, 
  Calendar,
  CreditCard,
  User,
  Plus
} from 'lucide-react';

export const ExpenseList = () => {
  const { 
    data, 
    monthTransactions, 
    deleteTransaction, 
    setEditingTransaction, 
    setIsAddModalOpen,
    setIsExportModalOpen 
  } = useBudget();
  
  const currency = data.currency;

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'expense' | 'income'
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMember, setFilterMember] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return monthTransactions.filter(tx => {
      // Search
      const matchSearch = !search || 
        tx.title.toLowerCase().includes(search.toLowerCase()) ||
        (tx.notes && tx.notes.toLowerCase().includes(search.toLowerCase()));

      // Type
      const matchType = filterType === 'all' || tx.type === filterType;

      // Category
      const matchCategory = filterCategory === 'all' || tx.category === filterCategory;

      // Member
      const matchMember = filterMember === 'all' || tx.memberId === filterMember;

      // Payment
      const matchPayment = filterPayment === 'all' || tx.paymentMethod === filterPayment;

      return matchSearch && matchType && matchCategory && matchMember && matchPayment;
    });
  }, [monthTransactions, search, filterType, filterCategory, filterMember, filterPayment]);

  const handleEdit = (tx) => {
    setEditingTransaction(tx);
    setIsAddModalOpen(true);
  };

  // CSV Quick Export of current table
  const handleQuickCSV = () => {
    if (filteredTransactions.length === 0) return;
    
    const headers = ['Date', 'Type', 'Title', 'Category', 'Member', 'Payment Method', 'Amount', 'Notes'];
    const rows = filteredTransactions.map(t => {
      const cat = data.categories.find(c => c.id === t.category)?.name || t.category;
      const mem = data.members.find(m => m.id === t.memberId)?.name || 'Self';
      return [
        `"${t.date}"`,
        `"${t.type}"`,
        `"${t.title.replace(/"/g, '""')}"`,
        `"${cat}"`,
        `"${mem}"`,
        `"${t.paymentMethod || 'UPI'}"`,
        t.amount,
        `"${(t.notes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `household_expenses_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      
      {/* Search & Filter Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search expenses, groceries, repairs, bills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickCSV}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition"
              title="Download filtered CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV</span>
            </button>

            <button
              onClick={() => {
                setEditingTransaction(null);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Entry</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Ribbon */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          
          {/* Type Filter */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md transition ${filterType === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-2.5 py-1 rounded-md transition ${filterType === 'expense' ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs' : 'text-slate-500'}`}
            >
              Expenses
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-2.5 py-1 rounded-md transition ${filterType === 'income' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500'}`}
            >
              Incomes
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {data.categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Member Filter */}
          <select
            value={filterMember}
            onChange={(e) => setFilterMember(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Members</option>
            {data.members.map(m => (
              <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>
            ))}
          </select>

          {/* Clear Filters reset */}
          {(search || filterType !== 'all' || filterCategory !== 'all' || filterMember !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setFilterType('all');
                setFilterCategory('all');
                setFilterMember('all');
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline ml-2"
            >
              Clear filters
            </button>
          )}

          <div className="ml-auto text-xs text-slate-400">
            Showing {filteredTransactions.length} records
          </div>
        </div>
      </div>

      {/* Transaction Records List / Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
              No transactions match your criteria
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search terms or add a new transaction.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const cat = data.categories.find(c => c.id === tx.category) || {};
              const member = data.members.find(m => m.id === tx.memberId) || data.members[0];

              return (
                <div
                  key={tx.id}
                  className="p-4 sm:px-6 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition flex items-center justify-between gap-4 group"
                >
                  {/* Left: Icon & Description */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div 
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ 
                        backgroundColor: isIncome ? 'rgba(16, 185, 129, 0.15)' : `${cat.color || '#6366f1'}18` 
                      }}
                    >
                      <CategoryIcon 
                        name={isIncome ? 'TrendingUp' : (cat.icon || 'Receipt')} 
                        className="w-5 h-5" 
                        color={isIncome ? '#10b981' : (cat.color || '#6366f1')} 
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                          {tx.title}
                        </h4>
                        <span className="hidden sm:inline-flex text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {cat.name || 'General'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {tx.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                          <span>{member.avatar}</span>
                          <span>{member.name}</span>
                        </span>
                        {tx.paymentMethod && (
                          <>
                            <span className="hidden xs:inline">•</span>
                            <span className="hidden xs:inline text-slate-500">
                              {tx.paymentMethod}
                            </span>
                          </>
                        )}
                      </div>

                      {tx.notes && (
                        <p className="text-xs text-slate-500 italic mt-0.5 truncate max-w-sm sm:max-w-md">
                          "{tx.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
                    <div className="text-right">
                      <p className={`text-base sm:text-lg font-extrabold tracking-tight ${
                        isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                      }`}>
                        {isIncome ? '+' : '-'}{currency}{Number(tx.amount).toLocaleString()}
                      </p>
                      <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                        isIncome ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {isIncome ? 'Inflow' : 'Expense'}
                      </span>
                    </div>

                    {/* Edit & Delete Buttons */}
                    <div className="flex items-center opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleEdit(tx)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition"
                        title="Edit Entry"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default ExpenseList;
