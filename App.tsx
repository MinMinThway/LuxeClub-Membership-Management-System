import React, { useState, useEffect } from 'react';
import { Page, Language } from './types';
import LoginPage from './components/pages/LoginPage';
import AdminDashboard from './components/pages/AdminDashboard';
import MembersPage from './components/pages/MembersPage';
import RewardsAdminPage from './components/pages/RewardsAdminPage';
import MemberView from './components/pages/MemberView';
import { translations } from './constants';
import { DashboardIcon, UsersIcon, GiftIcon, LogoutIcon, MenuAlt2Icon, XIcon } from './components/common/Icons';
import LanguageToggle from './components/common/LanguageToggle';
import ThemeToggle from './components/common/ThemeToggle';

type Theme = 'light' | 'dark';

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
        const [isSidebarOpen, setIsSidebarOpen] = useState(false);

        const navItems = [
            { id: 'dashboard', label: t.dashboard, icon: DashboardIcon, page: 'dashboard' as Page },
            { id: 'members', label: t.members, icon: UsersIcon, page: 'members' as Page },
            { id: 'rewards', label: t.rewards, icon: GiftIcon, page: 'rewards' as Page },
        ];
        
        const handleNavClick = (page: Page) => {
            setPage(page);
            setIsSidebarOpen(false);
        };

        const SidebarContent = () => (
            <>
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-bold text-brand-accent">LuxeClub</div>
                     <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500 dark:text-gray-400">
                        <XIcon className="w-6 h-6"/>
                    </button>
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

        return (
            <div className={`min-h-screen flex text-gray-800 dark:text-white ${language === 'my' ? 'font-padauk' : 'font-sans'}`}>
                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && <div className="fixed inset-0 bg-black opacity-50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
                
                {/* Sidebar */}
                <aside className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-brand-secondary z-30 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                   <SidebarContent />
                </aside>

                <main className="flex-1 flex flex-col bg-gray-100 dark:bg-brand-dark">
                    <header className="bg-white dark:bg-brand-secondary p-4 flex justify-between md:justify-end items-center space-x-4 border-b border-gray-200 dark:border-gray-700">
                        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-500 dark:text-gray-400">
                           <MenuAlt2Icon className="w-6 h-6" />
                        </button>
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <ThemeToggle theme={theme} setTheme={setTheme} />
                            <LanguageToggle language={language} setLanguage={setLanguage} />
                        </div>
                    </header>
                    <div className="flex-1 overflow-y-auto">{children}</div>
                </main>
            </div>
        );
    };
    
    const MemberLayout: React.FC<{children: React.ReactNode}> = ({children}) => {
        return (
            <div className={`min-h-screen bg-gray-100 dark:bg-brand-dark text-gray-800 dark:text-white ${language === 'my' ? 'font-padauk' : 'font-sans'}`}>
                 <header className="bg-white dark:bg-brand-secondary p-4 flex justify-between items-center sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
                    <div className="text-xl font-bold text-brand-accent">LuxeClub</div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                       <ThemeToggle theme={theme} setTheme={setTheme} />
                       <LanguageToggle language={language} setLanguage={setLanguage} />
                    </div>
                </header>
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
                default:
                    currentPageComponent = <AdminDashboard language={language} theme={theme} />;
            }
            return <AdminLayout>{currentPageComponent}</AdminLayout>;
        }

        if (userRole === 'member' && page === 'member-view') {
            return (
                <MemberLayout>
                    <MemberView memberId="MEM002" onLogout={handleLogout} language={language} />
                </MemberLayout>
            );
        }

        // Fallback to login if state is inconsistent
        return <LoginPage onLogin={handleLogin} language={language} setLanguage={setLanguage} theme={theme} setTheme={setTheme} />;
    };

    return <>{renderPage()}</>;
};

export default App;