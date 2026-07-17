const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'Receiver', required: true },
  patientName: { type: String, required: true },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
  unitsRequired: { type: Number, required: true, min: 1 },
  hospitalName: { type: String, required: true },
  hospitalAddress: { type: String, required: true },
  urgency: { type: String, enum: ['normal', 'urgent', 'emergency'], default: 'normal' },
  status: { type: String, enum: ['pending', 'accepted', 'completed', 'cancelled'], default: 'pending' },
  requiredDate: { type: Date, required: true },
  contactNumber: { type: String, required: true },
  notes: { type: String },
  matchedDonors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Donor' }],
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor' },
  completedAt: { type: Date },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  }
}, { timestamps: true });

bloodRequestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
