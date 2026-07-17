const BloodBank = require('../models/BloodBank');
const { calculateDistance } = require('../utils/bloodMatch');

const getNearbyBloodBanks = async (req, res) => {
  try {
    const { lat, lng, maxDistance = 50, city, state, pincode } = req.query;
    let query = { isVerified: true };
    if (city) query.city = { $regex: city, $options: 'i' };
    if (state) query.state = { $regex: state, $options: 'i' };
    if (pincode) query.pincode = pincode;
    let bloodBanks = await BloodBank.find(query).lean();
    if (lat && lng) {
      const maxDist = parseFloat(maxDistance);
      bloodBanks = bloodBanks.map(b => ({
        ...b,
        distance: calculateDistance([parseFloat(lng), parseFloat(lat)], b.location?.coordinates || [0, 0])
      })).filter(b => b.distance <= maxDist).sort((a, b) => a.distance - b.distance);
    }
    res.json(bloodBanks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBloodBankById = async (req, res) => {
  try {
    const bloodBank = await BloodBank.findById(req.params.id);
    if (!bloodBank) return res.status(404).json({ message: 'Blood bank not found' });
    res.json(bloodBank);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllBloodBanks = async (req, res) => {
  try {
    const bloodBanks = await BloodBank.find().sort({ city: 1 });
    res.json(bloodBanks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBloodBank = async (req, res) => {
  try {
    const bloodBank = await BloodBank.create(req.body);
    res.status(201).json(bloodBank);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBloodBank = async (req, res) => {
  try {
    const bloodBank = await BloodBank.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bloodBank) return res.status(404).json({ message: 'Blood bank not found' });
    res.json(bloodBank);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBloodBank = async (req, res) => {
  try {
    await BloodBank.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blood bank deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBloodAvailability = async (req, res) => {
  try {
    const { bloodGroup, lat, lng, maxDistance = 50 } = req.query;
    let query = { isVerified: true };
    if (bloodGroup) query[`bloodInventory.${bloodGroup.toUpperCase()}`] = { $gt: 0 };
    let bloodBanks = await BloodBank.find(query).lean();
    if (lat && lng) {
      const maxDist = parseFloat(maxDistance);
      bloodBanks = bloodBanks.map(b => ({
        ...b,
        distance: calculateDistance([parseFloat(lng), parseFloat(lat)], b.location?.coordinates || [0, 0])
      })).filter(b => b.distance <= maxDist).sort((a, b) => a.distance - b.distance);
    }
    const result = bloodBanks.map(b => ({
      _id: b._id,
      name: b.name,
      address: b.address,
      city: b.city,
      contactNumber: b.contactNumber,
      distance: b.distance,
      bloodInventory: b.bloodInventory,
      lastInventoryUpdate: b.lastInventoryUpdate,
      isOpen24x7: b.isOpen24x7,
      openingHours: b.openingHours,
      emergencyAvailable: b.emergencyAvailable
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNearbyBloodBanks, getBloodBankById, getAllBloodBanks, createBloodBank, updateBloodBank, deleteBloodBank, getBloodAvailability };
