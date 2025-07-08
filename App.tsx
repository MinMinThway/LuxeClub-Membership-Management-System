
import React, { useState, useEffect } from 'react';
import { Page, Language } from './types';
import LoginPage from './components/pages/LoginPage';
import AdminDashboard from './components/pages/AdminDashboard';
import MembersPage from './components/pages/MembersPage';
import RewardsAdminPage from './components/pages/RewardsAdminPage';
import MemberView from './components/pages/MemberView';
import { translations } from './constants';
import { DashboardIcon, UsersIcon, GiftIcon, LogoutIcon, XIcon, TagIcon, ChartBarIcon, CalendarIcon, ScaleIcon, BellIcon, ShoppingCartIcon, ClipboardListIcon, ReceiptIcon, EyeIcon, UserCircleIcon, GridIcon } from './components/common/Icons';
import LanguageToggle from './components/common/LanguageToggle';
import ThemeToggle from './components/common/ThemeToggle';
import PromotionsPage from './components/pages/PromotionsPage';
import AnalyticsPage from './components/pages/AnalyticsPage';
import EventsPage from './components/pages/EventsPage';
import TierRulesPage from './components/pages/TierRulesPage';
import NotificationsPage from './components/pages/NotificationsPage';
import EcommerceAdminPage from './components/pages/EcommerceAdminPage';
import MemberReportsPage from './components/pages/MemberReportsPage';
import FinancialReportsPage from './components/pages/FinancialReportsPage';
import EngagementActivityReportsPage from './components/pages/EngagementActivityReportsPage';

type Theme = 'light' | 'dark';

const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
);


const App: React.FC = () => {
    const [page, setPage] = useState<Page>('login');
    const [userRole, setUserRole] = useState<'admin' | 'member' | null>(null);
    const [language, setLanguage] = useState<Language>('en');
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const storedTheme = window.localStorage.getItem('theme');
            if (storedTheme === 'light' || storedTheme === 'dark') {
                return storedTheme;
            }
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleLogin = (role: 'admin' | 'member') => {
        setUserRole(role);
        if (role === 'admin') {
            setPage('dashboard');
        } else {
            setPage('member-view');
        }
    };

    const handleLogout = () => {
        setUserRole(null);
        setPage('login');
    };

    const t = translations[language];

    const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        const [adminMobileTab, setAdminMobileTab] = useState<'dashboard' | 'menu' | 'profile'>('dashboard');

        const navItems = [
            { id: 'dashboard', label: t.dashboard, icon: DashboardIcon, page: 'dashboard' as Page },
            { id: 'members', label: t.members, icon: UsersIcon, page: 'members' as Page },
            { id: 'member-reports', label: t.memberReports, icon: ClipboardListIcon, page: 'member-reports' as Page },
            { id: 'financial-reports', label: t.financialReports, icon: ReceiptIcon, page: 'financial-reports' as Page },
            { id: 'engagement-reports', label: t.engagementReports, icon: EyeIcon, page: 'engagement-reports' as Page },
            { id: 'analytics', label: t.analytics, icon: ChartBarIcon, page: 'analytics' as Page },
            { id: 'rewards', label: t.rewards, icon: GiftIcon, page: 'rewards' as Page },
            { id: 'promotions', label: t.promotions, icon: TagIcon, page: 'promotions' as Page },
            { id: 'ecommerce', label: t.ecommerce, icon: ShoppingCartIcon, page: 'ecommerce-admin' as Page },
            { id: 'events', label: t.events, icon: CalendarIcon, page: 'events' as Page },
            { id: 'notifications', label: t.notifications, icon: BellIcon, page: 'notifications' as Page },
            { id: 'tier-rules', label: t.tierRules, icon: ScaleIcon, page: 'tier-rules' as Page },
        ];

        const handleNavClick = (page: Page) => {
            setPage(page);
        };

        const menuNavItems = navItems.filter(item => item.page !== 'dashboard');

        const AdminMenuGrid = () => (
            <div className="p-4">
                <div className="grid grid-cols-4 gap-3">
                    {menuNavItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item.page)}
                            className="bg-white dark:bg-brand-secondary rounded-xl p-2 flex flex-col items-center justify-center aspect-square text-center transition-transform transform hover:scale-105 shadow-lg"
                            aria-label={item.label}
                        >
                            <item.icon className="w-7 h-7 sm:w-8 sm:h-8 text-brand-accent mb-2" />
                            <span className="text-gray-700 dark:text-gray-200 text-[10px] sm:text-xs font-semibold leading-tight text-center">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        );

        const AdminProfilePage = () => (
            <div className="p-4 sm:p-6 space-y-6">
                <div className="bg-white dark:bg-brand-secondary p-6 rounded-lg shadow-lg">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Admin Profile</h2>
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full bg-brand-accent flex items-center justify-center">
                            <UserCircleIcon className="w-10 h-10 text-brand-dark" />
                        </div>
                        <div>
                            <p className="font-bold text-lg text-gray-900 dark:text-white">Admin User</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">admin@luxeclub.com</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full mt-8 flex items-center justify-center space-x-2 text-red-500 bg-red-500/10 p-3 rounded-lg font-bold hover:bg-red-500/20"
                    >
                        <LogoutIcon className="w-5 h-5" />
                        <span>{t.logout}</span>
                    </button>
                </div>
            </div>
        );


        const SidebarContent = () => (
            <>
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    {/* <div className="text-2xl font-bold text-brand-accent">LuxeClub</div> */}
                    <img
                        src="/images/WhiteLogo.png"
                        alt="Logo"
                        className="h-12 w-12 sm:h-16 sm:w-16 object-contain border-2 border-brand-accent rounded-lg shadow-md"
                    />
                </div>
                <nav className="flex-grow p-4">
                    <ul>
                        {navItems.map(item => (
                            <li key={item.id} className="mb-2">
                                <button
                                    onClick={() => handleNavClick(item.page)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${page === item.page ? 'bg-brand-accent text-brand-dark' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-brand-light'}`}
                                >
                                    <item.icon className="w-6 h-6" />
                                    <span className="font-semibold">{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-brand-light"
                    >
                        <LogoutIcon className="w-6 h-6" />
                        <span className="font-semibold">{t.logout}</span>
                    </button>
                </div>
            </>
        );

        type AdminNavTab = 'dashboard' | 'menu' | 'profile';
        const AdminNavButton: React.FC<{ label: string; icon: React.ElementType; tabName: AdminNavTab; }> = ({ label, icon: Icon, tabName }) => (
            <button
                onClick={() => setAdminMobileTab(tabName)}
                className="flex flex-col items-center justify-center w-1/3 h-full"
                aria-label={label}
            >
                <Icon className={`w-6 h-6 mb-1 transition-colors ${adminMobileTab === tabName ? 'text-brand-accent' : 'text-gray-500 dark:text-gray-400'}`} />
                <span className={`text-xs font-medium transition-colors ${adminMobileTab === tabName ? 'text-brand-accent' : 'text-gray-600 dark:text-gray-300'}`}>
                    {label}
                </span>
            </button>
        );

        return (
            <div className={`min-h-screen flex text-gray-800 dark:text-white ${language === 'my' ? 'font-padauk' : 'font-sans'}`}>
                {/* Sidebar for Desktop */}
                <aside className="hidden w-64 flex-col bg-white dark:bg-brand-secondary md:flex">
                    <SidebarContent />
                </aside>

                <main className="flex-1 flex flex-col bg-gray-100 dark:bg-brand-dark">
                    <header className="bg-white dark:bg-brand-secondary p-4 flex justify-between items-center space-x-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
                        <div className="flex items-center min-w-0">
                            {/* Mobile: Back button or Tab Title */}
                            <div className="md:hidden">
                                {page !== 'dashboard' ? (
                                    <button onClick={() => { setPage('dashboard'); setAdminMobileTab('menu'); }} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 min-w-0">
                                        <ArrowLeftIcon className="w-5 h-5 flex-shrink-0" />
                                        <span className="font-semibold truncate">{navItems.find(i => i.page === page)?.label || 'Back'}</span>
                                    </button>
                                ) : (
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{adminMobileTab}</h1>
                                )}
                            </div>
                            {/* Desktop: Page Title */}
                            <h1 className="hidden md:block text-xl font-bold text-gray-900 dark:text-white">
                                {navItems.find(i => i.page === page)?.label || 'Dashboard'}
                            </h1>
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <ThemeToggle theme={theme} setTheme={setTheme} />
                            <LanguageToggle language={language} setLanguage={setLanguage} />
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
                        {/* Desktop View always renders children from App */}
                        <div className="hidden md:block h-full">
                            {children}
                        </div>

                        {/* Mobile View logic */}
                        <div className="md:hidden h-full">
                            {page === 'dashboard' ? (
                                <>
                                    {adminMobileTab === 'dashboard' && <AdminDashboard language={language} theme={theme} />}
                                    {adminMobileTab === 'menu' && <AdminMenuGrid />}
                                    {adminMobileTab === 'profile' && <AdminProfilePage />}
                                </>
                            ) : (
                                // For sub-pages like Members, Rewards, etc.
                                children
                            )}
                        </div>
                    </div>

                    {/* Mobile Bottom Nav */}
                    {page === 'dashboard' && (
                        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-brand-secondary/90 backdrop-blur-sm border-t border-gray-200 dark:border-brand-light shadow-[0_-4px_15px_rgba(0,0,0,0.1)] z-40">
                            <div className="flex justify-around items-center h-full">
                                <AdminNavButton label={t.dashboard} icon={DashboardIcon} tabName="dashboard" />
                                <AdminNavButton label={t.menu} icon={GridIcon} tabName="menu" />
                                <AdminNavButton label={t.profile} icon={UserCircleIcon} tabName="profile" />
                            </div>
                        </div>
                    )}
                </main>
            </div>
        );
    };

    const MemberLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        return (
            <div className={`min-h-screen bg-gray-100 dark:bg-brand-dark text-gray-800 dark:text-white ${language === 'my' ? 'font-padauk' : 'font-sans'}`}>
                {children}
            </div>
        )
    }

    
    const renderPage = () => {
        if (page === 'login') {
            return <LoginPage onLogin={handleLogin} language={language} setLanguage={setLanguage} theme={theme} setTheme={setTheme} />;
        }

        if (userRole === 'admin') {
            let currentPageComponent;
            switch (page) {
                case 'dashboard':
                    currentPageComponent = <AdminDashboard language={language} theme={theme} />;
                    break;
                case 'members':
                    currentPageComponent = <MembersPage language={language} />;
                    break;
                case 'rewards':
                    currentPageComponent = <RewardsAdminPage language={language} />;
                    break;
                case 'promotions':
                    currentPageComponent = <PromotionsPage language={language} />;
                    break;
                case 'events':
                    currentPageComponent = <EventsPage language={language} />;
                    break;
                case 'tier-rules':
                    currentPageComponent = <TierRulesPage language={language} />;
                    break;
                case 'notifications':
                    currentPageComponent = <NotificationsPage language={language} />;
                    break;
                case 'ecommerce-admin':
                    currentPageComponent = <EcommerceAdminPage language={language} />;
                    break;
                case 'analytics':
                    currentPageComponent = <AnalyticsPage language={language} theme={theme} />;
                    break;
                case 'member-reports':
                    currentPageComponent = <MemberReportsPage language={language} />;
                    break;
                case 'financial-reports':
                    currentPageComponent = <FinancialReportsPage language={language} theme={theme} />;
                    break;
                case 'engagement-reports':
                    currentPageComponent = <EngagementActivityReportsPage language={language} />;
                    break;
                default:
                    currentPageComponent = <AdminDashboard language={language} theme={theme} />;
            }
            return <AdminLayout>{currentPageComponent}</AdminLayout>;
        }

        if (userRole === 'member' && page === 'member-view') {
            return (
                <MemberLayout>
                    <MemberView
                        memberId="MEM002"
                        onLogout={handleLogout}
                        language={language}
                        theme={theme}
                        setTheme={setTheme}
                        setLanguage={setLanguage}
                    />
                </MemberLayout>
            );
        }

        // Fallback to login if state is inconsistent
        return <LoginPage onLogin={handleLogin} language={language} setLanguage={setLanguage} theme={theme} setTheme={setTheme} />;
    };

    return <>{renderPage()}</>;
};

export default App;
