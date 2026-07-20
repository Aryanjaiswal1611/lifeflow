const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const BloodBank = require('../models/BloodBank');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { calculateDistance } = require('../utils/bloodMatch');

router.get('/', protect, async (req, res) => {
  try {
    const { bloodGroup, city, state, availability, donorName, hospital, distance, lat, lng } = req.query;
    let donors = [];
    let hospitals = [];

    const donorQuery = {};
    if (bloodGroup) donorQuery.bloodGroup = bloodGroup.toUpperCase();
    if (availability === 'true') donorQuery.isAvailable = true;
    if (donorName) {
      const users = await User.find({ name: { $regex: donorName, $options: 'i' } }).select('_id');
      donorQuery.user = { $in: users.map(u => u._id) };
    }
    donors = await Donor.find(donorQuery).populate('user', 'name email phone city');

    if (city) {
      const userFilter = await User.find({ city: { $regex: city, $options: 'i' } }).select('_id');
      const filtered = donors.filter(d => userFilter.some(u => u._id.equals(d.user?._id)));
      donors = filtered;
    }

    const hospitalQuery = {};
    if (hospital) {
      hospitalQuery.hospitalName = { $regex: hospital, $options: 'i' };
    }
    if (city) hospitalQuery.city = { $regex: city, $options: 'i' };
    hospitals = await Hospital.find(hospitalQuery).populate('user', 'name email phone');

    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      donors = donors.map(d => ({
        ...d.toObject(),
        distance: calculateDistance([userLng, userLat], d.location?.coordinates || [0, 0])
      })).sort((a, b) => a.distance - b.distance);
      hospitals = hospitals.map(h => ({
        ...h.toObject(),
        distance: calculateDistance([userLng, userLat], h.location?.coordinates || [0, 0])
      })).sort((a, b) => a.distance - b.distance);
      if (distance) {
        const maxDist = parseFloat(distance);
        donors = donors.filter(d => d.distance <= maxDist);
        hospitals = hospitals.filter(h => h.distance <= maxDist);
      }
    }

    res.json({ donors, hospitals });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/places', protect, async (req, res) => {
  try {
    const { query, city, pincode, lat, lng, radius, type } = req.query;
    const maxDist = parseFloat(radius || 20);

    if (!query && !city && !pincode && !lat && !lng) {
      return res.json({ bloodBanks: [], hospitals: [] });
    }

    let bloodBanks = [];
    let hospitals = [];

    const searchStr = (query || city || '').trim();
    const searchRegex = searchStr
      ? new RegExp(searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      : null;

    if (!type || type === 'all' || type === 'bloodbank') {
      const bbQuery = {};
      if (searchRegex) {
        bbQuery.$or = [
          { city: searchRegex },
          { name: searchRegex },
          { address: searchRegex }
        ];
      }
      if (pincode) bbQuery.pincode = pincode.trim();
      bloodBanks = await BloodBank.find(bbQuery).lean();
    }

    if (!type || type === 'all' || type === 'hospital') {
      const hQuery = {};
      if (searchRegex) {
        hQuery.$or = [
          { city: searchRegex },
          { hospitalName: searchRegex },
          { address: searchRegex }
        ];
      }
      if (pincode) hQuery.pincode = pincode.trim();
      hospitals = await Hospital.find(hQuery).populate('user', 'name email phone').lean();
    }

    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      bloodBanks = bloodBanks.map(b => ({
        ...b,
        distance: calculateDistance([userLng, userLat], b.location?.coordinates || [0, 0])
      })).filter(b => b.distance <= maxDist).sort((a, b) => a.distance - b.distance);

      hospitals = hospitals.map(h => ({
        ...h,
        distance: calculateDistance([userLng, userLat], h.location?.coordinates || [0, 0])
      })).filter(h => h.distance <= maxDist).sort((a, b) => a.distance - b.distance);
    }

    res.json({ bloodBanks, hospitals });
  } catch (error) {
    console.error('Search places error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
