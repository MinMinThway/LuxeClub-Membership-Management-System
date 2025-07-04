import React, { useState, useEffect } from 'react';
import { Tier, TierRule } from '../../types';
import { getTierRules } from '../../services/mockApi';
import { translations } from '../../constants';
import { XIcon } from '../common/Icons';

interface TierRulesPageProps {
  language: 'en' | 'my';
}

const TierRulesPage: React.FC<TierRulesPageProps> = ({ language }) => {
  const [tierRules, setTierRules] = useState<Record<Tier, TierRule> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const t = translations[language];
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getTierRules();
      setTierRules(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleInputChange = (tier: Tier, field: keyof TierRule, value: any) => {
    if (!tierRules) return;
    setTierRules({
      ...tierRules,
      [tier]: { ...tierRules[tier], [field]: value },
    });
  };
  
  const handleBenefitChange = (tier: Tier, index: number, value: string) => {
    if (!tierRules) return;
    const newBenefits = [...tierRules[tier].benefits];
    newBenefits[index] = value;
    handleInputChange(tier, 'benefits', newBenefits);
  };
  
  const addBenefit = (tier: Tier) => {
      if (!tierRules) return;
      const newBenefits = [...tierRules[tier].benefits, ''];
      handleInputChange(tier, 'benefits', newBenefits);
  }

  const removeBenefit = (tier: Tier, index: number) => {
       if (!tierRules) return;
       const newBenefits = tierRules[tier].benefits.filter((_, i) => i !== index);
       handleInputChange(tier, 'benefits', newBenefits);
  }

  const handleSaveChanges = (tier: Tier) => {
    // In a real app, this would be an API call
    console.log(`Saving changes for ${tier}:`, tierRules?.[tier]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  if (loading) {
    return <div className="p-8 text-gray-700 dark:text-white">Loading Tier Rules...</div>;
  }
  
  if (!tierRules) {
      return <div className="p-8 text-gray-700 dark:text-white">Could not load tier rules.</div>
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
       {showSuccess && (
            <div className="fixed top-20 right-6 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg z-50">
                Changes saved successfully!
            </div>
        )}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tier Rule Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(Object.keys(tierRules) as Tier[]).map(tier => (
          <div key={tier} className="bg-white dark:bg-brand-secondary rounded-lg shadow-lg overflow-hidden">
            <div className={`p-4 ${tierRules[tier].colorClass} flex items-center`}>
              <h2 className={`text-xl font-bold ${tier === Tier.Platinum || tier === Tier.Diamond ? 'text-black' : 'text-white'}`}>{tier} Tier</h2>
            </div>
            <div className="p-6 space-y-4">
                <div>
                    <label className="text-sm font-bold text-gray-600 dark:text-gray-400 block mb-1">Retail Spend to Upgrade (MMK)</label>
                    <input 
                        type="number" 
                        value={tierRules[tier].nextRetail === Infinity ? '' : tierRules[tier].nextRetail}
                        onChange={(e) => handleInputChange(tier, 'nextRetail', Number(e.target.value))}
                        className="w-full p-2 bg-gray-100 dark:bg-brand-light rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        disabled={tier === Tier.Diamond}
                        placeholder={tier === Tier.Diamond ? 'Highest Tier' : 'e.g., 20000000'}
                    />
                </div>
                 <div>
                    <label className="text-sm font-bold text-gray-600 dark:text-gray-400 block mb-1">Wholesale Spend to Upgrade (MMK)</label>
                    <input 
                        type="number" 
                        value={tierRules[tier].nextWholesale === Infinity ? '' : tierRules[tier].nextWholesale}
                        onChange={(e) => handleInputChange(tier, 'nextWholesale', Number(e.target.value))}
                        className="w-full p-2 bg-gray-100 dark:bg-brand-light rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        disabled={tier === Tier.Diamond}
                        placeholder={tier === Tier.Diamond ? 'Highest Tier' : 'e.g., 100000000'}
                    />
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-600 dark:text-gray-400 block mb-2">Benefits</label>
                    <div className="space-y-2">
                        {tierRules[tier].benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input 
                                    type="text"
                                    value={benefit}
                                    onChange={(e) => handleBenefitChange(tier, index, e.target.value)}
                                    className="w-full p-2 bg-gray-100 dark:bg-brand-light rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
                                />
                                <button onClick={() => removeBenefit(tier, index)} className="text-red-500 hover:text-red-700">
                                    <XIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        ))}
                         <button onClick={() => addBenefit(tier)} className="text-sm font-semibold text-brand-accent hover:underline mt-2">
                            + Add Benefit
                        </button>
                    </div>
                </div>
                 <div className="text-right pt-2">
                    <button onClick={() => handleSaveChanges(tier)} className="bg-brand-accent text-brand-dark font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 transition duration-300">
                        Save Changes
                    </button>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TierRulesPage;