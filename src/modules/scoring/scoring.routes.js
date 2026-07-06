const express = require('express');
const { z } = require('zod');
const { protect, validateBody } = require('../auth/auth.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const svc = require('./scoring.service');

const router = express.Router();

const resultsSchema = z.object({
  raceId: z.number().int(),
  results: z.array(z.object({ driverId: z.number().int(), position: z.number().int() })),
});

router.post('/results', protect, validateBody(resultsSchema), asyncHandler(async (req, res) => {
  const count = await svc.submitResults(req.body.raceId, req.body.results);
  new ApiResponse(200, { updated: count }).send(res);
}));

module.exports = router;
