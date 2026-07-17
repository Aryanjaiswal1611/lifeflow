const express = require('express');
const router = express.Router();
const {
  getReceiverProfile, updateReceiverProfile, createBloodRequest,
  getMyRequests, getMatchedDonors, cancelRequest
} = require('../controllers/receiverController');
const { protect, authorize } = require('../middleware/auth');

router.get('/profile', protect, authorize('receiver'), getReceiverProfile);
router.put('/profile', protect, authorize('receiver'), updateReceiverProfile);
router.post('/blood-request', protect, authorize('receiver'), createBloodRequest);
router.get('/my-requests', protect, authorize('receiver'), getMyRequests);
router.get('/matched-donors/:requestId', protect, authorize('receiver'), getMatchedDonors);
router.patch('/cancel-request/:requestId', protect, authorize('receiver'), cancelRequest);

module.exports = router;
