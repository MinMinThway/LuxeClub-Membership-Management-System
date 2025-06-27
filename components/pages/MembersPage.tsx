import React, { useState, useEffect } from 'react';
import { Member } from '../../types';
import { getMembers } from '../../services/mockApi';
import TierBadge from '../common/TierBadge';
import { SearchIcon } from '../common/Icons';
import { translations } from '../../constants';

interface MembersPageProps {
  language: 'en' | 'my';
}

const MembersPage: React.FC<MembersPageProps> = ({ language }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const t = translations[language];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const memberData = await getMembers();
      setMembers(memberData);
      setFilteredMembers(memberData);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const results = members.filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm)
    );
    setFilteredMembers(results);
  }, [searchTerm, members]);

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t.memberList}</h1>
      <div className="relative mb-6">
        <input
          type="text"
          placeholder={t.searchMember}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-brand-light text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-accent"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <SearchIcon className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="bg-white dark:bg-brand-secondary shadow-lg rounded-lg overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
          <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-100 dark:bg-brand-light">
            <tr>
              <th scope="col" className="px-6 py-3">{t.name}</th>
              <th scope="col" className="px-6 py-3">{t.tier}</th>
              <th scope="col" className="px-6 py-3">{t.points}</th>
              <th scope="col" className="px-6 py-3">{t.joinDate}</th>
              <th scope="col" className="px-6 py-3">{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center p-6">Loading members...</td></tr>
            ) : filteredMembers.length > 0 ? (
              filteredMembers.map(member => (
                <tr key={member.id} className="border-b border-gray-200 dark:border-brand-light hover:bg-gray-50 dark:hover:bg-brand-light">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{member.name}</th>
                  <td className="px-6 py-4"><TierBadge tier={member.tier} /></td>
                  <td className="px-6 py-4">{member.points.toLocaleString()}</td>
                  <td className="px-6 py-4">{member.joinDate}</td>
                  <td className="px-6 py-4">
                    <button className="font-medium text-brand-accent hover:underline">{t.viewDetails}</button>
                  </td>
                </tr>
              ))
            ) : (
                <tr><td colSpan={5} className="text-center p-6">No members found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MembersPage;