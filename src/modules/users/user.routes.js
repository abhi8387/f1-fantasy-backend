const express = require('express');
const { protect } = require('../auth/auth.middleware');
const prisma = require('../../database/prisma');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const router = express.Router();

router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, username: true, email: true, role: true, createdAt: true },
    });
    new ApiResponse(200, user).send(res);
  })
);

module.exports = router;
