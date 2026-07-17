const express = require('express');
const router = express.Router();
const { searchBloodAvailability, getBloodAvailabilityByGroup } = require('../controllers/bloodAvailabilityController');
const { protect } = require('../middleware/auth');

router.get('/search', protect, searchBloodAvailability);
router.get('/by-group', protect, getBloodAvailabilityByGroup);

module.exports = router;
