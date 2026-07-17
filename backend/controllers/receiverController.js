const Receiver = require('../models/Receiver');
const BloodRequest = require('../models/BloodRequest');
const Donor = require('../models/Donor');
const Notification = require('../models/Notification');
const { findMatchingDonors, canDonateTo } = require('../utils/bloodMatch');

const getReceiverProfile = async (req, res) => {
  try {
    const receiver = await Receiver.findOne({ user: req.user._id }).populate('user', 'name email phone city address');
    if (!receiver) return res.status(404).json({ message: 'Receiver profile not found' });
    res.json(receiver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateReceiverProfile = async (req, res) => {
  try {
    const { patientName, bloodGroup, quantityRequired, hospitalName, hospitalAddress, emergencyContact, requiredDate } = req.body;
    const receiver = await Receiver.findOneAndUpdate(
      { user: req.user._id },
      { patientName, bloodGroup, quantityRequired, hospitalName, hospitalAddress, emergencyContact, requiredDate },
      { new: true }
    ).populate('user', 'name email phone city address');
    res.json(receiver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBloodRequest = async (req, res) => {
  try {
    const receiver = await Receiver.findOne({ user: req.user._id });
    if (!receiver) return res.status(404).json({ message: 'Complete your receiver profile first' });

    const { patientName, bloodGroup, unitsRequired, hospitalName, hospitalAddress, urgency, requiredDate, contactNumber, notes } = req.body;

    const request = await BloodRequest.create({
      receiver: receiver._id,
      patientName: patientName || receiver.patientName,
      bloodGroup,
      unitsRequired,
      hospitalName,
      hospitalAddress,
      urgency: urgency || 'normal',
      requiredDate,
      contactNumber,
      notes
    });

    const compatibleDonors = await Donor.find({ isAvailable: true })
      .populate('user', 'name email phone city')
      .lean();

    const matched = compatibleDonors.filter(d => canDonateTo(d.bloodGroup, bloodGroup));
    request.matchedDonors = matched.map(d => d._id);
    await request.save();

    for (const donor of matched) {
      await Notification.create({
        user: donor.user._id,
        type: 'request',
        title: 'Blood Request Nearby',
        message: `${hospitalName} needs ${bloodGroup} blood. Can you donate?`,
        relatedTo: request._id,
        onModel: 'BloodRequest',
        isEmergency: urgency === 'emergency'
      });
    }

    res.status(201).json({ request, matchedDonorsCount: matched.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const receiver = await Receiver.findOne({ user: req.user._id });
    const requests = await BloodRequest.find({ receiver: receiver._id })
      .populate('acceptedBy', 'bloodGroup')
      .populate({
        path: 'acceptedBy',
        populate: { path: 'user', select: 'name email phone' }
      })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMatchedDonors = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await BloodRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const donors = await Donor.find({ _id: { $in: request.matchedDonors } })
      .populate('user', 'name email phone city');
    res.json(donors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await BloodRequest.findByIdAndUpdate(
      requestId,
      { status: 'cancelled' },
      { new: true }
    );
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getReceiverProfile, updateReceiverProfile, createBloodRequest,
  getMyRequests, getMatchedDonors, cancelRequest
};
