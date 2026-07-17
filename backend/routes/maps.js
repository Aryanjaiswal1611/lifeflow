const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const { protect } = require('../middleware/auth');
const { calculateDistance } = require('../utils/bloodMatch');

router.get('/nearby-donors', protect, async (req, res) => {
  try {
    const { lat, lng, maxDistance = 50, bloodGroup } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'Latitude and longitude required' });
    const query = { isAvailable: true, 'location.coordinates.0': { $ne: 0 } };
    if (bloodGroup) query.bloodGroup = bloodGroup.toUpperCase();
    let donors = await Donor.find(query).populate('user', 'name email phone city avatar');
    donors = donors.map(d => {
      const dist = calculateDistance([parseFloat(lng), parseFloat(lat)], d.location?.coordinates || [0, 0]);
      return { ...d.toObject(), distance: Math.round(dist * 100) / 100 };
    }).filter(d => d.distance <= parseFloat(maxDistance)).sort((a, b) => a.distance - b.distance);
    res.json(donors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/nearby-hospitals', protect, async (req, res) => {
  try {
    const { lat, lng, maxDistance = 50 } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'Latitude and longitude required' });
    let hospitals = await Hospital.find({ isVerified: true, 'location.coordinates.0': { $ne: 0 } }).populate('user', 'name email phone');
    hospitals = hospitals.map(h => {
      const dist = calculateDistance([parseFloat(lng), parseFloat(lat)], h.location?.coordinates || [0, 0]);
      return { ...h.toObject(), distance: Math.round(dist * 100) / 100 };
    }).filter(h => h.distance <= parseFloat(maxDistance)).sort((a, b) => a.distance - b.distance);
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/route', protect, async (req, res) => {
  try {
    const { originLat, originLng, destLat, destLng } = req.query;
    if (!originLat || !originLng || !destLat || !destLng) {
      return res.status(400).json({ message: 'Origin and destination coordinates required' });
    }
    const distance = calculateDistance(
      [parseFloat(originLng), parseFloat(originLat)],
      [parseFloat(destLng), parseFloat(destLat)]
    );
    res.json({ distance: Math.round(distance * 100) / 100, unit: 'km' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/update-location', protect, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (!lat || !lng) return res.status(400).json({ message: 'Latitude and longitude required' });
    let profile;
    if (req.user.role === 'donor') {
      profile = await Donor.findOneAndUpdate(
        { user: req.user._id },
        { location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] } },
        { new: true }
      );
    } else if (req.user.role === 'hospital') {
      profile = await Hospital.findOneAndUpdate(
        { user: req.user._id },
        { location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] } },
        { new: true }
      );
    }
    res.json({ message: 'Location updated', profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
