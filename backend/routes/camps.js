const express = require('express');
const router = express.Router();
const { getNearbyCamps, getCampById, getAllCamps, createCamp, updateCamp, registerForCamp, approveCamp, rejectCamp, completeCamp, getMyCampRegistrations } = require('../controllers/campController');
const { protect, authorize } = require('../middleware/auth');

router.get('/nearby', protect, getNearbyCamps);
router.get('/my-registrations', protect, authorize('donor'), getMyCampRegistrations);
router.get('/', protect, getAllCamps);
router.get('/:id', protect, getCampById);
router.post('/', protect, authorize('hospital', 'admin'), createCamp);
router.put('/:id', protect, authorize('hospital', 'admin'), updateCamp);
router.post('/:id/register', protect, authorize('donor'), registerForCamp);
router.patch('/:id/approve', protect, authorize('admin'), approveCamp);
router.patch('/:id/reject', protect, authorize('admin'), rejectCamp);
router.patch('/:id/complete', protect, authorize('admin', 'hospital'), completeCamp);

module.exports = router;
