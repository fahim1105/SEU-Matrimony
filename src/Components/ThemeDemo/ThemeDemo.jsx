import { useTheme } from '../../Context/ThemeContext';
import ThemeToggle from '../ThemeToggle/ThemeToggle';

const ThemeDemo = () => {
    const { theme, isLight, isDark } = useTheme();

    return (
        <div className="p-6 bg-base-200 rounded-3xl shadow-lg">
            <h3 className="text-xl font-bold text-neutral mb-4">Theme Demo</h3>
            
            <div className="grid gap-4">
                <div className="stats shadow">
                    <div className="stat">
                        <div className="stat-title">Current Theme</div>
                        <div className="stat-value text-primary">{theme}</div>
                        <div className="stat-desc">
                            {isLight ? '☀️ Light Mode Active' : '🌙 Dark Mode Active'}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="btn btn-primary">Primary Button</div>
                    <div className="btn btn-secondary">Secondary Button</div>
                    <div className="btn btn-accent">Accent Button</div>
                </div>

                <div className="alert alert-info">
                    <span>This is an info alert in {theme} theme!</span>
                </div>

                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Theme Card</h2>
                        <p>This card adapts to the current theme automatically.</p>
                        <div className="card-actions justify-end">
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemeDemo;