import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  verifyOtp: (data) => API.post('/auth/verify-otp', data),
  resendOtp: (data) => API.post('/auth/resend-otp', data),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  resetPassword: (data) => API.post('/auth/reset-password', data),
  googleAuth: (data) => API.post('/auth/google', data),
  toggle2FA: () => API.post('/auth/2fa/toggle')
};

export const donorAPI = {
  getProfile: () => API.get('/donors/profile'),
  updateProfile: (data) => API.put('/donors/profile', data),
  toggleAvailability: () => API.patch('/donors/toggle-availability'),
  getDonationHistory: () => API.get('/donors/donation-history'),
  getNearbyRequests: () => API.get('/donors/nearby-requests'),
  acceptRequest: (id) => API.post(`/donors/accept-request/${id}`),
  completeDonation: (id) => API.post(`/donors/complete-donation/${id}`),
  getAll: (params) => API.get('/donors', { params })
};

export const receiverAPI = {
  getProfile: () => API.get('/receivers/profile'),
  updateProfile: (data) => API.put('/receivers/profile', data),
  createBloodRequest: (data) => API.post('/receivers/blood-request', data),
  getMyRequests: () => API.get('/receivers/my-requests'),
  getMatchedDonors: (id) => API.get(`/receivers/matched-donors/${id}`),
  cancelRequest: (id) => API.patch(`/receivers/cancel-request/${id}`)
};

export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getUsers: (params) => API.get('/admin/users', { params }),
  toggleUserStatus: (id) => API.patch(`/admin/users/${id}/toggle-status`),
  verifyUser: (id) => API.patch(`/admin/users/${id}/verify`),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  getRequests: () => API.get('/admin/requests'),
  getHospitals: () => API.get('/admin/hospitals'),
  verifyHospital: (id) => API.patch(`/admin/hospitals/${id}/verify`),
  getAuditLogs: () => API.get('/admin/audit-logs'),
  getReport: () => API.get('/reports/admin-report'),
  getAnalytics: () => API.get('/admin/analytics')
};

export const hospitalAPI = {
  getProfile: () => API.get('/hospitals/profile'),
  updateProfile: (data) => API.put('/hospitals/profile', data),
  updateInventory: (data) => API.patch('/hospitals/inventory', data),
  getRequests: () => API.get('/hospitals/requests'),
  getDonations: () => API.get('/hospitals/donations'),
  getCamps: () => API.get('/hospitals/camps')
};

export const notificationAPI = {
  getAll: () => API.get('/notifications'),
  getUnreadCount: () => API.get('/notifications/unread-count'),
  markAsRead: (id) => API.patch(`/notifications/${id}/read`),
  markAllAsRead: () => API.patch('/notifications/read-all')
};

export const chatAPI = {
  createOrGetConversation: (data) => API.post('/chat/create', data),
  getConversations: () => API.get('/chat/conversations'),
  getMessages: (id) => API.get(`/chat/${id}`),
  sendMessage: (data) => API.post('/chat/message', data),
  markAsRead: (id) => API.put(`/chat/read/${id}`)
};

export const callAPI = {
  startCall: (data) => API.post('/calls/start', data),
  endCall: (id, data) => API.patch(`/calls/${id}/end`, data),
  getHistory: () => API.get('/calls/history')
};

export const searchAPI = {
  search: (params) => API.get('/search', { params })
};

export const rewardAPI = {
  getMyRewards: () => API.get('/rewards/my'),
  getLeaderboard: () => API.get('/rewards/leaderboard')
};

export const reportAPI = {
  getDonationCertificate: (id) => API.get(`/reports/donation-certificate/${id}`),
  getDonationHistoryPdf: (donorId) => API.get(`/reports/donation-history-pdf/${donorId}`),
  getAdminReport: () => API.get('/reports/admin-report'),
  getHospitalReport: (id) => API.get(`/reports/hospital-report/${id}`)
};

export const mapAPI = {
  getNearbyDonors: (params) => API.get('/maps/nearby-donors', { params }),
  getNearbyHospitals: (params) => API.get('/maps/nearby-hospitals', { params }),
  getRoute: (params) => API.get('/maps/route', { params }),
  updateLocation: (data) => API.put('/maps/update-location', data)
};

export const emergencyAPI = {
  sendSOS: (data) => API.post('/emergency/sos', data),
  getActiveEmergencies: () => API.get('/emergency/active'),
  trackEmergency: (id) => API.get(`/emergency/${id}/track`),
  respondToEmergency: (id) => API.patch(`/emergency/${id}/respond`),
  fulfillEmergency: (id) => API.patch(`/emergency/${id}/fulfill`),
  getEmergencyStats: () => API.get('/emergency/stats')
};

export const aiAPI = {
  chat: (data) => API.post('/ai/chat', data),
  checkEligibility: () => API.get('/ai/eligibility'),
  checkCompatibility: (data) => API.post('/ai/compatibility', data),
  getHealthTip: () => API.get('/ai/health-tip'),
  getFAQ: (params) => API.get('/ai/faq', { params }),
  getDemandPrediction: () => API.get('/ai/demand-prediction')
};

export const compatibilityAPI = {
  getAll: () => API.get('/compatibility/all'),
  getByGroup: (group) => API.get(`/compatibility/${group}`),
  getCompatibleDonors: (params) => API.get('/compatibility', { params }),
  smartMatch: (data) => API.post('/compatibility/smart-match', data)
};

export const bloodBankAPI = {
  getNearby: (params) => API.get('/bloodbanks/nearby', { params }),
  getAll: () => API.get('/bloodbanks'),
  getById: (id) => API.get(`/bloodbanks/${id}`),
  create: (data) => API.post('/bloodbanks', data),
  update: (id, data) => API.put(`/bloodbanks/${id}`, data),
  delete: (id) => API.delete(`/bloodbanks/${id}`),
  getAvailability: (params) => API.get('/bloodbanks/availability', { params })
};

export const campAPI = {
  getNearby: (params) => API.get('/camps/nearby', { params }),
  getAll: () => API.get('/camps'),
  getById: (id) => API.get(`/camps/${id}`),
  create: (data) => API.post('/camps', data),
  update: (id, data) => API.put(`/camps/${id}`, data),
  register: (id) => API.post(`/camps/${id}/register`),
  approve: (id) => API.patch(`/camps/${id}/approve`),
  reject: (id) => API.patch(`/camps/${id}/reject`),
  complete: (id) => API.patch(`/camps/${id}/complete`),
  getMyRegistrations: () => API.get('/camps/my-registrations')
};

export const availabilityAPI = {
  search: (params) => API.get('/availability/search', { params }),
  getByGroup: (params) => API.get('/availability/by-group', { params })
};

export const blogAPI = {
  getAll: (params) => API.get('/blogs', { params }),
  getBySlug: (slug) => API.get(`/blogs/${slug}`),
  getById: (id) => API.get(`/blogs/id/${id}`),
  create: (data) => API.post('/blogs', data),
  update: (id, data) => API.put(`/blogs/${id}`, data),
  delete: (id) => API.delete(`/blogs/${id}`)
};

export default API;
