const Donor = require('../models/Donor');
const BloodRequest = require('../models/BloodRequest');
const Donation = require('../models/Donation');
const Notification = require('../models/Notification');
const { findMatchingDonors } = require('../utils/bloodMatch');

const getDonorProfile = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user._id }).populate('user', 'name email phone city address');
    if (!donor) return res.status(404).json({ message: 'Donor profile not found' });
    res.json(donor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDonorProfile = async (req, res) => {
  try {
    const { age, gender, bloodGroup, weight, medicalConditions } = req.body;
    const donor = await Donor.findOneAndUpdate(
      { user: req.user._id },
      { age, gender, bloodGroup, weight, medicalConditions },
      { new: true }
    ).populate('user', 'name email phone city address');
    res.json(donor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleAvailability = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user._id });
    donor.isAvailable = !donor.isAvailable;
    await donor.save();
    res.json({ isAvailable: donor.isAvailable, message: `You are now ${donor.isAvailable ? 'available' : 'unavailable'} for donation` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDonationHistory = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user._id });
    const donations = await Donation.find({ donor: donor._id })
      .populate('request', 'patientName bloodGroup hospitalName')
      .sort({ donationDate: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNearbyRequests = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user._id }).populate('user', 'city');
    if (!donor.bloodGroup) {
      return res.json([]);
    }

    const requests = await BloodRequest.find({ status: 'pending' }).populate('receiver');
    const nearby = requests.filter(r => {
      const match = findMatchingDonors(
        [donor],
        r.bloodGroup,
        r.location?.coordinates || [0, 0],
        100
      );
      return match.length > 0;
    });

    res.json(nearby);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const donor = await Donor.findOne({ user: req.user._id });
    const request = await BloodRequest.findById(requestId);

    if (!request || request.status !== 'pending') {
      return res.status(400).json({ message: 'Request not available' });
    }

    request.status = 'accepted';
    request.acceptedBy = donor._id;
    await request.save();

    await Notification.create({
      user: request.receiver,
      type: 'acceptance',
      title: 'Donor Found',
      message: `${req.user.name} has accepted your blood request`,
      relatedTo: request._id,
      onModel: 'BloodRequest'
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const completeDonation = async (req, res) => {
  try {
    const { requestId } = req.params;
    const donor = await Donor.findOne({ user: req.user._id }).populate('user', 'name');
    const request = await BloodRequest.findById(requestId);

    if (!request || request.status !== 'accepted') {
      return res.status(400).json({ message: 'Invalid request' });
    }

    request.status = 'completed';
    request.completedAt = new Date();
    await request.save();

    const donation = await Donation.create({
      donor: donor._id,
      request: request._id,
      bloodGroup: request.bloodGroup,
      unitsDonated: request.unitsRequired,
      donationDate: new Date()
    });

    const prevDate = donor.lastDonationDate;
    donor.lastDonationDate = new Date();
    donor.totalDonations += 1;
    donor.isAvailable = false;
    donor.rewardPoints = (donor.rewardPoints || 0) + 10;

    if (prevDate) {
      const daysSinceLast = Math.floor((new Date() - new Date(prevDate)) / (1000 * 60 * 60 * 24));
      if (daysSinceLast <= 180) {
        donor.donationStreak = (donor.donationStreak || 0) + 1;
      } else {
        donor.donationStreak = 1;
      }
    } else {
      donor.donationStreak = 1;
    }

    const streakBonus = Math.min(donor.donationStreak, 10);
    donor.rewardPoints += streakBonus * 2;

    const earnedBadge = getBadgeForDonations(donor.totalDonations);
    if (earnedBadge && !donor.badges?.some(b => b.name === earnedBadge.name)) {
      if (!donor.badges) donor.badges = [];
      donor.badges.push({ name: earnedBadge.name, icon: earnedBadge.icon, earnedAt: new Date() });
    }

    await donor.save();

    res.json({ donation, message: 'Donation completed successfully', rewardPoints: 10, streakBonus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const BADGES = [
  { name: 'First Donation', icon: '🩸', minDonations: 1 },
  { name: 'Helper', icon: '🤝', minDonations: 3 },
  { name: 'Hero', icon: '🦸', minDonations: 5 },
  { name: 'Lifesaver', icon: '💪', minDonations: 10 },
  { name: 'Champion', icon: '🏆', minDonations: 20 },
  { name: 'Legend', icon: '👑', minDonations: 50 }
];

const getBadgeForDonations = (count) => {
  return BADGES.slice().reverse().find(b => count >= b.minDonations);
};

const getAllDonors = async (req, res) => {
  try {
    const { bloodGroup, city } = req.query;
    const filter = {};
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (city) filter.city = city;

    const donors = await Donor.find(filter).populate('user', 'name email phone city address');
    res.json(donors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDonorProfile, updateDonorProfile, toggleAvailability,
  getDonationHistory, getNearbyRequests, acceptRequest,
  completeDonation, getAllDonors
};
