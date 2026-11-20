import { ImageOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { resolveMediaUrl } from '../../services/mediaDB';

interface MediaImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export function MediaImage({ src, alt, className = '', fallbackLabel }: MediaImageProps) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(() =>
    src && !src.startsWith('idb://') ? src : null
  );
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(Boolean(src?.startsWith('idb://')));

  useEffect(() => {
    let active = true;
    setFailed(false);

    if (!src) {
      setResolvedUrl(null);
      setLoading(false);
      return;
    }

    if (!src.startsWith('idb://')) {
      setResolvedUrl(src);
      setLoading(false);
      return;
    }

    setLoading(true);
    resolveMediaUrl(src)
      .then((url) => {
        if (!active) return;
        if (!url) {
          setFailed(true);
        }
        setResolvedUrl(url);
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [src]);

  if (loading) {
    return (
      <div
        className={`animate-pulse bg-slate-200 dark:bg-[#1A2230] ${className}`}
        aria-label={alt}
      />
    );
  }

  if (failed || !resolvedUrl) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#141A24] dark:to-[#1A2230] text-slate-500 dark:text-[#64748B] p-4 ${className}`}
      >
        <ImageOff className="w-6 h-6 opacity-60" />
        <span className="text-xs font-medium text-center max-w-[180px] truncate">
          {fallbackLabel || alt || 'Media unavailable'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolvedUrl}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

interface MediaVideoProps {
  src?: string;
  className?: string;
  muted?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  controls?: boolean;
  onLoadedMetadata?: (duration: number) => void;
  onEnded?: () => void;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}

export function MediaVideo({
  src,
  className = '',
  muted = true,
  autoPlay = true,
  loop = false,
  playsInline = true,
  controls = false,
  onLoadedMetadata,
  onEnded,
  videoRef,
}: MediaVideoProps) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(() =>
    src && !src.startsWith('idb://') ? src : null
  );

  useEffect(() => {
    let active = true;
    if (!src) {
      setResolvedUrl(null);
      return;
    }
    if (!src.startsWith('idb://')) {
      setResolvedUrl(src);
      return;
    }
    resolveMediaUrl(src).then((url) => {
      if (active) setResolvedUrl(url);
    });
    return () => {
      active = false;
    };
  }, [src]);

  if (!resolvedUrl) {
    return (
      <div className={`flex items-center justify-center bg-[#090B10] text-sm text-[#94A3B8] ${className}`}>
        Loading video...
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      src={resolvedUrl}
      muted={muted}
      autoPlay={autoPlay}
      loop={loop}
      playsInline={playsInline}
      controls={controls}
      onLoadedMetadata={(e) => {
        if (onLoadedMetadata) {
          onLoadedMetadata(e.currentTarget.duration || 5);
        }
      }}
      onEnded={onEnded}
      className={className}
    />
  );
}
