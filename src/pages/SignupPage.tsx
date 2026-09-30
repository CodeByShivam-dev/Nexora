import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Mail, Lock, CheckCircle2, ArrowRight, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import api from '../services/api';

export const SignupPage: React.FC = () => {
  const { navigate, showToast } = useApp();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !username.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!termsAccepted) {
      setError('You must accept the Terms of Service to continue.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await api.register({
        username: username.trim(),
        email: email.trim(),
        password,
        displayName: displayName.trim(),
      });
      setIsLoading(false);

      if (res.status === 201 && res.data) {
        showToast(res.message || 'Account created! Please verify your OTP.', 'success');
        navigate('verify-otp', {
          email: res.data.email || email,
          username: res.data.username || username,
          displayName: res.data.displayName || displayName,
          userId: res.data.userId || '',
          otpCode: res.data.otpCode || '',
        });
      } else if (res.status === 409) {
        setError(res.message || 'An account with this email or username already exists.');
      } else if (res.status === 429) {
        setError(res.message || 'Rate limit exceeded. Please wait a moment before trying again.');
      } else {
        setError(res.message || 'Failed to complete registration.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Could not connect to registration server.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[var(--background)]">
      <div className="w-full max-w-xl rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-10 shadow-xl">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-extrabold text-2xl shadow-lg">
            N
          </div>
          <h2 className="text-2xl font-bold text-[var(--text)] tracking-tight">
            Create your NEXORA account
          </h2>
          <p className="text-xs text-[var(--muted)]">
            Connect with creators, engineers, and friends across the globe.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 p-3.5 text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Names Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-[var(--muted)]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] py-2.5 pl-10 pr-4 text-xs text-[var(--text)] focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs text-[var(--muted)] font-mono">@</span>
                <input
                  type="text"
                  required
                  placeholder="alex_rivera"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] py-2.5 pl-9 pr-4 text-xs text-[var(--text)] focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:outline-none font-mono transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[var(--muted)]" />
              <input
                type="email"
                required
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] py-2.5 pl-10 pr-4 text-xs text-[var(--text)] focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Passwords Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[var(--muted)]" />
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] py-2.5 pl-10 pr-4 text-xs text-[var(--text)] focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[var(--muted)]" />
                <input
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] py-2.5 pl-10 pr-4 text-xs text-[var(--text)] focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
                <span>Strength: <strong className="text-[var(--text)]">{strength.label}</strong></span>
                <span>{password.length}/8 chars recommended</span>
              </div>
              <div className="h-1.5 w-full bg-[var(--surface-secondary)] rounded-full overflow-hidden flex gap-1">
                <div className={`h-full flex-1 rounded-full ${strength.score >= 1 ? strength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                <div className={`h-full flex-1 rounded-full ${strength.score >= 2 ? strength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                <div className={`h-full flex-1 rounded-full ${strength.score >= 3 ? strength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
              </div>
            </div>
          )}

          {/* Terms checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              <span className="text-xs text-[var(--text-secondary)] leading-relaxed">
                I agree to the <span className="text-[var(--primary)] font-medium">Terms of Service</span> and <span className="text-[var(--primary)] font-medium">Privacy Policy</span>.
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3 text-xs font-semibold text-white shadow-md hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration & Generate OTP</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[var(--muted)]">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('login')}
            className="font-semibold text-[var(--primary)] hover:underline"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};
