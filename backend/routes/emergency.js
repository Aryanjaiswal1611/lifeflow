const express = require('express');
const router = express.Router();
const BloodRequest = require('../models/BloodRequest');
const EmergencyRequest = require('../models/EmergencyRequest');
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const BloodBank = require('../models/BloodBank');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const { findMatchingDonors, compatibility, calculateDistance } = require('../utils/bloodMatch');
const { sendEmergencyAlert } = require('../utils/sendEmail');

const notifyDonors = async (donors, emergencyReq) => {
  for (const donor of donors) {
    await Notification.create({
      user: donor.user?._id || donor.user,
      type: 'emergency',
      title: '🚨 EMERGENCY Blood Request!',
      message: `Critical need for ${emergencyReq.bloodGroup} at ${emergencyReq.hospitalName}. Please respond!`,
      relatedTo: emergencyReq._id,
      onModel: 'BloodRequest',
      isEmergency: true
    });
  }
};

const notifyHospitals = async (hospitals, emergencyReq) => {
  for (const hospital of hospitals) {
    await Notification.create({
      user: hospital.user?._id || hospital.user,
      type: 'emergency',
      title: '🚨 Emergency Blood Request',
      message: `Critical need for ${emergencyReq.bloodGroup} units at ${emergencyReq.hospitalName}`,
      relatedTo: emergencyReq._id,
      onModel: 'BloodRequest',
      isEmergency: true
    });
  }
};

router.post('/sos', protect, authorize('receiver'), async (req, res) => {
  try {
    const {
      patientName, bloodGroup, unitsRequired, hospitalName,
      hospitalAddress, contactNumber, notes, lat, lng
    } = req.body;
    if (!bloodGroup || !unitsRequired || !hospitalName || !hospitalAddress || !contactNumber) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const request = await BloodRequest.create({
      receiver: req.user._id,
      patientName: patientName || req.user.name,
      bloodGroup: bloodGroup.toUpperCase(),
      unitsRequired,
      hospitalName,
      hospitalAddress,
      contactNumber,
      urgency: 'emergency',
      status: 'pending',
      requiredDate: new Date(),
      notes: notes || 'SOS Emergency Request',
      location: {
        type: 'Point',
        coordinates: lng && lat ? [parseFloat(lng), parseFloat(lat)] : [0, 0]
      }
    });

    const emergencyReq = await EmergencyRequest.create({
      bloodRequest: request._id,
      requester: req.user._id,
      patientName: patientName || req.user.name,
      bloodGroup: bloodGroup.toUpperCase(),
      unitsRequired,
      hospitalName,
      hospitalAddress,
      contactNumber,
      status: 'active',
      priority: unitsRequired > 3 ? 'critical' : 'high',
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      location: request.location
    });

    const compatibleGroups = compatibility[bloodGroup.toUpperCase()] || [];
    const availableDonors = await Donor.find({
      isAvailable: true,
      bloodGroup: { $in: compatibleGroups },
      $or: [
        { lastDonationDate: { $lte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } },
        { lastDonationDate: { $exists: false } }
      ]
    }).populate('user');

    const receiverCoord = request.location?.coordinates || [0, 0];
    const matched = findMatchingDonors(availableDonors, bloodGroup.toUpperCase(), receiverCoord, 100);

    emergencyReq.notifiedDonors = matched.map(d => d._id);
    emergencyReq.responderCount = matched.length;
    await emergencyReq.save();

    request.matchedDonors = matched.map(d => d._id);
    await request.save();

    const nearbyHospitals = await Hospital.find({
      isVerified: true,
      'location.coordinates.0': { $ne: 0 }
    }).lean();

    const nearbyBloodBanks = await BloodBank.find({
      isVerified: true,
      'location.coordinates.0': { $ne: 0 }
    }).lean();

    const hospitalsWithStock = nearbyHospitals
      .filter(h => h.bloodInventory?.[bloodGroup.toUpperCase()] > 0)
      .map(h => ({ ...h, distance: calculateDistance(receiverCoord, h.location?.coordinates || [0, 0]) }))
      .filter(h => h.distance <= 100)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);

    const bloodBanksWithStock = nearbyBloodBanks
      .filter(b => b.bloodInventory?.[bloodGroup.toUpperCase()] > 0)
      .map(b => ({ ...b, distance: calculateDistance(receiverCoord, b.location?.coordinates || [0, 0]) }))
      .filter(b => b.distance <= 100)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);

    emergencyReq.notifiedHospitals = hospitalsWithStock.map(h => h._id);
    await emergencyReq.save();

    notifyDonors(matched, emergencyReq).catch(() => {});
    notifyHospitals(hospitalsWithStock, emergencyReq).catch(() => {});
    sendEmergencyAlert(matched.slice(0, 10), request).catch(() => {});

    res.status(201).json({
      message: 'SOS emergency request sent!',
      request,
      emergencyReq,
      matchedDonorsCount: matched.length,
      hospitalsNotified: hospitalsWithStock.length,
      bloodBanksNotified: bloodBanksWithStock.length,
      isEmergency: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/active', protect, async (req, res) => {
  try {
    const activeEmergencies = await EmergencyRequest.find({
      status: { $in: ['active', 'in-progress'] }
    }).populate('requester', 'name email phone')
      .populate('acceptedBy')
      .sort({ createdAt: -1 })
      .limit(50);

    const bloodRequests = await BloodRequest.find({
      urgency: 'emergency',
      status: { $in: ['pending', 'accepted'] }
    }).populate('receiver', 'name email phone')
      .populate('acceptedBy')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ activeEmergencies, bloodRequests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/track', protect, async (req, res) => {
  try {
    const emergency = await EmergencyRequest.findById(req.params.id)
      .populate('requester', 'name email phone')
      .populate('notifiedDonors')
      .populate('respondedDonors')
      .populate('acceptedBy');
    if (!emergency) return res.status(404).json({ message: 'Emergency request not found' });
    res.json(emergency);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/respond', protect, authorize('donor'), async (req, res) => {
  try {
    const emergency = await EmergencyRequest.findById(req.params.id);
    if (!emergency) return res.status(404).json({ message: 'Emergency not found' });
    const donor = await Donor.findOne({ user: req.user._id });
    if (!donor) return res.status(404).json({ message: 'Donor not found' });
    if (!emergency.respondedDonors) emergency.respondedDonors = [];
    if (emergency.respondedDonors.some(d => d.toString() === donor._id.toString())) {
      return res.json({ message: 'Already responded' });
    }
    emergency.respondedDonors.push(donor._id);
    if (emergency.status === 'active') emergency.status = 'in-progress';
    await emergency.save();
    res.json({ message: 'Response recorded', emergency });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/fulfill', protect, async (req, res) => {
  try {
    const emergency = await EmergencyRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'fulfilled', fulfilledAt: new Date() },
      { new: true }
    );
    if (!emergency) return res.status(404).json({ message: 'Emergency not found' });
    await BloodRequest.findByIdAndUpdate(emergency.bloodRequest, { status: 'completed' });
    res.json({ message: 'Emergency fulfilled', emergency });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const total = await EmergencyRequest.countDocuments();
    const active = await EmergencyRequest.countDocuments({ status: 'active' });
    const fulfilled = await EmergencyRequest.countDocuments({ status: 'fulfilled' });
    const expired = await EmergencyRequest.countDocuments({ status: 'expired' });
    const byGroup = await EmergencyRequest.aggregate([
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } }
    ]);
    res.json({ total, active, fulfilled, expired, byGroup });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
