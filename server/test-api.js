// HomeLedger Pro — Backend API Test Suite
// Run from the server/ folder: node test-api.js
// Requires the server to be running on http://localhost:5000

const BASE = 'http://localhost:5000';
const EMAIL = `test_${Date.now()}@homeledger.test`;
const PASSWORD = 'TestPass123!';
const NAME = 'Test User';

let token = '';
let expenseId = '';
let billId = '';
let savingsId = '';
let incomeId = '';

const results = [];
let passed = 0;

async function req(method, path, body, authToken) {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json };
}

function check(label, actual, expected) {
  const ok = actual === expected;
  if (ok) passed++;
  results.push({ label, ok, actual, expected });
  console.log(`  ${ok ? '✅' : '❌'} [${label}] — expected ${expected}, got ${actual}`);
}

console.log('\n=== HomeLedger Pro API Tests ===\n');
console.log(`Testing against: ${BASE}`);
console.log(`Test account: ${EMAIL}\n`);

// 1. Health check
{
  const r = await req('GET', '/api/health');
  check('1. GET /api/health', r.status, 200);
}

// 2. DB health
{
  const r = await req('GET', '/api/db-health');
  check('2. GET /api/db-health', r.status, 200);
  if (r.json?.status !== 'connected') {
    console.log('     ⚠️  DB not connected — most tests will fail. Run server/migrate.sql first.');
  }
}

// 3. DB tables list
{
  const r = await req('GET', '/api/db-tables');
  check('3. GET /api/db-tables', r.status, 200);
  if (r.json?.missing?.length > 0) {
    console.log(`     ⚠️  Missing tables: ${r.json.missing.join(', ')} — run migrate.sql`);
  }
}

// 4. Register new user
{
  const r = await req('POST', '/api/auth/register', { name: NAME, email: EMAIL, password: PASSWORD });
  check('4. POST /api/auth/register (new user)', r.status, 201);
  token = r.json?.token || '';
  if (!token) console.log('     ⚠️  No token returned');
}

// 5. Duplicate registration
{
  const r = await req('POST', '/api/auth/register', { name: NAME, email: EMAIL, password: PASSWORD });
  check('5. POST /api/auth/register (duplicate)', r.status, 409);
}

// 6. Login
{
  const r = await req('POST', '/api/auth/login', { email: EMAIL, password: PASSWORD });
  check('6. POST /api/auth/login (correct password)', r.status, 200);
  if (r.json?.token) token = r.json.token;
}

// 7. Wrong password
{
  const r = await req('POST', '/api/auth/login', { email: EMAIL, password: 'WrongPass999' });
  check('7. POST /api/auth/login (wrong password)', r.status, 401);
}

// 8. User profile
{
  const r = await req('GET', '/api/user/profile', null, token);
  check('8. GET /api/user/profile', r.status, 200);
}

// 9. Add expense
{
  const r = await req('POST', '/api/expenses', {
    title: 'Test Groceries',
    amount: 500,
    category: 'Food',
    expense_date: '2026-10-01',
    notes: 'Test expense'
  }, token);
  check('9. POST /api/expenses', r.status, 201);
  expenseId = r.json?.id || '';
}

// 10. List expenses
{
  const r = await req('GET', '/api/expenses', null, token);
  check('10. GET /api/expenses', r.status, 200);
  if (!Array.isArray(r.json)) console.log('     ⚠️  Expected array response');
}

// 11. Edit expense
{
  if (expenseId) {
    const r = await req('PUT', `/api/expenses/${expenseId}`, {
      title: 'Updated Groceries',
      amount: 750,
      category: 'Food',
      expense_date: '2026-10-01'
    }, token);
    check('11. PUT /api/expenses/:id', r.status, 200);
  } else {
    check('11. PUT /api/expenses/:id', 0, 200);
    console.log('     ⚠️  Skipped — no expense ID');
  }
}

// 12. Expense summary
{
  const r = await req('GET', '/api/expenses/summary', null, token);
  check('12. GET /api/expenses/summary', r.status, 200);
}

// 13. Add income
{
  const r = await req('POST', '/api/income', {
    source: 'Monthly Salary',
    amount: 50000,
    category: 'Salary',
    income_date: '2026-10-01',
    notes: 'October salary'
  }, token);
  check('13. POST /api/income', r.status, 201);
  incomeId = r.json?.id || '';
}

// 14. List income
{
  const r = await req('GET', '/api/income', null, token);
  check('14. GET /api/income', r.status, 200);
}

// 15. Delete income
{
  if (incomeId) {
    const r = await req('DELETE', `/api/income/${incomeId}`, null, token);
    check('15. DELETE /api/income/:id', r.status, 200);
  } else {
    check('15. DELETE /api/income/:id', 0, 200);
    console.log('     ⚠️  Skipped — no income ID');
  }
}

// 16. Add bill
{
  const r = await req('POST', '/api/bills', {
    name: 'Electricity Bill',
    amount: 1200,
    due_date: '2026-11-05',
    notes: 'October electricity'
  }, token);
  check('16. POST /api/bills', r.status, 201);
  billId = r.json?.id || '';
}

// 17. List bills
{
  const r = await req('GET', '/api/bills', null, token);
  check('17. GET /api/bills', r.status, 200);
}

// 18. Mark bill paid
{
  if (billId) {
    const r = await req('PATCH', `/api/bills/${billId}/pay`, null, token);
    check('18. PATCH /api/bills/:id/pay', r.status, 200);
  } else {
    check('18. PATCH /api/bills/:id/pay', 0, 200);
    console.log('     ⚠️  Skipped — no bill ID');
  }
}

// 19. Delete bill
{
  if (billId) {
    const r = await req('DELETE', `/api/bills/${billId}`, null, token);
    check('19. DELETE /api/bills/:id', r.status, 200);
  } else {
    check('19. DELETE /api/bills/:id', 0, 200);
    console.log('     ⚠️  Skipped — no bill ID');
  }
}

// 20. Add savings goal
{
  const r = await req('POST', '/api/savings', {
    name: 'Emergency Fund',
    target_amount: 100000,
    deadline: '2027-06-01',
    notes: 'Build 6-month emergency fund'
  }, token);
  check('20. POST /api/savings', r.status, 201);
  savingsId = r.json?.id || '';
}

// 21. Contribute to savings
{
  if (savingsId) {
    const r = await req('PATCH', `/api/savings/${savingsId}/contribute`, { amount: 5000 }, token);
    check('21. PATCH /api/savings/:id/contribute', r.status, 200);
  } else {
    check('21. PATCH /api/savings/:id/contribute', 0, 200);
    console.log('     ⚠️  Skipped — no savings ID');
  }
}

// 22. Delete savings goal
{
  if (savingsId) {
    const r = await req('DELETE', `/api/savings/${savingsId}`, null, token);
    check('22. DELETE /api/savings/:id', r.status, 200);
  } else {
    check('22. DELETE /api/savings/:id', 0, 200);
    console.log('     ⚠️  Skipped — no savings ID');
  }
}

// 23. Add budget
{
  const r = await req('POST', '/api/budgets', {
    category: 'Food',
    amount: 5000,
    month: '2026-10-01'
  }, token);
  check('23. POST /api/budgets', r.status, 201);
}

// ─── Summary ──────────────────────────────────────────────────────────────────
const total = results.length;
console.log(`\n${'─'.repeat(50)}`);
console.log(`RESULT: ${passed}/${total} tests passed`);
if (passed === total) {
  console.log('🎉 All tests passed! Backend is fully functional.');
} else {
  console.log('❌ Some tests failed. Check the output above.');
  const failed = results.filter(r => !r.ok);
  console.log('\nFailed tests:');
  failed.forEach(f => console.log(`  • ${f.label}: expected ${f.expected}, got ${f.actual}`));
}
console.log('─'.repeat(50));
