import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Eye, EyeOff, Info, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { NexoraLogo } from '../../components/common/NexoraLogo';
import { useNexora } from '../../context/NexoraContext';
import { evaluatePasswordStrength } from '../../utils/formatters';

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters.')
      .max(24, 'Username must be 24 characters or fewer.')
      .regex(/^[a-zA-Z0-9._]+$/, 'Use letters, numbers, dots, or underscores only.'),
    email: z.string().email('Enter a valid email address.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { register: registerUser, isUsernameAvailable } = useNexora();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const watchedUsername = watch('username');
  const watchedPassword = watch('password');
  const strength = evaluatePasswordStrength(watchedPassword);
  const usernameValidFormat =
    watchedUsername.length >= 3 && /^[a-zA-Z0-9._]+$/.test(watchedUsername);
  const usernameFree = usernameValidFormat
    ? isUsernameAvailable(watchedUsername)
    : false;

  const onSubmit = (values: RegisterFormValues) => {
    setServerError(null);
    const result = registerUser({
      fullName: values.fullName,
      username: values.username,
      email: values.email,
      password: values.password,
    });
    if (!result.ok) {
      setServerError(result.error || 'Could not create account.');
      return;
    }
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-[#090B10] text-[#F8FAFC] flex flex-col justify-between px-4 py-8">
      <div className="max-w-md w-full mx-auto">
        <Link to="/" className="inline-flex mb-8">
          <NexoraLogo size="md" />
        </Link>

        <div className="rounded-2xl border border-[#252D3A] bg-[#141A24] p-6 sm:p-8 shadow-2xl space-y-5">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#F8FAFC]">
              Create your NEXORA account
            </h1>
            <p className="mt-1.5 text-sm text-[#94A3B8]">
              Join creators, designers, and engineers in this local interactive workspace.
            </p>
          </div>

          <div className="rounded-xl border border-[#252D3A] bg-[#0E121A] p-3 flex items-start gap-2.5 text-xs text-[#94A3B8]">
            <Info className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />
            <span>
              Demo registration stores your profile locally in browser storage—not a remote
              production server.
            </span>
          </div>

          {serverError && (
            <div className="rounded-xl border border-[#EF4444]/40 bg-[#EF4444]/10 px-3.5 py-2.5 text-xs font-medium text-[#FCA5A5]">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="Jordan Rivera"
                {...register('fullName')}
                className="w-full rounded-xl border border-[#252D3A] bg-[#0E121A] px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#8B5CF6]"
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-[#EF4444]">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="username" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="jordan.dev"
                {...register('username')}
                className="w-full rounded-xl border border-[#252D3A] bg-[#0E121A] px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#8B5CF6]"
              />
              {usernameValidFormat && (
                <p
                  className={`mt-1 text-xs flex items-center gap-1.5 ${
                    usernameFree ? 'text-[#22C55E]' : 'text-[#EF4444]'
                  }`}
                >
                  {usernameFree ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Username @{watchedUsername.toLowerCase()} is available locally
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      Username is already taken locally
                    </>
                  )}
                </p>
              )}
              {errors.username && (
                <p className="mt-1 text-xs text-[#EF4444]">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="jordan@example.com"
                {...register('email')}
                className="w-full rounded-xl border border-[#252D3A] bg-[#0E121A] px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#8B5CF6]"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-[#EF4444]">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  {...register('password')}
                  className="w-full rounded-xl border border-[#252D3A] bg-[#0E121A] pl-3.5 pr-11 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#8B5CF6]"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-white"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password Strength Meter */}
              {watchedPassword && (
                <div className="mt-2 space-y-1">
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 rounded-full transition-colors ${
                          strength.score >= step ? strength.color : 'bg-[#252D3A]'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-[#94A3B8]">
                    Strength: <span className="font-medium text-[#F8FAFC]">{strength.label}</span>
                  </p>
                </div>
              )}
              {errors.password && (
                <p className="mt-1 text-xs text-[#EF4444]">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-medium text-[#94A3B8] mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  {...register('confirmPassword')}
                  className="w-full rounded-xl border border-[#252D3A] bg-[#0E121A] pl-3.5 pr-11 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#8B5CF6]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-white"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-[#EF4444]">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-95 active:scale-[0.99] transition-all"
            >
              Create Account
            </button>
          </form>

          <p className="text-center text-xs text-[#94A3B8]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#06B6D4] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
