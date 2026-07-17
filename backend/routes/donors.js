const express = require('express');
const router = express.Router();
const {
  getDonorProfile, updateDonorProfile, toggleAvailability,
  getDonationHistory, getNearbyRequests, acceptRequest,
  completeDonation, getAllDonors
} = require('../controllers/donorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllDonors);
router.get('/profile', protect, authorize('donor'), getDonorProfile);
router.put('/profile', protect, authorize('donor'), updateDonorProfile);
router.patch('/toggle-availability', protect, authorize('donor'), toggleAvailability);
router.get('/donation-history', protect, authorize('donor'), getDonationHistory);
router.get('/nearby-requests', protect, authorize('donor'), getNearbyRequests);
router.post('/accept-request/:requestId', protect, authorize('donor'), acceptRequest);
router.post('/complete-donation/:requestId', protect, authorize('donor'), completeDonation);

module.exports = router;
