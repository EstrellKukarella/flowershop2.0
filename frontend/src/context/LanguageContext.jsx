import { createContext, useContext, useState, useEffect } from 'react';
import ru from '../locales/ru.json';
import kk from '../locales/kk.json';

const translations = { ru, kk };

const LanguageContext = createContext({
    language: 'ru',
    setLanguage: () => { },
    t: () => { },
});

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('language') || 'ru';
    });

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const t = (key) => {
        return translations[language][key] || key;
    };

    const value = {
        language,
        setLanguage,
        t,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
