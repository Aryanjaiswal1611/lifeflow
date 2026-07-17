import { useState } from 'react';
import { searchAPI } from '../services/api';
import toast from 'react-hot-toast';
import { BiSearch, BiDroplet, BiMapPin, BiPhone, BiFilter, BiCurrentLocation } from 'react-icons/bi';
import { bloodGroups } from '../utils/bloodGroups';
import { useCurrentLocation } from '../hooks/useCurrentLocation';

const Search = () => {
  const [filters, setFilters] = useState({
    bloodGroup: '', city: '', availability: false, donorName: '',
    hospital: '', distance: 50, lat: '', lng: ''
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const { getCurrentLocation: getLocFromHook, locating } = useCurrentLocation();

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await searchAPI.search(params);
      setResults(res.data);
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const getLocation = async () => {
    const loc = await getLocFromHook();
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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 text-center">
        <BiSearch size={44} className="mx-auto mb-3 text-primary-500" />
        <h1 className="section-title">Search Donors & Hospitals</h1>
        <p className="section-subtitle mb-0">Find blood donors and hospitals near you</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="card">
            <button onClick={() => setShowFilters(!showFilters)} className="mb-4 flex w-full items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><BiFilter size={16} /> Filters</h3>
              <span className="text-xs text-gray-400">{showFilters ? 'Hide' : 'Show'}</span>
            </button>
            {showFilters && (
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="label text-xs">Blood Group</label>
                  <select value={filters.bloodGroup} onChange={e => setFilters({...filters, bloodGroup: e.target.value})} className="input-field">
                    <option value="">All Groups</option>
                    {bloodGroups.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label text-xs">City</label>
                  <input value={filters.city} onChange={e => setFilters({...filters, city: e.target.value})} className="input-field" placeholder="Enter city" />
                </div>
                <div>
                  <label className="label text-xs">Donor Name</label>
                  <input value={filters.donorName} onChange={e => setFilters({...filters, donorName: e.target.value})} className="input-field" placeholder="Search by name" />
                </div>
                <div>
                  <label className="label text-xs">Hospital Name</label>
                  <input value={filters.hospital} onChange={e => setFilters({...filters, hospital: e.target.value})} className="input-field" placeholder="Search hospital" />
                </div>
                <div>
                  <label className="label text-xs">Max Distance (km)</label>
                  <input type="number" value={filters.distance} onChange={e => setFilters({...filters, distance: e.target.value})} className="input-field" />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <input type="checkbox" checked={filters.availability} onChange={e => setFilters({...filters, availability: e.target.checked})} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  Available only
                </label>
                <button type="button" onClick={getLocation} className="link flex items-center gap-1 text-xs">
                  <BiCurrentLocation size={14} /> Use my location
                </button>
                <button type="submit" disabled={loading} className="btn-primary w-full gap-2">
                  {loading ? 'Searching...' : <><BiSearch size={16} /> Search</>}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {results === null ? (
            <div className="card py-20 text-center">
              <BiSearch size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">Use the filters to search for donors and hospitals</p>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-primary-800 dark:border-t-primary-400" />
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
                  <BiDroplet className="text-primary-500" />
                  Donors ({results.donors?.length || 0})
                </h3>
                <div className="space-y-3">
                  {results.donors?.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No donors found</p>
                  ) : results.donors?.map(d => (
                    <div key={d._id} className="card-hover flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white">{d.user?.name}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500"><BiMapPin size={14} /> {d.user?.city}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <span className="badge-red font-bold">{d.bloodGroup}</span>
                          {d.isAvailable && <span className="badge-green">Available</span>}
                          {d.distance && <span className="text-xs text-gray-400">{d.distance.toFixed(1)} km</span>}
                        </div>
                      </div>
                      {d.user?.phone && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <BiPhone size={14} /> {d.user.phone}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
                  <span>🏥</span> Hospitals ({results.hospitals?.length || 0})
                </h3>
                <div className="space-y-3">
                  {results.hospitals?.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No hospitals found</p>
                  ) : results.hospitals?.map(h => (
                    <div key={h._id} className="card-hover flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white">{h.hospitalName}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500"><BiMapPin size={14} /> {h.city}</p>
                        {h.distance && <span className="text-xs text-gray-400">{h.distance.toFixed(1)} km</span>}
                      </div>
                      <span className={`badge ${h.isVerified ? 'badge-green' : 'badge-yellow'}`}>
                        {h.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
