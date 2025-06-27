import React, { useState, useEffect } from 'react';
import { Reward } from '../../types';
import { getRewards } from '../../services/mockApi';
import { translations } from '../../constants';

interface RewardsAdminPageProps {
  language: 'en' | 'my';
}

const RewardsAdminPage: React.FC<RewardsAdminPageProps> = ({ language }) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const t = translations[language];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const rewardData = await getRewards();
      setRewards(rewardData);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.rewards} Management</h1>
        <button className="bg-brand-accent text-brand-dark font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 transition duration-300">
          Add New Reward
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-gray-700 dark:text-white">Loading rewards...</p>
        ) : (
          rewards.map(reward => (
            <div key={reward.id} className="bg-white dark:bg-brand-secondary rounded-lg shadow-lg overflow-hidden">
              <img className="w-full h-40 object-cover" src={reward.imageUrl} alt={reward.name} />
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{reward.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{reward.type}</p>
                <div className="mt-4 flex justify-between items-center">
                  <div>
                    <p className="text-brand-accent font-bold text-xl">{reward.pointsCost.toLocaleString()} {t.points}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Stock: {reward.stock}</p>
                  </div>
                  <button className="bg-gray-200 dark:bg-brand-light text-gray-800 dark:text-white text-sm font-semibold py-2 px-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RewardsAdminPage;