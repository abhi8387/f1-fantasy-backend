const express = require('express');
const router = express.Router();
const { createLeague, joinLeague, getMyLeagues } = require('../controllers/leagueController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, createLeague);
router.post('/join', protect, joinLeague);
router.get('/my-leagues', protect, getMyLeagues);

module.exports = router;