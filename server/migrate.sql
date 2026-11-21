-- HomeLedger Pro — Safe SQL Migration
-- Run this in Neon SQL Editor: https://console.neon.tech
-- Database: homeledger | Schema: public
-- Uses CREATE TABLE IF NOT EXISTS — safe to re-run, will NOT drop existing data.

-- ── 1. USERS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL UNIQUE,
  password   TEXT        NOT NULL,
  role       TEXT        NOT NULL DEFAULT 'user'
               CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. EXPENSES ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        TEXT        NOT NULL,
  amount       NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  category     TEXT        NOT NULL DEFAULT 'Other',
  expense_date DATE        NOT NULL DEFAULT CURRENT_DATE,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);

-- ── 3. INCOME ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS income (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source      TEXT        NOT NULL,
  amount      NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  category    TEXT        NOT NULL DEFAULT 'Other'
                CHECK (category IN ('Salary','Freelance','Business','Investment','Gift','Other')),
  income_date DATE        NOT NULL DEFAULT CURRENT_DATE,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_income_user_id ON income(user_id);

-- ── 4. BUDGETS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS budgets (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category   TEXT          NOT NULL,
  amount     NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  month      DATE          NOT NULL,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, category, month)
);

-- ── 5. BILLS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bills (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT          NOT NULL,
  amount     NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  due_date   DATE,
  status     TEXT          NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','paid','overdue')),
  notes      TEXT,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);

-- ── 6. SAVINGS GOALS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS savings_goals (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT          NOT NULL,
  target_amount NUMERIC(12,2) NOT NULL CHECK (target_amount > 0),
  saved_amount  NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (saved_amount >= 0),
  deadline      DATE,
  notes         TEXT,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_savings_user_id ON savings_goals(user_id);

-- ── VERIFY ────────────────────────────────────────────────────────────────────
-- After running, this should list: bills, budgets, expenses, income, savings_goals, users
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
