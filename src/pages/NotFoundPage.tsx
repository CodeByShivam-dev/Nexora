import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Home, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { navigate } = useApp();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-5">
      <div className="text-7xl sm:text-9xl font-black text-[var(--primary)] font-mono tracking-tighter opacity-80 select-none">
        404
      </div>

      <div className="space-y-1.5 max-w-md">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)] tracking-tight">
          Looks like this page doesn't exist.
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted)]">
          The link you followed may be broken or the content may have been moved or removed.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-secondary)] transition-all shadow-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Go Back</span>
        </button>

        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2 text-xs font-semibold text-white hover:opacity-90 transition-all shadow-xs"
        >
          <Home className="h-3.5 w-3.5" />
          <span>Go Home</span>
        </button>
      </div>
    </div>
  );
};
