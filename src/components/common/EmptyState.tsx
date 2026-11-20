import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] px-6 py-12">
      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-[#1A2230] border border-slate-200 dark:border-[#252D3A] flex items-center justify-center text-[#8B5CF6] mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-[#F8FAFC]">
        {title}
      </h3>
      <p className="mt-1.5 text-sm text-slate-600 dark:text-[#94A3B8] max-w-sm leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-95 active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
