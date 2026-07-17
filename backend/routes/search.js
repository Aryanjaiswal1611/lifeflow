const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { bloodGroup, city, state, availability, donorName, hospital, distance, lat, lng } = req.query;
    let donors = [];
    let hospitals = [];

    const donorQuery = {};
    if (bloodGroup) donorQuery.bloodGroup = bloodGroup.toUpperCase();
    if (availability === 'true') donorQuery.isAvailable = true;
    if (donorName) {
      const users = await require('../models/User').find({ name: { $regex: donorName, $options: 'i' } }).select('_id');
      donorQuery.user = { $in: users.map(u => u._id) };
    }
    donors = await Donor.find(donorQuery).populate('user', 'name email phone city');

    if (city) {
      const userFilter = await require('../models/User').find({ city: { $regex: city, $options: 'i' } }).select('_id');
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
      const { calculateDistance } = require('../utils/bloodMatch');
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

module.exports = router;
