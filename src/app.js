const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const logger = require('./config/logger');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const createRateLimiter = require('./middlewares/rateLimiter');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.http(`${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - start}ms`);
  });
  next();
});

app.use(
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 300,
    prefix: 'global',
    message: 'Too many requests from this IP, please try again later',
  })
);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.use(express.static(path.join(__dirname, '..', 'public')));

// Feature module routes
app.use('/api/v1/auth', require('./modules/auth/auth.routes'));
app.use('/api/v1/users', require('./modules/users/user.routes'));
app.use('/api/v1/races', require('./modules/races/races.routes'));
app.use('/api/v1/leagues', require('./modules/leagues/leagues.routes'));
app.use('/api/v1/lineups', require('./modules/lineups/lineups.routes'));
app.use('/api/v1/scoring', require('./modules/scoring/scoring.routes'));
app.use('/api/v1/leaderboard', require('./modules/leaderboard/leaderboard.routes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
