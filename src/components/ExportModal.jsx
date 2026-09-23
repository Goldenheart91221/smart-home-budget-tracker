import React, { useRef, useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  RotateCcw, 
  Printer, 
  X, 
  Check, 
  AlertCircle 
} from 'lucide-react';

export const ExportModal = () => {
  const { 
    isExportModalOpen, 
    setIsExportModalOpen, 
    data, 
    monthTransactions, 
    resetToDefaultData, 
    importData, 
    exportData 
  } = useBudget();

  const fileInputRef = useRef(null);
  const [statusMessage, setStatusMessage] = useState(null);

  if (!isExportModalOpen) return null;

  // 1. Export CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Title', 'Category', 'Member', 'Payment Method', 'Amount', 'Notes'];
    const rows = data.transactions.map(t => {
      const cat = data.categories.find(c => c.id === t.category)?.name || t.category;
      const mem = data.members.find(m => m.id === t.memberId)?.name || 'Self';
      return [
        `"${t.date}"`,
        `"${t.type}"`,
        `"${(t.title || '').replace(/"/g, '""')}"`,
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
    link.setAttribute('download', `homeledger_all_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setStatusMessage({ type: 'success', text: 'CSV spreadsheet downloaded successfully!' });
  };

  // 2. Export JSON
  const handleExportJSON = () => {
    const jsonStr = exportData();
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `homeledger_backup_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setStatusMessage({ type: 'success', text: 'Full JSON backup downloaded!' });
  };

  // 3. Import JSON
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        importData(parsed);
        setStatusMessage({ type: 'success', text: 'Data imported and restored successfully!' });
      } catch (err) {
        setStatusMessage({ type: 'error', text: 'Invalid JSON backup file.' });
      }
    };
    reader.readAsText(file);
  };

  // 4. Print Statement
  const handlePrint = () => {
    window.print();
  };

  // 5. Reset to sample defaults
  const handleReset = () => {
    if (window.confirm('Reset all transactions and budgets back to sample demo household data?')) {
      resetToDefaultData();
      setStatusMessage({ type: 'success', text: 'Reset to sample household data.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Data Management & Reports
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Export, backup, restore or print your finances
            </p>
          </div>
          <button
            onClick={() => setIsExportModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status notification */}
        {statusMessage && (
          <div className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}>
            {statusMessage.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Action Options */}
        <div className="mt-5 space-y-3">
          
          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-left transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Export to Excel / CSV</p>
                <p className="text-xs text-slate-400">Download all transactions table spreadsheet</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition" />
          </button>

          {/* Export JSON Backup */}
          <button
            onClick={handleExportJSON}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-left transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Backup Everything (JSON)</p>
                <p className="text-xs text-slate-400">Save complete state: budgets, bills & members</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition" />
          </button>

          {/* Import JSON Backup */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-left transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Restore from Backup</p>
                <p className="text-xs text-slate-400">Load a previously exported .json file</p>
              </div>
            </div>
            <Upload className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          {/* Print Statement */}
          <button
            onClick={handlePrint}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-left transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Print Statement</p>
                <p className="text-xs text-slate-400">Generate clean printer/PDF view</p>
              </div>
            </div>
            <Printer className="w-4 h-4 text-slate-400 group-hover:text-sky-500 transition" />
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-left transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Reload Demo Household Data</p>
                <p className="text-xs text-slate-400">Restore fresh sample household values</p>
              </div>
            </div>
            <RotateCcw className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition" />
          </button>

        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => setIsExportModalOpen(false)}
            className="px-5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default ExportModal;
