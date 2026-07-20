import { useState, useCallback, useRef } from 'react';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';

const useLocation = () => {
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const locatingRef = useRef(false);

  const getPosition = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject({ code: -1, message: 'Geolocation is not supported by your browser' });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    });
  }, []);

  const reverseGeocode = useCallback(async (lat, lng) => {
    const params = new URLSearchParams({
      format: 'jsonv2',
      lat: lat.toString(),
      lon: lng.toString(),
      addressdetails: 1,
      'accept-language': 'en'
    });
    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: { 'User-Agent': 'LifeFlowApp/1.0' }
    });
    if (!res.ok) throw new Error('Reverse geocoding failed');
    const data = await res.json();
    const addr = data.address || {};
    return {
      city: addr.city || addr.town || addr.village || addr.municipality || addr.county || '',
      state: addr.state || '',
      country: addr.country || '',
      pincode: addr.postcode || ''
    };
  }, []);

  const getLocation = useCallback(async () => {
    if (locatingRef.current) return null;
    locatingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const pos = await getPosition();

      setLatitude(pos.lat);
      setLongitude(pos.lng);

      const address = await reverseGeocode(pos.lat, pos.lng);

      setCity(address.city);
      setState(address.state);
      setCountry(address.country);

      return {
        city: address.city,
        state: address.state,
        country: address.country,
        latitude: pos.lat,
        longitude: pos.lng
      };
    } catch (err) {
      let msg = 'Unable to detect location';
      if (err.code === 1) {
        msg = 'Location permission is required to automatically detect your city. You can enable it from your browser settings.';
      } else if (err.code === 2) {
        msg = 'GPS unavailable. Please try again.';
      } else if (err.code === 3) {
        msg = 'Location request timed out. Please try again.';
      } else if (err.code === -1) {
        msg = err.message;
      }
      setError(msg);
      return null;
    } finally {
      setLoading(false);
      locatingRef.current = false;
    }
  }, [getPosition, reverseGeocode]);

  const resetLocation = useCallback(() => {
    setCity('');
    setState('');
    setCountry('');
    setLatitude(null);
    setLongitude(null);
    setError(null);
  }, []);

  return {
    city,
    state,
    country,
    latitude,
    longitude,
    loading,
    error,
    getLocation,
    resetLocation
  };
};

export default useLocation;
