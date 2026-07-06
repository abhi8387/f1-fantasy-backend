const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const prisma = require('./database/prisma');
const redisClient = require('./config/redis');

let server;

async function start() {
  try {
    await prisma.$connect();
    logger.info('PostgreSQL connected via Prisma');

    server = app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    });
  } catch (err) {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
  }
}

async function shutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully`);
  if (server) server.close();
  await prisma.$disconnect();
  redisClient.disconnect();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason });
});

start();
