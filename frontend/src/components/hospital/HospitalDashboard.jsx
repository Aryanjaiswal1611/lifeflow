import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { hospitalAPI, campAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { BiDroplet, BiListUl, BiPlus, BiX, BiCalendar, BiCheckCircle, BiMapPin, BiPhone, BiUser } from 'react-icons/bi';
import { bloodGroups, statusColors, bloodGroupColors } from '../../utils/bloodGroups';

const HospitalDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [camps, setCamps] = useState([]);
  const [tab, setTab] = useState('overview');
  const [showInventory, setShowInventory] = useState(false);
  const [showCreateCamp, setShowCreateCamp] = useState(false);
  const [inventoryForm, setInventoryForm] = useState({ bloodGroup: 'A+', units: 0 });
  const [campForm, setCampForm] = useState({
    campName: '', organizer: '', organizerContact: '', date: '', endDate: '',
    time: '', address: '', city: '', state: '', pincode: '',
    bloodGroupsNeeded: [], contactNumber: '', email: '', maxParticipants: 100,
    description: ''
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [profRes, reqRes, campRes] = await Promise.all([
        hospitalAPI.getProfile(),
        hospitalAPI.getRequests(),
        hospitalAPI.getCamps().catch(() => [])
      ]);
      setProfile(profRes.data);
      setRequests(reqRes.data);
      setCamps(Array.isArray(campRes.data) ? campRes.data : []);
    } catch (err) {
      toast.error('Failed to load data');
    }
  };

  const handleUpdateInventory = async (e) => {
    e.preventDefault();
    try {
      const res = await hospitalAPI.updateInventory(inventoryForm);
      setProfile(prev => ({ ...prev, bloodInventory: res.data.bloodInventory }));
      toast.success(res.data.message);
      setShowInventory(false);
    } catch (err) {
      toast.error('Failed to update inventory');
    }
  };

  const handleCreateCamp = async (e) => {
    e.preventDefault();
    try {
      await campAPI.create(campForm);
      toast.success('Camp created successfully!');
      setShowCreateCamp(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create camp');
    }
  };

  const toggleBloodGroup = (bg) => {
    setCampForm(prev => ({
      ...prev,
      bloodGroupsNeeded: prev.bloodGroupsNeeded.includes(bg)
        ? prev.bloodGroupsNeeded.filter(g => g !== bg)
        : [...prev.bloodGroupsNeeded, bg]
    }));
  };

  if (!profile) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-primary-800 dark:border-t-primary-400" /></div>;
  }

  const totalUnits = Object.values(profile.bloodInventory || {}).reduce((a, b) => a + b, 0);
  const hospitalTabs = ['overview', 'camps'];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="section-title mb-0">{profile.hospitalName}</h1>
          <p className="text-gray-500 dark:text-gray-400">Hospital Dashboard</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCreateCamp(true)} className="btn-secondary gap-2"><BiCalendar size={18} /> Create Camp</button>
          <button onClick={() => setShowInventory(true)} className="btn-primary gap-2"><BiPlus size={20} /> Add Blood Stock</button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card"><BiDroplet size={24} className="mb-2 text-primary-500" /><div className="stat-value text-left">{totalUnits}</div><div className="stat-label text-left">Total Units</div></div>
        <div className="card"><BiListUl size={24} className="mb-2 text-blue-500" /><div className="stat-value text-left">{requests.length}</div><div className="stat-label text-left">Requests</div></div>
        <div className="card"><BiCalendar size={24} className="mb-2 text-purple-500" /><div className="stat-value text-left">{camps.length}</div><div className="stat-label text-left">My Camps</div></div>
      </div>

      <div className="mb-6 flex gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
        {hospitalTabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`tab-btn flex-1 capitalize ${tab === t ? 'tab-active' : 'tab-inactive'}`}>{t}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card">
            <h3 className="mb-4 text-sm font-semibold">Blood Inventory</h3>
            <div className="grid grid-cols-2 gap-3">
              {bloodGroups.map(bg => (
                <div key={bg} className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{bg}</span>
                  <span className="text-base font-semibold text-gray-900 dark:text-white">{profile.bloodInventory?.[bg] || 0} <span className="text-xs font-normal text-gray-500">units</span></span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="mb-4 text-sm font-semibold">Recent Requests</h3>
            {requests.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No requests yet</p>
            ) : requests.slice(0, 5).map(req => (
              <div key={req._id} className="border-b border-gray-100 py-3 last:border-0 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-primary-600 dark:text-primary-400">{req.bloodGroup}</span>
                    <span className="ml-2 text-sm text-gray-500">x{req.unitsRequired}</span>
                  </div>
                  <span className={`badge ${statusColors[req.status]}`}>{req.status}</span>
                </div>
                <p className="mt-0.5 text-xs text-gray-500">{req.patientName} · {new Date(req.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'camps' && (
        <div className="space-y-4">
          {camps.length === 0 ? (
            <div className="card py-10 text-center">
              <BiCalendar size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No camps created yet</p>
              <button onClick={() => setShowCreateCamp(true)} className="btn-primary mt-4 gap-2"><BiPlus size={18} /> Create Camp</button>
            </div>
          ) : camps.map(camp => (
            <div key={camp._id} className={`card ${camp.status === 'pending' ? 'ring-2 ring-yellow-400' : ''}`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{camp.campName}</h3>
                    <span className={`badge ${camp.status === 'approved' ? 'badge-green' : camp.status === 'pending' ? 'badge-yellow' : camp.status === 'completed' ? 'badge-blue' : camp.status === 'rejected' ? 'badge-red' : 'badge-gray'}`}>{camp.status}</span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <p className="flex items-center gap-2"><BiCalendar size={14} /> {new Date(camp.date).toLocaleDateString()} {camp.time && `at ${camp.time}`}</p>
                    <p className="flex items-center gap-2"><BiMapPin size={14} /> {camp.address}, {camp.city}</p>
                    <p className="flex items-center gap-2"><BiPhone size={14} /> {camp.contactNumber}</p>
                    <p className="flex items-center gap-2"><BiUser size={14} /> {camp.registeredCount}/{camp.maxParticipants} registered</p>
                  </div>
                  {camp.bloodGroupsNeeded?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {camp.bloodGroupsNeeded.map(bg => (
                        <span key={bg} className={`badge text-xs font-bold ${bloodGroupColors[bg]?.bg || 'bg-red-100'} ${bloodGroupColors[bg]?.text || 'text-red-700'}`}>{bg}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showInventory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowInventory(false)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold">Add Blood Stock</h3>
              <button onClick={() => setShowInventory(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"><BiX size={20} /></button>
            </div>
            <form onSubmit={handleUpdateInventory} className="space-y-4">
              <div>
                <label className="label">Blood Group</label>
                <select value={inventoryForm.bloodGroup} onChange={e => setInventoryForm({...inventoryForm, bloodGroup: e.target.value})} className="input-field">
                  {bloodGroups.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Units to Add</label>
                <input type="number" min={1} value={inventoryForm.units} onChange={e => setInventoryForm({...inventoryForm, units: parseInt(e.target.value) || 0})} className="input-field" required />
              </div>
              <button type="submit" className="btn-primary w-full">Update Inventory</button>
            </form>
          </div>
        </div>
      )}

      {showCreateCamp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCreateCamp(false)}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold">Create Donation Camp</h3>
              <button onClick={() => setShowCreateCamp(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"><BiX size={20} /></button>
            </div>
            <form onSubmit={handleCreateCamp} className="space-y-4">
              <div><label className="label">Camp Name</label><input value={campForm.campName} onChange={e => setCampForm({...campForm, campName: e.target.value})} className="input-field" required /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label">Organizer</label><input value={campForm.organizer} onChange={e => setCampForm({...campForm, organizer: e.target.value})} className="input-field" required /></div>
                <div><label className="label">Organizer Contact</label><input value={campForm.organizerContact} onChange={e => setCampForm({...campForm, organizerContact: e.target.value})} className="input-field" required /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label">Date</label><input type="date" value={campForm.date} onChange={e => setCampForm({...campForm, date: e.target.value})} className="input-field" required /></div>
                <div><label className="label">End Date</label><input type="date" value={campForm.endDate} onChange={e => setCampForm({...campForm, endDate: e.target.value})} className="input-field" /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label">Time</label><input type="time" value={campForm.time} onChange={e => setCampForm({...campForm, time: e.target.value})} className="input-field" required /></div>
                <div><label className="label">Max Participants</label><input type="number" value={campForm.maxParticipants} onChange={e => setCampForm({...campForm, maxParticipants: Number(e.target.value)})} className="input-field" /></div>
              </div>
              <div><label className="label">Address</label><input value={campForm.address} onChange={e => setCampForm({...campForm, address: e.target.value})} className="input-field" required /></div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div><label className="label">City</label><input value={campForm.city} onChange={e => setCampForm({...campForm, city: e.target.value})} className="input-field" required /></div>
                <div><label className="label">State</label><input value={campForm.state} onChange={e => setCampForm({...campForm, state: e.target.value})} className="input-field" required /></div>
                <div><label className="label">Pincode</label><input value={campForm.pincode} onChange={e => setCampForm({...campForm, pincode: e.target.value})} className="input-field" /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label">Contact Number</label><input value={campForm.contactNumber} onChange={e => setCampForm({...campForm, contactNumber: e.target.value})} className="input-field" required /></div>
                <div><label className="label">Email</label><input type="email" value={campForm.email} onChange={e => setCampForm({...campForm, email: e.target.value})} className="input-field" /></div>
              </div>
              <div>
                <label className="label">Blood Groups Needed</label>
                <div className="flex flex-wrap gap-2">
                  {bloodGroups.map(bg => (
                    <button key={bg} type="button" onClick={() => toggleBloodGroup(bg)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${campForm.bloodGroupsNeeded.includes(bg) ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/20' : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:text-gray-300'}`}>
                      {bg}
                    </button>
                  ))}
                </div>
              </div>
              <div><label className="label">Description</label><textarea value={campForm.description} onChange={e => setCampForm({...campForm, description: e.target.value})} className="input-field" rows={2} /></div>
              <button type="submit" className="btn-primary w-full">Create Camp</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalDashboard;
