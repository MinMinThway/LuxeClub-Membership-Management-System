import React from 'react';
import { Language } from '../../types';
import { translations } from '../../constants';

interface LanguageToggleProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ language, setLanguage }) => {
  const t = translations[language];

  return (
    <div className="flex items-center bg-gray-200 dark:bg-brand-light rounded-full p-1">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-200 ${
          language === 'en' ? 'bg-brand-accent text-brand-dark' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        {t.english}
      </button>
      <button
        onClick={() => setLanguage('my')}
        className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-200 ${
          language === 'my' ? 'bg-brand-accent text-brand-dark' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        {t.myanmar}
      </button>
    </div>
  );
};

export default LanguageToggle;