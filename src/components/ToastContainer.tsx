import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-6 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-lg backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' && (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            )}
            {toast.type === 'error' && (
              <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
            )}
            {toast.type === 'info' && (
              <Info className="h-4 w-4 text-[var(--primary)] shrink-0" />
            )}
            <span className="text-xs font-medium text-[var(--text)]">
              {toast.message}
            </span>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="flex h-5 w-5 items-center justify-center rounded-md text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
