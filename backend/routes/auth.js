const express = require('express');
const router = express.Router();
const {
  register, login, getMe, updateProfile, verifyOtp, resendOtp,
  forgotPassword, resetPassword, googleAuth, enable2FA
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/google', googleAuth);
router.post('/2fa/toggle', protect, enable2FA);

module.exports = router;
