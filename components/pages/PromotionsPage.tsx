import React, { useState, useEffect } from 'react';
import { Promotion } from '../../types';
import { getPromotions } from '../../services/mockApi';
import { translations } from '../../constants';

interface PromotionsPageProps {
  language: 'en' | 'my';
}

const PromotionStatusBadge: React.FC<{ startDate: string, endDate: string }> = ({ startDate, endDate }) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let status: 'Active' | 'Scheduled' | 'Expired' = 'Expired';
    let colorClass = 'bg-red-500';

    if (now >= start && now <= end) {
        status = 'Active';
        colorClass = 'bg-green-500';
    } else if (now < start) {
        status = 'Scheduled';
        colorClass = 'bg-blue-500';
    }

    return (
        <span className={`px-2 py-1 text-xs font-bold rounded-full text-white ${colorClass}`}>
            {status}
        </span>
    );
};


const PromotionsPage: React.FC<PromotionsPageProps> = ({ language }) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const t = translations[language];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const promotionData = await getPromotions();
      setPromotions(promotionData);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.promotions} Management</h1>
        <button className="bg-brand-accent text-brand-dark font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 transition duration-300">
          Create Promotion
        </button>
      </div>

      <div className="bg-white dark:bg-brand-secondary shadow-lg rounded-lg overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
          <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-100 dark:bg-brand-light">
            <tr>
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Type</th>
              <th scope="col" className="px-6 py-3">Start Date</th>
              <th scope="col" className="px-6 py-3">End Date</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center p-6">Loading promotions...</td></tr>
            ) : promotions.length > 0 ? (
              promotions.map(promo => (
                <tr key={promo.id} className="border-b border-gray-200 dark:border-brand-light hover:bg-gray-50 dark:hover:bg-brand-light">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{promo.name}</th>
                  <td className="px-6 py-4">{promo.type}</td>
                  <td className="px-6 py-4">{promo.startDate}</td>
                  <td className="px-6 py-4">{promo.endDate}</td>
                  <td className="px-6 py-4">
                    <PromotionStatusBadge startDate={promo.startDate} endDate={promo.endDate} />
                  </td>
                  <td className="px-6 py-4">
                    <button className="font-medium text-brand-accent hover:underline">Edit</button>
                  </td>
                </tr>
              ))
            ) : (
                <tr><td colSpan={6} className="text-center p-6">No promotions found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PromotionsPage;