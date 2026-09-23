// Default categories, members, sample bills, and initial expenses

export const DEFAULT_MEMBERS = [
  { id: 'm1', name: 'Self', role: 'Head of Home', avatar: '👨‍💼', color: 'indigo' },
  { id: 'm2', name: 'Spouse', role: 'Co-Manager', avatar: '👩‍💼', color: 'rose' },
  { id: 'm3', name: 'Family / Joint', role: 'Shared Pool', avatar: '🏡', color: 'emerald' },
  { id: 'm4', name: 'Roommate / Sibling', role: 'Resident', avatar: '🧑', color: 'amber' }
];

export const DEFAULT_CATEGORIES = [
  {
    id: 'groceries',
    name: 'Groceries & Kitchen',
    icon: 'ShoppingBag',
    color: '#10b981', // emerald
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    budget: 15000,
    isHousehold: true
  },
  {
    id: 'electricity',
    name: 'Electricity & Power',
    icon: 'Zap',
    color: '#f59e0b', // amber
    bgLight: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    budget: 3500,
    isHousehold: true
  },
  {
    id: 'internet',
    name: 'Wi-Fi & Broadband',
    icon: 'Wifi',
    color: '#0ea5e9', // sky
    bgLight: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400',
    budget: 1200,
    isHousehold: true
  },
  {
    id: 'water_gas',
    name: 'Water & Cooking Gas',
    icon: 'Droplet',
    color: '#06b6d4', // cyan
    bgLight: 'bg-cyan-50 dark:cyan-950/40 text-cyan-600 dark:text-cyan-400',
    budget: 1800,
    isHousehold: true
  },
  {
    id: 'rent_emi',
    name: 'Rent & Home Loan',
    icon: 'Home',
    color: '#6366f1', // indigo
    bgLight: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
    budget: 22000,
    isHousehold: true
  },
  {
    id: 'domestic_help',
    name: 'Maid & Domestic Staff',
    icon: 'Users',
    color: '#8b5cf6', // violet
    bgLight: 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400',
    budget: 6000,
    isHousehold: true
  },
  {
    id: 'maintenance',
    name: 'Home Repairs & Society',
    icon: 'Wrench',
    color: '#64748b', // slate
    bgLight: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    budget: 4000,
    isHousehold: true
  },
  {
    id: 'food_dining',
    name: 'Dining Out & Swiggy/Zomato',
    icon: 'Utensils',
    color: '#f97316', // orange
    bgLight: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400',
    budget: 6500,
    isHousehold: false
  },
  {
    id: 'healthcare',
    name: 'Medical & Healthcare',
    icon: 'HeartPulse',
    color: '#f43f5e', // rose
    bgLight: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
    budget: 3500,
    isHousehold: true
  },
  {
    id: 'fuel_transport',
    name: 'Fuel & Commute',
    icon: 'Car',
    color: '#3b82f6', // blue
    bgLight: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
    budget: 5000,
    isHousehold: false
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions & OTT',
    icon: 'Tv',
    color: '#a855f7', // purple
    bgLight: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
    budget: 1500,
    isHousehold: true
  },
  {
    id: 'savings',
    name: 'Investments & Savings',
    icon: 'PiggyBank',
    color: '#14b8a6', // teal
    bgLight: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400',
    budget: 20000,
    isHousehold: false
  }
];

export const PAYMENT_METHODS = [
  'UPI (GPay / PhonePe / Paytm)',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Cash'
];

export const QUICK_ADD_TEMPLATES = [
  { title: 'Daily Fresh Milk', amount: 65, category: 'groceries', type: 'expense' },
  { title: 'Vegetables & Fruits', amount: 320, category: 'groceries', type: 'expense' },
  { title: 'Drinking Water Can (20L)', amount: 60, category: 'water_gas', type: 'expense' },
  { title: 'Bread, Eggs & Butter', amount: 140, category: 'groceries', type: 'expense' },
  { title: 'Quick Swiggy / Zomato order', amount: 380, category: 'food_dining', type: 'expense' },
  { title: 'Petrol / Fuel Refill', amount: 1000, category: 'fuel_transport', type: 'expense' },
];

export const getInitialData = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  const formatDate = (day) => `${year}-${month}-${String(day).padStart(2, '0')}`;

  const defaultBills = [
    {
      id: 'bill-1',
      title: 'Monthly Electricity Bill',
      biller: 'Electricity Board (Discom)',
      category: 'electricity',
      amount: 2480,
      dueDate: formatDate(Math.min(28, now.getDate() + 3)),
      isPaid: false,
      frequency: 'Monthly',
      icon: 'Zap'
    },
    {
      id: 'bill-2',
      title: 'High-Speed Fiber Wi-Fi (300 Mbps)',
      biller: 'Airtel Xstream / Jio Fiber',
      category: 'internet',
      amount: 1179,
      dueDate: formatDate(Math.min(28, now.getDate() + 6)),
      isPaid: false,
      frequency: 'Monthly',
      icon: 'Wifi'
    },
    {
      id: 'bill-3',
      title: 'Piped Natural Gas (PNG)',
      biller: 'City Gas Distribution',
      category: 'water_gas',
      amount: 740,
      dueDate: formatDate(Math.min(28, now.getDate() + 11)),
      isPaid: false,
      frequency: 'Monthly',
      icon: 'Droplet'
    },
    {
      id: 'bill-4',
      title: 'House Maid & Cook Salary',
      biller: 'Anita (Domestic Staff)',
      category: 'domestic_help',
      amount: 5500,
      dueDate: formatDate(Math.min(28, now.getDate() + 4)),
      isPaid: false,
      frequency: 'Monthly',
      icon: 'Users'
    },
    {
      id: 'bill-5',
      title: 'Society Maintenance & Water Charges',
      biller: 'RWA Resident Association',
      category: 'maintenance',
      amount: 3200,
      dueDate: formatDate(Math.max(1, now.getDate() - 5)),
      isPaid: true,
      paidOn: formatDate(Math.max(1, now.getDate() - 6)),
      frequency: 'Monthly',
      icon: 'Home'
    }
  ];

  const defaultTransactions = [
    {
      id: 'tx-inc-1',
      title: 'Monthly Primary Salary',
      amount: 85000,
      type: 'income',
      category: 'savings',
      memberId: 'm1',
      date: formatDate(1),
      paymentMethod: 'Net Banking',
      notes: 'Monthly corporate salary credited'
    },
    {
      id: 'tx-inc-2',
      title: 'Freelance & Consulting Work',
      amount: 22000,
      type: 'income',
      category: 'savings',
      memberId: 'm2',
      date: formatDate(3),
      paymentMethod: 'UPI (GPay / PhonePe / Paytm)',
      notes: 'Design consulting retainer'
    },
    {
      id: 'tx-1',
      title: 'Apartment House Rent',
      amount: 22000,
      type: 'expense',
      category: 'rent_emi',
      memberId: 'm1',
      date: formatDate(2),
      paymentMethod: 'Net Banking',
      notes: 'Transferred to landlord via NEFT'
    },
    {
      id: 'tx-2',
      title: 'Monthly Ration & Supermarket Bulk Order',
      amount: 6850,
      type: 'expense',
      category: 'groceries',
      memberId: 'm2',
      date: formatDate(4),
      paymentMethod: 'Credit Card',
      notes: 'D-Mart / Blinkit monthly staples & spices'
    },
    {
      id: 'tx-3',
      title: 'Society Maintenance & Security Charges',
      amount: 3200,
      type: 'expense',
      category: 'maintenance',
      memberId: 'm3',
      date: formatDate(5),
      paymentMethod: 'UPI (GPay / PhonePe / Paytm)',
      notes: 'Quarterly common area upkeep'
    },
    {
      id: 'tx-4',
      title: 'Car Full Tank Petrol Refill',
      amount: 3400,
      type: 'expense',
      category: 'fuel_transport',
      memberId: 'm1',
      date: formatDate(7),
      paymentMethod: 'Credit Card',
      notes: 'Shell HP Auto fuel'
    },
    {
      id: 'tx-5',
      title: 'Organic Fresh Veggies & Dairy',
      amount: 1450,
      type: 'expense',
      category: 'groceries',
      memberId: 'm2',
      date: formatDate(9),
      paymentMethod: 'UPI (GPay / PhonePe / Paytm)',
      notes: 'Weekly farm fresh market'
    },
    {
      id: 'tx-6',
      title: 'Weekend Family Dinner at Spice Bistro',
      amount: 2350,
      type: 'expense',
      category: 'food_dining',
      memberId: 'm3',
      date: formatDate(12),
      paymentMethod: 'Credit Card',
      notes: 'Celebrated anniversary dinner'
    },
    {
      id: 'tx-7',
      title: 'Doctor Consultation & Routine Medicines',
      amount: 1250,
      type: 'expense',
      category: 'healthcare',
      memberId: 'm2',
      date: formatDate(14),
      paymentMethod: 'UPI (GPay / PhonePe / Paytm)',
      notes: 'Apollo Pharmacy multivitamin refill'
    },
    {
      id: 'tx-8',
      title: 'Netflix & Spotify Family Bundles',
      amount: 949,
      type: 'expense',
      category: 'subscriptions',
      memberId: 'm4',
      date: formatDate(15),
      paymentMethod: 'Credit Card',
      notes: 'Auto-debit recurring subscription'
    },
    {
      id: 'tx-9',
      title: 'Plumber Service & Kitchen Tap Replacement',
      amount: 850,
      type: 'expense',
      category: 'maintenance',
      memberId: 'm1',
      date: formatDate(17),
      paymentMethod: 'Cash',
      notes: 'Urban Company plumbing repair'
    },
    {
      id: 'tx-10',
      title: 'SIP Mutual Fund Auto-Invest',
      amount: 15000,
      type: 'expense',
      category: 'savings',
      memberId: 'm1',
      date: formatDate(10),
      paymentMethod: 'Net Banking',
      notes: 'Index Fund SIP'
    }
  ];

  return {
    transactions: defaultTransactions,
    bills: defaultBills,
    categories: DEFAULT_CATEGORIES,
    members: DEFAULT_MEMBERS,
    currency: '₹',
    currencyCode: 'INR',
    monthlyIncomeGoal: 107000
  };
};
