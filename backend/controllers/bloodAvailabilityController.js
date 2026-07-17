const BloodBank = require('../models/BloodBank');
const Hospital = require('../models/Hospital');
const Donor = require('../models/Donor');
const { calculateDistance, getReceivableGroups } = require('../utils/bloodMatch');

const searchBloodAvailability = async (req, res) => {
  try {
    const { bloodGroup, type, lat, lng, maxDistance = 50, city } = req.query;
    const result = { hospitals: [], bloodBanks: [], donors: [] };

    if (!type || type === 'hospital' || type === 'all') {
      let hospQuery = {};
      if (bloodGroup) hospQuery[`bloodInventory.${bloodGroup.toUpperCase()}`] = { $gt: 0 };
      if (city) hospQuery.city = { $regex: city, $options: 'i' };
      let hospitals = await Hospital.find(hospQuery).populate('user', 'name email phone').lean();
      if (lat && lng) {
        const maxDist = parseFloat(maxDistance);
        hospitals = hospitals.map(h => ({
          ...h,
          distance: calculateDistance([parseFloat(lng), parseFloat(lat)], h.location?.coordinates || [0, 0])
        })).filter(h => h.distance <= maxDist).sort((a, b) => a.distance - b.distance);
      }
      result.hospitals = hospitals;
    }

    if (!type || type === 'bloodbank' || type === 'all') {
      let bbQuery = { isVerified: true };
      if (bloodGroup) bbQuery[`bloodInventory.${bloodGroup.toUpperCase()}`] = { $gt: 0 };
      if (city) bbQuery.city = { $regex: city, $options: 'i' };
      let bloodBanks = await BloodBank.find(bbQuery).lean();
      if (lat && lng) {
        const maxDist = parseFloat(maxDistance);
        bloodBanks = bloodBanks.map(b => ({
          ...b,
          distance: calculateDistance([parseFloat(lng), parseFloat(lat)], b.location?.coordinates || [0, 0])
        })).filter(b => b.distance <= maxDist).sort((a, b) => a.distance - b.distance);
      }
      result.bloodBanks = bloodBanks;
    }

    if (!type || type === 'donor' || type === 'all') {
      let donorQuery = { isAvailable: true };
      if (bloodGroup) {
        const compatible = getReceivableGroups(bloodGroup.toUpperCase());
        donorQuery.bloodGroup = { $in: compatible };
      }
      if (city) {
        const User = require('../models/User');
        const users = await User.find({ city: { $regex: city, $options: 'i' } }).select('_id').lean();
        donorQuery.user = { $in: users.map(u => u._id) };
      }
      let donors = await Donor.find(donorQuery).populate('user', 'name email phone city avatar').lean();
      if (lat && lng) {
        const maxDist = parseFloat(maxDistance);
        donors = donors.map(d => ({
          ...d,
          distance: calculateDistance([parseFloat(lng), parseFloat(lat)], d.location?.coordinates || [0, 0])
        })).filter(d => d.distance <= maxDist).sort((a, b) => a.distance - b.distance);
      }
      result.donors = donors;
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBloodAvailabilityByGroup = async (req, res) => {
  try {
    const { bloodGroup, lat, lng } = req.query;
    const result = [];

    const hospitals = await Hospital.find({ isVerified: true }).lean();
    const bloodBanks = await BloodBank.find({ isVerified: true }).lean();

    const allSources = [
      ...hospitals.map(h => ({
        _id: h._id,
        name: h.hospitalName,
        type: 'Hospital',
        address: h.address,
        city: h.city,
        contactNumber: h.contactNumber,
        bloodInventory: h.bloodInventory,
        isVerified: h.isVerified,
        location: h.location,
        lastUpdated: h.updatedAt
      })),
      ...bloodBanks.map(b => ({
        _id: b._id,
        name: b.name,
        type: 'Blood Bank',
        address: b.address,
        city: b.city,
        contactNumber: b.contactNumber,
        bloodInventory: b.bloodInventory,
        isVerified: b.isVerified,
        location: b.location,
        lastUpdated: b.updatedAt
      }))
    ];

    for (const source of allSources) {
      if (bloodGroup && (!source.bloodInventory?.[bloodGroup] || source.bloodInventory[bloodGroup] === 0)) continue;
      const entry = {
        _id: source._id,
        name: source.name,
        type: source.type,
        address: source.address,
        city: source.city,
        contactNumber: source.contactNumber,
        isVerified: source.isVerified,
        lastUpdated: source.lastUpdated
      };
      if (bloodGroup) {
        entry.availableUnits = source.bloodInventory[bloodGroup];
        entry.bloodGroup = bloodGroup;
      } else {
        entry.inventory = source.bloodInventory;
      }
      if (lat && lng) {
        entry.distance = calculateDistance([parseFloat(lng), parseFloat(lat)], source.location?.coordinates || [0, 0]);
      }
      result.push(entry);
    }

    res.json(result.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { searchBloodAvailability, getBloodAvailabilityByGroup };
