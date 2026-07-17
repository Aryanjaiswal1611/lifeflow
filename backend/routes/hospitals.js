const express = require('express');
const router = express.Router();
const {
  getHospitalProfile, updateHospitalProfile,
  updateBloodInventory, getHospitalRequests, getDonationsAtHospital,
  getHospitalCamps
} = require('../controllers/hospitalController');
const { protect, authorize } = require('../middleware/auth');

router.get('/profile', protect, authorize('hospital'), getHospitalProfile);
router.put('/profile', protect, authorize('hospital'), updateHospitalProfile);
router.patch('/inventory', protect, authorize('hospital'), updateBloodInventory);
router.get('/requests', protect, authorize('hospital'), getHospitalRequests);
router.get('/donations', protect, authorize('hospital'), getDonationsAtHospital);
router.get('/camps', protect, authorize('hospital'), getHospitalCamps);

module.exports = router;
