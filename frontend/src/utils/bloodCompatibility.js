export const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const compatibilityMap = {
  'O-': ['O-'],
  'O+': ['O+', 'O-'],
  'B-': ['B-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-']
};

export const canDonateTo = (donor, receiver) => compatibilityMap[receiver]?.includes(donor);

export const canReceiveFrom = (receiver, donor) => compatibilityMap[receiver]?.includes(donor);

export const getDonatableGroups = (bloodGroup) => {
  return bloodGroups.filter(bg => compatibilityMap[bg]?.includes(bloodGroup));
};

export const getReceivableGroups = (bloodGroup) => {
  return compatibilityMap[bloodGroup] || [];
};

export const getCompatibilitySummary = (bloodGroup) => ({
  bloodGroup,
  canDonateTo: getDonatableGroups(bloodGroup),
  canReceiveFrom: getReceivableGroups(bloodGroup),
  isUniversalDonor: bloodGroup === 'O-',
  isUniversalRecipient: bloodGroup === 'AB+',
  donorType: bloodGroup === 'O-' ? 'Universal Donor' :
             bloodGroup === 'AB+' ? 'Universal Recipient' :
             bloodGroup === 'O+' ? 'Universal Donor (Positive)' : 'Selective'
});

export const bloodGroupColors = {
  'A+': { bg: 'bg-blue-100', text: 'text-blue-700', darkBg: 'dark:bg-blue-900/40', darkText: 'dark:text-blue-300' },
  'A-': { bg: 'bg-blue-50', text: 'text-blue-600', darkBg: 'dark:bg-blue-900/20', darkText: 'dark:text-blue-400' },
  'B+': { bg: 'bg-orange-100', text: 'text-orange-700', darkBg: 'dark:bg-orange-900/40', darkText: 'dark:text-orange-300' },
  'B-': { bg: 'bg-orange-50', text: 'text-orange-600', darkBg: 'dark:bg-orange-900/20', darkText: 'dark:text-orange-400' },
  'AB+': { bg: 'bg-purple-100', text: 'text-purple-700', darkBg: 'dark:bg-purple-900/40', darkText: 'dark:text-purple-300' },
  'AB-': { bg: 'bg-purple-50', text: 'text-purple-600', darkBg: 'dark:bg-purple-900/20', darkText: 'dark:text-purple-400' },
  'O+': { bg: 'bg-green-100', text: 'text-green-700', darkBg: 'dark:bg-green-900/40', darkText: 'dark:text-green-300' },
  'O-': { bg: 'bg-red-100', text: 'text-red-700', darkBg: 'dark:bg-red-900/40', darkText: 'dark:text-red-300' }
};
