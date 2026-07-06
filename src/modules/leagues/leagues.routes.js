const express = require('express');
const { z } = require('zod');
const { protect, validateBody } = require('../auth/auth.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const svc = require('./leagues.service');

const router = express.Router();
router.use(protect);

const createSchema = z.object({ name: z.string().min(3).max(50) });
const joinSchema = z.object({ inviteCode: z.string().min(4) });

router.post('/', validateBody(createSchema), asyncHandler(async (req, res) => {
  const league = await svc.createLeague(req.user.id, req.body.name);
  new ApiResponse(201, league, 'League created').send(res);
}));

router.post('/join', validateBody(joinSchema), asyncHandler(async (req, res) => {
  const league = await svc.joinLeague(req.user.id, req.body.inviteCode);
  new ApiResponse(200, league, 'Joined league').send(res);
}));

router.get('/', asyncHandler(async (req, res) => {
  new ApiResponse(200, await svc.getMyLeagues(req.user.id)).send(res);
}));

module.exports = router;
