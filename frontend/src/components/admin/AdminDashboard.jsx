import { useState, useEffect } from 'react';
import { adminAPI, campAPI, bloodBankAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { BiUser, BiDroplet, BiHeart, BiBuilding, BiCheckCircle, BiXCircle, BiTrash, BiCalendar, BiMapPin, BiChart } from 'react-icons/bi';
import { bloodGroupColors } from '../../utils/bloodGroups';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [camps, setCamps] = useState([]);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [tab, setTab] = useState('overview');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [statsRes, usersRes, reqRes, hospRes, analyticsRes, campRes, bankRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers({}),
        adminAPI.getRequests(),
        adminAPI.getHospitals(),
        adminAPI.getAnalytics().catch(() => null),
        campAPI.getAll().catch(() => []),
        bloodBankAPI.getAll().catch(() => [])
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setRequests(reqRes.data);
      setHospitals(hospRes.data);
      setAnalytics(analyticsRes?.data || null);
      setCamps(Array.isArray(campRes.data) ? campRes.data : []);
      setBloodBanks(Array.isArray(bankRes.data) ? bankRes.data : []);
    } catch (err) {
      toast.error('Failed to load admin data');
    }
  };

  const handleToggleUser = async (id) => {
    try { await adminAPI.toggleUserStatus(id); toast.success('User status updated'); loadData(); } catch (err) { toast.error('Failed'); }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try { await adminAPI.deleteUser(id); toast.success('User deleted'); loadData(); } catch (err) { toast.error('Failed'); }
  };

  const handleVerifyUser = async (id) => {
    try { await adminAPI.verifyUser(id); toast.success('User verified'); loadData(); } catch (err) { toast.error('Failed'); }
  };

  const handleVerifyHospital = async (id) => {
    try { await adminAPI.verifyHospital(id); toast.success('Hospital verified'); loadData(); } catch (err) { toast.error('Failed'); }
  };

  const handleApproveCamp = async (id) => {
    try { await campAPI.approve(id); toast.success('Camp approved'); loadData(); } catch (err) { toast.error('Failed'); }
  };

  const handleRejectCamp = async (id) => {
    try { await campAPI.reject(id); toast.success('Camp rejected'); loadData(); } catch (err) { toast.error('Failed'); }
  };

  const handleDeleteBloodBank = async (id) => {
    if (!confirm('Delete this blood bank?')) return;
    try { await bloodBankAPI.delete(id); toast.success('Blood bank deleted'); loadData(); } catch (err) { toast.error('Failed'); }
  };

  const handleVerifyBloodBank = async (id) => {
    try { await bloodBankAPI.update(id, { isVerified: true }); toast.success('Blood bank verified'); loadData(); } catch (err) { toast.error('Failed'); }
  };

  if (!stats) return <div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-primary-800 dark:border-t-primary-400" /></div>;

  const adminTabs = ['overview', 'users', 'requests', 'hospitals', 'camps', 'bloodbanks', 'analytics'];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="section-title mb-6">Admin Dashboard</h1>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="card"><BiUser size={24} className="mb-2 text-primary-500" /><div className="stat-value text-left">{stats.totalUsers}</div><div className="stat-label text-left">Total Users</div></div>
        <div className="card"><BiDroplet size={24} className="mb-2 text-red-500" /><div className="stat-value text-left">{stats.totalDonors}</div><div className="stat-label text-left">Donors</div></div>
        <div className="card"><BiHeart size={24} className="mb-2 text-pink-500" /><div className="stat-value text-left">{stats.totalRequests}</div><div className="stat-label text-left">Requests</div></div>
        <div className="card"><BiBuilding size={24} className="mb-2 text-blue-500" /><div className="stat-value text-left">{stats.totalHospitals}</div><div className="stat-label text-left">Hospitals</div></div>
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
        {adminTabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`tab-btn flex-1 whitespace-nowrap capitalize ${tab === t ? 'tab-active' : 'tab-inactive'}`}>{t}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card">
            <h3 className="mb-4 text-sm font-semibold">Requests by Blood Group</h3>
            {stats.requestsByGroup?.length === 0 ? (
              <p className="text-sm text-gray-500">No data</p>
            ) : stats.requestsByGroup?.map(r => (
              <div key={r._id} className="flex items-center justify-between border-b border-gray-100 py-2.5 last:border-0 dark:border-gray-700">
                <span className="text-sm font-medium">{r._id}</span>
                <span className="badge-primary text-xs">{r.count} requests</span>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 className="mb-4 text-sm font-semibold">Monthly Donations</h3>
            {stats.donationsByMonth?.length === 0 ? (
              <p className="text-sm text-gray-500">No data</p>
            ) : stats.donationsByMonth?.map(d => (
              <div key={d._id} className="flex items-center justify-between border-b border-gray-100 py-2.5 last:border-0 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-300">Month {d._id}</span>
                <span className="text-sm font-medium">{d.count} donations</span>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 className="mb-4 text-sm font-semibold flex items-center gap-2"><BiCalendar className="text-primary-500" /> Pending Camps</h3>
            {camps.filter(c => c.status === 'pending').length === 0 ? (
              <p className="text-sm text-gray-500">No pending camps</p>
            ) : camps.filter(c => c.status === 'pending').slice(0, 5).map(camp => (
              <div key={camp._id} className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0 dark:border-gray-700">
                <div>
                  <p className="text-sm font-semibold">{camp.campName}</p>
                  <p className="text-xs text-gray-500">{camp.city} · {new Date(camp.date).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleApproveCamp(camp._id)} className="text-xs font-medium text-green-600 hover:underline"><BiCheckCircle className="inline" /> Approve</button>
                  <button onClick={() => handleRejectCamp(camp._id)} className="text-xs font-medium text-red-600 hover:underline"><BiXCircle className="inline" /> Reject</button>
                </div>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 className="mb-4 text-sm font-semibold flex items-center gap-2"><BiBuilding className="text-blue-500" /> Unverified Blood Banks</h3>
            {bloodBanks.filter(b => !b.isVerified).length === 0 ? (
              <p className="text-sm text-gray-500">All verified</p>
            ) : bloodBanks.filter(b => !b.isVerified).slice(0, 5).map(b => (
              <div key={b._id} className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0 dark:border-gray-700">
                <div>
                  <p className="text-sm font-semibold">{b.name}</p>
                  <p className="text-xs text-gray-500">{b.city} · {b.contactNumber}</p>
                </div>
                <button onClick={() => handleVerifyBloodBank(b._id)} className="text-xs font-medium text-green-600 hover:underline"><BiCheckCircle className="inline" /> Verify</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Email</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Role</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">City</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50">
                  <td className="px-3 py-3 font-medium text-gray-900 dark:text-white">{u.name}</td>
                  <td className="px-3 py-3 text-gray-600 dark:text-gray-300">{u.email}</td>
                  <td className="px-3 py-3 capitalize text-gray-600 dark:text-gray-300">{u.role}</td>
                  <td className="px-3 py-3 text-gray-600 dark:text-gray-300">{u.city}</td>
                  <td className="px-3 py-3">
                    <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleToggleUser(u._id)} className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400">{u.isActive ? 'Deactivate' : 'Activate'}</button>
                      {!u.isVerified && <button onClick={() => handleVerifyUser(u._id)} className="text-xs font-medium text-green-600 hover:underline dark:text-green-400">Verify</button>}
                      <button onClick={() => handleDeleteUser(u._id)} className="text-xs font-medium text-red-600 hover:underline dark:text-red-400">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="card py-10 text-center text-sm text-gray-500">No requests found</div>
          ) : requests.map(req => (
            <div key={req._id} className="card">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-lg font-bold">{req.bloodGroup}</span>
                    <span className={`badge ${req.urgency === 'emergency' ? 'badge-red animate-pulse' : 'badge-gray'}`}>{req.urgency}</span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <p><span className="font-medium">Patient:</span> {req.patientName}</p>
                    <p><span className="font-medium">Hospital:</span> {req.hospitalName}</p>
                    <p><span className="font-medium">Units:</span> {req.unitsRequired} | <span className="font-medium">Status:</span> {req.status}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'hospitals' && (
        <div className="space-y-4">
          {hospitals.length === 0 ? (
            <div className="card py-10 text-center text-sm text-gray-500">No hospitals found</div>
          ) : hospitals.map(h => (
            <div key={h._id} className="card">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{h.hospitalName}</h3>
                  <p className="mt-0.5 text-sm text-gray-500">{h.city} | {h.contactNumber}</p>
                  <p className="text-sm text-gray-500"><span className="font-medium">License:</span> {h.licenseNumber}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {Object.entries(h.bloodInventory || {}).filter(([,v]) => v > 0).map(([bg, units]) => (
                      <span key={bg} className="badge bg-red-50 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-300">{bg}: {units}</span>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className={`badge ${h.isVerified ? 'badge-green' : 'badge-yellow'}`}>{h.isVerified ? 'Verified' : 'Pending'}</span>
                  {!h.isVerified && <button onClick={() => handleVerifyHospital(h._id)} className="btn-primary text-sm">Verify</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'camps' && (
        <div className="space-y-4">
          {camps.length === 0 ? (
            <div className="card py-10 text-center text-sm text-gray-500">No camps found</div>
          ) : camps.map(camp => (
            <div key={camp._id} className={`card ${camp.status === 'pending' ? 'ring-2 ring-yellow-400' : ''}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{camp.campName}</h3>
                    <span className={`badge ${camp.status === 'approved' ? 'badge-green' : camp.status === 'pending' ? 'badge-yellow' : camp.status === 'completed' ? 'badge-blue' : camp.status === 'rejected' ? 'badge-red' : 'badge-gray'}`}>{camp.status}</span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <p><span className="font-medium">Organizer:</span> {camp.organizer} | <span className="font-medium">Date:</span> {new Date(camp.date).toLocaleDateString()}</p>
                    <p><span className="font-medium">Location:</span> {camp.address}, {camp.city}</p>
                    <p><span className="font-medium">Contact:</span> {camp.contactNumber} | <span className="font-medium">Registered:</span> {camp.registeredCount}/{camp.maxParticipants}</p>
                  </div>
                  {camp.bloodGroupsNeeded?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {camp.bloodGroupsNeeded.map(bg => (
                        <span key={bg} className={`badge text-xs font-bold ${bloodGroupColors[bg]?.bg || 'bg-red-100'} ${bloodGroupColors[bg]?.text || 'text-red-700'}`}>{bg}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  {camp.status === 'pending' && (
                    <>
                      <button onClick={() => handleApproveCamp(camp._id)} className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"><BiCheckCircle className="inline" /> Approve</button>
                      <button onClick={() => handleRejectCamp(camp._id)} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"><BiXCircle className="inline" /> Reject</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'bloodbanks' && (
        <div className="space-y-4">
          {bloodBanks.length === 0 ? (
            <div className="card py-10 text-center text-sm text-gray-500">No blood banks found</div>
          ) : bloodBanks.map(b => (
            <div key={b._id} className="card">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{b.name}</h3>
                    <span className={`badge ${b.isVerified ? 'badge-green' : 'badge-yellow'}`}>{b.isVerified ? 'Verified' : 'Unverified'}</span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <p><span className="font-medium">Address:</span> {b.address}, {b.city}, {b.state}</p>
                    <p><span className="font-medium">Contact:</span> {b.contactNumber} {b.email && `| ${b.email}`}</p>
                  </div>
                  {b.bloodInventory?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {b.bloodInventory.filter(item => item.units > 0).map(item => (
                        <span key={item.bloodGroup} className={`badge text-xs font-bold ${bloodGroupColors[item.bloodGroup]?.bg || 'bg-red-100'} ${bloodGroupColors[item.bloodGroup]?.text || 'text-red-700'}`}>
                          {item.bloodGroup}: {item.units}u
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  {!b.isVerified && (
                    <button onClick={() => handleVerifyBloodBank(b._id)} className="btn-primary text-xs">Verify</button>
                  )}
                  <button onClick={() => handleDeleteBloodBank(b._id)} className="text-xs font-medium text-red-600 hover:underline"><BiTrash className="inline" /> Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'analytics' && analytics && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card">
            <h3 className="mb-4 text-sm font-semibold flex items-center gap-2"><BiChart className="text-primary-500" /> Platform Snapshot</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-gray-700"><span>Total Donors</span><span className="font-bold">{analytics.totalDonors}</span></div>
              <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-gray-700"><span>Active Donors</span><span className="font-bold text-green-600">{analytics.activeDonors}</span></div>
              <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-gray-700"><span>Pending Requests</span><span className="font-bold text-yellow-600">{analytics.pendingRequests}</span></div>
              <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-gray-700"><span>Emergency Requests</span><span className="font-bold text-red-600">{analytics.emergencyRequests}</span></div>
              <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-gray-700"><span>Approved Camps</span><span className="font-bold">{analytics.totalCamps}</span></div>
              <div className="flex justify-between"><span>Blood Banks</span><span className="font-bold">{analytics.totalBloodBanks}</span></div>
            </div>
          </div>
          <div className="card">
            <h3 className="mb-4 text-sm font-semibold flex items-center gap-2"><BiDroplet className="text-red-500" /> Requests by Blood Group</h3>
            {analytics.requestsByBloodGroup?.length === 0 ? (
              <p className="text-sm text-gray-500">No data</p>
            ) : analytics.requestsByBloodGroup?.map(r => (
              <div key={r._id} className="flex items-center justify-between border-b border-gray-100 py-2.5 last:border-0 dark:border-gray-700">
                <span className="text-sm font-medium">{r._id}</span>
                <span className="badge-primary text-xs">{r.count} requests</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
