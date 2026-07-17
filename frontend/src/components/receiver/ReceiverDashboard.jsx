import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { receiverAPI, chatAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { BiDroplet, BiPlus, BiListUl, BiUser, BiMessageDetail, BiError, BiX, BiBuilding, BiSearch } from 'react-icons/bi';
import { statusColors, urgencyColors, bloodGroups } from '../../utils/bloodGroups';

const ReceiverDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [requests, setRequests] = useState([]);
  const [profile, setProfile] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [matchedDonors, setMatchedDonors] = useState(null);
  const [form, setForm] = useState({
    patientName: '', bloodGroup: 'A+', unitsRequired: 1, hospitalName: '',
    hospitalAddress: '', urgency: 'normal', requiredDate: '', contactNumber: '', notes: ''
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [profRes, reqRes] = await Promise.all([receiverAPI.getProfile(), receiverAPI.getMyRequests()]);
      setProfile(profRes.data);
      setRequests(reqRes.data);
      setForm(prev => ({
        ...prev,
        patientName: profRes.data.patientName || user.name,
        contactNumber: user.phone
      }));
    } catch (err) {
      toast.error('Failed to load data');
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await receiverAPI.createBloodRequest(form);
      toast.success(`Request created! ${res.data.matchedDonorsCount} potential donors notified.`);
      setShowCreate(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create request');
    }
  };

  const handleCancel = async (id) => {
    try {
      await receiverAPI.cancelRequest(id);
      toast.success('Request cancelled');
      loadData();
    } catch (err) {
      toast.error('Failed to cancel');
    }
  };

  const handleViewDonors = async (id) => {
    try {
      const res = await receiverAPI.getMatchedDonors(id);
      setMatchedDonors(res.data);
    } catch (err) {
      toast.error('Failed to load donors');
    }
  };

  const handleChat = async (userId, requestId) => {
    try {
      await chatAPI.createOrGetConversation({ participantId: userId, requestId });
      navigate('/chat');
    } catch (_) {
      navigate('/chat');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="section-title mb-0">Receiver Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your blood requests</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/emergency-sos')} className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-150 hover:bg-red-700 active:scale-[0.97] animate-pulse">
            <BiError size={20} /> SOS Emergency
          </button>
          <button onClick={() => setShowCreate(true)} className="btn-primary gap-2">
            <BiPlus size={20} /> New Request
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card"><BiDroplet size={24} className="mb-2 text-primary-500" /><div className="stat-value text-left">{requests.length}</div><div className="stat-label text-left">Total Requests</div></div>
        <div className="card"><BiListUl size={24} className="mb-2 text-yellow-500" /><div className="stat-value text-left">{requests.filter(r => r.status === 'pending').length}</div><div className="stat-label text-left">Pending</div></div>
        <div className="card"><BiUser size={24} className="mb-2 text-green-500" /><div className="stat-value text-left">{requests.filter(r => r.status === 'accepted').length}</div><div className="stat-label text-left">Accepted</div></div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <button onClick={() => navigate('/blood-availability')} className="card-hover flex items-center gap-3 text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30"><BiSearch size={20} className="text-red-600 dark:text-red-400" /></div>
          <div><p className="text-sm font-semibold">Blood Availability</p><p className="text-xs text-gray-500">Search blood near you</p></div>
        </button>
        <button onClick={() => navigate('/hospital-finder')} className="card-hover flex items-center gap-3 text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30"><BiBuilding size={20} className="text-blue-600 dark:text-blue-400" /></div>
          <div><p className="text-sm font-semibold">Hospitals & Blood Banks</p><p className="text-xs text-gray-500">Find nearby facilities</p></div>
        </button>
        <button onClick={() => navigate('/compatibility')} className="card-hover flex items-center gap-3 text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30"><BiDroplet size={20} className="text-purple-600 dark:text-purple-400" /></div>
          <div><p className="text-sm font-semibold">Compatibility Check</p><p className="text-xs text-gray-500">Check blood compatibility</p></div>
        </button>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="card py-16 text-center">
            <div className="mb-4 text-4xl">🩸</div>
            <p className="mb-6 text-gray-500 dark:text-gray-400">No blood requests yet</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary">Create Your First Request</button>
          </div>
        ) : requests.map(req => (
          <div key={req._id} className={`card border-l-4 ${req.urgency === 'emergency' ? 'border-red-500' : req.urgency === 'urgent' ? 'border-yellow-500' : 'border-primary-500'}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">{req.bloodGroup}</span>
                  <span className={`badge ${statusColors[req.status]}`}>{req.status}</span>
                  <span className={`badge ${urgencyColors[req.urgency]}`}>{req.urgency}</span>
                </div>
                <div className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2 text-gray-600 dark:text-gray-300">
                  <p><span className="font-medium">Patient:</span> {req.patientName}</p>
                  <p><span className="font-medium">Units:</span> {req.unitsRequired}</p>
                  <p><span className="font-medium">Hospital:</span> {req.hospitalName}</p>
                  <p><span className="font-medium">Required By:</span> {new Date(req.requiredDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">Contact:</span> {req.contactNumber}</p>
                  <p><span className="font-medium">Created:</span> {new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                {req.status === 'pending' && (
                  <button onClick={() => handleCancel(req._id)} className="btn-ghost text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Cancel</button>
                )}
                {req.acceptedBy && (
                  <>
                    <button onClick={() => handleViewDonors(req._id)} className="btn-secondary text-sm">View Donor</button>
                    {req.acceptedBy.user?._id && (
                      <button onClick={() => handleChat(req.acceptedBy.user._id, req._id)} className="btn-primary gap-1 text-sm"><BiMessageDetail size={16} /> Chat</button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {matchedDonors && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setMatchedDonors(null)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800 max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold">Matched Donors</h3>
              <button onClick={() => setMatchedDonors(null)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"><BiX size={20} /></button>
            </div>
            {matchedDonors.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No matched donors found</p>
            ) : matchedDonors.map(d => (
              <div key={d._id} className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0 dark:border-gray-700">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white">{d.user?.name}</p>
                  <p className="text-sm text-gray-500">{d.bloodGroup} | {d.user?.city}</p>
                  <p className="text-xs text-gray-400">📞 {d.user?.phone} · ✉️ {d.user?.email}</p>
                </div>
                <button onClick={() => handleChat(d.user?._id, null)} className="btn-primary gap-1 px-3 py-1.5 text-sm"><BiMessageDetail size={16} /> Chat</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800 max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold">Create Blood Request</h3>
              <button onClick={() => setShowCreate(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"><BiX size={20} /></button>
            </div>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label">Patient Name</label><input value={form.patientName} onChange={e => setForm({...form, patientName: e.target.value})} className="input-field" required /></div>
                <div>
                  <label className="label">Blood Group</label>
                  <select value={form.bloodGroup} onChange={e => setForm({...form, bloodGroup: e.target.value})} className="input-field">
                    {bloodGroups.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div><label className="label">Units Required</label><input type="number" min={1} value={form.unitsRequired} onChange={e => setForm({...form, unitsRequired: Number(e.target.value)})} className="input-field" required /></div>
                <div>
                  <label className="label">Urgency</label>
                  <select value={form.urgency} onChange={e => setForm({...form, urgency: e.target.value})} className="input-field">
                    <option value="normal">Normal</option><option value="urgent">Urgent</option><option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>
              <div><label className="label">Hospital Name</label><input value={form.hospitalName} onChange={e => setForm({...form, hospitalName: e.target.value})} className="input-field" required /></div>
              <div><label className="label">Hospital Address</label><input value={form.hospitalAddress} onChange={e => setForm({...form, hospitalAddress: e.target.value})} className="input-field" required /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label">Required Date</label><input type="date" value={form.requiredDate} onChange={e => setForm({...form, requiredDate: e.target.value})} className="input-field" required /></div>
                <div><label className="label">Contact Number</label><input value={form.contactNumber} onChange={e => setForm({...form, contactNumber: e.target.value})} className="input-field" required /></div>
              </div>
              <div><label className="label">Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-field" rows={2} /></div>
              <button type="submit" className="btn-primary w-full">Submit Request</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiverDashboard;
