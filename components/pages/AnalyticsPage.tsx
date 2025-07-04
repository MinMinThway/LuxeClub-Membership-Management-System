import React from 'react';
import { translations } from '../../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsPageProps {
  language: 'en' | 'my';
  theme: 'light' | 'dark';
}

const memberGrowthData = [
  { month: 'Jan', new: 150 },
  { month: 'Feb', new: 180 },
  { month: 'Mar', new: 220 },
  { month: 'Apr', new: 210 },
  { month: 'May', new: 250 },
  { month: 'Jun', new: 230 },
];

const spendByTierData = [
  { tier: 'Normal', avgSpend: 50000 },
  { tier: 'Gold', avgSpend: 150000 },
  { tier: 'Platinum', avgSpend: 300000 },
  { tier: 'Diamond', avgSpend: 750000 },
];

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ language, theme }) => {
  const t = translations[language];
  const axisColor = theme === 'dark' ? '#a0aec0' : '#6b7280';
  const gridColor = theme === 'dark' ? '#4a5568' : '#e5e7eb';
  const tooltipBg = theme === 'dark' ? '#2d3748' : '#ffffff';
  const tooltipColor = theme === 'dark' ? '#ffffff' : '#1a202c';
  const tooltipCursor = theme === 'dark' ? '#4a5568' : '#f3f4f6';

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Analytics</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-brand-secondary p-6 rounded-lg shadow-lg">
          <h3 className="text-gray-900 dark:text-white font-bold mb-4">Member Growth (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={memberGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" stroke={axisColor} />
              <YAxis stroke={axisColor} />
              <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: 'none', color: tooltipColor }} cursor={{ fill: tooltipCursor }}/>
              <Legend wrapperStyle={{ color: axisColor }}/>
              <Bar dataKey="new" fill="#82ca9d" name="New Members" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-brand-secondary p-6 rounded-lg shadow-lg">
          <h3 className="text-gray-900 dark:text-white font-bold mb-4">Average Spend per Tier (MMK)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={spendByTierData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis type="number" stroke={axisColor} />
              <YAxis type="category" dataKey="tier" stroke={axisColor} width={80} />
              <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: 'none', color: tooltipColor }} cursor={{ fill: tooltipCursor }}/>
              <Legend wrapperStyle={{ color: axisColor }}/>
              <Bar dataKey="avgSpend" fill="#8884d8" name="Average Spend" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

       <div className="bg-white dark:bg-brand-secondary p-6 rounded-lg shadow-lg">
          <h3 className="text-gray-900 dark:text-white font-bold mb-4">More Analytics Coming Soon...</h3>
          <p className="text-gray-600 dark:text-gray-400">
            We are working on adding more detailed analytics, including customer lifetime value,
            redemption frequency, and campaign performance tracking. Stay tuned!
          </p>
      </div>

    </div>
  );
};

export default AnalyticsPage;