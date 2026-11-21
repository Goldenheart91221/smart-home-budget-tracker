import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true'
    ? { rejectUnauthorized: false }
    : undefined
});

app.use(cors());
app.use(express.json());

// ─── Auth helpers ─────────────────────────────────────────────────────────────

function createToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing in server .env');
  }
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) {
      return res.status(401).json({ message: 'Please log in first.' });
    }
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

// ─── Health ───────────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'HomeLedger Pro API' });
});

app.get('/api/db-health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS database_time');
    res.json({
      status: 'connected',
      databaseTime: result.rows[0].database_time
    });
  } catch (error) {
    console.error('Database health check failed:', error.message);
    res.status(500).json({ message: 'Database connection failed.' });
  }
});

app.get('/api/db-tables', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'public'
       ORDER BY table_name`
    );
    const tables = result.rows.map(r => r.table_name);
    const required = ['users', 'expenses', 'income', 'budgets', 'bills', 'savings_goals'];
    const missing = required.filter(t => !tables.includes(t));
    res.json({
      tables,
      missing,
      warning: missing.length
        ? `Missing tables: ${missing.join(', ')}. Run server/migrate.sql in Neon SQL Editor.`
        : 'All required tables exist.'
    });
  } catch (error) {
    console.error('Fetching DB tables failed:', error.message);
    res.status(500).json({ message: 'Could not fetch DB tables.' });
  }
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (name, email, password) VALUES ($1, $2, $3)
       RETURNING id, name, email, role, created_at`,
      [name, email, hash]
    );

    const user = result.rows[0];
    res.status(201).json({ token: createToken(user), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Registration failed:', error.message);
    res.status(500).json({ message: 'Could not create account.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const result = await pool.query(
      'SELECT id, name, email, password, role FROM users WHERE email = $1',
      [email]
    );

    if (!result.rowCount) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.json({ token: createToken(user), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login failed:', error.message);
    res.status(500).json({ message: 'Could not log in.' });
  }
});

// ─── User Profile ─────────────────────────────────────────────────────────────

app.get('/api/user/profile', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!result.rowCount) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Fetching user profile failed:', error.message);
    res.status(500).json({ message: 'Could not fetch user profile.' });
  }
});

// ─── Expenses ─────────────────────────────────────────────────────────────────

app.get('/api/expenses', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, amount, category, expense_date, notes, created_at
       FROM expenses WHERE user_id = $1
       ORDER BY expense_date DESC, created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Fetching expenses failed:', error.message);
    res.status(500).json({ message: 'Could not fetch expenses.' });
  }
});

app.post('/api/expenses', auth, async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    const amount = Number(req.body.amount);
    const category = String(req.body.category || 'Other').trim();
    const expenseDate = req.body.expense_date || null;
    const notes = String(req.body.notes || '').trim();

    if (!title || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        message: 'A title and an amount greater than zero are required.'
      });
    }

    const result = await pool.query(
      `INSERT INTO expenses (user_id, title, amount, category, expense_date, notes)
       VALUES ($1, $2, $3, $4, COALESCE($5::date, CURRENT_DATE), $6)
       RETURNING id, title, amount, category, expense_date, notes, created_at`,
      [req.user.id, title, amount, category, expenseDate, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Adding expense failed:', error.message);
    res.status(500).json({ message: 'Could not add expense.' });
  }
});

app.put('/api/expenses/:id', auth, async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    const amount = Number(req.body.amount);
    const category = String(req.body.category || 'Other').trim();
    const expenseDate = req.body.expense_date || null;
    const notes = String(req.body.notes || '').trim();

    if (!title || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        message: 'A title and an amount greater than zero are required.'
      });
    }

    const result = await pool.query(
      `UPDATE expenses
       SET title = $1, amount = $2, category = $3,
           expense_date = COALESCE($4::date, expense_date), notes = $5
       WHERE id = $6 AND user_id = $7
       RETURNING id, title, amount, category, expense_date, notes`,
      [title, amount, category, expenseDate, notes, req.params.id, req.user.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: 'Expense not found.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Updating expense failed:', error.message);
    res.status(500).json({ message: 'Could not update expense.' });
  }
});

app.delete('/api/expenses/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM expenses WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!result.rowCount) {
      return res.status(404).json({ message: 'Expense not found.' });
    }
    res.json({ message: 'Expense deleted successfully.' });
  } catch (error) {
    console.error('Deleting expense failed:', error.message);
    res.status(500).json({ message: 'Could not delete expense.' });
  }
});

app.get('/api/expenses/summary', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT category, SUM(amount)::numeric AS total, COUNT(*) AS count
       FROM expenses WHERE user_id = $1
       GROUP BY category ORDER BY total DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Fetching expense summary failed:', error.message);
    res.status(500).json({ message: 'Could not fetch expense summary.' });
  }
});

// ─── Income ───────────────────────────────────────────────────────────────────

app.get('/api/income', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, source, amount, category, income_date, notes, created_at
       FROM income WHERE user_id = $1
       ORDER BY income_date DESC, created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Fetching income failed:', error.message);
    res.status(500).json({ message: 'Could not fetch income records.' });
  }
});

app.post('/api/income', auth, async (req, res) => {
  try {
    const source = String(req.body.source || '').trim();
    const amount = Number(req.body.amount);
    const category = String(req.body.category || 'Other').trim();
    const incomeDate = req.body.income_date || null;
    const notes = String(req.body.notes || '').trim();

    if (!source || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        message: 'Source/title and a positive amount are required.'
      });
    }

    const validCategories = ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'];
    const finalCategory = validCategories.includes(category) ? category : 'Other';

    const result = await pool.query(
      `INSERT INTO income (user_id, source, amount, category, income_date, notes)
       VALUES ($1, $2, $3, $4, COALESCE($5::date, CURRENT_DATE), $6)
       RETURNING id, source, amount, category, income_date, notes, created_at`,
      [req.user.id, source, amount, finalCategory, incomeDate, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Adding income failed:', error.message);
    res.status(500).json({ message: 'Could not add income record.' });
  }
});

app.delete('/api/income/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM income WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!result.rowCount) {
      return res.status(404).json({ message: 'Income record not found.' });
    }
    res.json({ message: 'Income record deleted successfully.' });
  } catch (error) {
    console.error('Deleting income failed:', error.message);
    res.status(500).json({ message: 'Could not delete income record.' });
  }
});

// ─── Budgets ──────────────────────────────────────────────────────────────────

app.get('/api/budgets', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, category, amount, month
       FROM budgets WHERE user_id = $1
       ORDER BY month DESC, category`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Fetching budgets failed:', error.message);
    res.status(500).json({ message: 'Could not fetch budgets.' });
  }
});

app.post('/api/budgets', auth, async (req, res) => {
  try {
    const category = String(req.body.category || '').trim();
    const amount = Number(req.body.amount);
    const month = req.body.month;

    if (!category || !Number.isFinite(amount) || amount <= 0 ||
        !/^\d{4}-\d{2}-\d{2}$/.test(String(month || ''))) {
      return res.status(400).json({
        message: 'Category, positive amount and month (YYYY-MM-DD) are required.'
      });
    }

    const result = await pool.query(
      `INSERT INTO budgets (user_id, category, amount, month)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, category, month)
       DO UPDATE SET amount = EXCLUDED.amount
       RETURNING id, category, amount, month`,
      [req.user.id, category, amount, month]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Saving budget failed:', error.message);
    res.status(500).json({ message: 'Could not save budget.' });
  }
});

// ─── Bills ────────────────────────────────────────────────────────────────────

app.get('/api/bills', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, amount, due_date, status, notes, created_at
       FROM bills WHERE user_id = $1
       ORDER BY due_date ASC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Fetching bills failed:', error.message);
    res.status(500).json({ message: 'Could not fetch bills.' });
  }
});

app.post('/api/bills', auth, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const amount = Number(req.body.amount);
    const dueDate = req.body.due_date || null;
    const notes = String(req.body.notes || '').trim();

    if (!name || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        message: 'Bill name and a positive amount are required.'
      });
    }

    const result = await pool.query(
      `INSERT INTO bills (user_id, name, amount, due_date, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, amount, due_date, status, notes, created_at`,
      [req.user.id, name, amount, dueDate, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Adding bill failed:', error.message);
    res.status(500).json({ message: 'Could not add bill.' });
  }
});

app.put('/api/bills/:id', auth, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const amount = Number(req.body.amount);
    const dueDate = req.body.due_date || null;
    const notes = String(req.body.notes || '').trim();

    if (!name || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        message: 'Bill name and a positive amount are required.'
      });
    }

    const result = await pool.query(
      `UPDATE bills SET name = $1, amount = $2, due_date = $3, notes = $4
       WHERE id = $5 AND user_id = $6
       RETURNING id, name, amount, due_date, status, notes`,
      [name, amount, dueDate, notes, req.params.id, req.user.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: 'Bill not found.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Updating bill failed:', error.message);
    res.status(500).json({ message: 'Could not update bill.' });
  }
});

app.patch('/api/bills/:id/pay', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE bills SET status = 'paid'
       WHERE id = $1 AND user_id = $2
       RETURNING id, name, amount, due_date, status`,
      [req.params.id, req.user.id]
    );
    if (!result.rowCount) {
      return res.status(404).json({ message: 'Bill not found.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Marking bill paid failed:', error.message);
    res.status(500).json({ message: 'Could not mark bill as paid.' });
  }
});

app.delete('/api/bills/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM bills WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!result.rowCount) {
      return res.status(404).json({ message: 'Bill not found.' });
    }
    res.json({ message: 'Bill deleted successfully.' });
  } catch (error) {
    console.error('Deleting bill failed:', error.message);
    res.status(500).json({ message: 'Could not delete bill.' });
  }
});

// ─── Savings Goals ────────────────────────────────────────────────────────────

app.get('/api/savings', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, target_amount, saved_amount, deadline, notes, created_at
       FROM savings_goals WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Fetching savings goals failed:', error.message);
    res.status(500).json({ message: 'Could not fetch savings goals.' });
  }
});

app.post('/api/savings', auth, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const targetAmount = Number(req.body.target_amount);
    const deadline = req.body.deadline || null;
    const notes = String(req.body.notes || '').trim();

    if (!name || !Number.isFinite(targetAmount) || targetAmount <= 0) {
      return res.status(400).json({
        message: 'Goal name and a positive target amount are required.'
      });
    }

    const result = await pool.query(
      `INSERT INTO savings_goals (user_id, name, target_amount, deadline, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, target_amount, saved_amount, deadline, notes, created_at`,
      [req.user.id, name, targetAmount, deadline, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Adding savings goal failed:', error.message);
    res.status(500).json({ message: 'Could not add savings goal.' });
  }
});

app.patch('/api/savings/:id/contribute', auth, async (req, res) => {
  try {
    const contribution = Number(req.body.amount);
    if (!Number.isFinite(contribution) || contribution <= 0) {
      return res.status(400).json({ message: 'A positive contribution amount is required.' });
    }

    const result = await pool.query(
      `UPDATE savings_goals
       SET saved_amount = saved_amount + $1
       WHERE id = $2 AND user_id = $3
       RETURNING id, name, target_amount, saved_amount, deadline`,
      [contribution, req.params.id, req.user.id]
    );
    if (!result.rowCount) {
      return res.status(404).json({ message: 'Savings goal not found.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Contributing to savings goal failed:', error.message);
    res.status(500).json({ message: 'Could not update savings goal.' });
  }
});

app.put('/api/savings/:id', auth, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const targetAmount = Number(req.body.target_amount);
    const deadline = req.body.deadline || null;
    const notes = String(req.body.notes || '').trim();

    if (!name || !Number.isFinite(targetAmount) || targetAmount <= 0) {
      return res.status(400).json({
        message: 'Goal name and a positive target amount are required.'
      });
    }

    const result = await pool.query(
      `UPDATE savings_goals
       SET name = $1, target_amount = $2, deadline = $3, notes = $4
       WHERE id = $5 AND user_id = $6
       RETURNING id, name, target_amount, saved_amount, deadline, notes`,
      [name, targetAmount, deadline, notes, req.params.id, req.user.id]
    );
    if (!result.rowCount) {
      return res.status(404).json({ message: 'Savings goal not found.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Updating savings goal failed:', error.message);
    res.status(500).json({ message: 'Could not update savings goal.' });
  }
});

app.delete('/api/savings/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM savings_goals WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!result.rowCount) {
      return res.status(404).json({ message: 'Savings goal not found.' });
    }
    res.json({ message: 'Savings goal deleted successfully.' });
  } catch (error) {
    console.error('Deleting savings goal failed:', error.message);
    res.status(500).json({ message: 'Could not delete savings goal.' });
  }
});

// ─── Start server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`HomeLedger Pro API running on port ${PORT}`);
});
