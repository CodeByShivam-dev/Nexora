export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] p-5 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-[#1A2230]" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-36 rounded bg-slate-200 dark:bg-[#1A2230]" />
          <div className="h-2.5 w-24 rounded bg-slate-200 dark:bg-[#1A2230]" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3.5 w-full rounded bg-slate-200 dark:bg-[#1A2230]" />
        <div className="h-3.5 w-4/5 rounded bg-slate-200 dark:bg-[#1A2230]" />
      </div>
      <div className="h-48 w-full rounded-xl bg-slate-200 dark:bg-[#1A2230]" />
    </div>
  );
}
