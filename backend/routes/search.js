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
    res.status(500).json({ message: error.message });
  }
});

router.get('/places', protect, async (req, res) => {
  try {
    const { query, city, pincode, lat, lng, radius, type } = req.query;
    const maxDist = parseFloat(radius || 20);

    let searchFilter = { isVerified: true };

    if (query) {
      const trimmed = query.trim();
      searchFilter.$or = [
        { city: { $regex: trimmed, $options: 'i' } },
        { name: { $regex: trimmed, $options: 'i' } },
        { hospitalName: { $regex: trimmed, $options: 'i' } },
        { address: { $regex: trimmed, $options: 'i' } },
        { pincode: { $regex: `^${trimmed.replace(/\s/g, '')}`, $options: 'i' } }
      ];
    } else if (city) {
      searchFilter.city = { $regex: city.trim(), $options: 'i' };
    }

    if (pincode) {
      delete searchFilter.$or;
      delete searchFilter.city;
      searchFilter.pincode = pincode.trim();
    }

    if (searchFilter.$or && searchFilter.$or.length === 0) {
      delete searchFilter.$or;
    }

    let bloodBanks = [];
    let hospitals = [];

    if (!type || type === 'all' || type === 'bloodbank') {
      const bbFilter = { ...searchFilter };
      if (bbFilter.$or) {
        bbFilter.$or = bbFilter.$or.map(cond => {
          const newCond = {};
          for (const [key, val] of Object.entries(cond)) {
            if (key === 'hospitalName') {
              newCond.name = val;
            } else {
              newCond[key] = val;
            }
          }
          return newCond;
        });
      } else if (searchFilter.hospitalName) {
        bbFilter.name = searchFilter.hospitalName;
        delete bbFilter.hospitalName;
      }
      bloodBanks = await BloodBank.find(bbFilter).lean();
    }

    if (!type || type === 'all' || type === 'hospital') {
      const hFilter = { ...searchFilter };
      if (hFilter.$or) {
        hFilter.$or = hFilter.$or.map(cond => {
          const newCond = {};
          for (const [key, val] of Object.entries(cond)) {
            if (key === 'name') {
              newCond.hospitalName = val;
            } else {
              newCond[key] = val;
            }
          }
          return newCond;
        });
      } else if (searchFilter.name) {
        hFilter.hospitalName = searchFilter.name;
        delete hFilter.name;
      }
      hospitals = await Hospital.find(hFilter).populate('user', 'name email phone').lean();
    }

    const seen = new Set();
    bloodBanks = bloodBanks.filter(b => {
      const key = b._id.toString();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    hospitals = hospitals.filter(h => {
      const key = h._id.toString();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

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
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
