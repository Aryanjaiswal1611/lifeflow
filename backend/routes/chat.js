const express = require('express');
const router = express.Router();
const { createOrGetConversation, getConversations, getMessages, sendMessage, markAsRead } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.post('/create', protect, createOrGetConversation);
router.get('/conversations', protect, getConversations);
router.get('/:conversationId', protect, getMessages);
router.post('/message', protect, sendMessage);
router.put('/read/:conversationId', protect, markAsRead);

module.exports = router;
