const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const { sequelize } = require('./database/models');
const redisClient = require('./config/redis');

let server;

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    logger.info('MySQL connected and synced via Sequelize');

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
  await sequelize.close();
  redisClient.disconnect();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason });
});

start();
