const mongoose = require('mongoose');

const emergencyRequestSchema = new mongoose.Schema({
  bloodRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest', required: true },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: { type: String, required: true },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
  unitsRequired: { type: Number, required: true, min: 1 },
  hospitalName: { type: String, required: true },
  hospitalAddress: { type: String, required: true },
  contactNumber: { type: String, required: true },
  status: { type: String, enum: ['active', 'in-progress', 'fulfilled', 'expired'], default: 'active' },
  priority: { type: String, enum: ['high', 'critical'], default: 'critical' },
  notifiedDonors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Donor' }],
  notifiedHospitals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' }],
  respondedDonors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Donor' }],
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor' },
  responderCount: { type: Number, default: 0 },
  fulfilledAt: { type: Date },
  expiresAt: { type: Date },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  }
}, { timestamps: true });

emergencyRequestSchema.index({ status: 1, createdAt: -1 });
emergencyRequestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('EmergencyRequest', emergencyRequestSchema);
