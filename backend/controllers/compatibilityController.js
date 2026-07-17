const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const BloodBank = require('../models/BloodBank');
const DonationCamp = require('../models/DonationCamp');
const { getCompatibilitySummary, smartMatch, findMatchingDonors, calculateDistance } = require('../utils/bloodMatch');

const getCompatibility = async (req, res) => {
  try {
    const { bloodGroup } = req.params;
    if (!bloodGroup) return res.status(400).json({ message: 'Blood group is required' });
    const summary = getCompatibilitySummary(bloodGroup.toUpperCase());
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllCompatibility = async (req, res) => {
  try {
    const groups = ['O-', 'O+', 'B-', 'B+', 'A-', 'A+', 'AB-', 'AB+'];
    const data = groups.map(g => getCompatibilitySummary(g));
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCompatibleDonors = async (req, res) => {
  try {
    const { bloodGroup, lat, lng, maxDistance } = req.query;
    if (!bloodGroup) return res.status(400).json({ message: 'Blood group is required' });
    const query = { isAvailable: true, bloodGroup: { $in: require('../utils/bloodMatch').getReceivableGroups(bloodGroup.toUpperCase()) } };
    let donors = await Donor.find(query).populate('user', 'name email phone city avatar').lean();
    if (lat && lng) {
      const maxDist = parseFloat(maxDistance) || 50;
      donors = donors.map(d => ({
        ...d,
        distance: calculateDistance([parseFloat(lng), parseFloat(lat)], d.location?.coordinates || [0, 0])
      })).filter(d => d.distance <= maxDist).sort((a, b) => a.distance - b.distance);
    }
    res.json(donors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const smartMatchDonors = async (req, res) => {
  try {
    const { bloodGroup, lat, lng, maxDistance } = req.body;
    if (!bloodGroup) return res.status(400).json({ message: 'Blood group is required' });

    const allDonors = await Donor.find({ isAvailable: true }).populate('user', 'name email phone city avatar').lean();
    const hospitals = await Hospital.find({ isVerified: true }).populate('user', 'name email phone').lean();
    const bloodBanks = await BloodBank.find({ isVerified: true }).lean();
    const camps = await DonationCamp.find({ status: { $in: ['active', 'approved'] } }).lean();

    const patient = {
      bloodGroup: bloodGroup.toUpperCase(),
      location: lat && lng ? [parseFloat(lng), parseFloat(lat)] : [0, 0]
    };

    const result = smartMatch(patient, {
      donors: allDonors,
      hospitals,
      bloodBanks,
      camps
    });

    const maxDist = parseFloat(maxDistance) || 50;
    result.compatibleDonors = result.compatibleDonors.filter(d => d.distance <= maxDist);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCompatibility, getAllCompatibility, getCompatibleDonors, smartMatchDonors };
