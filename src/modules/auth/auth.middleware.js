const ApiError = require('../../utils/ApiError');
const authService = require('./auth.service');

function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = authService.verifyAccessToken(token);

    if (!decoded) {
      throw ApiError.unauthorized('Invalid or expired token');
    }

    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof ApiError) {
      next(err);
    } else {
      next(ApiError.unauthorized('Invalid token'));
    }
  }
}

function validateBody(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (err) {
      next(
        ApiError.badRequest('Validation failed', {
          errors: err.errors,
        })
      );
    }
  };
}

module.exports = {
  protect,
  validateBody,
};
