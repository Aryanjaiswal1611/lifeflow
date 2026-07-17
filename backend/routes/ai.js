const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');
const { protect } = require('../middleware/auth');
const aiService = require('../services/aiService');

router.post('/chat', protect, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });
    const response = aiService.chatbotResponse(message);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/eligibility', protect, async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user._id });
    if (!donor) return res.status(404).json({ message: 'Donor profile not found' });
    const result = aiService.checkDonorEligibility(donor);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/compatibility', protect, async (req, res) => {
  try {
    const { donorBlood, receiverBlood } = req.body;
    if (!donorBlood || !receiverBlood) {
      return res.status(400).json({ message: 'Both donor and receiver blood groups required' });
    }
    const compatible = aiService.checkBloodCompatibility(donorBlood.toUpperCase(), receiverBlood.toUpperCase());
    res.json({ compatible, donorBlood, receiverBlood });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/health-tip', protect, async (req, res) => {
  try {
    const tip = aiService.getHealthTips();
    res.json({ tip });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/faq', protect, async (req, res) => {
  try {
    const { q } = req.query;
    if (q) {
      const results = aiService.searchFAQ(q);
      return res.json({ results });
    }
    res.json({ results: aiService.FAQ_DATA });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/demand-prediction', protect, async (req, res) => {
  try {
    const prediction = await aiService.getDemandPrediction();
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
