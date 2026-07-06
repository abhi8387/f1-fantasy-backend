const express = require('express');
const { protect } = require('../auth/auth.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const svc = require('./leaderboard.service');

const router = express.Router();

router.get('/:leagueId', protect, asyncHandler(async (req, res) => {
  const board = await svc.getLeagueLeaderboard(Number(req.params.leagueId));
  new ApiResponse(200, board).send(res);
}));

module.exports = router;
