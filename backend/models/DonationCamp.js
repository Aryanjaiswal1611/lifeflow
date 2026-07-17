const mongoose = require('mongoose');

const donationCampSchema = new mongoose.Schema({
  campName: { type: String, required: [true, 'Camp name is required'] },
  organizer: { type: String, required: true },
  organizerContact: { type: String, required: true },
  organizedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, required: true },
  endDate: { type: Date },
  time: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String },
  bloodGroupsNeeded: [{ type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] }],
  contactNumber: { type: String, required: true },
  email: { type: String },
  maxParticipants: { type: Number, default: 100 },
  registeredCount: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'active', 'completed', 'cancelled'], default: 'pending' },
  isApproved: { type: Boolean, default: false },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: { type: String },
  registeredDonors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Donor' }],
  qrCodeData: { type: String },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  }
}, { timestamps: true });

donationCampSchema.index({ location: '2dsphere' });
donationCampSchema.index({ date: 1, status: 1 });
donationCampSchema.index({ city: 1, state: 1 });

module.exports = mongoose.model('DonationCamp', donationCampSchema);
