import { TOO_MANY_REQUESTS } from '../constants/http';
import appAssert from './appAssert';

// Simple in-memory rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (
  identifier: string, 
  maxAttempts: number = 5, 
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): void => {
  const now = Date.now();
  const key = `google_auth_${identifier}`;
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // First attempt or window expired
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return;
  }

  if (record.count >= maxAttempts) {
    appAssert(false, TOO_MANY_REQUESTS, 'Too many Google authentication attempts. Please try again later.');
  }

  // Increment count
  record.count++;
  rateLimitStore.set(key, record);
};

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes
