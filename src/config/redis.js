const Redis = require('ioredis');
const env = require('./env');
const logger = require('./logger');

const redisClient = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 200, 2000),
});

redisClient.on('connect', () => logger.info('Redis connected'));
redisClient.on('error', (err) => logger.error('Redis connection error', { error: err.message }));

module.exports = redisClient;
