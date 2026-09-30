import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Lock, ArrowLeft, ArrowRight, CheckCircle2, KeyRound } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { navigate, showToast } = useApp();
  const [step, setStep] = useState<'email' | 'otp' | 'reset' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError(null);
    showToast('Verification code sent! Use demo code 123456', 'info');
    setStep('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '123456') {
      setError('Invalid code. Use demo code: 123456');
      return;
    }
    setError(null);
    setStep('reset');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError(null);
    setStep('success');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[var(--background)]">
      <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-xl">
        <button
          onClick={() => navigate('login')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] mb-6 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Login</span>
        </button>

        {step === 'email' && (
          <form onSubmit={handleSendCode} className="space-y-5">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-[var(--primary)] mb-3">
                <KeyRound className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-[var(--text)]">Forgot Password</h2>
              <p className="text-xs text-[var(--muted)] mt-1">
                Enter your registered email address and we'll send a password reset code.
              </p>
            </div>

            {error && <div className="text-xs text-rose-500 font-medium">{error}</div>}

            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[var(--muted)]" />
                <input
                  type="email"
                  required
                  placeholder="shivam_dev@nexora.network"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] py-2.5 pl-10 pr-4 text-xs text-[var(--text)] focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3 text-xs font-bold text-white shadow-sm hover:opacity-95 transition-all"
            >
              <span>Send Verification Code</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-[var(--text)]">Enter Reset Code</h2>
              <p className="text-xs text-[var(--muted)] mt-1">
                Enter the code sent to {email}. (Demo code: <strong className="text-[var(--text)] font-mono">123456</strong>)
              </p>
            </div>

            {error && <div className="text-xs text-rose-500 font-medium">{error}</div>}

            <div>
              <input
                type="text"
                maxLength={6}
                required
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full text-center tracking-widest text-lg font-mono rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] py-2.5 text-[var(--text)] focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3 text-xs font-bold text-white shadow-sm hover:opacity-95 transition-all"
            >
              <span>Verify Code</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-[var(--text)]">Choose New Password</h2>
              <p className="text-xs text-[var(--muted)] mt-1">
                Your new password must be at least 6 characters long.
              </p>
            </div>

            {error && <div className="text-xs text-rose-500 font-medium">{error}</div>}

            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[var(--muted)]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] py-2.5 pl-10 pr-4 text-xs text-[var(--text)] focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[var(--muted)]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] py-2.5 pl-10 pr-4 text-xs text-[var(--text)] focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3 text-xs font-bold text-white shadow-sm hover:opacity-95 transition-all mt-2"
            >
              <span>Update Password</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <h3 className="text-lg font-bold text-[var(--text)]">Password Reset Complete</h3>
            <p className="text-xs text-[var(--muted)]">
              Your password has been successfully updated. You can now sign in with your new credentials.
            </p>
            <button
              onClick={() => navigate('login')}
              className="w-full rounded-xl bg-[var(--primary)] py-3 text-xs font-bold text-white shadow-sm hover:opacity-95 transition-all"
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
