import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, Globe } from 'lucide-react';

const LanguageToggle = ({ className = "" }) => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
        { code: 'en', name: 'English', flag: '🇺🇸' }
    ];

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    const changeLanguage = (langCode) => {
        i18n.changeLanguage(langCode);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`}>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-base-200/80 hover:bg-base-300 border border-base-300/50 transition-all duration-200 hover:shadow-lg min-w-0 flex-shrink-0"
                title="Change Language"
            >
                <Globe className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="text-xs font-medium text-neutral whitespace-nowrap hidden sm:inline">
                    {currentLanguage.flag}
                </span>
                <span className="text-xs font-medium text-neutral whitespace-nowrap hidden md:inline">
                    {currentLanguage.name}
                </span>
                <svg 
                    className={`w-3 h-3 text-neutral transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Menu */}
                    <div className="absolute top-full right-0 mt-2 w-40 sm:w-48 bg-base-100 border border-base-300/50 rounded-2xl shadow-xl z-20 overflow-hidden backdrop-blur-sm">
                        <div className="p-2">
                            <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral/60 uppercase tracking-wider">
                                <Languages className="w-3 h-3 flex-shrink-0" />
                                <span className="whitespace-nowrap">Select Language</span>
                            </div>
                            
                            {languages.map((language) => (
                                <button
                                    key={language.code}
                                    onClick={() => changeLanguage(language.code)}
                                    className={`w-full flex items-center gap-2 sm:gap-3 px-3 py-2.5 sm:py-3 rounded-xl text-left transition-all duration-200 ${
                                        i18n.language === language.code
                                            ? 'bg-primary/10 text-primary border border-primary/20'
                                            : 'hover:bg-base-200 text-neutral'
                                    }`}
                                >
                                    <span className="text-base sm:text-lg flex-shrink-0">{language.flag}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm whitespace-nowrap">{language.name}</div>
                                        <div className="text-xs opacity-60 whitespace-nowrap">{language.code.toUpperCase()}</div>
                                    </div>
                                    {i18n.language === language.code && (
                                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LanguageToggle;