const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const { protect, authorize } = require('../middleware/auth');

router.get('/donation-certificate/:donationId', protect, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.donationId)
      .populate({ path: 'donor', populate: { path: 'user', select: 'name email' } })
      .populate('request hospital');
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    const certData = {
      donorName: donation.donor?.user?.name || 'Donor',
      bloodGroup: donation.bloodGroup,
      units: donation.unitsDonated,
      date: donation.donationDate,
      hospitalName: donation.hospital?.hospitalName || donation.request?.hospitalName || 'Hospital',
      certificateId: donation._id.toString().slice(-8).toUpperCase()
    };
    res.json(certData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/donation-history-pdf/:donorId', protect, authorize('donor', 'admin'), async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.params.donorId || req.user._id })
      .populate({ path: 'request', select: 'hospitalName patientName' })
      .sort({ donationDate: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/admin-report', protect, authorize('admin'), async (req, res) => {
  try {
    const totalDonations = await Donation.countDocuments({ status: 'completed' });
    const donationsByGroup = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$bloodGroup', count: { $sum: 1 }, totalUnits: { $sum: '$unitsDonated' } } }
    ]);
    const hospitals = await Hospital.find().populate('user', 'name email');
    res.json({ totalDonations, donationsByGroup, hospitals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/hospital-report/:hospitalId', protect, authorize('hospital', 'admin'), async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.hospitalId).populate('user', 'name email');
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
    const donations = await Donation.find({ hospital: req.params.hospitalId })
      .populate({ path: 'donor', populate: { path: 'user', select: 'name email' } })
      .sort({ donationDate: -1 });
    res.json({ hospital, donations, inventory: hospital.bloodInventory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
