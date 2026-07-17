const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');
const { protect, authorize } = require('../middleware/auth');

const BADGES = [
  { name: 'First Donation', icon: '🩸', minDonations: 1 },
  { name: 'Helper', icon: '🤝', minDonations: 3 },
  { name: 'Hero', icon: '🦸', minDonations: 5 },
  { name: 'Lifesaver', icon: '💪', minDonations: 10 },
  { name: 'Champion', icon: '🏆', minDonations: 20 },
  { name: 'Legend', icon: '👑', minDonations: 50 }
];

const LEVELS = [
  { name: 'bronze', icon: '🥉', points: 0 },
  { name: 'silver', icon: '🥈', points: 100 },
  { name: 'gold', icon: '🥇', points: 300 },
  { name: 'platinum', icon: '💎', points: 500 },
  { name: 'diamond', icon: '🔷', points: 1000 }
];

router.get('/my', protect, authorize('donor'), async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user._id }).populate('user', 'name email');
    if (!donor) return res.status(404).json({ message: 'Donor not found' });
    const earnedBadges = BADGES
      .filter(b => donor.totalDonations >= b.minDonations)
      .map(b => ({ ...b, earned: true }));
    const currentLevel = LEVELS
      .slice().reverse()
      .find(l => donor.rewardPoints >= l.points);
    const nextLevel = LEVELS.find(l => l.points > (donor.rewardPoints || 0));
    res.json({
      donor,
      points: donor.rewardPoints || 0,
      badges: earnedBadges,
      level: currentLevel || LEVELS[0],
      nextLevel: nextLevel || null,
      streak: donor.donationStreak || 0,
      totalDonations: donor.totalDonations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/leaderboard', protect, async (req, res) => {
  try {
    const donors = await Donor.find({ totalDonations: { $gt: 0 } })
      .populate('user', 'name email city avatar')
      .sort({ totalDonations: -1, rewardPoints: -1 })
      .limit(50);
    const leaderboard = donors.map((d, i) => ({
      rank: i + 1,
      name: d.user?.name || 'Unknown',
      city: d.user?.city || '',
      bloodGroup: d.bloodGroup,
      totalDonations: d.totalDonations,
      points: d.rewardPoints || 0,
      avatar: d.user?.avatar
    }));
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
