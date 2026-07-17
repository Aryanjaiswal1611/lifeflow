const User = require('../models/User');
const Donor = require('../models/Donor');
const Receiver = require('../models/Receiver');
const Hospital = require('../models/Hospital');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../utils/sendEmail');
const crypto = require('crypto');

const VALID_ROLES = ['donor', 'receiver', 'hospital'];

const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, city, address } = req.body;
    const normalizedEmail = email?.toLowerCase();

    if (!name || !normalizedEmail || !password || !role || !phone || !city) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email: normalizedEmail, password, role, phone, city, address });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Verify your LifeFlow account',
      html: `<h1>Welcome to LifeFlow!</h1><p>Your OTP for email verification is: <strong>${otp}</strong></p><p>This OTP expires in 10 minutes.</p>`
    }).catch(() => {});

    try {
      if (role === 'donor') {
        await Donor.create({ user: user._id });
      } else if (role === 'receiver') {
        await Receiver.create({ user: user._id, patientName: name });
      } else if (role === 'hospital') {
        await Hospital.create({ user: user._id, hospitalName: name, city });
      }
    } catch (profileError) {
      try { await User.findByIdAndDelete(user._id); } catch (_) {}
      return res.status(400).json({ message: 'Profile creation failed. Please try again.' });
    }

    const token = generateToken(user._id);
    res.status(201).json({ user: user.toJSON(), token, requiresOtpVerification: true });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account has been deactivated' });
    }
    if (user.twoFactorEnabled) {
      const token = generateToken(user._id);
      return res.json({ requiresTwoFactor: true, tempToken: token, userId: user._id });
    }
    const token = generateToken(user._id);
    res.json({ user: user.toJSON(), token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    let profile = null;
    if (req.user.role === 'donor') {
      profile = await Donor.findOne({ user: req.user._id });
    } else if (req.user.role === 'receiver') {
      profile = await Receiver.findOne({ user: req.user._id });
    } else if (req.user.role === 'hospital') {
      profile = await Hospital.findOne({ user: req.user._id });
    }
    res.json({ user: req.user, profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, city } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address, city },
      { new: true }
    );

    if (req.user.role === 'donor') {
      const { age, gender, bloodGroup, weight, medicalConditions } = req.body;
      await Donor.findOneAndUpdate(
        { user: req.user._id },
        { age, gender, bloodGroup, weight, medicalConditions },
        { new: true }
      );
    } else if (req.user.role === 'receiver') {
      const { patientName, bloodGroup, quantityRequired, hospitalName, hospitalAddress, emergencyContact, requiredDate } = req.body;
      await Receiver.findOneAndUpdate(
        { user: req.user._id },
        { patientName, bloodGroup, quantityRequired, hospitalName, hospitalAddress, emergencyContact, requiredDate },
        { new: true }
      );
    }

    res.json({ user, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select('+otp +otpExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    const token = generateToken(user._id);
    res.json({ user: user.toJSON(), token, message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    await sendEmail({
      to: user.email,
      subject: 'LifeFlow - New OTP',
      html: `<h1>OTP Verification</h1><p>Your new OTP is: <strong>${otp}</strong></p><p>Expires in 10 minutes.</p>`
    }).catch(() => {});
    res.json({ message: 'OTP resent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const resetToken = user.generateResetToken();
    await user.save();
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'LifeFlow - Password Reset',
      html: `<h1>Password Reset</h1><p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 30 minutes.</p>`
    }).catch(() => {});
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+password');
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    const jwtToken = generateToken(user._id);
    res.json({ token: jwtToken, user: user.toJSON(), message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { email, name, googleId, avatar } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = avatar || user.avatar;
        await user.save();
      }
    } else {
      const password = crypto.randomBytes(20).toString('hex');
      user = await User.create({
        name, email, password, googleId, avatar,
        role: 'donor', phone: '', city: '', isVerified: true
      });
      await Donor.create({ user: user._id });
    }
    const token = generateToken(user._id);
    res.json({ user: user.toJSON(), token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const enable2FA = async (req, res) => {
  try {
    const user = req.user;
    user.twoFactorEnabled = !user.twoFactorEnabled;
    await user.save();
    res.json({ message: `2FA ${user.twoFactorEnabled ? 'enabled' : 'disabled'}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile, verifyOtp, resendOtp, forgotPassword, resetPassword, googleAuth, enable2FA };
