const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const env = require('../../config/env');
const redisClient = require('../../config/redis');
const logger = require('../../config/logger');
const ApiError = require('../../utils/ApiError');
const authRepository = require('./auth.repository');

class AuthService {
  async register(username, email, password) {
    const existingUser = await authRepository.findUserByEmail(email);
    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    const existingUsername = await authRepository.findUserByUsername(username);
    if (existingUsername) {
      throw ApiError.conflict('Username already taken');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await authRepository.createUser({
      username,
      email,
      passwordHash,
    });

    const { accessToken, refreshToken } = this.generateTokens(user.id);
    await this.storeRefreshToken(user.id, refreshToken);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(email, password) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const { accessToken, refreshToken } = this.generateTokens(user.id);
    await this.storeRefreshToken(user.id, refreshToken);

    const userWithoutPassword = this.sanitizeUser(user);
    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
      const userId = decoded.id;

      const storedToken = await redisClient.get(`refreshTokens:${userId}`);
      if (!storedToken) {
        throw ApiError.unauthorized('Refresh token revoked or expired');
      }

      const { accessToken } = this.generateTokens(userId);
      return { accessToken };
    } catch (err) {
      if (err instanceof ApiError) throw err;
      logger.warn('Invalid refresh token attempt', { error: err.message });
      throw ApiError.unauthorized('Invalid refresh token');
    }
  }

  async logout(userId) {
    await redisClient.del(`refreshTokens:${userId}`);
  }

  generateTokens(userId) {
    const accessToken = jwt.sign(
      { id: userId },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { id: userId },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRY }
    );

    return { accessToken, refreshToken };
  }

  async storeRefreshToken(userId, token) {
    const ttl = this.parseExpiry(env.JWT_REFRESH_EXPIRY);
    await redisClient.setex(`refreshTokens:${userId}`, ttl, token);
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, env.JWT_ACCESS_SECRET);
    } catch (err) {
      return null;
    }
  }

  sanitizeUser(user) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  parseExpiry(expiryStr) {
    const units = { s: 1, m: 60, h: 3600, d: 86400 };
    const match = expiryStr.match(/^(\d+)([smhd])$/);
    if (!match) return 86400;
    return parseInt(match[1], 10) * units[match[2]];
  }
}

module.exports = new AuthService();
