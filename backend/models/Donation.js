const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true },
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest', required: true },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  donationDate: { type: Date, default: Date.now },
  bloodGroup: { type: String, required: true },
  unitsDonated: { type: Number, required: true, default: 1 },
  status: { type: String, enum: ['completed', 'cancelled'], default: 'completed' },
  notes: { type: String },
  certificateUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);
