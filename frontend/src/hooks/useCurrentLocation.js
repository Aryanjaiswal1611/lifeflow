import { useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';

export function useCurrentLocation() {
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState(null);
  const locatingRef = useRef(false);

  const getPosition = useCallback((options = {}) => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = { code: -1, message: 'Geolocation is not supported by your browser' };
        reject(err);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000, ...options }
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
      pincode: addr.postcode || '',
      displayName: data.display_name || '',
      lat: parseFloat(data.lat) || lat,
      lng: parseFloat(data.lon) || lng
    };
  }, []);

  const getCurrentLocation = useCallback(async (options = {}) => {
    if (locatingRef.current) return;
    locatingRef.current = true;
    setLocating(true);
    setLocationError(null);
    try {
      const pos = await getPosition(options);
      setCoords(pos);
      const addr = await reverseGeocode(pos.lat, pos.lng);
      setAddress(addr);
      return { ...pos, address: addr };
    } catch (err) {
      let msg = 'Could not get location';
      if (err.code === 1) msg = 'Location permission denied. Please enable location access in your browser settings.';
      else if (err.code === 2) msg = 'Location unavailable. Please try again.';
      else if (err.code === 3) msg = 'Location request timed out. Please try again.';
      else if (err.code === -1) msg = err.message;
      setLocationError(msg);
      toast.error(msg);
      return null;
    } finally {
      setLocating(false);
      locatingRef.current = false;
    }
  }, [getPosition, reverseGeocode]);

  const resetLocation = useCallback(() => {
    setCoords(null);
    setAddress(null);
    setLocationError(null);
  }, []);

  return {
    getCurrentLocation,
    reverseGeocode,
    getPosition,
    locating,
    locationError,
    coords,
    address,
    resetLocation
  };
}

export default useCurrentLocation;
