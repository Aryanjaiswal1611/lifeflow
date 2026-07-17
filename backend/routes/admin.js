const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getAllUsers, toggleUserStatus,
  verifyUser, deleteUser, getAllRequests, getAllHospitals, verifyHospital,
  getAuditLogs, getAnalytics
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.patch('/users/:userId/toggle-status', toggleUserStatus);
router.patch('/users/:userId/verify', verifyUser);
router.delete('/users/:userId', deleteUser);
router.get('/requests', getAllRequests);
router.get('/hospitals', getAllHospitals);
router.patch('/hospitals/:hospitalId/verify', verifyHospital);
router.get('/audit-logs', getAuditLogs);
router.get('/analytics', getAnalytics);

module.exports = router;
