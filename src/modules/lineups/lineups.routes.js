const express = require('express');
const { z } = require('zod');
const { protect, validateBody } = require('../auth/auth.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const svc = require('./lineups.service');

const router = express.Router();
router.use(protect);

const lineupSchema = z.object({
  raceId: z.number().int(),
  driverIds: z.array(z.number().int()).length(5),
  captainId: z.number().int(),
});

router.post('/', validateBody(lineupSchema), asyncHandler(async (req, res) => {
  const { raceId, driverIds, captainId } = req.body;
  const lineup = await svc.submitLineup(req.user.id, raceId, driverIds, captainId);
  new ApiResponse(200, lineup, 'Lineup saved').send(res);
}));

router.get('/team/me', asyncHandler(async (req, res) => {
  const team = await svc.getOrCreateTeam(req.user.id);
  new ApiResponse(200, team).send(res);
}));

router.get('/:raceId', asyncHandler(async (req, res) => {
  const lineup = await svc.getMyLineup(req.user.id, Number(req.params.raceId));
  new ApiResponse(200, lineup).send(res);
}));

module.exports = router;
