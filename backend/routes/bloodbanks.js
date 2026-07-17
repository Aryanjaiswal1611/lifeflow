const express = require('express');
const router = express.Router();
const { getNearbyBloodBanks, getBloodBankById, getAllBloodBanks, createBloodBank, updateBloodBank, deleteBloodBank, getBloodAvailability } = require('../controllers/bloodBankController');
const { protect, authorize } = require('../middleware/auth');

router.get('/nearby', protect, getNearbyBloodBanks);
router.get('/availability', protect, getBloodAvailability);
router.get('/', protect, getAllBloodBanks);
router.get('/:id', protect, getBloodBankById);
router.post('/', protect, authorize('admin'), createBloodBank);
router.put('/:id', protect, authorize('admin'), updateBloodBank);
router.delete('/:id', protect, authorize('admin'), deleteBloodBank);

module.exports = router;
