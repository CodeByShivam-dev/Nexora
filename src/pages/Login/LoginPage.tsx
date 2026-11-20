import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Info, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { NexoraLogo } from '../../components/common/NexoraLogo';
import { useNexora } from '../../context/NexoraContext';
import { DEMO_ACCOUNT_CREDENTIALS } from '../../data/seedData';

const loginSchema = z.object({
  identifier: z.string().min(2, 'Enter your email or username.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login, loginDemo } = useNexora();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    setAuthError(null);
    const result = login(values.identifier, values.password);
    if (!result.ok) {
      setAuthError(result.error || 'Could not sign in.');
      return;
    }
    navigate('/home');
  };

  const handleDemoLogin = () => {
    loginDemo();
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-[#090B10] text-[#F8FAFC] flex flex-col justify-between px-4 py-8">
      <div className="max-w-md w-full mx-auto">
        <Link to="/" className="inline-flex mb-8">
          <NexoraLogo size="md" />
        </Link>

        <div className="rounded-2xl border border-[#252D3A] bg-[#141A24] p-6 sm:p-8 shadow-2xl space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#F8FAFC]">
              Sign in to NEXORA
            </h1>
            <p className="mt-1.5 text-sm text-[#94A3B8]">
              Access your local demo profile, feed, and saved stories.
            </p>
          </div>

          {/* Honest Local Auth Disclosure */}
          <div className="rounded-xl border border-[#252D3A] bg-[#0E121A] p-3.5 flex items-start gap-2.5 text-xs text-[#94A3B8]">
            <Info className="w-4 h-4 text-[#06B6D4] shrink-0 mt-0.5" />
            <span>
              Frontend-only demo authentication. Credentials are checked against accounts
              stored locally in your browser.
            </span>
          </div>

          {authError && (
            <div className="rounded-xl border border-[#EF4444]/40 bg-[#EF4444]/10 px-3.5 py-2.5 text-xs font-medium text-[#FCA5A5]">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-medium text-[#94A3B8] mb-1.5"
              >
                Email or Username
              </label>
              <input
                id="identifier"
                type="text"
                autoComplete="username"
                placeholder="alex@nexora.dev or alex.chen"
                {...register('identifier')}
                className="w-full rounded-xl border border-[#252D3A] bg-[#0E121A] px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#8B5CF6]"
              />
              {errors.identifier && (
                <p className="mt-1 text-xs text-[#EF4444]">{errors.identifier.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-[#94A3B8] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  {...register('password')}
                  className="w-full rounded-xl border border-[#252D3A] bg-[#0E121A] pl-3.5 pr-11 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#8B5CF6]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-[#EF4444]">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-95 active:scale-[0.99] transition-all"
            >
              Sign In
            </button>
          </form>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-[#252D3A]" />
            <span className="px-3 text-xs text-[#64748B]">Quick Evaluation</span>
            <div className="flex-grow border-t border-[#252D3A]" />
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold border border-[#252D3A] bg-[#1A2230] text-[#F8FAFC] hover:border-[#06B6D4] transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#06B6D4]" />
            Continue as Demo User (@{DEMO_ACCOUNT_CREDENTIALS.username})
          </button>

          <p className="text-[11px] text-[#64748B] text-center">
            Demo credentials: {DEMO_ACCOUNT_CREDENTIALS.email} · {DEMO_ACCOUNT_CREDENTIALS.password}
          </p>

          <p className="text-center text-xs text-[#94A3B8]">
            New to NEXORA?{' '}
            <Link to="/register" className="text-[#06B6D4] font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      <p className="text-center text-xs text-[#64748B] mt-8">
        NEXORA · Local Browser Social Prototype
      </p>
    </div>
  );
}
