import React, { useState } from 'react';
import { Language } from '../../types';
import LanguageToggle from '../common/LanguageToggle';
import ThemeToggle from '../common/ThemeToggle';
import { translations } from '../../constants';

type Theme = 'light' | 'dark';

interface LoginPageProps {
  onLogin: (role: 'admin' | 'member') => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, language, setLanguage, theme, setTheme }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const t = translations[language];
  
  const handleLogin = (e: React.FormEvent, role: 'admin' | 'member') => {
      e.preventDefault();
      // In a real app, you'd validate credentials
      onLogin(role);
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-brand-dark flex flex-col items-center justify-center p-4 transition-colors duration-300" style={{ fontFamily: language === 'my' ? 'Padauk, sans-serif' : 'Inter, sans-serif' }}>
       <div className="absolute top-4 right-4 flex items-center space-x-4">
            <ThemeToggle theme={theme} setTheme={setTheme} />
            <LanguageToggle language={language} setLanguage={setLanguage} />
       </div>
      <div className="w-full max-w-md mx-auto bg-white dark:bg-brand-secondary shadow-2xl rounded-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-accent">{t.welcome}</h1>
          <p className="text-gray-500 dark:text-gray-300 mt-2">{t.loginPrompt}</p>
        </div>
        <form className="space-y-6">
          <div>
            <label className="text-sm font-bold text-gray-600 dark:text-gray-400 block mb-2" htmlFor="email">
              {t.phoneEmail}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-200 dark:bg-brand-light text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-600 dark:text-gray-400 block mb-2" htmlFor="password">
              {t.password}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-200 dark:bg-brand-light text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
              placeholder="••••••••"
            />
          </div>
          <div className="flex flex-col space-y-4 pt-4">
            <button
              onClick={(e) => handleLogin(e, 'admin')}
              className="w-full bg-brand-accent text-brand-dark font-bold py-3 rounded-lg hover:bg-yellow-500 transition duration-300"
            >
              {t.login} (Admin)
            </button>
            <button
               onClick={(e) => handleLogin(e, 'member')}
              className="w-full bg-gray-500 dark:bg-gray-600 text-white font-bold py-3 rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 transition duration-300"
            >
              {t.login} (Member)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;