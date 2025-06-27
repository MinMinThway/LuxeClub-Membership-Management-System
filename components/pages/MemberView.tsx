import React, { useState, useEffect } from 'react';
import { Member, Reward, Tier } from '../../types';
import { getMemberById, getRewards } from '../../services/mockApi';
import { TIER_DATA, translations } from '../../constants';
import TierBadge from '../common/TierBadge';
import { CakeIcon, UserCircleIcon, GiftIcon, LogoutIcon, MailIcon, PhoneIcon, IdentificationIcon, LocationMarkerIcon } from '../common/Icons';
import QRCode from 'qrcode';

interface MemberViewProps {
  memberId: string;
  onLogout: () => void;
  language: 'en' | 'my';
}

const ProgressBar: React.FC<{ value: number; max: number; }> = ({ value, max }) => {
    const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div className="w-full bg-gray-200 dark:bg-brand-light rounded-full h-2.5">
            <div className="bg-brand-accent h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

const BirthdayModal: React.FC<{ onClose: () => void; language: 'en' | 'my' }> = ({ onClose, language }) => {
    const t = translations[language];
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-white to-gray-100 dark:from-brand-secondary dark:to-brand-dark p-8 rounded-2xl shadow-2xl text-center max-w-sm mx-auto border border-brand-accent">
                <CakeIcon className="w-16 h-16 text-brand-accent mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.birthdayTitle}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{t.birthdayMessage}</p>
                <button onClick={onClose} className="bg-brand-accent text-brand-dark font-bold py-2 px-6 rounded-lg hover:bg-yellow-500 transition duration-300">
                    Awesome!
                </button>
            </div>
        </div>
    );
};

const QRCodeModal: React.FC<{
    reward: Reward;
    qrCodeUrl: string;
    onClose: () => void;
}> = ({ reward, qrCodeUrl, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-brand-secondary p-6 rounded-2xl shadow-2xl text-center max-w-sm mx-auto border border-brand-accent relative" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Redemption QR Code</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Show this QR code at the counter to claim your reward.</p>
                <div className="p-4 bg-white rounded-lg inline-block">
                    <img src={qrCodeUrl} alt="QR Code for reward redemption" className="w-48 h-48 mx-auto" />
                </div>
                <div className="mt-4 text-left">
                    <img src={reward.imageUrl} alt={reward.name} className="w-full h-32 object-cover rounded-lg mb-2" />
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">{reward.name}</h3>
                    <p className="text-brand-accent font-semibold">{reward.pointsCost.toLocaleString()} Points</p>
                </div>
                <button onClick={onClose} className="mt-6 bg-brand-accent text-brand-dark font-bold py-2 px-6 rounded-lg hover:bg-yellow-500 transition duration-300 w-full">
                    Close
                </button>
            </div>
        </div>
    );
};

const MemberView: React.FC<MemberViewProps> = ({ memberId, onLogout, language }) => {
  const [member, setMember] = useState<Member | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'shop'>('profile');
  const [showBirthday, setShowBirthday] = useState(false);
  const [qrModalData, setQrModalData] = useState<{ reward: Reward; qrCodeUrl: string } | null>(null);
  const t = translations[language];

  useEffect(() => {
    const fetchData = async () => {
      const memberData = await getMemberById(memberId);
      if (memberData) {
        setMember(memberData);
        if (memberData.isBirthday) {
            setShowBirthday(true);
        }
      }
      const rewardData = await getRewards();
      setRewards(rewardData);
    };
    fetchData();
  }, [memberId]);
  
  const handleRedeem = async (reward: Reward) => {
    if (!member || member.points < reward.pointsCost) return;

    const redemptionData = {
        memberId: member.id,
        rewardId: reward.id,
        name: member.name,
        rewardName: reward.name,
        timestamp: new Date().toISOString(),
    };

    try {
        const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(redemptionData), {
            width: 256,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        });
        setQrModalData({ reward, qrCodeUrl });
        // In a real app, you would deduct points here and record the transaction.
        // For this mock, we'll just show the QR code.
    } catch (err) {
        console.error('Failed to generate QR code', err);
        alert('Could not generate QR code for redemption.');
    }
  };

  if (!member) {
    return <div className="p-8 text-center text-gray-600 dark:text-gray-300">Loading member data...</div>;
  }

  const { tier, retailSpend } = member;
  const tierInfo = TIER_DATA[tier];
  const nextTierSpend = tierInfo.nextRetail;
  const spendForNextTier = Math.max(0, nextTierSpend - retailSpend);
  
  const renderProfile = () => (
    <div className="space-y-6">
        <div className="bg-white dark:bg-brand-secondary p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t.myProfile}</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <UserCircleIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                <div className="flex-grow">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{member.name}</h3>
                    <div className="mt-1"><TierBadge tier={member.tier} /></div>
                </div>
                <div className="w-full sm:w-auto text-left sm:text-right bg-gray-100 dark:bg-brand-light p-3 rounded-lg flex-shrink-0">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t.points}</p>
                    <p className="text-2xl font-bold text-brand-accent">{member.points.toLocaleString()}</p>
                </div>
            </div>
        </div>

        <div className="bg-white dark:bg-brand-secondary p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t.personalInformation}</h3>
            <ul className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                    <MailIcon className="w-5 h-5 mr-4 mt-1 text-brand-accent flex-shrink-0" />
                    <div>
                        <span className="font-semibold text-gray-500 dark:text-gray-400 block">{t.emailAddress}</span>
                        <span>{member.email}</span>
                    </div>
                </li>
                <li className="flex items-start">
                    <PhoneIcon className="w-5 h-5 mr-4 mt-1 text-brand-accent flex-shrink-0" />
                    <div>
                        <span className="font-semibold text-gray-500 dark:text-gray-400 block">{t.phoneNumber}</span>
                        <span>{member.phone}</span>
                    </div>
                </li>
                <li className="flex items-start">
                    <IdentificationIcon className="w-5 h-5 mr-4 mt-1 text-brand-accent flex-shrink-0" />
                    <div>
                        <span className="font-semibold text-gray-500 dark:text-gray-400 block">{t.nrc}</span>
                        <span>{member.nrc}</span>
                    </div>
                </li>
                <li className="flex items-start">
                    <LocationMarkerIcon className="w-5 h-5 mr-4 mt-1 text-brand-accent flex-shrink-0" />
                    <div>
                        <span className="font-semibold text-gray-500 dark:text-gray-400 block">{t.address}</span>
                        <span className="whitespace-pre-wrap">{member.address}</span>
                    </div>
                </li>
            </ul>
        </div>

        <div className="bg-white dark:bg-brand-secondary p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t.tierProgress}</h3>
            {tier !== Tier.Diamond ? (
                <>
                    <ProgressBar value={retailSpend} max={nextTierSpend} />
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                        <span>{t.currentSpend}: {retailSpend.toLocaleString()} MMK</span>
                        <span>{spendForNextTier.toLocaleString()} MMK {t.nextTier}</span>
                    </div>
                </>
            ) : (
                <p className="text-gray-900 dark:text-white">You are at the highest tier!</p>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-brand-secondary p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t.benefits}</h3>
                <ul className="space-y-2">
                    {tierInfo.benefits.map(benefit => (
                        <li key={benefit} className="flex items-center text-gray-700 dark:text-gray-300">
                            <GiftIcon className="w-5 h-5 mr-3 text-brand-accent" />
                            {benefit}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="bg-white dark:bg-brand-secondary p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t.notifications}</h3>
                <div className="space-y-3">
                    <div className="bg-gray-100 dark:bg-brand-light p-3 rounded-lg">
                        <p className="font-semibold text-gray-800 dark:text-white">🎉 Weekend Double Points</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Earn 2x points on all purchases this Saturday & Sunday!</p>
                    </div>
                     <div className="bg-gray-100 dark:bg-brand-light p-3 rounded-lg">
                        <p className="font-semibold text-gray-800 dark:text-white">🎂 Your Birthday Gift</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t.birthdayMessage}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  const renderShop = () => (
    <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t.pointShop}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map(reward => (
                <div key={reward.id} className="bg-white dark:bg-brand-secondary rounded-lg shadow-lg overflow-hidden flex flex-col">
                    <img className="w-full h-40 object-cover" src={reward.imageUrl} alt={reward.name} />
                    <div className="p-4 flex flex-col flex-grow">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex-grow">{reward.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{reward.type}</p>
                        <div className="mt-4 flex justify-between items-center">
                            <p className="text-brand-accent font-bold text-xl">{reward.pointsCost.toLocaleString()} {t.points}</p>
                            <button onClick={() => handleRedeem(reward)} className="bg-brand-accent text-brand-dark font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 transition duration-300 text-sm disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed" disabled={member.points < reward.pointsCost}>
                                {t.redeem}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6">
      {showBirthday && <BirthdayModal onClose={() => setShowBirthday(false)} language={language} />}
      {qrModalData && <QRCodeModal {...qrModalData} onClose={() => setQrModalData(null)} />}
      <header className="flex justify-between items-center mb-6">
        <div className="flex space-x-2 bg-gray-200 dark:bg-brand-secondary p-1 rounded-lg">
            <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-md font-semibold text-sm ${activeTab === 'profile' ? 'bg-white dark:bg-brand-light shadow' : 'text-gray-700 dark:text-gray-300'}`}>{t.profile}</button>
            <button onClick={() => setActiveTab('shop')} className={`px-4 py-2 rounded-md font-semibold text-sm ${activeTab === 'shop' ? 'bg-white dark:bg-brand-light shadow' : 'text-gray-700 dark:text-gray-300'}`}>{t.pointShop}</button>
        </div>
        <button onClick={onLogout} className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            <LogoutIcon className="w-5 h-5"/>
            <span className="hidden sm:inline">{t.logout}</span>
        </button>
      </header>
      
      {activeTab === 'profile' ? renderProfile() : renderShop()}
    </div>
  );
};

export default MemberView;
