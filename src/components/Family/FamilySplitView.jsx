import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import CategoryIcon from '../CategoryIcon';
import { Users, UserPlus, CreditCard, PieChart, Plus, X, ArrowRight } from 'lucide-react';

export const FamilySplitView = () => {
  const { data, memberSpendMap, monthTransactions, metrics, addMember, setActiveTab } = useBudget();
  const currency = data.currency;

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    role: 'Resident',
    avatar: '🧑',
    color: 'indigo'
  });

  const [selectedMemberId, setSelectedMemberId] = useState(null);

  const totalHouseholdExpense = metrics.totalExpenses;

  const handleAddMemberSubmit = (e) => {
    e.preventDefault();
    if (!newMember.name) return;
    addMember(newMember);
    setNewMember({ name: '', role: 'Resident', avatar: '🧑', color: 'indigo' });
    setIsAddMemberOpen(false);
  };

  // Filter transactions for selected member
  const memberTransactions = selectedMemberId
    ? monthTransactions.filter(t => t.memberId === selectedMemberId && t.type === 'expense')
    : [];

  const selectedMemberObj = data.members.find(m => m.id === selectedMemberId);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
              Household Member Breakdown
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Family & Roommate Expense Split
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            See who paid for what in the household. Attribute utility bills, grocery runs, and shared expenses to specific family members.
          </p>
        </div>

        <button
          onClick={() => setIsAddMemberOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition transform active:scale-95 whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Family Member</span>
        </button>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {data.members.map((member) => {
          const stats = memberSpendMap[member.id] || { spent: 0, count: 0 };
          const pct = totalHouseholdExpense > 0 
            ? Math.round((stats.spent / totalHouseholdExpense) * 100) 
            : 0;

          const isSelected = selectedMemberId === member.id;

          return (
            <div
              key={member.id}
              onClick={() => setSelectedMemberId(isSelected ? null : member.id)}
              className={`rounded-2xl p-5 bg-white dark:bg-slate-900 border transition-all duration-200 cursor-pointer hover:shadow-md ${
                isSelected 
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md' 
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl p-2 rounded-2xl bg-slate-100 dark:bg-slate-800">
                    {member.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                      {member.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{member.role}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                  {pct}%
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400 font-medium">Monthly Outflow:</span>
                  <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {currency}{stats.spent.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-1 text-xs text-slate-400">
                  <span>Transactions logged:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{stats.count}</span>
                </div>

                {/* Progress bar relative to household total */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Member Drill-down Transaction view */}
      {selectedMemberObj && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedMemberObj.avatar}</span>
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  Expenses Paid by {selectedMemberObj.name}
                </h4>
                <p className="text-xs text-slate-400">
                  {memberTransactions.length} transaction(s) logged this month
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedMemberId(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {memberTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No expense transactions logged by {selectedMemberObj.name} this month.
              </p>
            ) : (
              memberTransactions.map(tx => {
                const cat = data.categories.find(c => c.id === tx.category) || {};
                return (
                  <div key={tx.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <CategoryIcon name={cat.icon || 'Receipt'} className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{tx.title}</p>
                        <p className="text-xs text-slate-400">{tx.date} • {cat.name}</p>
                      </div>
                    </div>
                    <div className="text-right font-bold text-sm text-slate-900 dark:text-white">
                      {currency}{Number(tx.amount).toLocaleString()}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Add Family Member
              </h3>
              <button
                onClick={() => setIsAddMemberOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Papa, Sister, Rohan"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Role in Household
                </label>
                <input
                  type="text"
                  placeholder="e.g. Head, Co-Manager, Resident"
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Avatar Emoji
                </label>
                <div className="flex gap-2">
                  {['👨‍💼', '👩‍💼', '🧑', '👵', '👴', '🧒', '🏡'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewMember({ ...newMember, avatar: emoji })}
                      className={`text-2xl p-2 rounded-xl transition ${
                        newMember.avatar === emoji 
                          ? 'bg-indigo-100 dark:bg-indigo-900/60 ring-2 ring-indigo-500' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default FamilySplitView;
