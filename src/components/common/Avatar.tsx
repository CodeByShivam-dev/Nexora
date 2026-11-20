import { BadgeCheck } from 'lucide-react';
import { MediaImage } from './MediaResolver';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  ringState?: 'none' | 'unseen' | 'seen';
  verified?: boolean;
  onClick?: () => void;
  className?: string;
}

const SIZE_MAP = {
  xs: 'w-7 h-7',
  sm: 'w-9 h-9',
  md: 'w-11 h-11',
  lg: 'w-14 h-14',
  xl: 'w-24 h-24',
};

export function Avatar({
  src,
  name,
  size = 'md',
  ringState = 'none',
  verified = false,
  onClick,
  className = '',
}: AvatarProps) {
  const dimClass = SIZE_MAP[size];

  const ringWrapper =
    ringState === 'unseen'
      ? 'p-[2.5px] bg-gradient-to-tr from-[#8B5CF6] to-[#06B6D4] rounded-full'
      : ringState === 'seen'
      ? 'p-[2px] bg-slate-300 dark:bg-[#252D3A] rounded-full'
      : '';

  const innerPadding =
    ringState !== 'none'
      ? 'p-[2px] bg-white dark:bg-[#090B10] rounded-full'
      : '';

  const content = (
    <div className={`relative inline-flex shrink-0 ${ringWrapper} ${className}`}>
      <div className={`${innerPadding} rounded-full`}>
        <MediaImage
          src={src}
          alt={name}
          fallbackLabel={name.slice(0, 2).toUpperCase()}
          className={`${dimClass} rounded-full object-cover bg-slate-200 dark:bg-[#1A2230]`}
        />
      </div>
      {verified && (
        <span
          title="Verified demo creator"
          className="absolute -bottom-0.5 -right-0.5 rounded-full bg-white dark:bg-[#090B10] p-[1px]"
        >
          <BadgeCheck className="w-4 h-4 text-[#06B6D4]" />
        </span>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
        aria-label={`View ${name}`}
      >
        {content}
      </button>
    );
  }

  return content;
}
