const User = require('../models/User');
const Donor = require('../models/Donor');
const BloodRequest = require('../models/BloodRequest');
const Donation = require('../models/Donation');
const Hospital = require('../models/Hospital');
const AuditLog = require('../models/AuditLog');
const BloodBank = require('../models/BloodBank');
const DonationCamp = require('../models/DonationCamp');
const EmergencyRequest = require('../models/EmergencyRequest');

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDonors = await Donor.countDocuments();
    const totalRequests = await BloodRequest.countDocuments();
    const totalDonations = await Donation.countDocuments();
    const pendingRequests = await BloodRequest.countDocuments({ status: 'pending' });
    const completedRequests = await BloodRequest.countDocuments({ status: 'completed' });
    const totalHospitals = await Hospital.countDocuments();

    const requestsByGroup = await BloodRequest.aggregate([
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } }
    ]);

    const donationsByMonth = await Donation.aggregate([
      { $group: { _id: { $month: '$donationDate' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalUsers,
      totalDonors,
      totalRequests,
      totalDonations,
      pendingRequests,
      completedRequests,
      totalHospitals,
      requestsByGroup,
      donationsByMonth
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) filter.role = role;
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(userId, { isVerified: true }, { new: true });
    res.json({ message: 'User verified', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    await Donor.findOneAndDelete({ user: userId });
    await Hospital.findOneAndDelete({ user: userId });
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find()
      .populate('receiver')
      .populate('acceptedBy')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find().populate('user', 'name email phone');
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const hospital = await Hospital.findByIdAndUpdate(
      hospitalId,
      { isVerified: true },
      { new: true }
    );
    res.json({ message: 'Hospital verified', hospital });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const totalDonors = await Donor.countDocuments();
    const activeDonors = await Donor.countDocuments({ isAvailable: true });
    const totalRequests = await BloodRequest.countDocuments();
    const pendingRequests = await BloodRequest.countDocuments({ status: 'pending' });
    const emergencyRequests = await EmergencyRequest.countDocuments({ status: { $in: ['active', 'in-progress'] } });
    const totalCamps = await DonationCamp.countDocuments();
    const activeCamps = await DonationCamp.countDocuments({ status: { $in: ['active', 'approved'] } });
    const totalBloodBanks = await BloodBank.countDocuments();
    const verifiedBloodBanks = await BloodBank.countDocuments({ isVerified: true });

    const donationsByMonth = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: { $month: '$donationDate' }, count: { $sum: 1 }, units: { $sum: '$unitsDonated' } } },
      { $sort: { _id: 1 } }
    ]);

    const requestsByBloodGroup = await BloodRequest.aggregate([
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } }
    ]);

    res.json({
      totalDonors, activeDonors, totalRequests, pendingRequests,
      emergencyRequests, totalCamps, activeCamps, totalBloodBanks, verifiedBloodBanks,
      donationsByMonth, requestsByBloodGroup
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats, getAllUsers, toggleUserStatus,
  verifyUser, deleteUser, getAllRequests, getAllHospitals, verifyHospital,
  getAuditLogs, getAnalytics
};
