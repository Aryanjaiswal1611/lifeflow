import { useState } from 'react';
import { emergencyAPI } from '../services/api';
import toast from 'react-hot-toast';
import { BiError, BiMap, BiPhone, BiCheckCircle, BiDroplet, BiBuilding } from 'react-icons/bi';
import { bloodGroups, bloodGroupColors } from '../utils/bloodGroups';
import { useNavigate } from 'react-router-dom';

const EmergencySOS = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    patientName: '', bloodGroup: 'A+', unitsRequired: 1,
    hospitalName: '', hospitalAddress: '', contactNumber: '',
    notes: '', lat: '', lng: ''
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [result, setResult] = useState(null);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setForm(prev => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude })),
        () => toast.error('Enable location for faster response')
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await emergencyAPI.sendSOS(form);
      setResult(res.data);
      toast.success(`SOS sent! ${res.data.matchedDonorsCount} donors notified.`);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send SOS');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    const matchedDonors = result?.matchedDonors || [];
    const notifiedHospitals = result?.notifiedHospitals || [];
    const notifiedBloodBanks = result?.notifiedBloodBanks || [];

    return (
      <div className="min-h-screen bg-red-50 px-4 py-8 dark:bg-gray-950">
        <div className="mx-auto max-w-4xl">
          <div className="card text-center mb-6 border-2 border-red-500">
            <div className="mb-4 text-6xl animate-pulse">🚨</div>
            <h2 className="mb-2 text-2xl font-bold text-red-600">EMERGENCY REQUEST SENT!</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-300">{matchedDonors.length} compatible donors, {notifiedHospitals.length} hospitals, and {notifiedBloodBanks.length} blood banks have been notified.</p>
            <div className="mx-auto mb-4 inline-block rounded-xl bg-red-100 p-4 dark:bg-red-900/30">
              <p className="font-bold text-red-800 dark:text-red-200">{form.bloodGroup} - {form.unitsRequired} unit(s)</p>
              <p className="mt-1 text-sm text-red-600 dark:text-red-300">{form.hospitalName}</p>
            </div>
            <button onClick={() => navigate('/dashboard')} className="btn-primary">Back to Dashboard</button>
          </div>

          {matchedDonors.length > 0 && (
            <div className="card mb-4">
              <h3 className="mb-3 text-base font-bold flex items-center gap-2"><BiCheckCircle className="text-green-500" /> Matched Donors ({matchedDonors.length})</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {matchedDonors.slice(0, 9).map(d => (
                  <div key={d._id} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 dark:border-gray-700">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${bloodGroupColors[d.bloodGroup]?.bg || 'bg-red-100'} ${bloodGroupColors[d.bloodGroup]?.text || 'text-red-700'}`}>
                      {d.bloodGroup}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{d.fullName}</p>
                      <p className="text-xs text-gray-500">{d.phone}</p>
                    </div>
                    <a href={`tel:${d.phone}`} className="shrink-0 rounded-lg bg-primary-50 p-2 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400"><BiPhone size={16} /></a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {notifiedHospitals.length > 0 && (
            <div className="card mb-4">
              <h3 className="mb-3 text-base font-bold flex items-center gap-2"><BiBuilding className="text-blue-500" /> Notified Hospitals ({notifiedHospitals.length})</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {notifiedHospitals.map(h => (
                  <div key={h._id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-700">
                    <div>
                      <p className="text-sm font-semibold">{h.name}</p>
                      <p className="text-xs text-gray-500">{h.contactNumber}</p>
                    </div>
                    <a href={`tel:${h.contactNumber}`} className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"><BiPhone size={16} /></a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {notifiedBloodBanks.length > 0 && (
            <div className="card mb-4">
              <h3 className="mb-3 text-base font-bold flex items-center gap-2"><BiDroplet className="text-red-500" /> Notified Blood Banks ({notifiedBloodBanks.length})</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {notifiedBloodBanks.map(b => (
                  <div key={b._id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-700">
                    <div>
                      <p className="text-sm font-semibold">{b.name}</p>
                      <p className="text-xs text-gray-500">{b.contactNumber}</p>
                    </div>
                    <a href={`tel:${b.contactNumber}`} className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"><BiPhone size={16} /></a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-50 px-4 py-8 dark:bg-gray-950">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-center">
          <BiError size={48} className="mx-auto mb-3 animate-pulse text-red-600" />
          <h1 className="section-title mb-1 text-red-600">Emergency SOS</h1>
          <p className="text-gray-600 dark:text-gray-300">Immediate blood request - donors will be alerted instantly</p>
        </div>

        <div className="card border-2 border-red-500 dark:border-red-400">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label">Patient Name</label>
                <input value={form.patientName} onChange={e => setForm({...form, patientName: e.target.value})} className="input-field" required />
              </div>
              <div>
                <label className="label">Blood Group</label>
                <select value={form.bloodGroup} onChange={e => setForm({...form, bloodGroup: e.target.value})} className="input-field">
                  {bloodGroups.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Units Required</label>
                <input type="number" min={1} value={form.unitsRequired} onChange={e => setForm({...form, unitsRequired: Number(e.target.value)})} className="input-field" required />
              </div>
              <div>
                <label className="label">Contact Number</label>
                <input value={form.contactNumber} onChange={e => setForm({...form, contactNumber: e.target.value})} className="input-field" required />
              </div>
            </div>
            <div>
              <label className="label">Hospital Name</label>
              <input value={form.hospitalName} onChange={e => setForm({...form, hospitalName: e.target.value})} className="input-field" required />
            </div>
            <div>
              <label className="label">Hospital Address</label>
              <input value={form.hospitalAddress} onChange={e => setForm({...form, hospitalAddress: e.target.value})} className="input-field" required />
            </div>
            <div>
              <label className="label">Location</label>
              <div className="flex gap-2">
                <input value={form.lat ? `${form.lat}, ${form.lng}` : ''} className="input-field flex-1" placeholder="Click Get Location" readOnly />
                <button type="button" onClick={getLocation} className="btn-secondary px-3"><BiMap size={20} /></button>
              </div>
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-field" rows={2} placeholder="Additional information..." />
            </div>
            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-lg font-bold text-white shadow-lg transition-all duration-150 hover:bg-red-700 active:scale-[0.98] disabled:opacity-50 animate-pulse">
              {loading ? 'Sending SOS...' : <><BiError size={24} /> SEND EMERGENCY SOS</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmergencySOS;
