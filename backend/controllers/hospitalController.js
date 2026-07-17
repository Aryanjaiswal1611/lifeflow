const Hospital = require('../models/Hospital');
const BloodRequest = require('../models/BloodRequest');
const Donation = require('../models/Donation');
const DonationCamp = require('../models/DonationCamp');
const { calculateDistance } = require('../utils/bloodMatch');

const getHospitalProfile = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ user: req.user._id }).populate('user', 'name email phone');
    if (!hospital) return res.status(404).json({ message: 'Hospital profile not found' });
    res.json(hospital);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateHospitalProfile = async (req, res) => {
  try {
    const { hospitalName, licenseNumber, address, city, contactNumber } = req.body;
    const hospital = await Hospital.findOneAndUpdate(
      { user: req.user._id },
      { hospitalName, licenseNumber, address, city, contactNumber },
      { new: true }
    ).populate('user', 'name email phone');
    res.json(hospital);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBloodInventory = async (req, res) => {
  try {
    const { bloodGroup, units } = req.body;
    const hospital = await Hospital.findOne({ user: req.user._id });
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    hospital.bloodInventory[bloodGroup] = (hospital.bloodInventory[bloodGroup] || 0) + units;
    await hospital.save();
    res.json({ bloodInventory: hospital.bloodInventory, message: 'Inventory updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHospitalRequests = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ user: req.user._id });
    const requests = await BloodRequest.find({ hospitalName: hospital.hospitalName })
      .populate('receiver')
      .populate('acceptedBy')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDonationsAtHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ user: req.user._id });
    const donations = await Donation.find({ hospital: hospital._id })
      .populate('donor')
      .populate('request')
      .sort({ donationDate: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHospitalCamps = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ user: req.user._id });
    const camps = await DonationCamp.find({ organizedBy: req.user._id }).sort({ date: -1 });
    res.json(camps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getHospitalProfile, updateHospitalProfile,
  updateBloodInventory, getHospitalRequests, getDonationsAtHospital,
  getHospitalCamps
};
