import { BiPhone, BiMapPin, BiBuilding, BiClinic, BiCheck, BiX } from 'react-icons/bi';
import { bloodGroupColors } from '../../utils/bloodGroups';

const ResultCard = ({ place, type }) => {
  const name = place.name || place.hospitalName || '';
  const address = place.address || '';
  const city = place.city || '';
  const contactNumber = place.contactNumber || place.phone || '';
  const distance = place.distance;
  const isVerified = place.isVerified !== undefined ? place.isVerified : true;
  const isOpen24x7 = place.isOpen24x7;
  const emergencyAvailable = place.emergencyAvailable;
  const openingHours = place.openingHours;
  const inventory = place.bloodInventory || {};
  const lat = place.location?.coordinates?.[1] || place.lat;
  const lng = place.location?.coordinates?.[0] || place.lng;

  const hasInventory = Object.values(inventory).some(v => v > 0);

  const directionsUrl = lat && lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + city)}`;

  return (
    <div className="card-hover">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
            {type === 'bloodbank' ? <BiBuilding size={22} /> : <BiClinic size={22} />}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">{name}</h3>
            <p className="text-xs text-gray-500 capitalize">{type === 'bloodbank' ? 'Blood Bank' : 'Hospital'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {distance !== undefined && distance !== null && (
            <span className="shrink-0 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
              {Math.round(distance)} km
            </span>
          )}
          <span className={`badge shrink-0 ${isVerified ? 'badge-green' : 'badge-yellow'}`}>
            {isVerified ? 'Verified' : 'Unverified'}
          </span>
        </div>
      </div>

      <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
        {address && (
          <p className="flex items-start gap-2">
            <BiMapPin size={16} className="mt-0.5 shrink-0 text-primary-500" />
            <span className="truncate">{address}{city ? `, ${city}` : ''}</span>
          </p>
        )}
        {contactNumber && (
          <p className="flex items-center gap-2">
            <BiPhone size={16} className="shrink-0 text-primary-500" />
            {contactNumber}
          </p>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          {isOpen24x7 !== undefined && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${isOpen24x7 ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
              {isOpen24x7 ? <BiCheck size={14} /> : <BiX size={14} />}
              {isOpen24x7 ? 'Open 24x7' : openingHours || ''}
            </span>
          )}
          {emergencyAvailable !== undefined && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${emergencyAvailable ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
              {emergencyAvailable ? 'Emergency Available' : 'No Emergency'}
            </span>
          )}
        </div>
      </div>

      {hasInventory && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">Blood Stock</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(inventory).filter(([, units]) => units > 0).map(([bg, units]) => (
              <span key={bg} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${bloodGroupColors[bg]?.bg || 'bg-gray-100'} ${bloodGroupColors[bg]?.text || 'text-gray-700'}`}>
                {bg}: {units}u
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {contactNumber && (
          <a href={`tel:${contactNumber}`} className="btn-secondary gap-1 flex-1 text-xs">
            <BiPhone size={14} /> Call Now
          </a>
        )}
        <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary gap-1 flex-1 text-xs">
          <BiMapPin size={14} /> Directions
        </a>
      </div>
    </div>
  );
};

export default ResultCard;
