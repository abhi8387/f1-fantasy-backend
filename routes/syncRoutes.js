const express = require('express');
const router = express.Router();
const { syncRaces, syncDrivers, getRaces, getDrivers } = require('../controllers/syncController');
const { protect } = require('../middleware/authMiddleware');

router.post('/races', protect, syncRaces);
router.post('/drivers/:sessionKey', protect, syncDrivers);
router.get('/races', protect, getRaces);
router.get('/drivers/:sessionKey', protect, getDrivers);

module.exports = router;