const BLOOD_GROUPS = ['O-', 'O+', 'B-', 'B+', 'A-', 'A+', 'AB-', 'AB+'];

const compatibility = {
  'O-': ['O-'],
  'O+': ['O+', 'O-'],
  'B-': ['B-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-']
};

const canDonateTo = (donorBlood, receiverBlood) => {
  return compatibility[receiverBlood]?.includes(donorBlood);
};

const canReceiveFrom = (receiverBlood, donorBlood) => {
  return compatibility[receiverBlood]?.includes(donorBlood);
};

const getDonatableGroups = (bloodGroup) => {
  const results = [];
  for (const bg of BLOOD_GROUPS) {
    if (compatibility[bg]?.includes(bloodGroup)) {
      results.push(bg);
    }
  }
  return results;
};

const getReceivableGroups = (bloodGroup) => {
  return compatibility[bloodGroup] || [];
};

const getCompatibilitySummary = (bloodGroup) => {
  return {
    bloodGroup,
    canDonateTo: getDonatableGroups(bloodGroup),
    canReceiveFrom: getReceivableGroups(bloodGroup),
    isUniversalDonor: bloodGroup === 'O-',
    isUniversalRecipient: bloodGroup === 'AB+',
    donorType: bloodGroup === 'O-' ? 'Universal Donor' :
               bloodGroup === 'AB+' ? 'Universal Recipient' :
               bloodGroup === 'O+' ? 'Universal Donor (Positive)' : 'Selective'
  };
};

const calculateDistance = (coord1, coord2) => {
  if (!coord1 || !coord2) return Infinity;
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const findMatchingDonors = (donors, receiverBlood, receiverLocation, maxDistance = 50) => {
  const compatibleGroups = compatibility[receiverBlood] || [];
  return donors
    .filter(d => {
      if (!d.bloodGroup || !compatibleGroups.includes(d.bloodGroup)) return false;
      const distance = calculateDistance(d.location?.coordinates, receiverLocation);
      const eligible = !d.lastDonationDate ||
        (new Date() - new Date(d.lastDonationDate)) > (90 * 24 * 60 * 60 * 1000);
      return distance <= maxDistance && d.isAvailable && eligible;
    })
    .map(d => ({
      ...d.toObject ? d.toObject() : d,
      distance: calculateDistance(d.location?.coordinates, receiverLocation)
    }))
    .sort((a, b) => a.distance - b.distance);
};

const findCompatibleHospitals = (hospitals, bloodGroup) => {
  return hospitals
    .filter(h => h.isVerified && (h.bloodInventory?.[bloodGroup] || 0) > 0)
    .map(h => ({
      ...h.toObject ? h.toObject() : h,
      availableUnits: h.bloodInventory?.[bloodGroup] || 0
    }))
    .sort((a, b) => (b.availableUnits || 0) - (a.availableUnits || 0));
};

const findCompatibleBloodBanks = (bloodBanks, bloodGroup) => {
  return bloodBanks
    .filter(b => (b.bloodInventory?.[bloodGroup] || 0) > 0)
    .map(b => ({
      ...b.toObject ? b.toObject() : b,
      availableUnits: b.bloodInventory?.[bloodGroup] || 0
    }))
    .sort((a, b) => (b.availableUnits || 0) - (a.availableUnits || 0));
};

const findActiveCamps = (camps, bloodGroup) => {
  return camps.filter(c =>
    c.status === 'active' &&
    c.bloodGroupsNeeded?.includes(bloodGroup) &&
    c.registeredCount < c.maxParticipants
  );
};

const smartMatch = (patient, options) => {
  const { donors, hospitals, bloodBanks, camps } = options;
  return {
    compatibleDonors: findMatchingDonors(donors || [], patient.bloodGroup, patient.location, 50),
    hospitalsWithStock: findCompatibleHospitals(hospitals || [], patient.bloodGroup),
    bloodBanks: findCompatibleBloodBanks(bloodBanks || [], patient.bloodGroup),
    activeCamps: findActiveCamps(camps || [], patient.bloodGroup)
  };
};

module.exports = {
  BLOOD_GROUPS, compatibility, canDonateTo, canReceiveFrom,
  getDonatableGroups, getReceivableGroups, getCompatibilitySummary,
  calculateDistance, findMatchingDonors, findCompatibleHospitals,
  findCompatibleBloodBanks, findActiveCamps, smartMatch
};
