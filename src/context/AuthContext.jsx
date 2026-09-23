import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const USERS_STORAGE_KEY = 'homeledger_all_users_v2';
const SESSION_STORAGE_KEY = 'homeledger_session_user_v2';
const ACTIVITY_STORAGE_KEY = 'homeledger_activity_logs_v2';
const MASTER_ADMIN_KEY = 'homeledger_master_admin_email_v2';

const DEFAULT_MASTER_ADMIN_EMAIL = 'admin@homeledger.com';

const DEFAULT_USERS = [
  {
    id: 'usr-admin-1',
    name: 'Owner (Master Admin)',
    email: 'admin@homeledger.com',
    password: 'admin',
    role: 'admin',
    isSuperAdmin: true,
    provider: 'email',
    avatar: '👑',
    avatarType: 'emoji',
    status: 'active',
    createdAt: '2026-09-01T10:00:00.000Z',
    lastLoginAt: '2026-09-23T08:30:00.000Z'
  },
  {
    id: 'usr-google-1',
    name: 'Rohit Sharma',
    email: 'rohit.sharma@gmail.com',
    password: null,
    role: 'user',
    isSuperAdmin: false,
    provider: 'google',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
    avatarType: 'image',
    status: 'active',
    createdAt: '2026-09-10T14:20:00.000Z',
    lastLoginAt: '2026-09-22T19:45:00.000Z'
  },
  {
    id: 'usr-user-2',
    name: 'Priya Patel',
    email: 'priya.patel@outlook.com',
    password: 'user123',
    role: 'user',
    isSuperAdmin: false,
    provider: 'email',
    avatar: '👩‍💼',
    avatarType: 'emoji',
    status: 'active',
    createdAt: '2026-09-15T11:15:00.000Z',
    lastLoginAt: '2026-09-23T07:10:00.000Z'
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

export const AuthProvider = ({ children }) => {
  // Master Admin Email setting
  const [masterAdminEmail, setMasterAdminEmail] = useState(() => {
    return localStorage.getItem(MASTER_ADMIN_KEY) || DEFAULT_MASTER_ADMIN_EMAIL;
  });

  // All registered users
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load users:', e);
    }
    return DEFAULT_USERS;
  });

  // Current logged in user session (Default to the Master Admin)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load session:', e);
    }
    return DEFAULT_USERS[0];
  });

  // Activity audit logs
  const [activityLogs, setActivityLogs] = useState(() => {
    try {
      const saved = localStorage.getItem(ACTIVITY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load activity logs:', e);
    }
    return INITIAL_LOGS;
  });

  // Sync users
  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving users:', e);
    }
  }, [users]);

  // Sync currentUser session
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Error saving session:', e);
    }
  }, [currentUser]);

  // Sync activity logs
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activityLogs));
    } catch (e) {
      console.error('Error saving logs:', e);
    }
  }, [activityLogs]);

  // Sync master admin email
  useEffect(() => {
    localStorage.setItem(MASTER_ADMIN_KEY, masterAdminEmail);
  }, [masterAdminEmail]);

  // Check if an email or user is the Master Admin
  const checkIsAdmin = (user) => {
    if (!user) return false;
    const email = user.email?.toLowerCase().trim();
    const master = masterAdminEmail.toLowerCase().trim();
    return email === master || user.role === 'admin';
  };

  const isUserAdmin = checkIsAdmin(currentUser);

  // Record an audit activity
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

  // Login with email & password
  const login = (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === trimmedEmail);

    if (!user) {
      throw new Error('No account found with this email. Please sign up first.');
    }

    if (user.password && user.password !== password) {
      throw new Error('Incorrect password. Please verify your credentials.');
    }

    // Determine role strictly: only master admin gets admin privileges
    const isMaster = trimmedEmail === masterAdminEmail.toLowerCase().trim();
    const updatedUser = {
      ...user,
      role: isMaster ? 'admin' : (user.role === 'admin' ? 'admin' : 'user'),
      isSuperAdmin: isMaster,
      lastLoginAt: new Date().toISOString()
    };

    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    recordActivity('Email Sign-In', `User signed in successfully`, updatedUser, 'auth');
    return updatedUser;
  };

  // Sign up new user (PUBLIC SIGNUPS ARE ALWAYS NORMAL USERS - NEVER ADMIN!)
  const signup = (name, email, password) => {
    const trimmedEmail = email.trim().toLowerCase();
    const existing = users.find(u => u.email.toLowerCase() === trimmedEmail);

    if (existing) {
      throw new Error('An account with this email already exists. Please log in.');
    }

    // Strict security: Only the predefined master admin email gets admin, all other signups get 'user'
    const isMaster = trimmedEmail === masterAdminEmail.toLowerCase().trim();
    const assignedRole = isMaster ? 'admin' : 'user';

    const newUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: trimmedEmail,
      password: password,
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
    recordActivity('New User Registration', `New member joined. Role assigned: ${assignedRole}`, newUser, 'signup');
    return newUser;
  };

  // Login or Register via Google OAuth
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
      recordActivity('Google OAuth Sign-In', 'Logged in via Google Identity Services', updatedUser, 'auth');
      return updatedUser;
    } else {
      // Brand new user joining via Google is ALWAYS a regular 'user' (unless master email)
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
      recordActivity('Google OAuth Sign-Up', `New user registered via Google as ${assignedRole}`, newUser, 'signup');
      return newUser;
    }
  };

  // Logout
  const logout = () => {
    if (currentUser) {
      recordActivity('User Logged Out', 'Ended active session', currentUser, 'auth');
    }
    setCurrentUser(null);
  };

  // Admin action: Change user role
  const updateUserRole = (userId, newRole) => {
    if (!isUserAdmin) throw new Error('Unauthorized. Only Administrator can change roles.');
    
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    }));

    if (currentUser?.id === userId) {
      setCurrentUser(prev => ({ ...prev, role: newRole }));
    }

    recordActivity('User Role Changed', `User ID ${userId} role changed to ${newRole}`, currentUser, 'admin');
  };

  // Set your own custom email as the permanent Master Admin!
  const setAsMasterAdmin = (emailToClaim) => {
    const trimmed = emailToClaim.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      throw new Error('Please enter a valid email address to claim Master Admin.');
    }

    setMasterAdminEmail(trimmed);

    // Update role of that user if they exist
    setUsers(prev => prev.map(u => {
      if (u.email.toLowerCase() === trimmed) {
        return { ...u, role: 'admin', isSuperAdmin: true };
      }
      return u;
    }));

    // If current user is this email
    if (currentUser?.email.toLowerCase() === trimmed) {
      setCurrentUser(prev => ({ ...prev, role: 'admin', isSuperAdmin: true }));
    }

    recordActivity('Master Admin Updated', `Ownership claimed for ${trimmed}`, currentUser, 'admin');
  };

  // Admin action: Delete user
  const deleteUser = (userId) => {
    if (!isUserAdmin) throw new Error('Unauthorized.');
    if (currentUser?.id === userId) {
      throw new Error('You cannot delete your own active administrator account.');
    }
    const target = users.find(u => u.id === userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
    recordActivity('User Deleted', `User ${target?.name || userId} was removed by admin`, currentUser, 'admin');
  };

  // Admin action: Toggle user status
  const toggleUserStatus = (userId) => {
    if (!isUserAdmin) throw new Error('Unauthorized.');
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'active' ? 'suspended' : 'active';
        return { ...u, status: nextStatus };
      }
      return u;
    }));
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
        login,
        signup,
        loginWithGoogle,
        logout,
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
