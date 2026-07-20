import { useState, useRef } from 'react';
import { bloodBankAPI } from '../services/api';
import { bloodGroupColors } from '../utils/bloodGroups';
import toast from 'react-hot-toast';
import { BiSearch, BiCurrentLocation, BiPhone, BiMapPin, BiBuilding, BiCheck } from 'react-icons/bi';
import useLocation from '../hooks/useLocation';

const HospitalFinder = () => {
  const [filters, setFilters] = useState({ city: '', radius: 50, type: 'hospital' });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [locationStatus, setLocationStatus] = useState('idle');
  const locationTimerRef = useRef(null);
  const { city: locCity, loading: locLoading, error: locError, getLocation, resetLocation } = useLocation();

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      let res;
      if (filters.type === 'bloodbank') {
        res = await bloodBankAPI.getNearby({ ...filters });
      } else {
        res = await bloodBankAPI.getNearby({ ...filters, type: 'hospital' });
      }
      setResults(Array.isArray(res.data) ? res.data : res.data.results || res.data.places || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocation = async () => {
    resetLocation();
    setLocationStatus('detecting');
    const loc = await getLocation();
    if (loc) {
      setLocationStatus('success');
      setFilters(prev => ({
        ...prev,
        lat: loc.latitude,
        lng: loc.longitude,
        city: loc.city || prev.city
      }));
      setLoading(true);
      setSearched(true);
      try {
        const params = { city: loc.city || '', radius: filters.radius, type: filters.type };
        if (loc.latitude && loc.longitude) {
          params.lat = loc.latitude;
          params.lng = loc.longitude;
        }
        let res;
        if (params.type === 'bloodbank') {
          res = await bloodBankAPI.getNearby(params);
        } else {
          res = await bloodBankAPI.getNearby({ ...params, type: 'hospital' });
        }
        setResults(Array.isArray(res.data) ? res.data : res.data.results || res.data.places || []);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Search failed');
      } finally {
        setLoading(false);
      }
      if (locationTimerRef.current) clearTimeout(locationTimerRef.current);
      locationTimerRef.current = setTimeout(() => setLocationStatus('idle'), 3000);
    } else {
      setLocationStatus('error');
    }
  };

  const getLocationButtonText = () => {
    if (locLoading) return 'Detecting Location...';
    if (locationStatus === 'success') return 'Location Detected \u2713';
    if (locationStatus === 'error' || locError) return 'Retry Location';
    return 'Use My Location';
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 text-center">
        <BiBuilding size={40} className="mx-auto mb-3 text-primary-500" />
        <h1 className="section-title">Hospital & Blood Bank Finder</h1>
        <p className="section-subtitle mb-0">Find nearby hospitals and blood banks with real-time blood stock information</p>
      </div>

      <div className="card mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="label">Search Type</label>
              <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})} className="input-field">
                <option value="hospital">Hospitals</option>
                <option value="bloodbank">Blood Banks</option>
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
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-primary gap-2" disabled={loading}>
              {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <BiSearch size={18} />}
              {filters.type === 'hospital' ? 'Find Hospitals' : 'Find Blood Banks'}
            </button>
            <button type="button" onClick={handleGetLocation} className={`btn-secondary gap-2 ${locLoading ? 'opacity-70 cursor-not-allowed' : ''} ${locationStatus === 'success' ? 'border-green-500 text-green-600 dark:text-green-400' : locError ? 'border-red-400 text-red-600 dark:text-red-400' : ''}`} disabled={locLoading}>
              {locLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : locationStatus === 'success' ? <BiCheck size={18} /> : <BiCurrentLocation size={18} />}
              {getLocationButtonText()}
            </button>
          </div>
          {locError && locationStatus === 'error' && (
            <p className="mt-3 text-sm text-red-500 dark:text-red-400">{locError}</p>
          )}
          {locationStatus === 'success' && locCity && (
            <p className="mt-3 text-sm text-green-600 dark:text-green-400">Location detected: {locCity}</p>
          )}
        </form>
      </div>

      {loading && (
        <div className="card py-16 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="text-gray-500">Searching nearby {filters.type === 'hospital' ? 'hospitals' : 'blood banks'}...</p>
        </div>
      )}

      {searched && !loading && (!results || results.length === 0) && (
        <div className="card py-12 text-center">
          <BiSearch size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 dark:text-gray-400">No {filters.type === 'hospital' ? 'hospitals' : 'blood banks'} found nearby.</p>
          <p className="mt-2 text-sm text-gray-400">Try expanding your search radius or entering a different city.</p>
        </div>
      )}

      {results?.length > 0 && !loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map(place => {
            const isVerified = place.isVerified !== undefined ? place.isVerified : true;
            const inventory = place.bloodInventory || [];
            return (
              <div key={place._id} className="card-hover">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{place.name}</h3>
                    <p className="text-xs text-gray-500">{place.type === 'bloodbank' ? 'Blood Bank' : 'Hospital'}</p>
                  </div>
                  <span className={`badge ml-2 ${isVerified ? 'badge-green' : 'badge-yellow'}`}>
                    {isVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>

                <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                  <p className="flex items-start gap-2"><BiMapPin size={16} className="mt-0.5 shrink-0 text-primary-500" /> {place.address}, {place.city}, {place.state} {place.pincode}</p>
                  {place.contactNumber && (
                    <p className="flex items-center gap-2"><BiPhone size={16} className="text-primary-500" /> {place.contactNumber}</p>
                  )}
                  {place.website && <p className="text-xs text-blue-600 dark:text-blue-400 truncate">{place.website}</p>}
                  {place.distance && <p className="text-xs text-gray-400 flex items-center gap-1"><BiMapPin size={12} /> {Math.round(place.distance)} km away</p>}
                </div>

                {inventory.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-1.5 text-xs font-semibold text-gray-500 uppercase">Blood Stock</p>
                    <div className="flex flex-wrap gap-1.5">
                      {inventory.filter(item => item.units > 0).map(item => (
                        <span key={item.bloodGroup} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${bloodGroupColors[item.bloodGroup]?.bg || 'bg-gray-100'} ${bloodGroupColors[item.bloodGroup]?.text || 'text-gray-700'}`}>
                          {item.bloodGroup}: {item.units}u
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  {place.contactNumber && (
                    <a href={`tel:${place.contactNumber}`} className="btn-secondary gap-1 flex-1 text-xs"><BiPhone /> Call</a>
                  )}
                  {(place.lat && place.lng) && (
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`} target="_blank" rel="noopener noreferrer" className="btn-secondary gap-1 flex-1 text-xs"><BiMapPin /> Navigate</a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HospitalFinder;
