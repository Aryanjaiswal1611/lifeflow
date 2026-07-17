const mongoose = require('mongoose');

const bloodBankSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Blood bank name is required'] },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String },
  contactNumber: { type: String, required: true },
  email: { type: String },
  website: { type: String },
  isVerified: { type: Boolean, default: false },
  isOpen24x7: { type: Boolean, default: false },
  openingHours: { type: String, default: '9:00 AM - 6:00 PM' },
  emergencyAvailable: { type: Boolean, default: true },
  bloodInventory: {
    'A+': { type: Number, default: 0 },
    'A-': { type: Number, default: 0 },
    'B+': { type: Number, default: 0 },
    'B-': { type: Number, default: 0 },
    'AB+': { type: Number, default: 0 },
    'AB-': { type: Number, default: 0 },
    'O+': { type: Number, default: 0 },
    'O-': { type: Number, default: 0 }
  },
  lastInventoryUpdate: { type: Date, default: Date.now },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  }
}, { timestamps: true });

bloodBankSchema.index({ location: '2dsphere' });
bloodBankSchema.index({ city: 1, state: 1 });

module.exports = mongoose.model('BloodBank', bloodBankSchema);
