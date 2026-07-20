import { useState, useEffect, useRef, useCallback } from 'react';
import { searchAPI } from '../services/api';
import toast from 'react-hot-toast';
import { BiSearch, BiCurrentLocation, BiCheck, BiBuildings, BiClinic, BiMapPin } from 'react-icons/bi';
import useLocation from '../hooks/useLocation';
import ResultCard from '../components/common/ResultCard';
import SearchFilters from '../components/common/SearchFilters';
import { CardSkeleton } from '../components/common/LoadingSkeleton';

const TABS = [
  { key: 'all', label: 'All', icon: BiBuildings },
  { key: 'bloodbank', label: 'Blood Banks', icon: BiBuildings },
  { key: 'hospital', label: 'Hospitals', icon: BiClinic }
];

const BloodAvailability = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [locationStatus, setLocationStatus] = useState('idle');
  const [filters, setFilters] = useState({
    type: 'all', sort: 'distance', lat: null, lng: null, radius: 20
  });
  const debounceRef = useRef(null);
  const locationTimerRef = useRef(null);
  const { city: locCity, loading: locLoading, error: locError, getLocation, resetLocation } = useLocation();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const performSearch = useCallback(async (searchParams) => {
    if (!searchParams.query && !searchParams.city && !searchParams.lat) return;
    setLoading(true);
    setSearched(true);
    try {
      const params = { ...searchParams };
      if (params.type === 'all') delete params.type;
      const res = await searchAPI.searchPlaces(params);
      setResults(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Search failed');
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedQuery) {
      const params = { query: debouncedQuery, type: filters.type };
      if (filters.lat) params.lat = filters.lat;
      if (filters.lng) params.lng = filters.lng;
      if (filters.lat) params.radius = filters.radius;
      performSearch(params);
    }
  }, [debouncedQuery, performSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) { toast.error('Please enter a city, area, or pincode'); return; }
    setDebouncedQuery(query.trim());
    const params = { query: query.trim(), type: filters.type, lat: filters.lat, lng: filters.lng };
    if (filters.lat) params.radius = filters.radius;
    performSearch(params);
  };

  const handleGetLocation = async () => {
    resetLocation();
    setLocationStatus('detecting');
    const loc = await getLocation();
    if (loc) {
      setLocationStatus('success');
      const cityName = loc.city || '';
      setQuery(cityName);
      setFilters(prev => ({ ...prev, lat: loc.latitude, lng: loc.longitude, radius: 20 }));
      performSearch({ query: cityName, lat: loc.latitude, lng: loc.longitude, radius: 20 });
      if (locationTimerRef.current) clearTimeout(locationTimerRef.current);
      locationTimerRef.current = setTimeout(() => setLocationStatus('idle'), 3000);
    } else {
      setLocationStatus('error');
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    const queryText = debouncedQuery || query.trim();
    if (queryText || filters.lat) {
      const params = { type: newFilters.type, sort: newFilters.sort };
      if (queryText) params.query = queryText;
      if (newFilters.lat) { params.lat = newFilters.lat; params.lng = newFilters.lng; params.radius = newFilters.radius; }
      performSearch(params);
    }
  };

  const getLocationButtonText = () => {
    if (locLoading) return 'Detecting Location...';
    if (locationStatus === 'success') return 'Location Detected \u2713';
    if (locationStatus === 'error' || locError) return 'Retry';
    return 'Use My Location';
  };

  const getFilteredResults = () => {
    if (!results) return { bloodBanks: [], hospitals: [] };
    let bloodBanks = [...(results.bloodBanks || [])];
    let hospitals = [...(results.hospitals || [])];

    if (filters.sort === 'name') {
      bloodBanks.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      hospitals.sort((a, b) => (a.hospitalName || '').localeCompare(b.hospitalName || ''));
    }

    return { bloodBanks, hospitals };
  };

  const { bloodBanks, hospitals } = getFilteredResults();
  const showAll = activeTab === 'all';
  const count = (showAll ? bloodBanks.length + hospitals.length : activeTab === 'bloodbank' ? bloodBanks.length : hospitals.length);
  const hasLocation = filters.lat && filters.lng;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 text-center">
        <BiSearch size={40} className="mx-auto mb-3 text-primary-500" />
        <h1 className="section-title">Find Blood Banks & Hospitals</h1>
        <p className="section-subtitle mb-0">Search for blood banks and hospitals by city, area, or pincode</p>
      </div>

      <div className="card mb-6">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <BiSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="input-field pl-10"
                placeholder="Search by city, area, or pincode... (e.g., Delhi, Mathura, 110001)"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary gap-2 whitespace-nowrap" disabled={loading}>
                {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <BiSearch size={18} />}
                Search
              </button>
              <button type="button" onClick={handleGetLocation} className={`btn-secondary gap-2 whitespace-nowrap ${locLoading ? 'opacity-70 cursor-not-allowed' : ''} ${locationStatus === 'success' ? 'border-green-500 text-green-600 dark:text-green-400' : ''}`} disabled={locLoading}>
                {locLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : locationStatus === 'success' ? <BiCheck size={18} /> : <BiCurrentLocation size={18} />}
                {getLocationButtonText()}
              </button>
            </div>
          </div>
          {locError && locationStatus === 'error' && (
            <p className="text-sm text-red-500 dark:text-red-400">{locError}</p>
          )}
          {locationStatus === 'success' && locCity && (
            <p className="text-sm text-green-600 dark:text-green-400">Location detected: {locCity}</p>
          )}
        </form>
      </div>

      {searched && !loading && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`tab-btn flex items-center gap-1.5 text-sm ${activeTab === tab.key ? 'tab-active' : 'tab-inactive'}`}
                >
                  <tab.icon size={16} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="text-xs opacity-70">
                    ({tab.key === 'all' ? (results ? (results.bloodBanks?.length || 0) + (results.hospitals?.length || 0) : 0)
                      : tab.key === 'bloodbank' ? (results?.bloodBanks?.length || 0) : (results?.hospitals?.length || 0)})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {count > 0 && (
            <SearchFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              resultCounts={{ bloodBanks: bloodBanks.length, hospitals: hospitals.length }}
            />
          )}
        </>
      )}

      <div className="mt-6">
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
          </div>
        )}

        {!loading && searched && count === 0 && (
          <div className="card py-16 text-center">
            <BiSearch size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-500 dark:text-gray-400">No results found</p>
            <p className="mt-2 text-sm text-gray-400">
              {query.trim()
                ? `No blood banks or hospitals found matching "${query.trim()}". Try a different search term.`
                : hasLocation
                  ? 'No blood banks or hospitals found near your location. Try increasing the search radius.'
                  : 'Enter a city, area, or pincode to search.'}
            </p>
          </div>
        )}

        {!loading && searched && count > 0 && (
          <div className="space-y-8">
            {(showAll || activeTab === 'bloodbank') && bloodBanks.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
                  <BiBuildings className="text-primary-500" size={22} />
                  Blood Banks
                  <span className="text-sm font-normal text-gray-400">({bloodBanks.length})</span>
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {bloodBanks.map(b => <ResultCard key={b._id} place={b} type="bloodbank" />)}
                </div>
              </div>
            )}
            {(showAll || activeTab === 'hospital') && hospitals.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
                  <BiClinic className="text-primary-500" size={22} />
                  Hospitals
                  <span className="text-sm font-normal text-gray-400">({hospitals.length})</span>
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {hospitals.map(h => <ResultCard key={h._id} place={h} type="hospital" />)}
                </div>
              </div>
            )}
          </div>
        )}

        {!searched && !loading && (
          <div className="card py-16 text-center">
            <BiMapPin size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 dark:text-gray-400">Search for blood banks and hospitals near you</p>
            <p className="mt-2 text-sm text-gray-400">Enter a location above or use your current location</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BloodAvailability;
