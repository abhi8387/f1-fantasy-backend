const express = require('express');
const { protect } = require('../auth/auth.middleware');
const { User } = require('../../database/models');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const router = express.Router();

router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'email', 'role', 'createdAt'],
    });
    new ApiResponse(200, user).send(res);
  })
);

module.exports = router;
