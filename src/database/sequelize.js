const { Sequelize } = require('sequelize');
const env = require('../config/env');
const logger = require('../config/logger');

const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
  host: env.DB_HOST,
  port: env.DB_PORT,
  dialect: 'mysql',
  logging: env.NODE_ENV === 'development' ? (sql) => logger.debug(sql) : false,
  define: {
    underscored: true,
  },
});

module.exports = sequelize;
