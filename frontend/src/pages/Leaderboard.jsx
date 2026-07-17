import { useState, useEffect } from 'react';
import { rewardAPI } from '../services/api';
import toast from 'react-hot-toast';
import { BiTrophy, BiDroplet, BiMapPin } from 'react-icons/bi';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rewardAPI.getLeaderboard()
      .then(res => setLeaders(res.data))
      .catch(() => toast.error('Failed to load leaderboard'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 text-center">
        <BiTrophy size={48} className="mx-auto mb-3 text-yellow-500" />
        <h1 className="section-title">Top Donors Leaderboard</h1>
        <p className="section-subtitle mb-0">Our heroes saving lives through blood donation</p>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-primary-800 dark:border-t-primary-400" />
          </div>
        ) : leaders.length === 0 ? (
          <p className="py-12 text-center text-gray-500 dark:text-gray-400">No donors yet. Be the first!</p>
        ) : (
          <div className="space-y-1">
            {leaders.map((donor, i) => (
              <div key={i} className={`flex items-center justify-between gap-4 rounded-xl p-4 transition-colors ${i < 3 ? 'bg-yellow-50 ring-1 ring-yellow-200 dark:bg-yellow-900/15 dark:ring-yellow-700/50' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                <div className="flex items-center gap-4">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg font-bold ${i < 3 ? '' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{donor.name}</p>
                    <p className="flex items-center gap-1 text-sm text-gray-500"><BiMapPin size={14} /> {donor.city}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="flex items-center gap-1.5">
                    <BiDroplet className="text-primary-500" size={18} />
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{donor.totalDonations}</span>
                  </div>
                  <span className="text-xs text-gray-400">{donor.points} pts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
