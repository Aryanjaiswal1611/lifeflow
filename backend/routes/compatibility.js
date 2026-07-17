const express = require('express');
const router = express.Router();
const { getCompatibility, getAllCompatibility, getCompatibleDonors, smartMatchDonors } = require('../controllers/compatibilityController');
const { protect } = require('../middleware/auth');

router.get('/all', protect, getAllCompatibility);
router.get('/:bloodGroup', protect, getCompatibility);
router.get('/', protect, getCompatibleDonors);
router.post('/smart-match', protect, smartMatchDonors);

module.exports = router;
