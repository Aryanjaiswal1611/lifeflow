const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  age: { type: Number, min: 18, max: 65 },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  weight: { type: Number, min: 45 },
  lastDonationDate: { type: Date },
  isAvailable: { type: Boolean, default: true },
  medicalConditions: { type: String, default: '' },
  totalDonations: { type: Number, default: 0 },
  rewardPoints: { type: Number, default: 0 },
  badges: [{ name: String, icon: String, earnedAt: { type: Date, default: Date.now } }],
  donationStreak: { type: Number, default: 0 },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  }
}, { timestamps: true });

donorSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Donor', donorSchema);
