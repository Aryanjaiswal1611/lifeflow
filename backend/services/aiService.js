const bloodCompatibility = require('../utils/bloodMatch').compatibility;

const ELIGIBILITY_RULES = {
  minAge: 18,
  maxAge: 65,
  minWeight: 45,
  donationGapDays: 90,
  maxDonationsPerYear: 6
};

const FAQ_DATA = [
  { q: 'Who can donate blood?', a: 'Anyone aged 18-65, weighing at least 45kg, and in good health can donate blood.' },
  { q: 'How often can I donate blood?', a: 'You can donate whole blood every 56 days (about 2 months).' },
  { q: 'Is blood donation safe?', a: 'Yes, blood donation is completely safe. Sterile equipment is used for each donor and discarded after use.' },
  { q: 'How long does it take to donate blood?', a: 'The entire process takes about 1 hour from registration to refreshments.' },
  { q: 'Can I donate if I have a cold?', a: 'You should wait until you have fully recovered from any illness before donating.' },
  { q: 'What should I eat before donating blood?', a: 'Eat a healthy meal and drink plenty of fluids before donating. Avoid fatty foods.' },
  { q: 'How much blood is taken?', a: 'About 450ml of blood is collected during a donation.' },
  { q: 'Will I feel pain?', a: 'You may feel a slight pinch when the needle is inserted, but it is generally painless.' },
  { q: 'Can I donate blood while on medication?', a: 'It depends on the medication. Consult with our medical staff before donating.' },
  { q: 'What happens to my blood after donation?', a: 'Your blood is tested, processed, and stored at blood banks for patients in need.' }
];

const HEALTH_TIPS = [
  'Stay hydrated before and after donation.',
  'Eat iron-rich foods like spinach, beans, and red meat.',
  'Get adequate sleep the night before donating.',
  'Avoid alcohol 24 hours before donation.',
  'Wear comfortable clothing with sleeves that can be rolled up.',
  'Have a light snack before donating.',
  'Rest for 15 minutes after donation.',
  'Avoid heavy lifting for a few hours after donation.',
  'Keep track of your donation schedule.',
  'Encourage friends and family to donate too!'
];

const checkDonorEligibility = (donor) => {
  const issues = [];
  if (donor.age < ELIGIBILITY_RULES.minAge) issues.push(`Minimum age is ${ELIGIBILITY_RULES.minAge} years`);
  if (donor.age > ELIGIBILITY_RULES.maxAge) issues.push(`Maximum age is ${ELIGIBILITY_RULES.maxAge} years`);
  if (donor.weight < ELIGIBILITY_RULES.minWeight) issues.push(`Minimum weight is ${ELIGIBILITY_RULES.minWeight}kg`);
  if (donor.lastDonationDate) {
    const daysSince = Math.floor((new Date() - new Date(donor.lastDonationDate)) / (1000 * 60 * 60 * 24));
    if (daysSince < ELIGIBILITY_RULES.donationGapDays) {
      issues.push(`Must wait ${ELIGIBILITY_RULES.donationGapDays - daysSince} more days before donating again`);
    }
  }
  if (donor.totalDonations >= ELIGIBILITY_RULES.maxDonationsPerYear) {
    const thisYear = new Date().getFullYear();
    const donationsThisYear = donor.totalDonations;
    if (donationsThisYear >= ELIGIBILITY_RULES.maxDonationsPerYear) {
      issues.push(`Maximum ${ELIGIBILITY_RULES.maxDonationsPerYear} donations per year reached`);
    }
  }
  if (!donor.isAvailable) issues.push('You are currently marked as unavailable');
  return {
    eligible: issues.length === 0,
    issues,
    nextEligibleDate: donor.lastDonationDate
      ? new Date(new Date(donor.lastDonationDate).getTime() + ELIGIBILITY_RULES.donationGapDays * 24 * 60 * 60 * 1000)
      : null
  };
};

const checkBloodCompatibility = (donorBlood, receiverBlood) => {
  return bloodCompatibility[receiverBlood]?.includes(donorBlood) || false;
};

const getHealthTips = () => {
  return HEALTH_TIPS[Math.floor(Math.random() * HEALTH_TIPS.length)];
};

const searchFAQ = (query) => {
  const q = query.toLowerCase();
  return FAQ_DATA.filter(
    item => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
  );
};

const getDemandPrediction = async () => {
  const BloodRequest = require('../models/BloodRequest');
  const Donation = require('../models/Donation');
  const monthlyRequests = await BloodRequest.aggregate([
    { $match: { createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } } },
    { $group: { _id: '$bloodGroup', count: { $sum: 1 } } }
  ]);
  const monthlyDonations = await Donation.aggregate([
    { $match: { donationDate: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } } },
    { $group: { _id: '$bloodGroup', count: { $sum: 1 } } }
  ]);
  const demand = {};
  for (const bg of Object.keys(bloodCompatibility)) {
    const requested = monthlyRequests.find(r => r._id === bg)?.count || 0;
    const donated = monthlyDonations.find(d => d._id === bg)?.count || 0;
    demand[bg] = { requested, donated, deficit: Math.max(0, requested - donated) };
  }
  return demand;
};

const chatbotResponse = (message) => {
  const msg = message.toLowerCase();
  if (msg.includes('eligible') || msg.includes('can i donate')) {
    return 'To check your eligibility, please ensure you are between 18-65 years old, weigh at least 45kg, and are in good health. You can use the Donor Eligibility Checker on your dashboard for a detailed assessment.';
  }
  if (msg.includes('compatible') || msg.includes('blood match')) {
    return 'Blood compatibility: O- is the universal donor (can donate to all), AB+ is the universal recipient (can receive from all). Use the Blood Compatibility Checker tool for specific matches.';
  }
  if (msg.includes('donation') && (msg.includes('how') || msg.includes('process'))) {
    return 'The donation process: 1) Register your details 2) Health screening 3) Donation (10-15 min) 4) Rest and refreshments. The entire process takes about 1 hour.';
  }
  if (msg.includes('emergency') || msg.includes('urgent')) {
    return 'If you have an emergency blood requirement, please use the SOS Emergency feature on your dashboard. This will alert nearby donors immediately.';
  }
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return 'Hello! Welcome to LifeFlow. How can I help you today? You can ask me about blood donation, eligibility, compatibility, or health tips.';
  }
  if (msg.includes('thank')) {
    return "You're welcome! Saving lives through blood donation is a noble cause. Is there anything else I can help with?";
  }
  const faqResults = searchFAQ(msg);
  if (faqResults.length > 0) {
    return faqResults[0].a;
  }
  return 'I can help with blood donation information, eligibility checks, compatibility queries, and health tips. Please ask me a specific question!';
};

module.exports = {
  checkDonorEligibility,
  checkBloodCompatibility,
  getHealthTips,
  searchFAQ,
  getDemandPrediction,
  chatbotResponse,
  FAQ_DATA,
  HEALTH_TIPS
};
