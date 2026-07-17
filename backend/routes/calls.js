const express = require('express');
const router = express.Router();
const { startCall, endCall, getCallHistory } = require('../controllers/callController');
const { protect } = require('../middleware/auth');

router.post('/start', protect, startCall);
router.patch('/:callId/end', protect, endCall);
router.get('/history', protect, getCallHistory);

module.exports = router;
