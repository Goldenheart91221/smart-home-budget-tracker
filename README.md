# HomeLedger Pro 🏡💰
### Smart Home Budget & Household Expenses Management Suite

HomeLedger Pro is a modern, attractive, and professional household finance application engineered for families, shared households, and roommates. It provides deep visibility into monthly bills, utility meters, grocery allowances, domestic staff payments, and lifestyle expenditures with intelligent rule-based insights and interactive analytics.

---

## 🌟 Key Features

1. **Smart Executive Dashboard**:
   - Real-time KPI summary cards: Total Inflow, Total Household Expenses, Net Balance, Savings Retention Rate.
   - **Automated Financial Health Score (0-100)**: Color-coded health badge (*Optimal*, *Good*, *Needs Attention*, *Critical*) with actionable advice.
   - **Interactive Charts**:
     - *Category Breakdown* (Doughnut Chart with percentages).
     - *Daily Velocity Curve* (Day-by-day spending trend).
     - *Inflow vs Outflow vs Budget Cap* (Multi-bar comparison).

2. **Smart Category Budget Envelopes**:
   - Pre-configured household categories: Groceries & Ration, Electricity & Power, Broadband/Wi-Fi, Water & PNG Gas, Rent & Home Loan, Maid & Staff, Society Maintenance, Dining & Takeout, Healthcare, Fuel, Subscriptions (OTT), and Investments.
   - Color-coded progress bars with live alerts when nearing or exceeding limits (>80% amber, >100% red pulsing).
   - Instant in-place budget editing.

3. **Smart Household Bill & Due-Date Manager**:
   - Bill tracking for recurring utilities (Electricity Board, Fiber Wi-Fi, PNG gas, Maid salary, Society charges).
   - Due-date countdown badges: *Due in 2 days*, *Due Today*, *Overdue*, *Settled*.
   - **1-Click "Pay & Record Expense"**: Instantly settles the bill and records the transaction into your ledger with exact payment method!

4. **Family & Roommate Expense Split**:
   - Tag expenses to family members or roommates (*Self, Spouse, Joint Account, Roommate, etc.*).
   - Member contribution analytics with percentage shares and individual drill-down statements.
   - Add custom household members with custom avatars and roles.

5. **Smart Insights & Rule-Based AI Advisor**:
   - Automated anomaly detection: alerts on unusual utility bill surges, projected budget exhaustion, and overdue penalties.
   - Smart energy-saving and grocery cost-cutting tips.

6. **Quick-Add Staples**:
   - 1-tap quick buttons for frequent household items (*Daily Milk ₹65, Bread & Eggs ₹140, Veggies ₹320, Water Can ₹60, Swiggy ₹380*).

7. **Filters, Multi-Currency & Dark Mode**:
   - Search by title or notes.
   - Filter by date, category, family member, and payment method (UPI, Credit Card, Net Banking, Cash).
   - One-click currency switcher: `₹` INR, `$` USD, `€` EUR, `£` GBP, `AED`.
   - Dark Mode / Light Mode with seamless theme transition.

8. **Data Security & Portability**:
   - **Offline-First**: Persists securely in browser `localStorage`.
   - **Instant CSV Export**: Excel-ready download of all transactions.
   - **Full JSON Backup & Restore**: Port and backup your complete data anytime.
   - **Printable Monthly Household Statement**: Clean printer/PDF sheet view.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+) & npm

### Development Server
```bash
# Navigate to project directory
cd smart-home-budget-tracker

# Install dependencies (if not already installed)
npm install

# Start local server (running at http://localhost:3000)
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 📁 Project Structure
```
smart-home-budget-tracker/
├── src/
│   ├── components/
│   │   ├── Bills/
│   │   │   └── BillManager.jsx          # Utility bills due-dates & 1-click pay
│   │   ├── Budgets/
│   │   │   └── CategoryBudgetCard.jsx   # Envelope progress bars & limit editor
│   │   ├── Dashboard/
│   │   │   ├── AnalyticsCharts.jsx      # Doughnut, Line & Bar Chart.js visuals
│   │   │   ├── MetricCards.jsx          # Top KPI cards & Health Score gauge
│   │   │   └── SmartAdvisor.jsx         # Rule-based AI tips & overrun alerts
│   │   ├── Expenses/
│   │   │   ├── AddExpenseModal.jsx      # Quick-add chips, category & member selector
│   │   │   └── ExpenseList.jsx          # Searchable ledger table & CSV export
│   │   ├── Family/
│   │   │   └── FamilySplitView.jsx      # Member attribution & share breakdown
│   │   ├── CategoryIcon.jsx             # Dynamic Lucide icon renderer
│   │   ├── ExportModal.jsx              # CSV export, JSON backup & restore
│   │   └── Navbar.jsx                   # Header, month switcher, theme & currency
│   ├── context/
│   │   └── BudgetContext.jsx            # Central state, localStorage & calculations
│   ├── types/
│   │   └── defaultData.js               # Realistic seed categories, bills & members
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```
