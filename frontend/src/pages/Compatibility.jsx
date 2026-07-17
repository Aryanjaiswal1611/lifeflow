import { useState, useEffect } from 'react';
import { compatibilityAPI } from '../services/api';
import { bloodGroups, getDonatableGroups, getReceivableGroups, getCompatibilitySummary, compatibilityMap, bloodGroupColors } from '../utils/bloodGroups';
import { BiDroplet, BiCheckCircle, BiXCircle, BiSearch } from 'react-icons/bi';

const Compatibility = () => {
  const [selected, setSelected] = useState('O+');
  const [summary, setSummary] = useState(null);
  const [allCompat, setAllCompat] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    compatibilityAPI.getAll().then(r => setAllCompat(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setSummary(getCompatibilitySummary(selected));
  }, [selected]);

  const filteredGroups = bloodGroups.filter(g =>
    g.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 text-center">
        <BiDroplet size={44} className="mx-auto mb-3 text-primary-500" />
        <h1 className="section-title">Blood Compatibility Engine</h1>
        <p className="section-subtitle mb-0">Check which blood groups are compatible with each other</p>
      </div>

      <div className="mb-6">
        <div className="relative mx-auto max-w-xs">
          <BiSearch className="absolute left-3 top-3 text-gray-400" size={18} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search blood group..." />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="mb-3 text-sm font-semibold">Select Blood Group</h3>
            <div className="grid grid-cols-2 gap-2">
              {filteredGroups.map(g => {
                const colors = bloodGroupColors[g];
                return (
                  <button key={g} onClick={() => setSelected(g)}
                    className={`rounded-xl border-2 p-3 text-center font-bold text-lg transition-all duration-150 ${selected === g ? 'border-primary-500 bg-primary-50 shadow-sm dark:border-primary-400 dark:bg-primary-900/20' : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'} ${colors.text}`}>
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {summary && (
            <div className="card mt-4">
              <h3 className="mb-3 text-sm font-semibold">{selected} Summary</h3>
              <div className={`rounded-xl p-4 text-center ${summary.isUniversalDonor ? 'bg-green-50 dark:bg-green-900/20' : summary.isUniversalRecipient ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                <div className="text-3xl mb-2">{summary.isUniversalDonor ? '🌟' : summary.isUniversalRecipient ? '👑' : '🩸'}</div>
                <p className="text-sm font-semibold">{summary.donorType}</p>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="card">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
                <BiCheckCircle size={18} /> Can Donate To
              </h3>
              <div className="flex flex-wrap gap-2">
                {getDonatableGroups(selected).map(g => {
                  const colors = bloodGroupColors[g];
                  return (
                    <span key={g} className={`badge ${colors.bg} ${colors.text} ${colors.darkBg} ${colors.darkText} text-sm font-bold px-3 py-1`}>{g}</span>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-gray-500">
                {selected === 'O-' ? 'O- is the universal donor. Can donate to everyone!' :
                 `Donors with ${selected} blood can donate to ${getDonatableGroups(selected).length} blood group(s).`}
              </p>
            </div>

            <div className="card">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                <BiXCircle size={18} /> Can Receive From
              </h3>
              <div className="flex flex-wrap gap-2">
                {getReceivableGroups(selected).map(g => {
                  const colors = bloodGroupColors[g];
                  return (
                    <span key={g} className={`badge ${colors.bg} ${colors.text} ${colors.darkBg} ${colors.darkText} text-sm font-bold px-3 py-1`}>{g}</span>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-gray-500">
                {selected === 'AB+' ? 'AB+ is the universal recipient. Can receive from everyone!' :
                 `Patients with ${selected} blood can receive from ${getReceivableGroups(selected).length} blood group(s).`}
              </p>
            </div>
          </div>

          <div className="card mt-6">
            <h3 className="mb-4 text-sm font-semibold">Complete Compatibility Chart</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Donor ↓ / Receiver →</th>
                    {bloodGroups.map(g => (
                      <th key={g} className={`px-2 py-2 text-center text-xs font-bold ${bloodGroupColors[g].text}`}>{g}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bloodGroups.map(donor => (
                    <tr key={donor} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className={`px-3 py-2 font-bold text-xs ${bloodGroupColors[donor].text}`}>{donor}</td>
                      {bloodGroups.map(receiver => {
                        const compatible = compatibilityMap[receiver]?.includes(donor);
                        return (
                          <td key={receiver} className="px-2 py-2 text-center">
                            {compatible ? (
                              <BiCheckCircle size={16} className="mx-auto text-green-500" />
                            ) : (
                              <BiXCircle size={16} className="mx-auto text-red-300 dark:text-red-500" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compatibility;
