const CallHistory = require('../models/CallHistory');

const startCall = async (req, res) => {
  try {
    const { receiverId, callType } = req.body;

    if (!receiverId || !callType) {
      return res.status(400).json({ message: 'Receiver ID and call type required' });
    }

    if (!['audio', 'video'].includes(callType)) {
      return res.status(400).json({ message: 'Invalid call type' });
    }

    const call = await CallHistory.create({
      caller: req.user._id,
      receiver: receiverId,
      callType,
      status: 'ongoing'
    });

    const populated = await call.populate('caller', 'name email');
    await populated.populate('receiver', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const endCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const { duration } = req.body;

    const call = await CallHistory.findById(callId);
    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }

    if (call.caller.toString() !== req.user._id.toString() &&
        call.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    call.status = 'completed';
    call.duration = duration || Math.floor((Date.now() - new Date(call.startedAt)) / 1000);
    call.endedAt = new Date();
    await call.save();

    res.json(call);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCallHistory = async (req, res) => {
  try {
    const calls = await CallHistory.find({
      $or: [{ caller: req.user._id }, { receiver: req.user._id }]
    })
      .populate('caller', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(calls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { startCall, endCall, getCallHistory };
