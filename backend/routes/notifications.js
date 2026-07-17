const express = require('express');
const router = express.Router();
const {
  getNotifications, markAsRead, markAllAsRead, getUnreadCount
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.patch('/:notificationId/read', protect, markAsRead);
router.patch('/read-all', protect, markAllAsRead);

module.exports = router;
