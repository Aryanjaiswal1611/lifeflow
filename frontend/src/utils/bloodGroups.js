export {
  bloodGroups,
  compatibilityMap,
  getDonatableGroups,
  getReceivableGroups,
  getCompatibilitySummary,
  bloodGroupColors
} from './bloodCompatibility';

export const urgencyColors = {
  normal: 'badge-blue',
  urgent: 'badge-yellow',
  emergency: 'badge-red animate-pulse'
};

export const statusColors = {
  pending: 'badge-yellow',
  accepted: 'badge-green',
  completed: 'badge-blue',
  cancelled: 'badge-gray'
};
