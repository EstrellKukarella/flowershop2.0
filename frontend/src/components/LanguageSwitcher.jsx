import { useLanguage } from '../context/LanguageContext';

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'ru' ? 'kk' : 'ru');
    };

    return (
        <button
            onClick={toggleLanguage}
            className="text-xs font-medium bg-gray-100 px-2 py-1 rounded-md uppercase text-gray-600"
        >
            {language}
        </button>
    );
}
