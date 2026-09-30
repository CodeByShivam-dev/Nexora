import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import api from '../services/api';

export const LoginPage: React.FC = () => {
  const { login, navigate, showToast } = useApp();

  // Keep login fields empty so users must provide their own credentials.
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitWait, setRateLimitWait] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier.trim()) {
      setError('Please enter your email or username');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError(null);
    setRateLimitWait(null);
    setIsLoading(true);

    try {
      const res = await api.login({ identifier, password });
      setIsLoading(false);

      if (res.status === 200 && res.data?.user) {
        const u = res.data.user;

        login(identifier, {
          id: String(u.id),
          name: u.displayName || u.username,
          username: u.username,
          email: u.email,
          avatar: u.avatar,
          role: u.role,
          isVerified: u.verified,
        });
      } else if (res.status === 429) {
        const waitTime = res.retryAfter || 60;

        setRateLimitWait(waitTime);
        setError(
          res.message ||
          `Rate limit exceeded: 5 login attempts per minute allowed. Please wait ${waitTime}s.`
        );

        showToast(
          res.message || 'Rate limit exceeded: 5 attempts/min.',
          'error'
        );
      } else if (res.data?.requiresOtp) {
        showToast(
          'Please verify your OTP code to activate your account.',
          'info'
        );

        navigate('verify-otp', {
          email: res.data.email || identifier,
          username: res.data.username || identifier,
          userId: res.data.userId || '',
        });
      } else {
        setError(
          res.message ||
          'Invalid username or password. Please try again.'
        );
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(
        err.message ||
        'Failed to connect to authentication server.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[var(--background)]">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-xl overflow-hidden">

        {/* Left Visual Preview Column */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white relative">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 font-extrabold text-lg text-white shadow-lg">
                N
              </div>

              <span className="text-xl font-bold tracking-tight">
                NEXORA
              </span>
            </div>

            <p className="text-xs text-indigo-200/90 leading-relaxed pt-2">
              Connect, share updates, and discover meaningful conversations on NEXORA.
            </p>

            {/* Platform Trust Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-[11px] text-emerald-300 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>

              <ShieldCheck className="h-3.5 w-3.5" />

              <span>Secure Session</span>
            </div>
          </div>

          {/* Social Proof Card */}
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300"
                alt="Shivam Kumar"
                className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-400"
              />

              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-white">
                    Shivam Kumar
                  </span>

                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />
                </div>

                <span className="text-[11px] text-indigo-200">
                  Software Engineer
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              "A seamless platform for meaningful discussions, fast direct messaging, and genuine community."
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-indigo-300/70 pt-2 border-t border-white/10">
            <span>© 2026 NEXORA</span>
            <span className="text-emerald-400">Encrypted</span>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">

            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[var(--text)] tracking-tight">
                  Welcome back
                </h2>
              </div>

              <p className="text-xs text-[var(--muted)] mt-1">
                Enter your credentials to continue to your account.
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 p-3.5 text-xs text-rose-600 dark:text-rose-400 font-medium flex items-start gap-2.5">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />

                <div>
                  <p>{error}</p>

                  {rateLimitWait && (
                    <p className="mt-1 text-[11px] text-rose-500 font-mono">
                      HTTP 429: Too Many Requests. Cooling down...
                    </p>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Identifier */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
                  Email or Username
                </label>

                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[var(--muted)]" />

                  <input
                    type="text"
                    required
                    placeholder="Enter your email or username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] py-2.5 pl-10 pr-4 text-xs text-[var(--text)] focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[var(--text)]">
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() => navigate('forgot-password')}
                    className="text-xs font-medium text-[var(--primary)] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[var(--muted)]" />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] py-2.5 pl-10 pr-10 text-xs text-[var(--text)] focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:outline-none transition-colors"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-[var(--muted)] hover:text-[var(--text)]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  />

                  <span className="text-xs text-[var(--text-secondary)]">
                    Remember my session
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-2.5 text-xs font-semibold text-white shadow-md hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Nexora</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer switch */}
            <div className="text-center text-xs text-[var(--muted)] pt-2 border-t border-[var(--border)]">
              Don't have an account?{' '}

              <button
                type="button"
                onClick={() => navigate('signup')}
                className="font-semibold text-[var(--primary)] hover:underline"
              >
                Create new account (Sign up)
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};