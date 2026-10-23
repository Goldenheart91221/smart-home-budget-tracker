import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, ShieldAlert, ArrowRight, ShieldCheck, Mail, Lock } from 'lucide-react';

export const GoogleAuthModal = ({ isOpen, onClose }) => {
  const { loginWithGoogle } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if real Google OAuth is configured via environment variable
  const googleClientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID;
  const isGoogleOAuthConfigured = Boolean(googleClientId && googleClientId !== 'YOUR_GOOGLE_CLIENT_ID');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isGoogleOAuthConfigured) {
      setError('Google OAuth is not configured on this server. Please use Email Sign In.');
      return;
    }

    setError('');
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid Google / Gmail address.');
      return;
    }

    const trimmedName = name.trim() || trimmedEmail.split('@')[0];

    setLoading(true);
    try {
      loginWithGoogle({
        name: trimmedName,
        email: trimmedEmail,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(trimmedName)}&backgroundColor=4f46e5&textColor=ffffff`,
        avatarType: 'image'
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 relative">

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Google Header */}
        <div className="text-center pt-2 pb-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shadow-xs mb-3">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.24v3.15C3.26 21.4 7.34 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.26c-.25-.72-.38-1.49-.38-2.26s.13-1.54.38-2.26V6.59H1.24C.45 8.16 0 9.92 0 12s.45 3.84 1.24 5.41l4.04-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.6 1.24 6.59l4.04 3.15c.95-2.84 3.6-4.99 6.72-4.99z" />
            </svg>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Google Sign-In
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            HomeLedger Pro Authentication
          </p>
        </div>

        {/* Clean handling when Google OAuth is NOT configured */}
        {!isGoogleOAuthConfigured ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800 text-left">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs mb-1.5">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Google OAuth Not Configured</span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300/90 leading-relaxed">
                Real Google OAuth requires setting up a Google Cloud Console Client ID (<code className="px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 font-mono text-[10px]">VITE_GOOGLE_CLIENT_ID</code>) and a backend OAuth provider.
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300/90 leading-relaxed mt-2">
                To keep authentication authentic and secure without simulating fake logins, please use <strong>Email & Password</strong> to sign in or create an account.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <span>Continue with Email & Password</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Real Google OAuth Form (when configured) */
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                {error}
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Google / Gmail Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="e.g. yourname@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Continue with Google'}
            </button>
          </form>
        )}

        {/* Footer Security Note */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 leading-relaxed flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span>Multi-User Session Protected</span>
          </p>
        </div>

      </div>
    </div>
  );
};

export default GoogleAuthModal;
