interface NexoraLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function NexoraLogo({ size = 'md', showText = true, className = '' }: NexoraLogoProps) {
  const dim = size === 'sm' ? 28 : size === 'lg' ? 40 : 32;
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg';

  return (
    <span className={`inline-flex items-center gap-2.5 select-none whitespace-nowrap shrink-0 ${className}`}>
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="nexoraBrandGrad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#nexoraBrandGrad)" fillOpacity="0.14" stroke="url(#nexoraBrandGrad)" strokeWidth="1.75" />
        <path
          d="M12.5 28V12L27.5 28V12"
          stroke="url(#nexoraBrandGrad)"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showText && (
        <span className={`font-display font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC] ${textSize}`}>
          NEXORA
        </span>
      )}
    </span>
  );
}
