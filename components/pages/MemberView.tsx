import React, { useState, useEffect } from 'react';
import { Member, Reward, Tier, Product } from '../../types';
import { getMemberById, getRewards, getProducts } from '../../services/mockApi';
import { TIER_DATA, translations } from '../../constants';
import TierBadge from '../common/TierBadge';
import { UserCircleIcon, GiftIcon, LogoutIcon, MailIcon, PhoneIcon, IdentificationIcon, LocationMarkerIcon, DashboardIcon, TagIcon, CalendarIcon, QrcodeIcon, ClipboardListIcon, ShoppingCartIcon } from '../common/Icons';
import QRCode from 'qrcode';
import LanguageToggle from '../common/LanguageToggle';
import ThemeToggle from '../common/ThemeToggle';

type Theme = 'light' | 'dark';

interface MemberViewProps {
  memberId: string;
  onLogout: () => void;
  language: 'en' | 'my';
  theme: Theme;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: 'en' | 'my') => void;
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

const MemberView: React.FC<MemberViewProps> = ({ memberId, onLogout, language, theme, setTheme, setLanguage }) => {
  const [member, setMember] = useState<Member | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
  const [regularProducts, setRegularProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'shop' | 'store' | 'profile'>('dashboard');
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
      
      const productData = await getProducts();
      setDiscountedProducts(productData.filter(p => p.discountPrice));
      setRegularProducts(productData.filter(p => !p.discountPrice));
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

  const renderDashboard = () => (
    <div className="p-4 sm:p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.welcome}, {member.name.split(' ')[0]}!</h1>
        
        <div className="bg-white dark:bg-brand-secondary p-6 rounded-lg shadow-lg space-y-4">
             <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Your Tier</h3>
                    <TierBadge tier={member.tier} />
                </div>
                <div className="text-right">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{t.points}</h3>
                    <p className="text-2xl font-bold text-brand-accent">{member.points.toLocaleString()}</p>
                </div>
            </div>
            {tier !== Tier.Diamond && (
                <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t.tierProgress}</h3>
                    <ProgressBar value={retailSpend} max={nextTierSpend} />
                     <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>{retailSpend.toLocaleString()} MMK</span>
                        <span>{spendForNextTier.toLocaleString()} MMK {t.nextTier}</span>
                    </div>
                </div>
            )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <DashboardActionCard icon={QrcodeIcon} label={t.myQRCode} />
            <DashboardActionCard icon={TagIcon} label={t.promotions} />
            <DashboardActionCard icon={CalendarIcon} label={t.events} />
            <DashboardActionCard icon={ClipboardListIcon} label={t.transactionHistory} />
        </div>
    </div>
  );

  const DashboardActionCard: React.FC<{icon: React.ElementType, label: string}> = ({icon: Icon, label}) => (
    <button className="bg-white dark:bg-brand-secondary p-4 rounded-lg shadow-lg flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 dark:hover:bg-brand-light transition-all duration-200 aspect-square">
        <Icon className="w-8 h-8 text-brand-accent" />
        <span className="text-sm font-semibold text-center text-gray-700 dark:text-gray-200">{label}</span>
    </button>
  );
  
  const renderProfile = () => (
    <div className="p-4 sm:p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.myProfile}</h1>
        
        <div className="bg-white dark:bg-brand-secondary p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t.personalInformation}</h2>
            <ul className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start"><MailIcon className="w-5 h-5 mr-4 mt-1 text-brand-accent flex-shrink-0" /><div><span className="font-semibold text-gray-500 dark:text-gray-400 block">{t.emailAddress}</span><span>{member.email}</span></div></li>
                <li className="flex items-start"><PhoneIcon className="w-5 h-5 mr-4 mt-1 text-brand-accent flex-shrink-0" /><div><span className="font-semibold text-gray-500 dark:text-gray-400 block">{t.phoneNumber}</span><span>{member.phone}</span></div></li>
                <li className="flex items-start"><IdentificationIcon className="w-5 h-5 mr-4 mt-1 text-brand-accent flex-shrink-0" /><div><span className="font-semibold text-gray-500 dark:text-gray-400 block">{t.nrc}</span><span>{member.nrc}</span></div></li>
                <li className="flex items-start"><LocationMarkerIcon className="w-5 h-5 mr-4 mt-1 text-brand-accent flex-shrink-0" /><div><span className="font-semibold text-gray-500 dark:text-gray-400 block">{t.address}</span><span className="whitespace-pre-wrap">{member.address}</span></div></li>
            </ul>
        </div>

        <div className="bg-white dark:bg-brand-secondary p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t.benefits}</h2>
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
             <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t.settings}</h2>
             <div className="flex items-center justify-between">
                <ThemeToggle theme={theme} setTheme={setTheme} />
                <LanguageToggle language={language} setLanguage={setLanguage} />
             </div>
        </div>

        <button onClick={onLogout} className="w-full flex items-center justify-center space-x-2 text-red-500 bg-white dark:bg-brand-secondary p-3 rounded-lg shadow-lg font-bold">
            <LogoutIcon className="w-5 h-5"/>
            <span>{t.logout}</span>
        </button>
    </div>
  );

  const renderShop = () => (
    <div className="p-4 sm:p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t.pointShop}</h1>
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

  const DiscountSlider: React.FC<{ products: Product[] }> = ({ products }) => {
    if (!products || products.length === 0) return null;
    const extendedProducts = [...products, ...products]; // Duplicate for seamless loop

    const DiscountCard: React.FC<{product: Product}> = ({product}) => (
        <div className="bg-white dark:bg-brand-light rounded-xl shadow-md overflow-hidden h-full flex flex-col">
            <img src={product.imageUrls[0]} alt={product.name} className="w-full h-32 object-cover" />
            <div className="p-3 flex flex-col flex-grow">
                <h3 className="font-bold text-gray-800 dark:text-white text-sm truncate">{product.name}</h3>
                <div className="mt-2 flex-grow flex items-end justify-between">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-through">{product.price.toLocaleString()} MMK</p>
                        <p className="text-red-500 dark:text-red-400 font-bold text-lg">{product.discountPrice?.toLocaleString()} MMK</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
      <div className="w-full overflow-hidden group">
        <div className="flex animate-infinite-scroll group-hover:[animation-play-state:paused]">
          {extendedProducts.map((product, index) => (
            <div key={`${product.id}-${index}`} className="flex-shrink-0 w-52 sm:w-60 mx-3">
              <DiscountCard product={product} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEcommerceStore = () => (
    <div className="p-4 sm:p-6 space-y-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.store}</h1>
        
        {discountedProducts.length > 0 && (
            <div className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-brand-accent">Special Discounts</h2>
                <DiscountSlider products={discountedProducts} />
            </div>
        )}
        
        <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-4">All Products</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 md:gap-6">
                {regularProducts.map((product) => (
                    <div key={product.id} className="bg-white dark:bg-brand-secondary rounded-xl shadow-lg overflow-hidden flex flex-col group">
                        <img src={product.imageUrls[0]} alt={product.name} className="w-full h-32 sm:h-48 md:h-56 object-cover" />
                        <div className="p-3 sm:p-4 flex flex-col flex-grow">
                            <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate group-hover:whitespace-normal">{product.name}</h3>
                            <div className="mt-3 flex-grow flex flex-col justify-end">
                                <p className="text-brand-accent font-bold text-base sm:text-lg">{product.price.toLocaleString()}&nbsp;<span className="text-xs font-semibold">MMK</span></p>
                                <button className="mt-2 w-full bg-brand-accent text-brand-dark font-bold py-1.5 px-3 rounded-md hover:bg-yellow-500 transition duration-300 text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                                    <ShoppingCartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span>{t.addToCart}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );

  type NavTab = 'dashboard' | 'shop' | 'store' | 'profile';
  const NavButton: React.FC<{
    label: string;
    icon: React.ElementType;
    tabName: NavTab;
  }> = ({ label, icon: Icon, tabName }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className="flex flex-col items-center justify-center w-1/4 h-full"
      aria-label={label}
    >
      <Icon className={`w-6 h-6 mb-1 transition-colors ${activeTab === tabName ? 'text-brand-accent' : 'text-gray-500 dark:text-gray-400'}`} />
      <span className={`text-xs font-medium transition-colors ${activeTab === tabName ? 'text-brand-accent' : 'text-gray-600 dark:text-gray-300'}`}>
        {label}
      </span>
    </button>
  );

  return (
    <div className="pb-20">
      {showBirthday && <BirthdayModal onClose={() => setShowBirthday(false)} language={language} />}
      {qrModalData && <QRCodeModal {...qrModalData} onClose={() => setQrModalData(null)} />}
      
      <div className="min-h-screen">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'shop' && renderShop()}
        {activeTab === 'store' && renderEcommerceStore()}
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-brand-secondary/90 backdrop-blur-sm border-t border-gray-200 dark:border-brand-light shadow-[0_-4px_15px_rgba(0,0,0,0.1)] z-40">
          <div className="flex justify-around items-center h-full">
            <NavButton label={t.dashboard} icon={DashboardIcon} tabName="dashboard" />
            <NavButton label={t.pointShop} icon={GiftIcon} tabName="shop" />
            <NavButton label={t.store} icon={ShoppingCartIcon} tabName="store" />
            <NavButton label={t.profile} icon={UserCircleIcon} tabName="profile" />
          </div>
      </div>
    </div>
  );
};

export default MemberView;