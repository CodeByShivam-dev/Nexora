import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  timestamps: number[];
}

// In-memory sliding-window store (fallback when Redis is not configured or offline)
const inMemoryStore = new Map<string, RateLimitRecord>();

// Clean up stale in-memory records periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of inMemoryStore.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < 600000);
    if (record.timestamps.length === 0) {
      inMemoryStore.delete(key);
    }
  }
}, 30000);

export interface RateLimitOptions {
  windowMs: number; // window size in milliseconds, e.g. 60000 for 1 minute
  max: number; // max requests per window, e.g. 5
  message?: string;
  keyGenerator?: (req: Request) => string;
}

export const createRateLimiter = (options: RateLimitOptions) => {
  const {
    windowMs = 60000,
    max = 5,
    message = 'Too many requests. Please try again later.',
    keyGenerator = (req: Request) => {
      const forwarded = req.headers['x-forwarded-for'];
      const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0] : req.socket.remoteAddress) || '127.0.0.1';
      const userId = (req as any).user?.userId || '';
      const bodyIdentifier = req.body?.email || req.body?.username || req.body?.identifier || '';
      return `${ip}:${userId}:${bodyIdentifier}`;
    },
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyGenerator(req);
    const now = Date.now();

    let record = inMemoryStore.get(key);
    if (!record) {
      record = { timestamps: [] };
      inMemoryStore.set(key, record);
    }

    // Filter timestamps within current window
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    const currentCount = record.timestamps.length;
    const remaining = Math.max(0, max - currentCount);
    const oldestTimestamp = record.timestamps[0] || now;
    const resetTimeSeconds = Math.ceil((oldestTimestamp + windowMs - now) / 1000);

    // Set standard rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining - 1));
    res.setHeader('X-RateLimit-Reset', resetTimeSeconds);

    if (currentCount >= max) {
      res.setHeader('Retry-After', resetTimeSeconds);
      res.status(429).json({
        status: 429,
        error: 'Too Many Requests',
        message: message || `Rate limit exceeded. Maximum ${max} requests per ${Math.round(windowMs / 1000)}s allowed.`,
        retryAfter: resetTimeSeconds,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Record this attempt
    record.timestamps.push(now);
    next();
  };
};

// Section 28 rate limiters
export const loginRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Rate limit exceeded: Maximum 5 login attempts allowed per minute. Please try again after 60 seconds.',
});

export const registerRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Registration rate limit exceeded. Please wait 1 minute before trying again.',
});

export const otpRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: 'Too many OTP verification attempts. Please wait before trying again.',
});

export const postRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Post creation rate limit exceeded. Maximum 20 posts per minute.',
});

export const commentRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Comment rate limit exceeded. Maximum 30 comments per minute.',
});

export const followRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 50,
  message: 'Follow action rate limit exceeded. Maximum 50 follow requests per minute.',
});

export const searchRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Search rate limit exceeded. Maximum 60 queries per minute.',
});

export const messageRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Message rate limit exceeded. Maximum 30 messages per minute.',
});
