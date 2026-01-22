import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../Context/ThemeContext';

const ThemeToggle = ({ 
    variant = 'button', // 'button', 'icon', 'dropdown'
    className = '',
    showLabel = true 
}) => {
    const { theme, toggleTheme, setLightTheme, setDarkTheme, isLight, isDark } = useTheme();

    if (variant === 'dropdown') {
        return (
            <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className={`btn btn-ghost btn-circle ${className}`}>
                    {isLight ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-2xl bg-base-100 rounded-2xl w-48 mt-4 border border-base-200">
                    <li>
                        <button 
                            onClick={setLightTheme}
                            className={`flex items-center gap-3 ${theme === 'light' ? 'active' : ''}`}
                        >
                            <Sun className="w-4 h-4" />
                            <span>Light Mode</span>
                        </button>
                    </li>
                    <li>
                        <button 
                            onClick={setDarkTheme}
                            className={`flex items-center gap-3 ${theme === 'dark' ? 'active' : ''}`}
                        >
                            <Moon className="w-4 h-4" />
                            <span>Dark Mode</span>
                        </button>
                    </li>
                </ul>
            </div>
        );
    }

    if (variant === 'icon') {
        return (
            <button
                onClick={toggleTheme}
                className={`btn btn-ghost btn-circle ${className}`}
                title={`Switch to ${isLight ? 'dark' : 'light'} mode`}
            >
                {isLight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className={`btn btn-ghost gap-2 ${className}`}
            title={`Switch to ${isLight ? 'dark' : 'light'} mode`}
        >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            {showLabel && (
                <span className="hidden sm:inline">
                    {isLight ? 'Dark' : 'Light'}
                </span>
            )}
        </button>
    );
};

export default ThemeToggle;