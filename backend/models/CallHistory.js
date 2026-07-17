const mongoose = require('mongoose');

const callHistorySchema = new mongoose.Schema({
  caller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  callType: { type: String, enum: ['audio', 'video'], required: true },
  status: { type: String, enum: ['ongoing', 'completed', 'missed', 'rejected'], default: 'ongoing' },
  duration: { type: Number, default: 0 },
  startedAt: { type: Date, default: Date.now },
  endedAt: Date
}, { timestamps: true });

callHistorySchema.index({ caller: 1, createdAt: -1 });
callHistorySchema.index({ receiver: 1, createdAt: -1 });

module.exports = mongoose.model('CallHistory', callHistorySchema);
