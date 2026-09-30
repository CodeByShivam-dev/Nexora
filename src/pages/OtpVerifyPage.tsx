import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, ArrowRight, RotateCw, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';

export const OtpVerifyPage: React.FC = () => {
  const { login, navigate, routeParams, showToast } = useApp();
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(45);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeOtpCode, setActiveOtpCode] = useState<string>(routeParams.otpCode || '');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();

    // If an otp code was received from registration, pre-populate if requested or display in banner
    if (routeParams.otpCode) {
      setActiveOtpCode(routeParams.otpCode);
    }

    // Timer countdown
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [routeParams.otpCode]);

  const handleChange = (index: number, value: string) => {
    const cleanVal = value.replace(/[^0-9]/g, '');
    if (!cleanVal) {
      const copy = [...digits];
      copy[index] = '';
      setDigits(copy);
      return;
    }

    const copy = [...digits];
    copy[index] = cleanVal.slice(-1);
    setDigits(copy);
    setError(null);

    // Auto-advance
    if (index < 5 && cleanVal) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 filled
    const fullCode = copy.join('');
    if (fullCode.length === 6) {
      verifyOtp(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasteData) return;

    const copy = [...digits];
    for (let i = 0; i < pasteData.length; i++) {
      copy[i] = pasteData[i];
    }
    setDigits(copy);
    if (pasteData.length === 6) {
      verifyOtp(pasteData);
    } else {
      inputRefs.current[pasteData.length]?.focus();
    }
  };

  const verifyOtp = async (code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const email = routeParams.email || 'shivam_dev@nexora.network';
      const username = routeParams.username || '';
      const userId = routeParams.userId || '';

      const res = await api.verifyOtp({
        email,
        username,
        userId,
        otp: code,
      });

      setIsLoading(false);

      if (res.status === 200 && res.data?.user) {
        setIsSuccess(true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        const u = res.data.user;
        showToast('Account successfully verified!', 'success');

        setTimeout(() => {
          login(u.email || email, {
            id: String(u.id),
            name: u.displayName || u.username,
            username: u.username,
            email: u.email,
            avatar: u.avatar,
            role: u.role,
            isVerified: true,
          });
        }, 1200);
      } else if (res.status === 429) {
        setError(res.message || 'Too many OTP attempts. Rate limit exceeded.');
      } else {
        setError(res.message || 'Invalid or expired OTP verification code.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Failed to verify OTP with server.');
    }
  };

  const handleResend = async () => {
    setResendTimer(45);
    setDigits(['', '', '', '', '', '']);
    setError(null);
    inputRefs.current[0]?.focus();

    try {
      const res = await api.resendOtp({
        email: routeParams.email,
        username: routeParams.username,
        userId: routeParams.userId,
      });
      if (res.status === 200 && res.data?.otpCode) {
        setActiveOtpCode(res.data.otpCode);
        showToast(`New verification code generated: ${res.data.otpCode}`, 'info');
      } else {
        showToast('New verification code sent! (Or use test OTP: 123456)', 'info');
      }
    } catch {
      showToast('New verification code sent! (Or use test OTP: 123456)', 'info');
    }
  };

  const handleAutoFillCode = (code: string) => {
    const chars = code.split('').slice(0, 6);
    const newDigits = ['', '', '', '', '', ''];
    chars.forEach((c, i) => (newDigits[i] = c));
    setDigits(newDigits);
    setError(null);
    if (chars.length === 6) {
      verifyOtp(code);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[var(--background)]">
      <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-10 shadow-xl text-center space-y-6">
        
        {/* Shield Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-[var(--primary)] border border-indigo-500/20 shadow-xs">
          <ShieldCheck className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        </div>

        {/* Heading */}
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold text-[var(--text)] tracking-tight">
            Verify your Account
          </h2>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            We sent a 6-digit confirmation code to{' '}
            <span className="font-semibold text-[var(--text)] font-mono">
              {routeParams.email || 'your registered email'}
            </span>
          </p>
        </div>

        {/* Demo / Sandbox OTP helper banner */}
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 dark:border-indigo-900/50 dark:bg-indigo-950/30 p-3.5 text-xs text-left space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span>Available OTP Code:</span>
            </span>
            <button
              type="button"
              onClick={() => handleAutoFillCode(activeOtpCode || '123456')}
              className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-semibold hover:bg-indigo-700 transition-colors"
            >
              Auto-Fill
            </button>
          </div>
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono font-bold tracking-widest text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
              {activeOtpCode || '123456'}
            </code>
            <span className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80">
              (One-time code)
            </span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success message */}
        {isSuccess && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 p-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center justify-center gap-2 animate-bounce">
            <CheckCircle2 className="h-4 w-4" />
            <span>Verified successfully! Activating account...</span>
          </div>
        )}

        {/* Digits Input */}
        <div className="flex justify-center gap-2 sm:gap-3 py-2">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => { inputRefs.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              disabled={isLoading || isSuccess}
              className={`h-12 w-11 sm:h-14 sm:w-12 rounded-xl border text-center text-lg sm:text-xl font-bold font-mono transition-all outline-none ${
                digit
                  ? 'border-[var(--primary)] bg-[var(--surface)] text-[var(--text)] shadow-xs scale-105'
                  : 'border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text)] focus:border-[var(--primary)] focus:bg-[var(--surface)]'
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => verifyOtp(digits.join(''))}
          disabled={digits.join('').length !== 6 || isLoading || isSuccess}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3 text-xs font-semibold text-white shadow-md hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-40 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verifying code...</span>
            </>
          ) : (
            <>
              <span>Verify & Activate Account</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        {/* Resend footer */}
        <div className="text-xs text-[var(--muted)] pt-2 border-t border-[var(--border)] space-y-2">
          <div>
            Didn't receive the email?{' '}
            {resendTimer > 0 ? (
              <span className="font-semibold text-[var(--text)]">
                Resend in {resendTimer}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="font-semibold text-[var(--primary)] hover:underline inline-flex items-center gap-1"
              >
                <RotateCw className="h-3 w-3" />
                Resend code
              </button>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={() => navigate('login')}
              className="text-[11px] text-[var(--muted)] hover:text-[var(--text)] hover:underline"
            >
              Return to Login
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
