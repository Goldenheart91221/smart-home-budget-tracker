/**
 * HomeLedger Pro — API Client
 * Wraps all backend calls to http://localhost:5000 (proxied via Vite /api).
 * Stores JWT in sessionStorage so it's tab-scoped and cleared on tab close.
 */

const API_BASE = '/api';
const TOKEN_KEY = 'homeledger_jwt_token';

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  // Try to parse JSON; fallback to text
  let data;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const message =
      (typeof data === 'object' && data?.message) ||
      `API error: ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  return data;
}

// ─── Health ───────────────────────────────────────────────────────────────────

export const api = {
  health: {
    check: () => apiFetch('/health'),
    db: () => apiFetch('/db-health'),
    tables: () => apiFetch('/db-tables')
  },

  // ─── Auth ───────────────────────────────────────────────────────────────────

  auth: {
    register: (name, email, password) =>
      apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      }),

    login: (email, password) =>
      apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),

    profile: () => apiFetch('/user/profile')
  },

  // ─── Expenses ───────────────────────────────────────────────────────────────

  expenses: {
    list: () => apiFetch('/expenses'),

    create: (data) =>
      apiFetch('/expenses', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    update: (id, data) =>
      apiFetch(`/expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),

    delete: (id) =>
      apiFetch(`/expenses/${id}`, { method: 'DELETE' }),

    summary: () => apiFetch('/expenses/summary')
  },

  // ─── Income ─────────────────────────────────────────────────────────────────

  income: {
    list: () => apiFetch('/income'),

    create: (data) =>
      apiFetch('/income', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    delete: (id) =>
      apiFetch(`/income/${id}`, { method: 'DELETE' })
  },

  // ─── Budgets ────────────────────────────────────────────────────────────────

  budgets: {
    list: () => apiFetch('/budgets'),

    upsert: (data) =>
      apiFetch('/budgets', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  },

  // ─── Bills ──────────────────────────────────────────────────────────────────

  bills: {
    list: () => apiFetch('/bills'),

    create: (data) =>
      apiFetch('/bills', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    update: (id, data) =>
      apiFetch(`/bills/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),

    pay: (id) =>
      apiFetch(`/bills/${id}/pay`, { method: 'PATCH' }),

    delete: (id) =>
      apiFetch(`/bills/${id}`, { method: 'DELETE' })
  },

  // ─── Savings Goals ──────────────────────────────────────────────────────────

  savings: {
    list: () => apiFetch('/savings'),

    create: (data) =>
      apiFetch('/savings', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    update: (id, data) =>
      apiFetch(`/savings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),

    contribute: (id, amount) =>
      apiFetch(`/savings/${id}/contribute`, {
        method: 'PATCH',
        body: JSON.stringify({ amount })
      }),

    delete: (id) =>
      apiFetch(`/savings/${id}`, { method: 'DELETE' })
  }
};

export default api;
