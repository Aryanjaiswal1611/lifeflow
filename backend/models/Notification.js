const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['request', 'acceptance', 'emergency', 'general', 'reminder', 'message', 'call', 'reward', 'sos'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedTo: { type: mongoose.Schema.Types.ObjectId, refPath: 'onModel' },
  onModel: { type: String, enum: ['BloodRequest', 'Donation', 'User'] },
  isRead: { type: Boolean, default: false },
  isEmergency: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
