import { useState } from 'react';
import { availabilityAPI } from '../services/api';
import { bloodGroups, bloodGroupColors } from '../utils/bloodGroups';
import toast from 'react-hot-toast';
import { BiSearch, BiCurrentLocation, BiPhone, BiMapPin, BiDroplet, BiFilter } from 'react-icons/bi';
import { useCurrentLocation } from '../hooks/useCurrentLocation';

const BloodAvailability = () => {
  const [filters, setFilters] = useState({ bloodGroup: '', city: '', radius: 50, type: 'all' });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { getCurrentLocation, locating } = useCurrentLocation();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!filters.bloodGroup) { toast.error('Please select a blood group'); return; }
    setLoading(true);
    setSearched(true);
    try {
      const res = await availabilityAPI.search(filters);
      setResults(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocation = async () => {
    const loc = await getCurrentLocation();
    if (loc) {
      setFilters(prev => ({
        ...prev,
        lat: loc.lat,
        lng: loc.lng,
        city: loc.address?.city || prev.city
      }));
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 text-center">
        <BiSearch size={40} className="mx-auto mb-3 text-primary-500" />
        <h1 className="section-title">Blood Availability</h1>
        <p className="section-subtitle mb-0">Search for blood availability across hospitals, blood banks, and donors</p>
      </div>

      <div className="card mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="label">Blood Group</label>
              <select value={filters.bloodGroup} onChange={e => setFilters({...filters, bloodGroup: e.target.value})} className="input-field">
                <option value="">Select group</option>
                {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div>
              <label className="label">City</label>
              <input value={filters.city} onChange={e => setFilters({...filters, city: e.target.value})} className="input-field" placeholder="Enter city" />
            </div>
            <div>
              <label className="label">Radius (km)</label>
              <input type="number" value={filters.radius} onChange={e => setFilters({...filters, radius: Number(e.target.value)})} className="input-field" min={1} max={500} />
            </div>
            <div>
              <label className="label">Source Type</label>
              <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})} className="input-field">
                <option value="all">All Sources</option>
                <option value="hospital">Hospitals</option>
                <option value="bloodbank">Blood Banks</option>
                <option value="donor">Donors</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-primary gap-2" disabled={loading}>
              {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <BiSearch size={18} />}
              Search Availability
            </button>
            <button type="button" onClick={handleGetLocation} className="btn-secondary gap-2" disabled={locating}>
              <BiCurrentLocation size={18} /> {locating ? 'Getting Location...' : 'Use My Location'}
            </button>
          </div>
        </form>
      </div>

      {searched && !results && !loading && (
        <div className="card py-12 text-center">
          <BiSearch size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 dark:text-gray-400">No results found. Try different filters.</p>
        </div>
      )}

      {results && (
        <div className="space-y-6">
          {results.hospitals?.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-bold flex items-center gap-2"><BiMapPin className="text-primary-500" /> Hospitals ({results.hospitals.length})</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.hospitals.map(h => (
                  <div key={h._id} className="card">
                    <h3 className="text-base font-bold">{h.name}</h3>
                    <p className="text-xs text-gray-500">{h.address}, {h.city}</p>
                    <div className="mt-2 space-y-1 text-sm">
                      {h.bloodInventory?.find(b => b.bloodGroup === filters.bloodGroup) && (
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          {filters.bloodGroup}: {h.bloodInventory.find(b => b.bloodGroup === filters.bloodGroup).units} units
                        </p>
                      )}
                      {h.distance && <p className="text-xs text-gray-400">{Math.round(h.distance)} km away</p>}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <a href={`tel:${h.contactNumber}`} className="btn-secondary text-xs gap-1 flex-1"><BiPhone /> Call</a>
                      {h.lat && h.lng && <a href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs gap-1 flex-1"><BiMapPin /> Navigate</a>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.bloodBanks?.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-bold flex items-center gap-2"><BiDroplet className="text-red-500" /> Blood Banks ({results.bloodBanks.length})</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.bloodBanks.map(b => (
                  <div key={b._id} className="card">
                    <h3 className="text-base font-bold">{b.name}</h3>
                    <p className="text-xs text-gray-500">{b.address}, {b.city}</p>
                    <div className="mt-2 space-y-1 text-sm">
                      {b.bloodInventory?.find(bi => bi.bloodGroup === filters.bloodGroup) && (
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          {filters.bloodGroup}: {b.bloodInventory.find(bi => bi.bloodGroup === filters.bloodGroup).units} units
                        </p>
                      )}
                      {b.distance && <p className="text-xs text-gray-400">{Math.round(b.distance)} km away</p>}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <a href={`tel:${b.contactNumber}`} className="btn-secondary text-xs gap-1 flex-1"><BiPhone /> Call</a>
                      {b.lat && b.lng && <a href={`https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}`} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs gap-1 flex-1"><BiMapPin /> Navigate</a>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.donors?.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-bold flex items-center gap-2"><BiDroplet className="text-red-500" /> Available Donors ({results.donors.length})</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.donors.map(d => (
                  <div key={d._id} className="card">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700 dark:bg-red-900/30 dark:text-red-300">{d.bloodGroup}</div>
                      <div>
                        <h3 className="text-base font-bold">{d.fullName}</h3>
                        <p className="text-xs text-gray-500">{d.city}{d.distance && ` • ${Math.round(d.distance)} km`}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <a href={`tel:${d.phone}`} className="btn-secondary text-xs gap-1 flex-1"><BiPhone /> Call</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BloodAvailability;
