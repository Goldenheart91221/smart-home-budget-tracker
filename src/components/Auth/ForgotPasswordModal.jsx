import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// NOTE FOR DEVELOPERS:
// This app currently uses localStorage-based authentication (no real backend).
// Because there is no email server, we cannot send a real password-reset email.
// This modal lets the user:
//   Step 1 → Enter their registered email to verify the account exists.
//   Step 2 → Choose a new password directly (local reset).
//
// To replace this with a real email-reset flow (e.g. Firebase, Supabase, etc.),
// replace the `handleVerifyEmail` and `handleResetPassword` handlers with your
// backend SDK calls and remove the Step 2 form (the backend handles it via link).
// ─────────────────────────────────────────────────────────────────────────────

const STEP = { EMAIL: 'email', NEW_PASSWORD: 'new_password', SUCCESS: 'success' };

export const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const { resetPassword, users } = useAuth();

  const [step, setStep]               = useState(STEP.EMAIL);
  const [email, setEmail]             = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);

  if (!isOpen) return null;

  // ── Step 1: Verify the email belongs to a real account ─────────────────────
  const handleVerifyEmail = (e) => {
    e.preventDefault();
    setError('');
    const trimmed = email.trim().toLowerCase();

    if (!trimmed || !trimmed.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    const account = users.find(u => u.email.toLowerCase() === trimmed);
    if (!account) {
      setError('No account found with this email address.');
      return;
    }

    if (account.provider === 'google' && !account.password) {
      setError(
        'This account was created using Google Sign-In. ' +
        'Please continue with Google to access your account — ' +
        'there is no password to reset.'
      );
      return;
    }

    // Account found and uses email/password — proceed to set new password
    setStep(STEP.NEW_PASSWORD);
  };

  // ── Step 2: Set the new password ────────────────────────────────────────────
  const handleResetPassword = (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 4) {
      setError('New password must be at least 4 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    setLoading(true);
    try {
      resetPassword(email.trim().toLowerCase(), newPassword);
      setStep(STEP.SUCCESS);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Close & reset all state ─────────────────────────────────────────────────
  const handleClose = () => {
    setStep(STEP.EMAIL);
    setEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setShowNew(false);
    setShowConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 relative">

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── STEP 1: Enter email ───────────────────────────────────────────── */}
        {step === STEP.EMAIL && (
          <>
            <div className="text-center pb-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center mb-3">
                <KeyRound className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Forgot Password?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Enter your registered email address and we'll help you set a new password.
              </p>
            </div>

            {/* Local-auth notice */}
            <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                <strong>Local account reset</strong> — This app stores accounts locally on this device.
                No reset email will be sent. You'll set a new password directly here.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    autoFocus
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-sm shadow-md transition"
              >
                Verify Email & Continue
              </button>
            </form>

            <button
              onClick={handleClose}
              className="w-full mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Login
            </button>
          </>
        )}

        {/* ── STEP 2: Set new password ──────────────────────────────────────── */}
        {step === STEP.NEW_PASSWORD && (
          <>
            <div className="text-center pb-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center mb-3">
                <Lock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Set New Password
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Account verified: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{email.trim().toLowerCase()}</span>
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3.5">
              {/* New password */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNew ? 'text' : 'password'}
                    required
                    autoFocus
                    placeholder="Min. 4 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-sm shadow-md transition disabled:opacity-60"
              >
                {loading ? 'Saving...' : 'Reset Password'}
              </button>
            </form>

            <button
              onClick={() => { setStep(STEP.EMAIL); setError(''); }}
              className="w-full mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          </>
        )}

        {/* ── STEP 3: Success ───────────────────────────────────────────────── */}
        {step === STEP.SUCCESS && (
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
              Password Updated!
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              Your password has been successfully reset for:
            </p>
            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-5">
              {email.trim().toLowerCase()}
            </p>

            <div className="mb-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5 text-left">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                You can now sign in with your new password. Your account data has not been affected.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-sm shadow-md transition"
            >
              Back to Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ForgotPasswordModal;
