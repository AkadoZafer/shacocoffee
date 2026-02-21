import { Link, useLocation } from 'react-router-dom';
import { Home, Coffee, CreditCard, ShoppingCart, User, QrCode, Shield, ClipboardList } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const location = useLocation();
    const { theme } = useTheme();
    const { user, isStaff, isBarista, isAdmin } = useAuth();
    const isActive = (path) => location.pathname === path;

    // Staff navbar: Ana Sayfa, Yönetici Panel, Profil
    if (isStaff) {
        return (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-6">
                <nav className={`backdrop-blur-xl border rounded-2xl shadow-2xl flex items-center justify-between p-2 px-3 relative ${theme === 'dark'
                    ? 'bg-zinc-900/95 border-zinc-800'
                    : 'bg-white/95 border-zinc-200'
                    }`}>
                    <NavLink to="/" icon={<Home size={20} />} label="Ana Sayfa" active={isActive('/')} theme={theme} />

                    {/* Center Highlight Button - Admin Panel */}
                    <Link to="/admin" className="relative -mt-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${isActive('/admin')
                            ? 'bg-shaco-red text-white shadow-red-500/30'
                            : 'bg-shaco-red text-white hover:shadow-red-500/40 hover:scale-105'
                            }`}>
                            <Shield size={22} />
                        </div>
                    </Link>

                    <NavLink to="/settings" icon={<User size={20} />} label="Profil" active={isActive('/settings')} theme={theme} />
                </nav>
            </div>
        );
    }

    // Customer / Guest navbar: Ana Sayfa, Menü, QR/Ödeme, Profil
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-6">
            <nav className={`backdrop-blur-xl border rounded-2xl shadow-2xl flex items-center justify-between p-2 px-6 relative ${theme === 'dark'
                ? 'bg-zinc-900/95 border-zinc-800'
                : 'bg-white/95 border-zinc-200'
                }`}>
                <NavLink to="/" icon={<Home size={24} />} label="Ana Sayfa" active={isActive('/')} theme={theme} />
                <NavLink to="/menu" icon={<Coffee size={24} />} label="Menü" active={isActive('/menu')} theme={theme} />

                {/* Center Highlight Button - QR Öde */}
                <Link to="/pay" className="relative -mt-6 mx-2">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${isActive('/pay')
                        ? 'bg-shaco-red text-white shadow-red-500/40 scale-105'
                        : 'bg-shaco-red text-white hover:shadow-red-500/50 hover:scale-110'
                        }`}>
                        <QrCode size={28} />
                    </div>
                </Link>

                <NavLink to="/settings" icon={<User size={24} />} label="Hesabım" active={isActive('/settings')} theme={theme} />
            </nav>
        </div>
    );
}

function NavLink({ to, icon, label, active, theme }) {
    return (
        <Link
            to={to}
            className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all duration-300 ${active
                ? 'text-shaco-red'
                : theme === 'dark'
                    ? 'text-zinc-500 hover:text-white'
                    : 'text-zinc-400 hover:text-zinc-900'
                }`}
        >
            <div className={`relative ${active ? 'drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]' : ''}`}>
                {icon}
            </div>
            <span className={`text-[15px] font-bold tracking-wider ${active ? 'text-shaco-red' : ''}`}>
                {label}
            </span>
        </Link>
    );
}
