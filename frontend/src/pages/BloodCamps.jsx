import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { campAPI } from '../services/api';
import { bloodGroupColors } from '../utils/bloodGroups';
import toast from 'react-hot-toast';
import { BiCalendar, BiMapPin, BiUser, BiPhone, BiPlus, BiCheck, BiX, BiCurrentLocation, BiSearch } from 'react-icons/bi';
import useLocation from '../hooks/useLocation';
import { CardSkeleton } from '../components/common/LoadingSkeleton';

const BloodCamps = () => {
  const { user } = useAuth();
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState({ city: '', lat: '', lng: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [locationStatus, setLocationStatus] = useState('idle');
  const locationTimerRef = useRef(null);
  const { city: locCity, loading: locLoading, error: locError, getLocation, resetLocation } = useLocation();
  const [form, setForm] = useState({
    campName: '', organizer: '', organizerContact: '', date: '', endDate: '',
    time: '', address: '', city: '', state: '', pincode: '',
    bloodGroupsNeeded: [], contactNumber: '', email: '', maxParticipants: 100,
    description: '', lat: '', lng: ''
  });

  useEffect(() => { loadCamps(); }, []);

  const loadCamps = async () => {
    try {
      const res = await campAPI.getAll();
      setCamps(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load camps';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await campAPI.create(form);
      toast.success('Camp created successfully!');
      setShowCreate(false);
      loadCamps();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create camp');
    }
  };

  const handleRegister = async (id) => {
    try {
      await campAPI.register(id);
      toast.success('Registered for camp!');
      loadCamps();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleApprove = async (id) => {
    try { await campAPI.approve(id); toast.success('Camp approved'); loadCamps(); } catch (err) { toast.error('Failed'); }
  };

  const handleReject = async (id) => {
    try { await campAPI.reject(id); toast.success('Camp rejected'); loadCamps(); } catch (err) { toast.error('Failed'); }
  };

  const toggleBloodGroup = (bg) => {
    setForm(prev => ({
      ...prev,
      bloodGroupsNeeded: prev.bloodGroupsNeeded.includes(bg)
        ? prev.bloodGroupsNeeded.filter(g => g !== bg)
        : [...prev.bloodGroupsNeeded, bg]
    }));
  };

  const getLocationButtonText = () => {
    if (locLoading) return 'Detecting Location...';
    if (locationStatus === 'success') return 'Location Detected \u2713';
    if (locationStatus === 'error' || locError) return 'Retry';
    return 'Near Me';
  };

  const handleGetLocation = async () => {
    resetLocation();
    setLocationStatus('detecting');
    const loc = await getLocation();
    if (loc) {
      setLocationStatus('success');
      setSearchQuery(loc.city || '');
      setLocationFilter(prev => ({
        ...prev,
        city: loc.city || '',
        lat: loc.latitude,
        lng: loc.longitude
      }));
      if (locationTimerRef.current) clearTimeout(locationTimerRef.current);
      locationTimerRef.current = setTimeout(() => setLocationStatus('idle'), 3000);
    } else {
      setLocationStatus('error');
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setLocationFilter(prev => ({ ...prev, city: val }));
  };

  const now = new Date();
  const upcomingCamps = camps.filter(c => new Date(c.date) >= now && c.status !== 'cancelled' && c.status !== 'completed');
  const activeCamps = camps.filter(c => c.status === 'active' || (new Date(c.date) <= now && new Date(c.endDate || c.date) >= now && c.status === 'approved'));
  const pastCamps = camps.filter(c => new Date(c.date) < now || c.status === 'completed' || c.status === 'cancelled');

  const filterBySearch = (campList) => {
    if (!searchQuery.trim()) return campList;
    const q = searchQuery.trim().toLowerCase();
    return campList.filter(c =>
      (c.city || '').toLowerCase().includes(q) ||
      (c.campName || '').toLowerCase().includes(q) ||
      (c.address || '').toLowerCase().includes(q) ||
      (c.organizer || '').toLowerCase().includes(q)
    );
  };

  const displayCamps = filterBySearch(
    tab === 'upcoming' ? upcomingCamps : tab === 'active' ? activeCamps : pastCamps
  ).filter(c => !locationFilter.city || c.city?.toLowerCase().includes(locationFilter.city.toLowerCase()));

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="section-title mb-0">Blood Donation Camps</h1>
          <p className="text-gray-500 dark:text-gray-400">Find and register for blood donation camps near you</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-2">
            <button onClick={handleGetLocation} className={`btn-secondary gap-2 ${locLoading ? 'opacity-70 cursor-not-allowed' : ''} ${locationStatus === 'success' ? 'border-green-500 text-green-600 dark:text-green-400' : locError ? 'border-red-400 text-red-600 dark:text-red-400' : ''}`} disabled={locLoading}>
              {locLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : locationStatus === 'success' ? <BiCheck size={18} /> : <BiCurrentLocation size={18} />}
              {getLocationButtonText()}
            </button>
            {(user?.role === 'hospital' || user?.role === 'admin') && (
              <button onClick={() => setShowCreate(true)} className="btn-primary gap-2"><BiPlus size={20} /> Create Camp</button>
            )}
          </div>
          {locError && locationStatus === 'error' && (
            <p className="text-xs text-red-500 dark:text-red-400 text-right">{locError}</p>
          )}
          {locationStatus === 'success' && locCity && (
            <p className="text-xs text-green-600 dark:text-green-400">Location detected: {locCity}</p>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <BiSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQuery}
            onChange={handleSearchChange}
            className="input-field pl-10"
            placeholder="Search camps by city, name, or organizer..."
          />
        </div>
      </div>

      <div className="mb-6 flex gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
        {['upcoming', 'active', 'past'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`tab-btn flex-1 capitalize ${tab === t ? 'tab-active' : 'tab-inactive'}`}>
            {t}
            <span className="ml-1 text-xs opacity-70">
              ({t === 'upcoming' ? upcomingCamps.length : t === 'active' ? activeCamps.length : pastCamps.length})
            </span>
          </button>
        ))}
      </div>

      {displayCamps.length === 0 ? (
        <div className="card py-16 text-center">
          <BiCalendar size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400">No {tab} camps found</p>
          <p className="mt-2 text-sm text-gray-400">
            {searchQuery.trim()
              ? `No camps matching "${searchQuery.trim()}". Try a different search term.`
              : `There are no ${tab} blood donation camps available at the moment.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayCamps.map(camp => (
            <div key={camp._id} className={`card-hover ${camp.status === 'pending' ? 'ring-2 ring-yellow-400' : ''}`}>
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">{camp.campName}</h3>
                  <p className="text-sm text-gray-500">{camp.organizer}</p>
                </div>
                <span className={`badge ${camp.status === 'active' ? 'badge-green' : camp.status === 'approved' ? 'badge-blue' : camp.status === 'pending' ? 'badge-yellow' : camp.status === 'completed' ? 'badge-gray' : 'badge-red'}`}>{camp.status}</span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p className="flex items-center gap-2"><BiCalendar size={16} className="text-primary-500" /> {new Date(camp.date).toLocaleDateString()} {camp.time && `at ${camp.time}`}</p>
                <p className="flex items-center gap-2"><BiMapPin size={16} className="text-primary-500" /> {camp.address}, {camp.city}</p>
                <p className="flex items-center gap-2"><BiPhone size={16} className="text-primary-500" /> {camp.contactNumber}</p>
                <p className="flex items-center gap-2"><BiUser size={16} className="text-primary-500" /> {camp.registeredCount}/{camp.maxParticipants} registered</p>
              </div>

              {camp.bloodGroupsNeeded?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {camp.bloodGroupsNeeded.map(bg => (
                    <span key={bg} className={`badge text-xs font-bold ${bloodGroupColors[bg]?.bg || 'bg-red-100'} ${bloodGroupColors[bg]?.text || 'text-red-700'}`}>{bg}</span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                {user?.role === 'donor' && camp.status !== 'completed' && camp.status !== 'cancelled' && camp.registeredCount < camp.maxParticipants && (
                  <button onClick={() => handleRegister(camp._id)} className="btn-primary flex-1 gap-1 text-xs"><BiCheck /> Register</button>
                )}
                {user?.role === 'admin' && camp.status === 'pending' && (
                  <>
                    <button onClick={() => handleApprove(camp._id)} className="flex-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"><BiCheck className="inline" /> Approve</button>
                    <button onClick={() => handleReject(camp._id)} className="flex-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"><BiX className="inline" /> Reject</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
            <h3 className="mb-5 text-lg font-bold">Create Donation Camp</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div><label className="label">Camp Name</label><input value={form.campName} onChange={e => setForm({...form, campName: e.target.value})} className="input-field" required /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label">Organizer</label><input value={form.organizer} onChange={e => setForm({...form, organizer: e.target.value})} className="input-field" required /></div>
                <div><label className="label">Organizer Contact</label><input value={form.organizerContact} onChange={e => setForm({...form, organizerContact: e.target.value})} className="input-field" required /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label">Date</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="input-field" required /></div>
                <div><label className="label">End Date</label><input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="input-field" /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label">Time</label><input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="input-field" required /></div>
                <div><label className="label">Max Participants</label><input type="number" value={form.maxParticipants} onChange={e => setForm({...form, maxParticipants: Number(e.target.value)})} className="input-field" /></div>
              </div>
              <div><label className="label">Address</label><input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="input-field" required /></div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div><label className="label">City</label><input value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="input-field" required /></div>
                <div><label className="label">State</label><input value={form.state} onChange={e => setForm({...form, state: e.target.value})} className="input-field" required /></div>
                <div><label className="label">Pincode</label><input value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} className="input-field" /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label">Contact Number</label><input value={form.contactNumber} onChange={e => setForm({...form, contactNumber: e.target.value})} className="input-field" required /></div>
                <div><label className="label">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" /></div>
              </div>
              <div>
                <label className="label">Blood Groups Needed</label>
                <div className="flex flex-wrap gap-2">
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <button key={bg} type="button" onClick={() => toggleBloodGroup(bg)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${form.bloodGroupsNeeded.includes(bg) ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/20' : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:text-gray-300'}`}>
                      {bg}
                    </button>
                  ))}
                </div>
              </div>
              <div><label className="label">Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" rows={2} /></div>
              <button type="submit" className="btn-primary w-full">Create Camp</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodCamps;
