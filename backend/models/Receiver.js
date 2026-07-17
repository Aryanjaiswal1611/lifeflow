const mongoose = require('mongoose');

const receiverSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  patientName: { type: String, required: [true, 'Patient name is required'] },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  quantityRequired: { type: Number },
  hospitalName: { type: String },
  hospitalAddress: { type: String },
  emergencyContact: { type: String },
  requiredDate: { type: Date },
  medicalReport: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Receiver', receiverSchema);
