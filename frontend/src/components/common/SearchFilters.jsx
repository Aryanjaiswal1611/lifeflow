import { BiSortAlt2, BiFilter } from 'react-icons/bi';

const SORT_OPTIONS = [
  { value: 'distance', label: 'Nearest' },
  { value: 'name', label: 'Alphabetical' }
];

const SearchFilters = ({ filters, onFilterChange, resultCounts }) => {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-3 shadow-sm dark:bg-gray-800/50">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <BiFilter size={16} />
        <span className="font-medium">Filters</span>
      </div>

      <select
        value={filters.type || 'all'}
        onChange={e => onFilterChange({ ...filters, type: e.target.value })}
        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
      >
        <option value="all">All Types {resultCounts ? `(${(resultCounts.bloodBanks || 0) + (resultCounts.hospitals || 0)})` : ''}</option>
        <option value="bloodbank">Blood Banks {resultCounts ? `(${resultCounts.bloodBanks || 0})` : ''}</option>
        <option value="hospital">Hospitals {resultCounts ? `(${resultCounts.hospitals || 0})` : ''}</option>
      </select>

      <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />

      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <BiSortAlt2 size={16} />
        <span className="font-medium">Sort by</span>
      </div>

      <select
        value={filters.sort || 'distance'}
        onChange={e => onFilterChange({ ...filters, sort: e.target.value })}
        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
      >
        {SORT_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {filters.lat && filters.lng && (
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 dark:text-gray-400">Radius:</label>
          <select
            value={filters.radius || 20}
            onChange={e => onFilterChange({ ...filters, radius: Number(e.target.value) })}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
          >
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={20}>20 km</option>
            <option value={50}>50 km</option>
            <option value={100}>100 km</option>
            <option value={200}>200 km</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
