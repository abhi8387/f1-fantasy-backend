const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redisClient = require('../config/redis');
const ApiError = require('../utils/ApiError');


/**
 * Factory for Redis-backed rate limiters so limits are enforced consistently
 * across multiple backend instances, not per-process.
 */
function createRateLimiter({ windowMs, max, prefix, message = 'Too many requests, please try again later' }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
      prefix: `rl:${prefix}:`,
    }),
    handler: (req, res, next) => next(new ApiError(429, message)),
  });
}

module.exports = createRateLimiter;
