# HomeLedger Pro 🏠💰
### Smart Home Budget & Expense Tracker

> **B.Tech CSE Project · Sandip University · 2026**  
> Full-Stack Web Application with React, Node.js, PostgreSQL, and JWT Authentication

[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue?logo=react)](https://reactjs.org)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green?logo=node.js)](https://nodejs.org)
[![Database](https://img.shields.io/badge/Database-Neon%20PostgreSQL-blue?logo=postgresql)](https://neon.tech)
[![Auth](https://img.shields.io/badge/Auth-JWT%20%2B%20bcryptjs-red)](https://jwt.io)
[![CSS](https://img.shields.io/badge/CSS-TailwindCSS-cyan?logo=tailwindcss)](https://tailwindcss.com)

---

## 🌟 Features

| Feature | Status |
|---------|--------|
| 🔐 User Registration & Login (JWT + bcryptjs) | ✅ Working |
| 📊 Real-time Dashboard (Income, Expenses, Balance, Health Score) | ✅ Working |
| 💸 Expense & Income Management (Add/Edit/Delete/Filter) | ✅ Working |
| 📋 Monthly Budget Management (per category, visual progress) | ✅ Working |
| 🧾 Bills Manager (due dates, mark-as-paid, overdue alerts) | ✅ Working |
| 👨‍👩‍👧 Family Split View (multi-member expense tracking) | ✅ Working |
| 🤖 AI Smart Advisor (rule-based financial insights) | ✅ Working |
| 👑 Admin Portal (user management, audit logs) | ✅ Working |
| 🗄️ Backend REST API (26 endpoints) | ✅ Working |
| 🐘 Neon PostgreSQL Database (6 tables) | ✅ Working |
| 📤 Data Export (JSON) | ✅ Working |
| 🌙 Dark / Light Mode | ✅ Working |

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- Neon PostgreSQL account (free at [neon.tech](https://neon.tech))

### 1. Clone the Repository

```bash
git clone https://github.com/Goldenheart91221/smart-home-budget-tracker.git
cd smart-home-budget-tracker
git checkout backend-database-api
```

### 2. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd server
npm install
cd ..
```

### 3. Configure Environment

```bash
# Copy the example env file
cp .env.example server/.env

# Edit server/.env with your real values:
# DATABASE_URL=your_neon_connection_string
# DATABASE_SSL=true
# JWT_SECRET=your_strong_secret
# PORT=5000
```

### 4. Run SQL Migration

1. Go to [console.neon.tech](https://console.neon.tech)
2. Open your project → SQL Editor
3. Paste contents of `server/migrate.sql`
4. Click Run

### 5. Start the Application

```bash
# Terminal 1 — Backend
cd server
node server.js
# → HomeLedger Pro API running on port 5000

# Terminal 2 — Frontend
npm run dev
# → http://localhost:3000
```

---

## 📁 Project Structure

```
smart-home-budget-tracker/
├── src/                          # React Frontend (Vite)
│   ├── components/
│   │   ├── Dashboard/            # MetricCards, SmartAdvisor, AnalyticsCharts
│   │   ├── Expenses/             # AddExpenseModal, ExpenseList
│   │   ├── Budgets/              # CategoryBudgetCard
│   │   ├── Bills/                # BillManager
│   │   ├── Family/               # FamilySplitView
│   │   ├── Admin/                # AdminDashboard
│   │   └── Auth/                 # AuthPage, ForgotPasswordModal
│   ├── context/
│   │   ├── AuthContext.jsx       # Auth (backend + localStorage fallback)
│   │   └── BudgetContext.jsx     # Data layer (backend + localStorage fallback)
│   └── lib/
│       └── api.js                # API client (JWT token management)
│
├── server/                       # Node.js + Express Backend
│   ├── server.js                 # 26 REST API endpoints
│   ├── migrate.sql               # PostgreSQL migration (6 tables)
│   ├── test-api.js               # 23-test automated test suite
│   └── package.json              # Backend dependencies
│
├── .env.example                  # Safe environment variable template
├── HomeledgerPro.code-workspace  # VS Code workspace configuration
├── demo_video_guide.html         # Professional demo video recording guide
├── vite.config.js                # Vite config (/api proxy to port 5000)
└── package.json                  # Frontend dependencies
```

---

## 🔌 API Endpoints (26 Total)

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | App health check |
| GET | `/api/db-health` | Database connectivity |
| GET | `/api/db-tables` | List DB tables |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |

### Protected (Bearer JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Current user profile |
| GET/POST | `/api/expenses` | List / Add expenses |
| PUT/DELETE | `/api/expenses/:id` | Edit / Delete expense |
| GET | `/api/expenses/summary` | Category spend totals |
| GET/POST | `/api/income` | List / Add income |
| DELETE | `/api/income/:id` | Delete income |
| GET/POST | `/api/budgets` | List / Upsert budget |
| GET/POST | `/api/bills` | List / Add bills |
| PUT/DELETE | `/api/bills/:id` | Edit / Delete bill |
| PATCH | `/api/bills/:id/pay` | Mark bill paid |
| GET/POST | `/api/savings` | List / Add savings goals |
| PUT/DELETE | `/api/savings/:id` | Edit / Delete savings |
| PATCH | `/api/savings/:id/contribute` | Add contribution |

---

## 🗄️ Database Schema

```sql
users           -- id, name, email, password (bcrypt), role, created_at
expenses        -- id, user_id, title, amount, category, expense_date, notes
income          -- id, user_id, source, amount, category, income_date, notes  
budgets         -- id, user_id, category, amount, month (UNIQUE per user/cat/month)
bills           -- id, user_id, name, amount, due_date, status, notes
savings_goals   -- id, user_id, name, target_amount, saved_amount, deadline, notes
```

---

## 🔒 Security

- Passwords hashed with **bcryptjs** (12 salt rounds) — never stored in plain text
- **JWT tokens** with 7-day expiry, stored in `sessionStorage` (tab-scoped)
- All DB queries use **parameterized statements** (no SQL injection)
- All private routes require valid JWT middleware
- Each user can only access **their own records** (`WHERE user_id = $1`)
- `.env` file is in `.gitignore` — credentials never committed

---

## 🧪 Running Tests

```bash
cd server
node test-api.js
# Expected: 23/23 tests passed
```

---

## 🌿 Branches

| Branch | Description |
|--------|-------------|
| `main` | Original frontend (localStorage only) |
| `backend-database-api` | Full stack with backend, database, and API integration |

---

## 🎬 Demo Video

See [`demo_video_guide.html`](./demo_video_guide.html) for the complete scene-by-scene recording plan, tool recommendations, and narration scripts.

---

## 👥 Team

| Field | Detail |
|-------|--------|
| **Project** | HomeLedger Pro — Smart Home Budget & Expense Tracker |
| **University** | Sandip University |
| **Department** | Computer Science & Engineering |
| **Year** | 2026 |
| **Team** | *(Add team member names and enrollment numbers)* |
| **Mentor** | *(Add faculty mentor name)* |

---

## 📄 License

This project was developed as a B.Tech CSE college project. All rights reserved by the team.
