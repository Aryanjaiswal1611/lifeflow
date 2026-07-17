import { useState, useEffect } from 'react';
import { mapAPI } from '../services/api';
import toast from 'react-hot-toast';
import { BiCurrentLocation, BiDroplet, BiBuilding, BiMap, BiFilter } from 'react-icons/bi';
import { useCurrentLocation } from '../hooks/useCurrentLocation';

const NearbyMap = () => {
  const [tab, setTab] = useState('donors');
  const [donors, setDonors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [bloodFilter, setBloodFilter] = useState('');
  const [distance, setDistance] = useState(50);
  const [selected, setSelected] = useState(null);
  const { getCurrentLocation, locating } = useCurrentLocation();

  useEffect(() => {
    const init = async () => {
      const loc = await getCurrentLocation();
      if (loc) setLocation({ lat: loc.lat, lng: loc.lng });
    };
    init();
  }, []);

  const searchNearby = async () => {
    if (!location) return toast.error('Location required');
    setLoading(true);
    try {
      if (tab === 'donors') {
        const params = { lat: location.lat, lng: location.lng, maxDistance: distance };
        if (bloodFilter) params.bloodGroup = bloodFilter;
        const res = await mapAPI.getNearbyDonors(params);
        setDonors(res.data);
      } else {
        const res = await mapAPI.getNearbyHospitals({ lat: location.lat, lng: location.lng, maxDistance: distance });
        setHospitals(res.data);
      }
    } catch (err) {
      toast.error('Failed to fetch nearby locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location) searchNearby();
  }, [tab, location]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="section-title mb-0 flex items-center gap-2"><BiMap className="text-primary-500" size={28} /> Nearby</h1>
        <div className="flex gap-2">
          <button onClick={() => setTab('donors')} className={`tab-btn ${tab === 'donors' ? 'tab-active' : 'tab-inactive'}`}>
            <BiDroplet className="mr-1 inline" size={16} /> Donors
          </button>
          <button onClick={() => setTab('hospitals')} className={`tab-btn ${tab === 'hospitals' ? 'tab-active' : 'tab-inactive'}`}>
            <BiBuilding className="mr-1 inline" size={16} /> Hospitals
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="card space-y-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold"><BiFilter size={16} /> Filters</h3>
            <div>
              <label className="label mb-1">Distance: <span className="font-semibold text-primary-600 dark:text-primary-400">{distance} km</span></label>
              <input type="range" min={5} max={200} value={distance} onChange={e => setDistance(Number(e.target.value))} className="w-full accent-primary-600" />
              <div className="mt-1 flex justify-between text-xs text-gray-400"><span>5 km</span><span>200 km</span></div>
            </div>
            {tab === 'donors' && (
              <div>
                <label className="label text-xs">Blood Group</label>
                <select value={bloodFilter} onChange={e => setBloodFilter(e.target.value)} className="input-field">
                  <option value="">All Groups</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            )}
            <button onClick={searchNearby} className="btn-primary w-full gap-2">
              <BiCurrentLocation size={16} /> Search Nearby
            </button>
          </div>

          <div className="mt-4 space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin">
            {(tab === 'donors' ? donors : hospitals).length === 0 && !loading && (
              <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No results found. Try expanding your search area.</p>
            )}
            {(tab === 'donors' ? donors : hospitals).map(item => (
              <div key={item._id} onClick={() => setSelected(item)}
                className={`card-hover cursor-pointer ${selected?._id === item._id ? 'ring-2 ring-primary-500 dark:ring-primary-400' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white">{item.user?.name || item.hospitalName}</p>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{item.bloodGroup || ''} {item.user?.city || item.city}</p>
                    {item.distance && <p className="mt-0.5 text-xs text-gray-400">{item.distance} km away</p>}
                  </div>
                  {item.bloodGroup && <span className="badge-red shrink-0 font-bold">{item.bloodGroup}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex h-[600px] items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
            {location ? (
              <div className="space-y-4 text-center">
                <BiMap size={64} className="mx-auto text-primary-500" />
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">Map View</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {loading ? 'Loading nearby locations...' : `${tab === 'donors' ? donors.length : hospitals.length} ${tab} found nearby`}
                </p>
                <p className="text-xs text-gray-400">Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
                <p className="text-xs text-gray-400">To enable interactive maps, add your Google Maps API key and integrate a Map component.</p>
              </div>
            ) : (
              <div className="text-center">
                <BiCurrentLocation size={64} className="mx-auto text-gray-300 dark:text-gray-600" />
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Enable location access to see nearby donors and hospitals</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NearbyMap;
