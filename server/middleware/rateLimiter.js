/**
 * SupplyShield AI — In-Memory Rate Limiter Middleware (Phase 5)
 * 
 * Protects backend and prevents runaway requests by enforcing a sliding window
 * request quota per client IP. Returns HTTP 429 when quota is exceeded.
 */

import { config } from '../config.js';

// Map of IP -> array of timestamps
const requestBuckets = new Map();

/**
 * Resets all rate limit tracking (primarily for testing)
 */
export function resetRateLimits() {
  requestBuckets.clear();
}

/**
 * Creates rate limiter middleware
 */
export function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || config.RATE_LIMIT_WINDOW_MS;
  const maxRequests = options.maxRequests || config.RATE_LIMIT_MAX_REQUESTS;

  return function rateLimiterMiddleware(req, res, next) {
    const now = Date.now();
    const clientIp = req.ip || 
                     req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                     req.socket?.remoteAddress || 
                     '127.0.0.1';

    let timestamps = requestBuckets.get(clientIp) || [];
    // Discard timestamps older than the sliding window
    timestamps = timestamps.filter(ts => now - ts < windowMs);

    if (timestamps.length >= maxRequests) {
      const oldest = timestamps[0];
      const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));

      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        status: 'rate_limited',
        error: `Rate limit of ${maxRequests} requests per minute exceeded. Please wait ${retryAfterSeconds}s before retrying.`,
        retryAfterSeconds,
        fallbackRecommended: true
      });
    }

    timestamps.push(now);
    requestBuckets.set(clientIp, timestamps);
    return next();
  };
}

export const rateLimiter = createRateLimiter();
