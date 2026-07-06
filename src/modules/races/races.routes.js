const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const svc = require('./races.service');

const router = express.Router();

router.post('/sync', asyncHandler(async (req, res) => {
  const count = await svc.syncRaces(req.query.year);
  new ApiResponse(200, { synced: count }).send(res);
}));

router.post('/:sessionKey/drivers/sync', asyncHandler(async (req, res) => {
  const count = await svc.syncDrivers(req.params.sessionKey);
  new ApiResponse(200, { synced: count }).send(res);
}));

router.get('/', asyncHandler(async (req, res) => {
  new ApiResponse(200, await svc.getRaces()).send(res);
}));

router.get('/:sessionKey/drivers', asyncHandler(async (req, res) => {
  new ApiResponse(200, await svc.getDrivers(req.params.sessionKey)).send(res);
}));

router.get('/:id/countdown', asyncHandler(async (req, res) => {
  new ApiResponse(200, await svc.getCountdown(Number(req.params.id))).send(res);
}));

router.get('/:id/results', asyncHandler(async (req, res) => {
  new ApiResponse(200, await svc.getResults(Number(req.params.id))).send(res);
}));

module.exports = router;
