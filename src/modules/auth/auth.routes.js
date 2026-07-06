const express = require('express');
const createRateLimiter = require('../../middlewares/rateLimiter');
const { protect, validateBody } = require('./auth.middleware');
const { register, login, refresh, logout, me } = require('./auth.controller');
const { registerSchema, loginSchema, refreshSchema } = require('./auth.validation');

const router = express.Router();

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  prefix: 'auth',
  message: 'Too many authentication attempts, please try again later',
});

router.post('/register', authLimiter, validateBody(registerSchema), register);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.post('/refresh', validateBody(refreshSchema), refresh);
router.post('/logout', protect, logout);
router.get('/me', protect, me);

module.exports = router;
