import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setToken, getToken, clearToken } from '../lib/api';

const AuthContext = createContext();

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSION_USER_KEY = 'homeledger_session_user_v3';
const ACTIVITY_STORAGE_KEY = 'homeledger_activity_logs_v2';
const MASTER_ADMIN_KEY = 'homeledger_master_admin_email_v2';
const DEFAULT_MASTER_ADMIN_EMAIL = 'admin@homeledger.com';

// ─── Determine if the backend is reachable ────────────────────────────────────
// When offline (or migration not run), gracefully fall back to localStorage mode.

async function checkBackendAlive() {
  try {
    const r = await fetch('/api/health', { method: 'GET' });
    return r.ok;
  } catch {
    return false;
  }
}

// ─── LocalStorage fallback users (only used when backend is offline) ──────────

const USERS_STORAGE_KEY = 'homeledger_all_users_v2';
const DEFAULT_USERS = [
  {
    id: 'usr-admin-1',
    name: 'Owner',
    email: 'admin@homeledger.com',
    password: 'admin',
    role: 'admin',
    isSuperAdmin: true,
    provider: 'email',
    avatar: '👑',
    avatarType: 'emoji',
    status: 'active',
    createdAt: '2026-09-01T10:00:00.000Z',
    lastLoginAt: null
  }
];

const INITIAL_LOGS = [
  {
    id: 'log-1',
    userId: 'usr-admin-1',
    userName: 'Owner (Master Admin)',
    userEmail: 'admin@homeledger.com',
    action: 'Admin System Initialized',
    details: 'Master Admin privileges restricted exclusively to verified owner',
    timestamp: '2026-09-23T08:30:00.000Z',
    type: 'system'
  }
];

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  // Whether we are connected to the real backend
  const [backendOnline, setBackendOnline] = useState(false);
  const [backendChecked, setBackendChecked] = useState(false);

  // Master admin email setting (localStorage)
  const [masterAdminEmail, setMasterAdminEmail] = useState(() =>
    localStorage.getItem(MASTER_ADMIN_KEY) || DEFAULT_MASTER_ADMIN_EMAIL
  );

  // localStorage fallback users
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_USERS;
  });

  // Current user session
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      // Clear any legacy localStorage session
      localStorage.removeItem('homeledger_session_user_v2');
      const saved = sessionStorage.getItem(SESSION_USER_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return null;
  });

  // Activity audit logs
  const [activityLogs, setActivityLogs] = useState(() => {
    try {
      const saved = localStorage.getItem(ACTIVITY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_LOGS;
  });

  // ─── Backend liveness check on mount ────────────────────────────────────────

  useEffect(() => {
    checkBackendAlive().then((alive) => {
      setBackendOnline(alive);
      setBackendChecked(true);
      if (alive) {
        console.log('[HomeLedger] Backend API is online. Using database mode.');
      } else {
        console.warn('[HomeLedger] Backend API is offline. Using localStorage fallback mode.');
      }
    });
  }, []);

  // ─── Restore session from token when backend comes online ───────────────────

  useEffect(() => {
    if (!backendOnline) return;
    const token = getToken();
    if (token && !currentUser) {
      api.auth.profile()
        .then(user => {
          const enriched = enrichUser(user);
          setCurrentUser(enriched);
          sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(enriched));
        })
        .catch(() => {
          clearToken();
        });
    }
  }, [backendOnline]);

  // ─── Persist session to sessionStorage ──────────────────────────────────────

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem(SESSION_USER_KEY);
    }
  }, [currentUser]);

  // ─── Persist localStorage fallback users ────────────────────────────────────

  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {}
  }, [users]);

  // ─── Persist activity logs ───────────────────────────────────────────────────

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activityLogs));
    } catch (e) {}
  }, [activityLogs]);

  // ─── Persist master admin email ──────────────────────────────────────────────

  useEffect(() => {
    localStorage.setItem(MASTER_ADMIN_KEY, masterAdminEmail);
  }, [masterAdminEmail]);

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  const checkIsAdmin = (user) => {
    if (!user) return false;
    const email = user.email?.toLowerCase().trim();
    const master = masterAdminEmail.toLowerCase().trim();
    return email === master || user.role === 'admin';
  };

  const isUserAdmin = checkIsAdmin(currentUser);

  /**
   * Normalize a user object from either backend or localStorage into the
   * shape the frontend components expect.
   */
  function enrichUser(raw) {
    const isMaster = raw.email?.toLowerCase().trim() === masterAdminEmail.toLowerCase().trim();
    return {
      id: raw.id ? String(raw.id) : `usr-${Date.now()}`,
      name: raw.name || 'User',
      email: raw.email || '',
      role: isMaster ? 'admin' : (raw.role || 'user'),
      isSuperAdmin: isMaster,
      provider: raw.provider || 'email',
      avatar: raw.avatar || (isMaster ? '👑' : '👨‍💼'),
      avatarType: raw.avatarType || 'emoji',
      status: raw.status || 'active',
      createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      // Keep backend fields
      _fromBackend: !!raw.created_at
    };
  }

  const recordActivity = (action, details, user = currentUser, type = 'auth') => {
    const newLog = {
      id: `log-${Date.now()}`,
      userId: user?.id || 'guest',
      userName: user?.name || 'Anonymous User',
      userEmail: user?.email || 'N/A',
      action,
      details,
      timestamp: new Date().toISOString(),
      type
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 99)]);
  };

  // ─── LOGIN ───────────────────────────────────────────────────────────────────

  const login = async (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();

    // ── Backend mode ──────────────────────────────────────────────────────────
    if (backendOnline) {
      const response = await api.auth.login(trimmedEmail, password);
      setToken(response.token);
      const enriched = enrichUser(response.user);
      setCurrentUser(enriched);
      recordActivity('Email Sign-In (Database)', 'User signed in via backend API', enriched, 'auth');
      return enriched;
    }

    // ── Fallback: localStorage mode ───────────────────────────────────────────
    const user = users.find(u => u.email.toLowerCase() === trimmedEmail);
    if (!user) {
      throw new Error('No account found with this email. Please sign up first.');
    }
    if (user.password && user.password !== password) {
      throw new Error('Incorrect password. Please verify your credentials.');
    }

    const isMaster = trimmedEmail === masterAdminEmail.toLowerCase().trim();
    const updatedUser = {
      ...user,
      role: isMaster ? 'admin' : (user.role === 'admin' ? 'admin' : 'user'),
      isSuperAdmin: isMaster,
      lastLoginAt: new Date().toISOString()
    };
    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    recordActivity('Email Sign-In (localStorage)', 'User signed in via local fallback', updatedUser, 'auth');
    return updatedUser;
  };

  // ─── SIGNUP / REGISTER ───────────────────────────────────────────────────────

  const signup = async (name, email, password) => {
    const trimmedEmail = email.trim().toLowerCase();

    // ── Backend mode ──────────────────────────────────────────────────────────
    if (backendOnline) {
      const response = await api.auth.register(name.trim(), trimmedEmail, password);
      setToken(response.token);
      const enriched = enrichUser(response.user);
      setCurrentUser(enriched);
      recordActivity('Registration (Database)', `New user registered via backend API. Role: ${enriched.role}`, enriched, 'signup');
      return enriched;
    }

    // ── Fallback: localStorage mode ───────────────────────────────────────────
    const existing = users.find(u => u.email.toLowerCase() === trimmedEmail);
    if (existing) {
      throw new Error('An account with this email already exists. Please log in.');
    }

    const isMaster = trimmedEmail === masterAdminEmail.toLowerCase().trim();
    const assignedRole = isMaster ? 'admin' : 'user';

    const newUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: trimmedEmail,
      password,
      role: assignedRole,
      isSuperAdmin: isMaster,
      provider: 'email',
      avatar: assignedRole === 'admin' ? '👑' : '👨‍💼',
      avatarType: 'emoji',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    recordActivity('Registration (localStorage)', `New member joined. Role: ${assignedRole}`, newUser, 'signup');
    return newUser;
  };

  // ─── GOOGLE LOGIN (localStorage only — no backend OAuth integration) ─────────

  const loginWithGoogle = (googleData) => {
    const trimmedEmail = googleData.email.trim().toLowerCase();
    let user = users.find(u => u.email.toLowerCase() === trimmedEmail);
    const isMaster = trimmedEmail === masterAdminEmail.toLowerCase().trim();

    if (user) {
      const updatedUser = {
        ...user,
        name: googleData.name || user.name,
        avatar: googleData.avatar || user.avatar,
        avatarType: 'image',
        provider: 'google',
        role: isMaster ? 'admin' : user.role,
        isSuperAdmin: isMaster,
        lastLoginAt: new Date().toISOString()
      };
      setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
      setCurrentUser(updatedUser);
      recordActivity('Google Sign-In', 'Logged in via Google Identity Services', updatedUser, 'auth');
      return updatedUser;
    } else {
      const assignedRole = isMaster ? 'admin' : 'user';
      const newUser = {
        id: `usr-google-${Date.now()}`,
        name: googleData.name,
        email: trimmedEmail,
        password: null,
        role: assignedRole,
        isSuperAdmin: isMaster,
        provider: 'google',
        avatar: googleData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
        avatarType: 'image',
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      setUsers(prev => [newUser, ...prev]);
      setCurrentUser(newUser);
      recordActivity('Google Sign-Up', `New user registered via Google as ${assignedRole}`, newUser, 'signup');
      return newUser;
    }
  };

  // ─── RESET PASSWORD (localStorage only) ─────────────────────────────────────

  const resetPassword = (email, newPassword) => {
    const trimmedEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === trimmedEmail);

    if (!user) throw new Error('No account found with this email address.');
    if (user.provider === 'google' && !user.password) {
      throw new Error('This account uses Google Sign-In and has no local password to reset.');
    }
    if (!newPassword || newPassword.length < 4) {
      throw new Error('New password must be at least 4 characters.');
    }

    setUsers(prev =>
      prev.map(u =>
        u.email.toLowerCase() === trimmedEmail ? { ...u, password: newPassword } : u
      )
    );

    if (currentUser?.email.toLowerCase() === trimmedEmail) {
      setCurrentUser(prev => ({ ...prev, password: newPassword }));
    }

    recordActivity('Password Reset', `Password reset locally for: ${trimmedEmail}`, user, 'auth');
  };

  // ─── LOGOUT ──────────────────────────────────────────────────────────────────

  const logout = () => {
    if (currentUser) {
      recordActivity('User Logged Out', 'Ended active session', currentUser, 'auth');
    }
    clearToken();
    sessionStorage.removeItem(SESSION_USER_KEY);
    setCurrentUser(null);
  };

  // ─── Admin actions ────────────────────────────────────────────────────────────

  const updateUserRole = (userId, newRole) => {
    if (!isUserAdmin) throw new Error('Unauthorized. Only Administrator can change roles.');
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    if (currentUser?.id === userId) setCurrentUser(prev => ({ ...prev, role: newRole }));
    recordActivity('User Role Changed', `User ID ${userId} role changed to ${newRole}`, currentUser, 'admin');
  };

  const setAsMasterAdmin = (emailToClaim) => {
    const trimmed = emailToClaim.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      throw new Error('Please enter a valid email address to claim Master Admin.');
    }
    setMasterAdminEmail(trimmed);
    setUsers(prev =>
      prev.map(u => u.email.toLowerCase() === trimmed ? { ...u, role: 'admin', isSuperAdmin: true } : u)
    );
    if (currentUser?.email.toLowerCase() === trimmed) {
      setCurrentUser(prev => ({ ...prev, role: 'admin', isSuperAdmin: true }));
    }
    recordActivity('Master Admin Updated', `Ownership claimed for ${trimmed}`, currentUser, 'admin');
  };

  const deleteUser = (userId) => {
    if (!isUserAdmin) throw new Error('Unauthorized.');
    if (currentUser?.id === userId) throw new Error('You cannot delete your own active administrator account.');
    const target = users.find(u => u.id === userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
    recordActivity('User Deleted', `User ${target?.name || userId} was removed by admin`, currentUser, 'admin');
  };

  const toggleUserStatus = (userId) => {
    if (!isUserAdmin) throw new Error('Unauthorized.');
    setUsers(prev =>
      prev.map(u => u.id === userId ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u)
    );
    recordActivity('User Status Changed', `Toggled account status for ${userId}`, currentUser, 'admin');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        activityLogs,
        masterAdminEmail,
        isUserAdmin,
        backendOnline,
        backendChecked,
        login,
        signup,
        loginWithGoogle,
        logout,
        resetPassword,
        updateUserRole,
        setAsMasterAdmin,
        deleteUser,
        toggleUserStatus,
        recordActivity
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
