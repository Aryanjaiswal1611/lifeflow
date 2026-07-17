import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { donorAPI, chatAPI, rewardAPI, campAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { BiDroplet, BiCheckCircle, BiCalendar, BiTrendingUp, BiMessageDetail, BiTrophy, BiEdit, BiHeart, BiMapPin } from 'react-icons/bi';
import { statusColors, getCompatibilitySummary, bloodGroupColors } from '../../utils/bloodGroups';

const DonorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [donor, setDonor] = useState(null);
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [rewards, setRewards] = useState(null);
  const [camps, setCamps] = useState([]);
  const [tab, setTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ age: '', gender: 'male', bloodGroup: 'A+', weight: '', medicalConditions: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [profRes, donRes, rewRes] = await Promise.all([
        donorAPI.getProfile(),
        donorAPI.getDonationHistory(),
        rewardAPI.getMyRewards().catch(() => null)
      ]);
      setDonor(profRes.data);
      setDonations(donRes.data);
      setRewards(rewRes?.data || null);
      setForm({
        age: profRes.data.age || '',
        gender: profRes.data.gender || 'male',
        bloodGroup: profRes.data.bloodGroup || 'A+',
        weight: profRes.data.weight || '',
        medicalConditions: profRes.data.medicalConditions || ''
      });
      const reqRes = await donorAPI.getNearbyRequests();
      setRequests(reqRes.data);
      const campRes = await campAPI.getNearby({ limit: 3 });
      setCamps(Array.isArray(campRes.data) ? campRes.data : []);
    } catch (err) {
      toast.error('Failed to load donor data');
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const res = await donorAPI.toggleAvailability();
      setDonor(prev => ({ ...prev, isAvailable: res.data.isAvailable }));
      toast.success(res.data.message);
    } catch (err) {
      toast.error('Failed to toggle availability');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await donorAPI.updateProfile(form);
      setDonor(res.data);
      setEditMode(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleAcceptRequest = async (request) => {
    try {
      await donorAPI.acceptRequest(request._id);
      const receiverId = request.receiver?.user || request.receiver;
      if (receiverId) {
        await chatAPI.createOrGetConversation({ participantId: receiverId, requestId: request._id });
      }
      toast.success('Request accepted!');
      navigate('/chat');
    } catch (err) {
      toast.error('Failed to accept request');
    }
  };

  const handleChat = async (userId, requestId) => {
    try {
      await chatAPI.createOrGetConversation({ participantId: userId, requestId });
      navigate('/chat');
    } catch (_) { navigate('/chat'); }
  };

  const handleCompleteDonation = async (requestId) => {
    try {
      const res = await donorAPI.completeDonation(requestId);
      toast.success(`Donation completed! +${res.data.rewardPoints || 10} points`);
      loadData();
    } catch (err) {
      toast.error('Failed to complete donation');
    }
  };

  if (!donor) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-primary-800 dark:border-t-primary-400" />
      </div>
    );
  }

  const statsCards = [
    { icon: <BiDroplet size={24} />, color: 'text-primary-600', value: donor.totalDonations, label: 'Total Donations' },
    { icon: <BiCheckCircle size={24} />, color: 'text-green-600', value: requests.length, label: 'Nearby Requests' },
    { icon: <BiCalendar size={24} />, color: 'text-blue-600', value: donations.length, label: 'History Records' },
    { icon: <BiTrendingUp size={24} />, color: 'text-yellow-600', value: donor.donationStreak || 0, label: 'Donation Streak' }
  ];

  const compatibility = donor.bloodGroup ? getCompatibilitySummary(donor.bloodGroup) : null;
  const tabs = ['overview', 'requests', 'history', 'profile', 'rewards'];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <div className="card text-center">
            <div className="mb-3 text-5xl">🩸</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            {donor.bloodGroup && (
              <div className="mx-auto mt-4 inline-block rounded-xl bg-red-100 px-6 py-2 text-2xl font-bold text-primary-700 dark:bg-red-900/40 dark:text-primary-300">{donor.bloodGroup}</div>
            )}
            <div className="mt-5 space-y-2 text-left text-sm text-gray-600 dark:text-gray-300">
              <p><span className="font-medium text-gray-900 dark:text-gray-100">City:</span> {user.city}</p>
              <p><span className="font-medium text-gray-900 dark:text-gray-100">Age:</span> {donor.age || 'Not set'}</p>
              <p><span className="font-medium text-gray-900 dark:text-gray-100">Total Donations:</span> {donor.totalDonations}</p>
              <p><span className="font-medium text-gray-900 dark:text-gray-100">Points:</span> {donor.rewardPoints || 0} ⭐</p>
              <p><span className="font-medium text-gray-900 dark:text-gray-100">Streak:</span> {donor.donationStreak || 0} 🔥</p>
              <p><span className="font-medium text-gray-900 dark:text-gray-100">Last Donation:</span> {donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : 'Never'}</p>
            </div>
            {donor.badges?.length > 0 && (
              <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
                <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">Badges</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {donor.badges.map((b, i) => (
                    <span key={i} title={b.name} className="text-2xl">{b.icon}</span>
                  ))}
                </div>
              </div>
            )}
            <button onClick={handleToggleAvailability} className={`mt-5 w-full rounded-xl py-3 text-sm font-bold transition-all duration-150 ${donor.isAvailable ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-200 text-gray-500 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'}`}>
              {donor.isAvailable ? '✅ Available for Donation' : '❌ Not Available'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="mb-6 flex gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)} className={`tab-btn flex-1 capitalize ${tab === t ? 'tab-active' : 'tab-inactive'}`}>{t}</button>
            ))}
          </div>

          {tab === 'overview' && (
            <>
              <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statsCards.map((s, i) => (
                  <div key={i} className="card">
                    <div className={`mb-2 ${s.color}`}>{s.icon}</div>
                    <div className="stat-value text-left">{s.value}</div>
                    <div className="stat-label text-left">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <div className="card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2"><BiHeart className="text-red-500" /> Blood Compatibility</h3>
                    <button onClick={() => navigate('/compatibility')} className="text-xs font-medium text-primary-600 hover:underline dark:text-primary-400">View All</button>
                  </div>
                  {compatibility && (
                    <div className="flex flex-wrap gap-2">
                      <div className="flex-1 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                        <p className="text-xs text-green-600 dark:text-green-400 mb-1">Can Donate To</p>
                        <div className="flex flex-wrap gap-1">
                          {compatibility.canDonateTo.slice(0, 4).map(g => (
                            <span key={g} className={`badge text-xs font-bold ${bloodGroupColors[g]?.bg || 'bg-gray-100'} ${bloodGroupColors[g]?.text || 'text-gray-700'}`}>{g}</span>
                          ))}
                          {compatibility.canDonateTo.length > 4 && <span className="text-xs text-gray-400">+{compatibility.canDonateTo.length - 4}</span>}
                        </div>
                      </div>
                      <div className="flex-1 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                        <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Can Receive From</p>
                        <div className="flex flex-wrap gap-1">
                          {compatibility.canReceiveFrom.slice(0, 4).map(g => (
                            <span key={g} className={`badge text-xs font-bold ${bloodGroupColors[g]?.bg || 'bg-gray-100'} ${bloodGroupColors[g]?.text || 'text-gray-700'}`}>{g}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2"><BiMapPin className="text-primary-500" /> Nearby Camps</h3>
                    <button onClick={() => navigate('/camps')} className="text-xs font-medium text-primary-600 hover:underline dark:text-primary-400">View All</button>
                  </div>
                  {camps.length === 0 ? (
                    <p className="text-sm text-gray-400 py-4 text-center">No nearby camps</p>
                  ) : camps.slice(0, 2).map(camp => (
                    <div key={camp._id} className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0 dark:border-gray-700">
                      <div>
                        <p className="text-sm font-semibold">{camp.campName}</p>
                        <p className="text-xs text-gray-500">{camp.city} · {new Date(camp.date).toLocaleDateString()}</p>
                      </div>
                      <span className={`badge text-xs ${camp.status === 'approved' ? 'badge-green' : camp.status === 'pending' ? 'badge-yellow' : 'badge-gray'}`}>{camp.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'requests' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Nearby Blood Requests</h3>
              {requests.length === 0 ? (
                <div className="card py-10 text-center text-gray-500 dark:text-gray-400">No nearby requests at the moment.</div>
              ) : requests.map(req => (
                <div key={req._id} className="card border-l-4 border-primary-500">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="text-xl font-bold">{req.bloodGroup}</span>
                        <span className={`badge ${statusColors[req.status]}`}>{req.status}</span>
                        <span className={`badge ${req.urgency === 'emergency' ? 'badge-red animate-pulse' : 'badge-gray'}`}>{req.urgency}</span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                        <p><span className="font-medium">Patient:</span> {req.patientName}</p>
                        <p><span className="font-medium">Hospital:</span> {req.hospitalName}</p>
                        <p><span className="font-medium">Units:</span> {req.unitsRequired}</p>
                        <p><span className="font-medium">Contact:</span> {req.contactNumber}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      {req.status === 'pending' && (
                        <button onClick={() => handleAcceptRequest(req)} className="btn-primary text-sm">Accept Request</button>
                      )}
                      {req.acceptedBy && req.acceptedBy.toString() === donor._id?.toString() && req.status === 'accepted' && (
                        <>
                          <button onClick={() => handleCompleteDonation(req._id)} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700">Mark Complete</button>
                          <button onClick={() => handleChat(req.receiver?.user, req._id)} className="btn-secondary gap-1 text-sm"><BiMessageDetail size={16} /> Chat</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Donation History</h3>
              {donations.length === 0 ? (
                <div className="card py-10 text-center text-gray-500 dark:text-gray-400">No donation history yet.</div>
              ) : donations.map(d => (
                <div key={d._id} className="card">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      <p><span className="font-medium">Date:</span> {new Date(d.donationDate).toLocaleDateString()}</p>
                      <p><span className="font-medium">Blood:</span> {d.bloodGroup}</p>
                      <p><span className="font-medium">Units:</span> {d.unitsDonated}</p>
                      {d.request?.hospitalName && <p><span className="font-medium">Hospital:</span> {d.request.hospitalName}</p>}
                    </div>
                    <div className="text-right">
                      <span className={`badge ${statusColors[d.status]}`}>{d.status}</span>
                      {d.certificateUrl && (
                        <a href={d.certificateUrl} target="_blank" rel="noreferrer" className="link mt-1 block text-xs">View Certificate</a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'profile' && (
            <div className="card">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Donor Profile</h3>
                <button onClick={() => setEditMode(!editMode)} className="btn-ghost gap-1.5 text-sm"><BiEdit size={16} /> {editMode ? 'Cancel' : 'Edit'}</button>
              </div>
              {editMode ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><label className="label">Age</label><input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="input-field" /></div>
                    <div>
                      <label className="label">Gender</label>
                      <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input-field">
                        <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Blood Group</label>
                      <select value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} className="input-field">
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (<option key={g} value={g}>{g}</option>))}
                      </select>
                    </div>
                    <div><label className="label">Weight (kg)</label><input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="input-field" /></div>
                  </div>
                  <div><label className="label">Medical Conditions</label><textarea value={form.medicalConditions} onChange={(e) => setForm({ ...form, medicalConditions: e.target.value })} className="input-field" rows={2} /></div>
                  <button type="submit" className="btn-primary">Save Changes</button>
                </form>
              ) : (
                <div className="grid gap-4 text-sm sm:grid-cols-2">
                  <div><span className="text-gray-500 dark:text-gray-400">Age:</span> <span className="font-medium text-gray-900 dark:text-white">{donor.age || 'Not set'}</span></div>
                  <div><span className="text-gray-500 dark:text-gray-400">Gender:</span> <span className="font-medium capitalize text-gray-900 dark:text-white">{donor.gender || 'Not set'}</span></div>
                  <div><span className="text-gray-500 dark:text-gray-400">Blood Group:</span> <span className="font-medium text-gray-900 dark:text-white">{donor.bloodGroup || 'Not set'}</span></div>
                  <div><span className="text-gray-500 dark:text-gray-400">Weight:</span> <span className="font-medium text-gray-900 dark:text-white">{donor.weight ? `${donor.weight} kg` : 'Not set'}</span></div>
                  <div><span className="text-gray-500 dark:text-gray-400">Last Donation:</span> <span className="font-medium text-gray-900 dark:text-white">{donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : 'Never'}</span></div>
                  <div><span className="text-gray-500 dark:text-gray-400">Total Donations:</span> <span className="font-medium text-gray-900 dark:text-white">{donor.totalDonations}</span></div>
                  {donor.medicalConditions && <div className="sm:col-span-2"><span className="text-gray-500 dark:text-gray-400">Medical Conditions:</span> <span className="font-medium text-gray-900 dark:text-white">{donor.medicalConditions}</span></div>}
                </div>
              )}
            </div>
          )}

          {tab === 'rewards' && (
            <div className="space-y-5">
              <h3 className="flex items-center gap-2 text-lg font-semibold"><BiTrophy className="text-yellow-500" /> Rewards & Achievements</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="stat-card"><div className="mb-1 text-3xl">⭐</div><div className="stat-value">{donor.rewardPoints || 0}</div><div className="stat-label">Points</div></div>
                <div className="stat-card"><div className="mb-1 text-3xl">🔥</div><div className="stat-value text-orange-500">{donor.donationStreak || 0}</div><div className="stat-label">Donation Streak</div></div>
                <div className="stat-card"><div className="mb-1 text-3xl">🏆</div><div className="stat-value text-purple-500">{donor.totalDonations}</div><div className="stat-label">Total Donations</div></div>
              </div>
              <div className="card">
                <h4 className="mb-4 text-sm font-semibold">Badges Earned</h4>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {[
                    { name: 'First Donation', icon: '🩸', min: 1 },
                    { name: 'Helper', icon: '🤝', min: 3 },
                    { name: 'Hero', icon: '🦸', min: 5 },
                    { name: 'Lifesaver', icon: '💪', min: 10 },
                    { name: 'Champion', icon: '🏆', min: 20 },
                    { name: 'Legend', icon: '👑', min: 50 }
                  ].map((badge, i) => {
                    const earned = donor.totalDonations >= badge.min;
                    return (
                      <div key={i} className={`rounded-xl p-3 text-center transition ${earned ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-gray-50 opacity-40 dark:bg-gray-800'}`}>
                        <div className="mb-1 text-3xl">{badge.icon}</div>
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{badge.name}</div>
                        {!earned && <div className="text-xs text-gray-400">{badge.min} donations</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
              <button onClick={() => navigate('/leaderboard')} className="btn-secondary gap-2"><BiTrophy size={18} /> View Leaderboard</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
